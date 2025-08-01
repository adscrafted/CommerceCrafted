import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  
  console.log('[Supabase Server] Creating server client')
  const allCookies = cookieStore.getAll()
  console.log('[Supabase Server] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
  
  // Look for Supabase auth cookies
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))
  console.log('[Supabase Server] Supabase cookies found:', supabaseCookies.map(c => c.name))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-build'

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log('[Supabase Server] Setting cookie:', name)
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.log('[Supabase Server] Cookie set error (expected in Server Components):', error)
          }
        },
      },
    }
  )
}

// Service role client for background tasks (niche processor)
export const createServiceSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}