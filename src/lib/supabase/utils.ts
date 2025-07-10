import { User } from '@supabase/supabase-js'
import { AuthUser, UserRole, SubscriptionTier } from '@/types/auth'

// Auth validation utilities
export const authValidation = {
  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Validate password strength
  isValidPassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Check password strength level
  getPasswordStrength(password: string): {
    level: 'weak' | 'medium' | 'strong'
    score: number
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []
    
    // Length check
    if (password.length >= 8) score += 1
    else suggestions.push('Use at least 8 characters')
    
    if (password.length >= 12) score += 1
    else if (password.length >= 8) suggestions.push('Consider using 12+ characters')
    
    // Character variety
    if (/[A-Z]/.test(password)) score += 1
    else suggestions.push('Add uppercase letters')
    
    if (/[a-z]/.test(password)) score += 1
    else suggestions.push('Add lowercase letters')
    
    if (/\d/.test(password)) score += 1
    else suggestions.push('Add numbers')
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else suggestions.push('Add special characters')
    
    // Common patterns penalty
    if (/(.)\1{2,}/.test(password)) {
      score -= 1
      suggestions.push('Avoid repeating characters')
    }
    
    if (/123|abc|qwe|password|admin/i.test(password)) {
      score -= 1
      suggestions.push('Avoid common words and patterns')
    }
    
    let level: 'weak' | 'medium' | 'strong' = 'weak'
    if (score >= 5) level = 'strong'
    else if (score >= 3) level = 'medium'
    
    return { level, score: Math.max(0, score), suggestions }
  },

  // Validate name
  isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50
  }
}

// Auth error handling
export const authErrors = {
  // Map Supabase error codes to user-friendly messages
  getErrorMessage(error: any): string {
    if (typeof error === 'string') return error
    
    const errorCode = error?.code || error?.error_code || error?.message
    
    const errorMessages: Record<string, string> = {
      'invalid_credentials': 'Invalid email or password. Please try again.',
      'email_not_confirmed': 'Please check your email and click the confirmation link.',
      'user_not_found': 'No account found with this email address.',
      'user_already_registered': 'An account with this email already exists.',
      'weak_password': 'Password is too weak. Please choose a stronger password.',
      'email_address_invalid': 'Please enter a valid email address.',
      'signup_disabled': 'Sign up is currently disabled.',
      'invalid_request': 'Invalid request. Please try again.',
      'rate_limit_exceeded': 'Too many requests. Please wait a moment and try again.',
      'network_error': 'Network error. Please check your connection and try again.',
      'timeout': 'Request timed out. Please try again.',
      'invalid_token': 'Invalid or expired token. Please request a new one.',
      'expired_token': 'Token has expired. Please request a new one.',
      'unauthorized': 'You are not authorized to perform this action.',
      'forbidden': 'Access forbidden. Please check your permissions.',
      'not_found': 'Resource not found.',
      'conflict': 'Conflict occurred. Please try again.',
      'server_error': 'Server error occurred. Please try again later.',
      'service_unavailable': 'Service temporarily unavailable. Please try again later.'
    }
    
    // Try to match error code
    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode]
    }
    
    // Try to match error message
    const errorMessage = error?.message?.toLowerCase() || ''
    
    if (errorMessage.includes('invalid') && errorMessage.includes('password')) {
      return errorMessages.invalid_credentials
    }
    
    if (errorMessage.includes('email') && errorMessage.includes('not') && errorMessage.includes('confirm')) {
      return errorMessages.email_not_confirmed
    }
    
    if (errorMessage.includes('user') && errorMessage.includes('not') && errorMessage.includes('found')) {
      return errorMessages.user_not_found
    }
    
    if (errorMessage.includes('email') && errorMessage.includes('already') && errorMessage.includes('registered')) {
      return errorMessages.user_already_registered
    }
    
    if (errorMessage.includes('weak') && errorMessage.includes('password')) {
      return errorMessages.weak_password
    }
    
    if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
      return errorMessages.email_address_invalid
    }
    
    if (errorMessage.includes('rate') && errorMessage.includes('limit')) {
      return errorMessages.rate_limit_exceeded
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return errorMessages.network_error
    }
    
    if (errorMessage.includes('timeout')) {
      return errorMessages.timeout
    }
    
    if (errorMessage.includes('unauthorized')) {
      return errorMessages.unauthorized
    }
    
    if (errorMessage.includes('forbidden')) {
      return errorMessages.forbidden
    }
    
    if (errorMessage.includes('not found')) {
      return errorMessages.not_found
    }
    
    // Default fallback
    return error?.message || 'An unexpected error occurred. Please try again.'
  },

  // Check if error is retryable
  isRetryable(error: any): boolean {
    const retryableErrors = [
      'network_error',
      'timeout',
      'rate_limit_exceeded',
      'server_error',
      'service_unavailable'
    ]
    
    const errorCode = error?.code || error?.error_code
    const errorMessage = error?.message?.toLowerCase() || ''
    
    if (errorCode && retryableErrors.includes(errorCode)) {
      return true
    }
    
    return retryableErrors.some(code => errorMessage.includes(code.replace('_', ' ')))
  }
}

