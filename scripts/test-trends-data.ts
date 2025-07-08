#!/usr/bin/env node

async function testTrendsAPI() {
  console.log('🧪 Testing trends API data...\n')
  
  try {
    // Test the trends API
    const response = await fetch('http://localhost:3000/api/trends?limit=2')
    const data = await response.json()
    
    console.log('API Response:')
    console.log('Success:', data.success)
    console.log('Data count:', data.data?.length)
    
    if (data.data && data.data.length > 0) {
      console.log('\nFirst search term:')
      console.log('- Term:', data.data[0].searchTerm)
      console.log('- Top ASINs:', data.data[0].topAsins)
      console.log('- Number of ASINs:', data.data[0].topAsins?.length || 0)
      
      if (data.data[0].topAsins && data.data[0].topAsins.length > 0) {
        console.log('\nDetailed ASIN data:')
        data.data[0].topAsins.forEach((asin: any, index: number) => {
          console.log(`\nASIN ${index + 1}:`)
          console.log('- ASIN:', asin.clicked_asin)
          console.log('- Title:', asin.product_title?.substring(0, 50) + '...')
          console.log('- Click Share:', asin.click_share)
          console.log('- Conversion Share:', asin.conversion_share)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testTrendsAPI().catch(console.error)