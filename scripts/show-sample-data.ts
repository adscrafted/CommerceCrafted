#!/usr/bin/env node

/**
 * Show Sample BigQuery Data
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function main() {
  console.log('📊 Sample Amazon Search Terms Data')
  console.log('=================================\n')

  try {
    const bigQueryService = getBigQueryService()
    const client = (bigQueryService as any).client
    const projectId = process.env.GOOGLE_CLOUD_PROJECT!
    const datasetId = process.env.BIGQUERY_DATASET || 'amazon_analytics'

    console.log('1️⃣  Getting sample data...')
    const query = `
      SELECT 
        search_term,
        search_frequency_rank,
        click_share,
        conversion_share,
        clicked_asin,
        clicked_item_name,
        week_start_date,
        marketplace_id
      FROM \`${projectId}.${datasetId}.search_terms\`
      ORDER BY search_frequency_rank
      LIMIT 10
    `

    const [job] = await client.createQueryJob({ query, location: 'US' })
    const [rows] = await job.getQueryResults()
    
    console.log('🔍 Top 10 Amazon Search Terms:')
    console.log('===============================')
    
    rows.forEach((row: any, index: number) => {
      console.log(`${index + 1}. "${row.search_term}" (rank: ${row.search_frequency_rank})`)
      console.log(`   📦 Top ASIN: ${row.clicked_asin}`)
      console.log(`   🏷️  Product: ${row.clicked_item_name.substring(0, 60)}...`)
      console.log(`   📊 Click Share: ${(row.click_share * 100).toFixed(2)}%`)
      console.log(`   💰 Conversion: ${(row.conversion_share * 100).toFixed(3)}%`)
      console.log(`   📅 Week: ${row.week_start_date}`)
      console.log('')
    })

    console.log('✅ Your real Amazon search terms data is ready!')
    console.log(`🌍 Marketplace: ${rows[0]?.marketplace_id || 'ATVPDKIKX0DER'} (US Amazon)`)

  } catch (error) {
    console.error('\n❌ Query failed:', error)
  }
}

main().catch(console.error)