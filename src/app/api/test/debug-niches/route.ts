import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test 1: Check if we can connect to Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test 2: Check if niches table exists and get its structure
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('*')
      .limit(1)
    
    // Test 3: Try to get table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('niches')
      .select()
      .limit(0)
    
    return NextResponse.json({
      auth: {
        hasUser: !!user,
        error: authError?.message,
        userEmail: user?.email
      },
      niches: {
        canQuery: !nichesError,
        error: nichesError?.message,
        sample: niches?.[0] || 'No niches found',
        columns: niches?.[0] ? Object.keys(niches[0]) : []
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}