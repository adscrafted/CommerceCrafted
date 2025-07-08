// Trending Keywords Service
// Identifies keywords that are "skyrocketing" based on rank improvements

import { getBigQueryService } from './bigquery-service'

export interface TrendingKeyword {
  searchTerm: string
  currentRank: number
  previousRank: number
  rankImprovement: number
  growthPercentage: number
  totalClickShare: number
  totalConversionShare: number
  weekStartDate: string
  marketplaceId: string
}

export class TrendingKeywordsService {
  private bigQueryService = getBigQueryService()

  // Get keywords that have shown significant rank improvements
  async getSkyrocketingKeywords(
    marketplaceId: string = 'ATVPDKIKX0DER',
    minRankImprovement: number = 100,
    limit: number = 100
  ): Promise<TrendingKeyword[]> {
    const query = `
      WITH latest_week AS (
        SELECT MAX(week_start_date) as latest_date
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
      ),
      current_week_data AS (
        SELECT 
          search_term,
          MIN(search_frequency_rank) as current_rank,
          SUM(click_share) as total_click_share,
          SUM(conversion_share) as total_conversion_share,
          week_start_date
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
        AND week_start_date = (SELECT latest_date FROM latest_week)
        GROUP BY search_term, week_start_date
      ),
      previous_week_data AS (
        SELECT 
          search_term,
          MIN(search_frequency_rank) as previous_rank,
          week_start_date
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
        AND week_start_date = DATE_SUB((SELECT latest_date FROM latest_week), INTERVAL 1 WEEK)
        GROUP BY search_term, week_start_date
      )
      SELECT 
        c.search_term,
        c.current_rank,
        IFNULL(p.previous_rank, 999999) as previous_rank,
        IFNULL(p.previous_rank, 999999) - c.current_rank as rank_improvement,
        SAFE_DIVIDE(
          IFNULL(p.previous_rank, 999999) - c.current_rank,
          IFNULL(p.previous_rank, 999999)
        ) * 100 as growth_percentage,
        c.total_click_share,
        c.total_conversion_share,
        c.week_start_date,
        @marketplaceId as marketplace_id
      FROM current_week_data c
      LEFT JOIN previous_week_data p ON c.search_term = p.search_term
      WHERE IFNULL(p.previous_rank, 999999) - c.current_rank >= @minRankImprovement
      ORDER BY rank_improvement DESC
      LIMIT @limit
    `

    const options = {
      query,
      params: { marketplaceId, minRankImprovement, limit },
      location: 'US'
    }

    try {
      const [job] = await this.bigQueryService.client.createQueryJob(options)
      const [rows] = await job.getQueryResults()
      
      return rows.map((row: any) => ({
        searchTerm: row.search_term,
        currentRank: row.current_rank,
        previousRank: row.previous_rank === 999999 ? null : row.previous_rank,
        rankImprovement: row.rank_improvement,
        growthPercentage: row.growth_percentage,
        totalClickShare: row.total_click_share,
        totalConversionShare: row.total_conversion_share,
        weekStartDate: row.week_start_date.value || row.week_start_date,
        marketplaceId: row.marketplace_id
      }))
    } catch (error) {
      console.error('Error getting skyrocketing keywords:', error)
      throw error
    }
  }

  // Get keywords that are new this week (no previous rank)
  async getNewTrendingKeywords(
    marketplaceId: string = 'ATVPDKIKX0DER',
    maxRank: number = 1000,
    limit: number = 50
  ): Promise<TrendingKeyword[]> {
    const query = `
      WITH latest_week AS (
        SELECT MAX(week_start_date) as latest_date
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
      ),
      current_week_data AS (
        SELECT 
          search_term,
          MIN(search_frequency_rank) as current_rank,
          SUM(click_share) as total_click_share,
          SUM(conversion_share) as total_conversion_share,
          week_start_date
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
        AND week_start_date = (SELECT latest_date FROM latest_week)
        GROUP BY search_term, week_start_date
      ),
      previous_week_terms AS (
        SELECT DISTINCT search_term
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT}.${process.env.BIGQUERY_DATASET || 'amazon_analytics'}.search_terms\`
        WHERE marketplace_id = @marketplaceId
        AND week_start_date < (SELECT latest_date FROM latest_week)
      )
      SELECT 
        c.search_term,
        c.current_rank,
        999999 as previous_rank,
        999999 - c.current_rank as rank_improvement,
        100.0 as growth_percentage,
        c.total_click_share,
        c.total_conversion_share,
        c.week_start_date,
        @marketplaceId as marketplace_id
      FROM current_week_data c
      LEFT JOIN previous_week_terms p ON c.search_term = p.search_term
      WHERE p.search_term IS NULL
      AND c.current_rank <= @maxRank
      ORDER BY c.current_rank
      LIMIT @limit
    `

    const options = {
      query,
      params: { marketplaceId, maxRank, limit },
      location: 'US'
    }

    try {
      const [job] = await this.bigQueryService.client.createQueryJob(options)
      const [rows] = await job.getQueryResults()
      
      return rows.map((row: any) => ({
        searchTerm: row.search_term,
        currentRank: row.current_rank,
        previousRank: null, // New keywords have no previous rank
        rankImprovement: row.rank_improvement,
        growthPercentage: row.growth_percentage,
        totalClickShare: row.total_click_share,
        totalConversionShare: row.total_conversion_share,
        weekStartDate: row.week_start_date.value || row.week_start_date,
        marketplaceId: row.marketplace_id
      }))
    } catch (error) {
      console.error('Error getting new trending keywords:', error)
      throw error
    }
  }
}

export const getTrendingKeywordsService = () => new TrendingKeywordsService()