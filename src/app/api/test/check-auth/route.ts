import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Check NextAuth session
    const nextAuthSession = await getServerSession(authOptions)
    
    // Also check Supabase for comparison
    const supabase = await createServerSupabaseClient()
    const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
    
    // Check cookies
    const cookies = req.cookies.getAll()
    
    return NextResponse.json({
      nextAuth: {
        hasSession: !!nextAuthSession,
        user: nextAuthSession?.user,
        expires: nextAuthSession?.expires
      },
      supabase: {
        session: {
          exists: !!supabaseSession,
          accessToken: supabaseSession?.access_token ? 'present' : 'missing',
          user: supabaseSession?.user?.email,
          error: sessionError?.message
        },
        user: {
          exists: !!supabaseUser,
          email: supabaseUser?.email,
          id: supabaseUser?.id,
          error: userError?.message
        }
      },
      cookies: cookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        isSupabase: c.name.includes('supabase'),
        isNextAuth: c.name.includes('next-auth')
      })),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}