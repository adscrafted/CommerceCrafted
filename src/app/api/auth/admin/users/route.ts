import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/supabase/auth-helpers'

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const subscriptionTier = searchParams.get('subscriptionTier')
    
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }
    
    if (role) {
      query = query.eq('role', role)
    }
    
    if (subscriptionTier) {
      query = query.eq('subscription_tier', subscriptionTier)
    }
    
    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    // Order by created_at desc
    query = query.order('created_at', { ascending: false })
    
    const { data: users, error, count } = await query
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, {
  requireAuth: true,
  allowedRoles: ['ADMIN']
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    
    const { email, name, role, subscriptionTier, password } = body
    
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    })
    
    if (authError) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }
    
    // Create user in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          name,
          role: role || 'USER',
          subscription_tier: subscriptionTier || 'free',
          email_verified: true,
          is_active: true,
          email_subscribed: true,
        }
      ])
      .select()
      .single()
    
    if (userError) {
      // Clean up auth user if database insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'User created successfully',
      user: userData
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}, {
  requireAuth: true,
  allowedRoles: ['ADMIN']
})