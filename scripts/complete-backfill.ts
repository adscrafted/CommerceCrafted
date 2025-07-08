#!/usr/bin/env node

/**
 * Complete backfill processing for all 3 pending reports
 */

import { transformAmazonReportStreaming } from '../src/lib/streaming-json-parser'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

config({ path: '.env.local' })

interface Report {
  id: string
  jsonPath: string
  weekStartDate: string
  weekEndDate: string
  status: 'pending' | 'processing' | 'completed'
}

async function completeBackfill() {
  const bigQueryService = getBigQueryService()
  
  console.log('🚀 Completing Amazon Search Terms Backfill')
  console.log('==========================================\n')

  // All 3 reports to process
  const reports: Report[] = [
    {
      id: '1520525020276',
      jsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520525020276.json',
      weekStartDate: '2025-04-06',
      weekEndDate: '2025-04-12',
      status: 'pending'
    },
    {
      id: '1520535020276', 
      jsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520535020276.csv', // Actually JSON
      weekStartDate: '2025-04-13',
      weekEndDate: '2025-04-19',
      status: 'pending'
    },
    {
      id: '1520541020276',
      jsonPath: '/Users/anthony/Documents/Projects/CommerceCrafted/tmp/report-1520541020276.csv', // Actually JSON
      weekStartDate: '2025-04-20',
      weekEndDate: '2025-04-26',
      status: 'pending'
    }
  ]

  let totalRecordsProcessed = 0

  for (const report of reports) {
    try {
      console.log(`\n📊 Processing Report ${report.id} (Week of ${report.weekStartDate})`)
      report.status = 'processing'
      
      // Check if source file exists
      let sourceExists = false
      try {
        await fs.access(report.jsonPath)
        sourceExists = true
      } catch {
        // Try with .json extension if .csv doesn't exist
        if (report.jsonPath.endsWith('.csv')) {
          const jsonPath = report.jsonPath.replace('.csv', '.json')
          try {
            await fs.access(jsonPath)
            report.jsonPath = jsonPath
            sourceExists = true
          } catch {}
        }
      }

      if (!sourceExists) {
        console.log(`   ⚠️  Source file not found: ${report.jsonPath}`)
        continue
      }

      // Get file info
      const stats = await fs.stat(report.jsonPath)
      console.log(`   📁 Source file: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`)

      // Generate NDJSON path
      const ndjsonPath = report.jsonPath.replace(/\.(csv|json)$/, '-final.ndjson')
      
      // Check if already processed
      try {
        const ndjsonStats = await fs.stat(ndjsonPath)
        if (ndjsonStats.size > 1000000) { // > 1MB means likely complete
          console.log(`   ✅ Already processed: ${(ndjsonStats.size / 1024 / 1024).toFixed(2)} MB`)
          
          // Upload to BigQuery
          console.log('   📤 Uploading to BigQuery...')
          await bigQueryService.loadSearchTermsData(ndjsonPath)
          console.log('   ✅ Upload complete!')
          
          report.status = 'completed'
          continue
        }
      } catch {
        // File doesn't exist, need to process
      }

      // Transform JSON to NDJSON with corrected field mapping
      console.log('   🔧 Transforming with corrected field mapping...')
      const recordCount = await transformAmazonReportStreaming(
        report.jsonPath,
        ndjsonPath,
        {
          reportId: report.id,
          marketplaceId: 'ATVPDKIKX0DER',
          weekStartDate: report.weekStartDate,
          weekEndDate: report.weekEndDate
        }
      )

      console.log(`   ✅ Transformed ${recordCount.toLocaleString()} records`)
      totalRecordsProcessed += recordCount

      // Upload to BigQuery
      console.log('   📤 Uploading to BigQuery...')
      await bigQueryService.loadSearchTermsData(ndjsonPath)
      console.log('   ✅ Upload complete!')
      
      report.status = 'completed'

    } catch (error) {
      console.error(`   ❌ Error processing ${report.id}:`, error)
      report.status = 'pending'
    }
  }

  // Final verification
  console.log('\n🔍 Final Verification')
  console.log('====================')
  
  try {
    const [job] = await bigQueryService.client.createQueryJob({
      query: `
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT search_term) as unique_terms,
          COUNT(DISTINCT week_start_date) as weeks_covered,
          MIN(week_start_date) as earliest_week,
          MAX(week_start_date) as latest_week
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE search_term IS NOT NULL AND search_term != ""
      `,
      location: 'US',
    })
    const [rows] = await job.getQueryResults()
    
    console.log(`📊 BigQuery Final Status:`)
    console.log(`   📈 Total records: ${parseInt(rows[0].total_records).toLocaleString()}`)
    console.log(`   🔍 Unique search terms: ${parseInt(rows[0].unique_terms).toLocaleString()}`)
    console.log(`   📅 Weeks covered: ${rows[0].weeks_covered}`)
    console.log(`   📆 Date range: ${rows[0].earliest_week} to ${rows[0].latest_week}`)

  } catch (error) {
    console.error('❌ Error in verification:', error)
  }

  // Update backfill state
  console.log('\n📝 Updating backfill state...')
  const stateFile = path.join(process.cwd(), '.backfill-state.json')
  const completedState = {
    pendingReports: [],
    completedReports: reports.filter(r => r.status === 'completed').map(r => ({
      reportId: r.id,
      weekStartDate: r.weekStartDate,
      completedAt: new Date().toISOString()
    })),
    lastCheck: new Date().toISOString(),
    totalRecordsProcessed: totalRecordsProcessed
  }
  
  await fs.writeFile(stateFile, JSON.stringify(completedState, null, 2))
  
  console.log('\n🎉 BACKFILL COMPLETE!')
  console.log('====================')
  console.log(`✅ Processed ${totalRecordsProcessed.toLocaleString()} total records`)
  console.log(`📊 Reports completed: ${reports.filter(r => r.status === 'completed').length}/3`)
  console.log('🚀 BigQuery is ready for queries!')
}

completeBackfill().catch(console.error)