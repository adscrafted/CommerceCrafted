'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail
} from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  isOpen: boolean
  category: string
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: "How does IdeaBrowser work?",
      answer: "IdeaBrowser provides a curated database of thoroughly researched business ideas. Each idea includes market analysis, competitor research, financial projections, and implementation strategies. Our AI-powered research agent helps validate ideas and provides additional insights.",
      isOpen: false,
      category: "General"
    },
    {
      question: "What makes your ideas different from other idea lists?",
      answer: "Unlike generic idea lists, every IdeaBrowser idea includes 40+ hours of professional research including market validation, financial modeling, competitor analysis, customer research, and actionable implementation strategies.",
      isOpen: false,
      category: "General"
    },
    {
      question: "How often do you add new ideas?",
      answer: "We add new thoroughly researched ideas to our database weekly. Each idea goes through our comprehensive research process before being published.",
      isOpen: false,
      category: "General"
    },
    {
      question: "Can I suggest ideas for research?",
      answer: "Yes! Pro plan members can submit ideas for our research team to analyze. We prioritize ideas based on market potential and member interest.",
      isOpen: false,
      category: "General"
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes access to our daily featured opportunity and basic browsing of our homepage. It's perfect for getting started and understanding our research quality.",
      isOpen: false,
      category: "Plans & Pricing"
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at your next billing cycle.",
      isOpen: false,
      category: "Plans & Pricing"
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.",
      isOpen: false,
      category: "Plans & Pricing"
    },
    {
      question: "How does the AI Research Agent work?",
      answer: "Our AI Research Agent conducts comprehensive market research using multiple data sources. It analyzes trends, competitors, customer sentiment, and market opportunities to provide detailed validation reports.",
      isOpen: false,
      category: "AI Research Agent"
    },
    {
      question: "How long does research take?",
      answer: "During our beta launch, AI research reports are delivered within 24 hours. We're working to reduce this to near real-time in future updates.",
      isOpen: false,
      category: "AI Research Agent"
    },
    {
      question: "What data sources do you use?",
      answer: "We analyze data from social media platforms, search trends, market reports, competitor websites, forums, and customer feedback across multiple industries and regions.",
      isOpen: false,
      category: "AI Research Agent"
    },
    {
      question: "How accurate is the market data?",
      answer: "Our data comes from reputable sources and is cross-validated across multiple platforms. However, markets change rapidly, so we recommend using our research as a starting point for your own validation.",
      isOpen: false,
      category: "Data & Research"
    },
    {
      question: "Can I export research reports?",
      answer: "Yes, Pro plan members can export detailed research reports in multiple formats including PDF and CSV for further analysis and sharing.",
      isOpen: false,
      category: "Data & Research"
    },
    {
      question: "Do you provide implementation guidance?",
      answer: "Yes, each idea includes step-by-step implementation strategies, resource requirements, timeline estimates, and potential challenges to help you get started.",
      isOpen: false,
      category: "Data & Research"
    },
    {
      question: "Is there customer support?",
      answer: "Yes, we provide email support for all users. Pro plan members get priority support with faster response times.",
      isOpen: false,
      category: "Support"
    },
    {
      question: "Can I contact you directly?",
      answer: "Absolutely! You can reach us at support@ideabrowser.com for any questions, feedback, or concerns. We typically respond within 24 hours.",
      isOpen: false,
      category: "Support"
    },
    {
      question: "Do you have a community or forum?",
      answer: "Yes, paid plan members get access to our private community where entrepreneurs share experiences, get feedback, and collaborate on ideas.",
      isOpen: false,
      category: "Support"
    }
  ])

  const categories = ["General", "Plans & Pricing", "AI Research Agent", "Data & Research", "Support"]

  const toggleFAQ = (index: number) => {
    setFaqs(prev => prev.map((faq, i) => 
      i === index ? { ...faq, isOpen: !faq.isOpen } : faq
    ))
  }

  return (
    <div className="bg-white">

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about IdeaBrowser and our business idea research platform.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button key={category} variant="outline" size="sm" className="text-sm">
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Sections */}
        {categories.map((category) => {
          const categoryFAQs = faqs.filter(faq => faq.category === category)
          
          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
              
              <div className="space-y-4">
                {categoryFAQs.map((faq, index) => {
                  const globalIndex = faqs.findIndex(f => f === faq)
                  
                  return (
                    <Card key={globalIndex} className="overflow-hidden">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                          {faq.isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        {faq.isOpen && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Contact Section */}
        <div className="mt-16 text-center bg-blue-50 rounded-lg p-8">
          <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our team is here to help you succeed with your business ideas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}