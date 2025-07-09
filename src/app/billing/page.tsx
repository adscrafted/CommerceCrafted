'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { trackPageView, trackEvent } from '@/lib/analytics'
import {
  Crown,
  Calendar,
  Download,
  ExternalLink,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
  RefreshCw,
  Receipt,
  Star,
  BarChart3,
  Loader2
} from 'lucide-react'

interface BillingData {
  user: {
    subscriptionTier: string
    subscriptionExpiresAt: string | null
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
  }
  usage: {
    analyses: {
      usageCount: number
      usageLimit: number | null
      isUnlimited: boolean
      remainingUsage: number | null
      percentageUsed: number | null
      resetDate: string
    }
    aiQueries: {
      usageCount: number
      usageLimit: number | null
      isUnlimited: boolean
      remainingUsage: number | null
      percentageUsed: number | null
      resetDate: string
    }
    exports: {
      usageCount: number
      usageLimit: number | null
      isUnlimited: boolean
      remainingUsage: number | null
      percentageUsed: number | null
      resetDate: string
    }
    keywordResearch: {
      usageCount: number
      usageLimit: number | null
      isUnlimited: boolean
      remainingUsage: number | null
      percentageUsed: number | null
      resetDate: string
    }
  }
  invoices: Array<{
    id: string
    amount: string
    status: string
    date: string
    description: string
    invoiceUrl?: string
    hostedInvoiceUrl?: string
  }>
  upcomingInvoice?: {
    amount: string
    date: string
    description: string
  }
}

