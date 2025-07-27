import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { amazonSpApi } from '@/lib/integrations/amazon-sp-api'

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

    console.log('Syncing SP-API data for ASIN:', asin)

    // Fetch data from Amazon SP-API
    const spApiData = await amazonSpApi.getCompleteProductData(asin)
    
    if (!spApiData) {
      return NextResponse.json(
        { error: 'Product not found in SP-API' },
        { status: 404 }
      )
    }

    console.log('SP-API data fetched for:', spApiData.title)

    // Update product table with SP-API data
    const { error: productError } = await supabase
      .from('product')
      .update({
        title: spApiData.title,
        brand: spApiData.brand,
        manufacturer: spApiData.manufacturer,
        category: spApiData.category,
        color: spApiData.color,
        size: spApiData.size,
        price: spApiData.price,
        listing_price: spApiData.listingPrice,
        shipping_price: spApiData.shippingPrice,
        bsr: spApiData.bsr,
        bsr_category: spApiData.bsrCategory,
        main_image_url: spApiData.mainImageUrl,
        image_urls: spApiData.imageUrls,
        package_quantity: spApiData.packageQuantity,
        adult_product: spApiData.adultProduct,
        updated_at: new Date().toISOString()
      })
      .eq('asin', asin)

    if (productError) {
      console.error('Error updating product with SP-API data:', productError)
    } else {
      console.log('Product updated successfully with SP-API data')
    }

    // Cache the raw SP-API data
    const cacheExpiresAt = new Date()
    cacheExpiresAt.setHours(cacheExpiresAt.getHours() + 12) // Cache for 12 hours

    const { error: cacheError } = await supabase
      .from('product_api_cache')
      .upsert({
        asin: asin,
        data_type: 'sp_api_catalog',
        raw_data: spApiData.rawCatalogData,
        processed_data: {
          catalog: spApiData.rawCatalogData,
          pricing: spApiData.rawPricingData,
          transformed: spApiData
        },
        cache_expires_at: cacheExpiresAt.toISOString(),
        api_source: 'sp_api'
      }, {
        onConflict: 'asin,data_type'
      })

    if (cacheError) {
      console.error('Error caching SP-API data:', cacheError)
    }

    return NextResponse.json({
      success: true,
      asin: asin,
      data: {
        title: spApiData.title,
        brand: spApiData.brand,
        category: spApiData.category,
        price: spApiData.price,
        bsr: spApiData.bsr,
        bsrCategory: spApiData.bsrCategory,
        mainImageUrl: spApiData.mainImageUrl,
        lastUpdated: spApiData.lastUpdated
      }
    })

  } catch (error) {
    console.error('Error syncing SP-API data:', error)
    return NextResponse.json(
      { error: 'Failed to sync SP-API data', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Get cached SP-API data
    const { data: cachedData, error } = await supabase
      .from('product_api_cache')
      .select('*')
      .eq('asin', asin)
      .eq('data_type', 'sp_api_catalog')
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (error || !cachedData) {
      return NextResponse.json(
        { error: 'No cached SP-API data found. Try syncing first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      asin: asin,
      cachedAt: cachedData.created_at,
      expiresAt: cachedData.cache_expires_at,
      catalogData: cachedData.processed_data?.catalog || {},
      pricingData: cachedData.processed_data?.pricing || {},
      transformedData: cachedData.processed_data?.transformed || {}
    })

  } catch (error) {
    console.error('Error fetching SP-API data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SP-API data' },
      { status: 500 }
    )
  }
}