'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Check,
  Crown,
  Zap,
  Shield,
  Star,
  Users,
  Headphones,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  BarChart3,
  Search,
  Target,
  Database,
  Download,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState('')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      yearlyPrice: 0,
      badge: '',
      features: [
        '5 product analyses per month',
        'Basic keyword research',
        'Limited AI assistant',
        'Community support',
        'Basic export options'
      ],
      limitations: [
        'No advanced analytics',
        'No priority support',
        'Limited data history'
      ],
      cta: 'Get Started Free',
      popular: false,
      icon: Search,
      color: 'border-gray-200'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For serious Amazon sellers',
      price: 29,
      yearlyPrice: 290, // 2 months free
      badge: 'Most Popular',
      features: [
        'Unlimited product analyses',
        'Advanced keyword research',
        'Full AI assistant access',
        'Priority support',
        'Advanced export options',
        'Historical data access',
        'Email notifications',
        'Custom filters',
        'Trend analysis'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true,
      icon: Crown,
      color: 'border-blue-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams and agencies',
      price: 99,
      yearlyPrice: 990, // 2 months free
      badge: 'Best Value',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label reports',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Phone support',
        'Custom training',
        'SLA guarantee'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      icon: Shield,
      color: 'border-purple-500'
    }
  ]

  const handleSubscribe = async (planId: string, priceId?: string) => {
    if (!session) {
      router.push('/auth/signin?redirect=/pricing')
      return
    }

    if (planId === 'free') {
      router.push('/dashboard')
      return
    }

    if (planId === 'enterprise') {
      // Open contact form or calendar
      window.open('mailto:sales@commercecrafted.com?subject=Enterprise Plan Inquiry', '_blank')
      return
    }

    setLoading(planId)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          isAnnual,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading('')
    }
  }

  const getDisplayPrice = (plan: any) => {
    if (plan.price === 0) return 'Free'
    
    const price = isAnnual ? plan.yearlyPrice : plan.price
    const period = isAnnual ? 'year' : 'month'
    const savings = isAnnual && plan.price > 0 ? Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100) : 0
    
    return (
      <div>
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-gray-600">/{period}</span>
        {isAnnual && savings > 0 && (
          <div className="text-sm text-green-600 font-medium">
            Save {savings}% annually
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock the full power of Amazon product research. Start free, upgrade anytime.
            </p>
            
            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <Label htmlFor="billing-toggle" className="text-sm">Monthly</Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <Label htmlFor="billing-toggle" className="text-sm">
                Annual 
                <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.color} ${plan.popular ? 'shadow-2xl transform scale-105' : 'shadow-lg'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <plan.icon className={`h-8 w-8 ${
                      plan.popular ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-6">
                  {getDisplayPrice(plan)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : plan.id === 'enterprise'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {loading === plan.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : plan.id === 'pro' ? (
                    <Crown className="h-4 w-4 mr-2" />
                  ) : plan.id === 'enterprise' ? (
                    <Phone className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {plan.cta}
                </Button>
                
                {plan.id === 'pro' && (
                  <p className="text-xs text-center text-gray-500">
                    14-day free trial, cancel anytime
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Feature Comparison</h2>
            <p className="mt-4 text-gray-600">See what's included in each plan</p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-6 font-medium text-gray-900">Features</th>
                      <th className="text-center p-6 font-medium text-gray-900">Free</th>
                      <th className="text-center p-6 font-medium text-gray-900">Pro</th>
                      <th className="text-center p-6 font-medium text-gray-900">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Product Analyses', free: '5/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                      { feature: 'Keyword Research', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
                      { feature: 'AI Assistant', free: 'Limited', pro: 'Full Access', enterprise: 'Full Access' },
                      { feature: 'Data Export', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
                      { feature: 'Historical Data', free: '30 days', pro: '2 years', enterprise: 'Unlimited' },
                      { feature: 'Email Support', free: '48h response', pro: '24h response', enterprise: '4h response' },
                      { feature: 'API Access', free: '—', pro: '—', enterprise: '✓' },
                      { feature: 'White-label Reports', free: '—', pro: '—', enterprise: '✓' },
                      { feature: 'Phone Support', free: '—', pro: '—', enterprise: '✓' },
                      { feature: 'Dedicated Manager', free: '—', pro: '—', enterprise: '✓' }
                    ].map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                        <td className="p-6 text-center text-gray-600">{row.free}</td>
                        <td className="p-6 text-center text-gray-600">{row.pro}</td>
                        <td className="p-6 text-center text-gray-600">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I switch plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! Pro plan comes with a 14-day free trial. No credit card required to start."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, MasterCard, American Express) through Stripe."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Absolutely. You can cancel your subscription at any time from your account settings."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 30-day money-back guarantee for all paid plans if you're not satisfied."
              },
              {
                question: "Is my data secure?",
                answer: "Yes, we use enterprise-grade security and encryption to protect your data."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                <Sparkles className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Ready to grow your Amazon business?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of successful sellers who trust CommerceCrafted
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => handleSubscribe('pro')}
                >
                  Start Free Trial
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  asChild
                >
                  <Link href="/demo">View Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}