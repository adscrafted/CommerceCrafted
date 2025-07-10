'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { usePathname } from 'next/navigation'
import { analytics, identifyUser, trackPageView, VercelAnalytics } from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Identify user when session changes
  useEffect(() => {
    if (user) {
      identifyUser({
        userId: user.id,
        email: user.email || undefined,
        name: user.name || undefined,
        subscriptionTier: user.subscriptionTier || 'free',
        lastActive: new Date(),
      })
    }
  }, [user])

  // Track page views
  useEffect(() => {
    trackPageView(pathname, user?.id)
  }, [pathname, user?.id])

  return (
    <>
      {children}
      <VercelAnalytics />
    </>
  )
}