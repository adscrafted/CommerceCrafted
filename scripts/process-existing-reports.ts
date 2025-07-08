#!/usr/bin/env node

/**
 * Process existing reports that were already requested
 */

import { getAmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { transformAmazonReportStreaming } from '../src/lib/streaming-json-parser'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })

const existingReports = [
  { reportId: '1520525020276', weekStartDate: '2025-04-06' },
  { reportId: '1520535020276', weekStartDate: '2025-04-13' },
  { reportId: '1520541020276', weekStartDate: '2025-04-20' }
]

async function processExistingReports() {
  const amazonService = getAmazonSearchTermsService()
  const bigQueryService = getBigQueryService()

  console.log('🔄 Processing existing reports...\n')

  for (const report of existingReports) {
    console.log(`\n📊 Processing report ${report.reportId} for week ${report.weekStartDate}`)
    
    try {
      // Check report status first
      const status = await amazonService.getReportStatus(report.reportId)
      console.log(`   Status: ${status.processingStatus}`)
      
      if (status.processingStatus !== 'DONE' || !status.reportDocumentId) {
        console.log(`   ⏭️  Skipping - report not ready`)
        continue
      }

      // Download report
      const reportPath = path.join(process.cwd(), 'tmp', `report-${report.reportId}.json`)
      await fs.mkdir(path.dirname(reportPath), { recursive: true })
      
      console.log(`   ⬇️  Downloading to ${reportPath}...`)
      await amazonService.downloadReportToFile(status.reportDocumentId, reportPath)
      
      // Get file size
      const stats = await fs.stat(reportPath)
      console.log(`   📦 File size: ${(stats.size / 1024 / 1024 / 1024).toFixed(2)}GB`)

      // Transform to NDJSON
      const ndjsonPath = reportPath.replace('.json', '.ndjson')
      console.log(`   🔄 Transforming to NDJSON...`)
      
      await transformAmazonReportStreaming(
        reportPath,
        ndjsonPath,
        {
          reportId: report.reportId,
          marketplaceId: 'ATVPDKIKX0DER',
          weekStartDate: report.weekStartDate,
          weekEndDate: getWeekEndDate(report.weekStartDate)
        }
      )
      
      // Load to BigQuery
      console.log(`   ⬆️  Loading to BigQuery...`)
      await bigQueryService.loadSearchTermsData(ndjsonPath)
      
      console.log(`   ✅ Successfully processed week ${report.weekStartDate}`)
      
      // Clean up files
      await fs.unlink(reportPath).catch(() => {})
      await fs.unlink(ndjsonPath).catch(() => {})
      
    } catch (error) {
      console.error(`   ❌ Error processing report ${report.reportId}:`, error)
    }
  }
  
  console.log('\n✅ Finished processing existing reports')
}

function getWeekEndDate(weekStartStr: string): string {
  const startDate = new Date(weekStartStr + 'T00:00:00.000Z')
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  return endDate.toISOString().split('T')[0]
}

// Run the script
processExistingReports().catch(console.error)