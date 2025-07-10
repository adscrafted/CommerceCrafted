import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { transformSupabaseUser } from '@/lib/supabase/utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to get session' },
        { status: 401 }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Transform user data
    const user = transformSupabaseUser(session.user, userData)
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, email, subscriptionTier, role } = body
    
    // Update user in database
    const updates: any = {}
    
    if (name !== undefined) updates.name = name
    if (subscriptionTier !== undefined) updates.subscription_tier = subscriptionTier
    if (role !== undefined) updates.role = role
    
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
    
    // Update email in auth if provided
    if (email && email !== session.user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email
      })
      
      if (emailError) {
        return NextResponse.json(
          { error: 'Failed to update email' },
          { status: 500 }
        )
      }
    }
    
    // Transform and return updated user
    const user = transformSupabaseUser(session.user, userData)
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}