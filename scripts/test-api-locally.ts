#!/usr/bin/env node

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')
  
  try {
    // Test trends API
    console.log('📊 Testing /api/trends...')
    const trendsRes = await fetch('http://localhost:3002/api/trends?limit=5')
    const trendsData = await trendsRes.json()
    console.log('Status:', trendsRes.status)
    console.log('Success:', trendsData.success)
    console.log('Data count:', trendsData.data?.length || 0)
    if (trendsData.error) {
      console.log('Error:', trendsData.error)
    }
    
    // Test skyrocketing keywords
    console.log('\n📈 Testing /api/trends/skyrocketing...')
    const skyRes = await fetch('http://localhost:3002/api/trends/skyrocketing?limit=5')
    const skyData = await skyRes.json()
    console.log('Status:', skyRes.status)
    console.log('Keywords count:', skyData.keywords?.length || 0)
    if (skyData.error) {
      console.log('Error:', skyData.error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAPI().catch(console.error)