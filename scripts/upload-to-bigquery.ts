#!/usr/bin/env node

/**
 * Upload Processed Data to BigQuery
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📤 Uploading Amazon Data to BigQuery')
  console.log('===================================\n')

  const dataPath = '/tmp/simple-bigquery-data.ndjson'

  try {
    console.log('1️⃣  Checking data file...')
    const stats = fs.statSync(dataPath)
    console.log(`   📄 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

    // Count lines
    const content = fs.readFileSync(dataPath, 'utf-8')
    const lineCount = content.split('\n').filter(line => line.trim()).length
    console.log(`   📊 Records: ${lineCount.toLocaleString()}`)

    console.log('2️⃣  Loading data into BigQuery...')
    const bigQueryService = getBigQueryService()
    const job = await bigQueryService.loadSearchTermsData(dataPath)

    console.log('\n🎉 Upload complete!')
    console.log(`   📊 Records: ${lineCount.toLocaleString()} search terms`)
    console.log(`   💾 Table: commercecrafted.amazon_analytics.search_terms`)
    console.log(`   🗓️  Period: 2025-06-29 to 2025-07-05`)
    console.log(`   🌍 Marketplace: ATVPDKIKX0DER (US Amazon)`)

    console.log('\n🚀 Your BigQuery data is ready!')
    console.log('   Test with: npm run test-bigquery-api')

  } catch (error) {
    console.error('\n❌ Upload failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)