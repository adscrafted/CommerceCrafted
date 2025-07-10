import { createServerSupabaseClient } from './server'
import { supabase } from './client'
import { AuthUser, UserRole, SubscriptionTier } from '@/types/auth'

// Client-side session management
export class ClientSessionManager {
  private static instance: ClientSessionManager
  private user: AuthUser | null = null
  private callbacks: Array<(user: AuthUser | null) => void> = []

  private constructor() {}

  static getInstance(): ClientSessionManager {
    if (!ClientSessionManager.instance) {
      ClientSessionManager.instance = new ClientSessionManager()
    }
    return ClientSessionManager.instance
  }

  // Subscribe to user changes
  subscribe(callback: (user: AuthUser | null) => void): () => void {
    this.callbacks.push(callback)
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback)
    }
  }

  // Update user and notify subscribers
  setUser(user: AuthUser | null) {
    this.user = user
    this.callbacks.forEach(callback => callback(user))
  }

  // Get current user
  getUser(): AuthUser | null {
    return this.user
  }

  // Clear user data
  clearUser() {
    this.setUser(null)
  }

  // Get user from Supabase and transform to AuthUser
  async fetchUser(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        return null
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        return null
      }

      const user: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        subscriptionTier: userData.subscription_tier as SubscriptionTier,
        subscriptionExpiresAt: userData.subscription_expires_at
          ? new Date(userData.subscription_expires_at)
          : undefined,
        emailVerified: userData.email_verified,
        isActive: userData.is_active,
        lastLoginAt: userData.last_login_at
          ? new Date(userData.last_login_at)
          : undefined,
        emailSubscribed: userData.email_subscribed,
        stripeCustomerId: userData.stripe_customer_id,
      }

      this.setUser(user)
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  // Refresh session
  async refreshSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        this.clearUser()
        return
      }

      if (session) {
        await this.fetchUser()
      } else {
        this.clearUser()
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      this.clearUser()
    }
  }

  // Check if user has permission for a specific action
  hasPermission(permission: string): boolean {
    if (!this.user) return false

    const rolePermissions = {
      USER: ['read:own', 'write:own'],
      ANALYST: ['read:own', 'write:own', 'read:analytics', 'write:analytics'],
      ADMIN: ['read:all', 'write:all', 'delete:all', 'manage:users']
    }

    const userPermissions = rolePermissions[this.user.role] || []
    return userPermissions.includes(permission)
  }

  // Check if user has required subscription
  hasSubscription(tier: SubscriptionTier | SubscriptionTier[]): boolean {
    if (!this.user) return false

    const requiredTiers = Array.isArray(tier) ? tier : [tier]
    
    if (!requiredTiers.includes(this.user.subscriptionTier)) {
      return false
    }

    // Check if subscription is expired
    if (this.user.subscriptionExpiresAt && 
        new Date(this.user.subscriptionExpiresAt) < new Date()) {
      return false
    }

    return true
  }

  // Get subscription status
  getSubscriptionStatus(): {
    tier: SubscriptionTier
    isActive: boolean
    expiresAt?: Date
    daysRemaining?: number
  } {
    if (!this.user) {
      return {
        tier: 'free',
        isActive: false
      }
    }

    const isActive = this.user.subscriptionTier === 'free' || 
      !this.user.subscriptionExpiresAt || 
      new Date(this.user.subscriptionExpiresAt) > new Date()

    const daysRemaining = this.user.subscriptionExpiresAt
      ? Math.ceil((new Date(this.user.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : undefined

    return {
      tier: this.user.subscriptionTier,
      isActive,
      expiresAt: this.user.subscriptionExpiresAt,
      daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : undefined
    }
  }
}

// Server-side session management
export class ServerSessionManager {
  private supabase = createServerSupabaseClient()

  // Get current user from server session
  async getUser(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error || !session) {
        return null
      }

      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        return null
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as UserRole,
        subscriptionTier: userData.subscription_tier as SubscriptionTier,
        subscriptionExpiresAt: userData.subscription_expires_at
          ? new Date(userData.subscription_expires_at)
          : undefined,
        emailVerified: userData.email_verified,
        isActive: userData.is_active,
        lastLoginAt: userData.last_login_at
          ? new Date(userData.last_login_at)
          : undefined,
        emailSubscribed: userData.email_subscribed,
        stripeCustomerId: userData.stripe_customer_id,
      }
    } catch (error) {
      console.error('Error getting server user:', error)
      return null
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser()
    return user !== null
  }

  // Check if user has required role
  async hasRole(allowedRoles: UserRole[]): Promise<boolean> {
    const user = await this.getUser()
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  // Check if user has required subscription
  async hasSubscription(requiredTiers: SubscriptionTier[]): Promise<boolean> {
    const user = await this.getUser()
    if (!user) return false
    
    if (!requiredTiers.includes(user.subscriptionTier)) {
      return false
    }

    // Check if subscription is expired
    if (user.subscriptionExpiresAt && 
        new Date(user.subscriptionExpiresAt) < new Date()) {
      return false
    }

    return true
  }

  // Update user last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  // Update user subscription
  async updateSubscription(
    userId: string,
    tier: SubscriptionTier,
    expiresAt?: Date
  ): Promise<void> {
    try {
      await this.supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_expires_at: expiresAt?.toISOString() || null
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  // Deactivate user account
  async deactivateUser(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)
    } catch (error) {
      console.error('Error deactivating user:', error)
    }
  }

  // Activate user account
  async activateUser(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId)
    } catch (error) {
      console.error('Error activating user:', error)
    }
  }
}

// Session utilities
export const sessionUtils = {
  // Format subscription expiry
  formatSubscriptionExpiry(expiresAt?: Date): string {
    if (!expiresAt) return 'Never'
    return expiresAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  // Get subscription badge color
  getSubscriptionBadgeColor(tier: SubscriptionTier): string {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return colors[tier] || colors.free
  },

  // Get role badge color
  getRoleBadgeColor(role: UserRole): string {
    const colors = {
      USER: 'bg-green-100 text-green-800',
      ANALYST: 'bg-yellow-100 text-yellow-800',
      ADMIN: 'bg-red-100 text-red-800'
    }
    return colors[role] || colors.USER
  },

  // Check if subscription is expiring soon (within 7 days)
  isSubscriptionExpiringSoon(expiresAt?: Date): boolean {
    if (!expiresAt) return false
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  },

  // Get days until subscription expires
  getDaysUntilExpiry(expiresAt?: Date): number | null {
    if (!expiresAt) return null
    const days = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }
}

// Export singleton instances
export const clientSession = ClientSessionManager.getInstance()
export const serverSession = new ServerSessionManager()