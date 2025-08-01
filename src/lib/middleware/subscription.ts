import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
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
  const supabase = await createServerSupabaseClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Get user profile with subscription info
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, subscription_expires_at')
    .eq('id', authUser.id)
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404 }
    )
  }

  const { requiredTier, usageType, incrementOnSuccess = false } = options

  // Check subscription tier requirement
  if (requiredTier && requiredTier !== 'free') {
    const tierHierarchy = { free: 0, pro: 1, enterprise: 2 }
    const userTierLevel = tierHierarchy[profile.subscription_tier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = tierHierarchy[requiredTier] || 0

    if (userTierLevel < requiredTierLevel) {
      return NextResponse.json(
        { 
          error: 'Insufficient subscription tier',
          requiredTier,
          currentTier: profile.subscription_tier,
          upgradeUrl: STRIPE_CONFIG.priceIds[requiredTier]
        },
        { status: 403 }
      )
    }

    // Check if subscription is expired for paid tiers
    if (profile.subscription_tier !== 'free' && profile.subscription_expires_at) {
      const expiresAt = new Date(profile.subscription_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { 
            error: 'Subscription expired',
            expiredAt: expiresAt.toISOString(),
            renewUrl: '/billing'
          },
          { status: 403 }
        )
      }
    }
  }

  // Check usage limits if specified
  if (usageType) {
    const { allowed, remaining, limit, resetDate } = await checkUsageLimit(
      authUser.id,
      usageType
    )

    if (!allowed) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          usageType,
          limit,
          remaining: 0,
          resetDate,
          upgradeUrl: '/pricing'
        },
        { status: 429 }
      )
    }

    // Add usage info to request headers for the handler
    request.headers.set('x-usage-remaining', remaining.toString())
    request.headers.set('x-usage-limit', limit.toString())
    request.headers.set('x-usage-reset', resetDate.toISOString())
  }

  // Store user info in headers for the handler
  request.headers.set('x-user-id', authUser.id)
  request.headers.set('x-user-tier', profile.subscription_tier)

  // Set up a flag to track if usage should be incremented
  if (incrementOnSuccess && usageType) {
    request.headers.set('x-increment-usage', 'true')
    request.headers.set('x-usage-type', usageType)
  }

  return null // Continue with the request
}

export function createSubscriptionMiddleware(options: SubscriptionCheckOptions) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const subscriptionCheck = await withSubscriptionCheck(req, options)
      if (subscriptionCheck) {
        return subscriptionCheck
      }

      const response = await handler(req)

      // Increment usage on successful response if configured
      if (
        response.status >= 200 && 
        response.status < 300 && 
        req.headers.get('x-increment-usage') === 'true'
      ) {
        const userId = req.headers.get('x-user-id')!
        const usageType = req.headers.get('x-usage-type') as UsageType
        
        try {
          await incrementUsage(userId, usageType)
        } catch (error) {
          console.error('Failed to increment usage:', error)
          // Don't fail the request if usage increment fails
        }
      }

      return response
    }
  }
}