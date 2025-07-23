import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const asin = searchParams.get('asin') || 'B0CNQC2TWG'
  
  console.log(`\n🧪 DIRECT KEEPA TEST for ASIN: ${asin}`)
  
  try {
    // Test 1: Direct Keepa API call
    const KEEPA_API_KEY = process.env.KEEPA_API_KEY || '6bn3gia2gt7avkubb95fqquhnv20b2n81m387kfvkt9t583fteqte4pf1jtdh57b'
    const params = new URLSearchParams({
      key: KEEPA_API_KEY,
      domain: '1', // Amazon.com
      asin: asin,
      stats: '1',
      history: '1',
      offers: '20',
      rental: '0',
      rating: '1',
      update: '0'
    })
    
    const keepaUrl = `https://api.keepa.com/product?${params}`
    console.log(`📡 Calling Keepa API directly...`)
    console.log(`   URL: ${keepaUrl.substring(0, 100)}...`)
    
    const keepaResponse = await fetch(keepaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    console.log(`   Response status: ${keepaResponse.status}`)
    console.log(`   Response headers:`, Object.fromEntries(keepaResponse.headers.entries()))
    
    const responseText = await keepaResponse.text()
    console.log(`   Response length: ${responseText.length} characters`)
    
    let keepaData = null
    try {
      keepaData = JSON.parse(responseText)
      console.log(`   ✅ Valid JSON response`)
      console.log(`   Products found: ${keepaData.products?.length || 0}`)
      
      if (keepaData.products && keepaData.products.length > 0) {
        const product = keepaData.products[0]
        console.log(`   Product info:`, {
          asin: product.asin,
          title: product.title?.substring(0, 50) + '...',
          hasStats: !!product.stats,
          hasCsv: !!product.csv
        })
      }
    } catch (parseError) {
      console.error(`   ❌ Failed to parse JSON:`, parseError)
      console.log(`   Response preview: ${responseText.substring(0, 200)}`)
    }
    
    // Test 2: Check if it's a rate limit issue
    if (keepaResponse.status === 429) {
      console.log(`   ⚠️ RATE LIMIT HIT - Need to wait before retrying`)
    }
    
    // Test 3: Check tokens
    if (keepaData?.tokensConsumed !== undefined) {
      console.log(`   Tokens consumed: ${keepaData.tokensConsumed}`)
    }
    
    return NextResponse.json({
      test: 'direct_keepa',
      asin,
      status: keepaResponse.status,
      statusText: keepaResponse.statusText,
      hasData: !!keepaData,
      productsFound: keepaData?.products?.length || 0,
      error: keepaResponse.ok ? null : responseText.substring(0, 500),
      sample: keepaData?.products?.[0] ? {
        title: keepaData.products[0].title,
        asin: keepaData.products[0].asin,
        hasPrice: !!keepaData.products[0].stats?.current?.[0]
      } : null
    })
    
  } catch (error) {
    console.error(`🚨 Direct Keepa test failed:`, error)
    return NextResponse.json({
      test: 'direct_keepa',
      asin,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error.constructor.name
    }, { status: 500 })
  }
}