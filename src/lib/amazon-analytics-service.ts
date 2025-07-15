import { SellingPartnerAPI } from 'amazon-sp-api'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryClient } from './bigquery-client'
import { z } from 'zod'

// Schema for Brand Analytics Search Terms data
export const searchTermsSchema = z.object({
  reportDate: z.string(),
  marketplace: z.string(),
  searchTerm: z.string(),
  searchFrequencyRank: z.number(),
  searchFrequencyPercentage: z.number().optional(),
  clickedASIN1: z.string().nullable(),
  productTitle1: z.string().nullable(),
  clickShare1: z.number().nullable(),
  conversionShare1: z.number().nullable(),
  clickedASIN2: z.string().nullable(),
  productTitle2: z.string().nullable(),
  clickShare2: z.number().nullable(),
  conversionShare2: z.number().nullable(),
  clickedASIN3: z.string().nullable(),
  productTitle3: z.string().nullable(),
  clickShare3: z.number().nullable(),
  conversionShare3: z.number().nullable(),
})

export type SearchTermsData = z.infer<typeof searchTermsSchema>

// Schema for processed analytics data
export const processedSearchTermsSchema = z.object({
  keyword: z.string(),
  searchFrequencyRank: z.number(),
  weeklySearchVolume: z.number(),
  weeklySearchVolumeGrowth: z.number(),
  top3ClickShare: z.number(),
  top3ConversionShare: z.number(),
  topASINs: z.array(z.object({
    asin: z.string(),
    title: z.string(),
    clickShare: z.number(),
    conversionShare: z.number(),
    position: z.number(),
  })),
  trendData: z.array(z.object({
    week: z.string(),
    rank: z.number(),
    searchVolume: z.number(),
  })),
})

export type ProcessedSearchTerms = z.infer<typeof processedSearchTermsSchema>

export class AmazonAnalyticsService {
  private spApi: SellingPartnerAPI
  private bigQuery: BigQuery | null
  private datasetId: string
  private tableId: string

  constructor() {
    // Initialize Amazon SP-API
    this.spApi = new SellingPartnerAPI({
      region: process.env.AMAZON_SP_API_REGION || 'na',
      refresh_token: process.env.AMAZON_SP_API_REFRESH_TOKEN!,
      client_id: process.env.AMAZON_SP_API_CLIENT_ID!,
      client_secret: process.env.AMAZON_SP_API_CLIENT_SECRET!,
      access_token: process.env.AMAZON_SP_API_ACCESS_TOKEN,
    })

    // Initialize BigQuery using the new client
    try {
      this.bigQuery = getBigQueryClient()
    } catch (error) {
      console.warn('BigQuery not configured:', error)
      this.bigQuery = null
    }

    this.datasetId = process.env.BIGQUERY_DATASET || 'amazon_analytics'
    this.tableId = 'search_terms'
  }

  /**
   * Fetch Brand Analytics Search Terms Report from Amazon SP-API
   */
  async fetchSearchTermsReport(
    startDate: string,
    endDate: string,
    marketplaceId: string = 'ATVPDKIKX0DER' // US marketplace
  ): Promise<SearchTermsData[]> {
    try {
      // Create report request
      const reportResponse = await this.spApi.callAPI({
        operation: 'createReport',
        body: {
          reportType: 'GET_BRAND_ANALYTICS_SEARCH_TERMS_REPORT',
          marketplaceIds: [marketplaceId],
          dataStartTime: startDate,
          dataEndTime: endDate,
        },
      })

      const reportId = reportResponse.reportId

      // Wait for report to be ready
      let reportStatus = 'IN_QUEUE'
      let reportDocument = null

      while (reportStatus === 'IN_QUEUE' || reportStatus === 'IN_PROGRESS') {
        await new Promise(resolve => setTimeout(resolve, 30000)) // Wait 30 seconds

        const statusResponse = await this.spApi.callAPI({
          operation: 'getReport',
          path: {
            reportId: reportId,
          },
        })

        reportStatus = statusResponse.processingStatus

        if (reportStatus === 'DONE') {
          reportDocument = statusResponse.reportDocumentId
        } else if (reportStatus === 'CANCELLED' || reportStatus === 'FATAL') {
          throw new Error(`Report generation failed with status: ${reportStatus}`)
        }
      }

      // Get report document
      const documentResponse = await this.spApi.callAPI({
        operation: 'getReportDocument',
        path: {
          reportDocumentId: reportDocument,
        },
      })

      // Download and parse the report
      const reportData = await this.downloadReport(documentResponse.url)
      return this.parseSearchTermsReport(reportData)

    } catch (error) {
      console.error('Error fetching search terms report:', error)
      throw error
    }
  }

