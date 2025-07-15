import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { adsApiAuth } from '@/lib/amazon-ads-auth'

interface ProcessingPhase {
  phase: string
  percentage: number
  message: string
}

// Update progress in database
async function updateProgress(
  supabase: any,
  groupId: string,
  phase: string,
  percentage: number,
  message: string
) {
  await supabase
    .from('keyword_group_progress')
    .upsert({
      group_id: groupId,
      phase,
      percentage,
      message,
      completed_at: percentage === 100 ? new Date().toISOString() : null
    })
}

// Update group status
async function updateGroupStatus(
  supabase: any,
  groupId: string,
  status: string,
  additionalFields: any = {}
) {
  await supabase
    .from('keyword_groups')
    .update({
      status,
      ...additionalFields
    })
    .eq('id', groupId)
}

// Fetch product data from Keepa
async function fetchKeepaData(asin: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/products/keepa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin })
    })
    
    if (!response.ok) return null
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error(`Keepa fetch error for ${asin}:`, error)
    return null
  }
}

// Process keyword suggestions from Ads API
async function fetchKeywordSuggestions(asin: string): Promise<any[]> {
  try {
    // Try multiple methods to get keywords
    const methods = [
      // Method 1: Keyword recommendations
      async () => {
        const response = await adsApiAuth.makeRequest(
          'POST',
          '/sp/targets/keywords/recommendations',
          'NA',
          {
            recommendationType: 'KEYWORDS_FOR_ASINS',
            asins: [asin],
            maxRecommendations: 100,
            includeExtendedDataFields: true
          },
          {
            'Content-Type': 'application/vnd.spkeywordsrecommendation.v4+json',
            'Accept': 'application/vnd.spkeywordsrecommendation.v4+json'
          }
        )
        return response.recommendations || []
      },
      // Method 2: Suggested keywords
      async () => {
        const response = await adsApiAuth.makeRequest(
          'GET',
          `/v2/sp/asins/${asin}/suggested/keywords`,
          'NA'
        )
        return (response.suggestedKeywords || []).map((kw: string) => ({ keyword: kw }))
      }
    ]

    // Try each method until one succeeds
    for (const method of methods) {
      try {
        const keywords = await method()
        if (keywords.length > 0) return keywords
      } catch (err) {
        console.log('Method failed, trying next...')
      }
    }

    return []
  } catch (error) {
    console.error(`Keyword fetch error for ${asin}:`, error)
    return []
  }
}

