// AI Usage Tracking API
// Handles tier-based usage limits and statistics

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AIResearchAgent } from '@/lib/ai-research-agent'

// GET /api/ai/usage - Get current usage statistics
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user tier from query params or default to free
    const { searchParams } = new URL(request.url)
    const userTier = searchParams.get('tier') || 'free'

    // Validate tier
    const validTiers = ['free', 'hunter', 'pro', 'enterprise']
    if (!validTiers.includes(userTier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      )
    }

    // Get usage statistics
    const usageStats = AIResearchAgent.getUsageStats(userTier)
    const usageLimit = AIResearchAgent.getUsageLimit(userTier)
    const currentUsage = AIResearchAgent.getCurrentUsage(userTier)

    // Calculate usage percentage
    const usagePercentage = usageLimit === -1 ? 0 : (currentUsage / usageLimit) * 100

    // Determine status
    let status: 'available' | 'warning' | 'limit_reached' = 'available'
    if (usageLimit !== -1) {
      if (currentUsage >= usageLimit) {
        status = 'limit_reached'
      } else if (usagePercentage >= 80) {
        status = 'warning'
      }
    }

    // Get feature access
    const features = {
      basicAnalysis: AIResearchAgent.canUseFeature(userTier, 'basic_analysis'),
      keywordResearch: AIResearchAgent.canUseFeature(userTier, 'keyword_research'),
      advancedPPC: AIResearchAgent.canUseFeature(userTier, 'advanced_ppc'),
      financialModeling: AIResearchAgent.canUseFeature(userTier, 'financial_modeling'),
      competitorAnalysis: AIResearchAgent.canUseFeature(userTier, 'competitor_analysis')
    }

    return NextResponse.json({
      tier: userTier,
      usage: {
        current: currentUsage,
        limit: usageLimit,
        percentage: usagePercentage,
        unlimited: usageLimit === -1,
        resetDate: usageStats.resetDate?.toISOString() || null
      },
      status,
      features,
      recommendations: getUsageRecommendations(userTier, currentUsage, usageLimit)
    })

  } catch (error) {
    console.error('Usage API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve usage statistics',
        code: 'USAGE_ERROR'
      },
      { status: 500 }
    )
  }
}

// POST /api/ai/usage/reset - Reset usage cache (admin only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Check if user is admin
    // For now, allow anyone to reset for development purposes
    
    const body = await request.json()
    const { action } = body

    if (action === 'clear_cache') {
      AIResearchAgent.clearUsageCache()
      
      return NextResponse.json({
        success: true,
        message: 'Usage cache cleared successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Usage Reset API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to reset usage statistics',
        code: 'RESET_ERROR'
      },
      { status: 500 }
    )
  }
}

// Helper function to provide usage recommendations
function getUsageRecommendations(
  userTier: string, 
  currentUsage: number, 
  usageLimit: number
): Array<{
  type: 'info' | 'warning' | 'upgrade'
  message: string
  action?: string
}> {
  const recommendations = []

  if (usageLimit === -1) {
    recommendations.push({
      type: 'info' as const,
      message: 'You have unlimited AI research queries with your current plan.'
    })
    return recommendations
  }

  const usagePercentage = (currentUsage / usageLimit) * 100

  if (currentUsage >= usageLimit) {
    recommendations.push({
      type: 'upgrade' as const,
      message: 'You\'ve reached your monthly query limit. Upgrade to continue using AI research.',
      action: 'upgrade'
    })
  } else if (usagePercentage >= 80) {
    recommendations.push({
      type: 'warning' as const,
      message: `You've used ${Math.round(usagePercentage)}% of your monthly queries. Consider upgrading for unlimited access.`,
      action: 'upgrade'
    })
  } else if (usagePercentage >= 50) {
    recommendations.push({
      type: 'info' as const,
      message: `You've used ${currentUsage} of ${usageLimit} monthly queries.`
    })
  }

  // Tier-specific recommendations
  if (userTier === 'free') {
    recommendations.push({
      type: 'upgrade' as const,
      message: 'Upgrade to Hunter ($299/year) for 10 queries per month and advanced keyword research.',
      action: 'upgrade'
    })
  } else if (userTier === 'hunter') {
    recommendations.push({
      type: 'upgrade' as const,
      message: 'Upgrade to Pro ($999/year) for unlimited queries and advanced financial modeling.',
      action: 'upgrade'
    })
  }

  return recommendations
}