import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError, ValidationError, SubscriptionLimitError } from '@/lib/services/niche-service-adapter'
import { z } from 'zod'

// Request validation schemas
const addProductSchema = z.object({
  asin: z.string().regex(/^B[0-9A-Z]{9}$/, 'Invalid ASIN format'),
  notes: z.string().optional(),
  position: z.number().int().positive().optional(),
})

const removeProductSchema = z.object({
  asin: z.string().regex(/^B[0-9A-Z]{9}$/, 'Invalid ASIN format'),
})

// GET /api/niches/[id]/products - Get products in a niche
async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Fetch niche products
    const products = await nicheService.getNicheProducts(nicheId, userId)
    
    return NextResponse.json({
      data: products,
      total: products.length,
    })
  } catch (error) {
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error fetching niche products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch niche products' },
      { status: 500 }
    )
  }
}

// POST /api/niches/[id]/products - Add a product to a niche
async function handlePost(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Parse and validate request body
    const body = await req.json()
    const data = addProductSchema.parse(body)
    
    // Add product to niche
    const nicheProduct = await nicheService.addProductToNiche(nicheId, userId, data)
    
    return NextResponse.json({
      data: nicheProduct,
      message: 'Product added to niche successfully',
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
    
    if (error instanceof SubscriptionLimitError) {
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          limit: error.limit,
          current: error.current,
          upgradeUrl: '/pricing'
        },
        { status: error.statusCode }
      )
    }
    
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error adding product to niche:', error)
    return NextResponse.json(
      { error: 'Failed to add product to niche' },
      { status: 500 }
    )
  }
}

// DELETE /api/niches/[id]/products - Remove a product from a niche
async function handleDelete(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Parse request body or query params
    const asin = req.nextUrl.searchParams.get('asin')
    if (!asin) {
      const body = await req.json()
      const data = removeProductSchema.parse(body)
      await nicheService.removeProductFromNiche(nicheId, data.asin, userId)
    } else {
      // Validate ASIN from query param
      const data = removeProductSchema.parse({ asin })
      await nicheService.removeProductFromNiche(nicheId, data.asin, userId)
    }
    
    return NextResponse.json({
      message: 'Product removed from niche successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error removing product from niche:', error)
    return NextResponse.json(
      { error: 'Failed to remove product from niche' },
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
  { requireAuth: true }
)

export const DELETE = withAuth(
  withRateLimit(handleDelete, rateLimiters.nicheOperations),
  { requireAuth: true }
)