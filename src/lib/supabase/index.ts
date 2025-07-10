// Main Supabase exports
export { supabase } from './client'
export { createServerSupabaseClient } from './server'
export { createSupabaseMiddleware, withSupabaseAuth } from './middleware'

// Auth context and hooks
export { AuthProvider, useAuth } from './auth-context'
export * from './hooks'

// Session management
export { clientSession, serverSession, sessionUtils } from './session'

// Auth helpers
export * from './auth-helpers'

// Utilities
export * from './utils'

// Types
export type { Database } from './database.types'