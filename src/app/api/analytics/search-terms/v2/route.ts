import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryClient } from '@/lib/bigquery-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let bigquery
    try {
      bigquery = getBigQueryClient()
    } catch (error) {
      console.error('BigQuery not configured:', error)
      return NextResponse.json({ 
        error: 'Analytics service not available',
        searchTerms: []
      })
    }
    
    // Query to get search terms data from our existing table
    const query = `
      WITH aggregated_data AS (
        SELECT 
          search_term,
          search_frequency_rank,
          week_start_date,
          week_end_date,
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
          conversion_share_3
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE search_term ${keyword ? '= @keyword' : 'IS NOT NULL'}
          AND search_frequency_rank > 0
        ORDER BY week_end_date DESC, search_frequency_rank ASC
        LIMIT @limit
      )
      SELECT 
        search_term as keyword,
        MIN(search_frequency_rank) as searchFrequencyRank,
        -- Estimate search volume based on rank
        CAST(
          CASE 
            WHEN MIN(search_frequency_rank) <= 100 THEN 1000000 / MIN(search_frequency_rank)
            WHEN MIN(search_frequency_rank) <= 1000 THEN 100000 / MIN(search_frequency_rank)
            ELSE 10000 / MIN(search_frequency_rank)
          END AS INT64
        ) as estimatedSearchVolume,
        MAX(total_click_share) as top3ClickShare,
        MAX(total_conversion_share) as top3ConversionShare,
        ARRAY_AGG(STRUCT(
          week_start_date,
          week_end_date,
          search_frequency_rank,
          total_click_share,
          total_conversion_share
        ) ORDER BY week_end_date DESC) as weeklyData,
        ANY_VALUE(STRUCT(
          clicked_asin_1 as asin,
          product_title_1 as title,
          click_share_1 as clickShare,
          conversion_share_1 as conversionShare
        )) as topProduct1,
        ANY_VALUE(STRUCT(
          clicked_asin_2 as asin,
          product_title_2 as title,
          click_share_2 as clickShare,
          conversion_share_2 as conversionShare
        )) as topProduct2,
        ANY_VALUE(STRUCT(
          clicked_asin_3 as asin,
          product_title_3 as title,
          click_share_3 as clickShare,
          conversion_share_3 as conversionShare
        )) as topProduct3
      FROM aggregated_data
      GROUP BY search_term
    `
    
    const options = {
      query,
      params: keyword ? { keyword, limit } : { limit },
    }
    
    const [rows] = await bigquery.query(options)
    
    // Format the response
    const formattedData = rows.map((row: {
      keyword: string;
      searchFrequencyRank: number;
      estimatedSearchVolume: number;
      top3ClickShare?: number;
      [key: string]: unknown;
    }) => ({
      keyword: row.keyword,
      searchFrequencyRank: row.searchFrequencyRank,
      estimatedSearchVolume: row.estimatedSearchVolume,
      top3ClickShare: row.top3ClickShare || 0,
      top3ConversionShare: row.top3ConversionShare || 0,
      weeklyData: row.weeklyData || [],
      topProducts: [
        row.topProduct1,
        row.topProduct2,
        row.topProduct3
      ].filter(p => p && p.asin),
    }))
    
    return NextResponse.json({
      data: formattedData,
      totalRecords: formattedData.length,
      dataSource: 'bigquery',
      lastUpdated: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('Search terms V2 API error:', error)
    
    // Return mock data if BigQuery fails
    return NextResponse.json({
      data: [],
      totalRecords: 0,
      dataSource: 'mock',
      error: 'Failed to fetch data from BigQuery. Mock data would be shown in production.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json()
    
    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      )
    }
    
    const bigquery = getBigQueryClient()
    
    // Query for multiple keywords
    const query = `
      WITH latest_data AS (
        SELECT 
          search_term,
          search_frequency_rank,
          week_start_date,
          week_end_date,
          total_click_share,
          total_conversion_share,
          clicked_asin_1,
          product_title_1,
          click_share_1,
          conversion_share_1,
          ROW_NUMBER() OVER (PARTITION BY search_term ORDER BY week_end_date DESC) as rn
        FROM \`commercecrafted.amazon_analytics.search_terms\`
        WHERE search_term IN UNNEST(@keywords)
          AND search_frequency_rank > 0
      )
      SELECT 
        search_term as keyword,
        search_frequency_rank as searchFrequencyRank,
        CAST(
          CASE 
            WHEN search_frequency_rank <= 100 THEN 1000000 / search_frequency_rank
            WHEN search_frequency_rank <= 1000 THEN 100000 / search_frequency_rank
            ELSE 10000 / search_frequency_rank
          END AS INT64
        ) as estimatedSearchVolume,
        total_click_share as top3ClickShare,
        total_conversion_share as top3ConversionShare,
        week_start_date,
        week_end_date,
        clicked_asin_1 as topAsin,
        product_title_1 as topProductTitle,
        click_share_1 as topProductClickShare,
        conversion_share_1 as topProductConversionShare
      FROM latest_data
      WHERE rn = 1
    `
    
    const options = {
      query,
      params: { keywords },
    }
    
    const [rows] = await bigquery.query(options)
    
    return NextResponse.json({
      keywords: rows,
      dataSource: 'bigquery',
      totalRecords: rows.length,
      lastUpdated: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('Search terms batch API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch search terms data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}