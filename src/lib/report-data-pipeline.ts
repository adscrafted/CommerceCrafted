// Data Pipeline for Processing Amazon Reports
import { getAmazonSearchTermsService } from './amazon-search-terms-service'
import { getBigQueryService } from './bigquery-service'
import { supabase } from '@/lib/supabase'
import fs from 'fs/promises'
import { createReadStream, createWriteStream } from 'fs'
import axios from 'axios'
import zlib from 'zlib'
import { pipeline } from 'stream/promises'
import path from 'path'

interface AmazonReport {
  id: string
  amazonReportId: string
  reportDocumentId: string | null
  status: string
  startDate: Date
  endDate: Date
  marketplaceId: string
  user: {
    id: string
    email: string
  }
}

// Remove unused interface - keeping options inline where used

export class ReportDataPipeline {
  private searchTermsService = getAmazonSearchTermsService()
  private bigQueryService = getBigQueryService()
  private tempDir = process.env.TEMP_DIR || '/tmp'

  // Main pipeline process
  async processCompletedReport(reportId: string): Promise<void> {
    console.log(`Starting pipeline for report ${reportId}`)

    try {
      // 1. Get report from database
      const { data: report } = await supabase
        .from('amazon_reports')
        .select('*, user:users(*)')
        .eq('id', reportId)
        .single()

      if (!report || report.status !== 'COMPLETED') {
        throw new Error('Report not found or not completed')
      }

      // 2. Download report from Amazon
      console.log('Downloading report from Amazon...')
      const { downloadPath, recordCount } = await this.downloadAndExtractReport(
        report.report_document_id!,
        report.amazon_report_id
      )

      // 3. Transform to BigQuery format
      console.log('Transforming data for BigQuery...')
      const ndjsonPath = await this.transformToBigQueryFormat(
        downloadPath,
        report
      )

      // 4. Load to BigQuery
      console.log('Loading data to BigQuery...')
      await this.loadToBigQuery(ndjsonPath)

      // 5. Data is ready for querying (no aggregations needed)

      // 6. Clean up temp files
      await this.cleanup([downloadPath, ndjsonPath])

      // 7. Update report metadata
      // TODO: Convert to Supabase - update report_data table
      await supabase
        .from('report_data')
        .insert({
          report_id: reportId,
          data: { processedAt: new Date() },
          record_count: recordCount
        })

      console.log(`Pipeline completed for report ${reportId}`)

    } catch (error) {
      console.error('Pipeline error:', error)
      
      // Update report with error
      await supabase
        .from('amazon_reports')
        .update({
          error: `Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
        .eq('id', reportId)
      
      throw error
    }
  }

  // Download and extract report from Amazon
  private async downloadAndExtractReport(
    reportDocumentId: string,
    reportId: string
  ): Promise<{ downloadPath: string, recordCount: number }> {
    // Get download URL from Amazon
    const client = (this.searchTermsService as { client: unknown }).client
    const documentResponse = await client.callAPI({
      operation: 'getReportDocument',
      endpoint: 'reports',
      path: { reportDocumentId }
    })

    const compressedPath = path.join(this.tempDir, `report-${reportId}.gz`)
    const extractedPath = path.join(this.tempDir, `report-${reportId}.json`)

    // Download compressed file
    const response = await axios({
      method: 'GET',
      url: documentResponse.url,
      responseType: 'stream'
    })

    await pipeline(
      response.data,
      createWriteStream(compressedPath)
    )

    // Extract
    await pipeline(
      createReadStream(compressedPath),
      zlib.createGunzip(),
      createWriteStream(extractedPath)
    )

    // Count records (rough estimate)
    const stats = await fs.stat(extractedPath)
    const estimatedRecords = Math.floor(stats.size / 200) // ~200 bytes per record

    // Clean up compressed file
    await fs.unlink(compressedPath)

    return {
      downloadPath: extractedPath,
      recordCount: estimatedRecords
    }
  }

  // Transform to BigQuery format
  private async transformToBigQueryFormat(
    inputPath: string,
    report: AmazonReport
  ): Promise<string> {
    const outputPath = path.join(this.tempDir, `report-${report.id}-bq.ndjson`)

    await this.bigQueryService.transformReportToBigQueryFormat(
      inputPath,
      outputPath,
      {
        reportId: report.id,
        marketplaceId: report.marketplace_id,
        weekStartDate: new Date(report.start_date).toISOString().split('T')[0],
        weekEndDate: new Date(report.end_date).toISOString().split('T')[0]
      }
    )

    return outputPath
  }

  // Load to BigQuery
  private async loadToBigQuery(ndjsonPath: string): Promise<void> {
    await this.bigQueryService.loadSearchTermsData(ndjsonPath)
  }


  // Clean up temporary files
  private async cleanup(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.unlink(filePath)
      } catch (error) {
        console.warn(`Failed to delete ${filePath}:`, error)
      }
    }
  }
}

// Integration with polling service
export async function enhancePollingService(): Promise<void> {
  const { getReportPollingService } = await import('./report-polling-service')
  const pollingService = getReportPollingService()
  const pipeline = new ReportDataPipeline()

  // Override the handleCompletedReport method
  const originalHandler = pollingService.handleCompletedReport
  
  pollingService.handleCompletedReport = async function(report: AmazonReport & { type?: string }, status: unknown) {
    // Call original handler first
    await originalHandler.call(this, report, status)
    
    // Then run BigQuery pipeline
    if (report.type === 'SEARCH_TERMS') {
      try {
        await pipeline.processCompletedReport(report.id)
      } catch (error) {
        console.error('BigQuery pipeline failed:', error)
      }
    }
  }
}