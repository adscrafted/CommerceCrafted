#!/usr/bin/env node

/**
 * Reprocess reports with corrected field mapping
 */

import { transformAmazonReportStreaming } from '../src/lib/streaming-json-parser'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'

config({ path: '.env.local' })

async function reprocessCorrectedData() {
  const bigQueryService = getBigQueryService()
  
  console.log('🔄 Reprocessing Data with Corrected Field Mapping')
  console.log('==============================================\n')

  // Start with one report to test
  const testReport = {
    jsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520525020276.json',
    reportId: '1520525020276',
    weekStartDate: '2025-04-06',
    weekEndDate: '2025-04-12'
  }

  try {
    // Check if JSON file exists
    const stats = await fs.stat(testReport.jsonPath)
    console.log(`📁 Found JSON file: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`)

    // Generate corrected NDJSON
    const correctedNdjsonPath = testReport.jsonPath.replace('.json', '-corrected.ndjson')
    console.log('🔧 Transforming with corrected field mapping...')
    
    const recordCount = await transformAmazonReportStreaming(
      testReport.jsonPath,
      correctedNdjsonPath,
      {
        reportId: testReport.reportId,
        marketplaceId: 'ATVPDKIKX0DER',
        weekStartDate: testReport.weekStartDate,
        weekEndDate: testReport.weekEndDate
      }
    )

    console.log(`✅ Transformed ${recordCount} records`)
    
    // Check file size
    const ndjsonStats = await fs.stat(correctedNdjsonPath)
    console.log(`📦 NDJSON file: ${(ndjsonStats.size / 1024 / 1024).toFixed(2)} MB`)

    // Upload to BigQuery
    console.log('📤 Uploading to BigQuery...')
    await bigQueryService.loadSearchTermsData(correctedNdjsonPath)
    
    console.log('🔍 Checking data quality...')
    
    // Verify data quality
    const [job] = await bigQueryService.client.createQueryJob({
      query: `
        SELECT 
          COUNT(*) as total,
          COUNT(search_term) as non_null_search_terms,
          COUNT(DISTINCT search_term) as unique_terms,
          MIN(search_term) as sample_term
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE search_term IS NOT NULL AND search_term != ""
      `,
      location: 'US',
    })
    const [rows] = await job.getQueryResults()
    
    console.log('📊 Data Quality Results:')
    console.log(`   📈 Total records: ${rows[0].total}`)
    console.log(`   ✅ Non-null search terms: ${rows[0].non_null_search_terms}`)
    console.log(`   🔍 Unique search terms: ${rows[0].unique_terms}`)
    console.log(`   💡 Sample term: "${rows[0].sample_term}"`)
    
    const qualityPercent = ((rows[0].non_null_search_terms / rows[0].total) * 100).toFixed(2)
    console.log(`   📈 Data quality: ${qualityPercent}%`)

    if (rows[0].unique_terms > 0) {
      console.log('\n🎉 SUCCESS! Field mapping is now correct!')
      console.log('   Ready to process remaining reports...')
    } else {
      console.log('\n⚠️  Still issues with data quality')
    }

  } catch (error) {
    console.error('❌ Error reprocessing:', error)
  }
}

reprocessCorrectedData().catch(console.error)