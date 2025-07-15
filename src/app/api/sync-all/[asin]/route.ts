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

    console.log('Starting comprehensive data sync for ASIN:', asin)

    const results = {
      asin,
      keepa: { success: false, error: null, data: null },
      adsApi: { success: false, error: null, data: null },
      openai: { success: false, error: null, data: null },
      startTime: new Date(),
      endTime: null,
      duration: null
    }

    // Helper function to call sync endpoints
    const callSyncEndpoint = async (endpoint: string, name: string) => {
      try {
        console.log(`Syncing ${name} data...`)
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
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

    // Run data syncs first (Keepa, Ads API) - SP-API removed from niche workflow
    const [keepaResult, adsApiResult] = await Promise.allSettled([
      callSyncEndpoint(`/api/keepa/sync/${asin}`, 'Keepa'),
      callSyncEndpoint(`/api/ads-api/sync/${asin}`, 'Ads API')
    ])

    // Process initial results
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

    // Only run OpenAI analysis if at least one data source succeeded
    const dataSourceSuccessCount = [results.keepa.success, results.adsApi.success].filter(Boolean).length
    
    if (dataSourceSuccessCount > 0) {
      // Run OpenAI analysis after data sources complete
      const openaiResult = await Promise.allSettled([
        callSyncEndpoint(`/api/openai/analyze/${asin}`, 'OpenAI Analysis')
      ])

      if (openaiResult[0].status === 'fulfilled') {
        results.openai = openaiResult[0].value
      } else {
        results.openai = { success: false, error: openaiResult[0].reason?.message || 'OpenAI analysis failed', data: null }
      }
    } else {
      results.openai = { success: false, error: 'Skipped - no data sources succeeded', data: null }
    }

    results.endTime = new Date()
    results.duration = results.endTime.getTime() - results.startTime.getTime()

    // Count successful syncs (including OpenAI)
    const successCount = [results.keepa.success, results.adsApi.success, results.openai.success].filter(Boolean).length
    const totalCount = 3

    console.log(`Comprehensive sync completed: ${successCount}/${totalCount} APIs successful`)

    // Log sync attempt to database for monitoring
    const { error: logError } = await supabase
      .from('amazon_api_cache')
      .insert({
        asin: asin,
        data_type: 'sync_all_attempt',
        raw_data: results,
        processed_data: {
          successCount,
          totalCount,
          successRate: (successCount / totalCount) * 100,
          duration: results.duration
        },
        cache_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Keep for 7 days
        api_source: 'sync_orchestrator'
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
        openaiSuccess: results.openai.success
      }
    }, {
      status: overallSuccess ? 200 : 207 // 207 = Multi-Status (partial success)
    })

  } catch (error) {
    console.error('Error in comprehensive sync:', error)
    return NextResponse.json(
      { 
        error: 'Comprehensive sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Get the latest comprehensive sync attempt
    const { data: syncLog, error } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin)
      .eq('data_type', 'sync_all_attempt')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !syncLog) {
      return NextResponse.json(
        { error: 'No sync history found for this ASIN' },
        { status: 404 }
      )
    }

    // Get current cached data from all APIs
    const { data: allCachedData, error: cacheError } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin)
      .in('data_type', ['keepa_product', 'ads_api_keywords', 'openai_analysis'])
      .gt('cache_expires_at', new Date().toISOString())

    const currentCache = {
      keepa: allCachedData?.find(d => d.data_type === 'keepa_product') || null,
      adsApi: allCachedData?.find(d => d.data_type === 'ads_api_keywords') || null,
      openai: allCachedData?.find(d => d.data_type === 'openai_analysis') || null
    }

    return NextResponse.json({
      asin: asin,
      lastSync: {
        timestamp: syncLog.created_at,
        results: syncLog.raw_data,
        summary: syncLog.processed_data
      },
      currentCache: {
        keepa: {
          available: !!currentCache.keepa,
          cachedAt: currentCache.keepa?.created_at || null,
          expiresAt: currentCache.keepa?.cache_expires_at || null
        },
        adsApi: {
          available: !!currentCache.adsApi,
          cachedAt: currentCache.adsApi?.created_at || null,
          expiresAt: currentCache.adsApi?.cache_expires_at || null
        },
        openai: {
          available: !!currentCache.openai,
          cachedAt: currentCache.openai?.created_at || null,
          expiresAt: currentCache.openai?.cache_expires_at || null
        }
      }
    })

  } catch (error) {
    console.error('Error fetching sync status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    )
  }
}