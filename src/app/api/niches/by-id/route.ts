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

// GET /api/niches/by-id - Get a single niche by query parameter
async function handleGet(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const nicheId = searchParams.get('id')
    
    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 })
    }
    
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

// PUT /api/niches/by-id - Update a niche by query parameter
async function handlePut(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const nicheId = searchParams.get('id')
    
    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 })
    }
    
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

// DELETE /api/niches/by-id - Delete a niche by query parameter
async function handleDelete(req: NextRequest) {
  console.log('[API Route DELETE] Starting delete request')
  console.log('[API Route DELETE] URL:', req.url)
  console.log('[API Route DELETE] Headers:', Object.fromEntries(req.headers.entries()))
  
  const userId = req.headers.get('x-user-id')
  const { searchParams } = new URL(req.url)
  const nicheId = searchParams.get('id')
  
  console.log('[API Route DELETE] Extracted values:', { userId, nicheId })
  
  try {
    if (!userId) {
      console.log('[API Route DELETE] No user ID found in headers - returning 401')
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    if (!nicheId) {
      return NextResponse.json({ error: 'Niche ID is required' }, { status: 400 })
    }
    
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      nicheId: nicheId,
      userId: userId
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete niche'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Create wrapped handlers
const wrappedGet = withRateLimit(handleGet, rateLimiters.api)
const wrappedPut = withRateLimit(handlePut, rateLimiters.nicheOperations)
const wrappedDelete = withRateLimit(handleDelete, rateLimiters.nicheOperations)

// Export routes with authentication
export const GET = (req: NextRequest, context?: any) => 
  withAuth(wrappedGet, { requireAuth: true })(req, context)

export const PUT = (req: NextRequest, context?: any) => 
  withAuth(wrappedPut, { requireAuth: true })(req, context)

export const DELETE = async (req: NextRequest, context?: any) => {
  console.log('[API Route] DELETE export called')
  console.log('[API Route] Request method:', req.method)
  console.log('[API Route] Request URL:', req.url)
  console.log('[API Route] Calling withAuth wrapper')
  return withAuth(wrappedDelete, { requireAuth: true })(req, context)
}