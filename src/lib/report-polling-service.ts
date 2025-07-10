// Report Polling Service for Amazon SP-API Reports
import { supabase } from '@/lib/supabase'
import { getAmazonSearchTermsService } from './amazon-search-terms-service'
import type { SearchTermData, ReportMetadata } from './amazon-search-terms-service'

interface DatabaseReport {
  id: string
  type: string
  amazonReportId: string
  status: string
  startDate: Date
  endDate: Date
  marketplaceId: string
  userId: string
  createdAt: Date
  completedAt: Date | null
  error: string | null
  reportDocumentId: string | null
  retryCount: number
  lastPolledAt: Date | null
}

type ParsedReportData = SearchTermData | { rawData: string }

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export enum ReportType {
  SEARCH_TERMS = 'SEARCH_TERMS',
  MARKET_BASKET = 'MARKET_BASKET',
  REPEAT_PURCHASE = 'REPEAT_PURCHASE',
  ITEM_COMPARISON = 'ITEM_COMPARISON'
}

interface ReportRequest {
  id: string
  type: ReportType
  amazonReportId: string
  status: ReportStatus
  startDate: Date
  endDate: Date
  marketplaceId: string
  userId: string
  createdAt: Date
  completedAt?: Date
  error?: string
  reportDocumentId?: string
  retryCount: number
  lastPolledAt?: Date
}

// ReportData interface removed - using inline types for better clarity

export class ReportPollingService {
  private pollingInterval: number = 30000 // 30 seconds
  private maxRetries: number = 60 // 30 minutes max
  private isPolling: boolean = false
  private pollingTimer?: NodeJS.Timeout

  // Start polling for all pending reports
  async startPolling(): Promise<void> {
    if (this.isPolling) {
      console.log('Polling already in progress')
      return
    }

    this.isPolling = true
    console.log('Starting report polling service...')

    const poll = async () => {
      try {
        await this.pollPendingReports()
      } catch (error) {
        console.error('Error in polling cycle:', error)
      }

      if (this.isPolling) {
        this.pollingTimer = setTimeout(poll, this.pollingInterval)
      }
    }

    // Start the first poll immediately
    poll()
  }

