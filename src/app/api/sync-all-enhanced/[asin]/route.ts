import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Skip auth checks in development mode
    if (process.env.NODE_ENV !== 'development') {
      // In production, add auth checks here
      console.log('Production mode: Auth checks would be performed here')
    }

    console.log('Starting enhanced comprehensive data sync for ASIN:', asin)

    const results = {
      asin,
      keepa: { success: false, error: null, data: null },
      adsApi: { success: false, error: null, data: null },
      openai: { success: false, error: null, data: null },
      reviews: { success: false, error: null, data: null },
      reddit: { success: false, error: null, data: null },
      startTime: new Date(),
      endTime: null,
      duration: null
    }

    // Helper function to call sync endpoints
    const callSyncEndpoint = async (endpoint: string, name: string, body?: any) => {
      try {
        console.log(`Syncing ${name} data...`)
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
          method: body ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `${name} sync failed`)
        }

        const data = await response.json()
        console.log(`${name} sync completed successfully`)
        return { success: true, error: null, data }
      } catch (error) {
        console.error(`${name} sync failed:`, error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          data: null 
        }
      }
    }

    // Phase 1: Core data syncs (Keepa, Ads API) - SP-API removed from niche workflow
    const [keepaResult, adsApiResult] = await Promise.allSettled([
      callSyncEndpoint(`/api/keepa/sync/${asin}`, 'Keepa'),
      callSyncEndpoint(`/api/ads-api/sync/${asin}`, 'Ads API')
    ])

    // Process Phase 1 results
    if (keepaResult.status === 'fulfilled') {
      results.keepa = keepaResult.value
    } else {
      results.keepa = { success: false, error: keepaResult.reason?.message || 'Keepa sync failed', data: null }
    }

    if (adsApiResult.status === 'fulfilled') {
      results.adsApi = adsApiResult.value
    } else {
      results.adsApi = { success: false, error: adsApiResult.reason?.message || 'Ads API sync failed', data: null }
    }

    // Phase 2: Enhanced data (Reviews & Social) - only if we have product data
    const dataSourceSuccessCount = [results.keepa.success, results.adsApi.success].filter(Boolean).length
    
    if (dataSourceSuccessCount > 0) {
      // Get keywords for Reddit search if Ads API succeeded
      let keywords = []
      let productTitle = ''
      let brand = ''
      
      if (results.adsApi.success && results.adsApi.data?.data?.topKeywords) {
        keywords = results.adsApi.data.data.topKeywords.map((k: any) => k.keyword)
      }
      
      // Get product title and brand from Keepa data if available
      if (results.keepa.success && results.keepa.data?.data) {
        productTitle = results.keepa.data.data.title || ''
        brand = results.keepa.data.data.brand || ''
      }

      // Run reviews and Reddit scraping in parallel
      const [reviewsResult, redditResult] = await Promise.allSettled([
        callSyncEndpoint(`/api/reviews/scrape/${asin}`, 'Reviews', { maxReviews: 100 }),
        keywords.length > 0 
          ? callSyncEndpoint(`/api/social/reddit/scrape`, 'Reddit', { 
              asin, 
              keywords: keywords.slice(0, 5), 
              productTitle,
              brand
            })
          : Promise.resolve({ success: false, error: 'No keywords available for Reddit search', data: null })
      ])

      if (reviewsResult.status === 'fulfilled') {
        results.reviews = reviewsResult.value
      } else {
        results.reviews = { success: false, error: reviewsResult.reason?.message || 'Reviews scraping failed', data: null }
      }

      if (redditResult.status === 'fulfilled') {
        results.reddit = redditResult.value
      } else {
        results.reddit = { success: false, error: redditResult.reason?.message || 'Reddit scraping failed', data: null }
      }

      // Phase 3: AI Analysis after all data is collected
      const openaiResult = await Promise.allSettled([
        callSyncEndpoint(`/api/openai/analyze/${asin}`, 'OpenAI Analysis')
      ])

      if (openaiResult[0].status === 'fulfilled') {
        results.openai = openaiResult[0].value
      } else {
        results.openai = { success: false, error: openaiResult[0].reason?.message || 'OpenAI analysis failed', data: null }
      }
    } else {
      results.reviews = { success: false, error: 'Skipped - no product data available', data: null }
      results.reddit = { success: false, error: 'Skipped - no product data available', data: null }
      results.openai = { success: false, error: 'Skipped - no data sources succeeded', data: null }
    }

    results.endTime = new Date()
    results.duration = results.endTime.getTime() - results.startTime.getTime()

    // Count successful syncs
    const successCount = [
      results.keepa.success, 
      results.adsApi.success, 
      results.openai.success,
      results.reviews.success,
      results.reddit.success
    ].filter(Boolean).length
    const totalCount = 5

    console.log(`Enhanced comprehensive sync completed: ${successCount}/${totalCount} APIs successful`)

    // Log sync attempt to database for monitoring
    const { error: logError } = await supabase
      .from('amazon_api_cache')
      .insert({
        asin: asin,
        data_type: 'sync_all_enhanced_attempt',
        raw_data: results,
        processed_data: {
          successCount,
          totalCount,
          successRate: (successCount / totalCount) * 100,
          duration: results.duration
        },
        cache_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Keep for 7 days
        api_source: 'sync_orchestrator_enhanced'
      })

    if (logError) {
      console.error('Error logging sync attempt:', logError)
    }

    // If at least one sync was successful, consider it a partial success
    const overallSuccess = successCount > 0

    return NextResponse.json({
      success: overallSuccess,
      asin: asin,
      results: results,
      summary: {
        successCount,
        totalCount,
        successRate: Math.round((successCount / totalCount) * 100),
        duration: results.duration,
        keepaSuccess: results.keepa.success,
        adsApiSuccess: results.adsApi.success,
        openaiSuccess: results.openai.success,
        reviewsSuccess: results.reviews.success,
        redditSuccess: results.reddit.success
      }
    }, {
      status: overallSuccess ? 200 : 207 // 207 = Multi-Status (partial success)
    })

  } catch (error) {
    console.error('Error in enhanced comprehensive sync:', error)
    return NextResponse.json(
      { 
        error: 'Enhanced comprehensive sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}