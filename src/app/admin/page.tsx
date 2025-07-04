'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Mail,
  Database,
  RefreshCw,
  CheckCircle,
  UserPlus,
  MessageSquare
} from 'lucide-react'

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const stats = [
    {
      title: 'Total Users',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Monthly Revenue',
      value: '$23,459',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Product Analyses',
      value: '8,394',
      change: '+15.3%',
      trend: 'up',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Active Sessions',
      value: '156',
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
      color: 'text-orange-600'
    }
  ]

  const recentActivity = [
    { action: 'New user registration', user: 'john.doe@email.com', time: '2 minutes ago', type: 'user' },
    { action: 'Pro plan upgrade', user: 'sarah.johnson@email.com', time: '15 minutes ago', type: 'payment' },
    { action: 'Product analysis completed', user: 'mike.wilson@email.com', time: '23 minutes ago', type: 'analysis' },
    { action: 'Newsletter campaign sent', user: 'System', time: '1 hour ago', type: 'email' },
    { action: 'Database backup completed', user: 'System', time: '2 hours ago', type: 'system' }
  ]

  const systemHealth = [
    { component: 'API Server', status: 'healthy', uptime: '99.9%', responseTime: '145ms' },
    { component: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '23ms' },
    { component: 'External APIs', status: 'warning', uptime: '98.2%', responseTime: '892ms' },
    { component: 'Email Service', status: 'healthy', uptime: '99.7%', responseTime: '234ms' }
  ]

  const topUsers = [
    { name: 'Enterprise Corp', plan: 'Enterprise', analyses: 1247, revenue: '$2,499' },
    { name: 'StartupXYZ', plan: 'Pro', analyses: 892, revenue: '$299' },
    { name: 'Amazon Seller Pro', plan: 'Pro', analyses: 567, revenue: '$299' },
    { name: 'FBA Success Co', plan: 'Pro', analyses: 434, revenue: '$299' },
    { name: 'Product Hunter', plan: 'Free', analyses: 5, revenue: '$0' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {currentTime.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-gray-100`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className={`ml-2 flex items-center text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest user and system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'analysis' ? 'bg-purple-500' :
                    activity.type === 'email' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system component status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((component, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      component.status === 'healthy' ? 'bg-green-500' :
                      component.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{component.component}</p>
                      <p className="text-xs text-gray-600">
                        {component.uptime} uptime • {component.responseTime} avg
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    component.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    component.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {component.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Users */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Users by Usage
            </CardTitle>
            <CardDescription>Users with highest analysis count this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {user.plan}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.analyses} analyses</p>
                    <p className="text-xs text-gray-600">{user.revenue} revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Newsletter
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Support Tickets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Revenue Overview
          </CardTitle>
          <CardDescription>Monthly revenue and growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Revenue chart would be displayed here</p>
              <p className="text-sm text-gray-500">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}