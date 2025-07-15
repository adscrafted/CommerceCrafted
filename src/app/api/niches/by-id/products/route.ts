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

const addProductsSchema = z.object({
  asins: z.array(z.string().regex(/^B[0-9A-Z]{9}$/, 'Invalid ASIN format')),
  notes: z.string().optional(),
})

const removeProductSchema = z.object({
  asin: z.string().regex(/^B[0-9A-Z]{9}$/, 'Invalid ASIN format'),
})

// GET /api/niches/by-id/products - Get products in a niche
async function handleGet(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = req.nextUrl.searchParams.get('id')
    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 })
    }
    
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

// POST /api/niches/by-id/products - Add product(s) to a niche
async function handlePost(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = req.nextUrl.searchParams.get('id')
    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 })
    }
    
    // Parse and validate request body
    const body = await req.json()
    
    // Handle bulk ASIN addition
    if (body.asins && Array.isArray(body.asins)) {
      const data = addProductsSchema.parse(body)
      const results = []
      const errors = []
      
      // Process each ASIN
      for (const asin of data.asins) {
        try {
          const productData = {
            asin,
            notes: data.notes,
          }
          const nicheProduct = await nicheService.addProductToNiche(nicheId, userId, productData)
          results.push(nicheProduct)
        } catch (error) {
          errors.push({
            asin,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        data: results,
        errors: errors.length > 0 ? errors : undefined,
        message: `Added ${results.length} products to niche${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      }, { status: 201 })
    } else {
      // Handle single ASIN addition
      const data = addProductSchema.parse(body)
      const nicheProduct = await nicheService.addProductToNiche(nicheId, userId, data)
      
      return NextResponse.json({
        data: nicheProduct,
        message: 'Product added to niche successfully',
      }, { status: 201 })
    }
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

// DELETE /api/niches/by-id/products - Remove a product from a niche
async function handleDelete(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = req.nextUrl.searchParams.get('id')
    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 })
    }
    
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