import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError } from '@/lib/services/niche-service-adapter'
import { z } from 'zod'

// Request validation schema
const searchNichesSchema = z.object({
  q: z.string().min(1).max(100),
  category: z.string().optional(),
  minOpportunityScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})

// GET /api/niches/search - Search public niches
async function handleGet(req: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const params = searchNichesSchema.parse(searchParams)
    
    // Search public niches
    const result = await nicheService.searchPublicNiches(params.q, {
      category: params.category,
      minOpportunityScore: params.minOpportunityScore,
      page: params.page,
      pageSize: params.pageSize,
    })
    
    return NextResponse.json({
      data: result.niches,
      pagination: {
        total: result.total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(result.total / params.pageSize),
      },
      query: params.q,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error searching niches:', error)
    return NextResponse.json(
      { error: 'Failed to search niches' },
      { status: 500 }
    )
  }
}

// Export route with optional authentication and rate limiting
export const GET = withAuth(
  withRateLimit(handleGet, rateLimiters.api),
  { requireAuth: false } // Public endpoint
)