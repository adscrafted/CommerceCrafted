import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { keepaAPI } from '@/lib/integrations/keepa'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Skip auth checks in development mode
    if (process.env.NODE_ENV !== 'development') {
      // In production, add auth checks here
      console.log('Production mode: Auth checks would be performed here')
    }

    console.log('Syncing Keepa data for ASIN:', asin)

    // Fetch data from Keepa
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json(
        { error: 'Product not found in Keepa' },
        { status: 404 }
      )
    }

    // Transform data for our database
    const transformedData = keepaAPI.transformForDatabase(keepaProduct)

    // Update product table with current data
    const { error: productError } = await supabase
      .from('products')
      .update({
        price: transformedData.currentPrice,
        bsr: transformedData.currentBsr,
        rating: transformedData.currentRating,
        review_count: transformedData.currentReviewCount,
        updated_at: new Date().toISOString()
      })
      .eq('asin', asin)

    if (productError) {
      console.error('Error updating product:', productError)
    }

    // Store historical data in keepa_price_history
    const { error: historyError } = await supabase
      .from('keepa_price_history')
      .upsert({
        asin: asin,
        price_data: transformedData.priceHistory,
        sales_rank_data: transformedData.bsrHistory,
        rating_data: transformedData.ratingHistory,
        review_count_data: transformedData.reviewCountHistory,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'asin'
      })

    if (historyError) {
      console.error('Error storing price history:', historyError)
    }

    // Cache the raw Keepa data
    const cacheExpiresAt = new Date()
    cacheExpiresAt.setHours(cacheExpiresAt.getHours() + 6) // Cache for 6 hours

    const { error: cacheError } = await supabase
      .from('amazon_api_cache')
      .upsert({
        asin: asin,
        data_type: 'keepa_product',
        raw_data: keepaProduct,
        processed_data: transformedData,
        cache_expires_at: cacheExpiresAt.toISOString(),
        api_source: 'keepa'
      }, {
        onConflict: 'asin,data_type'
      })

    if (cacheError) {
      console.error('Error caching Keepa data:', cacheError)
    }

    return NextResponse.json({
      success: true,
      asin: asin,
      data: {
        currentPrice: transformedData.currentPrice,
        currentBsr: transformedData.currentBsr,
        currentRating: transformedData.currentRating,
        currentReviewCount: transformedData.currentReviewCount,
        priceHistoryPoints: transformedData.priceHistory.length,
        bsrHistoryPoints: transformedData.bsrHistory.length,
        lastUpdated: transformedData.lastUpdated
      }
    })

  } catch (error) {
    console.error('Error syncing Keepa data:', error)
    return NextResponse.json(
      { error: 'Failed to sync Keepa data' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Get cached Keepa data
    const { data: cachedData, error } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin)
      .eq('data_type', 'keepa_product')
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (error || !cachedData) {
      return NextResponse.json(
        { error: 'No cached Keepa data found. Try syncing first.' },
        { status: 404 }
      )
    }

    // Get price history
    const { data: priceHistory, error: historyError } = await supabase
      .from('keepa_price_history')
      .select('*')
      .eq('asin', asin)
      .single()

    return NextResponse.json({
      asin: asin,
      cachedAt: cachedData.created_at,
      expiresAt: cachedData.cache_expires_at,
      rawData: cachedData.raw_data,
      processedData: cachedData.processed_data,
      priceHistory: priceHistory?.price_data || [],
      salesRankHistory: priceHistory?.sales_rank_data || [],
      ratingHistory: priceHistory?.rating_data || [],
      reviewCountHistory: priceHistory?.review_count_data || []
    })

  } catch (error) {
    console.error('Error fetching Keepa data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Keepa data' },
      { status: 500 }
    )
  }
}