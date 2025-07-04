'use client'

import React, { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  TrendingUp,
  LogOut,
  Settings,
  Crown,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Star,
  Activity,
  Package,
  MessageSquare,
  Bell,
  User,
  ChevronRight
} from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user
  const isPro = user.subscriptionTier === 'pro' || user.subscriptionTier === 'enterprise'
  const usagePercentage = user.subscriptionTier === 'free' ? 60 : 30 // Mock usage data

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const quickActions = [
    {
      title: 'Product Analysis',
      description: 'Analyze a new Amazon product',
      icon: Search,
      href: '/demo',
      color: 'bg-blue-500'
    },
    {
      title: 'Keyword Research',
      description: 'Discover profitable keywords',
      icon: Target,
      href: '/keyword-graph',
      color: 'bg-green-500'
    },
    {
      title: 'Market Trends',
      description: 'Explore trending opportunities',
      icon: TrendingUp,
      href: '/external-data',
      color: 'bg-purple-500'
    },
    {
      title: 'Product Database',
      description: 'Browse analyzed products',
      icon: Package,
      href: '/products',
      color: 'bg-orange-500'
    }
  ]

  const recentActivity = [
    { action: 'Analyzed product: Wireless Headphones', time: '2 hours ago', type: 'analysis' },
    { action: 'Saved keyword research report', time: '4 hours ago', type: 'report' },
    { action: 'Upgraded to Pro plan', time: '1 day ago', type: 'upgrade' },
    { action: 'Created new product list', time: '2 days ago', type: 'list' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                className={`${isPro ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {isPro && <Crown className="h-3 w-3 mr-1" />}
                {user.subscriptionTier.toUpperCase()}
              </Badge>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Jump into your research tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${action.color}`}>
                            <action.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{action.title}</h3>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Search className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Analyses Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.subscriptionTier === 'free' ? '3/5' : '47/500'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">94%</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">+5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Saved Products</p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">In your portfolio</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-gray-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'analysis' ? 'bg-blue-500' :
                        activity.type === 'report' ? 'bg-green-500' :
                        activity.type === 'upgrade' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium capitalize">{user.subscriptionTier}</p>
                  {!isPro && (
                    <Button size="sm" className="mt-2">
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Member since</p>
                  <p className="font-medium">January 2024</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-sm">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Daily Deal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Today&apos;s Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Wireless Charging Pad</h4>
                    <p className="text-sm text-gray-600">High demand, low competition</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Opportunity Score</span>
                    <Badge className="bg-green-100 text-green-800">8.7/10</Badge>
                  </div>
                  <Link href="/deals">
                    <Button size="sm" className="w-full">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      View Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📚 Knowledge Base
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  💬 Live Chat
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📧 Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}