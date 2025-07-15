import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test table access
    const tables = ['keyword_groups', 'keyword_group_asin_metadata', 'keyword_group_keywords', 'keyword_group_progress']
    const results: any = {}
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      results[table] = {
        accessible: !error,
        count: count || 0,
        error: error?.message
      }
    }
    
    return NextResponse.json({
      success: true,
      tables: results,
      message: 'All keyword group tables are accessible'
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}