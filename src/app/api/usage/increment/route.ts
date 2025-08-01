import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { incrementUsage, UsageType } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { usageType, count = 1 }: { usageType: UsageType; count?: number } = await request.json()

    if (!usageType || !['analyses', 'aiQueries', 'exports', 'keywordResearch'].includes(usageType)) {
      return NextResponse.json(
        { error: 'Invalid usage type' },
        { status: 400 }
      )
    }

    const usage = await incrementUsage(authUser.id, usageType, count)

    return NextResponse.json({ 
      success: true,
      usage,
      usageType,
      userId: authUser.id 
    })

  } catch (error) {
    if (error instanceof Error && error.message.includes('Usage limit exceeded')) {
      return NextResponse.json(
        { 
          error: error.message,
          limitExceeded: true,
          upgradeUrl: '/pricing'
        },
        { status: 429 }
      )
    }

    console.error('Error incrementing usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}