import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError } from '@/lib/services/niche-service-adapter'

// GET /api/niches/[id]/status - Get analysis status for a niche
async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Get analysis status
    const status = await nicheService.getAnalysisStatus(nicheId, userId)
    
    // Get latest analysis result if completed
    let analysisResult = null
    if (status.status === 'completed') {
      analysisResult = await nicheService.getNicheAnalysis(nicheId, userId)
    }
    
    return NextResponse.json({
      data: {
        ...status,
        analysis: analysisResult,
      }
    })
  } catch (error) {
    if (error instanceof NicheServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    console.error('Error fetching analysis status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis status' },
      { status: 500 }
    )
  }
}

// Export route with authentication and rate limiting
export const GET = withAuth(
  withRateLimit(handleGet, rateLimiters.api),
  { requireAuth: true }
)