import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { incrementUsage, UsageType } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
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

    const usage = await incrementUsage(session.user.id, usageType, count)

    return NextResponse.json({ 
      success: true,
      usage,
      usageType,
      userId: session.user.id 
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