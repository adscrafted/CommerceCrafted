import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[CHECK MI] Checking niches_market_intelligence table')
    
    const supabase = await createServerSupabaseClient()
    
    // Get current count and sample data
    const { data, error, count } = await supabase
      .from('niches_market_intelligence')
      .select('*', { count: 'exact' })
    
    console.log(`[CHECK MI] Found ${count} records`)
    console.log(`[CHECK MI] Data:`, data)
    
    if (error) {
      console.error('[CHECK MI] Error:', error)
    }
    
    // Also check if there are any niches that these records reference
    const nicheIds = data ? [...new Set(data.map(row => row.niche_id))] : []
    const nicheCheck: any = {}
    
    for (const nicheId of nicheIds) {
      const { data: nicheExists, error: nicheError } = await supabase
        .from('niches')
        .select('id, niche_name')
        .eq('id', nicheId)
        .maybeSingle()
      
      nicheCheck[nicheId] = {
        exists: !!nicheExists,
        niche: nicheExists,
        error: nicheError?.message
      }
    }
    
    return NextResponse.json({
      success: true,
      count,
      data,
      nicheIds,
      nicheCheck,
      error: error?.message
    })
  } catch (error) {
    console.error('[CHECK MI] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}