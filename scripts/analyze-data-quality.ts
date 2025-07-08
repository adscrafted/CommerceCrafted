#!/usr/bin/env node

/**
 * Analyze BigQuery data quality and filter null search terms
 */

import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function analyzeDataQuality() {
  const bigQueryService = getBigQueryService()
  
  console.log('🔍 Analyzing BigQuery Data Quality')
  console.log('==================================\n')

  try {
    // Check total records
    console.log('1️⃣  Total Records:')
    const [totalJob] = await bigQueryService.client.createQueryJob({
      query: 'SELECT COUNT(*) as total FROM `commercecrafted.amazon_analytics.search_terms`',
      location: 'US',
    })
    const [totalRows] = await totalJob.getQueryResults()
    console.log(`   📊 Total records: ${totalRows[0].total}`)

    // Check null search terms
    console.log('\n2️⃣  Null Search Terms:')
    const [nullJob] = await bigQueryService.client.createQueryJob({
      query: 'SELECT COUNT(*) as null_count FROM `commercecrafted.amazon_analytics.search_terms` WHERE search_term IS NULL OR search_term = ""',
      location: 'US',
    })
    const [nullRows] = await nullJob.getQueryResults()
    console.log(`   🚫 Null/empty search terms: ${nullRows[0].null_count}`)

    // Check valid search terms
    console.log('\n3️⃣  Valid Search Terms:')
    const [validJob] = await bigQueryService.client.createQueryJob({
      query: 'SELECT COUNT(*) as valid_count, COUNT(DISTINCT search_term) as unique_terms FROM `commercecrafted.amazon_analytics.search_terms` WHERE search_term IS NOT NULL AND search_term != ""',
      location: 'US',
    })
    const [validRows] = await validJob.getQueryResults()
    console.log(`   ✅ Valid records: ${validRows[0].valid_count}`)
    console.log(`   🔍 Unique search terms: ${validRows[0].unique_terms}`)

    // Sample of search terms
    console.log('\n4️⃣  Sample Search Terms:')
    const [sampleJob] = await bigQueryService.client.createQueryJob({
      query: 'SELECT search_term, search_frequency_rank FROM `commercecrafted.amazon_analytics.search_terms` WHERE search_term IS NOT NULL AND search_term != "" ORDER BY search_frequency_rank ASC LIMIT 10',
      location: 'US',
    })
    const [sampleRows] = await sampleJob.getQueryResults()
    sampleRows.forEach(row => {
      console.log(`   • "${row.search_term}" (rank: ${row.search_frequency_rank})`)
    })

    // Calculate data quality
    const totalCount = parseInt(totalRows[0].total)
    const nullCount = parseInt(nullRows[0].null_count)
    const validCount = parseInt(validRows[0].valid_count)
    const qualityPercent = ((validCount / totalCount) * 100).toFixed(2)

    console.log('\n📊 Data Quality Summary:')
    console.log(`   📈 Data quality: ${qualityPercent}% valid records`)
    console.log(`   🗑️  Should filter out: ${nullCount} null/empty records`)
    console.log(`   ✨ Clean dataset: ${validCount} useful records`)

    // Recommendation
    if (nullCount > 0) {
      console.log('\n💡 Recommendation:')
      console.log('   Create a view that filters out null search terms:')
      console.log('   ```sql')
      console.log('   CREATE VIEW `commercecrafted.amazon_analytics.clean_search_terms` AS')
      console.log('   SELECT * FROM `commercecrafted.amazon_analytics.search_terms`')
      console.log('   WHERE search_term IS NOT NULL AND search_term != ""')
      console.log('   ```')
    }

  } catch (error) {
    console.error('❌ Error analyzing data:', error)
  }
}

analyzeDataQuality().catch(console.error)