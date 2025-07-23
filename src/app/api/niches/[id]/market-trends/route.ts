import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nicheId } = await params
    const supabase = createServerSupabaseClient()
    
    // Fetch niche data with market insights from database
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('id, niche_name, ai_analysis, total_products, total_keywords')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Check if market insights exist in the ai_analysis field
    if (niche.ai_analysis && typeof niche.ai_analysis === 'object' && niche.ai_analysis.marketInsights) {
      const analysis = niche.ai_analysis as any
      
      return NextResponse.json({
        hasData: true,
        analysis: analysis.marketInsights,
        metadata: {
          analyzedAt: analysis.generatedAt || new Date().toISOString(),
          productCount: analysis.productCount || niche.total_products || 0,
          keywordCount: analysis.keywordCount || niche.total_keywords || 0,
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