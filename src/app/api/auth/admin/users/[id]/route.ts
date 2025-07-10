import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth-helpers'

export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (userError) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, {
  requireAuth: true,
  allowedRoles: ['ADMIN']
})

export const PATCH = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    
    const { name, role, subscriptionTier, subscriptionExpiresAt, isActive, emailSubscribed } = body
    
    // Update user in database
    const updates: any = {}
    
    if (name !== undefined) updates.name = name
    if (role !== undefined) updates.role = role
    if (subscriptionTier !== undefined) updates.subscription_tier = subscriptionTier
    if (subscriptionExpiresAt !== undefined) {
      updates.subscription_expires_at = subscriptionExpiresAt 
        ? new Date(subscriptionExpiresAt).toISOString() 
        : null
    }
    if (isActive !== undefined) updates.is_active = isActive
    if (emailSubscribed !== undefined) updates.email_subscribed = emailSubscribed
    
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'User updated successfully',
      user: userData
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, {
  requireAuth: true,
  allowedRoles: ['ADMIN']
})

export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const supabase = createServerSupabaseClient()
    
    // Delete user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(params.id)
    
    if (authError) {
      return NextResponse.json(
        { error: 'Failed to delete user account' },
        { status: 500 }
      )
    }
    
    // Delete user from database (should cascade due to foreign key)
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id)
    
    if (userError) {
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, {
  requireAuth: true,
  allowedRoles: ['ADMIN']
})