import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole, SubscriptionTier } from '@/types/auth'

// Role hierarchy: ADMIN > USER
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 2,
  USER: 1,
}

// Subscription tier hierarchy: enterprise > pro > free
export const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  enterprise: 3,
  pro: 2,
  free: 1,
}

export interface AuthorizationResult {
  authorized: boolean
  message?: string
  redirectTo?: string
}

export async function requireAuth(): Promise<AuthorizationResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return {
      authorized: false,
      message: 'Authentication required',
      redirectTo: '/auth/signin'
    }
  }

  return { authorized: true }
}

export async function requireRole(
  requiredRole: UserRole | UserRole[]
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  if (!authResult.authorized) {
    return authResult
  }

  const session = await getServerSession(authOptions)
  const userRole = session!.user.role as UserRole
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  const userRoleLevel = ROLE_HIERARCHY[userRole] || 0
  const hasPermission = requiredRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role] || 0
    return userRoleLevel >= requiredLevel
  })

  if (!hasPermission) {
    return {
      authorized: false,
      message: 'Insufficient permissions',
      redirectTo: '/dashboard'
    }
  }

  return { authorized: true }
}

export async function requireSubscriptionTier(
  requiredTier: string | string[]
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  if (!authResult.authorized) {
    return authResult
  }

  const session = await getServerSession(authOptions)
  const userTier = session!.user.subscriptionTier
  const requiredTiers = Array.isArray(requiredTier) ? requiredTier : [requiredTier]
  
  // Check if subscription has expired
  const now = new Date()
  const expiresAt = session!.user.subscriptionExpiresAt
  
  if (userTier !== 'free' && expiresAt && new Date(expiresAt) < now) {
    return {
      authorized: false,
      message: 'Subscription has expired. Please renew to continue.',
      redirectTo: '/pricing'
    }
  }

  const userTierLevel = TIER_HIERARCHY[userTier as SubscriptionTier] || 0
  const hasAccess = requiredTiers.some(tier => {
    const requiredLevel = TIER_HIERARCHY[tier as SubscriptionTier] || 0
    return userTierLevel >= requiredLevel
  })

  if (!hasAccess) {
    return {
      authorized: false,
      message: `${requiredTiers.join(' or ')} subscription required for this feature`,
      redirectTo: '/pricing'
    }
  }

  return { authorized: true }
}

export async function requireEmailVerification(): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  if (!authResult.authorized) {
    return authResult
  }

  const session = await getServerSession(authOptions)
  
  if (!session!.user.emailVerified) {
    return {
      authorized: false,
      message: 'Email verification required',
      redirectTo: '/auth/verify-email'
    }
  }

  return { authorized: true }
}

export async function checkFeatureAccess(feature: string): Promise<AuthorizationResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return {
      authorized: false,
      message: 'Authentication required',
      redirectTo: '/auth/signin'
    }
  }

  const userTier = session.user.subscriptionTier
  
  // Feature access mapping
  const featureAccess: Record<string, string[]> = {
    'basic_analysis': ['free', 'pro', 'enterprise'],
    'unlimited_analysis': ['pro', 'enterprise'],
    'ai_research_agent': ['pro', 'enterprise'],
    'advanced_analytics': ['pro', 'enterprise'],
    'api_access': ['enterprise'],
    'white_label': ['enterprise'],
    'priority_support': ['pro', 'enterprise'],
    'custom_integrations': ['enterprise'],
  }

  const allowedTiers = featureAccess[feature] || []
  
  if (!allowedTiers.includes(userTier)) {
    const upgradeMessage = userTier === 'free' 
      ? 'Upgrade to Pro or Enterprise to access this feature'
      : 'Enterprise subscription required for this feature'
    
    return {
      authorized: false,
      message: upgradeMessage,
      redirectTo: '/pricing'
    }
  }

  // Check subscription expiry for paid plans
  if (userTier !== 'free') {
    const now = new Date()
    const expiresAt = session.user.subscriptionExpiresAt
    
    if (expiresAt && new Date(expiresAt) < now) {
      return {
        authorized: false,
        message: 'Subscription has expired. Please renew to continue.',
        redirectTo: '/pricing'
      }
    }
  }

  return { authorized: true }
}

// Usage limits for different tiers
export const USAGE_LIMITS: Record<SubscriptionTier, {
  productAnalyses: number;
  aiQueries: number;
  savedProducts: number;
  exportLimit: number;
}> = {
  free: {
    productAnalyses: 5,
    aiQueries: 0,
    savedProducts: 10,
    exportLimit: 0,
  },
  pro: {
    productAnalyses: 500,
    aiQueries: 1000,
    savedProducts: 1000,
    exportLimit: 100,
  },
  enterprise: {
    productAnalyses: -1, // unlimited
    aiQueries: -1, // unlimited
    savedProducts: -1, // unlimited
    exportLimit: -1, // unlimited
  },
}

export async function checkUsageLimit(
  feature: keyof typeof USAGE_LIMITS.free,
  currentUsage: number
): Promise<AuthorizationResult> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return {
      authorized: false,
      message: 'Authentication required',
      redirectTo: '/auth/signin'
    }
  }

  const userTier = session.user.subscriptionTier as SubscriptionTier
  const limits = USAGE_LIMITS[userTier] || USAGE_LIMITS.free
  const limit = limits[feature]

  // -1 means unlimited
  if (limit === -1) {
    return { authorized: true }
  }

  if (currentUsage >= limit) {
    return {
      authorized: false,
      message: `You've reached your ${feature} limit for the ${userTier} tier. Upgrade to continue.`,
      redirectTo: '/pricing'
    }
  }

  return { authorized: true }
}

// Helper function for client-side components
export function getSubscriptionTierInfo(tier: string) {
  const tierInfo: Record<SubscriptionTier, {
    name: string;
    color: string;
    features: string[];
    limitations: string[];
  }> = {
    free: {
      name: 'Free',
      color: 'gray',
      features: ['5 Product Analyses', 'Basic Keyword Research', 'Daily Opportunities'],
      limitations: ['No AI Assistant', 'Limited Exports', 'Basic Support']
    },
    pro: {
      name: 'Pro',
      color: 'blue',
      features: ['500 Product Analyses', 'AI Research Agent', 'Advanced Analytics', 'Priority Support'],
      limitations: ['No API Access', 'No White Label']
    },
    enterprise: {
      name: 'Enterprise',
      color: 'purple',
      features: ['Unlimited Everything', 'API Access', 'White Label', 'Custom Integrations'],
      limitations: []
    }
  }

  return tierInfo[tier as SubscriptionTier] || tierInfo.free
}