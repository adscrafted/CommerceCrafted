'use client'

import React, { useState } from 'react'
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
  ArrowLeft,
  Package,
  Menu,
  X
} from 'lucide-react'

// Navigation removed - using tabs in the main admin page instead

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthenticated } = useAuthState()
  const { signOut } = useAuthActions()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  React.useEffect(() => {
    console.log('Admin layout auth check:', { 
      loading, 
      isAuthenticated, 
      userRole: user?.role,
      userEmail: user?.email,
      userId: user?.id,
      pathname
    })

    // Wait for auth to fully load before making decisions
    if (loading) {
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
      // Only redirect if not already on signin page
      if (pathname !== '/auth/signin') {
        router.push('/auth/signin')
      }
      return
    }

    if (user?.role !== 'ADMIN') {
      console.log('Admin layout: Not admin role, redirecting to home')
      // Only redirect if not already on home page
      if (pathname !== '/') {
        router.push('/')
      }
      return
    }
    
    console.log('Admin layout: Auth check passed')
  }, [user, loading, isAuthenticated, router, pathname])

  // Skip loading and auth checks in development
  if (process.env.NODE_ENV !== 'development') {
    if (loading) {
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
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden mr-4"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
              
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="text-blue-600 text-lg sm:text-2xl font-bold">CommerceCrafted</span>
              </Link>
              
              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6 ml-8">
                <Link
                  href="/admin/niche"
                  className={`flex items-center space-x-2 text-sm font-medium ${
                    pathname === '/admin/niche' || pathname.startsWith('/admin/niche/')
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Niche</span>
                </Link>
                <Link
                  href="/admin/users"
                  className={`flex items-center space-x-2 text-sm font-medium ${
                    pathname === '/admin/users' || pathname.startsWith('/admin/users/')
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  className={`flex items-center space-x-2 text-sm font-medium ${
                    pathname === '/admin/analytics'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge className="bg-red-100 text-red-800 text-xs sm:text-sm">
                <Shield className="h-3 w-3 mr-1" />
                ADMIN
              </Badge>
              <div className="hidden sm:block text-sm text-gray-600">
                {user?.name || user?.email || (process.env.NODE_ENV === 'development' ? 'Dev Admin' : 'Unknown')}
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/admin/niche"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 text-sm font-medium px-2 py-2 rounded-md ${
                    pathname === '/admin/niche' || pathname.startsWith('/admin/niche/')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Niche</span>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 text-sm font-medium px-2 py-2 rounded-md ${
                    pathname === '/admin/users' || pathname.startsWith('/admin/users/')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 text-sm font-medium px-2 py-2 rounded-md ${
                    pathname === '/admin/analytics'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  )
}