// Duplicate Prevention Service for Amazon Reports
import { getBigQueryService } from './bigquery-service'

export class DuplicatePreventionService {
  private bigQueryService = getBigQueryService()

  // Check if a report week already exists before processing
  async isWeekAlreadyProcessed(
    weekStartDate: string, 
    marketplaceId: string = 'ATVPDKIKX0DER'
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as record_count
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
      WHERE week_start_date = @weekStartDate 
      AND marketplace_id = @marketplaceId
      LIMIT 1
    `

    const options = {
      query,
      params: { weekStartDate, marketplaceId },
      location: 'US'
    }

    try {
      const [job] = await this.bigQueryService.client.createQueryJob(options)
      const [rows] = await job.getQueryResults()
      
      return rows[0]?.record_count > 0
    } catch (error) {
      console.error('Error checking for duplicates:', error)
      throw error
    }
  }

  // Get missing weeks that need to be backfilled
  async getMissingWeeks(
    startDate: string, 
    endDate: string,
    marketplaceId: string = 'ATVPDKIKX0DER'
  ): Promise<string[]> {
    const query = `
      WITH week_series AS (
        SELECT DATE_SUB(DATE(@endDate), INTERVAL week_num WEEK) as week_date
        FROM UNNEST(GENERATE_ARRAY(0, DATE_DIFF(DATE(@endDate), DATE(@startDate), WEEK))) as week_num
      ),
      sunday_weeks AS (
        SELECT DATE_SUB(week_date, INTERVAL MOD(EXTRACT(DAYOFWEEK FROM week_date) - 1, 7) DAY) as week_date
        FROM week_series
        WHERE DATE_SUB(week_date, INTERVAL MOD(EXTRACT(DAYOFWEEK FROM week_date) - 1, 7) DAY) >= DATE(@startDate)
      ),
      existing_weeks AS (
        SELECT DISTINCT week_start_date
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
        AND week_start_date BETWEEN @startDate AND @endDate
      )
      SELECT DISTINCT sw.week_date as missing_week
      FROM sunday_weeks sw
      LEFT JOIN existing_weeks ew ON sw.week_date = ew.week_start_date
      WHERE ew.week_start_date IS NULL
      ORDER BY sw.week_date
    `

    const options = {
      query,
      params: { startDate, endDate, marketplaceId },
      location: 'US'
    }

    try {
      const [job] = await this.bigQueryService.client.createQueryJob(options)
      const [rows] = await job.getQueryResults()
      
      return rows.map(row => {
        const date = row.missing_week
        
        // Handle BigQuery date objects
        if (date && typeof date === 'object' && date.value) {
          return date.value // BigQuery date object has .value property
        }
        if (date instanceof Date) {
          return date.toISOString().split('T')[0]
        }
        if (typeof date === 'string') {
          return date
        }
        
        console.error('Unknown date format:', date)
        return null
      }).filter(Boolean)
    } catch (error) {
      console.error('Error finding missing weeks:', error)
      throw error
    }
  }

  // Clean up duplicate records (if any exist)
  async removeDuplicates(
    weekStartDate: string,
    marketplaceId: string = 'ATVPDKIKX0DER'
  ): Promise<number> {
    const query = `
      DELETE FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
      WHERE week_start_date = @weekStartDate 
      AND marketplace_id = @marketplaceId
      AND ingested_at < (
        SELECT MAX(ingested_at) 
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE week_start_date = @weekStartDate 
        AND marketplace_id = @marketplaceId
      )
    `

    const options = {
      query,
      params: { weekStartDate, marketplaceId },
      location: 'US'
    }

    try {
      const [job] = await this.bigQueryService.client.createQueryJob(options)
      const [result] = await job.getQueryResults()
      
      return result?.numDmlAffectedRows || 0
    } catch (error) {
      console.error('Error removing duplicates:', error)
      throw error
    }
  }
}

export const getDuplicatePreventionService = () => new DuplicatePreventionService()