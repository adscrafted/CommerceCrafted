'use client'

import { useAuth } from './auth-context'
import { useEffect, useState } from 'react'
import { UserRole, SubscriptionTier } from '@/types/auth'

// Main auth hook (re-export for convenience)
export { useAuth }

// Hook for checking if user is authenticated
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user, loading }
}

// Hook for getting current user
export const useUser = () => {
  const { user, loading } = useAuth()
  return { user, loading }
}

// Hook for getting current session
export const useSession = () => {
  const { session, loading } = useAuth()
  return { session, loading }
}

// Hook for checking user role
export const useRole = () => {
  const { user, loading } = useAuth()
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }
  
  const isAdmin = () => hasRole('ADMIN')
  const isAnalyst = () => hasRole('ADMIN') // Analyst role removed, only admin has analyst permissions
  const isUser = () => hasRole('USER')
  
  return {
    role: user?.role,
    hasRole,
    isAdmin,
    isAnalyst,
    isUser,
    loading
  }
}

// Hook for checking subscription tier
export const useSubscription = () => {
  const { user, loading } = useAuth()
  
  const hasSubscription = (tier: SubscriptionTier | SubscriptionTier[]) => {
    if (!user) return false
    
    if (Array.isArray(tier)) {
      return tier.includes(user.subscriptionTier)
    }
    
    return user.subscriptionTier === tier
  }
  
  const isFree = () => hasSubscription('free')
  const isPro = () => hasSubscription('pro')
  const isEnterprise = () => hasSubscription('enterprise')
  const isPremium = () => hasSubscription(['pro', 'enterprise'])
  
  const isSubscriptionExpired = () => {
    if (!user?.subscriptionExpiresAt) return false
    return new Date(user.subscriptionExpiresAt) < new Date()
  }
  
  const isSubscriptionActive = () => {
    if (user?.subscriptionTier === 'free') return true
    if (!user?.subscriptionExpiresAt) return false
    return new Date(user.subscriptionExpiresAt) > new Date()
  }
  
  return {
    subscriptionTier: user?.subscriptionTier,
    subscriptionExpiresAt: user?.subscriptionExpiresAt,
    hasSubscription,
    isFree,
    isPro,
    isEnterprise,
    isPremium,
    isSubscriptionExpired,
    isSubscriptionActive,
    loading
  }
}

// Hook for auth actions
export const useAuthActions = () => {
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signOut, 
    resetPassword, 
    updatePassword, 
    updateProfile,
    refreshSession 
  } = useAuth()
  
  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession
  }
}

// Hook for managing auth state in components
export const useAuthState = () => {
  const { user, session, loading } = useAuth()
  const [authChecked, setAuthChecked] = useState(false)
  
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true)
    }
  }, [loading])
  
  return {
    user,
    session,
    loading,
    authChecked,
    isAuthenticated: !!user,
    isUnauthenticated: !user && authChecked
  }
}

// Hook for protected routes
export const useProtectedRoute = (options?: {
  redirectTo?: string
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  requiredSubscription?: SubscriptionTier[]
}) => {
  const { user, loading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  useEffect(() => {
    if (loading) return
    
    const {
      requireAuth = true,
      allowedRoles,
      requiredSubscription
    } = options || {}
    
    // Check authentication
    if (requireAuth && !user) {
      setAuthError('Authentication required')
      setIsAuthorized(false)
      return
    }
    
    // Check role requirements
    if (allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        setAuthError('Insufficient permissions')
        setIsAuthorized(false)
        return
      }
    }
    
    // Check subscription requirements
    if (requiredSubscription && user) {
      if (!requiredSubscription.includes(user.subscriptionTier)) {
        setAuthError('This feature requires a higher subscription tier')
        setIsAuthorized(false)
        return
      }
      
      // Check if subscription is expired
      if (user.subscriptionExpiresAt && 
          new Date(user.subscriptionExpiresAt) < new Date()) {
        setAuthError('Your subscription has expired')
        setIsAuthorized(false)
        return
      }
    }
    
    setAuthError(null)
    setIsAuthorized(true)
  }, [user, loading, options])
  
  return {
    isAuthorized,
    authError,
    loading,
    user
  }
}

// Hook for managing loading states during auth operations
export const useAuthLoading = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const withLoading = async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await operation()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  
  const clearError = () => setError(null)
  
  return {
    isLoading,
    error,
    withLoading,
    clearError
  }
}

// Hook for email verification status
export const useEmailVerification = () => {
  const { user, loading } = useAuth()
  
  const isEmailVerified = user?.emailVerified || false
  const needsEmailVerification = !loading && user && !user.emailVerified
  
  return {
    isEmailVerified,
    needsEmailVerification,
    loading
  }
}