  /**
   * Download report from S3 URL
   */
  private async downloadReport(url: string): Promise<string> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`)
    }
    return response.text()
  }

  /**
   * Parse CSV report data
   */
  private parseSearchTermsReport(csvData: string): SearchTermsData[] {
    const lines = csvData.split('\n')
    const headers = lines[0].split('\t')
    const data: SearchTermsData[] = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split('\t')
      const row: any = {}

      headers.forEach((header, index) => {
        row[this.mapHeaderToField(header)] = values[index]
      })

      // Convert numeric fields
      row.searchFrequencyRank = parseInt(row.searchFrequencyRank) || 0
      row.searchFrequencyPercentage = parseFloat(row.searchFrequencyPercentage) || 0
      row.clickShare1 = parseFloat(row.clickShare1) || null
      row.conversionShare1 = parseFloat(row.conversionShare1) || null
      row.clickShare2 = parseFloat(row.clickShare2) || null
      row.conversionShare2 = parseFloat(row.conversionShare2) || null
      row.clickShare3 = parseFloat(row.clickShare3) || null
      row.conversionShare3 = parseFloat(row.conversionShare3) || null

      data.push(searchTermsSchema.parse(row))
    }

    return data
  }

  /**
   * Map Amazon report headers to our field names
   */
  private mapHeaderToField(header: string): string {
    const mapping: { [key: string]: string } = {
      'Search Term': 'searchTerm',
      'Search Frequency Rank': 'searchFrequencyRank',
      'Search Frequency Percentage': 'searchFrequencyPercentage',
      '#1 Clicked ASIN': 'clickedASIN1',
      '#1 Product Title': 'productTitle1',
      '#1 Click Share': 'clickShare1',
      '#1 Conversion Share': 'conversionShare1',
      '#2 Clicked ASIN': 'clickedASIN2',
      '#2 Product Title': 'productTitle2',
      '#2 Click Share': 'clickShare2',
      '#2 Conversion Share': 'conversionShare2',
      '#3 Clicked ASIN': 'clickedASIN3',
      '#3 Product Title': 'productTitle3',
      '#3 Click Share': 'clickShare3',
      '#3 Conversion Share': 'conversionShare3',
    }

    return mapping[header] || header.toLowerCase().replace(/\s+/g, '_')
  }

  /**
   * Store search terms data in BigQuery
   */
  async storeInBigQuery(data: SearchTermsData[]): Promise<void> {
    if (!this.bigQuery) {
      throw new Error('BigQuery client not configured')
    }
    try {
      // Ensure dataset exists
      const [datasetExists] = await this.bigQuery.dataset(this.datasetId).exists()
      if (!datasetExists) {
        await this.bigQuery.createDataset(this.datasetId)
      }

      // Ensure table exists
      const dataset = this.bigQuery.dataset(this.datasetId)
      const [tableExists] = await dataset.table(this.tableId).exists()
      
      if (!tableExists) {
        await dataset.createTable(this.tableId, {
          schema: {
            fields: [
              { name: 'reportDate', type: 'DATE', mode: 'REQUIRED' },
              { name: 'marketplace', type: 'STRING', mode: 'REQUIRED' },
              { name: 'searchTerm', type: 'STRING', mode: 'REQUIRED' },
              { name: 'searchFrequencyRank', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'searchFrequencyPercentage', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'clickedASIN1', type: 'STRING', mode: 'NULLABLE' },
              { name: 'productTitle1', type: 'STRING', mode: 'NULLABLE' },
              { name: 'clickShare1', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'conversionShare1', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'clickedASIN2', type: 'STRING', mode: 'NULLABLE' },
              { name: 'productTitle2', type: 'STRING', mode: 'NULLABLE' },
              { name: 'clickShare2', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'conversionShare2', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'clickedASIN3', type: 'STRING', mode: 'NULLABLE' },
              { name: 'productTitle3', type: 'STRING', mode: 'NULLABLE' },
              { name: 'clickShare3', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'conversionShare3', type: 'FLOAT', mode: 'NULLABLE' },
              { name: 'insertedAt', type: 'TIMESTAMP', mode: 'REQUIRED' },
            ],
          },
        })
      }

      // Insert data
      const table = dataset.table(this.tableId)
      const rows = data.map(row => ({
        ...row,
        insertedAt: new Date().toISOString(),
      }))

      await table.insert(rows)
      console.log(`Inserted ${rows.length} rows into BigQuery`)

    } catch (error) {
      console.error('Error storing data in BigQuery:', error)
      throw error
    }
  }

  /**
   * Get search terms trends from BigQuery
   */
  async getSearchTermsTrends(
    keywords: string[],
    weeks: number = 4
  ): Promise<ProcessedSearchTerms[]> {
    if (!this.bigQuery) {
      throw new Error('BigQuery client not configured')
    }
    const query = `
      WITH weekly_data AS (
        SELECT 
          searchTerm as keyword,
          DATE_TRUNC(reportDate, WEEK) as week,
          MIN(searchFrequencyRank) as best_rank,
          AVG(searchFrequencyRank) as avg_rank,
          -- Estimate search volume based on rank
          CASE 
            WHEN MIN(searchFrequencyRank) <= 100 THEN 1000000 / MIN(searchFrequencyRank)
            WHEN MIN(searchFrequencyRank) <= 1000 THEN 100000 / MIN(searchFrequencyRank)
            ELSE 10000 / MIN(searchFrequencyRank)
          END as estimated_volume,
          MAX(clickShare1 + IFNULL(clickShare2, 0) + IFNULL(clickShare3, 0)) as top3_click_share,
          MAX(conversionShare1 + IFNULL(conversionShare2, 0) + IFNULL(conversionShare3, 0)) as top3_conversion_share,
          ARRAY_AGG(STRUCT(
            clickedASIN1 as asin,
            productTitle1 as title,
            clickShare1 as click_share,
            conversionShare1 as conversion_share
          ) ORDER BY reportDate DESC LIMIT 1)[OFFSET(0)] as top_product_1,
          ARRAY_AGG(STRUCT(
            clickedASIN2 as asin,
            productTitle2 as title,
            clickShare2 as click_share,
            conversionShare2 as conversion_share
          ) ORDER BY reportDate DESC LIMIT 1)[OFFSET(0)] as top_product_2,
          ARRAY_AGG(STRUCT(
            clickedASIN3 as asin,
            productTitle3 as title,
            clickShare3 as click_share,
            conversionShare3 as conversion_share
          ) ORDER BY reportDate DESC LIMIT 1)[OFFSET(0)] as top_product_3
        FROM \`${process.env.BIGQUERY_PROJECT_ID || 'commercecrafted'}.${this.datasetId}.${this.tableId}\`
        WHERE searchTerm IN UNNEST(@keywords)
          AND reportDate >= DATE_SUB(CURRENT_DATE(), INTERVAL @weeks WEEK)
        GROUP BY keyword, week
      ),
      trend_calculation AS (
        SELECT 
          keyword,
          week,
          best_rank,
          estimated_volume,
          top3_click_share,
          top3_conversion_share,
          top_product_1,
          top_product_2,
          top_product_3,
          LAG(estimated_volume) OVER (PARTITION BY keyword ORDER BY week) as prev_volume
        FROM weekly_data
      )
      SELECT 
        keyword,
        MIN(best_rank) as searchFrequencyRank,
        AVG(estimated_volume) as weeklySearchVolume,
        SAFE_DIVIDE(
          AVG(estimated_volume) - AVG(prev_volume),
          AVG(prev_volume)
        ) * 100 as weeklySearchVolumeGrowth,
        MAX(top3_click_share) as top3ClickShare,
        MAX(top3_conversion_share) as top3ConversionShare,
        ARRAY_AGG(STRUCT(
          week,
          best_rank as rank,
          estimated_volume as searchVolume
        ) ORDER BY week) as trendData,
        ANY_VALUE(top_product_1) as product1,
        ANY_VALUE(top_product_2) as product2,
        ANY_VALUE(top_product_3) as product3
      FROM trend_calculation
      GROUP BY keyword
    `

    const options = {
      query,
      params: {
        keywords,
        weeks,
      },
    }

    const [rows] = await this.bigQuery.query(options)

    return rows.map(row => ({
      keyword: row.keyword,
      searchFrequencyRank: row.searchFrequencyRank,
      weeklySearchVolume: Math.round(row.weeklySearchVolume || 0),
      weeklySearchVolumeGrowth: row.weeklySearchVolumeGrowth || 0,
      top3ClickShare: row.top3ClickShare || 0,
      top3ConversionShare: row.top3ConversionShare || 0,
      topASINs: [
        row.product1 && {
          asin: row.product1.asin,
          title: row.product1.title,
          clickShare: row.product1.click_share,
          conversionShare: row.product1.conversion_share,
          position: 1,
        },
        row.product2 && {
          asin: row.product2.asin,
          title: row.product2.title,
          clickShare: row.product2.click_share,
          conversionShare: row.product2.conversion_share,
          position: 2,
        },
        row.product3 && {
          asin: row.product3.asin,
          title: row.product3.title,
          clickShare: row.product3.click_share,
          conversionShare: row.product3.conversion_share,
          position: 3,
        },
      ].filter(Boolean),
      trendData: row.trendData.map((trend: any) => ({
        week: trend.week,
        rank: trend.rank,
        searchVolume: Math.round(trend.searchVolume),
      })),
    }))
  }
}