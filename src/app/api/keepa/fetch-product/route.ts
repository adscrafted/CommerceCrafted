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
    const { data: existingProduct } = await supabase
      .from('product')
      .select('id')
      .eq('asin', asin)
      .maybeSingle()
    
    let productId: string
    
    const productData = {
      asin: asin,
      title: transformedData.title || 'Unknown Product',
      brand: transformedData.brand,
      category: transformedData.category,
      subcategory: transformedData.subcategory,
      price: transformedData.currentPrice,
      rating: transformedData.currentRating,
      review_count: transformedData.currentReviewCount,
      image_urls: transformedData.imageUrls.join(','),
      bsr: transformedData.currentBsr,
      description: transformedData.description,
      bullet_points: transformedData.bulletPoints || [],
      dimensions: transformedData.dimensions || {},
      fba_fees: transformedData.fbaFees || {},
      last_keepa_sync: new Date().toISOString()
    }
    
    if (existingProduct) {
      console.log('5. Updating existing product...')
      // Update existing product
      const { data, error } = await supabase
        .from('product')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('asin', asin)
        .select('id')
        .single()
      
      if (error) throw error
      productId = data.id
    } else {
      console.log('5. Creating new product...')
      // Insert - generate UUID in JavaScript since extension is missing
      const newId = crypto.randomUUID()
      const { data, error } = await supabase
        .from('product')
        .insert([
          {
            id: newId,
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single()
      
      if (error) throw error
      productId = data.id
    }
    
    console.log('6. Product saved successfully')
    
    // Store extended keepa_data with all new fields
    console.log('7. Updating keepa_data...')
    const { error: keepaUpdateError } = await supabase
      .from('product')
      .update({
        keepa_data: {
          lastUpdate: transformedData.keepaData.lastUpdate,
          csv_length: transformedData.keepaData.csv?.length || 0,
          stats_current: transformedData.keepaData.stats?.current || [],
          tokensConsumed: 1,
          brandStoreName: transformedData.brandStoreName,
          brandStoreUrl: transformedData.brandStoreUrl,
          productGroup: transformedData.productGroup,
          productGroupType: transformedData.productGroupType,
          parentAsin: transformedData.parentAsin,
          listedSince: transformedData.listedSince?.toISOString(),
          frequentlyBoughtTogether: transformedData.frequentlyBoughtTogether,
          model: transformedData.model,
          partNumber: transformedData.partNumber,
          color: transformedData.color,
          size: transformedData.size,
          eanList: transformedData.eanList,
          upcList: transformedData.upcList,
          gtinList: transformedData.gtinList
        }
      })
      .eq('id', productId)
    
    if (keepaUpdateError) {
      console.error('Keepa data update error:', keepaUpdateError)
      // Continue anyway, main data is saved
    }
    
    // Write ALL price history entries
    if (transformedData.priceHistory.length > 0) {
      console.log(`8. Storing price history (${transformedData.priceHistory.length} entries)...`)
      const priceData = transformedData.priceHistory.map(entry => ({
        product_id: productId,
        timestamp: entry.timestamp.toISOString(),
        price: entry.value,
        price_type: 'AMAZON'
      }))
      
      // Batch insert in chunks of 1000 to avoid database limits
      const priceChunks = []
      for (let i = 0; i < priceData.length; i += 1000) {
        priceChunks.push(priceData.slice(i, i + 1000))
      }
      
      for (const [index, chunk] of priceChunks.entries()) {
        console.log(`   Inserting price chunk ${index + 1}/${priceChunks.length}...`)
        const { error: priceError } = await supabase
          .from('product_price_history')
          .upsert(chunk, {
            onConflict: 'product_id,timestamp,price_type',
            ignoreDuplicates: true
          })
        
        if (priceError) {
          console.error('Price history error:', priceError)
          // Continue anyway
        }
      }
    }
    
    // Write ALL BSR history entries
    if (transformedData.bsrHistory.length > 0) {
      console.log(`9. Storing BSR history (${transformedData.bsrHistory.length} entries)...`)
      const bsrData = transformedData.bsrHistory.map(entry => ({
        product_id: productId,
        timestamp: entry.timestamp.toISOString(),
        sales_rank: Math.round(entry.value),
        category: transformedData.category || 'Unknown'
      }))
      
      // Batch insert in chunks of 1000 to avoid database limits
      const bsrChunks = []
      for (let i = 0; i < bsrData.length; i += 1000) {
        bsrChunks.push(bsrData.slice(i, i + 1000))
      }
      
      for (const [index, chunk] of bsrChunks.entries()) {
        console.log(`   Inserting BSR chunk ${index + 1}/${bsrChunks.length}...`)
        const { error: bsrError } = await supabase
          .from('product_sales_rank_history')
          .upsert(chunk, {
            onConflict: 'product_id,timestamp,category',
            ignoreDuplicates: true
          })
        
        if (bsrError) {
          console.error('BSR history error:', bsrError)
          // Continue anyway
        }
      }
    }

    // Write ALL review history entries
    if (transformedData.reviewHistory && transformedData.reviewHistory.length > 0) {
      console.log(`10. Storing review history (${transformedData.reviewHistory.length} entries)...`)
      const reviewData = transformedData.reviewHistory.map(entry => ({
        product_id: productId,
        asin: asin,
        review_count: entry.reviewCount || 0,
        rating: entry.rating || 0,
        review_count_amazon: entry.reviewCountAmazon || entry.reviewCount || 0,
        rating_amazon: entry.ratingAmazon || entry.rating || 0,
        timestamp: entry.timestamp.toISOString(),
        keepa_timestamp: entry.keepaTimestamp || Math.floor(entry.timestamp.getTime() / 1000)
      }))
      
      const { error: reviewError } = await supabase
        .from('product_review_history')
        .upsert(reviewData, {
          onConflict: 'product_id,timestamp',
          ignoreDuplicates: true
        })
      
      if (reviewError) {
        console.error('Review history error:', reviewError)
        // Continue anyway
      }
    }
    
    console.log('11. Success!')
    return NextResponse.json({
      source: 'api',
      productId: productId,
      data: transformedData,
      rawKeepaData: keepaProduct
    })
    
  } catch (error: any) {
    console.error('Error in Keepa fetch endpoint:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if product exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asin = searchParams.get('asin')

    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }

    // Create a direct Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if product exists in database
    const { data: product } = await supabase
      .from('product')
      .select('*')
      .eq('asin', asin)
      .single()

    if (!product) {
      return NextResponse.json({ exists: false })
    }

    // Transform database data back to the expected format
    const transformedData = {
      asin: product.asin,
      title: product.title,
      brand: product.brand,
      brandStoreName: product.keepa_data?.brandStoreName,
      brandStoreUrl: product.keepa_data?.brandStoreUrl,
      category: product.category,
      subcategory: product.subcategory,
      productGroup: product.keepa_data?.productGroup,
      productGroupType: product.keepa_data?.productGroupType,
      parentAsin: product.keepa_data?.parentAsin,
      listedSince: product.keepa_data?.listedSince,
      frequentlyBoughtTogether: product.keepa_data?.frequentlyBoughtTogether || [],
      description: product.description,
      bulletPoints: product.bullet_points || [],
      model: product.keepa_data?.model,
      partNumber: product.keepa_data?.partNumber,
      color: product.keepa_data?.color,
      size: product.keepa_data?.size,
      eanList: product.keepa_data?.eanList || [],
      upcList: product.keepa_data?.upcList || [],
      gtinList: product.keepa_data?.gtinList || [],
      dimensions: product.dimensions,
      fbaFees: product.fba_fees,
      imageUrls: product.image_urls ? product.image_urls.split(',') : [],
      currentPrice: product.price,
      currentBsr: product.bsr,
      currentRating: product.rating,
      currentReviewCount: product.review_count,
      keepaData: product.keepa_data
    }

    return NextResponse.json({
      exists: true,
      source: 'cache',
      data: transformedData,
      product: product,
      lastSync: product.last_keepa_sync
    })

  } catch (error) {
    console.error('Error checking product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}