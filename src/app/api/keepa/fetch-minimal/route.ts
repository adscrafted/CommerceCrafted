import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    // Create a direct Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Fetching from Keepa...')
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    console.log('Transforming data...')
    const transformedData = keepaAPI.transformForDatabase(keepaProduct)
    
    // Just save basic product info without history
    const productData = {
      asin: asin,
      title: transformedData.title,
      brand: transformedData.brand,
      category: transformedData.category,
      subcategory: transformedData.subcategory,
      price: transformedData.currentPrice,
      rating: transformedData.currentRating,
      review_count: transformedData.currentReviewCount,
      image_urls: transformedData.imageUrls.join(','),
      bsr: transformedData.currentBsr,
      description: transformedData.description,
      bullet_points: transformedData.bulletPoints,
      dimensions: transformedData.dimensions,
      keepa_data: transformedData.keepaData,
      last_keepa_sync: new Date().toISOString()
    }
    
    console.log('Saving to database...')
    const { data, error } = await supabase
      .from('products')
      .upsert(productData, {
        onConflict: 'asin'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('Success!')
    return NextResponse.json({
      success: true,
      product: data,
      priceHistoryCount: transformedData.priceHistory.length,
      bsrHistoryCount: transformedData.bsrHistory.length
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}