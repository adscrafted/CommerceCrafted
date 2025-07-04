import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, incrementUsage, UsageType } from '@/lib/usage'
import { STRIPE_CONFIG } from '@/lib/stripe'

export interface SubscriptionCheckOptions {
  requiredTier?: 'free' | 'pro' | 'enterprise'
  usageType?: UsageType
  incrementOnSuccess?: boolean
}

export async function withSubscriptionCheck(
  request: NextRequest,
  options: SubscriptionCheckOptions = {}
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const user = session.user
  const { requiredTier, usageType, incrementOnSuccess = false } = options

  // Check subscription tier requirement
  if (requiredTier && requiredTier !== 'free') {
    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 }
    const userTierLevel = tierHierarchy[user.subscriptionTier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = tierHierarchy[requiredTier]

    if (userTierLevel < requiredTierLevel) {
      return NextResponse.json(
        { 
          error: 'Subscription upgrade required',
          requiredTier,
          currentTier: user.subscriptionTier,
          upgradeUrl: '/pricing'
        },
        { status: 402 } // Payment Required
      )
    }
  }

  // Check usage limits
  if (usageType) {
    try {
      const canUse = await checkUsageLimit(user.id, usageType)
      
      if (!canUse) {
        const plan = STRIPE_CONFIG.plans[user.subscriptionTier as keyof typeof STRIPE_CONFIG.plans]
        const limit = plan?.limits?.[usageType]
        
        return NextResponse.json(
          { 
            error: 'Usage limit exceeded',
            usageType,
            limit,
            upgradeUrl: '/pricing'
          },
          { status: 429 } // Too Many Requests
        )
      }

      // Increment usage if requested and check passed
      if (incrementOnSuccess) {
        await incrementUsage(user.id, usageType)
      }
    } catch (error) {
      console.error('Error checking usage limits:', error)
      return NextResponse.json(
        { error: 'Error checking subscription limits' },
        { status: 500 }
      )
    }
  }

  // Check subscription expiration
  if (user.subscriptionExpiresAt && new Date() > new Date(user.subscriptionExpiresAt)) {
    return NextResponse.json(
      { 
        error: 'Subscription expired',
        expiredAt: user.subscriptionExpiresAt,
        renewUrl: '/billing'
      },
      { status: 402 }
    )
  }

  return null // No restrictions, continue with request
}

export function createSubscriptionMiddleware(options: SubscriptionCheckOptions) {
  return async (request: NextRequest) => {
    const restriction = await withSubscriptionCheck(request, options)
    if (restriction) {
      return restriction
    }
    // Continue to the actual API handler
    return null
  }
}

// Helper function to enforce subscription in API routes
export async function enforceSubscription(
  request: NextRequest,
  options: SubscriptionCheckOptions = {}
): Promise<NextResponse | null> {
  return await withSubscriptionCheck(request, options)
}

// Higher-order function to wrap API handlers with subscription checks
export function withSubscription(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SubscriptionCheckOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const restriction = await withSubscriptionCheck(request, options)
    if (restriction) {
      return restriction
    }
    return await handler(request)
  }
}

// Usage tracking decorators for common operations
export const trackAnalysisUsage = (handler: Function) => {
  return withSubscription(handler, {
    usageType: 'analyses',
    incrementOnSuccess: true
  })
}

export const trackAIQueryUsage = (handler: Function) => {
  return withSubscription(handler, {
    usageType: 'aiQueries',
    incrementOnSuccess: true
  })
}

export const trackExportUsage = (handler: Function) => {
  return withSubscription(handler, {
    usageType: 'exports',
    incrementOnSuccess: true
  })
}

export const requireProTier = (handler: Function) => {
  return withSubscription(handler, {
    requiredTier: 'pro'
  })
}

export const requireEnterpriseTier = (handler: Function) => {
  return withSubscription(handler, {
    requiredTier: 'enterprise'
  })
}