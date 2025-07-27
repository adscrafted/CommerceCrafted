import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { nicheProcessor } from '@/lib/queue/niche-processor'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get nicheId from request body or URL params
    const body = await request.json()
    const nicheId = body.nicheId
    
    if (!nicheId) {
      return NextResponse.json({ error: 'nicheId is required' }, { status: 400 })
    }
    
    // Verify niche exists
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    console.log(`🚀 Generating demand analysis for niche: ${niche.niche_name} (${nicheId})`)
    
    // Generate market insights and demand analysis
    await nicheProcessor.generateMarketInsightsForNiche(nicheId)
    
    // Verify the data was created
    const { data: demandAnalysis, error: checkError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .eq('niche_id', nicheId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking demand analysis:', checkError)
    }
    
    return NextResponse.json({
      success: true,
      message: `Demand analysis generated for ${niche.niche_name}`,
      hasData: !!demandAnalysis,
      demandAnalysis
    })
    
  } catch (error) {
    console.error('Error generating demand analysis:', error)
    return NextResponse.json({ 
      error: 'Failed to generate demand analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check existing demand analysis
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const url = new URL(request.url)
    const nicheId = url.searchParams.get('nicheId')
    
    if (!nicheId) {
      // Get all niches with demand analysis status
      const { data: niches, error } = await supabase
        .from('niches')
        .select('id, niche_name, status')
        .eq('status', 'completed')
      
      if (error) {
        throw error
      }
      
      // Check which ones have demand analysis
      const nichesWithStatus = await Promise.all(
        (niches || []).map(async (niche) => {
          const { data: analysis } = await supabase
            .from('niches_demand_analysis')
            .select('niche_id')
            .eq('niche_id', niche.id)
            .single()
          
          return {
            ...niche,
            hasDemandAnalysis: !!analysis
          }
        })
      )
      
      return NextResponse.json({
        niches: nichesWithStatus,
        summary: {
          total: nichesWithStatus.length,
          withAnalysis: nichesWithStatus.filter(n => n.hasDemandAnalysis).length,
          withoutAnalysis: nichesWithStatus.filter(n => !n.hasDemandAnalysis).length
        }
      })
    }
    
    // Get specific niche demand analysis
    const { data: analysis, error } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .eq('niche_id', nicheId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return NextResponse.json({
      hasAnalysis: !!analysis,
      analysis
    })
    
  } catch (error) {
    console.error('Error checking demand analysis:', error)
    return NextResponse.json({ 
      error: 'Failed to check demand analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}