'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Database,
  Search,
  Brain,
  BarChart3,
  Users,
  Shield,
  Zap,
  Target,
  TrendingUp,
  FileText,
  MessageSquare,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesPage() {
  const features = [
    {
      icon: Database,
      title: "Comprehensive Idea Database",
      description: "Access 1000+ thoroughly researched business ideas across multiple industries, each with detailed market analysis and validation data.",
      benefits: ["40+ hours of research per idea", "Market size and competition analysis", "Financial projections and ROI estimates", "Implementation roadmaps"]
    },
    {
      icon: Brain,
      title: "AI Research Agent",
      description: "Get personalized market research and idea validation through our AI-powered research assistant that analyzes multiple data sources.",
      benefits: ["24-hour turnaround for reports", "Multi-source data analysis", "Competitor intelligence", "Market trend identification"]
    },
    {
      icon: Search,
      title: "Advanced Search & Filtering",
      description: "Find the perfect business opportunity with powerful search capabilities and smart filtering by industry, investment level, and skill requirements.",
      benefits: ["Industry-specific filtering", "Investment range selection", "Skill requirement matching", "Opportunity scoring"]
    },
    {
      icon: BarChart3,
      title: "Market Trend Analysis",
      description: "Stay ahead of the curve with real-time trend analysis and emerging opportunity identification across multiple markets.",
      benefits: ["Real-time trend tracking", "Growth opportunity alerts", "Market timing insights", "Competitive landscape analysis"]
    },
    {
      icon: FileText,
      title: "Detailed Research Reports",
      description: "Get comprehensive business analysis reports with market validation, competitive research, and actionable implementation strategies.",
      benefits: ["Executive summaries", "Market validation data", "Competitive analysis", "Implementation timelines"]
    },
    {
      icon: Users,
      title: "Entrepreneur Community",
      description: "Connect with like-minded entrepreneurs, share experiences, and get feedback on your business ideas from our private community.",
      benefits: ["Private member community", "Peer feedback and support", "Networking opportunities", "Expert Q&A sessions"]
    },
    {
      icon: Target,
      title: "Opportunity Scoring",
      description: "Every idea is scored based on market potential, competition level, required investment, and implementation difficulty.",
      benefits: ["Standardized scoring system", "Risk assessment", "Investment requirements", "Success probability indicators"]
    },
    {
      icon: TrendingUp,
      title: "Growth Tracking",
      description: "Monitor market growth, track emerging trends, and identify the next big opportunities before they become mainstream.",
      benefits: ["Growth rate monitoring", "Early trend identification", "Market saturation analysis", "Timing recommendations"]
    },
    {
      icon: MessageSquare,
      title: "Expert Consultation",
      description: "Get direct access to our research team for personalized advice and custom research requests on specific business ideas.",
      benefits: ["1-on-1 expert sessions", "Custom research requests", "Implementation guidance", "Strategic planning support"]
    }
  ]

  return (
    <div className="bg-white">

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Everything You Need to Find Your Next Business Opportunity
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            From comprehensive market research to AI-powered validation, IdeaBrowser provides all the tools and insights you need to discover and validate profitable business ideas.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Explore All Features
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-blue-50 rounded-lg p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Entrepreneurs Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of successful entrepreneurs who use IdeaBrowser to find and validate their next big opportunity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Researched Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">40+</div>
              <div className="text-gray-600">Hours of Research Per Idea</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Industries Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">24hrs</div>
              <div className="text-gray-600">AI Research Turnaround</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Big Idea?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start exploring our comprehensive database of business opportunities and let our AI research agent help validate your next venture.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}