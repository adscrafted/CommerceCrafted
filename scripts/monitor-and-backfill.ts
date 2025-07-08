#!/usr/bin/env node

/**
 * Monitor and Backfill Service
 * Continuously monitors report status and processes completed reports
 */

import { getBackfillService } from '../src/lib/backfill-service'
import { getDuplicatePreventionService } from '../src/lib/duplicate-prevention-service'
import { AmazonSearchTermsService } from '../src/lib/amazon-search-terms-service'
import { getBigQueryService } from '../src/lib/bigquery-service'
import { ReportPollingService } from '../src/lib/report-polling-service'
import { config } from 'dotenv'
import fs from 'fs/promises'
import path from 'path'

// Load environment variables
config({ path: '.env.local' })

interface PendingReport {
  reportId: string
  weekStartDate: string
  requestedAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
}

class MonitorAndBackfillService {
  private pendingReports: Map<string, PendingReport> = new Map()
  private amazonService = new AmazonSearchTermsService()
  private backfillService = getBackfillService()
  private duplicateService = getDuplicatePreventionService()
  private bigQueryService = getBigQueryService()
  private pollingService = new ReportPollingService()
  
  private stateFile = path.join(process.cwd(), '.backfill-state.json')
  private maxConcurrentReports = 1
  private checkInterval = 5 * 60 * 1000 // 5 minutes
  private maxWeeksToBackfill = 13

  async start() {
    console.log('🚀 Monitor and Backfill Service Started')
    console.log('=====================================\n')

    // Load previous state if exists
    await this.loadState()

    // Initial check
    await this.checkAndProcess()

    // Set up continuous monitoring
    setInterval(() => {
      this.checkAndProcess().catch(console.error)
    }, this.checkInterval)

    console.log(`⏰ Monitoring every ${this.checkInterval / 60000} minutes...`)
    console.log('💡 Press Ctrl+C to stop\n')
  }

  private async loadState() {
    try {
      const stateData = await fs.readFile(this.stateFile, 'utf-8')
      const state = JSON.parse(stateData)
      
      state.pendingReports.forEach((report: PendingReport) => {
        this.pendingReports.set(report.reportId, {
          ...report,
          requestedAt: new Date(report.requestedAt)
        })
      })
      
      console.log(`📂 Loaded ${this.pendingReports.size} pending reports from state`)
    } catch (error) {
      console.log('📂 No previous state found, starting fresh')
    }
  }

