import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-build'

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Server-side admin client (for operations that bypass RLS)
export const createAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  )
}

// Helper function to get current user ID
export const getCurrentUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user?.id || null
}

// Helper function to check if user is authenticated
export const checkAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('User not authenticated')
  return user
}

// Types for common database operations
export type DatabaseError = {
  code: string
  message: string
  details?: string
  hint?: string
}

export type DatabaseResponse<T> = {
  data: T | null
  error: DatabaseError | null
  count?: number
}

// Common query options
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  order?: 'asc' | 'desc'
  select?: string
}

// Subscription options for real-time updates
export interface SubscriptionOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  schema?: string
  table?: string
  filter?: string
}

export default supabase