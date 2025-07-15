import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { nicheProcessor } from '@/lib/queue/niche-processor'

export async function POST(request: NextRequest) {
  try {
    const { nicheId, nicheName, asins, marketplace = 'US' } = await request.json()

    if (!nicheId || !nicheName || !asins || !Array.isArray(asins)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: nicheId, nicheName, asins array' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Create or update niche record
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .upsert({
        id: nicheId,
        niche_name: nicheName,
        asins: asins.join(','),
        total_products: asins.length,
        marketplace,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (nicheError) {
      console.error('Error creating niche:', nicheError)
      return NextResponse.json(
        { error: 'Failed to create niche record' },
        { status: 500 }
      )
    }

    // Start processing in background
    const job = await nicheProcessor.processNiche(nicheId, nicheName, asins, marketplace)

    return NextResponse.json({
      success: true,
      niche: {
        id: nicheId,
        name: nicheName,
        asinCount: asins.length,
        status: job.status
      },
      message: 'Niche processing started successfully'
    })

  } catch (error) {
    console.error('Error starting niche processing:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start niche processing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nicheId = searchParams.get('nicheId')

    if (!nicheId) {
      return NextResponse.json(
        { error: 'nicheId parameter required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get niche with current status
    const { data: niche, error } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()

    if (error || !niche) {
      return NextResponse.json(
        { error: 'Niche not found' },
        { status: 404 }
      )
    }

    // Get job status from processor
    const jobStatus = nicheProcessor.getJobStatus(nicheId)

    return NextResponse.json({
      success: true,
      niche: {
        id: niche.id,
        name: niche.niche_name,
        status: niche.status,
        progress: niche.processing_progress || jobStatus?.progress,
        totalProducts: niche.total_products,
        completedProducts: niche.processing_progress?.completedAsins?.length || 0,
        failedProducts: niche.failed_products || 0,
        avgOpportunityScore: niche.avg_opportunity_score,
        avgCompetitionScore: niche.avg_competition_score,
        totalMonthlyRevenue: niche.total_monthly_revenue,
        marketSize: niche.market_size,
        competitionLevel: niche.competition_level,
        startedAt: niche.process_started_at,
        completedAt: niche.process_completed_at,
        error: niche.error_message
      }
    })

  } catch (error) {
    console.error('Error fetching niche status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch niche status' },
      { status: 500 }
    )
  }
}