import { prisma } from '@/lib/prisma'
import { STRIPE_CONFIG } from '@/lib/stripe'

export type UsageType = 'analyses' | 'aiQueries' | 'exports' | 'keywordResearch'

export interface UsageInfo {
  usageType: UsageType
  usageCount: number
  usageLimit: number | null
  resetDate: Date
  isUnlimited: boolean
  remainingUsage: number | null
  percentageUsed: number | null
}

export async function getUserUsage(userId: string, usageType: UsageType): Promise<UsageInfo> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Get user to determine subscription tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get usage limits for the user's plan
  const plan = STRIPE_CONFIG.plans[user.subscriptionTier as keyof typeof STRIPE_CONFIG.plans]
  const limit = plan?.limits?.[usageType] || null

  // Get or create usage record for this month
  let usage = await prisma.subscriptionUsage.findFirst({
    where: {
      userId,
      usageType,
      periodStart: startOfMonth,
    }
  })

  if (!usage) {
    usage = await prisma.subscriptionUsage.create({
      data: {
        userId,
        usageType,
        usageCount: 0,
        usageLimit: limit,
        periodStart: startOfMonth,
        periodEnd: endOfMonth,
        resetDate: nextResetDate,
      }
    })
  }

  const isUnlimited = limit === null
  const remainingUsage = isUnlimited ? null : Math.max(0, (limit || 0) - usage.usageCount)
  const percentageUsed = isUnlimited ? null : ((usage.usageCount / (limit || 1)) * 100)

  return {
    usageType,
    usageCount: usage.usageCount,
    usageLimit: limit,
    resetDate: usage.resetDate,
    isUnlimited,
    remainingUsage,
    percentageUsed,
  }
}

export async function checkUsageLimit(userId: string, usageType: UsageType): Promise<boolean> {
  const usage = await getUserUsage(userId, usageType)
  
  if (usage.isUnlimited) {
    return true
  }

  return (usage.remainingUsage || 0) > 0
}

export async function incrementUsage(userId: string, usageType: UsageType, count = 1): Promise<UsageInfo> {
  const canUse = await checkUsageLimit(userId, usageType)
  
  if (!canUse) {
    throw new Error(`Usage limit exceeded for ${usageType}`)
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  await prisma.subscriptionUsage.updateMany({
    where: {
      userId,
      usageType,
      periodStart: startOfMonth,
    },
    data: {
      usageCount: {
        increment: count
      }
    }
  })

  return await getUserUsage(userId, usageType)
}

export async function getAllUserUsage(userId: string): Promise<Record<UsageType, UsageInfo>> {
  const usageTypes: UsageType[] = ['analyses', 'aiQueries', 'exports', 'keywordResearch']
  
  const usagePromises = usageTypes.map(async (type) => {
    const usage = await getUserUsage(userId, type)
    return [type, usage] as [UsageType, UsageInfo]
  })

  const usageArray = await Promise.all(usagePromises)
  return Object.fromEntries(usageArray) as Record<UsageType, UsageInfo>
}

export async function resetMonthlyUsage(): Promise<void> {
  // This function can be called by a cron job to reset usage at the beginning of each month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  // Archive old usage records by setting them to inactive
  await prisma.subscriptionUsage.updateMany({
    where: {
      resetDate: {
        lte: now
      },
      isActive: true
    },
    data: {
      isActive: false
    }
  })

  // Create new usage records for all active users
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      subscriptionTier: true 
    }
  })

  const usageTypes: UsageType[] = ['analyses', 'aiQueries', 'exports', 'keywordResearch']

  for (const user of users) {
    const plan = STRIPE_CONFIG.plans[user.subscriptionTier as keyof typeof STRIPE_CONFIG.plans]
    
    for (const usageType of usageTypes) {
      const limit = plan?.limits?.[usageType] || null
      
      await prisma.subscriptionUsage.upsert({
        where: {
          userId_usageType_periodStart: {
            userId: user.id,
            usageType,
            periodStart: startOfMonth
          }
        },
        update: {
          usageCount: 0,
          usageLimit: limit,
          periodEnd: endOfMonth,
          resetDate: nextResetDate,
          isActive: true
        },
        create: {
          userId: user.id,
          usageType,
          usageCount: 0,
          usageLimit: limit,
          periodStart: startOfMonth,
          periodEnd: endOfMonth,
          resetDate: nextResetDate,
          isActive: true
        }
      })
    }
  }
}

export function getPlanFeatures(planId: string) {
  const plan = STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans]
  return plan?.features || []
}

export function getPlanLimits(planId: string) {
  const plan = STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans]
  return plan?.limits || {}
}

export function formatUsageDisplay(usage: UsageInfo): string {
  if (usage.isUnlimited) {
    return `${usage.usageCount.toLocaleString()} / Unlimited`
  }
  return `${usage.usageCount} / ${usage.usageLimit}`
}