import { NextRequest, NextResponse } from 'next/server'
import { getAmazonSearchTermsService } from '@/lib/amazon-search-terms-service'
import { z } from 'zod'

// Request schema
const SearchTermsRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  marketplaceId: z.string().optional(),
  useCache: z.boolean().optional(),
})

// TEST ENDPOINT - No authentication required for testing
export async function POST(request: NextRequest) {
  try {
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
        cached: true,
        message: 'Test endpoint - cached data'
      })
    }

    // Convert dates
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    // For testing, just show what would be requested
    return NextResponse.json({
      success: true,
      message: 'Test endpoint - would request report with these parameters',
      parameters: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        marketplaceId: validatedData.marketplaceId || process.env.SP_API_MARKETPLACE_ID || 'ATVPDKIKX0DER'
      },
      note: 'Set useCache: true to get sample data'
    })

  } catch (error) {
    console.error('Error in search terms test API:', error)
    
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