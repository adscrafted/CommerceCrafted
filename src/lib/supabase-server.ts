import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Server-side Supabase client that handles missing env vars gracefully
// This prevents build errors when env vars aren't available during build time

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client during build time
    // This will never be used in production as env vars will be available
    console.warn('Supabase environment variables not found - using placeholder')
    return null
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase admin environment variables not found - using placeholder')
    return null
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Export functions that create clients on demand
export function getServerSupabase() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client not available - check environment variables')
  }
  return client
}

export function getServerSupabaseAdmin() {
  const client = getSupabaseAdminClient()
  if (!client) {
    throw new Error('Supabase admin client not available - check environment variables')
  }
  return client
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}