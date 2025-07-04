'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BarChart3,
  Settings,
  Mail,
  Database,
  Shield,
  LogOut,
  Home,
  ChevronRight,
  Bell,
  Activity
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'System', href: '/admin/system', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const currentPage = navigation.find(item => item.href === pathname)

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
              
              {/* Breadcrumb */}
              {currentPage && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ChevronRight className="h-4 w-4" />
                  <span>{currentPage.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                ADMIN
              </Badge>
              <div className="text-sm text-gray-600">
                {session.user.name}
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-white rounded-lg border">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today&apos;s Signups</span>
                  <span className="font-medium text-green-600">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System Health</span>
                  <span className="font-medium text-green-600">Good</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">All Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}