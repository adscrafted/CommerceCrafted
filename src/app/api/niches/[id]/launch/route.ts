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
    
    // Get launch strategy data
    const { data: launchData, error: launchError } = await supabase
      .from('niches_launch_strategy')
      .select('*')
      .eq('niche_id', niche.id)
      .single()
    
    if (launchError && launchError.code !== 'PGRST116') {
      console.error('Error fetching launch strategy:', launchError)
    }
    
    return NextResponse.json({
      niche,
      launchStrategy: launchData || {},
      hasData: !!launchData
    })
  } catch (error) {
    console.error('Error fetching launch data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch launch data' },
      { status: 500 }
    )
  }
}