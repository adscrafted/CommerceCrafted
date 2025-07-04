'use client'

import { Analytics } from '@vercel/analytics/react'
import mixpanel from 'mixpanel-browser'
import { gtag } from 'ga-gtag'

// Initialize Mixpanel
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  })
}

// Initialize Google Analytics
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  userId?: string
  userProperties?: Record<string, unknown>
}

export interface ConversionEvent {
  event: string
  value?: number
  currency?: string
  userId?: string
  planId?: string
  source?: string
}

export interface UserEvent {
  userId: string
  email?: string
  name?: string
  subscriptionTier?: string
  signupDate?: Date
  lastActive?: Date
  properties?: Record<string, unknown>
}

class AnalyticsService {
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.isInitialized = true
    }
  }

  // Track general events
  track(event: AnalyticsEvent) {
    if (!this.isInitialized) return

    console.log('Analytics Event:', event)

    // Mixpanel tracking
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      if (event.userId) {
        mixpanel.identify(event.userId)
        if (event.userProperties) {
          mixpanel.people.set(event.userProperties)
        }
      }
      mixpanel.track(event.name, event.properties)
    }

    // Google Analytics tracking
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      gtag('event', event.name, {
        ...event.properties,
        user_id: event.userId,
      })
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(event)
  }

  // Track conversions (signups, upgrades, purchases)
  trackConversion(conversion: ConversionEvent) {
    if (!this.isInitialized) return

    console.log('Conversion Event:', conversion)

    const eventData = {
      name: conversion.event,
      properties: {
        value: conversion.value,
        currency: conversion.currency || 'USD',
        plan_id: conversion.planId,
        source: conversion.source,
        timestamp: new Date().toISOString(),
      },
      userId: conversion.userId,
    }

    this.track(eventData)

    // Special handling for purchase events
    if (conversion.event === 'purchase' && conversion.value) {
      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        gtag('event', 'purchase', {
          transaction_id: `${Date.now()}-${conversion.userId}`,
          value: conversion.value,
          currency: conversion.currency || 'USD',
          items: [{
            item_id: conversion.planId,
            item_name: `${conversion.planId} Plan`,
            category: 'Subscription',
            quantity: 1,
            price: conversion.value,
          }],
        })
      }
    }
  }

  // Track user identification
  identify(user: UserEvent) {
    if (!this.isInitialized) return

    console.log('User Identify:', user)

    // Mixpanel identification
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.identify(user.userId)
      mixpanel.people.set({
        $email: user.email,
        $name: user.name,
        subscription_tier: user.subscriptionTier,
        signup_date: user.signupDate,
        last_active: user.lastActive,
        ...user.properties,
      })
    }

    // Google Analytics user properties
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: user.userId,
        custom_map: {
          subscription_tier: user.subscriptionTier,
        },
      })
    }
  }

  // Track page views
  trackPageView(page: string, userId?: string) {
    if (!this.isInitialized) return

    console.log('Page View:', { page, userId })

    // Mixpanel page tracking
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      mixpanel.track('Page View', {
        page,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      })
    }

    // Google Analytics page tracking
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        user_id: userId,
      })
    }
  }

  // Track email opt-ins and newsletter signups
  trackEmailOptIn(data: {
    email: string
    source: string
    listType: 'newsletter' | 'product_updates' | 'marketing'
    userId?: string
  }) {
    if (!this.isInitialized) return

    const event = {
      name: 'email_opt_in',
      properties: {
        email: data.email,
        source: data.source,
        list_type: data.listType,
        timestamp: new Date().toISOString(),
      },
      userId: data.userId,
    }

    this.track(event)
  }

  // Track product analysis usage
  trackProductAnalysis(data: {
    productUrl?: string
    analysisType: string
    userId?: string
    subscriptionTier?: string
  }) {
    const event = {
      name: 'product_analysis',
      properties: {
        product_url: data.productUrl,
        analysis_type: data.analysisType,
        subscription_tier: data.subscriptionTier,
        timestamp: new Date().toISOString(),
      },
      userId: data.userId,
    }

    this.track(event)
  }

  // Track keyword research usage
  trackKeywordResearch(data: {
    keyword: string
    resultsCount?: number
    userId?: string
    subscriptionTier?: string
  }) {
    const event = {
      name: 'keyword_research',
      properties: {
        keyword: data.keyword,
        results_count: data.resultsCount,
        subscription_tier: data.subscriptionTier,
        timestamp: new Date().toISOString(),
      },
      userId: data.userId,
    }

    this.track(event)
  }

  // Track AI assistant usage
  trackAIAssistant(data: {
    query: string
    responseTime?: number
    userId?: string
    subscriptionTier?: string
  }) {
    const event = {
      name: 'ai_assistant_usage',
      properties: {
        query_length: data.query.length,
        response_time: data.responseTime,
        subscription_tier: data.subscriptionTier,
        timestamp: new Date().toISOString(),
      },
      userId: data.userId,
    }

    this.track(event)
  }

  // Track feature usage limits
  trackUsageLimit(data: {
    feature: string
    currentUsage: number
    limit: number
    userId?: string
    subscriptionTier?: string
  }) {
    const event = {
      name: 'usage_limit_reached',
      properties: {
        feature: data.feature,
        current_usage: data.currentUsage,
        limit: data.limit,
        usage_percentage: (data.currentUsage / data.limit) * 100,
        subscription_tier: data.subscriptionTier,
        timestamp: new Date().toISOString(),
      },
      userId: data.userId,
    }

    this.track(event)
  }

  // Send events to custom analytics endpoint
  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: event.name,
          properties: event.properties,
          userId: event.userId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer,
        }),
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsService()

// Convenience functions
export const trackEvent = (event: AnalyticsEvent) => analytics.track(event)
export const trackConversion = (conversion: ConversionEvent) => analytics.trackConversion(conversion)
export const identifyUser = (user: UserEvent) => analytics.identify(user)
export const trackPageView = (page: string, userId?: string) => analytics.trackPageView(page, userId)
export const trackEmailOptIn = (data: Parameters<typeof analytics.trackEmailOptIn>[0]) => analytics.trackEmailOptIn(data)
export const trackProductAnalysis = (data: Parameters<typeof analytics.trackProductAnalysis>[0]) => analytics.trackProductAnalysis(data)
export const trackKeywordResearch = (data: Parameters<typeof analytics.trackKeywordResearch>[0]) => analytics.trackKeywordResearch(data)
export const trackAIAssistant = (data: Parameters<typeof analytics.trackAIAssistant>[0]) => analytics.trackAIAssistant(data)
export const trackUsageLimit = (data: Parameters<typeof analytics.trackUsageLimit>[0]) => analytics.trackUsageLimit(data)

// Export Vercel Analytics component
export { Analytics as VercelAnalytics }