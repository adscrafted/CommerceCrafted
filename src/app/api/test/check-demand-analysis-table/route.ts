import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if niches_demand_analysis table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .limit(1)
    
    if (tableError) {
      return NextResponse.json({
        tableExists: false,
        error: tableError.message,
        needsCreation: true
      })
    }
    
    // Get column information
    const sampleRow = tableCheck?.[0]
    const columns = sampleRow ? Object.keys(sampleRow) : []
    
    return NextResponse.json({
      tableExists: true,
      hasData: tableCheck && tableCheck.length > 0,
      columns: columns,
      sampleRow: sampleRow || null,
      requiredColumns: [
        'id',
        'niche_id',
        'market_insights',
        'pricing_trends',
        'seasonality_insights',
        'social_signals',
        'analysis_date',
        'created_at',
        'updated_at'
      ]
    })
  } catch (error) {
    console.error('Error checking demand analysis table:', error)
    return NextResponse.json({ 
      error: 'Failed to check table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}