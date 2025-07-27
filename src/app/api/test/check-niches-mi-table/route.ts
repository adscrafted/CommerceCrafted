import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // First, check if we can query the table
    const { data: rows, error: queryError } = await supabase
      .from('niches_market_intelligence')
      .select('*')
    
    if (queryError) {
      return NextResponse.json({
        error: 'Query failed',
        details: queryError,
        tableName: 'niches_market_intelligence'
      }, { status: 500 })
    }
    
    // Check for existing data for our niche
    const { data: existing, error: existingError } = await supabase
      .from('niches_market_intelligence')
      .select('*')
      .eq('niche_id', 'saffron_supplements_1753403777466')
      .single()
    
    return NextResponse.json({
      success: true,
      tableName: 'niches_market_intelligence',
      totalRows: rows?.length || 0,
      existingNicheData: existing || null,
      existingError: existingError?.message || null
    })
  } catch (error) {
    console.error('Error checking table:', error)
    return NextResponse.json({ 
      error: 'Failed to check table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}