// Get bid recommendations for keywords
async function fetchBidRecommendations(keywords: string[]): Promise<Map<string, any>> {
  const bidMap = new Map()
  
  try {
    // Process in batches of 30
    const batchSize = 30
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize)
      
      try {
        const response = await adsApiAuth.makeRequest(
          'POST',
          '/v2/sp/keywords/bidRecommendations',
          'NA',
          {
            adGroupId: '1',
            keywords: batch.map(k => ({ keyword: k, matchType: 'EXACT' }))
          }
        )
        
        if (response.recommendations) {
          response.recommendations.forEach((rec: any) => {
            bidMap.set(rec.keyword, rec.suggestedBid)
          })
        }
      } catch (err) {
        console.log(`Bid batch ${i / batchSize} failed`)
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('Bid recommendations error:', error)
  }
  
  return bidMap
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { groupId } = await request.json()
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('keyword_groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Update status to processing
    await updateGroupStatus(supabase, groupId, 'processing', {
      processing_started_at: new Date().toISOString()
    })

    // Phase 1: Collect ASIN metadata from Keepa
    await updateProgress(supabase, groupId, 'metadata_collection', 0, 'Starting metadata collection...')
    
    const asinMetadata = []
    for (let i = 0; i < group.asins.length; i++) {
      const asin = group.asins[i]
      const keepaData = await fetchKeepaData(asin)
      
      if (keepaData) {
        asinMetadata.push({
          asin,
          group_id: groupId,
          title: keepaData.title,
          brand: keepaData.brand,
          price: keepaData.price,
          image_url: keepaData.imageUrl,
          secondary_images: keepaData.images || [],
          product_group: keepaData.productGroup,
          sales_rank_category: keepaData.salesRankReference,
          sales_rank_value: keepaData.salesRank,
          review_count: keepaData.reviewCount,
          rating: keepaData.rating,
          fba_fees: keepaData.fbaFees,
          dimensions: {
            length: keepaData.packageLength,
            width: keepaData.packageWidth,
            height: keepaData.packageHeight,
            weight: keepaData.packageWeight
          },
          variations: keepaData.variations || [],
          features: keepaData.features || []
        })
      }
      
      const progress = Math.floor((i + 1) / group.asins.length * 100)
      await updateProgress(supabase, groupId, 'metadata_collection', progress, 
        `Processed ${i + 1} of ${group.asins.length} ASINs`)
    }

    // Insert ASIN metadata
    if (asinMetadata.length > 0) {
      await supabase
        .from('keyword_group_asin_metadata')
        .insert(asinMetadata)
    }

    // Phase 2: Collect keywords from Ads API
    await updateProgress(supabase, groupId, 'keyword_discovery', 0, 'Starting keyword discovery...')
    
    const allKeywords: any[] = []
    
    for (let i = 0; i < group.asins.length; i++) {
      const asin = group.asins[i]
      const keywords = await fetchKeywordSuggestions(asin)
      
      keywords.forEach(kw => {
        allKeywords.push({
          group_id: groupId,
          asin,
          keyword: kw.keyword || kw,
          source: kw.recommendationType ? 'recommended' : 'suggested',
          api_response: kw,
          search_volume: kw.metrics?.searches || 0,
          relevance_score: kw.relevanceScore || 0
        })
      })
      
      const progress = Math.floor((i + 1) / group.asins.length * 100)
      await updateProgress(supabase, groupId, 'keyword_discovery', progress, 
        `Discovered keywords for ${i + 1} of ${group.asins.length} ASINs`)
    }

    // Update total keywords found
    await updateGroupStatus(supabase, groupId, 'processing', {
      total_keywords_found: allKeywords.length
    })

    // Phase 3: Enrich with bid recommendations
    await updateProgress(supabase, groupId, 'bid_enrichment', 0, 'Fetching bid recommendations...')
    
    // Get unique keywords
    const uniqueKeywords = [...new Set(allKeywords.map(k => k.keyword))]
    const bidMap = await fetchBidRecommendations(uniqueKeywords)
    
    // Enrich keyword data with bids
    const enrichedKeywords = allKeywords.map(kw => {
      const bidData = bidMap.get(kw.keyword) || {}
      return {
        ...kw,
        suggested_bid: bidData.suggested || 0,
        bid_range_low: bidData.rangeStart || 0,
        bid_range_high: bidData.rangeEnd || 0,
        competition_level: kw.search_volume > 10000 ? 'HIGH' : 
                         kw.search_volume > 5000 ? 'MEDIUM' : 'LOW'
      }
    })

    await updateProgress(supabase, groupId, 'bid_enrichment', 100, 'Bid enrichment complete')

    // Phase 4: Store keywords in database
    await updateProgress(supabase, groupId, 'storage', 0, 'Storing keyword data...')
    
    // Insert in batches to avoid timeout
    const batchSize = 100
    for (let i = 0; i < enrichedKeywords.length; i += batchSize) {
      const batch = enrichedKeywords.slice(i, i + batchSize)
      await supabase
        .from('keyword_group_keywords')
        .insert(batch)
      
      const progress = Math.floor(Math.min(i + batchSize, enrichedKeywords.length) / enrichedKeywords.length * 100)
      await updateProgress(supabase, groupId, 'storage', progress, 
        `Stored ${Math.min(i + batchSize, enrichedKeywords.length)} of ${enrichedKeywords.length} keywords`)
    }

    // Complete processing
    await updateGroupStatus(supabase, groupId, 'completed', {
      completed_at: new Date().toISOString(),
      total_keywords_processed: enrichedKeywords.length
    })

    await updateProgress(supabase, groupId, 'complete', 100, 'Processing complete!')

    return NextResponse.json({ 
      success: true,
      message: 'Keyword group processing completed',
      stats: {
        asinsProcessed: group.asins.length,
        keywordsFound: enrichedKeywords.length,
        uniqueKeywords: uniqueKeywords.length
      }
    })

  } catch (error) {
    console.error('Keyword group processing error:', error)
    
    // Update group status to failed
    try {
      const { groupId } = await request.json()
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      
      await updateGroupStatus(supabase, groupId, 'failed', {
        error_message: error instanceof Error ? error.message : 'Processing failed'
      })
    } catch (e) {
      console.error('Failed to update error status:', e)
    }
    
    return NextResponse.json({ 
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}