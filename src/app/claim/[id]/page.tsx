'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Crown,
  Shield,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ClaimPageProps {
  params: Promise<{ id: string }>
}

// Mock product data
const productData = {
  title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
  asin: 'B08MVBRNKV',
  opportunityScore: 87,
  price: 299,
  image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop'
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [company, setCompany] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [processing, setProcessing] = useState(false)

  React.useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
      setLoading(false)
    }
    loadData()
  }, [params])

  const handlePurchase = async () => {
    if (!agreeToTerms || !email || !firstName || !lastName) {
      return
    }
    
    setProcessing(true)
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    
    // In a real app, this would redirect to payment processor
    alert('Purchase completed! You will receive your business plan via email within 24 hours.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <div className="text-blue-600 text-2xl font-bold">CommerceCrafted</div>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Secure Checkout
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href={`/products/${id}`}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                  Claiming Product Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Image 
                    src={productData.image}
                    alt={productData.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{productData.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>ASIN: {productData.asin}</span>
                      <Badge className="bg-green-100 text-green-800">
                        Score: {productData.opportunityScore}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What&apos;s Included */}
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s Included</CardTitle>
                <CardDescription>
                  Everything you need to launch this product successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Complete Business Plan (50+ pages)</h4>
                      <p className="text-sm text-gray-600">Market analysis, financial projections, marketing strategy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Verified Supplier Contacts</h4>
                      <p className="text-sm text-gray-600">3+ pre-vetted manufacturers with pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Launch Strategy Guide</h4>
                      <p className="text-sm text-gray-600">Step-by-step Amazon launch roadmap</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Financial Calculator</h4>
                      <p className="text-sm text-gray-600">ROI projections and break-even analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">30-Day Support</h4>
                      <p className="text-sm text-gray-600">Email support for implementation questions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Exclusive Opportunity</h4>
                    <p className="text-sm text-blue-700">
                      Once purchased, this idea is removed from our database and becomes exclusively yours.
                      No other customers will have access to this exact opportunity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Secure Checkout</span>
                  <div className="text-3xl font-bold text-green-600">${productData.price}</div>
                </CardTitle>
                <CardDescription>
                  Complete your purchase to get instant access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your Company LLC"
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Secure payment processing via Stripe
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Payment form will load after clicking &quot;Complete Purchase&quot;
                    </p>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and understand that this purchase provides exclusive access to the business plan and removes this opportunity from the platform.
                  </label>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  disabled={!agreeToTerms || !email || !firstName || !lastName || processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="h-5 w-5 mr-2" />
                      Complete Purchase - ${productData.price}
                    </>
                  )}
                </Button>

                {/* Security badges */}
                <div className="flex justify-center items-center gap-4 pt-4 border-t text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    SSL Encrypted
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Money Back Guarantee
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Money Back Guarantee */}
            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">30-Day Money Back Guarantee</h4>
                    <p className="text-sm text-green-700">
                      If you&apos;re not completely satisfied with the business plan and supporting materials,
                      we&apos;ll provide a full refund within 30 days of purchase.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}