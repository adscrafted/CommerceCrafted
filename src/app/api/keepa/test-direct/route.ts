import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    // Create a direct Supabase client with service key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    console.log('1. Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('2. Fetching from Keepa...')
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    console.log('3. Transforming data...')
    const transformedData = keepaAPI.transformForDatabase(keepaProduct)
    
    // First, delete any existing product to avoid conflicts
    console.log('4. Deleting existing product if any...')
    await supabase
      .from('products')
      .delete()
      .eq('asin', asin)
    
    // Now insert fresh
    console.log('5. Inserting new product...')
    const { data, error } = await supabase
      .from('products')
      .insert({
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
      })
      .select()
      .single()
    
    if (error) {
      console.error('6. Database error:', error)
      return NextResponse.json({ 
        error: 'Database error', 
        details: error,
        message: error.message,
        code: error.code 
      }, { status: 500 })
    }
    
    console.log('7. Success!')
    return NextResponse.json({
      success: true,
      product: data,
      priceHistoryCount: transformedData.priceHistory.length,
      bsrHistoryCount: transformedData.bsrHistory.length
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}