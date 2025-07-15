'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Mail,
  Download,
  RefreshCw,
  Target,
  Search,
  Crown,
  UserCheck,
  CreditCard,
  Loader2
} from 'lucide-react'

// Cache analytics data
let cachedAnalytics: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 300000 // 5 minutes for analytics

export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(!cachedAnalytics)
  const [analyticsData, setAnalyticsData] = useState(cachedAnalytics)

  // Memoize static data that doesn't change frequently
  const keyMetrics = useMemo(() => [
    {
      title: 'Total Revenue',
      value: '$47,329',
      change: '+12.3%',
      trend: 'up',
      icon: DollarSign,
      description: 'Monthly recurring revenue'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      description: 'Users active in last 30 days'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+0.5%',
      trend: 'up',
      icon: Target,
      description: 'Free to paid conversion'
    },
    {
      title: 'Churn Rate',
      value: '2.1%',
      change: '-0.3%',
      trend: 'down',
      icon: TrendingDown,
      description: 'Monthly subscription churn'
    }
  ], [])

  const loadAnalytics = useCallback(async (forceRefresh = false) => {
    // Check cache
    if (!forceRefresh && cachedAnalytics && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setAnalyticsData(cachedAnalytics)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Simulate API call - replace with actual analytics fetch
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const data = {
        userAcquisition: [
          { source: 'Organic Search', users: 523, percentage: 42, change: '+15%' },
          { source: 'Direct', users: 312, percentage: 25, change: '+8%' },
          { source: 'Social Media', users: 187, percentage: 15, change: '+23%' },
          { source: 'Referral', users: 134, percentage: 11, change: '+12%' },
          { source: 'Paid Ads', users: 89, percentage: 7, change: '-3%' }
        ],
        featureUsage: [
          { feature: 'Product Analysis', usage: 89, users: 1106 },
          { feature: 'Keyword Research', usage: 76, users: 944 },
          { feature: 'Market Trends', usage: 65, users: 808 },
          { feature: 'AI Research Chat', usage: 54, users: 672 },
          { feature: 'External Data', usage: 43, users: 536 },
          { feature: 'Keyword Graph', usage: 38, users: 472 }
        ],
        subscriptionMetrics: [
          { plan: 'Free', count: 832, revenue: '$0', conversion: '3.2%' },
          { plan: 'Pro', count: 356, revenue: '$10,640', conversion: '89%' },
          { plan: 'Enterprise', count: 59, revenue: '$29,500', conversion: '94%' }
        ],
        emailMetrics: [
          { campaign: 'Daily Deals Newsletter', sent: 1247, opened: 423, clicked: 89, rate: '33.9%' },
          { campaign: 'Weekly Product Digest', sent: 1156, opened: 387, clicked: 76, rate: '33.5%' },
          { campaign: 'Feature Announcement', sent: 892, opened: 298, clicked: 67, rate: '33.4%' },
          { campaign: 'Welcome Series', sent: 234, opened: 89, clicked: 23, rate: '38.0%' }
        ],
        topSearches: [
          { query: 'wireless headphones', count: 1247, trend: 'up' },
          { query: 'bluetooth speaker', count: 892, trend: 'up' },
          { query: 'security camera', count: 634, trend: 'stable' },
          { query: 'office chair', count: 523, trend: 'down' },
          { query: 'kitchen knife set', count: 467, trend: 'up' }
        ]
      }
      
      cachedAnalytics = data
      cacheTimestamp = Date.now()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  // Memoize chart components to prevent re-renders
  const keyMetricsCards = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {keyMetrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <metric.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className={`ml-2 flex items-center text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ), [keyMetrics])

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-xl">Analytics Overview</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Business metrics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => loadAnalytics(true)} 
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {keyMetricsCards}

      {analyticsData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <UserCheck className="h-5 w-5 mr-2" />
                  User Acquisition
                </CardTitle>
                <CardDescription>Traffic sources for new user signups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userAcquisition.map((source: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.source}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{source.users}</span>
                          <Badge variant="secondary" className={
                            source.change.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                          }>
                            {source.change}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2" />
                  Feature Usage
                </CardTitle>
                <CardDescription>Most popular platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.featureUsage.map((feature: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature.feature}</span>
                        <span className="text-sm text-gray-600">{feature.users} users</span>
                      </div>
                      <Progress value={feature.usage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Subscription Plans
                </CardTitle>
                <CardDescription>User distribution by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.subscriptionMetrics.map((sub: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{sub.plan}</span>
                          {sub.plan !== 'Free' && <Crown className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <p className="text-sm text-gray-600">{sub.count} users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{sub.revenue}</p>
                        <p className="text-xs text-gray-500">{sub.conversion} retention</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Performance
                </CardTitle>
                <CardDescription>Campaign engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.emailMetrics.slice(0, 3).map((email: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate pr-2">{email.campaign}</span>
                        <Badge className="bg-blue-100 text-blue-800">{email.rate}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div>Sent: {email.sent}</div>
                        <div>Open: {email.opened}</div>
                        <div>Click: {email.clicked}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Search className="h-5 w-5 mr-2" />
                  Popular Searches
                </CardTitle>
                <CardDescription>Most searched keywords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topSearches.map((search: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{search.query}</p>
                        <p className="text-xs text-gray-600">{search.count} searches</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        search.trend === 'up' ? 'bg-green-500' :
                        search.trend === 'down' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Revenue Trends
              </CardTitle>
              <CardDescription>Monthly recurring revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Revenue Chart</p>
                  <p className="text-sm text-gray-500">Integration pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}