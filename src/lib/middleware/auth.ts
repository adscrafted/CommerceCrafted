import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function withAuth(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean
    allowedRoles?: string[]
    requireSubscription?: string[]
  }
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions)
      
      // Check if authentication is required
      if (options?.requireAuth !== false && !session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // Check role requirements
      if (options?.allowedRoles && session) {
        if (!options.allowedRoles.includes(session.user.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          )
        }
      }
      
      // Check subscription requirements
      if (options?.requireSubscription && session) {
        if (!options.requireSubscription.includes(session.user.subscriptionTier)) {
          return NextResponse.json(
            { 
              error: 'This feature requires a higher subscription tier',
              requiredTiers: options.requireSubscription
            },
            { status: 403 }
          )
        }
        
        // Check if subscription is expired
        if (session.user.subscriptionExpiresAt && 
            new Date(session.user.subscriptionExpiresAt) < new Date()) {
          return NextResponse.json(
            { error: 'Your subscription has expired' },
            { status: 403 }
          )
        }
      }
      
      // Add user context to request
      if (session) {
        // Store session in request headers for downstream use
        req.headers.set('x-user-id', session.user.id)
        req.headers.set('x-user-role', session.user.role)
        req.headers.set('x-user-subscription', session.user.subscriptionTier)
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
export function getUserFromRequest(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  const subscriptionTier = req.headers.get('x-user-subscription')
  
  if (!userId) return null
  
  return {
    id: userId,
    role,
    subscriptionTier
  }
}