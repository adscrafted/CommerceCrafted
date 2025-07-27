import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const testResults = {
    keepaFetch: { success: false, data: null as any, error: null as any },
    databaseWrite: { success: false, data: null as any, error: null as any },
    databaseVerify: { success: false, data: null as any, error: null as any },
    priceHistoryVerify: { success: false, count: 0, error: null as any },
    bsrHistoryVerify: { success: false, count: 0, error: null as any }
  }

  try {
    // Test ASIN
    const asin = 'B07PFFMP9P'
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('=== Starting End-to-End Keepa Test ===')
    console.log('Test ASIN:', asin)
    
    // Step 1: Fetch from Keepa
    console.log('\n1. Fetching from Keepa API...')
    try {
      const keepaProduct = await keepaAPI.getProduct(asin)
      if (keepaProduct) {
        testResults.keepaFetch.success = true
        testResults.keepaFetch.data = {
          asin: keepaProduct.asin,
          title: keepaProduct.title,
          brand: keepaProduct.brand,
          hasCSV: !!keepaProduct.csv,
          csvLength: keepaProduct.csv?.length || 0
        }
        console.log('✅ Keepa fetch successful:', testResults.keepaFetch.data)
        
        // Transform data
        const transformedData = keepaAPI.transformForDatabase(keepaProduct)
        
        // Step 2: Write to database
        console.log('\n2. Writing to database...')
        try {
          // Check if product exists
          const { data: existing } = await supabase
            .from('product')
            .select('id')
            .eq('asin', asin)
            .maybeSingle()
          
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
          
          let productId: string
          
          if (existing) {
            // Update
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
            testResults.databaseWrite.data = { operation: 'update', productId }
          } else {
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
            testResults.databaseWrite.data = { operation: 'insert', productId }
          }
          
          testResults.databaseWrite.success = true
          console.log('✅ Database write successful:', testResults.databaseWrite.data)
          
          // Write price history (last 50 entries)
          if (transformedData.priceHistory.length > 0) {
            const priceData = transformedData.priceHistory.slice(-50).map(entry => ({
              product_id: productId,
              timestamp: entry.timestamp.toISOString(),
              price: entry.value,
              price_type: 'AMAZON'
            }))
            
            await supabase
              .from('product_price_history')
              .upsert(priceData, {
                onConflict: 'product_id,timestamp,price_type',
                ignoreDuplicates: true
              })
          }
          
          // Write BSR history (last 50 entries)
          if (transformedData.bsrHistory.length > 0) {
            const bsrData = transformedData.bsrHistory.slice(-50).map(entry => ({
              product_id: productId,
              timestamp: entry.timestamp.toISOString(),
              sales_rank: Math.round(entry.value),
              category: transformedData.category || 'Unknown'
            }))
            
            await supabase
              .from('product_sales_rank_history')
              .upsert(bsrData, {
                onConflict: 'product_id,timestamp,category',
                ignoreDuplicates: true
              })
          }
          
        } catch (error: any) {
          testResults.databaseWrite.error = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
          console.error('❌ Database write failed:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
        
      } else {
        testResults.keepaFetch.error = 'No product returned from Keepa'
        console.error('❌ Keepa fetch failed: No product returned')
      }
    } catch (error) {
      testResults.keepaFetch.error = error
      console.error('❌ Keepa fetch failed:', error)
    }
    
    // Step 3: Verify data was written
    console.log('\n3. Verifying database write...')
    try {
      const { data: product, error } = await supabase
        .from('product')
        .select('*')
        .eq('asin', asin)
        .single()
      
      if (error) throw error
      
      if (product) {
        testResults.databaseVerify.success = true
        testResults.databaseVerify.data = {
          id: product.id,
          asin: product.asin,
          title: product.title,
          brand: product.brand,
          price: product.price,
          bsr: product.bsr,
          hasDescription: !!product.description,
          hasBulletPoints: !!product.bullet_points && product.bullet_points.length > 0,
          hasDimensions: !!product.dimensions && Object.keys(product.dimensions).length > 0,
          lastKeepaSync: product.last_keepa_sync
        }
        console.log('✅ Database verification successful:', testResults.databaseVerify.data)
        
        // Verify price history
        const { data: priceHistory, error: priceError } = await supabase
          .from('product_price_history')
          .select('timestamp, price')
          .eq('product_id', product.id)
          .order('timestamp', { ascending: false })
          .limit(5)
        
        if (!priceError && priceHistory) {
          testResults.priceHistoryVerify.success = true
          testResults.priceHistoryVerify.count = priceHistory.length
          console.log(`✅ Price history verified: ${priceHistory.length} records`)
        }
        
        // Verify BSR history
        const { data: bsrHistory, error: bsrError } = await supabase
          .from('product_sales_rank_history')
          .select('timestamp, sales_rank')
          .eq('product_id', product.id)
          .order('timestamp', { ascending: false })
          .limit(5)
        
        if (!bsrError && bsrHistory) {
          testResults.bsrHistoryVerify.success = true
          testResults.bsrHistoryVerify.count = bsrHistory.length
          console.log(`✅ BSR history verified: ${bsrHistory.length} records`)
        }
      }
    } catch (error) {
      testResults.databaseVerify.error = error
      console.error('❌ Database verification failed:', error)
    }
    
    console.log('\n=== Test Complete ===')
    
    // Generate summary
    const summary = {
      success: testResults.keepaFetch.success && 
               testResults.databaseWrite.success && 
               testResults.databaseVerify.success,
      asin: asin,
      results: testResults
    }
    
    return NextResponse.json(summary, { 
      status: summary.success ? 200 : 500 
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: testResults
    }, { status: 500 })
  }
}