  private async saveState() {
    const state = {
      pendingReports: Array.from(this.pendingReports.values()),
      lastCheck: new Date().toISOString()
    }
    
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2))
  }

  private async checkAndProcess() {
    console.log(`\n🔍 [${new Date().toLocaleTimeString()}] Checking status...`)

    try {
      // 1. Check status of pending reports
      await this.checkPendingReports()

      // 2. Request new reports if we have capacity
      await this.requestNewReports()

      // 3. Save current state
      await this.saveState()

      // 4. Show summary
      this.showSummary()

    } catch (error) {
      console.error('❌ Error during check:', error)
    }
  }

  private async checkPendingReports() {
    const reportIds = Array.from(this.pendingReports.keys())
    
    if (reportIds.length === 0) {
      console.log('   📋 No pending reports to check')
      return
    }

    console.log(`   📋 Checking ${reportIds.length} pending reports...`)

    for (const reportId of reportIds) {
      const report = this.pendingReports.get(reportId)!
      
      try {
        // Check report status
        const status = await this.amazonService.getReportStatus(reportId)
        console.log(`   📊 Report ${reportId}: ${status.processingStatus}`)

        if (status.processingStatus === 'DONE' && status.reportDocumentId) {
          // Download and process the report
          console.log(`   ⬇️  Downloading report ${reportId}...`)
          
          // Download report directly to file using streaming
          const reportPath = path.join(process.cwd(), 'tmp', `report-${reportId}.json`)
          await fs.mkdir(path.dirname(reportPath), { recursive: true })
          
          console.log(`   📥 Downloading to ${reportPath}...`)
          await this.amazonService.downloadReportToFile(status.reportDocumentId, reportPath)

          // Process the JSON report using streaming parser
          console.log(`   📥 Processing JSON report for week ${report.weekStartDate}...`)
          
          const { transformAmazonReportStreaming } = await import('../src/lib/streaming-json-parser')
          const ndjsonPath = reportPath.replace('.json', '.ndjson')
          
          await transformAmazonReportStreaming(
            reportPath,
            ndjsonPath,
            {
              reportId: reportId,
              marketplaceId: 'ATVPDKIKX0DER',
              weekStartDate: report.weekStartDate,
              weekEndDate: this.getWeekEndDate(report.weekStartDate)
            }
          )
          
          // Load to BigQuery
          await this.bigQueryService.loadSearchTermsData(ndjsonPath)

          console.log(`   ✅ Successfully processed week ${report.weekStartDate}`)
          
          // Mark as completed and remove from pending
          report.status = 'completed'
          this.pendingReports.delete(reportId)

          // Clean up downloaded files
          await fs.unlink(reportPath).catch(() => {})
          await fs.unlink(ndjsonPath).catch(() => {})

        } else if (status.processingStatus === 'CANCELLED' || status.processingStatus === 'FATAL') {
          console.error(`   ❌ Report ${reportId} failed: ${status.processingStatus}`)
          report.status = 'failed'
          report.attempts++
          
          // Remove if too many attempts
          if (report.attempts > 3) {
            this.pendingReports.delete(reportId)
          }
        }
        // Otherwise still processing, keep waiting

      } catch (error) {
        console.error(`   ❌ Error checking report ${reportId}:`, error)
        report.attempts++
        
        if (report.attempts > 5) {
          this.pendingReports.delete(reportId)
        }
      }
    }
  }

  private async requestNewReports() {
    // Check if we have capacity for new reports
    const pendingCount = this.pendingReports.size
    
    if (pendingCount >= this.maxConcurrentReports) {
      console.log(`   ⏸️  At capacity (${pendingCount}/${this.maxConcurrentReports} reports)`)
      return
    }

    // Get missing weeks
    const missingWeeks = await this.backfillService.getMissingWeeksForBackfill()
    
    if (missingWeeks.length === 0) {
      console.log('   ✅ All historical data is complete!')
      return
    }

    // Calculate how many new reports we can request
    const canRequest = this.maxConcurrentReports - pendingCount
    const toRequest = Math.min(canRequest, missingWeeks.length)
    
    console.log(`   📅 Found ${missingWeeks.length} missing weeks`)
    console.log(`   🎯 Requesting ${toRequest} new reports...`)

    for (let i = 0; i < toRequest; i++) {
      const weekDate = missingWeeks[i]
      const weekStr = weekDate.toISOString().split('T')[0]
      
      // Check if enough time has passed since last request (15 min rate limit)
      const lastRequestTime = Math.max(
        ...Array.from(this.pendingReports.values()).map(r => r.requestedAt.getTime())
      )
      
      const timeSinceLastRequest = Date.now() - lastRequestTime
      const waitTime = Math.max(0, 15 * 60 * 1000 - timeSinceLastRequest)
      
      if (waitTime > 0 && this.pendingReports.size > 0) {
        console.log(`   ⏳ Waiting ${Math.ceil(waitTime / 60000)} minutes for rate limit...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }

      try {
        console.log(`   📤 Requesting report for week ${weekStr}...`)
        const reportId = await this.backfillService.requestHistoricalWeek(weekDate)
        
        // Add to pending reports
        this.pendingReports.set(reportId, {
          reportId,
          weekStartDate: weekStr,
          requestedAt: new Date(),
          status: 'pending',
          attempts: 0
        })
        
        console.log(`   ✅ Report ${reportId} requested for week ${weekStr}`)
        
      } catch (error) {
        console.error(`   ❌ Failed to request week ${weekStr}:`, error)
      }
    }
  }

  private getWeekEndDate(weekStartStr: string): string {
    const startDate = new Date(weekStartStr + 'T00:00:00.000Z')
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return endDate.toISOString().split('T')[0]
  }

  private showSummary() {
    console.log('\n📊 Current Status:')
    console.log('==================')
    
    const reports = Array.from(this.pendingReports.values())
    const pending = reports.filter(r => r.status === 'pending' || r.status === 'processing')
    const failed = reports.filter(r => r.status === 'failed')
    
    console.log(`⏳ Pending reports: ${pending.length}`)
    if (pending.length > 0) {
      pending.forEach(r => {
        const age = Math.floor((Date.now() - r.requestedAt.getTime()) / 60000)
        console.log(`   • ${r.reportId} (${r.weekStartDate}) - ${age} minutes old`)
      })
    }
    
    if (failed.length > 0) {
      console.log(`❌ Failed reports: ${failed.length}`)
      failed.forEach(r => {
        console.log(`   • ${r.reportId} (${r.weekStartDate}) - ${r.attempts} attempts`)
      })
    }
    
    console.log(`\n⏰ Next check in ${this.checkInterval / 60000} minutes...`)
  }
}

// Start the service
const service = new MonitorAndBackfillService()

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...')
  await service['saveState']()
  process.exit(0)
})

service.start().catch(console.error)