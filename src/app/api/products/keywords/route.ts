import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { adsApiAuth } from '@/lib/amazon-ads-auth'

interface KeywordData {
  keyword: string
  source: string
  apiResponse: any
  searchVolume?: number
  relevanceScore?: number
  suggestedBid?: any
  metrics?: any
}

// Fetch keyword suggestions from Amazon Ads API (similar to JungleAce)
async function fetchKeywordSuggestions(asin: string): Promise<KeywordData[]> {
  const allKeywords: KeywordData[] = []
  
  try {
    // Method 1: Keyword recommendations (most comprehensive)
    try {
      const response = await adsApiAuth.makeRequest(
        'POST',
        '/sp/targets/keywords/recommendations',
        'NA',
        {
          recommendationType: 'KEYWORDS_FOR_ASINS',
          asins: [asin],
          maxRecommendations: 200, // Get more keywords
          includeExtendedDataFields: true,
          includeBidRecommendations: true
        },
        {
          'Content-Type': 'application/vnd.spkeywordsrecommendation.v4+json',
          'Accept': 'application/vnd.spkeywordsrecommendation.v4+json'
        }
      )
      
      if (response.recommendations) {
        response.recommendations.forEach((rec: any) => {
          allKeywords.push({
            keyword: rec.keyword || rec.value,
            source: 'recommended',
            apiResponse: rec,
            searchVolume: rec.metrics?.searches || rec.searchVolume || 0,
            relevanceScore: rec.relevanceScore || 0,
            suggestedBid: rec.bid || rec.suggestedBid,
            metrics: rec.metrics
          })
        })
      }
    } catch (err) {
      console.log('Keyword recommendations API failed:', err)
    }

    // Method 2: Suggested keywords (simpler API)
    try {
      const response = await adsApiAuth.makeRequest(
        'GET',
        `/v2/sp/asins/${asin}/suggested/keywords`,
        'NA'
      )
      
      if (response.suggestedKeywords) {
        response.suggestedKeywords.forEach((kw: string) => {
          // Check if we already have this keyword
          if (!allKeywords.find(k => k.keyword.toLowerCase() === kw.toLowerCase())) {
            allKeywords.push({
              keyword: kw,
              source: 'suggested',
              apiResponse: { keyword: kw },
              searchVolume: 0,
              relevanceScore: 0
            })
          }
        })
      }
    } catch (err) {
      console.log('Suggested keywords API failed:', err)
    }

    // Method 3: Search terms report style data (if available)
    try {
      const response = await adsApiAuth.makeRequest(
        'POST',
        '/v2/sp/keywords/search',
        'NA',
        {
          asin: asin,
          pageSize: 100
        }
      )
      
      if (response.keywords) {
        response.keywords.forEach((kw: any) => {
          if (!allKeywords.find(k => k.keyword.toLowerCase() === kw.keyword.toLowerCase())) {
            allKeywords.push({
              keyword: kw.keyword,
              source: 'search',
              apiResponse: kw,
              searchVolume: kw.searchVolume || 0,
              metrics: kw
            })
          }
        })
      }
    } catch (err) {
      console.log('Search keywords API failed:', err)
    }

  } catch (error) {
    console.error(`Error fetching keywords for ${asin}:`, error)
  }

  return allKeywords
}

// Get bid recommendations for keywords
async function enrichKeywordsWithBids(keywords: KeywordData[]): Promise<KeywordData[]> {
  try {
    // Process in batches of 30 keywords
    const batchSize = 30
    const enrichedKeywords = [...keywords]
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize)
      
      try {
        const response = await adsApiAuth.makeRequest(
          'POST',
          '/v2/sp/keywords/bidRecommendations',
          'NA',
          {
            adGroupId: '1', // Dummy ID for bid recommendations
            keywords: batch.map(k => ({ 
              keyword: k.keyword, 
              matchType: 'EXACT' 
            }))
          }
        )
        
        if (response.recommendations) {
          response.recommendations.forEach((rec: any, index: number) => {
            const keywordIndex = i + index
            if (enrichedKeywords[keywordIndex]) {
              enrichedKeywords[keywordIndex].suggestedBid = rec.suggestedBid || {}
              enrichedKeywords[keywordIndex].apiResponse = {
                ...enrichedKeywords[keywordIndex].apiResponse,
                bidData: rec
              }
            }
          })
        }
      } catch (err) {
        console.log(`Bid recommendations batch ${i / batchSize} failed`)
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return enrichedKeywords
  } catch (error) {
    console.error('Error enriching keywords with bids:', error)
    return keywords
  }
}

