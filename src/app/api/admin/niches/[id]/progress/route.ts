import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: nicheId } = await params
    
    // Get niche details
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Since we don't have analysis_runs table, set to null
    const analysisRun = null
    const runError = null
    
    // Get progress details from processing_progress field
    const progress = niche.processing_progress || {}
    
    // Count completed products from products table
    const asins = niche.asins ? niche.asins.split(',').map(a => a.trim()) : []
    const { count: completedProducts } = await supabase
      .from('product')
      .select('*', { count: 'exact', head: true })
      .in('id', asins)
      .not('last_keepa_sync', 'is', null)
    
    // Parse ASINs to get total count
    const totalAsins = niche.asins ? niche.asins.split(',').length : 0
    
    // Build progress response
    const response = {
      niche: {
        id: niche.id,
        name: niche.niche_name,
        status: niche.status,
        totalAsins,
        createdAt: niche.created_at,
        processStartedAt: niche.process_started_at,
        processCompletedAt: niche.process_completed_at,
        errorMessage: niche.error_message
      },
      progress: {
        currentStep: progress.currentStep || 'Not started',
        completedAsins: progress.completedAsins?.length || completedProducts || 0,
        totalAsins,
        percentComplete: totalAsins > 0 ? Math.round(((progress.completedAsins?.length || completedProducts || 0) / totalAsins) * 100) : 0,
        currentAsin: progress.currentAsin || null,
        apiCallsMade: progress.apiCallsMade || 0,
        errors: progress.errors || [],
        lastUpdate: progress.lastUpdate || niche.updated_at
      },
      analysisRun: analysisRun ? {
        id: analysisRun.id,
        status: analysisRun.status,
        startedAt: analysisRun.started_at,
        completedAt: analysisRun.completed_at,
        productsAnalyzed: analysisRun.products_analyzed,
        apiCallsMade: analysisRun.api_calls_made,
        errorMessage: analysisRun.error_message
      } : null,
      summary: {
        totalProducts: niche.total_products || 0,
        totalKeywords: niche.total_keywords || 0,
        avgBsr: niche.avg_bsr || 0,
        avgPrice: niche.avg_price || 0,
        avgRating: niche.avg_rating || 0,
        totalReviews: niche.total_reviews || 0
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error getting niche progress:', error)
    return NextResponse.json({ 
      error: 'Failed to get progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}