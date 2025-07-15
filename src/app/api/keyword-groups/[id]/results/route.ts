import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const groupId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'search_volume'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('keyword_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get ASIN metadata
    const { data: asinData, error: asinError } = await supabase
      .from('keyword_group_asin_metadata')
      .select('*')
      .eq('group_id', groupId)

    if (asinError) {
      console.error('Error fetching ASIN data:', asinError)
    }

    // Get keywords with pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: keywords, error: keywordsError, count } = await supabase
      .from('keyword_group_keywords')
      .select('*', { count: 'exact' })
      .eq('group_id', groupId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError)
      return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
    }

    // Calculate cannibalization data
    const keywordMap = new Map()
    const { data: allKeywords } = await supabase
      .from('keyword_group_keywords')
      .select('keyword, asin')
      .eq('group_id', groupId)

    allKeywords?.forEach(kw => {
      if (!keywordMap.has(kw.keyword)) {
        keywordMap.set(kw.keyword, new Set())
      }
      keywordMap.get(kw.keyword).add(kw.asin)
    })

    const cannibalizedKeywords = Array.from(keywordMap.entries())
      .filter(([_, asins]) => asins.size > 1)
      .map(([keyword, asins]) => ({
        keyword,
        asinCount: asins.size,
        asins: Array.from(asins)
      }))

    // Calculate summary metrics
    const totalKeywords = count || 0
    const uniqueKeywords = keywordMap.size
    const avgSearchVolume = keywords?.reduce((sum, kw) => sum + (kw.search_volume || 0), 0) / (keywords?.length || 1)
    const avgCPC = keywords?.reduce((sum, kw) => sum + (kw.suggested_bid || 0), 0) / (keywords?.length || 1)
    
    return NextResponse.json({
      group: {
        ...group,
        asinMetadata: asinData
      },
      keywords: keywords || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      summary: {
        totalKeywords,
        uniqueKeywords,
        cannibalizedCount: cannibalizedKeywords.length,
        avgSearchVolume: Math.floor(avgSearchVolume),
        avgCPC: parseFloat(avgCPC.toFixed(2)),
        cannibalizationRisk: cannibalizedKeywords.length > uniqueKeywords * 0.3 ? 'HIGH' :
                           cannibalizedKeywords.length > uniqueKeywords * 0.1 ? 'MEDIUM' : 'LOW'
      },
      cannibalization: cannibalizedKeywords.slice(0, 20) // Top 20 cannibalized keywords
    })
  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}