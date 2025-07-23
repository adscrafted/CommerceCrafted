// Niche Processing Queue System
// Handles background processing of niches with multiple ASINs

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { createReviewScraper } from '@/lib/services/review-scraper'
import { openaiAnalysis } from '@/lib/integrations/openai'
import { getBaseUrl } from '@/lib/utils/get-base-url'

export interface NicheProcessingJob {
  nicheId: string
  nicheName: string
  asins: string[]
  marketplace: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: {
    current: number
    total: number
    currentAsin?: string
    completedAsins: string[]
    failedAsins: string[]
  }
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export class NicheProcessor {
  private processingJobs: Map<string, NicheProcessingJob> = new Map()
  
  /**
   * Start processing a niche with multiple ASINs
   */
  async processNiche(nicheId: string, nicheName: string, asins: string[], marketplace: string = 'US') {
    const job: NicheProcessingJob = {
      nicheId,
      nicheName,
      asins,
      marketplace,
      status: 'pending',
      progress: {
        current: 0,
        total: asins.length,
        completedAsins: [],
        failedAsins: []
      }
    }

    this.processingJobs.set(nicheId, job)
    
    // Start processing
    this.executeProcessing(job)
    
    return job
  }

  /**
   * Execute the actual processing
   */
  private async executeProcessing(job: NicheProcessingJob) {
    const supabase = createServiceSupabaseClient()
    
    try {
      job.status = 'processing'
      job.startedAt = new Date()
      
      // Update niche status
      await supabase
        .from('niches')
        .update({ 
          status: 'processing',
          process_started_at: job.startedAt.toISOString()
        })
        .eq('id', job.nicheId)

      // Process each ASIN
      console.log(`🚀 Starting processing for ${job.asins.length} ASINs`)
      
      for (const asin of job.asins) {
        try {
          job.progress.currentAsin = asin
          console.log(`
📦 Processing ASIN ${job.progress.current + 1}/${job.progress.total}: ${asin}`)
          
          // Call comprehensive sync for each ASIN with job context
          const syncResult = await this.syncAsinData(asin, job)
          
          if (syncResult.success) {
            job.progress.completedAsins.push(asin)
            console.log(`✅ Successfully processed ${asin}`)
          } else {
            job.progress.failedAsins.push(asin)
            console.error(`❌ Failed to process ${asin}: ${syncResult.error}`)
          }
          
          job.progress.current++
          
          // Update progress in database
          await this.updateProgress(job)
          
          // Rate limiting - wait between ASINs
          console.log(`⏸️ Rate limiting: waiting 5 seconds before next ASIN...`)
          await new Promise(resolve => setTimeout(resolve, 5000))
          
        } catch (error) {
          console.error(`🚨 Error processing ASIN ${asin}:`, error)
          job.progress.failedAsins.push(asin)
        }
      }

      // Collect keywords for all ASINs in batch (JungleAce style)
      await this.collectKeywordsForAllAsins(job)
      
      // Fetch reviews for all ASINs in niche (first 100 per product)
      await this.fetchReviewsForNiche(job)
      
      // Calculate niche-level analytics
      await this.calculateNicheAnalytics(job.nicheId)
      
      // Validate processing results
      const successCount = job.progress.completedAsins.length
      const failedCount = job.progress.failedAsins.length
      const totalExpected = job.asins.length
      
      console.log(`
📦 Processing Summary:`, {
        expected: totalExpected,
        succeeded: successCount,
        failed: failedCount,
        successRate: `${Math.round((successCount / totalExpected) * 100)}%`
      })
      
      // Only mark as completed if we actually processed some products
      if (successCount === 0) {
        job.status = 'failed'
        job.error = 'No products were successfully processed'
        console.error('❌ Processing failed: No products were successfully processed')
        
        await supabase
          .from('niches')
          .update({ 
            status: 'failed',
            error_message: job.error,
            process_completed_at: new Date().toISOString(),
            total_products: 0,
            failed_products: failedCount
          })
          .eq('id', job.nicheId)
      } else {
        // Mark as completed only if we have successful products
        job.status = 'completed'
        job.completedAt = new Date()
        
        await supabase
          .from('niches')
          .update({ 
            status: 'completed',
            process_completed_at: job.completedAt.toISOString(),
            total_products: successCount,
            failed_products: failedCount
          })
          .eq('id', job.nicheId)
          
        console.log(`✅ Processing completed successfully with ${successCount} products`)
      }

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      
      await supabase
        .from('niches')
        .update({ 
          status: 'failed',
          error_message: job.error
        })
        .eq('id', job.nicheId)
    }
  }

  /**
   * Sync all data for a single ASIN using Keepa and Amazon Ads API
   */
  private async syncAsinData(asin: string, job: NicheProcessingJob) {
    try {
      console.log(`🔍 Starting comprehensive data sync for ${asin}...`)
      
      // Fetch data from Keepa
      console.log(`  📊 Step 1: Fetching Keepa product data...`)
      // Get the base URL dynamically
      const baseUrl = getBaseUrl()
      console.log(`  📡 API URL: ${baseUrl}/api/amazon/keepa`)
      const keepaResponse = await fetch(`${baseUrl}/api/amazon/keepa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin })
      })
      
      if (!keepaResponse.ok) {
        const errorText = await keepaResponse.text()
        console.error(`  ❌ Keepa API error: ${keepaResponse.status} - ${errorText}`)
        throw new Error(`Keepa fetch failed: ${keepaResponse.status} ${keepaResponse.statusText}`)
      }
      
      const keepaResult = await keepaResponse.json()
      console.log(`  📦 Keepa data received:`, {
        hasData: !!keepaResult,
        title: keepaResult.title?.substring(0, 50) + '...' || 'No title',
        price: keepaResult.currentPrice || 'No price',
        bsr: keepaResult.salesRank || 'No BSR'
      })
      
      // Store the product data in database
      console.log(`  💾 Storing product data for ${asin}...`)
      const supabase = createServiceSupabaseClient()
      
      // Sanitize data before storing
      const price = keepaResult.currentPrice || 0
      const sanitizedPrice = price < 0 ? 0 : price // Convert negative prices to 0
      
      // Calculate first seen date if we have product age info
      let firstSeenDate = null
      let productAgeMonths = null
      let productAgeCategory = null
      
      if (keepaResult.productAge) {
        // Convert months to date
        const monthsAgo = keepaResult.productAge.months || 0
        firstSeenDate = new Date()
        firstSeenDate.setMonth(firstSeenDate.getMonth() - monthsAgo)
        
        productAgeMonths = Math.round(monthsAgo)
        productAgeCategory = keepaResult.productAge.category
      } else if (keepaResult.firstSeenTimestamp) {
        // Use timestamp if available
        firstSeenDate = new Date(keepaResult.firstSeenTimestamp)
        const now = new Date()
        const monthsDiff = (now.getTime() - firstSeenDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        productAgeMonths = Math.round(monthsDiff)
        
        // Determine category
        if (monthsDiff < 6) productAgeCategory = '0-6 months'
        else if (monthsDiff < 12) productAgeCategory = '6-12 months'
        else if (monthsDiff < 24) productAgeCategory = '1-2 years'
        else if (monthsDiff < 36) productAgeCategory = '2-3 years'
        else productAgeCategory = '3+ years'
      }

      const productData = {
        id: asin,
        asin: asin,
        title: keepaResult.title || 'Unknown Product',
        brand: keepaResult.brand || '',
        price: sanitizedPrice,
        rating: keepaResult.rating || 0,
        review_count: keepaResult.reviewCount || 0,
        bsr: keepaResult.salesRank || 0,
        category: keepaResult.rootCategory || '',
        image_urls: keepaResult.images ? keepaResult.images.join(',') : '', // Store all images as comma-separated
        bullet_points: JSON.stringify(keepaResult.features || []), // Changed from features
        parent_asin: keepaResult.parentAsin || '',
        monthly_orders: keepaResult.monthlySalesEstimate || 0, // Changed from monthly_sales_estimate
        fba_fees: JSON.stringify({ total: keepaResult.fbaFees || 0 }), // Changed to JSON string
        status: 'ACTIVE' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Store product age in dedicated columns
        first_seen_date: firstSeenDate ? firstSeenDate.toISOString() : null,
        product_age_months: productAgeMonths,
        product_age_category: productAgeCategory,
        // Store all Keepa data including product age
        keepa_data: JSON.stringify({
          ...keepaResult,
          productAge: keepaResult.productAge,
          firstSeenTimestamp: keepaResult.firstSeenTimestamp
        }),
        // Store additional Keepa fields
        length: keepaResult.packageDimensions?.length || null,
        width: keepaResult.packageDimensions?.width || null,
        height: keepaResult.packageDimensions?.height || null,
        weight: keepaResult.itemWeight || null,
        a_plus_content: JSON.stringify(keepaResult.aplus || {}),
        video_urls: JSON.stringify(keepaResult.videos || [])
      }
      
      console.log(`  💾 Product data prepared:`, {
        asin: productData.asin,
        title: productData.title.substring(0, 50) + '...',
        price: productData.price,
        bsr: productData.bsr
      })
      
      const { data: storedProduct, error: productError } = await supabase
        .from('products')
        .upsert(productData)
        .select()
        .single()
      
      if (productError) {
        console.error(`  ❌ Failed to store product data:`, {
          error: productError.message,
          code: productError.code,
          details: productError.details,
          hint: productError.hint
        })
        // Don't throw here - log and continue
        console.warn(`  ⚠️ Continuing despite database error for ${asin}`)
      } else {
        console.log(`  ✅ Product stored with ID: ${storedProduct?.id}`)
      }
      
      // Call OpenAI analysis if available
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/openai/analyze/${asin}`, {
          method: 'POST'
        }).catch(error => {
          console.warn('OpenAI analysis failed for ASIN:', asin, error)
        })
      } catch (openaiError) {
        console.warn(`  ⚠️ OpenAI analysis failed for ${asin}:`, openaiError instanceof Error ? openaiError.message : openaiError)
      }
      
      return { 
        success: true, 
        productId: asin,
        source: 'keepa' 
      }
    } catch (error) {
      console.error('Sync failed for ASIN:', asin, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Update processing progress in database
   */
  private async updateProgress(job: NicheProcessingJob) {
    const supabase = createServiceSupabaseClient()
    
    const progressData = {
      current: job.progress.current,
      total: job.progress.total,
      percentage: Math.round((job.progress.current / job.progress.total) * 100),
      currentAsin: job.progress.currentAsin,
      completedAsins: job.progress.completedAsins,
      failedAsins: job.progress.failedAsins,
      currentStep: this.getCurrentStep(job),
      apiCallsMade: job.progress.current * 3, // Estimate based on calls per ASIN
      errors: job.progress.failedAsins.map(asin => `Failed to process ${asin}`),
      lastUpdate: new Date().toISOString()
    }
    
    console.log(`🔄 Updating progress for niche ${job.nicheId}:`, {
      percentage: progressData.percentage,
      currentAsin: progressData.currentAsin,
      completed: progressData.completedAsins.length,
      failed: progressData.failedAsins.length
    })
    
    await supabase
      .from('niches')
      .update({
        processing_progress: progressData,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.nicheId)
  }
  
  /**
   * Calculate real metrics from reviews for accurate AI analysis
   */
  private calculateReviewMetrics(reviews: any[]) {
    console.log(`📊 Calculating keyword and phrase analysis from ${reviews.length} reviews`)
    
    // Word and phrase frequency analysis
    const wordFrequency: Record<string, number> = {}
    const phraseFrequency: Record<string, number> = {}
    
    // Rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    // Common words to exclude
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
      'with', 'by', 'from', 'is', 'it', 'this', 'that', 'was', 'are', 'were', 'been', 'have', 'has', 
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 
      'shall', 'can', 'be', 'am', 'so', 'if', 'then', 'than', 'when', 'where', 'what', 'which', 
      'who', 'whom', 'whose', 'why', 'how', 'not', 'no', 'nor', 'as', 'just', 'i', 'me', 'my', 
      'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their'])
    
    // Analyze each review
    reviews.forEach(review => {
      // Count ratings
      ratingCounts[review.rating as 1|2|3|4|5]++
      
      // Clean and tokenize text
      const text = review.reviewText.toLowerCase()
      const words = text.match(/\b[a-z]+\b/g) || []
      
      // Single word frequency (exclude common words and short words)
      words.forEach(word => {
        if (word.length > 3 && !commonWords.has(word)) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1
        }
      })
      
      // Extract 2-3 word phrases
      for (let i = 0; i < words.length - 1; i++) {
        // Two-word phrases
        if (i < words.length - 1) {
          const word1 = words[i]
          const word2 = words[i + 1]
          if (!commonWords.has(word1) || !commonWords.has(word2)) {
            const twoWord = `${word1} ${word2}`
            phraseFrequency[twoWord] = (phraseFrequency[twoWord] || 0) + 1
          }
        }
        
        // Three-word phrases
        if (i < words.length - 2) {
          const word1 = words[i]
          const word2 = words[i + 1]
          const word3 = words[i + 2]
          if (!commonWords.has(word1) || !commonWords.has(word2) || !commonWords.has(word3)) {
            const threeWord = `${word1} ${word2} ${word3}`
            phraseFrequency[threeWord] = (phraseFrequency[threeWord] || 0) + 1
          }
        }
      }
    })
    
    // Sort and get top keywords and phrases
    const totalReviews = reviews.length
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }))
    
    const topPhrases = Object.entries(phraseFrequency)
      .filter(([_, count]) => count > 2) // Only phrases that appear 3+ times
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([phrase, count]) => ({ phrase, count }))
    
    // Group reviews by rating for sentiment analysis
    const reviewsByRating: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
    reviews.forEach(review => {
      reviewsByRating[review.rating].push(review.reviewText)
    })
    
    return {
      totalReviews,
      ratingDistribution: Object.entries(ratingCounts).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: (count / totalReviews * 100).toFixed(1)
      })),
      topWords,
      topPhrases,
      reviewsByRating,
      verifiedPurchaseRate: (reviews.filter(r => r.verifiedPurchase).length / totalReviews * 100).toFixed(1),
      averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    }
  }

  /**
   * Get current processing step description
   */
  private getCurrentStep(job: NicheProcessingJob): string {
    if (job.progress.current === 0) {
      return 'Starting product data collection'
    }
    if (job.progress.currentAsin) {
      return `Fetching data for ASIN: ${job.progress.currentAsin}`
    }
    if (job.progress.current >= job.progress.total) {
      return 'Calculating niche analytics'
    }
    return `Processing ${job.progress.current} of ${job.progress.total} products`
  }

  /**
   * Calculate aggregated analytics for the niche
   */
  private async calculateNicheAnalytics(nicheId: string) {
    const supabase = createServiceSupabaseClient()
    
    console.log(`
📈 Calculating niche analytics for ${nicheId}...`)
    
    // Get niche ASINs
    const nicheAsins = await this.getNicheAsins(nicheId)
    console.log(`  📦 Found ${nicheAsins.length} ASINs in niche:`, nicheAsins)
    
    // Get all products in the niche (products are stored with id = asin)
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_analyses (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          financial_analysis
        )
      `)
      .in('id', nicheAsins) // Changed from 'asin' to 'id' since we store ASIN as id

    if (error) {
      console.error(`  ❌ Error fetching products:`, error)
      return
    }
    
    if (!products || products.length === 0) {
      console.warn(`  ⚠️ No products found for ASINs:`, nicheAsins)
      return
    }
    
    console.log(`  📦 Found ${products.length} products in database`)

    // Get all keywords for products in this niche
    const productIds = products.map(p => p.id)
    console.log(`  🔍 Fetching keywords for products:`, productIds)
    
    const { data: keywords, error: keywordError } = await supabase
      .from('product_keywords')
      .select('keyword, product_id')
      .in('product_id', nicheAsins) // Use ASINs as product IDs
    
    if (keywordError) {
      console.error(`  ❌ Error fetching keywords:`, keywordError)
    }
    
    console.log(`  🔑 Found ${keywords?.length || 0} keywords`)

    // Get review count from customer_reviews table
    console.log(`  📝 Fetching review count for products...`)
    const { count: reviewCount } = await supabase
      .from('customer_reviews')
      .select('*', { count: 'exact', head: true })
      .in('product_id', nicheAsins)
    
    console.log(`  💬 Found ${reviewCount || 0} customer reviews`)

    // Calculate aggregate metrics
    const totalProducts = products.length
    let totalRevenue = 0
    let avgOpportunityScore = 0
    let avgCompetitionScore = 0
    let avgPrice = 0
    let avgBsr = 0
    let totalReviews = reviewCount || 0  // Use actual review count from customer_reviews table
    const allKeywords = new Set<string>()

    products.forEach(product => {
      const analysis = product.product_analyses?.[0]
      if (analysis) {
        avgOpportunityScore += analysis.opportunity_score || 0
        avgCompetitionScore += analysis.competition_score || 0
        
        const monthlyRevenue = analysis.financial_analysis?.monthlyProjections?.revenue || 0
        totalRevenue += monthlyRevenue
      }
      
      avgPrice += product.price || 0
      avgBsr += product.bsr || 0
      // Don't add product.review_count as it's not accurate
    })

    // Collect unique keywords from product_keywords table
    if (keywords) {
      keywords.forEach(kw => {
        if (kw.keyword) {
          allKeywords.add(kw.keyword)
        }
      })
    }

    // Calculate averages
    avgOpportunityScore = totalProducts > 0 ? avgOpportunityScore / totalProducts : 0
    avgCompetitionScore = totalProducts > 0 ? avgCompetitionScore / totalProducts : 0
    avgPrice = totalProducts > 0 ? avgPrice / totalProducts : 0
    avgBsr = totalProducts > 0 ? avgBsr / totalProducts : 0

    // Update niche with calculated analytics
    const updateData = {
      avg_opportunity_score: avgOpportunityScore,
      avg_competition_score: avgCompetitionScore,
      avg_price: avgPrice,
      avg_bsr: avgBsr,
      total_reviews: totalReviews,
      total_monthly_revenue: totalRevenue,
      total_keywords: allKeywords.size,
      niche_keywords: Array.from(allKeywords).slice(0, 50).join(','),
      market_size: totalRevenue * 12, // Annual projection
      competition_level: this.calculateCompetitionLevel(avgCompetitionScore),
      updated_at: new Date().toISOString()
    }
    
    console.log(`  📦 Updating niche with analytics:`, {
      products: totalProducts,
      keywords: allKeywords.size,
      avgPrice: avgPrice.toFixed(2),
      avgBsr: Math.round(avgBsr),
      totalReviews
    })
    
    const { error: updateError } = await supabase
      .from('niches')
      .update(updateData)
      .eq('id', nicheId)
    
    if (updateError) {
      console.error(`  ❌ Failed to update niche analytics:`, updateError)
    } else {
      console.log(`  ✅ Niche analytics updated successfully`)
    }
  }

  /**
   * Get ASINs for a niche
   */
  private async getNicheAsins(nicheId: string): Promise<string[]> {
    const supabase = createServiceSupabaseClient()
    
    const { data: niche } = await supabase
      .from('niches')
      .select('asins')
      .eq('id', nicheId)
      .single()
    
    return niche?.asins?.split(',').map((a: string) => a.trim()) || []
  }

  /**
   * Calculate competition level
   */
  private calculateCompetitionLevel(avgCompetitionScore: number): string {
    if (avgCompetitionScore >= 80) return 'LOW'
    if (avgCompetitionScore >= 60) return 'MEDIUM'
    if (avgCompetitionScore >= 40) return 'HIGH'
    return 'VERY_HIGH'
  }

  /**
   * Collect keywords for all ASINs in batch (JungleAce-style)
   */
  private async collectKeywordsForAllAsins(job: NicheProcessingJob) {
    // Get the base URL dynamically
    const baseUrl = getBaseUrl()
    const supabase = createServiceSupabaseClient()
    
    console.log(`\n🔄 JUNGLEACE-STYLE KEYWORD COLLECTION: Processing ${job.asins.length} ASINs`)
    
    try {
      // JungleAce-style: Process in batches of 8 ASINs max
      const batchSize = 8
      const batches = []
      
      for (let i = 0; i < job.asins.length; i += batchSize) {
        batches.push(job.asins.slice(i, i + batchSize))
      }
      
      console.log(`📦 Created ${batches.length} batches for keyword collection`)
      
      let allKeywords = []
      let totalStoredCount = 0
      
      // Process each batch sequentially (JungleAce pattern)
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        console.log(`🔄 Processing keyword batch ${batchIndex + 1}/${batches.length} (${batch.length} ASINs)`)
        
        try {
          // Call keywords API with timeout protection
          const keywordUrl = `${baseUrl}/api/amazon/ads-api/keywords`
          console.log(`📡 Calling keywords API for batch: ${batch.join(', ')}`)
          
          const adsResponse = await Promise.race([
            fetch(keywordUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                asins: batch, // Send batch of ASINs
                marketplace: 'US' 
              })
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Keywords API timeout')), 60000)
            )
          ])
          
          console.log(`📡 Keywords API response status: ${adsResponse.status}`)
          
          if (adsResponse.ok) {
            const adsResult = await adsResponse.json()
            const keywords = adsResult.keywords || []
            
            console.log(`🔑 Collected ${keywords.length} keywords for batch ${batchIndex + 1}`)
            console.log(`📊 API Response summary:`, {
              success: adsResult.success,
              keywordCount: keywords.length,
              summary: adsResult.summary
            })
            
            if (keywords.length > 0) {
              allKeywords.push(...keywords)
              
              // Store keywords in database immediately
              console.log(`💾 Storing ${keywords.length} keywords from batch ${batchIndex + 1}...`)
              
              // Store keywords with proper data structure for product_keywords table
              const keywordsToStore = keywords.map((kw: any) => ({
                product_id: kw.asin, // Use the ASIN from the keyword
                keyword: kw.keyword || kw.query || '', // Handle different response formats
                match_type: kw.matchType || 'BROAD',
                suggested_bid: kw.suggestedBid || kw.bidSuggestion || 0,
                estimated_clicks: kw.estimatedClicks || 0,
                estimated_orders: kw.estimatedOrders || 0,
                created_at: new Date().toISOString()
              }))
              
              // Insert keywords in batches for performance
              const dbBatchSize = 100
              let batchStoredCount = 0
              
              for (let i = 0; i < keywordsToStore.length; i += dbBatchSize) {
                const dbBatch = keywordsToStore.slice(i, i + dbBatchSize)
                const { error: keywordError } = await supabase
                  .from('product_keywords')
                  .upsert(dbBatch, {
                    ignoreDuplicates: true
                  })
                
                if (!keywordError) {
                  batchStoredCount += dbBatch.length
                } else {
                  console.error(`❌ Failed to store keyword batch: ${keywordError.message}`)
                }
              }
              
              totalStoredCount += batchStoredCount
              console.log(`✅ Stored ${batchStoredCount} keywords from batch ${batchIndex + 1}`)
              
              // Log keywords per ASIN for this batch
              const keywordsByAsin = keywords.reduce((acc, kw) => {
                const asin = kw.asin
                if (!acc[asin]) acc[asin] = 0
                acc[asin]++
                return acc
              }, {})
              
              console.log(`📊 Keywords per ASIN in batch ${batchIndex + 1}:`)
              Object.entries(keywordsByAsin).forEach(([asin, count]) => {
                console.log(`  ${asin}: ${count} keywords`)
              })
            }
          } else {
            const errorText = await adsResponse.text()
            console.error(`❌ Keywords API failed for batch ${batchIndex + 1}:`, {
              status: adsResponse.status,
              statusText: adsResponse.statusText,
              error: errorText.substring(0, 200)
            })
          }
          
        } catch (batchError) {
          console.error(`❌ Batch ${batchIndex + 1} failed:`, batchError instanceof Error ? batchError.message : 'Unknown error')
        }
        
        // JungleAce-style: Delay between batches for API rate limiting
        if (batchIndex < batches.length - 1) {
          console.log(`⏸️ Waiting 2 seconds before next batch...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      
      console.log(`✅ JungleAce-style keyword collection completed:`)
      console.log(`  📊 Total keywords collected: ${allKeywords.length}`)
      console.log(`  💾 Total keywords stored: ${totalStoredCount}`)
      console.log(`  📦 Batches processed: ${batches.length}`)
      console.log(`  🎯 ASINs processed: ${job.asins.length}`)
      
      // Update niche with total keyword count - get actual count from database
      console.log(`📝 Getting total keyword count from database...`)
      const { count: totalKeywordCount } = await supabase
        .from('product_keywords')
        .select('*', { count: 'exact', head: true })
        .in('product_id', job.asins)
      
      if (totalKeywordCount !== null && totalKeywordCount >= 0) {
        console.log(`📊 Total keywords in database: ${totalKeywordCount}`)
        const { error: updateError } = await supabase
          .from('niches')
          .update({ 
            total_keywords: totalKeywordCount
          })
          .eq('id', job.nicheId)
        
        if (updateError) {
          console.error(`❌ Failed to update niche keyword count:`, updateError)
        } else {
          console.log(`✅ Updated niche total_keywords to ${totalKeywordCount}`)
        }
      }
      
    } catch (error) {
      console.error(`🚨 JungleAce-style keyword collection failed:`, error)
    }
  }

  /**
   * Fetch reviews for all ASINs in the niche (target: 100 total reviews with text)
   */
  private async fetchReviewsForNiche(job: NicheProcessingJob) {
    console.log(`\n🔄 REVIEW FETCHING: Processing ${job.asins.length} ASINs to collect ~100 reviews with text`)
    
    const TARGET_REVIEWS = 100;
    const MAX_REVIEWS_PER_PRODUCT = 50; // Cap per product to ensure diversity
    const supabase = createServiceSupabaseClient();
    
    try {
      // Create review scraper service with service client flag
      const reviewScraper = createReviewScraper(undefined, true) // Use service client for background processing
      let totalReviewsFetched = 0
      let successfulAsins = 0
      const reviewsCollected: any[] = []
      
      // First, get products sorted by review count to prioritize high-review products
      console.log(`📊 Fetching products to prioritize by review count...`)
      const { data: products } = await supabase
        .from('products')
        .select('id, asin, review_count')
        .in('asin', job.asins)
        .order('review_count', { ascending: false })
      
      const sortedAsins = products?.map(p => p.asin) || job.asins
      console.log(`📊 Products sorted by total review count (highest first)`)
      console.log(`   Note: Many reviews might be just ratings without text`)
      
      // Process ASINs in order of review count until we have ~100 text reviews
      for (const asin of sortedAsins) {
        if (totalReviewsFetched >= TARGET_REVIEWS) {
          console.log(`🎯 Target of ${TARGET_REVIEWS} reviews reached!`)
          break
        }
        
        // Calculate how many to try fetching (we don't know how many have text)
        const remainingTarget = TARGET_REVIEWS - totalReviewsFetched
        const reviewsToFetch = Math.min(remainingTarget + 20, MAX_REVIEWS_PER_PRODUCT) // Fetch extra in case some don't have text
        
        try {
          console.log(`📝 Attempting to fetch ${reviewsToFetch} reviews for ASIN: ${asin}`)
          console.log(`   Current progress: ${totalReviewsFetched}/${TARGET_REVIEWS}`)
          
          // Fetch reviews - we'll get as many as possible with text
          const reviewResult = await reviewScraper.scrapeReviews(asin, {
            maxReviews: reviewsToFetch,
            sortBy: 'recent'
          })
          
          if (reviewResult && reviewResult.reviews.length > 0) {
            // Filter to only reviews with actual text content
            const reviewsWithText = reviewResult.reviews.filter(r => 
              r.reviewText && r.reviewText.trim().length > 0
            )
            
            console.log(`✅ Fetched ${reviewResult.reviews.length} reviews (${reviewsWithText.length} with text) for ${asin}`)
            
            if (reviewsWithText.length > 0) {
              // Store only reviews with text
              await reviewScraper.storeReviewsInDatabase(asin, reviewsWithText)
              
              // If we need fewer reviews than we got, trim to avoid going too far over target
              const reviewsToKeep = totalReviewsFetched + reviewsWithText.length > TARGET_REVIEWS + 10
                ? reviewsWithText.slice(0, TARGET_REVIEWS - totalReviewsFetched)
                : reviewsWithText
              
              // Collect reviews for analysis
              reviewsCollected.push({
                asin: asin,
                reviews: reviewsToKeep
              })
              
              totalReviewsFetched += reviewsToKeep.length
              successfulAsins++
              
              console.log(`📊 Progress: ${totalReviewsFetched} text reviews collected`)
            } else {
              console.warn(`⚠️ No reviews with text found for ${asin}`)
            }
          } else {
            console.warn(`⚠️ No reviews found for ${asin}`)
          }
          
          // Rate limiting between ASINs (only if we need more reviews)
          if (totalReviewsFetched < TARGET_REVIEWS) {
            console.log(`⏸️ Waiting 3 seconds before next ASIN...`)
            await new Promise(resolve => setTimeout(resolve, 3000))
          }
          
        } catch (error) {
          console.error(`❌ Failed to fetch reviews for ${asin}:`, error instanceof Error ? error.message : 'Unknown error')
        }
      }
      
      // Generate AI analysis for all collected reviews
      console.log(`🤖 Generating AI analysis for collected reviews...`)
      if (reviewsCollected.length > 0) {
        // Combine all reviews for niche-level analysis
        const allReviews = reviewsCollected.flatMap(item => item.reviews)
        const primaryAsin = reviewsCollected[0].asin // Use the most reviewed product as primary
        
        await this.generateReviewAnalysis(primaryAsin, allReviews, job.nicheId)
      }
      
      console.log(`✅ Review fetching completed:`)
      console.log(`  📊 Total reviews fetched: ${totalReviewsFetched}`)
      console.log(`  🎯 Target was: ${TARGET_REVIEWS}`)
      console.log(`  📦 ASINs processed: ${successfulAsins}`)
      console.log(`  💬 Reviews per ASIN:`)
      reviewsCollected.forEach(item => {
        console.log(`    - ${item.asin}: ${item.reviews.length} reviews`)
      })
      
    } catch (error) {
      console.error(`🚨 Review fetching failed:`, error)
    }
  }

  /**
   * Generate AI analysis for reviews (customer personas, Voice of Customer, emotional triggers)
   */
  private async generateReviewAnalysis(asin: string, reviews: any[], nicheId: string) {
    console.log(`🤖 Generating AI analysis for ${asin} with ${reviews.length} reviews`)
    
    try {
      // Calculate real metrics from reviews
      const reviewMetrics = this.calculateReviewMetrics(reviews)
      
      // Prepare review text for analysis
      const reviewTexts = reviews.map(r => r.reviewText).slice(0, 50) // Use first 50 reviews for analysis
      const reviewData = {
        asin,
        reviews: reviewTexts,
        averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
        totalReviews: reviews.length,
        metrics: reviewMetrics // Add real calculated metrics
      }
      
      // Generate customer personas with real data
      const personas = await this.generateCustomerPersonas(reviewData)
      
      // Generate Voice of Customer insights with real data
      const voiceOfCustomer = await this.generateVoiceOfCustomer(reviewData)
      
      // Generate emotional triggers with real data
      const emotionalTriggers = await this.generateEmotionalTriggers(reviewData)
      
      // Store the analysis in the database
      const supabase = createServiceSupabaseClient()
      const { error } = await supabase
        .from('market_intelligence')
        .upsert({
          product_id: asin,
          niche_id: nicheId,
          customer_personas: personas,
          voice_of_customer: voiceOfCustomer,
          emotional_triggers: emotionalTriggers,
          raw_reviews: reviews.slice(0, 100), // Store first 100 reviews
          total_reviews_analyzed: reviews.length,
          analysis_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`❌ Failed to store market intelligence for ${asin}:`, error)
      } else {
        console.log(`✅ Stored market intelligence analysis for ${asin}`)
      }
      
    } catch (error) {
      console.error(`🚨 AI analysis failed for ${asin}:`, error)
    }
  }

  /**
   * Generate customer personas using OpenAI
   */
  private async generateCustomerPersonas(reviewData: any): Promise<any[]> {
    try {
      const prompt = `Analyze these Amazon product reviews to create 3-4 distinct customer personas.

Product: ${reviewData.asin}
Total Reviews Analyzed: ${reviewData.totalReviews}
Average Rating: ${reviewData.averageRating.toFixed(1)}/5
Verified Purchase Rate: ${reviewData.metrics.verifiedPurchaseRate}%

RATING DISTRIBUTION:
${reviewData.metrics.ratingDistribution.map(r => `${r.rating} stars: ${r.count} reviews (${r.percentage}%)`).join('\n')}

TOP KEYWORDS (most frequently used words):
${reviewData.metrics.topWords.slice(0, 20).map(w => `"${w.word}" (${w.count}x)`).join(', ')}

COMMON PHRASES (appearing 3+ times):
${reviewData.metrics.topPhrases.map(p => `"${p.phrase}" (${p.count}x)`).join(', ')}

SAMPLE REVIEWS BY RATING:
5-star reviews: ${reviewData.metrics.reviewsByRating[5].slice(0, 3).join(' | ')}
4-star reviews: ${reviewData.metrics.reviewsByRating[4].slice(0, 2).join(' | ')}
1-2 star reviews: ${[...reviewData.metrics.reviewsByRating[1], ...reviewData.metrics.reviewsByRating[2]].slice(0, 2).join(' | ')}

Based on the keyword patterns, phrases, and review sentiments above, identify distinct customer segments and create personas. Look for patterns in language use, concerns, and satisfaction levels.

Return a JSON object:
{
  "personas": [
    {
      "name": "Descriptive Name Based on Characteristics",
      "demographics": "Inferred age range, lifestyle, etc based on language patterns",
      "motivations": ["What they're looking for based on positive reviews"],
      "painPoints": ["Issues mentioned in negative reviews"],
      "buyingBehavior": "How they shop based on review patterns",
      "keyPhrases": ["Actual phrases this segment uses from the data above"]
    }
  ]
}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
          temperature: 0.4,
          response_format: { type: 'json_object' }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const result = JSON.parse(data.choices[0].message.content)
        return result.personas || []
      }
    } catch (error) {
      console.error('Error generating customer personas:', error)
    }
    return []
  }

  /**
   * Generate Voice of Customer insights using OpenAI
   */
  private async generateVoiceOfCustomer(reviewData: any): Promise<any> {
    try {
      const prompt = `Extract Voice of Customer insights from these Amazon reviews using keyword and phrase analysis.

Product: ${reviewData.asin}
Total Reviews: ${reviewData.totalReviews}

MOST COMMON KEYWORDS:
${reviewData.metrics.topWords.map(w => `"${w.word}" (${w.count}x)`).join(', ')}

MOST COMMON PHRASES:
${reviewData.metrics.topPhrases.map(p => `"${p.phrase}" (${p.count}x)`).join(', ')}

REVIEWS BY RATING:
5-star (${reviewData.metrics.ratingDistribution.find(r => r.rating === 5)?.percentage}%): Common words in positive reviews
4-star (${reviewData.metrics.ratingDistribution.find(r => r.rating === 4)?.percentage}%): Generally satisfied but with minor issues
1-2 star (${(parseFloat(reviewData.metrics.ratingDistribution.find(r => r.rating === 1)?.percentage || '0') + parseFloat(reviewData.metrics.ratingDistribution.find(r => r.rating === 2)?.percentage || '0')).toFixed(1)}%): Major complaints and issues

SAMPLE REVIEWS:
Positive: ${reviewData.metrics.reviewsByRating[5].slice(0, 3).join(' | ')}
Negative: ${[...reviewData.metrics.reviewsByRating[1], ...reviewData.metrics.reviewsByRating[2]].slice(0, 3).join(' | ')}

Analyze the language patterns to understand what customers care about. Identify themes from the keyword/phrase patterns, not from predefined categories.

Return JSON:
{
  "keyThemes": [
    {
      "theme": "Theme name based on keyword clusters",
      "description": "What this theme is about",
      "sentiment": "positive/negative/mixed",
      "commonPhrases": ["Actual phrases from data that relate to this theme"],
      "examples": ["Brief quotes from reviews"]
    }
  ],
  "customerLanguage": {
    "positiveTerms": ["Most common positive words from 4-5 star reviews"],
    "negativeTerms": ["Most common negative words from 1-2 star reviews"],
    "descriptiveTerms": ["Product-specific descriptive words"],
    "actionPhrases": ["Phrases describing what customers do with product"]
  },
  "unmetNeeds": ["Issues and desires expressed in reviews"],
  "purchaseDrivers": ["What motivates purchases based on positive reviews"]
}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      })

      if (response.ok) {
        const data = await response.json()
        return JSON.parse(data.choices[0].message.content)
      }
    } catch (error) {
      console.error('Error generating Voice of Customer:', error)
    }
    return {}
  }

  /**
   * Generate emotional triggers using OpenAI
   */
  private async generateEmotionalTriggers(reviewData: any): Promise<any[]> {
    try {
      const prompt = `Identify emotional triggers and psychological drivers in these Amazon reviews.

Product: ${reviewData.asin}
Average Rating: ${reviewData.averageRating.toFixed(1)}/5

EMOTIONAL LANGUAGE IN REVIEWS:
Top Keywords: ${reviewData.metrics.topWords.slice(0, 15).map(w => w.word).join(', ')}
Key Phrases: ${reviewData.metrics.topPhrases.slice(0, 10).map(p => p.phrase).join(', ')}

SAMPLE REVIEWS SHOWING EMOTIONS:
Happy customers (5-star): ${reviewData.metrics.reviewsByRating[5].slice(0, 3).join(' | ')}
Frustrated customers (1-2 star): ${[...reviewData.metrics.reviewsByRating[1], ...reviewData.metrics.reviewsByRating[2]].slice(0, 3).join(' | ')}

Look for emotional language, urgency indicators, social proof mentions, fear/desire expressions, and other psychological patterns in the reviews.

Return JSON array of emotional triggers:
[
  {
    "trigger": "Name of the emotional trigger",
    "description": "How this emotion influences purchasing",
    "examples": ["Actual quotes from reviews showing this trigger"],
    "sentiment": "positive/negative",
    "marketingOpportunity": "How to ethically leverage this insight"
  }
]`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.4,
          response_format: { type: 'json_object' }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const result = JSON.parse(data.choices[0].message.content)
        // Handle both array response and object with array property
        return Array.isArray(result) ? result : (result.triggers || result.emotionalTriggers || [])
      }
    } catch (error) {
      console.error('Error generating emotional triggers:', error)
    }
    return []
  }

  /**
   * Get job status
   */
  getJobStatus(nicheId: string): NicheProcessingJob | null {
    return this.processingJobs.get(nicheId) || null
  }
}

// Export singleton instance
export const nicheProcessor = new NicheProcessor()