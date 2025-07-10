// Authentication and authorization types
import { User } from '@supabase/supabase-js'

export type UserRole = 'USER' | 'ADMIN' | 'ANALYST'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt?: Date
  emailVerified?: boolean
  isActive?: boolean
  lastLoginAt?: Date
  emailSubscribed?: boolean
  stripeCustomerId?: string | null
}

export interface AuthSession {
  user: AuthUser
  supabaseUser: User
}

export interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error?: string }>
  refreshSession: () => Promise<void>
}

export interface AuthError {
  message: string
  code?: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
  role?: UserRole
  subscriptionTier?: SubscriptionTier
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}