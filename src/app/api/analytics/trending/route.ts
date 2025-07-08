import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryClient } from '@/lib/bigquery-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const days = parseInt(searchParams.get('days') || '7')
    
    const bigquery = getBigQueryClient()
    
    // Query to find trending keywords based on rank improvement
    const query = `
      WITH ranked_data AS (
        SELECT 
          search_term,
          search_frequency_rank,
          week_end_date,
          total_click_share,
          total_conversion_share,
          clicked_asin_1,
          product_title_1,
          LAG(search_frequency_rank) OVER (PARTITION BY search_term ORDER BY week_end_date) as prev_rank
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE week_end_date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
          AND search_frequency_rank > 0
          AND search_term IS NOT NULL
      ),
      trending AS (
        SELECT 
          search_term as keyword,
          MIN(search_frequency_rank) as currentRank,
          MAX(prev_rank) as previousRank,
          CAST(
            CASE 
              WHEN MIN(search_frequency_rank) <= 100 THEN 1000000 / MIN(search_frequency_rank)
              WHEN MIN(search_frequency_rank) <= 1000 THEN 100000 / MIN(search_frequency_rank)
              ELSE 10000 / MIN(search_frequency_rank)
            END AS INT64
          ) as estimatedSearchVolume,
          -- Calculate growth percentage
          SAFE_DIVIDE(
            MAX(prev_rank) - MIN(search_frequency_rank),
            MAX(prev_rank)
          ) * 100 as rankImprovement,
          MAX(total_click_share) as top3ClickShare,
          MAX(total_conversion_share) as top3ConversionShare,
          ANY_VALUE(clicked_asin_1) as topAsin,
          ANY_VALUE(product_title_1) as topProductTitle
        FROM ranked_data
        WHERE prev_rank IS NOT NULL
        GROUP BY search_term
        HAVING rankImprovement > 0
      )
      SELECT 
        keyword,
        currentRank,
        previousRank,
        estimatedSearchVolume,
        rankImprovement,
        top3ClickShare,
        top3ConversionShare,
        topAsin,
        topProductTitle,
        -- Category assignment based on improvement
        CASE 
          WHEN rankImprovement >= 50 THEN 'SKYROCKETING'
          WHEN rankImprovement >= 25 THEN 'HOT'
          WHEN rankImprovement >= 10 THEN 'RISING'
          ELSE 'GROWING'
        END as trendCategory
      FROM trending
      ORDER BY rankImprovement DESC, estimatedSearchVolume DESC
      LIMIT @limit
    `
    
    const options = {
      query,
      params: { days, limit },
    }
    
    const [rows] = await bigquery.query(options)
    
    // Group by category
    const categorized = {
      skyrocketing: rows.filter((r: any) => r.trendCategory === 'SKYROCKETING'),
      hot: rows.filter((r: any) => r.trendCategory === 'HOT'),
      rising: rows.filter((r: any) => r.trendCategory === 'RISING'),
      growing: rows.filter((r: any) => r.trendCategory === 'GROWING'),
    }
    
    return NextResponse.json({
      trending: rows,
      categorized,
      totalRecords: rows.length,
      dataSource: 'bigquery',
      period: `${days} days`,
      lastUpdated: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('Trending keywords API error:', error)
    
    // Return mock data if BigQuery fails
    return NextResponse.json({
      trending: [],
      categorized: {
        skyrocketing: [],
        hot: [],
        rising: [],
        growing: [],
      },
      totalRecords: 0,
      dataSource: 'mock',
      error: 'Failed to fetch trending data from BigQuery',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Get top declining keywords
export async function POST(request: NextRequest) {
  try {
    const { type = 'declining' } = await request.json()
    
    const bigquery = getBigQueryClient()
    
    // Query for declining keywords (rank getting worse)
    const query = `
      WITH ranked_data AS (
        SELECT 
          search_term,
          search_frequency_rank,
          week_end_date,
          total_click_share,
          LAG(search_frequency_rank) OVER (PARTITION BY search_term ORDER BY week_end_date) as prev_rank
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE week_end_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
          AND search_frequency_rank > 0
          AND search_term IS NOT NULL
      )
      SELECT 
        search_term as keyword,
        MIN(search_frequency_rank) as currentRank,
        MAX(prev_rank) as previousRank,
        CAST(
          CASE 
            WHEN MIN(search_frequency_rank) <= 100 THEN 1000000 / MIN(search_frequency_rank)
            WHEN MIN(search_frequency_rank) <= 1000 THEN 100000 / MIN(search_frequency_rank)
            ELSE 10000 / MIN(search_frequency_rank)
          END AS INT64
        ) as estimatedSearchVolume,
        -- Calculate decline percentage (negative for declining)
        SAFE_DIVIDE(
          MAX(prev_rank) - MIN(search_frequency_rank),
          MAX(prev_rank)
        ) * 100 as rankChange,
        MAX(total_click_share) as top3ClickShare
      FROM ranked_data
      WHERE prev_rank IS NOT NULL
        AND prev_rank > 0
      GROUP BY search_term
      ${type === 'declining' ? 'HAVING rankChange < -10' : 'HAVING rankChange > 10'}
      ORDER BY ${type === 'declining' ? 'rankChange ASC' : 'rankChange DESC'}
      LIMIT 20
    `
    
    const options = {
      query,
      params: {},
    }
    
    const [rows] = await bigquery.query(options)
    
    return NextResponse.json({
      keywords: rows,
      type,
      totalRecords: rows.length,
      dataSource: 'bigquery',
      lastUpdated: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('Declining keywords API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch declining keywords data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}