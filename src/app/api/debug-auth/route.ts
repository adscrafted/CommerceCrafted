import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Debug: Log all cookies
    const cookies = req.cookies.getAll()
    console.log('All cookies:', cookies.map(c => ({ name: c.name, valueLength: c.value.length })))
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error in debug API:', authError)
      return NextResponse.json({ 
        error: 'Auth error',
        details: authError.message,
        cookies: cookies.map(c => c.name)
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        cookies: cookies.map(c => c.name)
      }, { status: 401 })
    }
    
    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single()
    
    return NextResponse.json({
      authUser: {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role
      },
      dbUser: userData,
      dbError: userError?.message,
      cookies: cookies.map(c => c.name)
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}