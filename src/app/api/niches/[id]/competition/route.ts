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
    
    // Get competition analysis data
    const { data: competitionData, error: competitionError } = await supabase
      .from('niches_competition_analysis')
      .select('*')
      .eq('niche_id', niche.id)
      .single()
    
    if (competitionError && competitionError.code !== 'PGRST116') {
      console.error('Error fetching competition analysis:', competitionError)
    }
    
    // Get products for additional competition data
    const asins = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    const { data: products } = await supabase
      .from('product')
      .select('*')
      .in('asin', asins)
      .order('bsr', { ascending: true })
    
    return NextResponse.json({
      niche,
      competitionAnalysis: competitionData || {},
      products: products || [],
      hasData: !!competitionData
    })
  } catch (error) {
    console.error('Error fetching competition data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competition data' },
      { status: 500 }
    )
  }
}