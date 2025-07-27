import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Query to get column information for the table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'niches_market_intelligence' })
    
    if (columnsError) {
      // Try alternative approach - get columns from information_schema
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.columns' as any)
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'niches_market_intelligence')
        .eq('table_schema', 'public')
      
      if (schemaError) {
        // Last resort - try to query the table and see what we get
        const { data: sample, error: sampleError } = await supabase
          .from('niches_market_intelligence')
          .select('*')
          .limit(1)
        
        if (sampleError) {
          return NextResponse.json({
            error: 'Unable to get table structure',
            details: {
              rpc_error: columnsError?.message,
              schema_error: schemaError?.message,
              sample_error: sampleError?.message
            }
          }, { status: 500 })
        }
        
        // If we got a sample, extract column names from it
        const columnNames = sample && sample.length > 0 ? Object.keys(sample[0]) : []
        return NextResponse.json({
          method: 'sample',
          columns: columnNames,
          sample_row: sample?.[0] || null
        })
      }
      
      return NextResponse.json({
        method: 'information_schema',
        columns: schemaInfo
      })
    }
    
    return NextResponse.json({
      method: 'rpc',
      columns: columns
    })
  } catch (error) {
    console.error('Error checking table columns:', error)
    return NextResponse.json({ 
      error: 'Failed to check table columns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}