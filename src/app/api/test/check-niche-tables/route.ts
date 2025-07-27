import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get list of all tables with 'niche' in the name
    const { data: tables, error } = await supabase
      .rpc('get_tables', {
        schema_name: 'public'
      })
    
    if (error) {
      // Try a different approach - query information_schema
      const { data: tableList, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%niche%')
      
      if (schemaError) {
        // Manual check of known tables
        const knownTables = [
          'niches',
          'niches_overall_analysis',
          'niche_market_intelligence',
          'niche_products'
        ]
        
        const tableInfo: any = {}
        
        for (const tableName of knownTables) {
          try {
            const { count, error } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
            
            tableInfo[tableName] = {
              exists: !error,
              error: error?.message,
              count: count || 0
            }
          } catch (e) {
            tableInfo[tableName] = {
              exists: false,
              error: 'Table does not exist'
            }
          }
        }
        
        return NextResponse.json({
          method: 'manual_check',
          tables: tableInfo
        })
      }
      
      return NextResponse.json({
        method: 'information_schema',
        tables: tableList
      })
    }
    
    return NextResponse.json({
      method: 'rpc',
      tables: tables
    })
  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json({ 
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}