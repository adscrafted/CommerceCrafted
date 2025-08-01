import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceSupabaseClient()
    
    // Get niche by ID or slug
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get keyword analysis data
    const { data: keywordAnalysisData, error: keywordAnalysisError } = await supabase
      .from('niches_keyword_analysis')
      .select('*')
      .eq('niche_id', niche.id)
      .single()
    
    if (keywordAnalysisError && keywordAnalysisError.code !== 'PGRST116') {
      console.error('Error fetching keyword analysis:', keywordAnalysisError)
    }
    
    // Get raw keywords for products
    const asins = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    const { data: keywords } = await supabase
      .from('product_keywords')
      .select('*')
      .in('product_id', asins)
      .limit(1000)
    
    return NextResponse.json({
      niche,
      keywordAnalysis: keywordAnalysisData || {},
      keywords: keywords || [],
      hasData: !!keywordAnalysisData
    })
  } catch (error) {
    console.error('Error fetching keyword data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keyword data' },
      { status: 500 }
    )
  }
}