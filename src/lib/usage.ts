import { supabase } from '@/lib/supabase'
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
  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  // Get usage limits for the user's plan
  const plan = STRIPE_CONFIG.plans[user.subscription_tier as keyof typeof STRIPE_CONFIG.plans]
  const limit = plan?.limits?.[usageType] || null

  // Get or create usage record for this month
  let { data: usage } = await supabase
    .from('subscription_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('usage_type', usageType)
    .eq('period_start', startOfMonth.toISOString())
    .maybeSingle()

  if (!usage) {
    const { data: newUsage } = await supabase
      .from('subscription_usage')
      .insert({
        user_id: userId,
        usage_type: usageType,
        usage_count: 0,
        usage_limit: limit,
        period_start: startOfMonth.toISOString(),
        period_end: endOfMonth.toISOString(),
        reset_date: nextResetDate.toISOString(),
      })
      .select('*')
      .single()
    usage = newUsage
  }

  const isUnlimited = limit === null
  const remainingUsage = isUnlimited ? null : Math.max(0, (limit || 0) - usage.usage_count)
  const percentageUsed = isUnlimited ? null : ((usage.usage_count / (limit || 1)) * 100)

  return {
    usageType,
    usageCount: usage.usage_count,
    usageLimit: limit,
    resetDate: new Date(usage.reset_date),
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

  await supabase.rpc('increment_usage_count', {
    p_user_id: userId,
    p_usage_type: usageType,
    p_period_start: startOfMonth.toISOString(),
    p_count: count
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
  await supabase
    .from('subscription_usage')
    .update({ is_active: false })
    .lte('reset_date', now.toISOString())
    .eq('is_active', true)

  // Create new usage records for all active users
  const { data: users } = await supabase
    .from('users')
    .select('id, subscription_tier')
  
  if (!users) return

  const usageTypes: UsageType[] = ['analyses', 'aiQueries', 'exports', 'keywordResearch']

  for (const user of users) {
    const plan = STRIPE_CONFIG.plans[user.subscription_tier as keyof typeof STRIPE_CONFIG.plans]
    
    for (const usageType of usageTypes) {
      const limit = plan?.limits?.[usageType] || null
      
      await supabase.from('subscription_usage').upsert({
        user_id: user.id,
        usage_type: usageType,
        period_start: startOfMonth.toISOString(),
        usage_count: 0,
        usage_limit: limit,
        period_end: endOfMonth.toISOString(),
        reset_date: nextResetDate.toISOString(),
        is_active: true
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