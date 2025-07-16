'use client'

import React from 'react'
import { useAuthState, useAuthActions } from '@/lib/supabase/hooks'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BarChart3,
  Shield,
  LogOut,
  Home,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

// Navigation removed - using tabs in the main admin page instead

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuthState()
  const { signOut } = useAuthActions()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    console.log('Admin layout auth check:', { isLoading, isAuthenticated, userRole: user?.role })

    // Wait for auth to fully load before making decisions
    if (isLoading === undefined || isLoading === true) {
      console.log('Admin layout: Still loading, waiting...')
      return
    }

    // Allow admin access for anthony@adscrafted.com
    if (user?.email === 'anthony@adscrafted.com') {
      console.log('Admin layout: Allowing access for admin user')
      return
    }

    if (!isAuthenticated) {
      console.log('Admin layout: Not authenticated, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    if (user?.role !== 'ADMIN') {
      console.log('Admin layout: Not admin role, redirecting to home')
      router.push('/')
      return
    }
    
    console.log('Admin layout: Auth check passed')
  }, [user, isLoading, isAuthenticated, router])

  // Skip loading and auth checks in development
  if (process.env.NODE_ENV !== 'development') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return null
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <span className="text-xl font-bold text-gray-900">Admin Portal</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                ADMIN
              </Badge>
              <div className="text-sm text-gray-600">
                {user?.name || user?.email || (process.env.NODE_ENV === 'development' ? 'Dev Admin' : 'Unknown')}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}