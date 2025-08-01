import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testNicheAsins() {
  const testAsins = ['B07YFF4YDQ', 'B08M3J7XDL', 'B08W2G9YXJ', 'B09H5PGYQP', 'B09TSF3TZS']
  
  console.log('🚀 Testing all ASINs from the niche...')
  
  for (const asin of testAsins) {
    console.log(`\n📦 Testing ASIN: ${asin}`)
    
    try {
      const response = await fetch('http://localhost:3000/api/amazon/ads-api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asins: [asin]
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log(`   ✅ Keywords: ${result.summary.totalKeywords}`)
        console.log(`   📊 Suggested: ${result.summary.suggestedKeywords}`)
        console.log(`   📋 Recommendations: ${result.summary.recommendations}`)
        
        if (result.keywords.length > 0) {
          console.log(`   🔑 Sample keywords:`)
          result.keywords.slice(0, 3).forEach((kw, i) => {
            console.log(`      ${i + 1}. ${kw.keyword} (${kw.source})`)
          })
        } else {
          console.log(`   ⚠️ No keywords returned for this ASIN`)
        }
      } else {
        console.log(`   ❌ API Error: ${result.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Request Error: ${error.message}`)
    }
  }
  
  // Test with a known good ASIN for comparison
  console.log(`\n🧪 Testing known good ASIN for comparison: B07FZ8S74R`)
  try {
    const response = await fetch('http://localhost:3000/api/amazon/ads-api/keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asins: ['B07FZ8S74R']
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`   ✅ Keywords: ${result.summary.totalKeywords}`)
      console.log(`   📊 This ASIN works fine, confirming the API is functional`)
    } else {
      console.log(`   ❌ Even the known good ASIN failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`   ❌ Known good ASIN test failed: ${error.message}`)
  }
}

testNicheAsins().catch(console.error)