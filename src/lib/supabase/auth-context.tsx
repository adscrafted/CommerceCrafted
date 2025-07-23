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

  // Helper function to transform Supabase user to AuthUser
  const transformUser = async (supabaseUser: User): Promise<AuthUser | null> => {
    try {
      console.log('transformUser called for:', supabaseUser.email, 'ID:', supabaseUser.id)
      console.log('DEBUG: Checking admin email condition:', supabaseUser.email === 'anthony@adscrafted.com')
      
      // For admin users, return hardcoded admin data to bypass database issues
      if (supabaseUser.email === 'anthony@adscrafted.com' || supabaseUser.email === 'admin@commercecrafted.com') {
        console.log('BYPASSING DATABASE - Using hardcoded admin user for:', supabaseUser.email)
        
        const hardcodedAdmin = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: 'Anthony (Admin)',
          role: 'ADMIN' as UserRole,
          subscriptionTier: 'enterprise' as SubscriptionTier,
          subscriptionExpiresAt: undefined,
          emailVerified: true,
          isActive: true,
          lastLoginAt: new Date(),
          emailSubscribed: true,
          stripeCustomerId: null,
        }
        
        console.log('Returning hardcoded admin user:', hardcodedAdmin)
        return hardcodedAdmin
      }
      
      console.log('Starting database query by ID...')
      
      // Get user data from our custom users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()
      
      console.log('Database query completed. Error:', error, 'Data:', userData)

      if (error) {
        // Log the specific error
        console.error('Error fetching user from database:', error)
        console.log('Trying alternative lookup by email...')
        
        
        // Fallback to auth metadata
        console.warn('User not found in users table, using auth metadata')
        console.log('Supabase user metadata:', supabaseUser.user_metadata)
        const role = (supabaseUser.user_metadata?.role as UserRole) || 'USER'
        console.log('Using fallback role:', role)
        
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
      }

      if (!userData) {
        console.log('No userData found, returning null')
        return null
      }

      console.log('Found userData, creating user object:', userData)
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
      console.log('Returning transformed user:', transformedUser)
      return transformedUser
    } catch (error) {
      console.error('Error transforming user:', error)
      return null
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
          // Handle refresh token errors
          if (error.message?.includes('Refresh Token') || error.message?.includes('invalid')) {
            console.log('Invalid refresh token detected, clearing session')
            await supabase.auth.signOut()
          }
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
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setLoading(true)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('Transforming user...')
            const authUser = await transformUser(session.user)
            console.log('Transformed user:', authUser)
            if (authUser) {
              console.log('Setting user state...')
              console.log('Current user state before update:', user)
              console.log('Current loading state before update:', loading)
              
              setUser(authUser)
              setSession({
                user: authUser,
                supabaseUser: session.user
              })
              
              console.log('User state set successfully')
              console.log('New user state:', authUser)
              
              // Force loading to false to trigger re-render
              console.log('Setting loading to false...')
              setLoading(false)
              
              // Skip updating last login for now to avoid issues
            } else {
              console.error('Failed to transform user')
              console.log('Setting loading to false due to transform failure...')
              setLoading(false)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error: error.message }
      }

      console.log('Sign in successful:', data.user?.email)
      console.log('Sign in data:', data)
      // The auth state change listener will handle updating the user state
      // Return success immediately
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Sign in exception:', error)
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
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
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