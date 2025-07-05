'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Lock, 
  Crown, 
  Mail,
  Shield,
  AlertTriangle 
} from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: string | string[]
  requireSubscription?: string | string[]
  requireEmailVerification?: boolean
  fallback?: React.ReactNode
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  requireSubscription,
  requireEmailVerification = false,
  fallback
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Authentication check
  if (requireAuth && !session) {
    if (fallback) return <>{fallback}</>
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Lock className="h-5 w-5 mr-2" />
                Authentication Required
              </CardTitle>
              <CardDescription className="text-center">
                Please sign in to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You need to be signed in to view this content.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/auth/signin')}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/signup')}
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Email verification check
  if (requireEmailVerification && session && !session.user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Verification Required
              </CardTitle>
              <CardDescription className="text-center">
                Please verify your email address to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Check your email for a verification link, or request a new one below.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button className="w-full">
                  Resend Verification Email
                </Button>
                <Button 
                  onClick={() => router.push('/profile')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Role check
  if (requireRole && session) {
    const userRole = session.user.role
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole]
    
    const roleHierarchy: Record<string, number> = {
      ADMIN: 3,
      ANALYST: 2,
      USER: 1,
    }
    
    const userRoleLevel = roleHierarchy[userRole] || 0
    const hasPermission = requiredRoles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0
      return userRoleLevel >= requiredLevel
    })

    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Denied
                </CardTitle>
                <CardDescription className="text-center">
                  Insufficient permissions to view this page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You need {requiredRoles.join(' or ')} role access to view this content.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  }

  // Subscription check
  if (requireSubscription && session) {
    const userTier = session.user.subscriptionTier
    const requiredTiers = Array.isArray(requireSubscription) ? requireSubscription : [requireSubscription]
    
    const tierHierarchy: Record<string, number> = {
      enterprise: 3,
      pro: 2,
      free: 1,
    }
    
    const userTierLevel = tierHierarchy[userTier] || 0
    const hasAccess = requiredTiers.some(tier => {
      const requiredLevel = tierHierarchy[tier] || 0
      return userTierLevel >= requiredLevel
    })

    // Check subscription expiry for paid plans
    if (hasAccess && userTier !== 'free') {
      const now = new Date()
      const expiresAt = session.user.subscriptionExpiresAt
      
      if (expiresAt && new Date(expiresAt) < now) {
        hasAccess = false
      }
    }

    if (!hasAccess) {
      const isExpired = userTier !== 'free' && session.user.subscriptionExpiresAt && 
                      new Date(session.user.subscriptionExpiresAt) < new Date()
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Crown className="h-5 w-5 mr-2" />
                  {isExpired ? 'Subscription Expired' : 'Upgrade Required'}
                </CardTitle>
                <CardDescription className="text-center">
                  {isExpired 
                    ? 'Please renew your subscription to continue'
                    : `${requiredTiers.join(' or ')} subscription required`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Crown className="h-4 w-4" />
                  <AlertDescription>
                    {isExpired 
                      ? 'Your subscription has expired. Renew now to regain access to premium features.'
                      : `This feature requires a ${requiredTiers.join(' or ')} subscription.`
                    }
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/pricing')}
                    className="w-full"
                  >
                    {isExpired ? 'Renew Subscription' : 'Upgrade Now'}
                  </Button>
                  <Button 
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

// Higher-order component version
export function withProtection(
  Component: React.ComponentType<any>,
  options: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}