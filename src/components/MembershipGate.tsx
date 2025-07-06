'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, ChevronRight, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface MembershipGateProps {
  productTitle: string
  productImage?: string
}

export function MembershipGate({ productTitle, productImage }: MembershipGateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">Members Only</Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Unlock the Full Idea Report
            </h1>
            <p className="text-xl text-gray-600">
              Save hours of research with the action-ready report including pre-validation, market data, GTM plan, proven frameworks, and more.
            </p>
          </div>

          {/* Product Preview Card */}
          <Card className="mb-8 overflow-hidden">
            <div className="relative">
              {productImage && (
                <div className="h-64 w-full relative">
                  <Image
                    src={productImage}
                    alt={productTitle}
                    fill
                    className="object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-16 w-16 text-white/80" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{productTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">What's Included:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Comprehensive market analysis & sizing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Competitor landscape & differentiation strategies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Financial projections & unit economics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Launch strategy & marketing roadmap</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Exclusive Features:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <span>AI-powered opportunity scoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <span>Keyword research & SEO optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <span>Supplier recommendations & sourcing tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <span>Risk assessment & mitigation strategies</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <CardTitle>Hunter Plan</CardTitle>
                <div className="text-3xl font-bold">$299<span className="text-lg font-normal text-gray-600">/year</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Full database access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>10 AI queries per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic export features</span>
                  </li>
                </ul>
                <Link href="/auth/signin?plan=hunter">
                  <Button className="w-full">Get Hunter Plan</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <div className="text-3xl font-bold">$999<span className="text-lg font-normal text-gray-600">/year</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Everything in Hunter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited AI queries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Advanced analytics & modeling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link href="/auth/signin?plan=pro">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Pro Plan</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
            <Link href="/database" className="text-blue-600 hover:text-blue-700 font-medium">
              Browse Product Database
              <ChevronRight className="inline h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}