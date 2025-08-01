import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UserRole, SubscriptionTier } from '@/types/auth'

export function withAuth(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean
    allowedRoles?: string[]
    requireSubscription?: string[]
  }
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      console.log('[Auth Middleware] Starting auth check for:', req.url)
      console.log('[Auth Middleware] Method:', req.method)
      console.log('[Auth Middleware] Headers:', Object.fromEntries(req.headers.entries()))
      
      // Check for Authorization header first (for API requests with tokens)
      const authHeader = req.headers.get('authorization')
      let supabase: any
      let user: any = null
      let error: any = null
      
      if (authHeader?.startsWith('Bearer ')) {
        // Use service client with the token
        const token = authHeader.substring(7)
        console.log('[Auth Middleware] Using Bearer token for auth')
        const { createServiceSupabaseClient } = await import('@/lib/supabase/server')
        supabase = createServiceSupabaseClient()
        const result = await supabase.auth.getUser(token)
        user = result.data.user
        error = result.error
      } else {
        // Use cookie-based auth for regular requests
        console.log('[Auth Middleware] Using cookie-based auth')
        supabase = await createServerSupabaseClient()
        const result = await supabase.auth.getUser()
        user = result.data.user
        error = result.error
      }
      
      console.log('[Auth Middleware] getUser result:', { 
        user: user ? { id: user.id, email: user.email } : null, 
        error: error?.message 
      })
      
      // Check if authentication is required
      if (options?.requireAuth !== false && (!user || error)) {
        console.log('[Auth Middleware] No user found or error:', error?.message)
        console.log('[Auth Middleware] Auth required:', options?.requireAuth !== false)
        return NextResponse.json(
          { error: 'Authentication required', details: error?.message },
          { status: 401 }
        )
      }
      
      if (user) {
        console.log('[Auth Middleware] User authenticated:', user.email)
        // Fetch user details from the database
        console.log('[Auth Middleware] Fetching user profile for ID:', user.id)
        
        // For Bearer token requests, we need to use the service client for database queries
        let dbSupabase = supabase
        if (authHeader?.startsWith('Bearer ')) {
          const { createServiceSupabaseClient } = await import('@/lib/supabase/server')
          dbSupabase = createServiceSupabaseClient()
        }
        
        const { data: userProfile, error: profileError } = await dbSupabase
          .from('users')
          .select('role, subscription_tier, subscription_expires_at')
          .eq('id', user.id)
          .single()
        
        console.log('[Auth Middleware] User profile result:', { 
          userProfile, 
          error: profileError?.message 
        })
        
        if (userProfile) {
          console.log('[Auth Middleware] User profile found:', userProfile)
          // Check role requirements
          if (options?.allowedRoles && !options.allowedRoles.includes(userProfile.role)) {
            console.log('[Auth Middleware] Role check failed:', { 
              userRole: userProfile.role, 
              allowedRoles: options.allowedRoles 
            })
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            )
          }
          console.log('[Auth Middleware] Role check passed')
          
          // Check subscription requirements
          if (options?.requireSubscription) {
            if (!options.requireSubscription.includes(userProfile.subscription_tier)) {
              console.log('[Auth Middleware] Subscription check failed:', { 
                userTier: userProfile.subscription_tier, 
                requiredTiers: options.requireSubscription 
              })
              return NextResponse.json(
                { 
                  error: 'This feature requires a higher subscription tier',
                  requiredTiers: options.requireSubscription
                },
                { status: 403 }
              )
            }
            
            // Check if subscription is expired
            if (userProfile.subscription_expires_at && 
                new Date(userProfile.subscription_expires_at) < new Date()) {
              console.log('[Auth Middleware] Subscription expired:', userProfile.subscription_expires_at)
              return NextResponse.json(
                { error: 'Your subscription has expired' },
                { status: 403 }
              )
            }
            console.log('[Auth Middleware] Subscription check passed')
          }
          
          // Add user context to request headers for downstream use
          console.log('[Auth Middleware] Setting user headers')
          req.headers.set('x-user-id', user.id)
          req.headers.set('x-user-email', user.email || '')
          req.headers.set('x-user-role', userProfile.role || 'USER')
          req.headers.set('x-user-subscription', userProfile.subscription_tier || 'free')
          console.log('[Auth Middleware] Headers set:', {
            'x-user-id': user.id,
            'x-user-email': user.email,
            'x-user-role': userProfile.role,
            'x-user-subscription': userProfile.subscription_tier
          })
        } else {
          console.log('[Auth Middleware] No user profile found in database for user:', user.id)
          // If no profile, still allow but with minimal permissions
          req.headers.set('x-user-id', user.id)
          req.headers.set('x-user-email', user.email || '')
          req.headers.set('x-user-role', 'USER')
          req.headers.set('x-user-subscription', 'free')
        }
      }
      
      console.log('[Auth Middleware] Auth checks passed, calling handler')
      return await handler(req, context)
    } catch (error) {
      console.error('[Auth Middleware] Unexpected error:', error)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}

// Helper to get user from request headers (set by withAuth)
export function getUserFromRequest(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const email = req.headers.get('x-user-email')
  const role = req.headers.get('x-user-role')
  const subscriptionTier = req.headers.get('x-user-subscription')
  
  if (!userId) return null
  
  return {
    id: userId,
    email,
    role: role as UserRole,
    subscriptionTier: subscriptionTier as SubscriptionTier
  }
}