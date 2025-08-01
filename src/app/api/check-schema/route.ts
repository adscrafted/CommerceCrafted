import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[CHECK SCHEMA] Starting schema check')
    
    const supabase = await createServerSupabaseClient()
    
    const tables = ['product_keywords', 'product_api_cache', 'product_customer_reviews_cache']
    const schemaInfo: any = {}
    
    for (const table of tables) {
      try {
        // Get a sample record to see the column structure
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (data && data.length > 0) {
          schemaInfo[table] = {
            exists: true,
            columns: Object.keys(data[0]),
            sampleRecord: data[0]
          }
        } else {
          schemaInfo[table] = {
            exists: !error,
            columns: [],
            sampleRecord: null,
            error: error?.message
          }
        }
        
        console.log(`[CHECK SCHEMA] ${table} columns:`, schemaInfo[table].columns)
      } catch (e) {
        schemaInfo[table] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      schemaInfo
    })
  } catch (error) {
    console.error('[CHECK SCHEMA] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}