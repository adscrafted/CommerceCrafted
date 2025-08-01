'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './client'
import { AuthUser, AuthSession, AuthContextType, UserRole, SubscriptionTier } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to clear all auth state
  const clearAuthState = () => {
    console.log('[Auth Context] Clearing auth state')
    setUser(null)
    setSession(null)
    
    // Only clear storage if we're actually signed out, not during initialization
    if (typeof window !== 'undefined') {
      // Don't clear everything aggressively - let Supabase handle its own cleanup
      console.log('[Auth Context] Auth state cleared in memory')
    }
    setLoading(false)
  }

  // Helper function to transform Supabase user to AuthUser
  const transformUser = async (supabaseUser: User): Promise<AuthUser | null> => {
    try {
      console.log('transformUser called for:', supabaseUser.email, 'ID:', supabaseUser.id)
      
      // Get user data from our custom users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()
      
      console.log('Database query completed. Error:', error?.message, 'Data found:', !!userData)

      // If we have user data from the database, use it
      if (userData && !error) {
        console.log('Found userData, creating user object')
        const transformedUser = {
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
        console.log('Returning transformed user from database')
        return transformedUser
      }

      // If no database record or error, create fallback user from auth data
      console.log('No database record found, creating fallback user from auth data')
      const role = (supabaseUser.user_metadata?.role as UserRole) || 'USER'
      
      const fallbackUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: role,
        subscriptionTier: 'free' as SubscriptionTier,
        subscriptionExpiresAt: undefined,
        emailVerified: !!supabaseUser.email_confirmed_at,
        isActive: true,
        lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined,
        emailSubscribed: false,
        stripeCustomerId: null,
      }
      console.log('Created fallback user:', fallbackUser)
      return fallbackUser
    } catch (error) {
      console.error('Error transforming user:', error)
      // Always return a fallback user rather than null to prevent auth blocking
      return {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.email?.split('@')[0] || 'User',
        role: 'USER' as UserRole,
        subscriptionTier: 'free' as SubscriptionTier,
        subscriptionExpiresAt: undefined,
        emailVerified: !!supabaseUser.email_confirmed_at,
        isActive: true,
        lastLoginAt: undefined,
        emailSubscribed: false,
        stripeCustomerId: null,
      }
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // Don't handle errors aggressively during signin - just continue
          console.log('Session error during init, continuing normally')
          setLoading(false)
          return
        }

        if (initialSession?.user) {
          const authUser = await transformUser(initialSession.user)
          if (authUser) {
            setUser(authUser)
            setSession({
              user: authUser,
              supabaseUser: initialSession.user
            })
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // On any error, clear potentially corrupted session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-bcqhovifscrhlkvdhkuf-auth-token')
        }
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing session')
          clearAuthState()
          return
        }
        
        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state')
          clearAuthState()
          return
        }
        
        // Don't clear state for missing sessions during initialization
        if (!session && event !== 'SIGNED_IN') {
          return
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('Transforming user...')
            const authUser = await transformUser(session.user)
            console.log('Transformed user:', authUser)
            if (authUser) {
              console.log('Setting user state...')
              
              setUser(authUser)
              setSession({
                user: authUser,
                supabaseUser: session.user
              })
              
              console.log('User state set successfully')
            } else {
              console.error('Failed to transform user')
            }
          }
          // Always set loading to false after processing auth state change
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setLoading(false)
        } else if (event === 'USER_DELETED') {
          clearAuthState()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting sign in for:', email)
      setLoading(true) // Ensure loading state is set
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[AuthContext] Sign in error:', error)
        setLoading(false) // Clear loading on error
        return { error: error.message }
      }

      console.log('[AuthContext] Sign in successful:', data.user?.email)
      
      if (data.session?.user) {
        // Transform and set user immediately for faster UI feedback
        const authUser = await transformUser(data.session.user)
        if (authUser) {
          setUser(authUser)
          setSession({
            user: authUser,
            supabaseUser: data.session.user
          })
        }
      }
      
      setLoading(false) // Always clear loading after sign in attempt
      return { success: true, user: data.user }
    } catch (error) {
      console.error('[AuthContext] Sign in exception:', error)
      setLoading(false) // Clear loading on exception
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, metadata?: { name?: string; role?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata?.name || email.split('@')[0],
            role: metadata?.role || 'USER',
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      // Create user record in our custom users table
      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              name: metadata?.name || data.user.email!.split('@')[0],
              role: metadata?.role || 'USER',
              subscription_tier: metadata?.role === 'ADMIN' ? 'enterprise' : 'free',
              email_verified: metadata?.role === 'ADMIN' ? true : false,
              is_active: true,
              email_subscribed: true,
            },
          ])

        if (userError) {
          console.error('Error creating user record:', userError)
          return { error: 'Failed to create user profile' }
        }
      }

      return {}
    } catch (error) {
      console.error('Sign up exception:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback#type=recovery`,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      if (!user) {
        return { error: 'No user logged in' }
      }

      // Update user in our custom users table
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          role: updates.role,
          subscription_tier: updates.subscriptionTier,
          subscription_expires_at: updates.subscriptionExpiresAt?.toISOString(),
          email_subscribed: updates.emailSubscribed,
        })
        .eq('id', user.id)

      if (error) {
        return { error: error.message }
      }

      // Update auth user metadata if email is being updated
      if (updates.email && updates.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email,
        })

        if (authError) {
          return { error: authError.message }
        }
      }

      // Refresh user data
      await refreshSession()

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        // Handle refresh token errors
        if (error.message?.includes('Refresh Token') || error.message?.includes('invalid')) {
          console.log('Invalid refresh token detected during refresh, clearing session')
          clearAuthState()
          await supabase.auth.signOut()
        }
        return
      }

      if (currentSession?.user) {
        const authUser = await transformUser(currentSession.user)
        if (authUser) {
          setUser(authUser)
          setSession({
            user: authUser,
            supabaseUser: currentSession.user
          })
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}