import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { withRateLimit, rateLimiters } from '@/lib/middleware/rate-limit'
import { nicheService, NicheServiceError } from '@/lib/services/niche-service-adapter'
import { z } from 'zod'

// Request validation schema
const analyzeRequestSchema = z.object({
  type: z.enum(['full', 'keywords_only', 'competition_only', 'demand_only', 'refresh']).default('full'),
  force: z.boolean().default(false), // Force re-analysis even if recently analyzed
})

// POST /api/niches/[id]/analyze - Trigger analysis for a niche
async function handlePost(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = req.headers.get('x-user-id')
    const userSubscription = req.headers.get('x-user-subscription')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }
    
    const nicheId = params.id
    
    // Parse and validate request body
    const body = await req.json().catch(() => ({}))
    const { type, force } = analyzeRequestSchema.parse(body)
    
    // Check if niche exists and belongs to user
    const niche = await nicheService.getNiche(nicheId, userId)
    if (!niche) {
      return NextResponse.json(
        { error: 'Niche not found' },
        { status: 404 }
      )
    }
    
    // Check if analysis is already in progress
    const status = await nicheService.getAnalysisStatus(nicheId, userId)
    if (status.status === 'processing' && !force) {
      return NextResponse.json({
        message: 'Analysis already in progress',
        status: status.status,
        progress: status.progress,
      }, { status: 202 })
    }
    
    // Check rate limits for analysis (more restrictive than general API)
    const lastAnalyzed = niche.last_analyzed_at
    if (lastAnalyzed && !force) {
      const timeSinceLastAnalysis = Date.now() - new Date(lastAnalyzed).getTime()
      const minInterval = userSubscription === 'enterprise' 
        ? 60 * 60 * 1000 // 1 hour for enterprise
        : userSubscription === 'pro'
        ? 4 * 60 * 60 * 1000 // 4 hours for pro
        : 24 * 60 * 60 * 1000 // 24 hours for free
      
      if (timeSinceLastAnalysis < minInterval) {
        const nextAvailable = new Date(new Date(lastAnalyzed).getTime() + minInterval)
        return NextResponse.json({
          error: 'Analysis rate limit exceeded',
          message: `You can analyze this niche again after ${nextAvailable.toISOString()}`,
          nextAvailableAt: nextAvailable,
          retryAfter: Math.ceil((nextAvailable.getTime() - Date.now()) / 1000),
        }, { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((nextAvailable.getTime() - Date.now()) / 1000).toString()
          }
        })
      }
    }
    
    // Trigger analysis
    const result = await nicheService.triggerAnalysis(nicheId, userId)
    
    return NextResponse.json({
      message: 'Analysis started successfully',
      data: {
        jobId: result.jobId,
        type,
        estimatedTime: type === 'full' ? '5-10 minutes' : '2-5 minutes',
        statusUrl: `/api/niches/${nicheId}/status`,
      }
    }, { status: 202 })
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
    
    console.error('Error triggering analysis:', error)
    return NextResponse.json(
      { error: 'Failed to trigger analysis' },
      { status: 500 }
    )
  }
}

// Export route with authentication and special analysis rate limiting
export const POST = withAuth(
  withRateLimit(handlePost, rateLimiters.analysis),
  { 
    requireAuth: true,
    // Analysis available to all tiers but with different rate limits
  }
)