// BigQuery Service for Amazon Analytics Data
import { BigQuery } from '@google-cloud/bigquery'
import { createReadStream, createWriteStream } from 'fs'
import { createInterface } from 'readline'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'
import { getBigQueryClient } from './bigquery-client'

export class BigQueryService {
  client: BigQuery
  private dataset: string
  private table: string

  constructor() {
    this.client = getBigQueryClient()
    this.dataset = process.env.BIGQUERY_DATASET || 'amazon_analytics'
    this.table = 'search_terms'
  }

  // Process Amazon report CSV file and load into BigQuery
  async processAmazonReport(
    filePath: string,
    metadata: {
      reportId: string
      marketplaceId: string
      weekStartDate: string
      weekEndDate: string
    }
  ): Promise<void> {
    console.log(`Processing ${filePath}...`)
    
    try {
      // Convert CSV to NDJSON for BigQuery
      const ndjsonPath = filePath.replace('.csv', '.ndjson')
      
      await this.convertCsvToNdjson(filePath, ndjsonPath, metadata)
      
      // Load NDJSON into BigQuery
      await this.loadSearchTermsData(ndjsonPath)
      
      console.log('✅ Report processed and loaded into BigQuery')
    } catch (error) {
      console.error('Error processing report:', error)
      throw error
    }
  }

