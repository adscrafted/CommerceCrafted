'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthActions, useAuthState } from '@/lib/supabase/hooks'
import { supabase } from '@/lib/supabase/client'
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

function SignInComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [planPrice, setPlanPrice] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [skipAutoRedirect, setSkipAutoRedirect] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuthActions()
  const { user, isAuthenticated } = useAuthState()

  useEffect(() => {
    const urlMessage = searchParams.get('message')
    const plan = searchParams.get('plan')
    const price = searchParams.get('price')
    
    if (urlMessage) {
      setMessage(urlMessage)
    }
    
    if (plan) {
      setSelectedPlan(plan)
      setPlanPrice(price)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth state in signin page:', { 
      isAuthenticated, 
      user: user ? { email: user.email, role: user.role } : null, 
      loading: !user && !isAuthenticated,
      authChecked: true,
      hasRedirected,
      currentPath: window.location.pathname
    })
    
    // Skip auto-redirect if hasRedirected is already set (from auto-login) or skipAutoRedirect is true
    if (hasRedirected || skipAutoRedirect) {
      console.log('Skipping auto-redirect, hasRedirected:', hasRedirected, 'skipAutoRedirect:', skipAutoRedirect)
      return
    }
    
    // Prevent redirect loops - don't redirect if we're already on the target page
    if (isAuthenticated && user) {
      const redirectUrl = searchParams.get('callbackUrl') || '/dashboard'
      const currentPath = window.location.pathname
      
      // Check if we're already on the target page
      if (currentPath === redirectUrl || 
          (user.role === 'ADMIN' && currentPath === '/admin') ||
          (currentPath === '/dashboard')) {
        console.log('Already on target page, not redirecting')
        return
      }
      
      console.log('User authenticated, redirecting...')
      setHasRedirected(true)
      
      setTimeout(() => {
        if (selectedPlan && planPrice) {
          window.location.href = `/billing?plan=${selectedPlan}&price=${planPrice}`
        } else if (user.role === 'ADMIN') {
          const adminRedirect = redirectUrl.includes('admin') ? redirectUrl : '/admin'
          console.log('Redirecting admin to:', adminRedirect)
          window.location.href = adminRedirect
        } else {
          window.location.href = redirectUrl
        }
      }, 100)
    }
  }, [isAuthenticated, user, selectedPlan, planPrice, searchParams, hasRedirected])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    console.log('Starting sign in...')

    try {
      const result = await signIn(email, password)
      console.log('Sign in result:', result)

      if (result.error) {
        console.error('Sign in error:', result.error)
        setError(result.error)
        setIsLoading(false)
      } else {
        console.log('Sign in successful, waiting for auth state...')
        // Let the useEffect handle the redirect to avoid double redirects
      }
    } catch (error) {
      console.error('Sign in exception:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleAutoLogin = () => {
    console.log('Bypass auto-login - going directly to admin...')
    
    // Just go directly to admin page - bypass all auth
    const redirectUrl = searchParams.get('callbackUrl') || '/admin'
    console.log('Direct redirect to:', redirectUrl)
    
    // Set a flag in localStorage so the admin page knows this is a debug access
    localStorage.setItem('debug_admin_access', 'true')
    
    // Go directly
    window.location.href = redirectUrl
  }


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedPlan ? `Complete Your ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan Purchase` : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {selectedPlan 
              ? `Sign in to complete your ${selectedPlan} plan subscription ($${planPrice}/year)`
              : 'Sign in to your CommerceCrafted account'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              {selectedPlan 
                ? `Complete your ${selectedPlan} plan purchase after signing in`
                : 'Access your Amazon product research dashboard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Selection Banner */}
            {selectedPlan && (
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan Selected</strong> - ${planPrice}/year
                  <br />After signing in, you&apos;ll be redirected to complete your payment.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Success Message */}
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Debug Auto-Login */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-800">🚨 Debug Mode</h4>
                  <p className="text-xs text-red-700">Auto-login as admin</p>
                </div>
                <Button 
                  type="button"
                  onClick={handleAutoLogin} 
                  disabled={isLoading}
                  variant="destructive"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    '🔐 Auto-Login'
                  )}
                </Button>
              </div>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>


            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SignInComponent />
    </Suspense>
  )
}