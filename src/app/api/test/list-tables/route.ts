import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Query to get all tables in the public schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name')
    
    if (error) {
      // Fallback: try a different approach
      console.log('Information schema query failed, trying alternative approach')
      
      // List of known tables we can check
      const knownTables = [
        'users', 'product', 'niches', 
        'product_keywords', 'product_price_history', 'product_sales_rank_history',
        'product_review_history', 'product_customer_reviews', 'product_availability_history',
        'analysis_runs', 'niches_overall_analysis', 'market_intelligence'
      ]
      
      const existingTables = []
      
      for (const table of knownTables) {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(0)
        
        if (!tableError) {
          existingTables.push(table)
        }
      }
      
      return NextResponse.json({
        tables: existingTables,
        method: 'fallback'
      })
    }
    
    return NextResponse.json({
      tables: tables?.map(t => t.table_name) || [],
      method: 'information_schema',
      count: tables?.length || 0
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}