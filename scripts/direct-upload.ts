#!/usr/bin/env node

/**
 * Direct Upload to BigQuery
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📤 Direct Upload to BigQuery')
  console.log('===========================\n')

  const dataPath = '/tmp/simple-bigquery-data.ndjson'

  try {
    console.log('1️⃣  Checking data file...')
    const stats = fs.statSync(dataPath)
    console.log(`   📄 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

    console.log('2️⃣  Starting BigQuery upload...')
    const bigQueryService = getBigQueryService()
    const job = await bigQueryService.loadSearchTermsData(dataPath)

    console.log('\n🎉 Upload complete!')
    console.log(`   💾 Table: commercecrafted.amazon_analytics.search_terms`)
    console.log(`   🗓️  Period: 2025-06-29 to 2025-07-05`)
    console.log(`   🌍 Marketplace: ATVPDKIKX0DER (US Amazon)`)

    console.log('\n🚀 Your BigQuery data is ready!')

  } catch (error) {
    console.error('\n❌ Upload failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)