'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Check,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  isOpen: boolean
}

export default function PricingPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: "How much time will this actually save me?",
      answer: "Our users typically save 20-40 hours per week on research tasks. The comprehensive reports eliminate the need for manual data gathering and analysis.",
      isOpen: false
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes access to our daily Amazon product opportunity, basic trends page, and limited browsing of our database. Perfect for getting started and seeing our analysis quality.",
      isOpen: false
    },
    {
      question: "How many Amazon product opportunities are in your database?",
      answer: "Our database contains over 1,000 thoroughly researched Amazon product opportunities across multiple categories, with new opportunities added daily based on market trends and data.",
      isOpen: false
    },
    {
      question: "What makes your product analysis different from other tools?",
      answer: "Each product includes comprehensive Amazon-specific analysis: financial projections with FBA fees, competitor research, keyword analysis, launch strategies, review benchmarks, and pricing recommendations - not just basic metrics.",
      isOpen: false
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards and PayPal for annual subscriptions. All payments are processed securely through our payment partners.",
      isOpen: false
    },
    {
      question: "How accurate are your financial projections?",
      answer: "Our projections are based on real Amazon data including search volumes, competitor analysis, and historical trends. We provide conservative estimates with multiple scenarios to help you make informed decisions.",
      isOpen: false
    },
    {
      question: "What's the difference between Starter and Pro?",
      answer: "Starter gives you access to browse and bookmark opportunities with email support. Pro includes unlimited AI research agent, launch session calls, dedicated staff support, and unlimited analysis reports.",
      isOpen: false
    },
    {
      question: "How do I know if a product opportunity is right for me?",
      answer: "Each opportunity includes detailed startup costs, skill requirements, competition levels, and market saturation analysis. We also provide launch difficulty scores to match opportunities with your experience level and budget.",
      isOpen: false
    },
    {
      question: "Do you provide ongoing support after I choose a product?",
      answer: "Pro members get access to launch session calls and dedicated staff support to help with product selection, launch strategy, and ongoing optimization. We're here to support your success.",
      isOpen: false
    }
  ])

  const toggleFAQ = (index: number) => {
    setFaqs(prev => prev.map((faq, i) => 
      i === index ? { ...faq, isOpen: !faq.isOpen } : faq
    ))
  }

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-purple-100 text-purple-700 mb-6">Limited Offer</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Find Your Next Winning Product
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Stop wasting weeks researching dead ends. Use our system packed with detailed product opportunities with all the analysis already done for you.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Join thousands finding profitable Amazon products with our proven system.
          </p>
          
          {/* Launch Deal Notice */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-xl">🚀</span>
              <span className="text-lg font-bold text-orange-800">LAUNCH SPECIAL</span>
            </div>
            <p className="text-orange-700 font-medium">
              50% OFF All Plans - Limited Time Only!
            </p>
            <p className="text-sm text-orange-600 mt-2">
              Celebrate our launch with exclusive pricing for early adopters
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="relative">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free - Start Deep Dive</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600 ml-2">forever</span>
                </div>
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full mb-6">
                    Sign up Free
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-600 mb-4">
                  Access the features you need to start browsing and exploring.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Access to daily Amazon opportunity</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Access to basic trends page</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-4 w-4 mr-3" />
                    <span>Full access to our database</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-4 w-4 mr-3" />
                    <span>Research reports</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-4 w-4 mr-3" />
                    <span>AI assistant</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Starter Plan */}
          <Card className="relative">
            <div className="absolute -top-3 right-4">
              <Badge className="bg-orange-500 text-white">50% OFF</Badge>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter - Opportunity Hunter</h3>
                <div className="mb-4">
                  <div className="text-lg text-gray-400 line-through">$999</div>
                  <span className="text-4xl font-bold text-orange-600">$499</span>
                  <span className="text-gray-600 ml-2">per year</span>
                </div>
                <Link href="/auth/signin?plan=starter&price=499">
                  <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700">
                    Select Starter
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-600 mb-4">
                  You're ready to review detailed product reports and scan for the best Amazon opportunities. Includes email support for guidance.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Everything in Free</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Ability to bookmark products</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Browse 200+ opportunities access</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Basic ability to ask questions</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Email support</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-4 w-4 mr-3" />
                    <span>Unlimited AI research agent access</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-4 w-4 mr-3" />
                    <span>Staff support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-purple-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                Recommended
              </Badge>
            </div>
            <div className="absolute -top-3 right-4">
              <Badge className="bg-orange-500 text-white">50% OFF</Badge>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro - The Ultimate</h3>
                <div className="mb-4">
                  <div className="text-lg text-gray-400 line-through">$1,499</div>
                  <span className="text-4xl font-bold text-orange-600">$749</span>
                  <span className="text-gray-600 ml-2">per year</span>
                </div>
                <Link href="/auth/signin?plan=pro&price=749">
                  <Button className="w-full mb-6 bg-purple-600 hover:bg-purple-700">
                    Select Pro
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-600 mb-4">
                  You're building an Amazon business and want unlimited access to all our tools, AI assistance, and dedicated staff support to help analyze every product opportunity with the highest depth.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Everything in Starter</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Unlimited AI research agent access</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Dedicated staff support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Advanced search and filtering</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Unlimited exports and analysis</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Launch session calls</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Direct access to new opportunities & live sessions</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Product research agent for live Q&A sessions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Compare Plans Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Plans</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See exactly what's included in each plan and choose the one that fits your business goals
            </p>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-6 font-semibold">Features</th>
                      <th className="text-center p-6 font-semibold">Free</th>
                      <th className="text-center p-6 font-semibold">Starter</th>
                      <th className="text-center p-6 font-semibold">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        category: "Product Discovery",
                        items: [
                          { feature: "Daily Amazon Product Opportunity", free: "✓", starter: "✓", pro: "✓" },
                          { feature: "Product Database Access", free: "", starter: "✓", pro: "✓" },
                          { feature: "Basic Trends Page", free: "✓", starter: "✓", pro: "✓" },
                          { feature: "Product Bookmarking", free: "", starter: "✓", pro: "✓" }
                        ]
                      },
                      {
                        category: "Product Analysis",
                        items: [
                          { feature: "Comprehensive Product Analysis", free: "", starter: "✓", pro: "✓" },
                          { feature: "Financial Projections & ROI", free: "", starter: "✓", pro: "✓" },
                          { feature: "Competition Analysis", free: "", starter: "✓", pro: "✓" },
                          { feature: "Market Demand Analysis", free: "", starter: "✓", pro: "✓" },
                          { feature: "Keyword Research & Analysis", free: "", starter: "✓", pro: "✓" },
                          { feature: "Launch Strategy & Timeline", free: "", starter: "✓", pro: "✓" }
                        ]
                      },
                      {
                        category: "AI Research Assistant",
                        items: [
                          { feature: "AI Research Agent", free: "", starter: "10 queries/month", pro: "Unlimited" },
                          { feature: "Product Validation Questions", free: "", starter: "Basic", pro: "Advanced" },
                          { feature: "Market Research Queries", free: "", starter: "Limited", pro: "Unlimited" }
                        ]
                      },
                      {
                        category: "Support & Guidance",
                        items: [
                          { feature: "Email Support", free: "", starter: "✓", pro: "✓" },
                          { feature: "Launch Session Calls", free: "", starter: "", pro: "✓" },
                          { feature: "Dedicated Staff Support", free: "", starter: "", pro: "✓" },
                          { feature: "Priority Support", free: "", starter: "", pro: "✓" }
                        ]
                      },
                      {
                        category: "Export & Reports",
                        items: [
                          { feature: "Export Product Analysis", free: "", starter: "Limited", pro: "Unlimited" },
                          { feature: "Advanced Search & Filtering", free: "", starter: "", pro: "✓" }
                        ]
                      }
                    ].map((section, sectionIndex) => (
                      <React.Fragment key={sectionIndex}>
                        <tr className="bg-blue-50">
                          <td colSpan={4} className="p-4 font-semibold text-blue-900">
                            {section.category}
                          </td>
                        </tr>
                        {section.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-b hover:bg-gray-50">
                            <td className="p-4 text-gray-900">{item.feature}</td>
                            <td className="p-4 text-center text-gray-600">
                              {item.free === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : item.free || "—"}
                            </td>
                            <td className="p-4 text-center text-gray-600">
                              {item.starter === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : item.starter || "—"}
                            </td>
                            <td className="p-4 text-center text-gray-600">
                              {item.pro === "✓" ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : item.pro || "—"}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-6">
            {/* Mobile comparison would go here - simplified version */}
            <p className="text-center text-gray-600">View on desktop for detailed comparison</p>
          </div>
        </div>


        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-2 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {faq.isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  
                  {faq.isOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600 leading-normal">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-blue-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Amazon Product Winner?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join successful Amazon sellers who use CommerceCrafted to discover validated product opportunities with comprehensive market analysis and launch strategies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="#pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Choose Your Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}