import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Try to query analysis_runs table
    const { data: analysisRuns, error: analysisError } = await supabase
      .from('analysis_runs')
      .select('*')
      .limit(1)
    
    // Check if table exists
    if (analysisError) {
      return NextResponse.json({
        analysis_runs_exists: false,
        error: analysisError.message,
        code: analysisError.code,
        hint: analysisError.hint
      })
    }
    
    // Get table columns
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', {
        table_name: 'analysis_runs'
      })
      .single()
    
    return NextResponse.json({
      analysis_runs_exists: true,
      sample_data: analysisRuns,
      columns: columns || 'Could not fetch columns',
      columns_error: columnsError
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}