import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[CHECK ASINS] Starting ASIN check')
    
    const supabase = await createServerSupabaseClient()
    
    // ASINs the user mentioned
    const testAsins = [
      'B0CFZLNC5F', 'B07TK5K5TQ', 'B0DM2N7RNF', 'B0C3MWF7F1', 'B0BJD1QW9X', 
      'B07FB6NR8V', 'B0DXPWCY8W', 'B00L5Q951S', 'B08PMJFLP8', 'B0DM43FG22'
    ]
    
    const results: any = {}
    
    // Check each table for these ASINs
    const tables = ['product_keywords', 'product_api_cache', 'product_customer_reviews_cache']
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('asin', { count: 'exact' })
          .in('asin', testAsins)
        
        results[table] = {
          count: count || 0,
          data: data || [],
          error: error?.message
        }
        
        console.log(`[CHECK ASINS] ${table}: found ${count} records for test ASINs`)
      } catch (e) {
        results[table] = {
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    // Also check what niches currently use these ASINs
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('id, niche_name, asins')
    
    const nichesUsingTestAsins: any[] = []
    if (niches) {
      for (const niche of niches) {
        if (niche.asins) {
          const nicheAsins = niche.asins.split(',').map((asin: string) => asin.trim())
          const matchingAsins = nicheAsins.filter((asin: string) => testAsins.includes(asin))
          if (matchingAsins.length > 0) {
            nichesUsingTestAsins.push({
              id: niche.id,
              name: niche.niche_name,
              matchingAsins
            })
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      testAsins,
      results,
      nichesUsingTestAsins,
      totalNiches: niches?.length || 0
    })
  } catch (error) {
    console.error('[CHECK ASINS] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}