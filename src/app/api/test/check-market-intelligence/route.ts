import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if market_intelligence table has any data
    const { data: marketIntelligence, error: miError, count } = await supabase
      .from('market_intelligence')
      .select('*', { count: 'exact' })
      .limit(5)
    
    if (miError) {
      return NextResponse.json({ 
        error: 'Error querying market_intelligence table', 
        details: miError 
      }, { status: 500 })
    }
    
    // Also check niches_overall_analysis for any related data
    const { data: nichesAnalysis, error: naError } = await supabase
      .from('niches_overall_analysis')
      .select('*')
      .limit(5)
    
    return NextResponse.json({
      market_intelligence: {
        count: count || 0,
        hasData: (count || 0) > 0,
        sample: marketIntelligence || []
      },
      niches_overall_analysis: {
        count: nichesAnalysis?.length || 0,
        sample: nichesAnalysis || []
      }
    })
  } catch (error) {
    console.error('Error checking market intelligence:', error)
    return NextResponse.json({ 
      error: 'Failed to check market intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}