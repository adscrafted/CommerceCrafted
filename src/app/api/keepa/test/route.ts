import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('=== KEEPA TEST ENDPOINT ===')
  
  try {
    // Check if API key is available
    const apiKey = process.env.KEEPA_API_KEY
    console.log('1. API Key available:', !!apiKey)
    console.log('2. API Key preview:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET')
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Keepa API key not configured',
        env: process.env.NODE_ENV
      }, { status: 500 })
    }
    
    // Test direct API call
    const testAsin = 'B08N5WRWNW'
    const url = `https://api.keepa.com/product?key=${apiKey}&domain=1&asin=${testAsin}&stats=1`
    
    console.log('3. Making request to Keepa...')
    const startTime = Date.now()
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    const duration = Date.now() - startTime
    console.log(`4. Request completed in ${duration}ms`)
    console.log('5. Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('6. Error response:', errorText)
      return NextResponse.json({ 
        error: 'Keepa API error',
        status: response.status,
        statusText: response.statusText,
        body: errorText
      }, { status: response.status })
    }
    
    const data = await response.json()
    console.log('7. Response received, tokens:', data.tokensLeft)
    
    return NextResponse.json({
      success: true,
      tokensLeft: data.tokensLeft,
      tokensConsumed: data.tokensConsumed,
      productCount: data.products?.length || 0,
      duration: duration
    })
    
  } catch (error) {
    console.error('8. Test endpoint error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        stack: error.stack,
        name: error.name
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
  }
}