  // Convert CSV to NDJSON format for BigQuery
  private async convertCsvToNdjson(
    csvPath: string,
    ndjsonPath: string,
    metadata: {
      reportId: string
      marketplaceId: string
      weekStartDate: string
      weekEndDate: string
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(csvPath)
      const writeStream = createWriteStream(ndjsonPath)
      const rl = createInterface({ input: readStream })
      
      let headers: string[] = []
      let lineCount = 0
      let recordCount = 0
      
      rl.on('line', (line) => {
        lineCount++
        
        if (lineCount === 1) {
          // Parse headers
          headers = line.split('\t').map(h => h.trim())
          return
        }
        
        // Parse data row
        const values = line.split('\t')
        if (values.length < headers.length) return
        
        try {
          // Create record object
          const record: any = {}
          
          // Map CSV columns to BigQuery schema
          headers.forEach((header, index) => {
            const value = values[index]?.trim() || ''
            
            switch (header) {
              case 'Department':
                record.department = value
                break
              case 'Search Term':
                record.search_term = value
                break
              case 'Search Frequency Rank':
                record.search_frequency_rank = parseInt(value) || 0
                break
              case '#1 Clicked ASIN':
                record.clicked_asin_1 = value
                break
              case '#1 Product Title':
                record.product_title_1 = value
                break
              case '#1 Click Share':
                record.click_share_1 = parseFloat(value.replace('%', '')) || 0
                break
              case '#1 Conversion Share':
                record.conversion_share_1 = parseFloat(value.replace('%', '')) || 0
                break
              case '#2 Clicked ASIN':
                record.clicked_asin_2 = value
                break
              case '#2 Product Title':
                record.product_title_2 = value
                break
              case '#2 Click Share':
                record.click_share_2 = parseFloat(value.replace('%', '')) || 0
                break
              case '#2 Conversion Share':
                record.conversion_share_2 = parseFloat(value.replace('%', '')) || 0
                break
              case '#3 Clicked ASIN':
                record.clicked_asin_3 = value
                break
              case '#3 Product Title':
                record.product_title_3 = value
                break
              case '#3 Click Share':
                record.click_share_3 = parseFloat(value.replace('%', '')) || 0
                break
              case '#3 Conversion Share':
                record.conversion_share_3 = parseFloat(value.replace('%', '')) || 0
                break
            }
          })
          
          // Add metadata
          record.report_id = metadata.reportId
          record.marketplace_id = metadata.marketplaceId
          record.week_start_date = metadata.weekStartDate
          record.week_end_date = metadata.weekEndDate
          record.ingested_at = new Date().toISOString()
          
          // Calculate aggregates
          record.total_click_share = record.click_share_1 + record.click_share_2 + record.click_share_3
          record.total_conversion_share = record.conversion_share_1 + record.conversion_share_2 + record.conversion_share_3
          
          // Write as NDJSON
          writeStream.write(JSON.stringify(record) + '\n')
          recordCount++
          
          if (recordCount % 100000 === 0) {
            console.log(`   Processed ${recordCount.toLocaleString()} records...`)
          }
        } catch (error) {
          console.error(`Error processing line ${lineCount}:`, error)
        }
      })
      
      rl.on('close', () => {
        writeStream.end()
        console.log(`   Total records: ${recordCount.toLocaleString()}`)
        resolve()
      })
      
      rl.on('error', reject)
      writeStream.on('error', reject)
    })
  }

  // Get top search terms with historical trend data
  async getTopSearchTerms(weekStartDate: string, limit: number = 100): Promise<any[]> {
    const query = `
      WITH latest_week_data AS (
        -- Get the latest week's complete data for ASINs
        SELECT 
          search_term,
          search_frequency_rank,
          total_click_share as latest_click_share,
          total_conversion_share as latest_conversion_share,
          clicked_asin_1,
          product_title_1,
          click_share_1,
          conversion_share_1,
          clicked_asin_2,
          product_title_2,
          click_share_2,
          conversion_share_2,
          clicked_asin_3,
          product_title_3,
          click_share_3,
          conversion_share_3,
          marketplace_id,
          week_start_date,
          ROW_NUMBER() OVER (
            PARTITION BY search_term 
            ORDER BY week_start_date DESC, ingested_at DESC, 
                     (CASE WHEN clicked_asin_2 IS NOT NULL THEN 1 ELSE 0 END + 
                      CASE WHEN clicked_asin_3 IS NOT NULL THEN 1 ELSE 0 END) DESC
          ) as rn
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${this.dataset}.${this.table}\`
        WHERE search_frequency_rank > 0
      ),
      historical_data AS (
        -- Get all historical data for trend analysis
        SELECT 
          search_term,
          week_start_date,
          week_end_date,
          search_frequency_rank,
          total_click_share,
          total_conversion_share
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${this.dataset}.${this.table}\`
        WHERE search_frequency_rank > 0
      ),
      trend_data AS (
        SELECT 
          search_term,
          ARRAY_AGG(
            STRUCT(
              CAST(week_start_date AS STRING) as week_start_date,
              CAST(week_end_date AS STRING) as week_end_date,
              search_frequency_rank,
              total_click_share,
              total_conversion_share
            ) 
            ORDER BY week_start_date
          ) as weekly_data
        FROM historical_data
        GROUP BY search_term
      )
      SELECT 
        l.search_term,
        l.search_frequency_rank,
        l.latest_click_share as total_click_share,
        l.latest_conversion_share as total_conversion_share,
        ARRAY(
          SELECT AS STRUCT * FROM UNNEST([
            STRUCT(
              l.clicked_asin_1 as clicked_asin,
              l.product_title_1 as product_title,
              l.click_share_1 as click_share,
              l.conversion_share_1 as conversion_share
            ),
            STRUCT(
              l.clicked_asin_2 as clicked_asin,
              l.product_title_2 as product_title,
              l.click_share_2 as click_share,
              l.conversion_share_2 as conversion_share
            ),
            STRUCT(
              l.clicked_asin_3 as clicked_asin,
              l.product_title_3 as product_title,
              l.click_share_3 as click_share,
              l.conversion_share_3 as conversion_share
            )
          ])
          WHERE clicked_asin IS NOT NULL AND clicked_asin != ''
        ) as top_asins,
        ARRAY_LENGTH(ARRAY(
          SELECT AS STRUCT * FROM UNNEST([
            STRUCT(
              l.clicked_asin_1 as clicked_asin,
              l.product_title_1 as product_title,
              l.click_share_1 as click_share,
              l.conversion_share_1 as conversion_share
            ),
            STRUCT(
              l.clicked_asin_2 as clicked_asin,
              l.product_title_2 as product_title,
              l.click_share_2 as click_share,
              l.conversion_share_2 as conversion_share
            ),
            STRUCT(
              l.clicked_asin_3 as clicked_asin,
              l.product_title_3 as product_title,
              l.click_share_3 as click_share,
              l.conversion_share_3 as conversion_share
            )
          ])
          WHERE clicked_asin IS NOT NULL AND clicked_asin != ''
        )) as unique_products,
        l.marketplace_id,
        t.weekly_data
      FROM latest_week_data l
      LEFT JOIN trend_data t ON l.search_term = t.search_term
      WHERE l.rn = 1
      ORDER BY l.search_frequency_rank ASC
      LIMIT @limit
    `

    const options = {
      query,
      params: { weekStartDate, limit },
      location: 'US'
    }

    try {
      const [rows] = await this.client.query(options)
      return rows
    } catch (error) {
      console.error('Error getting top search terms:', error)
      throw error
    }
  }

  // Search for specific terms
  async searchTerms(searchQuery: string, weekStartDate: string, limit: number = 100): Promise<any[]> {
    const query = `
      WITH latest_records AS (
        SELECT 
          search_term,
          search_frequency_rank,
          total_click_share,
          total_conversion_share,
          clicked_asin_1,
          product_title_1,
          click_share_1,
          conversion_share_1,
          clicked_asin_2,
          product_title_2,
          click_share_2,
          conversion_share_2,
          clicked_asin_3,
          product_title_3,
          click_share_3,
          conversion_share_3,
          marketplace_id,
          ROW_NUMBER() OVER (
            PARTITION BY search_term 
            ORDER BY ingested_at DESC, 
                     (CASE WHEN clicked_asin_2 IS NOT NULL THEN 1 ELSE 0 END + 
                      CASE WHEN clicked_asin_3 IS NOT NULL THEN 1 ELSE 0 END) DESC
          ) as rn
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${this.dataset}.${this.table}\`
        WHERE week_start_date = @weekStartDate
          AND LOWER(search_term) LIKE LOWER(@searchQuery)
          AND search_frequency_rank > 0
      )
      SELECT 
        search_term,
        search_frequency_rank,
        total_click_share,
        total_conversion_share,
        ARRAY(
          SELECT AS STRUCT * FROM UNNEST([
            STRUCT(
              clicked_asin_1 as clicked_asin,
              product_title_1 as product_title,
              click_share_1 as click_share,
              conversion_share_1 as conversion_share
            ),
            STRUCT(
              clicked_asin_2 as clicked_asin,
              product_title_2 as product_title,
              click_share_2 as click_share,
              conversion_share_2 as conversion_share
            ),
            STRUCT(
              clicked_asin_3 as clicked_asin,
              product_title_3 as product_title,
              click_share_3 as click_share,
              conversion_share_3 as conversion_share
            )
          ])
          WHERE clicked_asin IS NOT NULL AND clicked_asin != ''
        ) as top_asins,
        ARRAY_LENGTH(ARRAY(
          SELECT AS STRUCT * FROM UNNEST([
            STRUCT(
              clicked_asin_1 as clicked_asin,
              product_title_1 as product_title,
              click_share_1 as click_share,
              conversion_share_1 as conversion_share
            ),
            STRUCT(
              clicked_asin_2 as clicked_asin,
              product_title_2 as product_title,
              click_share_2 as click_share,
              conversion_share_2 as conversion_share
            ),
            STRUCT(
              clicked_asin_3 as clicked_asin,
              product_title_3 as product_title,
              click_share_3 as click_share,
              conversion_share_3 as conversion_share
            )
          ])
          WHERE clicked_asin IS NOT NULL AND clicked_asin != ''
        )) as unique_products,
        marketplace_id
      FROM latest_records
      WHERE rn = 1
      ORDER BY search_frequency_rank ASC
      LIMIT @limit
    `

    const options = {
      query,
      params: { 
        weekStartDate, 
        searchQuery: `%${searchQuery}%`,
        limit 
      },
      location: 'US'
    }

    try {
      const [rows] = await this.client.query(options)
      return rows
    } catch (error) {
      console.error('Error searching terms:', error)
      throw error
    }
  }

  // Load NDJSON data into BigQuery
  async loadSearchTermsData(ndjsonPath: string): Promise<void> {
    const datasetId = this.dataset
    const tableId = this.table
    
    try {
      // Configure the load job with error tolerance
      const options = {
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_APPEND',
        maxBadRecords: 1000, // Allow up to 1000 bad records
        ignoreUnknownValues: true,
        schema: {
          fields: [
            { name: 'report_id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'marketplace_id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'week_start_date', type: 'DATE', mode: 'REQUIRED' },
            { name: 'week_end_date', type: 'DATE', mode: 'REQUIRED' },
            { name: 'department', type: 'STRING', mode: 'NULLABLE' },
            { name: 'search_term', type: 'STRING', mode: 'NULLABLE' },
            { name: 'search_frequency_rank', type: 'INTEGER', mode: 'NULLABLE' },
            { name: 'clicked_asin_1', type: 'STRING', mode: 'NULLABLE' },
            { name: 'product_title_1', type: 'STRING', mode: 'NULLABLE' },
            { name: 'click_share_1', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'conversion_share_1', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'clicked_asin_2', type: 'STRING', mode: 'NULLABLE' },
            { name: 'product_title_2', type: 'STRING', mode: 'NULLABLE' },
            { name: 'click_share_2', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'conversion_share_2', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'clicked_asin_3', type: 'STRING', mode: 'NULLABLE' },
            { name: 'product_title_3', type: 'STRING', mode: 'NULLABLE' },
            { name: 'click_share_3', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'conversion_share_3', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'total_click_share', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'total_conversion_share', type: 'FLOAT', mode: 'NULLABLE' },
            { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
          ]
        },
        location: 'US'
      }

      // Load data from NDJSON file
      const [job] = await this.client
        .dataset(datasetId)
        .table(tableId)
        .load(ndjsonPath, options)

      console.log(`   Load job ${job.id} started...`)
      
      // Wait for the job to complete
      const [metadata] = await job.getMetadata()
      
      if (metadata.status?.errors && metadata.status.errors.length > 0) {
        console.error(`   ⚠️  Job completed with errors: ${JSON.stringify(metadata.status.errors)}`)
        throw new Error(`Job failed: ${JSON.stringify(metadata.status.errors)}`)
      }

      if (metadata.status?.warnings && metadata.status.warnings.length > 0) {
        console.warn(`   ⚠️  Job completed with warnings: ${JSON.stringify(metadata.status.warnings)}`)
      }

      console.log(`   ✅ Data loaded successfully!`)
    } catch (error) {
      console.error('Error loading data to BigQuery:', error)
      throw error
    }
  }
}

export const getBigQueryService = () => new BigQueryService()