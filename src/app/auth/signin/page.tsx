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

  // DISABLED: Auto-redirect to prevent loops
  // useEffect(() => {
  //   // Auto-redirect logic disabled
  // }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== FORM SUBMITTED ===')
    console.log('Email:', email)
    console.log('Password length:', password.length)
    
    setIsLoading(true)
    setError('')
    setHasRedirected(false) // Reset redirect flag for new sign-in attempt
    
    console.log('Starting sign in...')

    try {
      console.log('Calling signIn function...')
      const result = await signIn(email, password)
      console.log('Sign in result:', result)
      console.log('Result type:', typeof result)
      console.log('Result keys:', Object.keys(result))

      if (result.error) {
        console.error('Sign in error:', result.error)
        setError(result.error)
        setIsLoading(false)
      } else if (result.success) {
        console.log('Sign in successful, user:', result.user)
        setIsLoading(false)
        
        // Simple redirect for admin users
        if (email === 'anthony@adscrafted.com') {
          console.log('Redirecting admin user to admin panel')
          setTimeout(() => {
            window.location.href = '/admin'
          }, 500)
        }
      } else {
        console.error('Unexpected result structure:', result)
        setError('An unexpected error occurred')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Sign in exception:', error)
      console.error('Exception stack:', error.stack)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
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


            {/* Admin Panel Access */}
            {isAuthenticated && user?.email === 'anthony@adscrafted.com' && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Signed in as Admin</p>
                  <p className="text-green-600 text-sm">{user.email}</p>
                </div>
                <Button
                  onClick={() => {
                    console.log('Manual admin redirect')
                    window.location.href = '/admin'
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Go to Admin Panel →
                </Button>
              </div>
            )}

            {/* Sign Up Link */}
            {!isAuthenticated && (
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
            )}

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