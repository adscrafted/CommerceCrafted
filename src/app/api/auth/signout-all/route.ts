import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Sign out all sessions endpoint called')
    
    // Get all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('Found cookies:', allCookies.map(c => c.name))
    
    // Create response with cleared cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'All sessions cleared' 
    })
    
    // Clear ALL auth-related cookies
    allCookies.forEach(cookie => {
      if (
        cookie.name.includes('sb-') ||
        cookie.name.includes('auth') ||
        cookie.name.includes('next-auth') ||
        cookie.name.includes('session')
      ) {
        console.log(`Clearing cookie: ${cookie.name}`)
        response.cookies.set(cookie.name, '', {
          value: '',
          maxAge: 0,
          path: '/',
          expires: new Date(0)
        })
      }
    })
    
    // Also try to sign out from Supabase
    try {
      const supabase = createServerClient()
      await supabase.auth.signOut()
      console.log('Supabase signOut successful')
    } catch (error) {
      console.log('Supabase signOut error (continuing):', error)
    }
    
    return response
  } catch (error) {
    console.error('Sign out all error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear sessions' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Allow GET for easy browser access
  return POST(request)
}