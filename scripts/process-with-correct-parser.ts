#!/usr/bin/env node

/**
 * Process reports with the corrected parser that properly maps fields
 */

import { transformAmazonReportStreaming } from '../src/lib/streaming-json-parser'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'

config({ path: '.env.local' })

async function processWithCorrectParser() {
  const bigQueryService = getBigQueryService()
  
  console.log('🔧 Processing Reports with Corrected Field Mapping')
  console.log('=================================================\n')

  // Process the one JSON file we have
  const report = {
    jsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520525020276.json',
    reportId: '1520525020276',
    weekStartDate: '2025-04-06',
    weekEndDate: '2025-04-12'
  }

  try {
    console.log('📊 Processing report with CORRECT field mapping...')
    
    // Check source file
    const stats = await fs.stat(report.jsonPath)
    console.log(`   📁 Source: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`)
    
    // New output path
    const correctNdjsonPath = report.jsonPath.replace('.json', '-CORRECT.ndjson')
    
    console.log('   🔧 Transforming with fixed parser...')
    console.log('   📝 Output: ' + correctNdjsonPath)
    
    const recordCount = await transformAmazonReportStreaming(
      report.jsonPath,
      correctNdjsonPath,
      {
        reportId: report.reportId,
        marketplaceId: 'ATVPDKIKX0DER',
        weekStartDate: report.weekStartDate,
        weekEndDate: report.weekEndDate
      }
    )

    console.log(`   ✅ Transformed ${recordCount.toLocaleString()} records`)
    
    // Check output size
    const outStats = await fs.stat(correctNdjsonPath)
    console.log(`   📦 Output size: ${(outStats.size / 1024 / 1024).toFixed(2)} MB`)
    
    // Upload to BigQuery
    console.log('\n📤 Uploading to BigQuery...')
    await bigQueryService.loadSearchTermsData(correctNdjsonPath)
    
    // Verify data quality
    console.log('\n🔍 Verifying data quality...')
    const [job] = await bigQueryService.client.createQueryJob({
      query: `
        SELECT 
          COUNT(*) as total,
          COUNT(search_term) as with_search_term,
          COUNT(DISTINCT search_term) as unique_terms,
          ARRAY_AGG(search_term LIMIT 5) as sample_terms
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE search_term IS NOT NULL AND search_term != ""
      `,
      location: 'US',
    })
    const [rows] = await job.getQueryResults()
    
    console.log('\n✅ SUCCESS! Data Quality Results:')
    console.log(`   📊 Total records: ${parseInt(rows[0].total).toLocaleString()}`)
    console.log(`   ✅ Records with search terms: ${parseInt(rows[0].with_search_term).toLocaleString()}`)
    console.log(`   🔍 Unique search terms: ${parseInt(rows[0].unique_terms).toLocaleString()}`)
    console.log(`   💡 Sample terms:`)
    rows[0].sample_terms.forEach(term => console.log(`      • "${term}"`))
    
    const qualityPercent = ((rows[0].with_search_term / rows[0].total) * 100).toFixed(2)
    console.log(`   📈 Data quality: ${qualityPercent}%`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

processWithCorrectParser().catch(console.error)