  // Stop polling
  stopPolling(): void {
    this.isPolling = false
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer)
      this.pollingTimer = undefined
    }
    console.log('Report polling service stopped')
  }

  // Poll all pending reports
  private async pollPendingReports(): Promise<void> {
    try {
      // Get all reports that need polling
      // TODO: Convert to Supabase
      // const { data: pendingReports } = await supabase.from('amazon_reports').select('*').in('status', ['PENDING', 'PROCESSING']).lt('retry_count', this.maxRetries).order('last_polled_at', { ascending: true }).limit(10)
      const pendingReports = []

      if (pendingReports.length === 0) {
        return
      }

      console.log(`Polling ${pendingReports.length} pending reports...`)

      // Process each report
      for (const report of pendingReports) {
        await this.pollSingleReport(report as DatabaseReport)
      }
    } catch (error) {
      console.error('Error polling pending reports:', error)
    }
  }

  // Poll a single report
  private async pollSingleReport(report: ReportRequest): Promise<void> {
    try {
      const service = getAmazonSearchTermsService()
      
      // Get current status from Amazon
      const status = await service.getReportStatus(report.amazonReportId)
      
      // Update last polled time
      // TODO: Convert to Supabase
      // await supabase.from('amazon_reports').update({ last_polled_at: new Date(), retry_count: report.retryCount + 1 }).eq('id', report.id)
      console.log('TODO: Update report poll time in Supabase')

      // Handle different statuses
      switch (status.processingStatus) {
        case 'IN_QUEUE':
        case 'IN_PROGRESS':
          // Still processing, will check again later
          console.log(`Report ${report.amazonReportId} still ${status.processingStatus}`)
          break

        case 'DONE':
          // Report is ready!
          await this.handleCompletedReport(report, status)
          break

        case 'CANCELLED':
        case 'FATAL':
          // Report failed
          await this.handleFailedReport(report, status)
          break

        default:
          console.warn(`Unknown report status: ${status.processingStatus}`)
      }

      // Check if we've exceeded max retries
      if (report.retryCount >= this.maxRetries - 1) {
        // TODO: Convert to Supabase
        // await supabase.from('amazon_reports').update({ status: 'EXPIRED', error: 'Maximum polling attempts exceeded' }).eq('id', report.id)
        console.log('TODO: Update report status in Supabase')
      }

    } catch (error) {
      console.error(`Error polling report ${report.amazonReportId}:`, error)
      
      // Update error count
      // TODO: Convert to Supabase
      // await supabase.from('amazon_reports').update({ error: error instanceof Error ? error.message : 'Unknown error' }).eq('id', report.id)
      console.log('TODO: Update report error in Supabase')
    }
  }

  // Handle completed report
  private async handleCompletedReport(
    report: ReportRequest,
    status: ReportMetadata
  ): Promise<void> {
    if (!status.reportDocumentId) {
      throw new Error('Report completed but no document ID provided')
    }

    console.log(`Report ${report.amazonReportId} completed! Downloading...`)

    try {
      const service = getAmazonSearchTermsService()
      
      // Download the report
      const csvData = await service.downloadReport(status.reportDocumentId)
      
      // Parse the data based on report type
      let parsedData: ParsedReportData[]
      let recordCount: number

      switch (report.type) {
        case ReportType.SEARCH_TERMS:
          parsedData = service.parseSearchTermsReport(csvData)
          recordCount = parsedData.length
          break
        default:
          // For other report types, store raw CSV
          parsedData = [{ rawData: csvData }]
          recordCount = 1
      }

      // Store the parsed data
      // TODO: Convert to Supabase with transaction
      // await supabase.from('amazon_reports').update({ status: 'COMPLETED', completed_at: new Date(), report_document_id: status.reportDocumentId }).eq('id', report.id)
      // if (report.type === ReportType.SEARCH_TERMS) {
      //   await supabase.from('search_terms').insert(searchTermsData.map(...))
      // }
      // await supabase.from('amazon_report_data').insert({ report_id: report.id, data: parsedData, record_count: recordCount })
      console.log('TODO: Store parsed report data in Supabase')

      console.log(`Report ${report.amazonReportId} processed successfully. ${recordCount} records stored.`)

      // Notify user (implement notification service)
      await this.notifyReportCompletion(report, recordCount)

    } catch (error) {
      console.error(`Error processing completed report:`, error)
      
      // TODO: Convert to Supabase
      // await supabase.from('amazon_reports').update({ status: 'FAILED', error: `Failed to process report: ${error instanceof Error ? error.message : 'Unknown error'}` }).eq('id', report.id)
      console.log('TODO: Update report failure in Supabase')
    }
  }

  // Handle failed report
  private async handleFailedReport(
    report: ReportRequest,
    status: ReportMetadata
  ): Promise<void> {
    console.log(`Report ${report.amazonReportId} failed with status ${status.processingStatus}`)

    let errorMessage = `Report failed with status: ${status.processingStatus}`

    // Try to get error details if available
    if (status.reportDocumentId) {
      try {
        const service = getAmazonSearchTermsService()
        const errorData = await service.downloadReport(status.reportDocumentId)
        errorMessage = `Report failed: ${errorData}`
      } catch (e) {
        console.error('Failed to download error details:', e)
      }
    }

    // TODO: Convert to Supabase
    // await supabase.from('amazon_reports').update({ status: 'FAILED', error: errorMessage, completed_at: new Date() }).eq('id', report.id)
    console.log('TODO: Update report failure in Supabase')

    // Notify user of failure
    await this.notifyReportFailure(report, errorMessage)
  }

  // Create a new report request and start polling
  async requestReport(
    userId: string,
    type: ReportType,
    startDate: Date,
    endDate: Date,
    marketplaceId?: string
  ): Promise<string> {
    try {
      // Request the report from Amazon
      const service = getAmazonSearchTermsService()
      const reportMetadata = await service.requestTopSearchTermsReport({
        startDate,
        endDate,
        marketplaceId
      })

      // Create database record
      // TODO: Convert to Supabase
      // const { data: report } = await supabase.from('amazon_reports').insert({ ... }).select().single()
      const report = { id: Math.random().toString(36) }

      console.log(`Created report request ${report.id} with Amazon ID ${reportMetadata.reportId}`)

      // Ensure polling is running
      if (!this.isPolling) {
        this.startPolling()
      }

      return report.id

    } catch (error) {
      console.error('Error requesting report:', error)
      throw error
    }
  }

  // Get report status
  async getReportStatus(reportId: string): Promise<DatabaseReport & { reportData?: { recordCount: number; createdAt: Date } }> {
    // TODO: Convert to Supabase with joins
    // const { data: report } = await supabase.from('amazon_reports').select('*, report_data:amazon_report_data(record_count, created_at)').eq('id', reportId).single()
    const report = null

    if (!report) {
      throw new Error('Report not found')
    }

    return report
  }

  // Get report data
  async getReportData(reportId: string): Promise<{
    id: string
    reportId: string
    data: ParsedReportData[]
    recordCount: number
    createdAt: Date
    report: DatabaseReport
  }> {
    // TODO: Convert to Supabase with joins
    // const { data } = await supabase.from('amazon_report_data').select('*, report:amazon_reports(*)').eq('report_id', reportId).single()
    const data = null

    if (!data) {
      throw new Error('Report data not found')
    }

    return data
  }

  // Notification methods (to be implemented with your notification service)
  private async notifyReportCompletion(report: ReportRequest, recordCount: number): Promise<void> {
    // TODO: Implement email/webhook notification
    console.log(`Notify user ${report.userId}: Report ${report.id} completed with ${recordCount} records`)
  }

  private async notifyReportFailure(report: ReportRequest, error: string): Promise<void> {
    // TODO: Implement email/webhook notification
    console.log(`Notify user ${report.userId}: Report ${report.id} failed - ${error}`)
  }
}

// Singleton instance
let pollingService: ReportPollingService | null = null

export function getReportPollingService(): ReportPollingService {
  if (!pollingService) {
    pollingService = new ReportPollingService()
  }
  return pollingService
}

// Auto-start polling on module load (for production)
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_POLLING === 'true') {
  getReportPollingService().startPolling()
}