import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-build'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add error handling for refresh token issues
    onAuthError: (error) => {
      console.error('Supabase auth error:', error)
      if (error.message?.includes('Refresh Token') || error.message?.includes('invalid')) {
        // Clear the session if refresh token is invalid
        console.log('Clearing invalid session due to refresh token error')
        if (typeof window !== 'undefined') {
          // Clear all auth-related cookies
          document.cookie.split(";").forEach((c) => {
            if (c.trim().startsWith('sb-')) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            }
          });
        }
      }
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})