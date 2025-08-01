import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[SHOW DATA] Starting data check')
    
    const supabase = await createServerSupabaseClient()
    
    const results: any = {}
    
    // Check product_api_cache first since we know it has asin column
    try {
      const { data: cacheData, error: cacheError, count: cacheCount } = await supabase
        .from('product_api_cache')
        .select('*', { count: 'exact' })
        .limit(3)
      
      results.product_api_cache = {
        count: cacheCount || 0,
        data: cacheData || [],
        error: cacheError?.message,
        columns: cacheData && cacheData.length > 0 ? Object.keys(cacheData[0]) : []
      }
    } catch (e) {
      results.product_api_cache = {
        error: e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // Try product_keywords with different possible column names
    const possibleAsinColumns = ['asin', 'product_asin', 'product_id', 'amazon_asin']
    
    for (const columnName of possibleAsinColumns) {
      try {
        const { data, error, count } = await supabase
          .from('product_keywords')
          .select(`${columnName}`, { count: 'exact' })
          .limit(1)
        
        if (!error) {
          results.product_keywords = {
            asin_column: columnName,
            count: count || 0,
            error: null
          }
          break
        }
      } catch (e) {
        // Continue to next column name
      }
    }
    
    if (!results.product_keywords) {
      // Try to get any data to see column structure
      try {
        const { data, error } = await supabase
          .from('product_keywords')
          .select('*')
          .limit(1)
        
        results.product_keywords = {
          columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          count: data?.length || 0,
          error: error?.message
        }
      } catch (e) {
        results.product_keywords = {
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    // Similar for reviews cache
    for (const columnName of possibleAsinColumns) {
      try {
        const { data, error, count } = await supabase
          .from('product_customer_reviews_cache')
          .select(`${columnName}`, { count: 'exact' })
          .limit(1)
        
        if (!error) {
          results.product_customer_reviews_cache = {
            asin_column: columnName,
            count: count || 0,
            error: null
          }
          break
        }
      } catch (e) {
        // Continue to next column name
      }
    }
    
    if (!results.product_customer_reviews_cache) {
      try {
        const { data, error } = await supabase
          .from('product_customer_reviews_cache')
          .select('*')
          .limit(1)
        
        results.product_customer_reviews_cache = {
          columns: data && data.length > 0 ? Object.keys(data[0]) : [],
          count: data?.length || 0,
          error: error?.message
        }
      } catch (e) {
        results.product_customer_reviews_cache = {
          error: e instanceof Error ? e.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('[SHOW DATA] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}