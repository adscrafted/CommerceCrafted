// Report Polling Service for Amazon SP-API Reports
import { prisma } from '@/lib/prisma'
import { getAmazonSearchTermsService } from './amazon-search-terms-service'
import type { SearchTermData, ReportMetadata } from './amazon-search-terms-service'

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

interface ReportData {
  id: string
  reportRequestId: string
  data: any
  recordCount: number
  createdAt: Date
}

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
      const pendingReports = await prisma.amazonReport.findMany({
        where: {
          status: {
            in: ['PENDING', 'PROCESSING']
          },
          retryCount: {
            lt: this.maxRetries
          }
        },
        orderBy: {
          lastPolledAt: 'asc'
        },
        take: 10 // Process up to 10 reports at a time
      })

      if (pendingReports.length === 0) {
        return
      }

      console.log(`Polling ${pendingReports.length} pending reports...`)

      // Process each report
      for (const report of pendingReports) {
        await this.pollSingleReport(report as any)
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
      await prisma.amazonReport.update({
        where: { id: report.id },
        data: { 
          lastPolledAt: new Date(),
          retryCount: { increment: 1 }
        }
      })

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
        await prisma.amazonReport.update({
          where: { id: report.id },
          data: {
            status: 'EXPIRED',
            error: 'Maximum polling attempts exceeded'
          }
        })
      }

    } catch (error) {
      console.error(`Error polling report ${report.amazonReportId}:`, error)
      
      // Update error count
      await prisma.amazonReport.update({
        where: { id: report.id },
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
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
      let parsedData: any[]
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
      await prisma.$transaction(async (tx) => {
        // Update report status
        await tx.amazonReport.update({
          where: { id: report.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            reportDocumentId: status.reportDocumentId
          }
        })

        // Store the data
        if (report.type === ReportType.SEARCH_TERMS) {
          // Store search terms data
          const searchTermsData = parsedData as SearchTermData[]
          
          // Create search terms records
          await tx.searchTerm.createMany({
            data: searchTermsData.map(term => ({
              reportId: report.id,
              term: term.searchTerm,
              searchVolume: term.searchVolume,
              clickShare: term.clickShare,
              conversionShare: term.conversionShare,
              relevanceScore: term.relevance,
              clickedAsin: term.clickedAsin,
              clickedProductTitle: term.clickedProductTitle,
              weekStartDate: report.startDate,
              weekEndDate: report.endDate,
              marketplaceId: report.marketplaceId
            }))
          })
        }

        // Create report data record
        await tx.amazonReportData.create({
          data: {
            reportId: report.id,
            data: parsedData,
            recordCount: recordCount
          }
        })
      })

      console.log(`Report ${report.amazonReportId} processed successfully. ${recordCount} records stored.`)

      // Notify user (implement notification service)
      await this.notifyReportCompletion(report, recordCount)

    } catch (error) {
      console.error(`Error processing completed report:`, error)
      
      await prisma.amazonReport.update({
        where: { id: report.id },
        data: {
          status: 'FAILED',
          error: `Failed to process report: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      })
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

    await prisma.amazonReport.update({
      where: { id: report.id },
      data: {
        status: 'FAILED',
        error: errorMessage,
        completedAt: new Date()
      }
    })

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
      const report = await prisma.amazonReport.create({
        data: {
          type,
          amazonReportId: reportMetadata.reportId,
          status: 'PENDING',
          startDate,
          endDate,
          marketplaceId: marketplaceId || process.env.SP_API_MARKETPLACE_ID || 'ATVPDKIKX0DER',
          userId,
          retryCount: 0
        }
      })

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
  async getReportStatus(reportId: string): Promise<any> {
    const report = await prisma.amazonReport.findUnique({
      where: { id: reportId },
      include: {
        reportData: {
          select: {
            recordCount: true,
            createdAt: true
          }
        }
      }
    })

    if (!report) {
      throw new Error('Report not found')
    }

    return report
  }

  // Get report data
  async getReportData(reportId: string): Promise<any> {
    const data = await prisma.amazonReportData.findFirst({
      where: { reportId },
      include: {
        report: true
      }
    })

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