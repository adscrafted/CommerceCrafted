import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError, ValidationError } from '@/lib/services/niche-service-adapter'
import { z } from 'zod'

// Request validation schemas
const listNichesSchema = z.object({
  status: z.enum(['active', 'archived', 'draft']).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'product_count']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

const createNicheSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'archived', 'draft']).default('draft'),
})

// GET /api/niches - List niches with filtering and pagination
async function handleGet(req: NextRequest) {
  try {
    // Get user ID from auth middleware
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const params = listNichesSchema.parse(searchParams)
    
    // Fetch niches
    const result = await nicheService.listNiches(userId, params)
    
    // Return response with pagination metadata
    return NextResponse.json({
      data: result.niches,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
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
    
    console.error('Error listing niches:', error)
    return NextResponse.json(
      { error: 'Failed to list niches' },
      { status: 500 }
    )
  }
}

// POST /api/niches - Create a new niche
async function handlePost(req: NextRequest) {
  try {
    // Get user ID from auth middleware
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    // Parse and validate request body
    const body = await req.json()
    const data = createNicheSchema.parse(body)
    
    // Create niche
    const niche = await nicheService.createNiche(userId, data)
    
    // Return created niche
    return NextResponse.json({
      data: niche,
      message: 'Niche created successfully',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error creating niche:', error)
    return NextResponse.json(
      { error: 'Failed to create niche' },
      { status: 500 }
    )
  }
}

// Export routes with authentication and rate limiting
export const GET = withAuth(
  withRateLimit(handleGet, rateLimiters.api),
  { requireAuth: true }
)

export const POST = withAuth(
  withRateLimit(handlePost, rateLimiters.nicheOperations),
  { 
    requireAuth: true,
    requireSubscription: ['pro', 'enterprise'] // Free users limited via service
  }
)