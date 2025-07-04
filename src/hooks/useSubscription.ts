'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface SubscriptionInfo {
  tier: string
  isActive: boolean
  isExpired: boolean
  expiresAt?: Date
  daysUntilExpiry?: number
}

interface FeatureAccess {
  hasAccess: boolean
  reason?: string
  upgradeRequired: boolean
}

interface UsageLimit {
  current: number
  limit: number
  unlimited: boolean
  percentage: number
  nearLimit: boolean
}

export function useSubscription() {
  const { data: session } = useSession()
  const router = useRouter()

  const subscriptionInfo: SubscriptionInfo = useMemo(() => {
    if (!session?.user) {
      return {
        tier: 'free',
        isActive: false,
        isExpired: false,
      }
    }

    const tier = session.user.subscriptionTier
    const expiresAt = session.user.subscriptionExpiresAt ? new Date(session.user.subscriptionExpiresAt) : undefined
    const now = new Date()
    
    let isExpired = false
    let daysUntilExpiry: number | undefined

    if (tier !== 'free' && expiresAt) {
      isExpired = expiresAt < now
      if (!isExpired) {
        daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    return {
      tier,
      isActive: tier === 'free' || !isExpired,
      isExpired,
      expiresAt,
      daysUntilExpiry,
    }
  }, [session])

  const checkFeatureAccess = useCallback((feature: string): FeatureAccess => {
    if (!session?.user) {
      return {
        hasAccess: false,
        reason: 'Authentication required',
        upgradeRequired: false,
      }
    }

    const featureMap: Record<string, string[]> = {
      'basic_analysis': ['free', 'pro', 'enterprise'],
      'unlimited_analysis': ['pro', 'enterprise'],
      'ai_research': ['pro', 'enterprise'],
      'advanced_analytics': ['pro', 'enterprise'],
      'bulk_export': ['pro', 'enterprise'],
      'api_access': ['enterprise'],
      'white_label': ['enterprise'],
      'priority_support': ['pro', 'enterprise'],
      'custom_integrations': ['enterprise'],
    }

    const allowedTiers = featureMap[feature] || ['free']
    const hasAccess = allowedTiers.includes(subscriptionInfo.tier)

    if (!hasAccess) {
      const upgradeMessage = subscriptionInfo.tier === 'free' 
        ? 'Upgrade to Pro or Enterprise'
        : 'Enterprise subscription required'
      
      return {
        hasAccess: false,
        reason: upgradeMessage,
        upgradeRequired: true,
      }
    }

    if (subscriptionInfo.isExpired) {
      return {
        hasAccess: false,
        reason: 'Subscription expired',
        upgradeRequired: true,
      }
    }

    return { hasAccess: true, upgradeRequired: false }
  }, [session, subscriptionInfo])

  const getUsageLimit = useCallback((feature: string, currentUsage: number): UsageLimit => {
    const limits: Record<string, Record<string, number>> = {
      free: {
        product_analyses: 5,
        ai_queries: 0,
        saved_products: 10,
        exports: 0,
      },
      pro: {
        product_analyses: 500,
        ai_queries: 1000,
        saved_products: 1000,
        exports: 100,
      },
      enterprise: {
        product_analyses: -1,
        ai_queries: -1,
        saved_products: -1,
        exports: -1,
      },
    }

    const tierLimits = limits[subscriptionInfo.tier] || limits.free
    const limit = tierLimits[feature] || 0
    
    if (limit === -1) {
      return {
        current: currentUsage,
        limit: -1,
        unlimited: true,
        percentage: 0,
        nearLimit: false,
      }
    }

    const percentage = limit > 0 ? (currentUsage / limit) * 100 : 100
    const nearLimit = percentage >= 80

    return {
      current: currentUsage,
      limit,
      unlimited: false,
      percentage,
      nearLimit,
    }
  }, [subscriptionInfo.tier])

  const redirectToUpgrade = useCallback((feature?: string) => {
    const url = new URL('/pricing', window.location.origin)
    if (feature) {
      url.searchParams.set('feature', feature)
    }
    if (subscriptionInfo.isExpired) {
      url.searchParams.set('expired', 'true')
    }
    router.push(url.toString())
  }, [router, subscriptionInfo.isExpired])

  const enforceFeatureAccess = useCallback((feature: string): boolean => {
    const access = checkFeatureAccess(feature)
    if (!access.hasAccess) {
      if (access.upgradeRequired) {
        redirectToUpgrade(feature)
      }
      return false
    }
    return true
  }, [checkFeatureAccess, redirectToUpgrade])

  const enforceUsageLimit = useCallback((feature: string, currentUsage: number): boolean => {
    const usage = getUsageLimit(feature, currentUsage)
    
    if (!usage.unlimited && currentUsage >= usage.limit) {
      redirectToUpgrade(feature)
      return false
    }
    
    return true
  }, [getUsageLimit, redirectToUpgrade])

  const getSubscriptionStatus = useCallback(() => {
    if (subscriptionInfo.tier === 'free') {
      return {
        status: 'free',
        message: 'Free plan - Limited features',
        variant: 'default' as const,
      }
    }

    if (subscriptionInfo.isExpired) {
      return {
        status: 'expired',
        message: 'Subscription expired - Renew to continue',
        variant: 'destructive' as const,
      }
    }

    if (subscriptionInfo.daysUntilExpiry && subscriptionInfo.daysUntilExpiry <= 7) {
      return {
        status: 'expiring',
        message: `Subscription expires in ${subscriptionInfo.daysUntilExpiry} days`,
        variant: 'warning' as const,
      }
    }

    return {
      status: 'active',
      message: `${subscriptionInfo.tier.charAt(0).toUpperCase() + subscriptionInfo.tier.slice(1)} plan active`,
      variant: 'default' as const,
    }
  }, [subscriptionInfo])

  return {
    subscription: subscriptionInfo,
    checkFeatureAccess,
    getUsageLimit,
    enforceFeatureAccess,
    enforceUsageLimit,
    redirectToUpgrade,
    getSubscriptionStatus,
    isAuthenticated: !!session?.user,
    user: session?.user,
  }
}