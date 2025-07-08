#!/usr/bin/env node

/**
 * Process pending reports that are actually completed
 * Downloads and uploads directly to BigQuery only
 */

import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })

interface PendingReport {
  reportId: string
  weekStartDate: string
  documentId?: string
}

async function processPendingReports() {
  const amazonService = new AmazonSearchTermsService()
  const bigQueryService = getBigQueryService()
  
  // The 3 pending reports that are actually completed
  const pendingReports: PendingReport[] = [
    { reportId: '1520525020276', weekStartDate: '2025-04-06' },
    { reportId: '1520535020276', weekStartDate: '2025-04-13' },
    { reportId: '1520541020276', weekStartDate: '2025-04-20' }
  ]

  console.log('🚀 Processing Pending Reports to BigQuery')
  console.log('========================================\n')

  for (const report of pendingReports) {
    try {
      console.log(`\n📊 Processing report ${report.reportId} (Week of ${report.weekStartDate})`)
      
      // 1. Check report status to get document ID
      console.log('   📋 Checking report status...')
      const status = await amazonService.getReportStatus(report.reportId)
      
      if (status.processingStatus !== 'DONE' || !status.reportDocumentId) {
        console.log(`   ⏳ Report not ready: ${status.processingStatus}`)
        continue
      }
      
      console.log(`   ✅ Report is DONE with document ID: ${status.reportDocumentId}`)
      
      // 2. Create temp directory if needed
      const tempDir = path.join(process.cwd(), 'tmp')
      await fs.mkdir(tempDir, { recursive: true })
      
      // 3. Download report directly to file (JSON format)
      const reportPath = path.join(tempDir, `report-${report.reportId}.json`)
      console.log(`   ⬇️  Downloading JSON report to ${reportPath}...`)
      
      await amazonService.downloadReportToFile(status.reportDocumentId, reportPath)
      
      // Get file size for verification
      const stats = await fs.stat(reportPath)
      console.log(`   📦 Downloaded ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
      
      // 4. Process JSON directly to BigQuery (no local database)
      console.log('   📤 Processing JSON to BigQuery...')
      
      // Import the streaming parser for JSON processing
      const { transformAmazonReportStreaming } = await import('../src/lib/streaming-json-parser')
      
      // Calculate week end date
      const weekStart = new Date(report.weekStartDate + 'T00:00:00.000Z')
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      
      // Transform JSON to NDJSON
      const ndjsonPath = reportPath.replace('.json', '.ndjson')
      await transformAmazonReportStreaming(
        reportPath,
        ndjsonPath,
        {
          reportId: report.reportId,
          marketplaceId: 'ATVPDKIKX0DER',
          weekStartDate: report.weekStartDate,
          weekEndDate: weekEnd.toISOString().split('T')[0]
        }
      )
      
      // Load to BigQuery
      await bigQueryService.loadSearchTermsData(ndjsonPath)
      
      console.log(`   ✅ Successfully uploaded to BigQuery!`)
      
      // 5. Clean up downloaded file
      await fs.unlink(reportPath).catch(() => {})
      console.log('   🧹 Cleaned up temporary files')
      
    } catch (error) {
      console.error(`\n❌ Error processing report ${report.reportId}:`, error)
    }
  }

  // 6. Update the backfill state file to remove these completed reports
  console.log('\n📝 Updating backfill state file...')
  
  const stateFile = path.join(process.cwd(), '.backfill-state.json')
  const newState = {
    pendingReports: [],
    lastCheck: new Date().toISOString()
  }
  
  await fs.writeFile(stateFile, JSON.stringify(newState, null, 2))
  console.log('✅ State file updated - all reports processed!\n')
}

// Run the script
processPendingReports().catch(console.error)