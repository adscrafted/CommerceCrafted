import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError, ValidationError } from '@/lib/services/niche-service-adapter'
import { z } from 'zod'

// Request validation schemas
const updateNicheSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
})

// GET /api/niches/[id] - Get a single niche
async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Fetch niche
    const niche = await nicheService.getNiche(nicheId, userId)
    
    if (!niche) {
      return NextResponse.json(
        { error: 'Niche not found' },
        { status: 404 }
      )
    }
    
    // Get additional data
    const [products, analysis] = await Promise.all([
      nicheService.getNicheProducts(nicheId, userId),
      nicheService.getNicheAnalysis(nicheId, userId),
    ])
    
    return NextResponse.json({
      data: {
        ...niche,
        products: products.length,
        latestAnalysis: analysis,
      }
    })
  } catch (error) {
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error fetching niche:', error)
    return NextResponse.json(
      { error: 'Failed to fetch niche' },
      { status: 500 }
    )
  }
}

// PUT /api/niches/[id] - Update a niche
async function handlePut(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Parse and validate request body
    const body = await req.json()
    const data = updateNicheSchema.parse(body)
    
    // Update niche
    const updatedNiche = await nicheService.updateNiche(nicheId, userId, data)
    
    return NextResponse.json({
      data: updatedNiche,
      message: 'Niche updated successfully',
    })
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
    
    console.error('Error updating niche:', error)
    return NextResponse.json(
      { error: 'Failed to update niche' },
      { status: 500 }
    )
  }
}

// DELETE /api/niches/[id] - Delete a niche
async function handleDelete(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Delete niche (cascade deletes products and analyses)
    await nicheService.deleteNiche(nicheId, userId)
    
    return NextResponse.json({
      message: 'Niche deleted successfully',
    })
  } catch (error) {
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error deleting niche:', error)
    return NextResponse.json(
      { error: 'Failed to delete niche' },
      { status: 500 }
    )
  }
}

// Export routes with authentication and rate limiting
export const GET = withAuth(
  withRateLimit(handleGet, rateLimiters.api),
  { requireAuth: true }
)

export const PUT = withAuth(
  withRateLimit(handlePut, rateLimiters.nicheOperations),
  { requireAuth: true }
)

export const DELETE = withAuth(
  withRateLimit(handleDelete, rateLimiters.nicheOperations),
  { requireAuth: true }
)