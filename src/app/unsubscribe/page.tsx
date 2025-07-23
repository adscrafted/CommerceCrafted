'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid unsubscribe link')
      return
    }

    unsubscribe()
  }, [token])

  const unsubscribe = async () => {
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('You have been successfully unsubscribed from our Product of the Day newsletter.')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to unsubscribe. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Unsubscribe</CardTitle>
          <CardDescription>
            Manage your newsletter preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing your request...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6">
                We're sorry to see you go! You won't receive any more Product of the Day emails.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Return to Homepage
                  </Button>
                </Link>
                <p className="text-xs text-gray-500">
                  Changed your mind? You can always{' '}
                  <Link href="/pricing" className="text-blue-600 hover:underline">
                    sign up again
                  </Link>
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-6">{message}</p>
              <Link href="/">
                <Button variant="outline">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}