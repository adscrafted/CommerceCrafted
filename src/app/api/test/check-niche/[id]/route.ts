import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const nicheId = params.id
    
    // Get niche
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    // Get analysis runs
    const { data: analysisRuns, error: runsError } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('niche_id', nicheId)
      .order('created_at', { ascending: false })
    
    // Get niche products
    const { data: nicheProducts, error: productsError } = await supabase
      .from('niche_products')
      .select('*')
      .eq('niche_id', nicheId)
    
    // Get actual products
    const asins = niche?.asins?.split(',').map(a => a.trim()) || []
    const { data: products } = await supabase
      .from('product')
      .select('id, asin, title, price, rating, review_count')
      .in('id', asins)
    
    return NextResponse.json({
      niche: {
        id: niche?.id,
        name: niche?.niche_name,
        status: niche?.status,
        asins: asins,
        createdAt: niche?.created_at,
        processStartedAt: niche?.process_started_at,
        processCompletedAt: niche?.process_completed_at,
        processingProgress: niche?.processing_progress
      },
      analysisRuns: {
        count: analysisRuns?.length || 0,
        latest: analysisRuns?.[0] || null
      },
      nicheProducts: {
        count: nicheProducts?.length || 0,
        items: nicheProducts || []
      },
      products: {
        count: products?.length || 0,
        items: products || []
      },
      debug: {
        nicheError,
        runsError,
        productsError
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}