#!/usr/bin/env tsx

// Test script for Amazon SP-API integration
// Usage: npx tsx scripts/test-amazon-api.ts

import { config } from 'dotenv'
import { amazonAPI } from '../src/lib/amazon-api'
import { productDataService } from '../src/lib/product-data-service'

// Load environment variables
config()

async function testAmazonAPI() {
  console.log('🚀 Testing Amazon SP-API Integration...\n')

  // Test 1: Check environment variables
  console.log('1. Environment Variables Check:')
  const requiredEnvVars = [
    'AMAZON_ACCESS_KEY_ID',
    'AMAZON_SECRET_ACCESS_KEY',
    'AMAZON_ROLE_ARN',
    'AMAZON_CLIENT_ID',
    'AMAZON_CLIENT_SECRET',
    'AMAZON_REFRESH_TOKEN'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '))
    console.log('Please check your .env file and AMAZON_SETUP.md\n')
    return
  } else {
    console.log('✅ All required environment variables are set\n')
  }

  // Test 2: Search for products
  console.log('2. Product Search Test:')
  try {
    console.log('   Searching for "wireless headphones"...')
    const searchResults = await productDataService.searchProducts('wireless headphones', { 
      limit: 3 
    })
    
    if (searchResults.products.length > 0) {
      console.log(`✅ Found ${searchResults.products.length} products`)
      searchResults.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} - $${product.price} (${product.asin})`)
      })
    } else {
      console.log('⚠️  No products found in search results')
    }
  } catch (error) {
    console.log('❌ Search failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Test 3: Get product by ASIN
  console.log('3. Product Lookup Test:')
  const testASIN = 'B08MVBRNKV' // Sony headphones ASIN
  try {
    console.log(`   Looking up product ${testASIN}...`)
    const product = await productDataService.getProductByASIN(testASIN, true)
    
    if (product) {
      console.log('✅ Product found:')
      console.log(`   Title: ${product.title}`)
      console.log(`   Brand: ${product.brand}`)
      console.log(`   Price: $${product.price}`)
      console.log(`   Category: ${product.category}`)
      if (product.bsrData) {
        console.log(`   BSR: #${product.bsrData.rank}`)
      }
      if (product.reviewData) {
        console.log(`   Rating: ${product.reviewData.averageRating}/5 (${product.reviewData.totalReviews} reviews)`)
      }
    } else {
      console.log('⚠️  Product not found')
    }
  } catch (error) {
    console.log('❌ Product lookup failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Test 4: Get pricing data
  console.log('4. Pricing Data Test:')
  try {
    console.log(`   Getting pricing for ${testASIN}...`)
    const pricing = await amazonAPI.getProductPricing(testASIN)
    
    if (pricing) {
      console.log('✅ Pricing data retrieved:')
      console.log(`   Current Price: $${pricing.currentPrice} ${pricing.currency}`)
      if (pricing.listPrice) {
        console.log(`   List Price: $${pricing.listPrice}`)
      }
    } else {
      console.log('⚠️  No pricing data available')
    }
  } catch (error) {
    console.log('❌ Pricing lookup failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Test 5: Get BSR data
  console.log('5. BSR Data Test:')
  try {
    console.log(`   Getting BSR for ${testASIN}...`)
    const bsrData = await amazonAPI.getBSRData(testASIN)
    
    if (bsrData) {
      console.log('✅ BSR data retrieved:')
      console.log(`   Rank: #${bsrData.rank}`)
      console.log(`   Category: ${bsrData.category}`)
      console.log(`   Estimated Monthly Sales: ${bsrData.estimatedMonthlySales}`)
    } else {
      console.log('⚠️  No BSR data available')
    }
  } catch (error) {
    console.log('❌ BSR lookup failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Test 6: Get trending products
  console.log('6. Trending Products Test:')
  try {
    console.log('   Getting trending products...')
    const trending = await productDataService.getTrendingProducts(3)
    
    if (trending.length > 0) {
      console.log(`✅ Found ${trending.length} trending products:`)
      trending.forEach((product, index) => {
        const score = product.analysis?.opportunityScore || 0
        console.log(`   ${index + 1}. ${product.title} - Score: ${score}/10`)
      })
    } else {
      console.log('⚠️  No trending products found')
    }
  } catch (error) {
    console.log('❌ Trending products failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Test 7: Deep analysis
  console.log('7. Deep Analysis Test:')
  try {
    console.log(`   Generating deep analysis for ${testASIN}...`)
    const deepAnalysis = await productDataService.getDeepAnalysis(testASIN)
    
    if (deepAnalysis) {
      console.log('✅ Deep analysis generated:')
      console.log(`   Opportunity Score: ${deepAnalysis.opportunityScore}/10`)
      console.log(`   Market Size: $${deepAnalysis.marketSize.som.toLocaleString()}`)
      console.log(`   Competition Level: ${deepAnalysis.competitionLevel}`)
      console.log(`   CAGR: ${deepAnalysis.demandTrends.cagr}%`)
    } else {
      console.log('⚠️  Deep analysis not available')
    }
  } catch (error) {
    console.log('❌ Deep analysis failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Test 8: Cache performance
  console.log('8. Cache Performance Test:')
  try {
    const start = Date.now()
    await productDataService.getProductByASIN(testASIN) // Should hit cache
    const end = Date.now()
    
    console.log(`✅ Cached lookup completed in ${end - start}ms`)
    
    const cacheStats = productDataService.getCacheStats()
    console.log(`   Products cached: ${cacheStats.productsCached}`)
    console.log(`   Amazon cache size: ${cacheStats.amazonCacheStats.size}`)
  } catch (error) {
    console.log('❌ Cache test failed:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')

  // Summary
  console.log('🎉 Amazon SP-API Integration Test Complete!')
  console.log('Check the results above to ensure everything is working correctly.')
  console.log('If you see any errors, refer to AMAZON_SETUP.md for troubleshooting.')
}

// Run the test
if (require.main === module) {
  testAmazonAPI().catch(error => {
    console.error('Test failed with error:', error)
    process.exit(1)
  })
}

export { testAmazonAPI }