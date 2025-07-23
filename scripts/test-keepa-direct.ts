import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const KEEPA_API_KEY = process.env.KEEPA_API_KEY || '6bn3gia2gt7avkubb95fqquhnv20b2n81m387kfvkt9t583fteqte4pf1jtdh57b'
const KEEPA_API_URL = 'https://api.keepa.com/product'

async function testKeepaDirectly() {
  console.log('🔍 Testing Keepa API directly...\n')
  
  const testAsin = 'B07W8S6TC3' // First ASIN from Saffron supplements
  
  try {
    // Test 1: Direct Keepa API call
    console.log('1️⃣ Testing direct Keepa API call...')
    const params = new URLSearchParams({
      key: KEEPA_API_KEY,
      domain: '1', // Amazon.com
      asin: testAsin,
      stats: '1',
      history: '1',
      offers: '20',
      rental: '0',
      rating: '1',
      update: '0'
    })
    
    const response = await fetch(`${KEEPA_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Keepa API error:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ Keepa API response:', {
      hasProducts: !!data.products,
      productCount: data.products?.length || 0,
      tokensConsumed: data.tokensConsumed,
      product: data.products?.[0] ? {
        asin: data.products[0].asin,
        title: data.products[0].title?.substring(0, 50) + '...',
        currentPrice: data.products[0].stats?.current?.[0] ? data.products[0].stats.current[0] / 100 : null,
        salesRank: data.products[0].salesRanks?.current?.[0] || null
      } : null
    })
    
    // Test 2: Through local API endpoint
    console.log('\n2️⃣ Testing through local API endpoint...')
    const localUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/amazon/keepa`
    console.log(`Calling: ${localUrl}`)
    
    const localResponse = await fetch(localUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin: testAsin })
    })
    
    console.log('Local API response status:', localResponse.status)
    
    if (!localResponse.ok) {
      const errorText = await localResponse.text()
      console.error('❌ Local API error:', errorText.substring(0, 500))
    } else {
      const localData = await localResponse.json()
      console.log('✅ Local API response:', {
        asin: localData.asin,
        title: localData.title?.substring(0, 50) + '...',
        currentPrice: localData.currentPrice,
        salesRank: localData.salesRank
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testKeepaDirectly()