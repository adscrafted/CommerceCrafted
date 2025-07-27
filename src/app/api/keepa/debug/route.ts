import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    console.log('Fetching from Keepa with debug mode...')
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Save raw Keepa response for debugging
    const debugDir = path.join(process.cwd(), 'logs', 'keepa-debug')
    await fs.mkdir(debugDir, { recursive: true })
    
    const debugFile = path.join(debugDir, `${asin}-${Date.now()}.json`)
    await fs.writeFile(debugFile, JSON.stringify(keepaProduct, null, 2))
    
    console.log(`Debug data saved to: ${debugFile}`)
    
    // Transform data
    const transformedData = keepaAPI.transformForDatabase(keepaProduct)
    
    // Get product from database to see what was stored
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: dbProduct } = await supabase
      .from('product')
      .select('*')
      .eq('asin', asin)
      .single()
    
    return NextResponse.json({
      asin: asin,
      keepaResponse: {
        hasData: !!keepaProduct,
        title: keepaProduct.title,
        brand: keepaProduct.brand,
        manufacturer: keepaProduct.manufacturer,
        features: keepaProduct.features,
        description: keepaProduct.description,
        imagesCSV: keepaProduct.imagesCSV,
        images: keepaProduct.images,
        image: keepaProduct.image,
        csvLength: keepaProduct.csv?.length || 0,
        hasStats: !!keepaProduct.stats,
        currentStats: keepaProduct.stats?.current,
        dimensions: {
          packageLength: keepaProduct.packageLength,
          packageWidth: keepaProduct.packageWidth,
          packageHeight: keepaProduct.packageHeight,
          packageWeight: keepaProduct.packageWeight,
          itemLength: keepaProduct.itemLength,
          itemWidth: keepaProduct.itemWidth,
          itemHeight: keepaProduct.itemHeight,
          itemWeight: keepaProduct.itemWeight
        }
      },
      transformedData: {
        currentPrice: transformedData.currentPrice,
        currentBsr: transformedData.currentBsr,
        currentRating: transformedData.currentRating,
        currentReviewCount: transformedData.currentReviewCount,
        imageUrls: transformedData.imageUrls,
        bulletPoints: transformedData.bulletPoints,
        dimensions: transformedData.dimensions,
        priceHistoryLength: transformedData.priceHistory.length,
        bsrHistoryLength: transformedData.bsrHistory.length
      },
      databaseProduct: dbProduct ? {
        id: dbProduct.id,
        title: dbProduct.title,
        brand: dbProduct.brand,
        image_urls: dbProduct.image_urls,
        bullet_points: dbProduct.bullet_points,
        dimensions: dbProduct.dimensions
      } : null,
      debugFile: debugFile
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}