// Auth formatting utilities
export const authFormatters = {
  // Format user display name
  formatDisplayName(user: AuthUser): string {
    if (user.name) {
      return user.name
    }
    
    // Extract name from email
    const emailParts = user.email.split('@')
    if (emailParts.length > 0) {
      return emailParts[0]
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }
    
    return 'User'
  },

  // Format user initials
  formatInitials(user: AuthUser): string {
    if (user.name) {
      return user.name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    }
    
    return user.email.charAt(0).toUpperCase()
  },

  // Format role display
  formatRole(role: UserRole): string {
    const roleLabels: Record<UserRole, string> = {
      USER: 'User',
      ANALYST: 'Analyst',
      ADMIN: 'Administrator'
    }
    
    return roleLabels[role] || role
  },

  // Format subscription tier
  formatSubscriptionTier(tier: SubscriptionTier): string {
    const tierLabels: Record<SubscriptionTier, string> = {
      free: 'Free',
      pro: 'Pro',
      enterprise: 'Enterprise'
    }
    
    return tierLabels[tier] || tier
  },

  // Format subscription status
  formatSubscriptionStatus(user: AuthUser): {
    label: string
    color: string
    isActive: boolean
  } {
    const isActive = user.subscriptionTier === 'free' || 
      !user.subscriptionExpiresAt || 
      new Date(user.subscriptionExpiresAt) > new Date()
    
    if (!isActive) {
      return {
        label: 'Expired',
        color: 'text-red-600',
        isActive: false
      }
    }
    
    if (user.subscriptionTier === 'free') {
      return {
        label: 'Free',
        color: 'text-gray-600',
        isActive: true
      }
    }
    
    return {
      label: this.formatSubscriptionTier(user.subscriptionTier),
      color: user.subscriptionTier === 'pro' ? 'text-blue-600' : 'text-purple-600',
      isActive: true
    }
  }
}

// Auth permission utilities
export const authPermissions = {
  // Check if user can access admin features
  canAccessAdmin(user: AuthUser): boolean {
    return user.role === 'ADMIN'
  },

  // Check if user can access analytics
  canAccessAnalytics(user: AuthUser): boolean {
    return ['ADMIN', 'ANALYST'].includes(user.role)
  },

  // Check if user can manage users
  canManageUsers(user: AuthUser): boolean {
    return user.role === 'ADMIN'
  },

  // Check if user can access premium features
  canAccessPremiumFeatures(user: AuthUser): boolean {
    if (user.subscriptionTier === 'free') return false
    
    // Check if subscription is active
    if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
      return false
    }
    
    return true
  },

  // Check if user can access enterprise features
  canAccessEnterpriseFeatures(user: AuthUser): boolean {
    return user.subscriptionTier === 'enterprise' && this.canAccessPremiumFeatures(user)
  },

  // Get user's feature limits
  getFeatureLimits(user: AuthUser): {
    productAnalyses: number
    aiQueries: number
    keywordResearch: number
    competitorAnalysis: number
  } {
    const limits = {
      free: {
        productAnalyses: 5,
        aiQueries: 10,
        keywordResearch: 5,
        competitorAnalysis: 3
      },
      pro: {
        productAnalyses: 100,
        aiQueries: 500,
        keywordResearch: 50,
        competitorAnalysis: 25
      },
      enterprise: {
        productAnalyses: -1, // Unlimited
        aiQueries: -1,
        keywordResearch: -1,
        competitorAnalysis: -1
      }
    }
    
    return limits[user.subscriptionTier] || limits.free
  }
}

// Auth storage utilities
export const authStorage = {
  // Store user preferences
  setUserPreferences(userId: string, preferences: Record<string, any>): void {
    if (typeof window !== 'undefined') {
      const key = `user_preferences_${userId}`
      localStorage.setItem(key, JSON.stringify(preferences))
    }
  },

  // Get user preferences
  getUserPreferences(userId: string): Record<string, any> {
    if (typeof window !== 'undefined') {
      const key = `user_preferences_${userId}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : {}
    }
    return {}
  },

  // Clear user preferences
  clearUserPreferences(userId: string): void {
    if (typeof window !== 'undefined') {
      const key = `user_preferences_${userId}`
      localStorage.removeItem(key)
    }
  },

  // Store last visited page
  setLastVisitedPage(userId: string, page: string): void {
    if (typeof window !== 'undefined') {
      const key = `last_visited_${userId}`
      localStorage.setItem(key, page)
    }
  },

  // Get last visited page
  getLastVisitedPage(userId: string): string | null {
    if (typeof window !== 'undefined') {
      const key = `last_visited_${userId}`
      return localStorage.getItem(key)
    }
    return null
  }
}

// Transform Supabase User to AuthUser
export function transformSupabaseUser(
  supabaseUser: User,
  userData: any
): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: userData.name || supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || null,
    role: userData.role as UserRole,
    subscriptionTier: userData.subscription_tier as SubscriptionTier,
    subscriptionExpiresAt: userData.subscription_expires_at 
      ? new Date(userData.subscription_expires_at) 
      : undefined,
    emailVerified: !!supabaseUser.email_confirmed_at,
    isActive: userData.is_active,
    lastLoginAt: userData.last_login_at 
      ? new Date(userData.last_login_at) 
      : undefined,
    emailSubscribed: userData.email_subscribed,
    stripeCustomerId: userData.stripe_customer_id,
  }
}

// Generate secure random password
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + symbols
  
  let password = ''
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Mask sensitive data for logging
export function maskSensitiveData(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
  
  if (typeof data === 'object' && data !== null) {
    const masked = { ...data }
    
    Object.keys(masked).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        masked[key] = '***MASKED***'
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskSensitiveData(masked[key])
      }
    })
    
    return masked
  }
  
  return data
}