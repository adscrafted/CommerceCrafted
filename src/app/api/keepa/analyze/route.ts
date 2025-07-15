import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    console.log('Fetching from Keepa...')
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Save full raw response
    const debugDir = path.join(process.cwd(), 'logs', 'keepa-analysis')
    await fs.mkdir(debugDir, { recursive: true })
    
    const debugFile = path.join(debugDir, `${asin}-${Date.now()}.json`)
    await fs.writeFile(debugFile, JSON.stringify(keepaProduct, null, 2))
    
    // Analyze what fields are available
    const analysis = {
      asin: keepaProduct.asin,
      hasTitle: !!keepaProduct.title,
      title: keepaProduct.title,
      
      hasBrand: !!keepaProduct.brand,
      brand: keepaProduct.brand,
      
      hasManufacturer: !!keepaProduct.manufacturer,
      manufacturer: keepaProduct.manufacturer,
      
      // Images
      hasImagesCSV: !!keepaProduct.imagesCSV,
      imagesCSV: keepaProduct.imagesCSV,
      hasImage: !!keepaProduct.image,
      image: keepaProduct.image,
      hasImagesArray: !!keepaProduct.images,
      images: keepaProduct.images,
      
      // Features/Description
      hasFeatures: !!keepaProduct.features,
      features: keepaProduct.features,
      hasDescription: !!keepaProduct.description,
      description: keepaProduct.description,
      
      // Dimensions
      packageDimensions: {
        length: keepaProduct.packageLength,
        width: keepaProduct.packageWidth,
        height: keepaProduct.packageHeight,
        weight: keepaProduct.packageWeight
      },
      itemDimensions: {
        length: keepaProduct.itemLength,
        width: keepaProduct.itemWidth,
        height: keepaProduct.itemHeight,
        weight: keepaProduct.itemWeight
      },
      
      // Stats
      hasStats: !!keepaProduct.stats,
      statsCurrentLength: keepaProduct.stats?.current?.length || 0,
      currentStats: keepaProduct.stats?.current,
      
      // CSV Data
      hasCSV: !!keepaProduct.csv,
      csvLength: keepaProduct.csv?.length || 0,
      csvIndices: keepaProduct.csv ? Object.keys(keepaProduct.csv).map(k => ({
        index: k,
        hasData: !!keepaProduct.csv[k],
        dataLength: Array.isArray(keepaProduct.csv[k]) ? keepaProduct.csv[k].length : 0
      })) : [],
      
      // Additional fields
      categoryTree: keepaProduct.categoryTree,
      rootCategory: keepaProduct.rootCategory,
      productType: keepaProduct.productType,
      binding: keepaProduct.binding,
      model: keepaProduct.model,
      color: keepaProduct.color,
      size: keepaProduct.size,
      partNumber: keepaProduct.partNumber,
      
      // All available keys
      allKeys: Object.keys(keepaProduct).sort()
    }
    
    // Transform the data
    const transformed = keepaAPI.transformForDatabase(keepaProduct)
    
    return NextResponse.json({
      rawDataAnalysis: analysis,
      transformedData: {
        title: transformed.title,
        brand: transformed.brand,
        currentPrice: transformed.currentPrice,
        currentBsr: transformed.currentBsr,
        currentRating: transformed.currentRating,
        currentReviewCount: transformed.currentReviewCount,
        imageUrls: transformed.imageUrls,
        bulletPoints: transformed.bulletPoints,
        dimensions: transformed.dimensions,
        priceHistoryLength: transformed.priceHistory.length,
        bsrHistoryLength: transformed.bsrHistory.length
      },
      debugFile: debugFile,
      message: 'Check the analysis to see what fields Keepa actually returned'
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}