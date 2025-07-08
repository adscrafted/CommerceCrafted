#!/usr/bin/env node

/**
 * Check BigQuery Upload Status
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📊 Checking BigQuery Upload Status')
  console.log('=================================\n')

  try {
    const bigQueryService = getBigQueryService()
    const client = (bigQueryService as any).client
    const projectId = process.env.GOOGLE_CLOUD_PROJECT!
    const datasetId = process.env.BIGQUERY_DATASET || 'amazon_analytics'

    console.log('1️⃣  Checking table data...')
    const query = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT search_term) as unique_search_terms,
        MIN(week_start_date) as start_date,
        MAX(week_end_date) as end_date,
        COUNT(DISTINCT marketplace_id) as marketplaces
      FROM \`${projectId}.${datasetId}.search_terms\`
    `

    const [job] = await client.createQueryJob({ query, location: 'US' })
    const [rows] = await job.getQueryResults()
    
    if (rows.length > 0) {
      const stats = rows[0]
      console.log('✅ Upload successful!')
      console.log(`   📊 Total records: ${stats.total_records.toLocaleString()}`)
      console.log(`   🔍 Unique search terms: ${stats.unique_search_terms.toLocaleString()}`)
      console.log(`   📅 Date range: ${stats.start_date} to ${stats.end_date}`)
      console.log(`   🌍 Marketplaces: ${stats.marketplaces}`)

      console.log('\n🚀 BigQuery is ready! Try these queries:')
      console.log('   npm run test-bigquery-api')
      console.log('   Or test the API: /api/analytics/search-terms/v2')
    } else {
      console.log('⏳ Upload still in progress...')
    }

  } catch (error) {
    console.error('\n❌ Status check failed:', error)
  }
}

main().catch(console.error)