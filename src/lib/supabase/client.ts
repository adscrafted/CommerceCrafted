import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-build'

console.log('[Supabase Client] Initializing with URL:', supabaseUrl)

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,  // Re-enable for proper session management
    persistSession: true,    // Re-enable so users can stay logged in
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null
        
        // Check both localStorage and cookies
        const item = window.localStorage.getItem(key)
        if (item) return item
        
        // Fallback to cookies
        const cookies = document.cookie.split('; ')
        const cookie = cookies.find(c => c.startsWith(`${key}=`))
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        
        // Set in localStorage
        window.localStorage.setItem(key, value)
        
        // Also set as cookie for server-side access
        const maxAge = 60 * 60 * 24 * 7 // 7 days
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        
        // Remove from localStorage
        window.localStorage.removeItem(key)
        
        // Remove cookie
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      },
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Add debugging and error handling
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase Client] Auth state changed:', event, session?.user?.email)
  
  // Handle refresh token errors gracefully
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.log('[Supabase Client] Token refresh failed, clearing only Supabase storage')
    // Clear only Supabase-related storage, not everything
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      // Clear Supabase cookies only
      document.cookie.split(";").forEach((c) => {
        if (c.trim().startsWith('sb-')) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        }
      })
    }
  }
})

// Check initial session with minimal error handling
supabase.auth.getSession().then(({ data, error }) => {
  // Don't interfere with the sign-in flow - just log
  console.log('[Supabase Client] Initial session check:', { 
    user: data.session?.user?.email, 
    error: error?.message 
  })
})