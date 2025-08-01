import { adsApiAuth } from '@/lib/amazon-ads-auth'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testKeywordsCollection() {
  try {
    console.log('🚀 Testing keywords collection...')
    
    // Check if Amazon Ads API is configured
    console.log('🔑 Checking Amazon Ads API configuration...')
    const isConfigured = adsApiAuth.isConfigured()
    console.log(`   Configuration status: ${isConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`)
    
    if (!isConfigured) {
      console.log('\n❌ Amazon Ads API credentials are missing:')
      console.log('   • ADS_API_CLIENT_ID')
      console.log('   • ADS_API_CLIENT_SECRET') 
      console.log('   • ADS_API_REFRESH_TOKEN')
      console.log('   • ADS_API_PROFILE_ID')
      console.log('\n📝 These credentials are required for keyword collection to work.')
      console.log('🔗 To get these credentials, you need:')
      console.log('   1. Amazon Ads Console access')
      console.log('   2. Registered API application')
      console.log('   3. Valid refresh token from OAuth flow')
      return
    }
    
    // Test API connection
    console.log('\n🌐 Testing API connection...')
    try {
      const accessToken = await adsApiAuth.getAccessToken()
      console.log('✅ Successfully obtained access token')
      console.log(`   Token: ${accessToken.substring(0, 20)}...`)
    } catch (error) {
      console.error('❌ Failed to get access token:', error)
      return
    }
    
    // Test keywords endpoint
    console.log('\n🔍 Testing keywords collection for sample ASIN...')
    const testAsin = 'B07FZ8S74R'
    
    try {
      const response = await fetch('http://localhost:3000/api/amazon/ads-api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asins: [testAsin]
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Keywords collection successful!')
        console.log(`   📊 Total keywords: ${result.summary.totalKeywords}`)
        console.log(`   🔍 Suggested keywords: ${result.summary.suggestedKeywords}`)
        console.log(`   📋 Recommendations: ${result.summary.recommendations}`)
        console.log(`   💰 With estimates: ${result.summary.withEstimates}`)
        
        if (result.keywords.length > 0) {
          console.log('\n🔑 Sample keywords:')
          result.keywords.slice(0, 5).forEach((kw: any, i: number) => {
            console.log(`   ${i + 1}. ${kw.keyword} (${kw.source}, ${kw.matchType})`)
          })
        }
      } else {
        console.log('❌ Keywords collection failed:', result.error)
        console.log('   Details:', result.details)
      }
    } catch (error) {
      console.error('❌ Error calling keywords API:', error)
    }
    
  } catch (error) {
    console.error('❌ Error testing keywords collection:', error)
  }
}

testKeywordsCollection().catch(console.error)