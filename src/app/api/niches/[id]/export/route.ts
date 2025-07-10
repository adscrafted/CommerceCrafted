import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError } from '@/lib/services/niche-service-adapter'
import { z } from 'zod'

// Request validation schema
const exportRequestSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  includeAnalysis: z.boolean().default(true),
  includeProducts: z.boolean().default(true),
})

// GET /api/niches/[id]/export - Export niche data
async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userSubscription = req.headers.get('x-user-subscription')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    // Free users cannot export
    if (userSubscription === 'free') {
      return NextResponse.json(
        { 
          error: 'Export feature requires a Pro or Enterprise subscription',
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      )
    }
    
    const nicheId = params.id
    
    // Parse query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const { format } = exportRequestSchema.parse(searchParams)
    
    // Export niche data
    const exportData = await nicheService.exportNicheData(nicheId, userId, format)
    
    // Return file response
    return new NextResponse(exportData.data, {
      status: 200,
      headers: {
        'Content-Type': exportData.contentType,
        'Content-Disposition': `attachment; filename="${exportData.filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
    
    console.error('Error exporting niche:', error)
    return NextResponse.json(
      { error: 'Failed to export niche data' },
      { status: 500 }
    )
  }
}

// Export route with authentication and export rate limiting
export const GET = withAuth(
  withRateLimit(handleGet, rateLimiters.export),
  { 
    requireAuth: true,
    requireSubscription: ['pro', 'enterprise']
  }
)