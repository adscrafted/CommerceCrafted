import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock keyword data for testing
const mockKeywords = [
  { keyword: "echo dot", estimated_clicks: 1250, estimated_orders: 87, bid: 2.45 },
  { keyword: "alexa device", estimated_clicks: 980, estimated_orders: 62, bid: 1.89 },
  { keyword: "smart speaker", estimated_clicks: 1500, estimated_orders: 95, bid: 3.12 },
  { keyword: "amazon echo", estimated_clicks: 890, estimated_orders: 58, bid: 2.23 },
  { keyword: "voice assistant", estimated_clicks: 670, estimated_orders: 41, bid: 1.67 }
]

export async function POST(request: NextRequest) {
  try {
    const { asin, projectId } = await request.json()
    
    if (!asin || !projectId) {
      return NextResponse.json({ error: 'ASIN and projectId are required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    console.log('Test endpoint - storing mock keywords')
    console.log('Project ID:', projectId)
    console.log('ASIN:', asin)
    
    // Transform mock data
    const keywordRecords = mockKeywords.map(kw => ({
      project_id: projectId,
      asin,
      keyword: kw.keyword,
      estimated_clicks: kw.estimated_clicks,
      estimated_orders: kw.estimated_orders,
      bid: kw.bid
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
      return NextResponse.json({ error: 'Failed to store keywords', details: insertError }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      keywords: insertedKeywords,
      count: keywordRecords.length,
      message: 'Mock keywords stored successfully'
    })
    
  } catch (error) {
    console.error('Test keywords error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const asin = searchParams.get('asin')
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    let query = supabase
      .from('product_keywords')
      .select('*')
      .eq('project_id', projectId)
      .order('estimated_orders', { ascending: false })
    
    if (asin) {
      query = query.eq('asin', asin)
    }
    
    const { data: keywords, error } = await query
    
    if (error) {
      console.error('Error fetching keywords:', error)
      return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      keywords: keywords || [],
      count: keywords?.length || 0
    })
    
  } catch (error) {
    console.error('Test keywords GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}