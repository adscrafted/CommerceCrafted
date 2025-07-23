import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN required' }, { status: 400 })
    }
    
    console.log(`\n🧪 Testing ASIN: ${asin}`)
    
    const results = {
      asin,
      keepa: { status: 'pending', data: null, error: null },
      keywords: { status: 'pending', data: null, error: null },
      validation: {
        format: /^B[A-Z0-9]{9}$/.test(asin),
        length: asin.length === 10
      }
    }
    
    // Test 1: Validate ASIN format
    console.log(`📋 ASIN Validation:`, results.validation)
    
    // Test 2: Try Keepa API
    try {
      console.log(`📡 Testing Keepa API...`)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      const keepaUrl = `${baseUrl}/api/amazon/keepa`
      console.log(`   URL: ${keepaUrl}`)
      
      const keepaResponse = await fetch(keepaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin })
      })
      
      console.log(`   Response status: ${keepaResponse.status}`)
      const responseText = await keepaResponse.text()
      
      if (keepaResponse.ok) {
        try {
          const keepaData = JSON.parse(responseText)
          results.keepa = {
            status: 'success',
            data: {
              title: keepaData.title,
              price: keepaData.currentPrice,
              bsr: keepaData.salesRank,
              hasData: !!keepaData.title
            },
            error: null
          }
          console.log(`   ✅ Keepa success:`, results.keepa.data)
        } catch (parseError) {
          results.keepa = {
            status: 'error',
            data: null,
            error: `Failed to parse response: ${parseError.message}`
          }
        }
      } else {
        results.keepa = {
          status: 'error',
          data: null,
          error: `HTTP ${keepaResponse.status}: ${responseText.substring(0, 200)}`
        }
        console.log(`   ❌ Keepa failed:`, results.keepa.error)
      }
    } catch (keepaError) {
      results.keepa = {
        status: 'error',
        data: null,
        error: keepaError instanceof Error ? keepaError.message : 'Unknown error'
      }
      console.error(`   ❌ Keepa exception:`, keepaError)
    }
    
    // Test 3: Try Keywords API
    try {
      console.log(`🔍 Testing Keywords API...`)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      const keywordsUrl = `${baseUrl}/api/amazon/ads-api/keywords-comprehensive`
      console.log(`   URL: ${keywordsUrl}`)
      
      const keywordsResponse = await fetch(keywordsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          asins: [asin], // API expects array
          marketplace: 'US' 
        })
      })
      
      console.log(`   Response status: ${keywordsResponse.status}`)
      const responseText = await keywordsResponse.text()
      
      if (keywordsResponse.ok) {
        try {
          const keywordsData = JSON.parse(responseText)
          results.keywords = {
            status: 'success',
            data: {
              count: keywordsData.keywords?.length || 0,
              sample: keywordsData.keywords?.slice(0, 3).map(k => k.keyword || k.query)
            },
            error: null
          }
          console.log(`   ✅ Keywords success:`, results.keywords.data)
        } catch (parseError) {
          results.keywords = {
            status: 'error',
            data: null,
            error: `Failed to parse response: ${parseError.message}`
          }
        }
      } else {
        results.keywords = {
          status: 'error',
          data: null,
          error: `HTTP ${keywordsResponse.status}: ${responseText.substring(0, 200)}`
        }
        console.log(`   ❌ Keywords failed:`, results.keywords.error)
      }
    } catch (keywordsError) {
      results.keywords = {
        status: 'error',
        data: null,
        error: keywordsError instanceof Error ? keywordsError.message : 'Unknown error'
      }
      console.error(`   ❌ Keywords exception:`, keywordsError)
    }
    
    // Check if this is a real Amazon ASIN
    const amazonUrl = `https://www.amazon.com/dp/${asin}`
    console.log(`\n🌐 Amazon URL would be: ${amazonUrl}`)
    
    // Summary
    const summary = {
      asin,
      isValid: results.validation.format && results.validation.length,
      keepaSuccess: results.keepa.status === 'success',
      keywordsSuccess: results.keywords.status === 'success',
      likelyIssue: 
        !results.validation.format ? 'Invalid ASIN format' :
        results.keepa.status === 'error' && results.keepa.error?.includes('404') ? 'ASIN not found on Amazon' :
        results.keepa.status === 'error' ? 'Keepa API issue' :
        results.keywords.status === 'error' ? 'Keywords API issue' :
        'No issues detected'
    }
    
    console.log(`\n📊 Summary:`, summary)
    
    return NextResponse.json({
      summary,
      results,
      recommendations: [
        !results.validation.format ? '⚠️ Fix ASIN format: Should be B followed by 9 alphanumeric characters' : null,
        results.keepa.error?.includes('404') ? '⚠️ This ASIN may not exist on Amazon' : null,
        results.keepa.error?.includes('429') ? '⚠️ Rate limit hit - wait a moment and try again' : null,
        results.keepa.error?.includes('API key') ? '⚠️ Keepa API key issue' : null,
        results.keywords.error ? `⚠️ Keywords issue: ${results.keywords.error.substring(0, 100)}` : null
      ].filter(Boolean)
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}