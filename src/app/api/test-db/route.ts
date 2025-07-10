import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Test 1: Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No auth user', authError })
    }
    
    // Test 2: Query users table with UUID
    const { data: userByUUID, error: uuidError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Test 3: Query users table with email
    const { data: userByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email!)
      .single()
    
    // Test 4: Get all users (limit 5)
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5)
    
    return NextResponse.json({
      authUser: {
        id: user.id,
        email: user.email,
        idType: typeof user.id
      },
      userByUUID: {
        found: !!userByUUID,
        error: uuidError?.message,
        data: userByUUID
      },
      userByEmail: {
        found: !!userByEmail,
        error: emailError?.message,
        data: userByEmail
      },
      allUsers: {
        count: allUsers?.length || 0,
        error: allError?.message,
        sample: allUsers?.[0]
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}