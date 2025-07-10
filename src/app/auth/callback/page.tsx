'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin?message=Authentication failed')
          return
        }

        if (data.session) {
          // Check if user exists in our database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          // If user doesn't exist, create them (for OAuth sign-ups)
          if (userError && userError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name || null,
                  role: 'USER',
                  subscription_tier: 'free',
                  email_verified: !!data.session.user.email_confirmed_at,
                  is_active: true,
                  email_subscribed: true,
                },
              ])

            if (createError) {
              console.error('Error creating user:', createError)
            }
          }

          // Redirect based on user role or intended destination
          const userData_final = userData || await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
            .then(res => res.data)

          if (userData_final?.role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/auth/signin?message=Authentication failed')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth/signin?message=Authentication failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Completing sign in...
              </h2>
              <p className="text-sm text-gray-600">
                Please wait while we redirect you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}