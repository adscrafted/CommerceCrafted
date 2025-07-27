import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    const keepaApiKey = process.env.KEEPA_API_KEY
    if (!keepaApiKey) {
      return NextResponse.json({ error: 'Keepa API key not configured' }, { status: 500 })
    }
    
    // Make direct API call to Keepa
    const url = `https://api.keepa.com/product?key=${keepaApiKey}&domain=1&asin=${asin}&stats=1&history=1&offers=20&fbafees=1&buybox=1&rating=1`
    
    console.log('Fetching from Keepa:', url.replace(keepaApiKey, 'KEY_HIDDEN'))
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.products || data.products.length === 0) {
      return NextResponse.json({ error: 'No product found' }, { status: 404 })
    }
    
    const product = data.products[0]
    
    // Check what's in the database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data: dbProduct } = await supabase
      .from('product')
      .select('*')
      .eq('asin', asin)
      .single()
    
    // Analyze the Keepa response
    const analysis = {
      asin: product.asin,
      productType: product.productType,
      productTypeDescription: ['STANDARD', 'DOWNLOADABLE', 'EBOOK', 'INACCESSIBLE', 'INVALID', 'VARIATION_PARENT'][product.productType] || 'UNKNOWN',
      
      basicInfo: {
        title: product.title,
        brand: product.brand,
        manufacturer: product.manufacturer,
        binding: product.binding,
        productGroup: product.productGroup
      },
      
      images: {
        hasImagesArray: !!product.images,
        imagesCount: product.images?.length || 0,
        firstImage: product.images?.[0] || null,
        imageUrls: product.images?.map(img => ({
          large: img.l ? `https://m.media-amazon.com/images/I/${img.l}` : null,
          medium: img.m ? `https://m.media-amazon.com/images/I/${img.m}` : null
        })) || []
      },
      
      categories: {
        rootCategory: product.rootCategory,
        categoryTree: product.categoryTree,
        categories: product.categories
      },
      
      features: {
        hasFeatures: !!product.features,
        featureCount: product.features?.length || 0,
        features: product.features || []
      },
      
      dimensions: {
        package: {
          length: product.packageLength,
          width: product.packageWidth,
          height: product.packageHeight,
          weight: product.packageWeight
        },
        item: {
          length: product.itemLength,
          width: product.itemWidth,
          height: product.itemHeight,
          weight: product.itemWeight
        }
      },
      
      stats: {
        hasStats: !!product.stats,
        hasCurrentStats: !!product.stats?.current,
        currentStatsLength: product.stats?.current?.length || 0,
        currentPrice: product.stats?.current?.[0] !== -1 ? product.stats.current[0] / 100 : null,
        currentBSR: product.stats?.current?.[3] !== -1 ? product.stats.current[3] : null,
        currentRating: product.stats?.current?.[16] !== -1 ? product.stats.current[16] / 10 : null,
        currentReviews: product.stats?.current?.[17] !== -1 ? product.stats.current[17] : null
      },
      
      csv: {
        hasCSV: !!product.csv,
        csvLength: product.csv?.length || 0,
        csvDataTypes: product.csv?.map((data, idx) => ({
          index: idx,
          hasData: !!data && data.length > 0,
          dataPoints: data?.length || 0
        })).filter(item => item.hasData) || []
      },
      
      databaseProduct: dbProduct ? {
        id: dbProduct.id,
        price: dbProduct.price,
        rating: dbProduct.rating,
        review_count: dbProduct.review_count,
        image_urls: dbProduct.image_urls,
        bullet_points: dbProduct.bullet_points
      } : null
    }
    
    return NextResponse.json({
      keepaResponse: analysis,
      rawProduct: product
    })
    
  } catch (error) {
    console.error('Diagnose error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}