function BillingComponent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState('')
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [planPrice, setPlanPrice] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Check for plan selection from URL
    const plan = searchParams.get('plan')
    const price = searchParams.get('price')
    if (plan && price) {
      setSelectedPlan(plan)
      setPlanPrice(price)
    }

    // Track billing page view
    trackPageView('/billing', session?.user?.id)
    trackEvent({
      name: 'billing_page_view',
      userId: session?.user?.id,
      properties: {
        subscription_tier: session?.user?.subscriptionTier,
        timestamp: new Date().toISOString()
      }
    })

    // Fetch billing data
    fetchBillingData()
  }, [session, status, router, searchParams])

  // Auto-trigger checkout when plan is selected from pricing page
  useEffect(() => {
    if (selectedPlan && planPrice && billingData && billingData.user.subscriptionTier === 'free') {
      // Only auto-trigger for free users, not existing paid users
      const timer = setTimeout(() => {
        handlePlanPurchase(selectedPlan, planPrice)
      }, 1000) // Small delay to let the page load
      
      return () => clearTimeout(timer)
    }
  }, [selectedPlan, planPrice, billingData])

  const fetchBillingData = async () => {
    try {
      setDataLoading(true)
      const response = await fetch('/api/billing')
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing data')
      }

      const data = await response.json()
      setBillingData(data)
    } catch (error) {
      console.error('Error fetching billing data:', error)
      // Use fallback data or show error message
    } finally {
      setDataLoading(false)
    }
  }

  if (status === 'loading' || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (!session || !billingData) {
    return null
  }

  const user = session.user
  const isPaid = billingData.user.subscriptionTier !== 'free'

  const handlePlanPurchase = async (plan: string, price: string) => {
    if (!session?.user?.id) return
    
    setLoading('checkout')
    
    // Track checkout initiation
    trackEvent({
      name: 'checkout_initiated',
      userId: session?.user?.id,
      properties: {
        plan: plan,
        price: price,
        timestamp: new Date().toISOString()
      }
    })
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan === 'starter' ? 'price_starter_999' : 'price_pro_1499', // These would be your actual Stripe price IDs
          returnUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
      
    } catch (error) {
      console.error('Error creating checkout session:', error)
      trackEvent({
        name: 'checkout_error',
        userId: session?.user?.id,
        properties: {
          error: error instanceof Error ? error.message : 'Unknown error',
          plan: plan,
          timestamp: new Date().toISOString()
        }
      })
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading('')
    }
  }

  const handleManageBilling = async () => {
    setLoading('billing')
    
    // Track billing portal access attempt
    trackEvent({
      name: 'billing_portal_access',
      userId: session?.user?.id,
      properties: {
        subscription_tier: session?.user?.subscriptionTier,
        timestamp: new Date().toISOString()
      }
    })
    
    try {
      const response = await fetch('/api/stripe/create-billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/billing`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create billing portal session')
      }

      const { url } = await response.json()
      
      // Track successful billing portal creation
      trackEvent({
        name: 'billing_portal_created',
        userId: session?.user?.id,
        properties: {
          subscription_tier: session?.user?.subscriptionTier,
          timestamp: new Date().toISOString()
        }
      })
      
      window.location.href = url
    } catch (error) {
      console.error('Error opening billing portal:', error)
      
      // Track billing portal error
      trackEvent({
        name: 'billing_portal_error',
        userId: session?.user?.id,
        properties: {
          error: error instanceof Error ? error.message : 'Unknown error',
          subscription_tier: session?.user?.subscriptionTier,
          timestamp: new Date().toISOString()
        }
      })
      
      alert('Unable to open billing portal. Please try again.')
    } finally {
      setLoading('')
    }
  }

  const planFeatures = {
    free: [
      '5 product analyses per month',
      '3 AI queries per month',
      '1 export per month',
      'Basic keyword research',
      'Community support'
    ],
    pro: [
      'Unlimited product analyses',
      'Unlimited AI queries',
      'Unlimited exports',
      'Advanced keyword research',
      'Priority support'
    ],
    enterprise: [
      'Everything in Pro',
      'Team collaboration',
      'White-label reports',
      'API access',
      'Dedicated account manager'
    ]
  }

  const currentFeatures = planFeatures[billingData.user.subscriptionTier as keyof typeof planFeatures] || planFeatures.free

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600">Manage your subscription and billing information</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Plan Purchase Banner */}
          {selectedPlan && planPrice && billingData?.user.subscriptionTier === 'free' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      <Crown className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">
                        Complete Your {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan Purchase
                      </h3>
                      <p className="text-blue-700">
                        ${planPrice}/year - Redirecting you to secure checkout...
                      </p>
                    </div>
                  </div>
                  {loading === 'checkout' && (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  )}
                </div>
                {loading !== 'checkout' && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => handlePlanPurchase(selectedPlan, planPrice)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loading === 'checkout'}
                    >
                      Complete Purchase Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className={`h-5 w-5 mr-2 ${isPaid ? 'text-yellow-600' : 'text-gray-400'}`} />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-bold capitalize">{billingData.user.subscriptionTier}</h3>
                    <Badge className={
                      billingData.user.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      billingData.user.subscriptionTier === 'pro' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {billingData.user.subscriptionTier === 'free' ? 'Free' : 'Premium'}
                    </Badge>
                  </div>
                  
                  {billingData.user.subscriptionExpiresAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Renews on {new Date(billingData.user.subscriptionExpiresAt).toLocaleDateString()}
                    </p>
                  )}

                  {billingData.upcomingInvoice && (
                    <p className="text-sm text-blue-600 mt-1">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Next payment: {billingData.upcomingInvoice.amount} on {billingData.upcomingInvoice.date}
                    </p>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Plan includes:</h4>
                    <div className="space-y-1">
                      {currentFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {isPaid ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleManageBilling}
                        disabled={loading === 'billing'}
                      >
                        {loading === 'billing' ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="h-4 w-4 mr-2" />
                        )}
                        Manage Subscription
                      </Button>
                      <p className="text-xs text-gray-500">
                        Update payment method, billing info, or cancel
                      </p>
                    </div>
                  ) : (
                    <Link href="/pricing">
                      <Button>
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Usage This Month
              </CardTitle>
              <CardDescription>
                Track your monthly usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Product Analyses */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Product Analyses</span>
                    <span className="text-sm text-gray-600">
                      {billingData.usage.analyses.usageCount} / {billingData.usage.analyses.isUnlimited ? 'Unlimited' : billingData.usage.analyses.usageLimit}
                    </span>
                  </div>
                  {billingData.usage.analyses.isUnlimited ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unlimited usage
                    </div>
                  ) : (
                    <Progress value={billingData.usage.analyses.percentageUsed || 0} className="h-2" />
                  )}
                </div>

                {/* AI Queries */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AI Queries</span>
                    <span className="text-sm text-gray-600">
                      {billingData.usage.aiQueries.usageCount} / {billingData.usage.aiQueries.isUnlimited ? 'Unlimited' : billingData.usage.aiQueries.usageLimit}
                    </span>
                  </div>
                  {billingData.usage.aiQueries.isUnlimited ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unlimited usage
                    </div>
                  ) : (
                    <Progress value={billingData.usage.aiQueries.percentageUsed || 0} className="h-2" />
                  )}
                </div>

                {/* Exports */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Exports</span>
                    <span className="text-sm text-gray-600">
                      {billingData.usage.exports.usageCount} / {billingData.usage.exports.isUnlimited ? 'Unlimited' : billingData.usage.exports.usageLimit}
                    </span>
                  </div>
                  {billingData.usage.exports.isUnlimited ? (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Unlimited usage
                    </div>
                  ) : (
                    <Progress value={billingData.usage.exports.percentageUsed || 0} className="h-2" />
                  )}
                </div>

                {/* Usage warning for free tier */}
                {billingData.user.subscriptionTier === 'free' && (
                  Object.values(billingData.usage).some(usage => (usage.percentageUsed || 0) > 80) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Usage Limit Warning</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            You&apos;re approaching your monthly limits. Upgrade to Pro for unlimited access.
                          </p>
                          <Link href="/pricing" className="mt-2 inline-block">
                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                              Upgrade Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                )}

                <div className="text-sm text-gray-600">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Usage resets on {new Date(billingData.usage.analyses.resetDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          {isPaid && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  Download invoices and view payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingData.invoices.length > 0 ? (
                  <div className="space-y-4">
                    {billingData.invoices.map((invoice, index) => (
                      <div key={invoice.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-500' : 
                            invoice.status === 'pending' ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">{invoice.amount}</p>
                            <p className="text-sm text-gray-600">{invoice.date}</p>
                            <p className="text-xs text-gray-500">{invoice.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {invoice.status}
                          </Badge>
                          {(invoice.invoiceUrl || invoice.hostedInvoiceUrl) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(invoice.invoiceUrl || invoice.hostedInvoiceUrl, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No invoices yet</p>
                    <p className="text-sm">Your billing history will appear here</p>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <Button 
                  variant="outline" 
                  onClick={handleManageBilling}
                  disabled={loading === 'billing'}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Billing & Invoices
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Options */}
          {!isPaid && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Unlock Premium Features
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upgrade to Pro and get unlimited access to all features
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 mb-2">With Pro you get:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Unlimited product analyses
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Advanced keyword research
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Priority AI assistant
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          Export capabilities
                        </li>
                      </ul>
                    </div>
                    
                    <div className="text-center md:text-right">
                      <div className="text-3xl font-bold text-blue-600">$29</div>
                      <div className="text-gray-600">/month</div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        14-day free trial
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/pricing">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Crown className="h-4 w-4 mr-2" />
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    }>
      <BillingComponent />
    </Suspense>
  )
}