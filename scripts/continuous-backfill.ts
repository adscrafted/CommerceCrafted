#!/usr/bin/env node

/**
 * Continuous backfill system - process current reports and continue to present
 */

import { transformAmazonReportStreaming } from '../src/lib/streaming-json-parser'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { getBackfillService } from '../src/lib/backfill-service'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

config({ path: '.env.local' })

async function continuousBackfill() {
  const bigQueryService = getBigQueryService()
  const backfillService = getBackfillService()
  
  console.log('🚀 Continuous Amazon Search Terms Backfill')
  console.log('==========================================\n')

  // Phase 1: Complete pending April reports
  console.log('📅 PHASE 1: Complete April 2025 Reports')
  console.log('======================================')
  
  const aprilReports = [
    { id: '1520525020276', week: '2025-04-06', file: 'report-1520525020276.json' },
    { id: '1520535020276', week: '2025-04-13', file: 'report-1520535020276.csv' },
    { id: '1520541020276', week: '2025-04-20', file: 'report-1520541020276.csv' }
  ]

  let totalAprilRecords = 0

  for (const report of aprilReports) {
    try {
      console.log(`\n📊 Processing ${report.id} (Week of ${report.week})`)
      
      const jsonPath = path.join('/Users/anthony/Documents/Projects/CommerceCrafted/tmp', report.file)
      const ndjsonPath = jsonPath.replace(/\.(csv|json)$/, '-processed.ndjson')
      
      // Check if source exists
      try {
        const stats = await fs.stat(jsonPath)
        console.log(`   📁 Found: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`)
      } catch {
        console.log(`   ⚠️  File not found: ${jsonPath}`)
        continue
      }

      // Transform and upload
      console.log('   🔧 Transforming...')
      const recordCount = await transformAmazonReportStreaming(
        jsonPath,
        ndjsonPath,
        {
          reportId: report.id,
          marketplaceId: 'ATVPDKIKX0DER',
          weekStartDate: report.week,
          weekEndDate: getWeekEndDate(report.week)
        }
      )

      console.log(`   ✅ Transformed: ${recordCount.toLocaleString()} records`)
      totalAprilRecords += recordCount

      console.log('   📤 Uploading to BigQuery...')
      await bigQueryService.loadSearchTermsData(ndjsonPath)
      console.log('   ✅ Upload complete!')

    } catch (error) {
      console.error(`   ❌ Error processing ${report.id}:`, error)
    }
  }

  // Phase 2: Get missing weeks from April to present
  console.log('\n📅 PHASE 2: Continue Backfill to Present')
  console.log('=====================================')
  
  try {
    // Get missing weeks from April 27 to present
    const missingWeeks = await backfillService.getMissingWeeksForBackfill()
    console.log(`📊 Found ${missingWeeks.length} missing weeks to backfill`)
    
    if (missingWeeks.length > 0) {
      // Show date range
      const firstWeek = missingWeeks[0].toISOString().split('T')[0]
      const lastWeek = missingWeeks[missingWeeks.length - 1].toISOString().split('T')[0]
      console.log(`📆 Date range: ${firstWeek} to ${lastWeek}`)
      
      // Request reports for missing weeks (with rate limiting)
      console.log('\n🎯 Requesting new reports from Amazon...')
      
      const results = await backfillService.backfillHistoricalData(
        Math.min(missingWeeks.length, 8), // Request up to 8 weeks at once
        'ATVPDKIKX0DER'
      )
      
      console.log('\n📋 Request Results:')
      console.log(`   ✅ Requested: ${results.requested.length} reports`)
      console.log(`   ⏭️  Skipped: ${results.skipped.length} reports`)
      console.log(`   ❌ Errors: ${results.errors.length} reports`)
      
      if (results.requested.length > 0) {
        console.log('\n📝 Requested Reports:')
        results.requested.forEach(req => console.log(`   • ${req}`))
        
        console.log('\n⏳ Note: New reports will be processed by the monitoring service')
        console.log('   Run "npm run monitor-and-backfill" to process them as they complete')
      }
      
      if (results.errors.length > 0) {
        console.log('\n❌ Errors encountered:')
        results.errors.forEach(err => console.log(`   • ${err}`))
      }
    } else {
      console.log('✅ All weeks up to present are already processed!')
    }

  } catch (error) {
    console.error('❌ Error in continuous backfill:', error)
  }

  // Phase 3: Final status
  console.log('\n📊 BACKFILL STATUS SUMMARY')
  console.log('=========================')
  
  try {
    const [job] = await bigQueryService.client.createQueryJob({
      query: `
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT search_term) as unique_terms,
          COUNT(DISTINCT week_start_date) as weeks_covered,
          MIN(week_start_date) as earliest_week,
          MAX(week_start_date) as latest_week,
          COUNT(DISTINCT report_id) as total_reports
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE search_term IS NOT NULL AND search_term != ""
      `,
      location: 'US',
    })
    const [rows] = await job.getQueryResults()
    
    console.log(`📈 Current BigQuery Status:`)
    console.log(`   📊 Total records: ${parseInt(rows[0].total_records || 0).toLocaleString()}`)
    console.log(`   🔍 Unique search terms: ${parseInt(rows[0].unique_terms || 0).toLocaleString()}`)
    console.log(`   📅 Weeks covered: ${rows[0].weeks_covered || 0}`)
    console.log(`   📆 Date range: ${rows[0].earliest_week || 'none'} to ${rows[0].latest_week || 'none'}`)
    console.log(`   📋 Total reports: ${rows[0].total_reports || 0}`)

  } catch (error) {
    console.error('❌ Error checking status:', error)
  }

  console.log('\n🎉 CONTINUOUS BACKFILL SETUP COMPLETE!')
  console.log('=====================================')
  console.log('✅ April 2025 reports processed')
  console.log('🔄 Additional weeks requested from Amazon')
  console.log('⏳ Run monitoring service to process new reports as they complete')
  console.log('\n💡 Next steps:')
  console.log('   1. npm run monitor-and-backfill (to process new reports)')
  console.log('   2. Check status periodically with: npm run check-upload-status')
}

function getWeekEndDate(weekStartStr: string): string {
  const startDate = new Date(weekStartStr + 'T00:00:00.000Z')
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  return endDate.toISOString().split('T')[0]
}

continuousBackfill().catch(console.error)