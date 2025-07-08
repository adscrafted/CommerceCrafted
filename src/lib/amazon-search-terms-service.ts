// Amazon SP-API Search Terms Report Service
// Handles requesting and downloading Top Search Terms reports

import SellingPartner from 'amazon-sp-api'
import axios from 'axios'
import { z } from 'zod'

// Configuration for the SP-API client
const SP_API_CONFIG = {
  region: process.env.AMAZON_SP_API_REGION || 'na',
  options: {
    auto_request_throttled: true,
    use_sandbox: false
  }
}

// Schema for search term report data
export const SearchTermDataSchema = z.object({
  searchTerm: z.string(),
  searchVolume: z.number(),
  clickShare: z.number(),
  conversionShare: z.number(),
  relevance: z.number(),
  impressionShare: z.number().optional(),
  clickedAsin: z.string().optional(),
  clickedProductTitle: z.string().optional(),
  clickThroughRate: z.number().optional(),
  conversionRate: z.number().optional(),
})

export type SearchTermData = z.infer<typeof SearchTermDataSchema>

// Schema for report metadata
export const ReportMetadataSchema = z.object({
  reportId: z.string(),
  reportType: z.string(),
  dataStartTime: z.string(),
  dataEndTime: z.string(),
  createdTime: z.string(),
  processingStatus: z.enum(['IN_QUEUE', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'FATAL']),
  reportDocumentId: z.string().optional(),
})

export type ReportMetadata = z.infer<typeof ReportMetadataSchema>

export class AmazonSearchTermsService {
  private client: any
  
  constructor() {
    // Set credentials as environment variables for the library
    process.env.SELLING_PARTNER_APP_CLIENT_ID = process.env.AMAZON_SP_API_CLIENT_ID
    process.env.SELLING_PARTNER_APP_CLIENT_SECRET = process.env.AMAZON_SP_API_CLIENT_SECRET
    
    this.client = new SellingPartner({
      region: SP_API_CONFIG.region,
      refresh_token: process.env.AMAZON_SP_API_REFRESH_TOKEN!,
      options: SP_API_CONFIG.options
    })
  }

