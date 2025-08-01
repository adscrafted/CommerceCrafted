import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[CHECK COLUMNS] Starting column check')
    
    const supabase = await createServerSupabaseClient()
    
    // Query the information schema to get column information
    const tables = ['product_keywords', 'product_api_cache', 'product_customer_reviews_cache']
    const columnInfo: any = {}
    
    for (const table of tables) {
      try {
        // Use raw SQL to query information schema
        const { data, error } = await supabase.rpc('execute_sql', {
          query: `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = '${table}' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
          `
        })
        
        if (error) {
          // If RPC doesn't work, try a different approach
          console.log(`[CHECK COLUMNS] RPC failed for ${table}, trying direct query`)
          
          // Try to create a dummy insert to see what columns are expected
          const { error: insertError } = await supabase
            .from(table)
            .insert({})
          
          columnInfo[table] = {
            exists: true,
            columns: 'unknown',
            insertError: insertError?.message
          }
        } else {
          columnInfo[table] = {
            exists: true,
            columns: data || [],
            error: null
          }
        }
        
      } catch (e) {
        columnInfo[table] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      columnInfo
    })
  } catch (error) {
    console.error('[CHECK COLUMNS] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}