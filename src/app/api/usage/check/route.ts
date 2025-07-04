import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimit, UsageType } from '@/lib/usage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { usageType }: { usageType: UsageType } = await request.json()

    if (!usageType || !['analyses', 'aiQueries', 'exports', 'keywordResearch'].includes(usageType)) {
      return NextResponse.json(
        { error: 'Invalid usage type' },
        { status: 400 }
      )
    }

    const canUse = await checkUsageLimit(session.user.id, usageType)

    return NextResponse.json({ 
      canUse,
      usageType,
      userId: session.user.id 
    })

  } catch (error) {
    console.error('Error checking usage limit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}