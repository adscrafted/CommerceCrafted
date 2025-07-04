'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { analytics, identifyUser, trackPageView, VercelAnalytics } from '@/lib/analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Identify user when session changes
  useEffect(() => {
    if (session?.user) {
      identifyUser({
        userId: session.user.id,
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        subscriptionTier: session.user.subscriptionTier,
        lastActive: new Date(),
      })
    }
  }, [session])

  // Track page views
  useEffect(() => {
    trackPageView(pathname, session?.user?.id)
  }, [pathname, session?.user?.id])

  return (
    <>
      {children}
      <VercelAnalytics />
    </>
  )
}