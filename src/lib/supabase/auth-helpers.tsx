import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from './server'
import { AuthUser, UserRole, SubscriptionTier } from '@/types/auth'
import { Database } from './database.types'

interface AuthOptions {
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  requiredSubscription?: SubscriptionTier[]
}

export async function withAuth(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: AuthOptions = {}
): Promise<(req: NextRequest, context?: any) => Promise<NextResponse>> {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const supabase = createServerSupabaseClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      // Check if authentication is required
      if (options.requireAuth !== false && !session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      let user: AuthUser | null = null

      if (session) {
        // Get user data from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 401 }
          )
        }

        // Check if user is active
        if (!userData.is_active) {
          return NextResponse.json(
            { error: 'Account deactivated' },
            { status: 401 }
          )
        }

        // Transform database user to AuthUser
        user = {
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

        // Check role requirements
        if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }

        // Check subscription requirements
        if (options.requiredSubscription) {
          if (!options.requiredSubscription.includes(user.subscriptionTier)) {
            return NextResponse.json(
              {
                error: 'This feature requires a higher subscription tier',
                requiredTiers: options.requiredSubscription
              },
              { status: 403 }
            )
          }

          // Check if subscription is expired
          if (user.subscriptionExpiresAt && 
              new Date(user.subscriptionExpiresAt) < new Date()) {
            return NextResponse.json(
              { error: 'Your subscription has expired' },
              { status: 403 }
            )
          }
        }

        // Add user context to request headers
        req.headers.set('x-user-id', user.id)
        req.headers.set('x-user-role', user.role)
        req.headers.set('x-user-subscription', user.subscriptionTier)
        req.headers.set('x-user-email', user.email)
      }

      return handler(req, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}

// Helper to get user from request headers (set by withAuth)
export function getUserFromRequest(req: NextRequest): {
  id: string
  role: string
  subscriptionTier: string
  email: string
} | null {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  const subscriptionTier = req.headers.get('x-user-subscription')
  const email = req.headers.get('x-user-email')

  if (!userId || !role || !subscriptionTier || !email) {
    return null
  }

  return {
    id: userId,
    role,
    subscriptionTier,
    email
  }
}

// Server-side auth helper for pages
export async function getServerAuth(): Promise<{
  user: AuthUser | null
  session: any
}> {
  const supabase = createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return { user: null, session: null }
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return { user: null, session: null }
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

    return { user, session }
  } catch (error) {
    console.error('Error getting server auth:', error)
    return { user: null, session: null }
  }
}

// Check if user has required role
export function hasRequiredRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Check if user has required subscription
export function hasRequiredSubscription(
  user: AuthUser | null,
  requiredTiers: SubscriptionTier[]
): boolean {
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

// Create a protected page wrapper
export function createProtectedPage<T extends Record<string, any>>(
  PageComponent: React.ComponentType<T>,
  options: AuthOptions = {}
) {
  return async function ProtectedPage(props: T) {
    const { user } = await getServerAuth()

    if (options.requireAuth !== false && !user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600">Please sign in to access this page.</p>
          </div>
        </div>
      )
    }

    if (options.allowedRoles && user && !hasRequiredRole(user, options.allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }

    if (options.requiredSubscription && user && !hasRequiredSubscription(user, options.requiredSubscription)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Subscription Required</h1>
            <p className="text-gray-600">This feature requires a higher subscription tier.</p>
          </div>
        </div>
      )
    }

    return <PageComponent {...props} />
  }
}