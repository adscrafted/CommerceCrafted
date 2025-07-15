import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { amazonAdsApi } from '@/lib/integrations/amazon-ads-api'

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

    console.log('Syncing Ads API keyword data for ASIN:', asin)

    // Fetch keyword data from Amazon Ads API
    const keywordData = await amazonAdsApi.getCompleteKeywordData(asin)
    
    if (!keywordData) {
      return NextResponse.json(
        { error: 'No keyword data found for this ASIN' },
        { status: 404 }
      )
    }

    console.log(`Ads API keyword data fetched: ${keywordData.totalKeywords} keywords found`)

    // Update or insert keyword analysis data
    const { error: keywordError } = await supabase
      .from('keyword_analyses')
      .upsert({
        asin: asin,
        primary_keywords: keywordData.primaryKeywords,
        longtail_keywords: keywordData.longtailKeywords,
        total_keywords: keywordData.totalKeywords,
        avg_cpc: keywordData.avgCpc,
        keyword_opportunities: keywordData.keywordOpportunities,
        seasonal_trends: [], // Would need historical data to calculate
        ppc_competition_level: keywordData.avgCpc > 2.0 ? 'HIGH' : keywordData.avgCpc > 1.0 ? 'MEDIUM' : 'LOW',
        search_volume_trend: 'STABLE', // Would need trend analysis
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'asin'
      })

    if (keywordError) {
      console.error('Error updating keyword analysis:', keywordError)
      return NextResponse.json(
        { error: 'Failed to store keyword data' },
        { status: 500 }
      )
    }

    // Cache the raw Ads API data
    const cacheExpiresAt = new Date()
    cacheExpiresAt.setHours(cacheExpiresAt.getHours() + 24) // Cache for 24 hours

    const { error: cacheError } = await supabase
      .from('amazon_api_cache')
      .upsert({
        asin: asin,
        data_type: 'ads_api_keywords',
        raw_data: keywordData.rawData,
        processed_data: keywordData,
        cache_expires_at: cacheExpiresAt.toISOString(),
        api_source: 'ads_api'
      }, {
        onConflict: 'asin,data_type'
      })

    if (cacheError) {
      console.error('Error caching Ads API data:', cacheError)
    }

    return NextResponse.json({
      success: true,
      asin: asin,
      data: {
        totalKeywords: keywordData.totalKeywords,
        primaryKeywords: keywordData.primaryKeywords.length,
        longtailKeywords: keywordData.longtailKeywords.length,
        avgCpc: keywordData.avgCpc,
        keywordOpportunities: keywordData.keywordOpportunities,
        topKeywords: keywordData.primaryKeywords.slice(0, 10).map(k => ({
          keyword: k.keyword,
          matchType: k.matchType,
          suggestedBid: k.suggestedBid
        })),
        lastUpdated: keywordData.lastUpdated
      }
    })

  } catch (error) {
    console.error('Error syncing Ads API keyword data:', error)
    return NextResponse.json(
      { error: 'Failed to sync keyword data', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Get cached Ads API keyword data
    const { data: cachedData, error } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin)
      .eq('data_type', 'ads_api_keywords')
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (error || !cachedData) {
      return NextResponse.json(
        { error: 'No cached keyword data found. Try syncing first.' },
        { status: 404 }
      )
    }

    // Also get the processed keyword analysis
    const { data: keywordAnalysis, error: analysisError } = await supabase
      .from('keyword_analyses')
      .select('*')
      .eq('asin', asin)
      .single()

    return NextResponse.json({
      asin: asin,
      cachedAt: cachedData.created_at,
      expiresAt: cachedData.cache_expires_at,
      rawData: cachedData.raw_data,
      processedData: cachedData.processed_data,
      keywordAnalysis: keywordAnalysis || null
    })

  } catch (error) {
    console.error('Error fetching Ads API keyword data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keyword data' },
      { status: 500 }
    )
  }
}