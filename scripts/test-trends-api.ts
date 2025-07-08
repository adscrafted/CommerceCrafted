#!/usr/bin/env node

/**
 * Test Trends API Endpoint
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🔍 Testing Trends API Logic')
  console.log('===========================\n')

  try {
    const bigQueryService = getBigQueryService()
    
    // Test the same query logic as the API
    console.log('1️⃣  Testing getTopSearchTerms...')
    
    // Use the actual date from our data (assuming it's from June 29, 2025)
    const testDate = '2025-06-29'
    
    const data = await bigQueryService.getTopSearchTerms(testDate, 10)
    
    console.log(`📊 Found ${data.length} search terms for ${testDate}`)
    console.log('==================================================')
    
    data.forEach((term: any, index: number) => {
      console.log(`${index + 1}. "${term.search_term}" (rank: ${term.search_frequency_rank})`)
      console.log(`   🎯 Top ASIN: ${term.top_asin_1}`)
      console.log(`   📊 Click Share: ${(term.total_click_share * 100).toFixed(2)}%`)
      console.log(`   💰 Conversion: ${(term.total_conversion_share * 100).toFixed(3)}%`)
      console.log(`   📦 Products: ${term.unique_products}`)
      console.log(`   🌍 Marketplace: ${term.marketplace_id}`)
      console.log('')
    })

    console.log('✅ API logic test successful!')
    console.log('🚀 The trends page should work with this data structure')

  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

main().catch(console.error)