import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkUsageLimit, UsageType } from '@/lib/usage'

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

    const { usageType }: { usageType: UsageType } = await request.json()

    if (!usageType || !['analyses', 'aiQueries', 'exports', 'keywordResearch'].includes(usageType)) {
      return NextResponse.json(
        { error: 'Invalid usage type' },
        { status: 400 }
      )
    }

    const canUse = await checkUsageLimit(authUser.id, usageType)

    return NextResponse.json({ 
      canUse,
      usageType,
      userId: authUser.id 
    })

  } catch (error) {
    console.error('Error checking usage limit:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}