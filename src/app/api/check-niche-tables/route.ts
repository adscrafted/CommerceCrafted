import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[CHECK NICHE TABLES] Starting niche table check')
    
    const supabase = await createServerSupabaseClient()
    
    // Check for niche-related tables
    const possibleNicheTables = [
      'niches_competition_analysis',
      'niches_demand_analysis', 
      'niches_financial_analysis',
      'niches_keyword_analysis',
      'niches_launch_strategy',
      'niches_listing_optimization',
      'niches_market_intelligence',
      'niches_overall_analysis'
    ]
    
    const tableInfo: any = {}
    
    for (const table of possibleNicheTables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1)
        
        tableInfo[table] = {
          exists: !error,
          count: count || 0,
          columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          error: error?.message,
          sampleData: data?.[0] || null
        }
        
        console.log(`[CHECK NICHE TABLES] ${table}: exists=${!error}, count=${count}`)
      } catch (e) {
        tableInfo[table] = {
          exists: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      tableInfo
    })
  } catch (error) {
    console.error('[CHECK NICHE TABLES] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}