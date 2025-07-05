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
      answer: "The free plan includes access to our daily idea feature and basic browsing of our database. Perfect for getting started and seeing what we offer.",
      isOpen: false
    },
    {
      question: "How many ideas are in the database?",
      answer: "Our database contains over 1,000 thoroughly researched business ideas across multiple industries, with new ideas added regularly.",
      isOpen: false
    },
    {
      question: "What makes these ideas different from other idea lists?",
      answer: "Each idea includes comprehensive market analysis, financial projections, competitor research, and actionable next steps - not just a brief description.",
      isOpen: false
    },
    {
      question: "Can I request payment?",
      answer: "Yes, we accept all major credit cards and PayPal. Enterprise customers can also arrange for invoice billing.",
      isOpen: false
    },
    {
      question: "What are Research report and AI Chat through?",
      answer: "Research reports provide deep market analysis and validation data. AI Chat gives you unlimited access to our research assistant for idea exploration and validation.",
      isOpen: false
    },
    {
      question: "What's the difference between Starter and Pro?",
      answer: "Starter gives you essential access to browse and bookmark ideas. Pro includes unlimited AI chat, priority support, and advanced filtering capabilities.",
      isOpen: false
    },
    {
      question: "How do I know which ideas work for my situation?",
      answer: "Each idea includes detailed requirements, skill assessments, and market fit analysis to help you determine if it's right for your situation and goals.",
      isOpen: false
    },
    {
      question: "Is any plan suitable when I can sell at Research Agent?",
      answer: "Our Research Agent is available to Pro and Enterprise customers, providing personalized business idea analysis and market research tailored to your specific needs.",
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
            Find Your Next Big Idea
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Stop wasting weeks researching dead ends. Use our system packed with a detailed opportunities all the hours of analysis already done for you.
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Join with the right trends and two idea hits became.
          </p>
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
                <Button variant="outline" className="w-full mb-6">
                  Sign up Free
                </Button>
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
                    <span>Access to ideabrowser.com homepage</span>
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
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter - Opportunity Hunter</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$299</span>
                  <span className="text-gray-600 ml-2">per year</span>
                </div>
                <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700">
                  Select
                </Button>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-600 mb-4">
                  You've ready to review reports and scan for the best opportunities. We're covering every aspect of analysis for you.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Everything in Free</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Ability to bookmark ideas</span>
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
                    <span>Access to community</span>
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
                    <span>Priority support</span>
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
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro - Builder's Command Center</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$999</span>
                  <span className="text-gray-600 ml-2">per year</span>
                </div>
                <Button className="w-full mb-6 bg-purple-600 hover:bg-purple-700">
                  Select
                </Button>
              </div>
              
              <div className="space-y-4 text-sm">
                <p className="text-gray-600 mb-4">
                  You're building a business and want unlimited access to all our tools and our AI to help analyze every
                  opportunity with the highest depth.
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
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Advanced search and filtering</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Unlimited exports and research reports</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Custom research requests</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Direct access to new ideas & live streams</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Idea agent for live Q&A sessions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Have questions? Email us at [email]
        </p>

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
                        category: "Discover Data",
                        items: [
                          { feature: "Idea of the Day", free: "✓", starter: "✓", pro: "✓" },
                          { feature: "Daily Outlook Ideas", free: "✓", starter: "✓", pro: "✓" },
                          { feature: "Idea Database Access", free: "", starter: "✓", pro: "✓" },
                          { feature: "Bookmark Ideas", free: "", starter: "✓", pro: "✓" }
                        ]
                      },
                      {
                        category: "Analyze & Dive Deep",
                        items: [
                          { feature: "Research Reports", free: "", starter: "Monthly", pro: "Unlimited" },
                          { feature: "Community Access", free: "", starter: "✓", pro: "✓" },
                          { feature: "Idea Search & Analysis", free: "", starter: "Monthly", pro: "Unlimited" },
                          { feature: "Idea & Market Analysis", free: "", starter: "Monthly", pro: "Unlimited" }
                        ]
                      },
                      {
                        category: "Build for You",
                        items: [
                          { feature: "Custom Research Reports", free: "", starter: "", pro: "Unlimited" },
                          { feature: "Executive Reports", free: "", starter: "", pro: "Unlimited" },
                          { feature: "Implementation Guides", free: "", starter: "", pro: "✓" },
                          { feature: "In-depth Live Sessions", free: "", starter: "", pro: "✓" }
                        ]
                      },
                      {
                        category: "Framework Pro",
                        items: [
                          { feature: "Idea Blueprint", free: "", starter: "Limited", pro: "Unlimited" },
                          { feature: "API Framework", free: "", starter: "", pro: "✓" },
                          { feature: "Idea Search", free: "", starter: "Limited", pro: "Unlimited" },
                          { feature: "Idea Letter Archive", free: "", starter: "Limited", pro: "Unlimited" }
                        ]
                      },
                      {
                        category: "The Deeper",
                        items: [
                          { feature: "AI Agent Chat", free: "", starter: "", pro: "Unlimited" },
                          { feature: "AI Research Agent", free: "", starter: "", pro: "Unlimited" },
                          { feature: "GPT Agent", free: "", starter: "", pro: "Unlimited" }
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

        <div className="text-center mt-8">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Compare All Features
          </Button>
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
            Ready to Find Your Next Big Idea?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who use Ideabrowser to discover, validate, and launch successful business ideas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Back to choose your plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}