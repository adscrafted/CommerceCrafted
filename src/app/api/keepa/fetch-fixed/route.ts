import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    // Create a direct Supabase client
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
    
    console.log('4. Checking if product exists...')
    // Check if product exists
    const { data: existingProduct, error: selectError } = await supabase
      .from('products')
      .select('id')
      .eq('asin', asin)
      .maybeSingle()
    
    if (selectError) {
      console.error('Select error:', selectError)
      return NextResponse.json({ error: 'Select failed', details: selectError }, { status: 500 })
    }
    
    let productId: string
    
    // Prepare product data without keepa_data first (might be too large)
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
      fba_fees: transformedData.fbaFees,
      last_keepa_sync: new Date().toISOString()
    }
    
    if (existingProduct) {
      console.log('5. Updating existing product...')
      // Update existing product
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('asin', asin)
        .select('id')
        .single()
      
      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Update failed', details: updateError }, { status: 500 })
      }
      
      productId = updatedProduct.id
      console.log('6. Product updated successfully')
    } else {
      console.log('5. Creating new product...')
      // Create new product
      const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single()
      
      if (createError) {
        console.error('Create error:', createError)
        return NextResponse.json({ error: 'Create failed', details: createError }, { status: 500 })
      }
      
      productId = newProduct.id
      console.log('6. Product created successfully')
    }
    
    // Store minimal keepa data separately to avoid size issues
    console.log('7. Updating keepa_data separately...')
    const { error: keepaUpdateError } = await supabase
      .from('products')
      .update({
        keepa_data: {
          lastUpdate: transformedData.keepaData.lastUpdate,
          csv_length: transformedData.keepaData.csv?.length || 0,
          stats_current: transformedData.keepaData.stats?.current || [],
          tokensConsumed: 1
        }
      })
      .eq('id', productId)
    
    if (keepaUpdateError) {
      console.error('Keepa data update error:', keepaUpdateError)
      // Continue anyway, main data is saved
    }
    
    console.log('8. Storing price history...')
    // Store price history (skip if too many records)
    if (transformedData.priceHistory.length > 0 && transformedData.priceHistory.length < 1000) {
      const priceHistoryData = transformedData.priceHistory.slice(-100).map(entry => ({
        product_id: productId,
        timestamp: entry.timestamp.toISOString(),
        price: entry.value,
        price_type: 'AMAZON'
      }))
      
      const { error: priceError } = await supabase
        .from('keepa_price_history')
        .upsert(priceHistoryData, {
          onConflict: 'product_id,timestamp,price_type',
          ignoreDuplicates: true
        })
      
      if (priceError) {
        console.error('Price history error:', priceError)
        // Continue anyway
      }
    }
    
    console.log('9. Storing BSR history...')
    // Store sales rank history (skip if too many records)
    if (transformedData.bsrHistory.length > 0 && transformedData.bsrHistory.length < 1000) {
      const bsrHistoryData = transformedData.bsrHistory.slice(-100).map(entry => ({
        product_id: productId,
        timestamp: entry.timestamp.toISOString(),
        sales_rank: Math.round(entry.value),
        category: transformedData.category || 'Unknown'
      }))
      
      const { error: bsrError } = await supabase
        .from('keepa_sales_rank_history')
        .upsert(bsrHistoryData, {
          onConflict: 'product_id,timestamp,category',
          ignoreDuplicates: true
        })
      
      if (bsrError) {
        console.error('BSR history error:', bsrError)
        // Continue anyway
      }
    }
    
    console.log('10. Success!')
    return NextResponse.json({
      success: true,
      productId: productId,
      priceHistoryCount: Math.min(transformedData.priceHistory.length, 100),
      bsrHistoryCount: Math.min(transformedData.bsrHistory.length, 100),
      message: 'Product data saved successfully'
    })
    
  } catch (error) {
    console.error('Error in fetch-fixed:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}