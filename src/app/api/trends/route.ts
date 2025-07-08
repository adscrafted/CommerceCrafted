import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '@/lib/bigquery-service'
import { z } from 'zod'

// Query parameters schema
const QuerySchema = z.object({
  limit: z.number().min(1).max(1000).default(100),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = QuerySchema.parse({
      limit: parseInt(searchParams.get('limit') || '100'),
      search: searchParams.get('search') || undefined,
    })

    // Check if BigQuery is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return NextResponse.json({
        success: false,
        error: 'BigQuery not configured',
        data: []
      })
    }

    // Get data from BigQuery (using the date we know we have data for)
    const bigQueryService = getBigQueryService()
    const dataDate = '2025-04-06' // Date we know we have data for in BigQuery

    try {
      let data: any[]
      
      if (params.search) {
        // Search for specific terms
        data = await bigQueryService.searchTerms(
          params.search,
          dataDate,
          params.limit
        )
      } else {
        // Get top terms for the period  
        data = await bigQueryService.getTopSearchTerms(dataDate, params.limit)
      }

      // Transform data for the trends page
      const transformedData = data.map(term => ({
        searchTerm: term.search_term,
        searchFrequencyRank: term.search_frequency_rank,
        totalClickShare: term.total_click_share,
        totalConversionShare: term.total_conversion_share,
        topAsins: term.top_asins || [],
        uniqueProducts: term.unique_products,
        marketplaceId: term.marketplace_id,
        weekStart: dataDate,
        weeklyData: term.weekly_data || [] // Historical trend data
      }))

      return NextResponse.json({
        success: true,
        data: transformedData,
        metadata: {
          total: data.length,
          date: dataDate,
          marketplace: 'US'
        }
      })
      
    } catch (error) {
      console.error('BigQuery error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch data from BigQuery',
        data: []
      })
    }

  } catch (error) {
    console.error('Trends API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}