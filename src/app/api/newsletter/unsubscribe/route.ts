import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Update subscription status
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .update({ 
        is_active: false
      })
      .eq('unsubscribe_token', token)
      .select()
      .single()

    if (error || !data) {
      console.error('Unsubscribe error:', error)
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe link' },
        { status: 400 }
      )
    }

    // Also update the user's email_subscribed field if they have a user_id
    if (data.user_id) {
      await supabase
        .from('users')
        .update({ email_subscribed: false })
        .eq('id', data.user_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    )
  }
}