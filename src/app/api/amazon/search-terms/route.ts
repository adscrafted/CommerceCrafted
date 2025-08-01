import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAmazonSearchTermsService } from '@/lib/amazon-search-terms-service'
import { z } from 'zod'

// Request schema
const SearchTermsRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  marketplaceId: z.string().optional(),
  useCache: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const validatedData = SearchTermsRequestSchema.parse(body)

    const amazonSearchTermsService = getAmazonSearchTermsService()
    
    // For development/demo, return cached data if requested
    if (validatedData.useCache) {
      const cachedData = await amazonSearchTermsService.getCachedSearchTerms()
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true
      })
    }

    // Convert dates
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    // Request and wait for the report
    const searchTerms = await amazonSearchTermsService.getTopSearchTerms({
      startDate,
      endDate,
      marketplaceId: validatedData.marketplaceId,
      maxWaitTime: 5 * 60 * 1000 // 5 minutes max wait
    })

    return NextResponse.json({
      success: true,
      data: searchTerms,
      cached: false
    })

  } catch (error) {
    console.error('Error in search terms API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check report status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    const amazonSearchTermsService = getAmazonSearchTermsService()
    
    // Check report status
    const status = await amazonSearchTermsService.getReportStatus(reportId)

    return NextResponse.json({
      success: true,
      status
    })

  } catch (error) {
    console.error('Error checking report status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}