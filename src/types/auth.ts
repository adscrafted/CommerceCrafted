// Authentication and authorization types

export type UserRole = 'USER' | 'ADMIN' | 'ANALYST'

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt?: Date
  emailVerified?: Date
}

export interface AuthSession {
  user: AuthUser
}

export interface AuthToken {
  id: string
  role: UserRole
  subscriptionTier: SubscriptionTier
  subscriptionExpiresAt?: Date
  emailVerified?: Date
}