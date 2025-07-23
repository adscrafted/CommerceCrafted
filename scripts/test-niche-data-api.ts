import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function testNicheDataAPI() {
  const nicheId = 'saffron_supplements_1753229796169'
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/niches/${nicheId}/data`
  
  console.log('Testing API:', apiUrl)
  
  try {
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText)
      return
    }
    
    const data = await response.json()
    
    console.log('\n📊 API Response Summary:')
    console.log('- Niche:', data.niche?.id)
    console.log('- Products:', data.products?.length || 0)
    console.log('- Keywords:', data.keywords?.length || 0)
    console.log('- Has review history:', Object.keys(data.reviewHistory || {}).length > 0)
    
    if (data.products && data.products.length > 0) {
      console.log('\n🛍️ Products with age data:')
      data.products.forEach((p: any) => {
        console.log(`  ${p.asin}: ${p.product_age_months || 'NO AGE'} months (${p.product_age_category || 'NO CATEGORY'})`)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

testNicheDataAPI()