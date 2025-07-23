import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Sign in with a test account to establish a Supabase session
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'anthony@adscrafted.com',
      password: 'your-password-here' // You'll need to use your actual password
    })
    
    if (error) {
      return NextResponse.json({ 
        error: 'Failed to sign in',
        details: error.message,
        note: 'Please update the password in this file to your actual password'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      user: data.user?.email,
      session: !!data.session,
      message: 'Signed in successfully. Try creating a niche now.'
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}