import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nicheId } = await params
    const supabase = createServiceSupabaseClient()
    
    // Get cached analysis from database
    const { data: cachedAnalysis, error } = await supabase
      .from('niches_demand_analysis')
      .select('pricing_trends, updated_at')
      .eq('niche_id', nicheId)
      .single()

    if (error || !cachedAnalysis) {
      return NextResponse.json({
        hasData: false,
        error: 'Pricing analysis not found. Please ensure the niche has been processed.'
      }, { status: 404 })
    }

    if (!cachedAnalysis.pricing_trends) {
      return NextResponse.json({
        hasData: false,
        error: 'Pricing analysis is empty. The niche may need to be reprocessed.'
      })
    }

    // Calculate cache age
    const cacheAge = cachedAnalysis.updated_at 
      ? Date.now() - new Date(cachedAnalysis.updated_at).getTime()
      : 0

    return NextResponse.json({
      hasData: true,
      analysis: cachedAnalysis.pricing_trends,
      cached: true,
      cacheAge: Math.round(cacheAge / (1000 * 60 * 60)), // hours
      generatedAt: cachedAnalysis.updated_at || new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in pricing analysis endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to analyze pricing trends' },
      { status: 500 }
    )
  }
}

