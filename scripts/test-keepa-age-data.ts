import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testKeepaAgeData() {
  console.log('Testing Keepa API for product age data...\n')
  
  // Test with a known ASIN
  const testAsin = 'B0DQ1LHZ9R' // Berberine supplement
  
  try {
    console.log(`Fetching data for ASIN: ${testAsin}`)
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/amazon/keepa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asin: testAsin })
    })
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText)
      const text = await response.text()
      console.error('Response:', text)
      return
    }
    
    const data = await response.json()
    console.log('\nKeepa Response Summary:')
    console.log('- Title:', data.title)
    console.log('- ASIN:', data.asin)
    console.log('- Price:', data.currentPrice)
    console.log('- Rating:', data.rating)
    console.log('- Reviews:', data.reviewCount)
    
    // Check for age data
    console.log('\nProduct Age Data:')
    if (data.productAge) {
      console.log('✅ Product Age found:')
      console.log('  - Months:', data.productAge.months)
      console.log('  - Years:', data.productAge.years)
      console.log('  - Category:', data.productAge.category)
    } else {
      console.log('❌ No productAge field in response')
    }
    
    if (data.firstSeenTimestamp) {
      console.log('✅ First Seen Timestamp:', new Date(data.firstSeenTimestamp))
    } else {
      console.log('❌ No firstSeenTimestamp field')
    }
    
    // Check csv data
    if (data.csv) {
      console.log('\n📊 CSV Data Available:')
      Object.keys(data.csv).forEach(key => {
        if (Array.isArray(data.csv[key]) && data.csv[key].length > 0) {
          console.log(`  - ${key}: ${data.csv[key].length} data points`)
        }
      })
    }
    
    // Log full response for debugging
    console.log('\nFull Response (for debugging):')
    console.log(JSON.stringify(data, null, 2))
    
  } catch (error) {
    console.error('Error testing Keepa:', error)
  }
}

testKeepaAgeData()