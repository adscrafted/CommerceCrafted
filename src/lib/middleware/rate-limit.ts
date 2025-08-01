import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
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
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
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
    
    // Reset if window has expired
    if (!limitData || limitData.resetTime < now) {
      limitData = {
        count: 0,
        resetTime: now + config.windowMs
      }
      rateLimitStore.set(key, limitData)
    }
    
    // Increment request count
    limitData.count++
    
    // Check if limit exceeded
    if (limitData.count > config.max) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: config.message || 'Too many requests',
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
    
    // Return null to continue with the request
    return null
  } catch (error) {
    console.error('Rate limit error:', error)
    // Don't block requests on rate limit errors
    return null
  }
}

export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(req, config)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    
    // Continue with the original handler
    const response = await handler(req, context)
    
    // Add rate limit headers to successful responses
    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      
      const key = config?.keyGenerator 
        ? config.keyGenerator(req) 
        : userId 
          ? `user:${userId}` 
          : `ip:${ip}`
      
      const limitData = rateLimitStore.get(key)
      if (limitData && config) {
        const remaining = Math.max(0, config.max - limitData.count)
        response.headers.set('X-RateLimit-Limit', config.max.toString())
        response.headers.set('X-RateLimit-Remaining', remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString())
      }
    } catch (error) {
      console.error('Error adding rate limit headers:', error)
    }
    
    return response
  }
}

// Export rate limiter presets
export const rateLimiters = {
  api: apiConfig.rateLimits.api,
  auth: apiConfig.rateLimits.auth,
  aiQueries: apiConfig.rateLimits.aiQueries,
  productAnalysis: apiConfig.rateLimits.productAnalysis,
  amazonDataFetch: apiConfig.rateLimits.amazonDataFetch,
  nicheOperations: apiConfig.rateLimits.nicheOperations,
  strict: {
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many requests, please try again later'
  },
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Rate limit exceeded'
  }
}