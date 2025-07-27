import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nicheId } = await params
    const supabase = await createServerSupabaseClient()
    
    console.log('Fetching demand analysis for niche:', nicheId)
    
    // Get niche details
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      console.error('Error fetching niche:', nicheError)
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get demand analysis data from niches_demand_analysis table
    const { data: demandAnalysis, error: daError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .eq('niche_id', nicheId)
      .single()
    
    if (daError && daError.code !== 'PGRST116') {
      console.error('Error fetching demand analysis:', daError)
    }
    
    // If no demand analysis data exists, return empty structure
    if (!demandAnalysis) {
      return NextResponse.json({
        hasData: false,
        marketInsights: {},
        pricingTrends: {},
        seasonalityInsights: {},
        socialSignals: {},
        niche: {
          id: niche.id,
          name: niche.niche_name,
          totalProducts: niche.total_products
        }
      })
    }
    
    // Return demand analysis data
    return NextResponse.json({
      hasData: true,
      marketInsights: demandAnalysis.market_insights || {},
      pricingTrends: demandAnalysis.pricing_trends || {},
      seasonalityInsights: demandAnalysis.seasonality_insights || {},
      socialSignals: demandAnalysis.social_signals || {},
      niche: {
        id: niche.id,
        name: niche.niche_name,
        totalProducts: niche.total_products
      },
      analysisDate: demandAnalysis.analysis_date
    })
    
  } catch (error) {
    console.error('Error in demand analysis API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch demand analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}