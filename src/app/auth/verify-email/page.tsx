'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowLeft
} from 'lucide-react'

function VerifyEmailComponent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/auth/signin?message=Email verified successfully. Please sign in.')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to verify email')
        }
      } catch {
        setStatus('error')
        setMessage('An error occurred while verifying your email')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your CommerceCrafted account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              {status === 'loading' && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
              {status === 'error' && <XCircle className="h-5 w-5 mr-2 text-red-600" />}
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Message */}
            <Alert variant={status === 'error' ? 'destructive' : 'default'}>
              {status === 'success' && <CheckCircle className="h-4 w-4" />}
              {status === 'error' && <XCircle className="h-4 w-4" />}
              {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Welcome to CommerceCrafted!</h3>
                  <p className="text-xs text-green-800">
                    Your account is now active. You&apos;ll be redirected to sign in shortly.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">
                      Sign In Now
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      Go to Home
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-900 mb-2">Need Help?</h3>
                  <p className="text-xs text-red-800">
                    The verification link may have expired or already been used.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/signin">
                      Try Signing In
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/signup">
                      Create New Account
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800">
                    Please wait while we verify your email address...
                  </p>
                </div>
              </div>
            )}

            {/* Back Link */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact us at{' '}
            <a href="mailto:support@commercecrafted.com" className="text-blue-600 hover:text-blue-500">
              support@commercecrafted.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
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
      <VerifyEmailComponent />
    </Suspense>
  )
}