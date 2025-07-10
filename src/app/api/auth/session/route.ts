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
        { session: null, user: null }
      )
    }
    
    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json(
        { session: null, user: null }
      )
    }
    
    // Transform user data
    const user = transformSupabaseUser(session.user, userData)
    
    return NextResponse.json({
      session: {
        user,
        supabaseUser: session.user
      },
      user
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Refresh session
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) {
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { session: null, user: null }
      )
    }
    
    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (userError || !userData) {
      return NextResponse.json(
        { session: null, user: null }
      )
    }
    
    // Transform user data
    const user = transformSupabaseUser(session.user, userData)
    
    return NextResponse.json({
      session: {
        user,
        supabaseUser: session.user
      },
      user
    })
  } catch (error) {
    console.error('Refresh session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}