  // Request a new Top Search Terms report
  async requestTopSearchTermsReport(options: {
    startDate: Date
    endDate: Date
    marketplaceId?: string
  }): Promise<ReportMetadata> {
    try {
      const marketplaceId = options.marketplaceId || process.env.SP_API_MARKETPLACE_ID || 'ATVPDKIKX0DER'
      
      const response = await this.client.callAPI({
        operation: 'createReport',
        endpoint: 'reports',
        path: '/reports/2021-06-30/reports',
        method: 'POST',
        body: {
          reportType: 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT',
          dataStartTime: options.startDate.toISOString(),
          dataEndTime: options.endDate.toISOString(),
          marketplaceIds: [marketplaceId],
          reportOptions: {
            reportPeriod: 'WEEK' // Can be DAY, WEEK, MONTH, QUARTER
          }
        }
      })

      console.log('Raw API response:', JSON.stringify(response, null, 2))

      const metadata: ReportMetadata = {
        reportId: response.reportId,
        reportType: response.reportType || 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT',
        dataStartTime: response.dataStartTime || options.startDate.toISOString(),
        dataEndTime: response.dataEndTime || options.endDate.toISOString(),
        createdTime: response.createdTime || new Date().toISOString(),
        processingStatus: response.processingStatus || 'IN_QUEUE',
        reportDocumentId: response.reportDocumentId
      }

      return metadata
    } catch (error) {
      console.error('Error requesting search terms report:', error)
      throw new Error(`Failed to request search terms report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Check report status
  async getReportStatus(reportId: string): Promise<ReportMetadata> {
    try {
      const response = await this.client.callAPI({
        operation: 'getReport',
        endpoint: 'reports',
        path: {
          reportId: reportId
        }
      })

      console.log('Get report status response:', JSON.stringify(response, null, 2))

      const metadata: ReportMetadata = {
        reportId: response.reportId || reportId,
        reportType: response.reportType || 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT',
        dataStartTime: response.dataStartTime || '',
        dataEndTime: response.dataEndTime || '',
        createdTime: response.createdTime || '',
        processingStatus: response.processingStatus || 'UNKNOWN',
        reportDocumentId: response.reportDocumentId
      }

      return metadata
    } catch (error) {
      console.error('Error checking report status:', error)
      throw new Error(`Failed to check report status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Download report document to file using streaming (for large files)
  async downloadReportToFile(reportDocumentId: string, outputPath: string): Promise<void> {
    try {
      // Get report document details including download URL
      const documentResponse = await this.client.callAPI({
        operation: 'getReportDocument',
        endpoint: 'reports',
        path: {
          reportDocumentId: reportDocumentId
        }
      })

      const { url, compressionAlgorithm } = documentResponse
      
      console.log('Document details:', { url: url.substring(0, 50) + '...', compressionAlgorithm })

      const fs = require('fs')
      const stream = require('stream')
      const util = require('util')
      const pipeline = util.promisify(stream.pipeline)

      // Download the report data using streaming
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      })

      // Handle compression if needed
      if (compressionAlgorithm === 'GZIP') {
        const zlib = require('zlib')
        const gunzip = zlib.createGunzip()
        
        await pipeline(
          response.data,
          gunzip,
          fs.createWriteStream(outputPath)
        )
      } else {
        await pipeline(
          response.data,
          fs.createWriteStream(outputPath)
        )
      }

      console.log(`Report downloaded successfully to ${outputPath}`)
    } catch (error) {
      console.error('Error downloading report to file:', error)
      throw new Error(`Failed to download report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Download report document
  async downloadReport(reportDocumentId: string): Promise<string> {
    try {
      // Get report document details including download URL
      const documentResponse = await this.client.callAPI({
        operation: 'getReportDocument',
        endpoint: 'reports',
        path: {
          reportDocumentId: reportDocumentId
        }
      })

      const { url, compressionAlgorithm } = documentResponse
      
      console.log('Document details:', { url: url.substring(0, 50) + '...', compressionAlgorithm })

      // Download the report data
      const downloadResponse = await axios.get(url, {
        responseType: compressionAlgorithm ? 'arraybuffer' : 'text',
        decompress: true
      })

      // Handle compression if needed
      if (compressionAlgorithm === 'GZIP') {
        const zlib = require('zlib')
        const decompressed = zlib.gunzipSync(Buffer.from(downloadResponse.data))
        return decompressed.toString('utf-8')
      }

      return downloadResponse.data
    } catch (error) {
      console.error('Error downloading report:', error)
      throw new Error(`Failed to download report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Parse Brand Analytics Search Terms Report CSV data
   * 
   * Expected columns in the report:
   * - Department
   * - Search Term
   * - Search Frequency Rank (1 = highest volume)
   * - #1 Clicked ASIN
   * - #1 Product Title
   * - #1 Click Share (percentage)
   * - #1 Conversion Share (percentage)
   * - #2 Clicked ASIN
   * - #2 Product Title
   * - #2 Click Share
   * - #2 Conversion Share
   * - #3 Clicked ASIN
   * - #3 Product Title
   * - #3 Click Share
   * - #3 Conversion Share
   */
  parseSearchTermsReport(csvData: string): SearchTermData[] {
    const lines = csvData.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('Invalid CSV data: no data rows found')
    }

    // Parse header row
    const headers = lines[0].split('\t').map(h => h.trim())
    
    // Expected headers for Brand Analytics Search Terms Report
    const departmentIndex = headers.findIndex(h => h === 'Department')
    const searchTermIndex = headers.findIndex(h => h === 'Search Term')
    const searchFrequencyRankIndex = headers.findIndex(h => h === 'Search Frequency Rank')
    
    // Find indices for top 3 clicked products
    const clickedAsin1Index = headers.findIndex(h => h === '#1 Clicked ASIN')
    const productTitle1Index = headers.findIndex(h => h === '#1 Product Title')
    const clickShare1Index = headers.findIndex(h => h === '#1 Click Share')
    const conversionShare1Index = headers.findIndex(h => h === '#1 Conversion Share')
    
    const clickedAsin2Index = headers.findIndex(h => h === '#2 Clicked ASIN')
    const clickShare2Index = headers.findIndex(h => h === '#2 Click Share')
    const conversionShare2Index = headers.findIndex(h => h === '#2 Conversion Share')
    
    const clickedAsin3Index = headers.findIndex(h => h === '#3 Clicked ASIN')
    const clickShare3Index = headers.findIndex(h => h === '#3 Click Share')
    const conversionShare3Index = headers.findIndex(h => h === '#3 Conversion Share')
    
    if (searchTermIndex === -1 || searchFrequencyRankIndex === -1) {
      throw new Error('Invalid CSV format: Required columns not found')
    }

    const results: SearchTermData[] = []

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split('\t').map(v => v.trim())
      if (row.length < headers.length) continue

      // Parse click share and conversion share values (remove % sign and convert to decimal)
      const parsePercentage = (value: string): number => {
        if (!value || value === 'N/A') return 0
        return parseFloat(value.replace('%', '')) / 100
      }

      // Use the #1 clicked product data as the primary data
      const clickShare = clickShare1Index !== -1 ? parsePercentage(row[clickShare1Index]) : 0
      const conversionShare = conversionShare1Index !== -1 ? parsePercentage(row[conversionShare1Index]) : 0
      
      // Calculate total click share and conversion share from all 3 products
      const totalClickShare = clickShare + 
        (clickShare2Index !== -1 ? parsePercentage(row[clickShare2Index]) : 0) +
        (clickShare3Index !== -1 ? parsePercentage(row[clickShare3Index]) : 0)
        
      const totalConversionShare = conversionShare +
        (conversionShare2Index !== -1 ? parsePercentage(row[conversionShare2Index]) : 0) +
        (conversionShare3Index !== -1 ? parsePercentage(row[conversionShare3Index]) : 0)

      const searchTermData: SearchTermData = {
        searchTerm: row[searchTermIndex],
        // Search Frequency Rank is inversely related to volume (lower rank = higher volume)
        // Rank 1 = highest search volume, Rank 1000000+ = lowest search volume
        searchVolume: parseInt(row[searchFrequencyRankIndex]) || 0,
        clickShare: clickShare,
        conversionShare: conversionShare,
        relevance: 0, // Calculate based on other metrics
        // Optional fields
        clickedAsin: clickedAsin1Index !== -1 ? row[clickedAsin1Index] : undefined,
        clickedProductTitle: productTitle1Index !== -1 ? row[productTitle1Index] : undefined,
        // Calculate CTR and CR based on total share across top 3 products
        clickThroughRate: totalClickShare,
        conversionRate: totalConversionShare,
      }

      // Calculate relevance score based on available metrics
      searchTermData.relevance = this.calculateRelevanceScore(searchTermData)

      results.push(searchTermData)
    }

    return results
  }

  // Calculate relevance score for search terms
  private calculateRelevanceScore(data: SearchTermData): number {
    // Weighted scoring based on different metrics
    const volumeWeight = 0.3
    const clickWeight = 0.4
    const conversionWeight = 0.3

    // Normalize search volume (Search Frequency Rank is inversely related to volume)
    // Rank 1 = highest volume (score 1.0), Rank 1000000+ = lowest volume (score 0.0)
    const normalizedVolume = data.searchVolume > 0 
      ? Math.max(0, 1 - Math.log10(data.searchVolume) / 6) // log10(1000000) = 6
      : 0
    
    const score = 
      (normalizedVolume * volumeWeight) +
      (data.clickShare * clickWeight) +
      (data.conversionShare * conversionWeight)

    return Math.round(score * 100) / 100
  }

  // Complete workflow: request, wait, and download report
  async getTopSearchTerms(options: {
    startDate: Date
    endDate: Date
    marketplaceId?: string
    maxWaitTime?: number // Maximum time to wait for report in milliseconds
  }): Promise<SearchTermData[]> {
    const maxWaitTime = options.maxWaitTime || 5 * 60 * 1000 // Default 5 minutes
    const pollInterval = 10000 // Poll every 10 seconds

    // Request the report
    const reportMetadata = await this.requestTopSearchTermsReport(options)
    console.log(`Report requested: ${reportMetadata.reportId}`)

    // Poll for report completion
    const startTime = Date.now()
    let status = reportMetadata

    while (status.processingStatus !== 'DONE' && status.processingStatus !== 'FATAL') {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error(`Report generation timed out after ${maxWaitTime}ms`)
      }

      if (status.processingStatus === 'CANCELLED' || status.processingStatus === 'FATAL') {
        throw new Error(`Report generation failed with status: ${status.processingStatus}`)
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      
      // Check status
      status = await this.getReportStatus(reportMetadata.reportId)
      console.log(`Report status: ${status.processingStatus}`)
    }

    if (!status.reportDocumentId) {
      throw new Error('Report completed but no document ID provided')
    }

    // Download and parse the report
    const csvData = await this.downloadReport(status.reportDocumentId)
    const searchTerms = this.parseSearchTermsReport(csvData)

    return searchTerms
  }

  // Get cached report if available (for demo purposes)
  async getCachedSearchTerms(): Promise<SearchTermData[]> {
    // Return sample data for development/testing
    return [
      {
        searchTerm: "wireless earbuds",
        searchVolume: 1,
        clickShare: 0.15,
        conversionShare: 0.08,
        relevance: 0.85,
        clickThroughRate: 0.12,
        conversionRate: 0.05
      },
      {
        searchTerm: "bluetooth headphones",
        searchVolume: 2,
        clickShare: 0.12,
        conversionShare: 0.06,
        relevance: 0.78,
        clickThroughRate: 0.10,
        conversionRate: 0.04
      },
      {
        searchTerm: "noise cancelling earbuds",
        searchVolume: 5,
        clickShare: 0.08,
        conversionShare: 0.04,
        relevance: 0.65,
        clickThroughRate: 0.08,
        conversionRate: 0.03
      },
      // Add more sample data as needed
    ]
  }
}

// Singleton instance - lazy initialization
let _instance: AmazonSearchTermsService | null = null

export const getAmazonSearchTermsService = (): AmazonSearchTermsService => {
  if (!_instance) {
    _instance = new AmazonSearchTermsService()
  }
  return _instance
}