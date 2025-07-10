import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { apiConfig } from '@/lib/api-config'

interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: NextRequest) => string
}

// In-memory store for rate limit data (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = apiConfig.rateLimits.api
): Promise<NextResponse | null> {
  try {
    // Get user identifier (IP or user ID)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    // Generate rate limit key
    const key = config.keyGenerator 
      ? config.keyGenerator(req) 
      : userId 
        ? `user:${userId}` 
        : `ip:${ip}`
    
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Get or create rate limit data
    let limitData = rateLimitStore.get(key)
    
    if (!limitData || limitData.resetTime < now) {
      // Create new window
      limitData = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitStore.set(key, limitData)
    }
    
    // Check if limit exceeded
    if (limitData.count >= config.max) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: config.message || 'Too many requests, please try again later.',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString()
          }
        }
      )
    }
    
    // Increment counter
    limitData.count++
    
    // Return null to continue processing
    return null
  } catch (error) {
    console.error('Rate limit error:', error)
    // Don't block requests on rate limit errors
    return null
  }
}

// Specific rate limiters for different operations
export const rateLimiters = {
  // General API rate limit
  api: (req: NextRequest) => rateLimit(req, apiConfig.rateLimits.api),
  
  // Analysis rate limit (more restrictive)
  analysis: (req: NextRequest) => rateLimit(req, {
    ...apiConfig.rateLimits.analysis,
    message: 'Analysis rate limit exceeded. Please wait before triggering another analysis.'
  }),
  
  // Niche operations rate limit
  nicheOperations: (req: NextRequest) => rateLimit(req, {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 operations per 5 minutes
    message: 'Too many niche operations. Please slow down.'
  }),
  
  // Export rate limit (very restrictive)
  export: (req: NextRequest) => rateLimit(req, {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 exports per hour
    message: 'Export rate limit exceeded. You can export up to 5 times per hour.'
  })
}

// Middleware helper to apply rate limiting
export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  rateLimiter: (req: NextRequest) => Promise<NextResponse | null> = rateLimiters.api
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimiter(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return handler(req, context)
  }
}