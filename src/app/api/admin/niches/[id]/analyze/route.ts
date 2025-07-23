import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { nicheProcessor } from '@/lib/queue/niche-processor'

// Background job to analyze a niche
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const nicheId = params.id
    
    console.log(`🚀 Starting niche analysis for ID: ${nicheId}`)
    
    // Check authentication in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - skipping auth check for analyze endpoint')
    }
    
    // Get niche details
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Parse ASINs from the niche
    const asins = niche.asins ? niche.asins.split(',').map(a => a.trim()) : []
    
    if (asins.length === 0) {
      return NextResponse.json({ error: 'No ASINs found in niche' }, { status: 400 })
    }
    
    // Use the niche processor to handle the processing
    console.log(`🏃 Starting niche processing with ${asins.length} ASINs`)
    
    try {
      // Start processing using the niche processor
      const job = await nicheProcessor.processNiche(
        nicheId,
        niche.niche_name,
        asins,
        niche.marketplace || 'US'
      )
      
      // Since we don't have analysis_runs table, we'll just use a simple ID
      const analysisRunId = `${nicheId}_${Date.now()}`
      console.log(`✅ Processing job started with ID: ${analysisRunId}`)
      
      return NextResponse.json({
        success: true,
        analysisRunId: analysisRunId,
        message: 'Analysis started in background',
        jobStatus: job.status
      })
    } catch (processingError) {
      console.error('🚨 Failed to start processing:', processingError)
      throw processingError
    }
    
  } catch (error) {
    console.error('Error starting niche analysis:', error)
    return NextResponse.json({ 
      error: 'Failed to start analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Background processing function
async function processNicheAnalysis(
  nicheId: string,
  analysisRunId: string,
  asins: string[],
  supabase: any,
  niche: any
) {
  const results = {
    products_analyzed: 0,
    keepa_data_fetched: 0,
    keywords_collected: 0,
    api_calls_made: 0,
    errors: []
  }
  
  try {
    // Step 1: Fetch Keepa data for all ASINs
    console.log('\n📊 Step 1: Fetching Keepa data...')
    
    // Update progress
    await supabase
      .from('niches')
      .update({
        processing_progress: {
          currentStep: 'Fetching product data',
          completedAsins: 0,
          totalAsins: asins.length,
          apiCallsMade: 0,
          errors: [],
          lastUpdate: new Date().toISOString()
        }
      })
      .eq('id', nicheId)
    
    for (let i = 0; i < asins.length; i++) {
      const asin = asins[i]
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
        console.log(`📡 Calling Keepa API for ${asin} at: ${baseUrl}/api/amazon/keepa`)
        const keepaResponse = await fetch(`${baseUrl}/api/amazon/keepa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asin })
        })
        
        if (keepaResponse.ok) {
          const keepaData = await keepaResponse.json()
          console.log(`✅ Keepa data received for ${asin}:`, {
            title: keepaData.title?.substring(0, 50) + '...',
            price: keepaData.currentPrice,
            bsr: keepaData.salesRank
          })
          results.api_calls_made++
          
          // Store product data
          const { error: productError } = await supabase
            .from('products')
            .upsert({
              id: asin,
              asin: asin,
              title: keepaData.title || 'Unknown Product',
              brand: keepaData.brand,
              price: keepaData.currentPrice,
              rating: keepaData.rating,
              review_count: keepaData.reviewCount,
              bsr: keepaData.salesRank,
              category: keepaData.rootCategory,
              image_url: keepaData.images?.[0],
              description: keepaData.description,
              bullet_points: keepaData.features,
              dimensions: keepaData.packageDimensions,
              weight: keepaData.itemWeight,
              monthly_sales: keepaData.monthlySales || keepaData.salesEstimate,
              keepa_data: keepaData,
              last_keepa_sync: new Date().toISOString()
            })
            .select()
          
          if (!productError) {
            results.keepa_data_fetched++
            
            // Update progress
            await supabase
              .from('niches')
              .update({
                processing_progress: {
                  currentStep: `Processing ASIN ${i + 1} of ${asins.length}`,
                  completedAsins: i + 1,
                  totalAsins: asins.length,
                  currentAsin: asin,
                  apiCallsMade: results.api_calls_made,
                  errors: results.errors,
                  lastUpdate: new Date().toISOString()
                }
              })
              .eq('id', nicheId)
            
            // Since niche_products table doesn't exist, we'll track this differently
            results.products_analyzed++
            
            // Store price history
            if (keepaData.priceHistory?.length > 0) {
              const priceRecords = keepaData.priceHistory.map(point => ({
                product_id: asin,
                timestamp: new Date(point.date).toISOString(),
                price: point.price / 100, // Keepa stores in cents
                price_type: 'AMAZON'
              }))
              
              await supabase
                .from('keepa_price_history')
                .upsert(priceRecords)
            }
            
            // Store sales rank history
            if (keepaData.salesRankHistory?.length > 0) {
              const rankRecords = keepaData.salesRankHistory.map(point => ({
                product_id: asin,
                timestamp: new Date(point.date).toISOString(),
                sales_rank: point.rank,
                category: keepaData.rootCategory
              }))
              
              await supabase
                .from('keepa_sales_rank_history')
                .upsert(rankRecords)
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch Keepa data for ${asin}:`, error)
        results.errors.push(`Keepa error for ${asin}: ${error.message}`)
      }
    }
    
    // Step 2: Fetch Amazon Ads keyword data
    console.log('\n🔍 Step 2: Fetching Amazon Ads keywords...')
    
    // Update progress
    await supabase
      .from('niches')
      .update({
        processing_progress: {
          currentStep: 'Fetching keyword data',
          completedAsins: asins.length,
          totalAsins: asins.length,
          apiCallsMade: results.api_calls_made,
          errors: results.errors,
          lastUpdate: new Date().toISOString()
        }
      })
      .eq('id', nicheId)
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      console.log(`📡 Calling Keywords API at: ${baseUrl}/api/amazon/ads-api/keywords-bulk`)
      const keywordsResponse = await fetch(`${baseUrl}/api/amazon/ads-api/keywords-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asins, marketplace: 'US' })
      })
      
      if (keywordsResponse.ok) {
        const keywordsData = await keywordsResponse.json()
        results.api_calls_made++
        
        // Store keywords in database
        if (keywordsData.keywords?.length > 0) {
          const keywordRecords = []
          
          for (const kw of keywordsData.keywords) {
            // Store in product_keywords table
            keywordRecords.push({
              product_id: kw.asin,
              keyword: kw.keyword,
              match_type: kw.matchType || 'BROAD',
              suggested_bid: kw.suggestedBid || 0,
              estimated_clicks: kw.estimatedClicks || 0,
              estimated_orders: kw.estimatedOrders || 0
            })
            
            // Also store in the flexible product_keywords table with niche reference
            await supabase
              .from('product_keywords')
              .upsert({
                keyword: kw.keyword,
                asin: kw.asin,
                match_type: kw.matchType || 'BROAD',
                source: kw.source || 'amazon_ads',
                search_volume: kw.estimatedClicks ? kw.estimatedClicks * 30 : null, // Monthly estimate
                competition: kw.suggestedBid > 100 ? 'HIGH' : kw.suggestedBid > 50 ? 'MEDIUM' : 'LOW',
                relevance_score: 0.8, // Default high relevance
                bid_suggestion: kw.suggestedBid || 0,
                estimated_clicks: kw.estimatedClicks || 0,
                estimated_orders: kw.estimatedOrders || 0,
                project_id: nicheId,
                project_name: niche.niche_name
              })
          }
          
          // Batch insert keywords
          if (keywordRecords.length > 0) {
            const { error: kwError } = await supabase
              .from('product_keywords')
              .upsert(keywordRecords)
            
            if (!kwError) {
              results.keywords_collected = keywordRecords.length
            }
          }
        }
        
        // Update niche with keyword summary
        const topKeywords = keywordsData.keywords
          ?.sort((a, b) => (b.estimatedOrders || 0) - (a.estimatedOrders || 0))
          .slice(0, 20)
          .map(k => k.keyword)
        
        await supabase
          .from('niches')
          .update({
            niche_keywords: topKeywords?.join(','),
            total_keywords: keywordsData.keywords?.length || 0
          })
          .eq('id', nicheId)
      }
    } catch (error) {
      console.error('Failed to fetch keywords:', error)
      results.errors.push(`Keywords error: ${error.message}`)
    }
    
    // Step 3: Calculate scores and metrics
    console.log('\n📈 Step 3: Calculating scores and metrics...')
    
    // Update progress
    await supabase
      .from('niches')
      .update({
        processing_progress: {
          currentStep: 'Calculating scores and metrics',
          completedAsins: asins.length,
          totalAsins: asins.length,
          apiCallsMade: results.api_calls_made,
          errors: results.errors,
          lastUpdate: new Date().toISOString()
        }
      })
      .eq('id', nicheId)
    
    // Get all products for calculations from the products table
    const nicheAsins = niche.asins.split(',').map(a => a.trim())
    const { data: nicheProducts } = await supabase
      .from('products')
      .select('*')
      .in('id', nicheAsins)
    
    if (nicheProducts && nicheProducts.length > 0) {
      // Calculate competition and demand scores and store in products table
      for (const product of nicheProducts) {
        const competitionScore = calculateCompetitionScore(product)
        const demandScore = calculateDemandScore(product)
        const opportunityScore = calculateOpportunityScore(competitionScore, demandScore, product)
        
        // Store scores in product_analyses table if it exists
        await supabase
          .from('product_analyses')
          .upsert({
            product_id: product.id,
            niche_id: nicheId,
            opportunity_score: opportunityScore,
            competition_score: competitionScore,
            demand_score: demandScore,
            feasibility_score: Math.round((opportunityScore + demandScore) / 2),
            timing_score: 80, // Default value
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
      
      // Calculate aggregated metrics
      const avgPrice = nicheProducts.reduce((sum, p) => sum + (p.price || 0), 0) / nicheProducts.length
      const avgRating = nicheProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / nicheProducts.length
      const avgReviews = nicheProducts.reduce((sum, p) => sum + (p.review_count || 0), 0) / nicheProducts.length
      const totalMarketSize = nicheProducts.reduce((sum, p) => sum + (p.monthly_revenue_estimate || 0), 0)
      
      // Log the analysis results
      console.log('Analysis completed:', {
        products_found: asins.length,
        products_analyzed: results.keepa_data_fetched,
        avg_price: avgPrice,
        avg_rating: avgRating,
        avg_review_count: Math.round(avgReviews),
        total_market_size: totalMarketSize,
        api_calls_made: results.api_calls_made
      })
      
      // Update niche status to completed
      await supabase
        .from('niches')
        .update({ 
          status: 'completed',
          process_completed_at: new Date().toISOString()
        })
        .eq('id', nicheId)
      
      // Update niche summary
      await supabase
        .from('niches')
        .update({
          avg_bsr: Math.round(nicheProducts.reduce((sum, p) => sum + (p.bsr || 0), 0) / nicheProducts.length),
          avg_price: avgPrice,
          avg_rating: avgRating,
          total_reviews: nicheProducts.reduce((sum, p) => sum + (p.review_count || 0), 0),
          total_monthly_revenue: totalMarketSize,
          opportunity_score: Math.round(nicheProducts.reduce((sum, p) => sum + (p.opportunity_score || 0), 0) / nicheProducts.length),
          status: 'analyzed',
          process_time: '0' // Will be calculated by trigger
        })
        .eq('id', nicheId)
    }
    
    console.log('\n✅ Analysis completed successfully!')
    console.log('Results:', results)
    
  } catch (error) {
    console.error('Analysis failed:', error)
    
    // Log the failure
    console.error('Analysis failed with error:', error.message)
    console.error('Results so far:', results)
    
    // Update niche status to failed
    await supabase
      .from('niches')
      .update({ 
        status: 'failed',
        error_message: error.message,
        process_completed_at: new Date().toISOString()
      })
      .eq('id', nicheId)
    
    throw error
  }
}

// Helper functions for score calculations
function calculateCompetitionScore(product: any): number {
  let score = 0
  
  // Review count (more reviews = more competition)
  if (product.review_count < 50) score += 20
  else if (product.review_count < 100) score += 15
  else if (product.review_count < 500) score += 10
  else if (product.review_count < 1000) score += 5
  
  // BSR (lower = more competition)
  if (product.bsr && product.bsr < 1000) score += 25
  else if (product.bsr < 5000) score += 20
  else if (product.bsr < 10000) score += 15
  else if (product.bsr < 50000) score += 10
  else score += 5
  
  // Rating (higher rating = stronger competition)
  if (product.rating >= 4.5) score += 20
  else if (product.rating >= 4.0) score += 15
  else if (product.rating >= 3.5) score += 10
  else score += 5
  
  // Price (affects barrier to entry)
  if (product.price > 100) score += 10
  else if (product.price > 50) score += 15
  else if (product.price > 25) score += 20
  else score += 25
  
  return Math.min(100, score)
}

function calculateDemandScore(product: any): number {
  let score = 0
  
  // BSR (lower = higher demand)
  if (product.bsr && product.bsr < 100) score += 30
  else if (product.bsr < 500) score += 25
  else if (product.bsr < 1000) score += 20
  else if (product.bsr < 5000) score += 15
  else if (product.bsr < 10000) score += 10
  else if (product.bsr < 50000) score += 5
  
  // Monthly sales
  if (product.monthly_sales_estimate > 1000) score += 30
  else if (product.monthly_sales_estimate > 500) score += 25
  else if (product.monthly_sales_estimate > 200) score += 20
  else if (product.monthly_sales_estimate > 100) score += 15
  else if (product.monthly_sales_estimate > 50) score += 10
  else score += 5
  
  // Review velocity (reviews as proxy for sales velocity)
  if (product.review_count > 0) {
    const reviewsPerMonth = product.review_count / 12 // Assume 1 year average
    if (reviewsPerMonth > 100) score += 20
    else if (reviewsPerMonth > 50) score += 15
    else if (reviewsPerMonth > 20) score += 10
    else if (reviewsPerMonth > 10) score += 5
  }
  
  // Price point (sweet spot for demand)
  if (product.price >= 15 && product.price <= 50) score += 20
  else if (product.price >= 10 && product.price <= 75) score += 15
  else if (product.price >= 5 && product.price <= 100) score += 10
  else score += 5
  
  return Math.min(100, score)
}

function calculateOpportunityScore(competitionScore: number, demandScore: number, product: any): number {
  // Base calculation: high demand + low competition = high opportunity
  let score = (demandScore * 0.5) + ((100 - competitionScore) * 0.3)
  
  // Profit margin bonus
  if (product.price && product.fba_fees) {
    const estimatedProfit = product.price - (product.fba_fees || product.price * 0.3)
    const profitMargin = (estimatedProfit / product.price) * 100
    
    if (profitMargin > 40) score += 10
    else if (profitMargin > 30) score += 7
    else if (profitMargin > 20) score += 5
  }
  
  // Market gap bonus (low review count but good BSR)
  if (product.review_count < 100 && product.bsr < 10000) {
    score += 10
  }
  
  return Math.round(Math.min(100, Math.max(0, score)))
}