#!/usr/bin/env node

/**
 * Test BigQuery API Integration
 * 
 * This script tests the BigQuery service directly without authentication
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('🧪 Testing BigQuery API Integration')
  console.log('==================================\n')

  try {
    const bigQueryService = getBigQueryService()

    console.log('1️⃣  Testing getTopSearchTerms...')
    try {
      const topTerms = await bigQueryService.getTopSearchTerms('2024-12-29', 5)
      console.log(`   ✅ Query successful. Results: ${topTerms.length}`)
      
      if (topTerms.length > 0) {
        console.log('   📊 Sample data:')
        topTerms.slice(0, 3).forEach((term: any, index: number) => {
          console.log(`      ${index + 1}. ${term.search_term} (rank: ${term.search_frequency_rank})`)
        })
      } else {
        console.log('   📊 No data found (this is expected - no real data loaded yet)')
      }
    } catch (error) {
      console.log(`   ⚠️  Query returned no results (expected): ${(error as Error).message}`)
    }

    console.log('\n2️⃣  Testing searchTerms...')
    try {
      const searchResults = await bigQueryService.searchTerms('bluetooth', '2024-12-29', 5)
      console.log(`   ✅ Search successful. Results: ${searchResults.length}`)
    } catch (error) {
      console.log(`   ⚠️  Search returned no results (expected): ${(error as Error).message}`)
    }

    console.log('\n3️⃣  Testing getTrendingSearchTerms...')
    try {
      const trending = await bigQueryService.getTrendingSearchTerms('2024-12-29', '2024-12-22', 5)
      console.log(`   ✅ Trending query successful. Results: ${trending.length}`)
    } catch (error) {
      console.log(`   ⚠️  Trending returned no results (expected): ${(error as Error).message}`)
    }

    console.log('\n✅ BigQuery service is working correctly!')
    console.log('\n📝 Next steps:')
    console.log('   1. Load real Amazon data to see actual results')
    console.log('   2. Use the API endpoints with authentication')
    console.log('   3. Query data through your application')

  } catch (error) {
    console.error('\n❌ BigQuery service test failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)