import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    console.log('Testing complete Keepa data extraction for ASIN:', asin)
    
    // Fetch raw Keepa data
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Transform for database
    const transformed = keepaAPI.transformForDatabase(keepaProduct)
    
    // Test database write
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Prepare product data for database
    const productData = {
      asin: transformed.asin,
      title: transformed.title,
      brand: transformed.brand,
      category: transformed.category,
      subcategory: transformed.subcategory,
      description: transformed.description,
      bullet_points: transformed.bulletPoints,
      image_urls: transformed.imageUrls,
      dimensions: transformed.dimensions,
      price: transformed.currentPrice,
      bsr: transformed.currentBsr,
      rating: transformed.currentRating,
      review_count: transformed.currentReviewCount,
      fba_fees: transformed.fbaFees,
      keepa_data: {
        ...transformed.keepaData,
        frequentlyBoughtTogether: transformed.frequentlyBoughtTogether,
        parentAsin: transformed.parentAsin,
        productGroup: transformed.productGroup,
        productGroupType: transformed.productGroupType,
        listedSince: transformed.listedSince?.toISOString()
      },
      last_keepa_sync: new Date().toISOString()
    }
    
    // First check if product exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('asin', transformed.asin)
      .single()
    
    let dbProduct
    
    if (existingProduct) {
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProduct.id)
        .select()
        .single()
      
      if (error) throw error
      dbProduct = data
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert([{
          id: crypto.randomUUID(),
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      dbProduct = data
    }
    
    // Store time series data
    const timeSeries = []
    
    // Price history
    if (transformed.priceHistory && transformed.priceHistory.length > 0) {
      transformed.priceHistory.forEach(point => {
        timeSeries.push({
          id: crypto.randomUUID(),
          product_id: dbProduct.id,
          metric_type: 'price',
          value: point.value,
          timestamp: point.timestamp.toISOString(),
          created_at: new Date().toISOString()
        })
      })
    }
    
    // BSR history
    if (transformed.bsrHistory && transformed.bsrHistory.length > 0) {
      transformed.bsrHistory.forEach(point => {
        timeSeries.push({
          id: crypto.randomUUID(),
          product_id: dbProduct.id,
          metric_type: 'bsr',
          value: point.value,
          timestamp: point.timestamp.toISOString(),
          created_at: new Date().toISOString()
        })
      })
    }
    
    // Rating history
    if (transformed.ratingHistory && transformed.ratingHistory.length > 0) {
      transformed.ratingHistory.forEach(point => {
        timeSeries.push({
          id: crypto.randomUUID(),
          product_id: dbProduct.id,
          metric_type: 'rating',
          value: point.value,
          timestamp: point.timestamp.toISOString(),
          created_at: new Date().toISOString()
        })
      })
    }
    
    // Review count history
    if (transformed.reviewCountHistory && transformed.reviewCountHistory.length > 0) {
      transformed.reviewCountHistory.forEach(point => {
        timeSeries.push({
          id: crypto.randomUUID(),
          product_id: dbProduct.id,
          metric_type: 'review_count',
          value: point.value,
          timestamp: point.timestamp.toISOString(),
          created_at: new Date().toISOString()
        })
      })
    }
    
    // Insert time series data in batches
    if (timeSeries.length > 0) {
      const batchSize = 100
      for (let i = 0; i < timeSeries.length; i += batchSize) {
        const batch = timeSeries.slice(i, i + batchSize)
        const { error: tsError } = await supabase
          .from('product_time_series')
          .insert(batch)
        
        if (tsError) {
          console.error('Time series insert error:', tsError)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      product: {
        asin: transformed.asin,
        title: transformed.title,
        brand: transformed.brand,
        brandStoreName: transformed.brandStoreName,
        brandStoreUrl: transformed.brandStoreUrl,
        currentPrice: transformed.currentPrice,
        currentBsr: transformed.currentBsr,
        currentRating: transformed.currentRating,
        currentReviewCount: transformed.currentReviewCount,
        listedSince: transformed.listedSince,
        productGroup: transformed.productGroup,
        productGroupType: transformed.productGroupType,
        frequentlyBoughtTogether: transformed.frequentlyBoughtTogether,
        parentAsin: transformed.parentAsin,
        imageCount: transformed.imageUrls.length,
        bulletPointCount: transformed.bulletPoints.length,
        dimensions: transformed.dimensions,
        priceHistoryPoints: transformed.priceHistory.length,
        bsrHistoryPoints: transformed.bsrHistory.length,
        ratingHistoryPoints: transformed.ratingHistory.length,
        reviewCountHistoryPoints: transformed.reviewCountHistory.length
      },
      database: {
        productId: dbProduct.id,
        timeSeriesCount: timeSeries.length
      }
    })
    
  } catch (error) {
    console.error('Test complete data error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}