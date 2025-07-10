import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth-helpers'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const supabase = createServerSupabaseClient()
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { tier, expiresAt } = body
    
    // Update user subscription
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription: {
        tier: userData.subscription_tier,
        expiresAt: userData.subscription_expires_at
      }
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, { requireAuth: true })

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const supabase = createServerSupabaseClient()
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      )
    }
    
    // Get user subscription data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, subscription_expires_at, stripe_customer_id')
      .eq('id', userId)
      .single()
    
    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscription data' },
        { status: 500 }
      )
    }
    
    const isActive = userData.subscription_tier === 'free' || 
      !userData.subscription_expires_at || 
      new Date(userData.subscription_expires_at) > new Date()
    
    const daysRemaining = userData.subscription_expires_at
      ? Math.ceil((new Date(userData.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null
    
    return NextResponse.json({
      subscription: {
        tier: userData.subscription_tier,
        expiresAt: userData.subscription_expires_at,
        isActive,
        daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : null,
        stripeCustomerId: userData.stripe_customer_id
      }
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, { requireAuth: true })