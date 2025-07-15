import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-for-build'

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// For server-side operations that need elevated permissions
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key-for-build'

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to get user from session
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}