// GET: Fetch keywords for a specific ASIN in a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asin = searchParams.get('asin')
    const projectId = searchParams.get('projectId')
    
    if (!asin || !projectId) {
      return NextResponse.json({ error: 'ASIN and projectId are required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Check auth - allow debug access for testing
    const debugAccess = request.headers.get('cookie')?.includes('debug_admin_access=true')
    
    let userId
    if (debugAccess) {
      // For debug access, get any admin user
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'ADMIN')
        .limit(1)
        .single()
      
      userId = adminUser?.id
      console.log('Debug access - using admin user:', userId)
    } else {
      // Normal auth flow
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'No valid user found' }, { status: 401 })
    }
    
    // Verify user owns the project
    console.log('Checking project ownership - projectId:', projectId, 'userId:', userId)
    const { data: project, error: projectCheckError } = await supabase
      .from('product_queue_projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()
    
    console.log('Project check result:', project, 'error:', projectCheckError)
      
    if (!project) {
      // Try without user filter for debug
      const { data: anyProject } = await supabase
        .from('product_queue_projects')
        .select('id, user_id')
        .eq('id', projectId)
        .single()
      
      console.log('Project exists but different user:', anyProject)
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 })
    }
    
    const { data: keywords, error } = await supabase
      .from('product_keywords')
      .select('*')
      .eq('project_id', projectId)
      .eq('asin', asin)
      .order('estimated_orders', { ascending: false })
    
    if (error) {
      console.error('Error fetching keywords:', error)
      return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      keywords: keywords || [],
      count: keywords?.length || 0
    })
    
  } catch (error) {
    console.error('Keywords GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Fetch and store new keywords for an ASIN
export async function POST(request: NextRequest) {
  try {
    const { asin, projectId } = await request.json()
    
    if (!asin || !projectId) {
      return NextResponse.json({ error: 'ASIN and projectId are required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Check auth - allow debug access for testing
    const debugAccess = request.headers.get('cookie')?.includes('debug_admin_access=true')
    
    let userId
    if (debugAccess) {
      // For debug access, get any admin user
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'ADMIN')
        .limit(1)
        .single()
      
      userId = adminUser?.id
      console.log('Debug access - using admin user:', userId)
    } else {
      // Normal auth flow
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = user.id
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'No valid user found' }, { status: 401 })
    }
    
    // Verify user owns the project
    console.log('Checking project ownership - projectId:', projectId, 'userId:', userId)
    const { data: project, error: projectCheckError } = await supabase
      .from('product_queue_projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()
    
    console.log('Project check result:', project, 'error:', projectCheckError)
      
    if (!project) {
      // Try without user filter for debug
      const { data: anyProject } = await supabase
        .from('product_queue_projects')
        .select('id, user_id')
        .eq('id', projectId)
        .single()
      
      console.log('Project exists but different user:', anyProject)
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 403 })
    }
    
    // Fetch keywords from Amazon Ads API
    console.log(`Fetching keywords for ASIN: ${asin}`)
    let keywords = await fetchKeywordSuggestions(asin)
    
    // Enrich with bid recommendations if we have keywords
    if (keywords.length > 0) {
      console.log(`Enriching ${keywords.length} keywords with bid data...`)
      keywords = await enrichKeywordsWithBids(keywords)
    }
    
    // Transform to simple schema
    const keywordRecords = keywords.map(kw => ({
      project_id: projectId,
      asin,
      keyword: kw.keyword,
      estimated_clicks: kw.metrics?.clicks || 0,
      estimated_orders: kw.metrics?.purchases || 0,
      bid: kw.suggestedBid?.suggested || kw.suggestedBid?.value || 0
    }))
    
    // Delete old keywords for this ASIN in this project
    await supabase
      .from('product_keywords')
      .delete()
      .eq('project_id', projectId)
      .eq('asin', asin)
    
    // Insert new keywords
    const { data: insertedKeywords, error: insertError } = await supabase
      .from('product_keywords')
      .insert(keywordRecords)
      .select()
    
    if (insertError) {
      console.error('Error inserting keywords:', insertError)
      return NextResponse.json({ error: 'Failed to store keywords' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      keywords: insertedKeywords,
      count: keywordRecords.length
    })
    
  } catch (error) {
    console.error('Keywords POST error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch keywords',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to determine competition level based on search volume
function determineCompetitionLevel(searchVolume: number): string {
  if (searchVolume > 10000) return 'HIGH'
  if (searchVolume > 5000) return 'MEDIUM'
  return 'LOW'
}