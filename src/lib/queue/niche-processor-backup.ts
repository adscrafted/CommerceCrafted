// Niche Processing Queue System
// Handles background processing of niches with multiple ASINs

import { createServerSupabaseClient } from '@/lib/supabase/server'

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
    const supabase = await createServerSupabaseClient()
    
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
          console.log(`⏸️ Rate limiting: waiting 2 seconds before next ASIN...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          console.error(`🚨 Error processing ASIN ${asin}:`, error)
          job.progress.failedAsins.push(asin)
        }
      }

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
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
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
      const supabase = await createServerSupabaseClient()
      
      // Sanitize data before storing
      const price = keepaResult.currentPrice || 0
      const sanitizedPrice = price < 0 ? 0 : price // Convert negative prices to 0
      
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
        image_url: keepaResult.images?.[0] || '',
        description: keepaResult.description || '',
        features: keepaResult.features || [],
        parent_asin: keepaResult.parentAsin || '',
        variation_count: keepaResult.variationCount || 0,
        monthly_sales_estimate: keepaResult.monthlySalesEstimate || 0,
        fba_fees: keepaResult.fbaFees || 0,
        status: 'ACTIVE' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_keepa_sync: new Date().toISOString(),
        keepa_data: keepaResult
      }
      
      console.log(`  💾 Product data prepared:`, {
        asin: productData.asin,
        title: productData.title.substring(0, 50) + '...',
        price: productData.price,
        bsr: productData.bsr
      })
      
      const { data: storedProduct, error: productError } = await supabase
        .from('product')
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
      
      // Try to fetch additional data from other APIs
      try {
        console.log(`  🔍 Step 2: Fetching keywords for ${asin}...`)
        const keywordUrl = `${baseUrl}/api/amazon/ads-api/keywords-comprehensive`
        console.log(`  📡 Calling: ${keywordUrl}`)
        
        const adsResponse = await fetch(keywordUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            asins: [asin], // API expects array of ASINs
            marketplace: 'US' 
          })
        })
        
        console.log(`  📡 Keywords API response status: ${adsResponse.status}`)
        
        if (adsResponse.ok) {
          const adsResult = await adsResponse.json()
          const keywords = adsResult.keywords || []
          console.log(`  🔑 Collected ${keywords.length} keywords for ${asin}`)
          
          if (keywords.length > 0) {
            // Store keywords in database
            console.log(`  💾 Storing keywords in database...`)
            
            // Store keywords with proper data structure for product_keywords table
            const keywordsToStore = keywords.map(kw => ({
              keyword: kw.keyword || kw.query || '', // Handle different response formats
              asin: asin,
              match_type: kw.matchType || 'BROAD',
              source: 'amazon_ads',
              search_volume: kw.searchVolume || kw.impressions || 0,
              competition: kw.competition || 'MEDIUM',
              relevance_score: kw.relevanceScore || 0.8,
              bid_suggestion: kw.suggestedBid || kw.bidSuggestion || 0,
              estimated_clicks: kw.estimatedClicks || 0,
              estimated_orders: kw.estimatedOrders || 0,
              project_id: job.nicheId,
              project_name: job.nicheName,
              created_at: new Date().toISOString()
            }))
            
            // Insert keywords in batches for performance
            const batchSize = 100
            let storedCount = 0
            
            for (let i = 0; i < keywordsToStore.length; i += batchSize) {
              const batch = keywordsToStore.slice(i, i + batchSize)
              const { error: keywordError } = await supabase
                .from('product_keywords')
                .upsert(batch, {
                  onConflict: 'keyword,asin,project_id', // Avoid duplicates
                  ignoreDuplicates: true
                })
              
              if (!keywordError) {
                storedCount += batch.length
                console.log(`  📦 Stored batch of ${batch.length} keywords`)
              } else {
                console.error(`  ❌ Failed to store keyword batch: ${keywordError.message}`)
              }
            }
            
            console.log(`  ✅ Stored ${storedCount} keywords for ${asin} in niche ${job.nicheId}`)
          }
        } else {
          const errorText = await adsResponse.text()
          console.warn(`  ❌ Keywords API failed for ${asin}:`, {
            status: adsResponse.status,
            statusText: adsResponse.statusText,
            error: errorText.substring(0, 200)
          })
        }
        
        // Call OpenAI analysis if available
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/openai/analyze/${asin}`, {
          method: 'POST'
        }).catch(error => {
          console.warn('OpenAI analysis failed for ASIN:', asin, error)
        })
      } catch (additionalError) {
        // Log but don't fail if additional syncs fail
        console.warn(`  ⚠️ Additional sync failed for ${asin}:`, additionalError instanceof Error ? additionalError.message : additionalError)
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
    const supabase = await createServerSupabaseClient()
    
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
    const supabase = await createServerSupabaseClient()
    
    console.log(`
📈 Calculating niche analytics for ${nicheId}...`)
    
    // Get niche ASINs
    const nicheAsins = await this.getNicheAsins(nicheId)
    console.log(`  📦 Found ${nicheAsins.length} ASINs in niche:`, nicheAsins)
    
    // Get all products in the niche (products are stored with id = asin)
    const { data: products, error } = await supabase
      .from('product')
      .select(`
        *,
        niches_overall_analysis (
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
      .select('keyword, asin')
      .in('asin', nicheAsins) // Use ASINs directly
    
    if (keywordError) {
      console.error(`  ❌ Error fetching keywords:`, keywordError)
    }
    
    console.log(`  🔑 Found ${keywords?.length || 0} keywords`)

    // Calculate aggregate metrics
    const totalProducts = products.length
    let totalRevenue = 0
    let avgOpportunityScore = 0
    let avgCompetitionScore = 0
    let avgPrice = 0
    let avgBsr = 0
    let totalReviews = 0
    const allKeywords = new Set<string>()

    products.forEach(product => {
      const analysis = product.niches_overall_analysis?.[0]
      if (analysis) {
        avgOpportunityScore += analysis.opportunity_score || 0
        avgCompetitionScore += analysis.competition_score || 0
        
        const monthlyRevenue = analysis.financial_analysis?.monthlyProjections?.revenue || 0
        totalRevenue += monthlyRevenue
      }
      
      avgPrice += product.price || 0
      avgBsr += product.bsr || 0
      totalReviews += product.review_count || 0
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
    const supabase = await createServerSupabaseClient()
    
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
   * Get job status
   */
  getJobStatus(nicheId: string): NicheProcessingJob | null {
    return this.processingJobs.get(nicheId) || null
  }
}

// Export singleton instance
export const nicheProcessor = new NicheProcessor()