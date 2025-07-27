import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nicheId } = await params
    const supabase = await createServerSupabaseClient()
    
    // Fetch niche data
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('id, niche_name, total_products, total_keywords')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Fetch demand analysis data from niches_demand_analysis table
    const { data: demandAnalysis, error: daError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .eq('niche_id', nicheId)
      .single()
    
    if (daError && daError.code !== 'PGRST116') {
      console.error('Error fetching demand analysis:', daError)
    }
    
    // Check if market insights exist
    if (demandAnalysis && demandAnalysis.market_insights) {
      return NextResponse.json({
        hasData: true,
        analysis: demandAnalysis.market_insights,
        metadata: {
          analyzedAt: demandAnalysis.analysis_date || new Date().toISOString(),
          productCount: niche.total_products || 0,
          keywordCount: niche.total_keywords || 0,
          nicheName: niche.niche_name,
          source: 'database' // Indicate this came from stored data
        }
      })
    }
    
    // If no stored insights exist, return an appropriate message
    return NextResponse.json({
      hasData: false,
      error: 'Market insights not yet generated. Please wait for niche processing to complete.',
      metadata: {
        productCount: niche.total_products || 0,
        keywordCount: niche.total_keywords || 0,
        nicheName: niche.niche_name,
        source: 'pending'
      }
    })

  } catch (error) {
    console.error('Market trends analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market trends from database' },
      { status: 500 }
    )
  }
}