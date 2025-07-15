'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Home, Users, BarChart3, Loader2 } from 'lucide-react'

// Import the individual tab components
import ProductQueueTab from './components/ProductQueueTab'
import UsersTab from './components/UsersTab'
import AnalyticsTab from './components/AnalyticsTab'

// Tab configuration
const TABS = [
  {
    value: 'products',
    label: 'Product Queue',
    icon: Home,
    component: ProductQueueTab
  },
  {
    value: 'users',
    label: 'Users',
    icon: Users,
    component: UsersTab
  },
  {
    value: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    component: AnalyticsTab
  }
]

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'products'
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([currentTab]))
  
  // Pre-load the current tab
  useEffect(() => {
    setLoadedTabs(prev => new Set([...prev, currentTab]))
  }, [currentTab])
  
  const handleTabChange = (value: string) => {
    // Update URL without navigation
    const newUrl = `/admin?tab=${value}`
    window.history.replaceState({ ...window.history.state }, '', newUrl)
    
    // Mark tab as loaded
    setLoadedTabs(prev => new Set([...prev, value]))
  }

  // Memoize tab content to prevent re-renders
  const tabContent = useMemo(() => {
    return TABS.map((tab) => {
      const Component = tab.component
      const isLoaded = loadedTabs.has(tab.value)
      const isActive = currentTab === tab.value
      
      return (
        <TabsContent 
          key={tab.value} 
          value={tab.value} 
          className={!isActive ? 'hidden' : ''}
          forceMount={isLoaded}
        >
          {isLoaded ? <Component /> : null}
        </TabsContent>
      )
    })
  }, [currentTab, loadedTabs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage products, users, and view analytics</p>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {tabContent}
      </Tabs>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
          <AdminDashboardContent />
        </Suspense>
      </div>
    </div>
  )
}