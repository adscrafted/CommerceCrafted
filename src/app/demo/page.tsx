'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DeepAnalysisCard from '@/components/DeepAnalysisCard'
import AIResearchChat from '@/components/AIResearchChat'
import { Package, Brain, Target, TrendingUp } from 'lucide-react'

export default function DemoPage() {
  const handleAnalysisRequest = (type: string) => {
    console.log(`Analysis requested: ${type}`)
    // In production, this would trigger the appropriate API call
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">CommerceCrafted</h1>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                <Brain className="h-3 w-3 mr-1" />
                IdeaBrowser Demo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IdeaBrowser-Style Amazon Research
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience deep product analysis with AI-powered insights, keyword research, 
            PPC strategies, and comprehensive market intelligence
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Target className="h-3 w-3 mr-1" />
              50+ Hours of Research in 10 Minutes
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              12 Validation Metrics
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered Analysis
            </Badge>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Deep Product Analysis</h3>
              <p className="text-blue-700 text-sm">
                Comprehensive 7-tab analysis including keywords, PPC, demand, competition, 
                inventory, and financial modeling
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">AI Research Agent</h3>
              <p className="text-purple-700 text-sm">
                Interactive conversational AI for product validation, market research, 
                and strategic planning
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Market Intelligence</h3>
              <p className="text-green-700 text-sm">
                Real-time trend analysis, competitive intelligence, and predictive 
                market forecasting
              </p>
            </div>
          </Card>
        </div>

        {/* Deep Analysis Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Deep Analysis Demo</h2>
          <DeepAnalysisCard
            productId="demo-product"
            productTitle="Sony WH-1000XM4 Wireless Noise Canceling Headphones"
            productPrice={349.99}
            onRequestAnalysis={handleAnalysisRequest}
            isLoading={false}
          />
        </div>

        {/* AI Research Chat Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Research Agent Demo</h2>
          <AIResearchChat
            productId="demo-product"
            userTier="pro"
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Pricing Comparison */}
        <div className="bg-white rounded-lg p-8 border">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Pricing Plans (Mirroring IdeaBrowser)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Daily Amazon Opportunity</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
                <p className="text-gray-600 text-sm mb-6">Forever</p>
                <ul className="text-left text-sm space-y-2 mb-6">
                  <li>• One daily featured product</li>
                  <li>• Basic market insights</li>
                  <li>• 3 AI queries/month</li>
                  <li>• Community access</li>
                </ul>
                <Button variant="outline" className="w-full">Current Plan</Button>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-500 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Most Popular
              </Badge>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Amazon Hunter</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">$299</div>
                <p className="text-gray-600 text-sm mb-6">per year</p>
                <ul className="text-left text-sm space-y-2 mb-6">
                  <li>• Access to 1000+ products</li>
                  <li>• Keyword & PPC analysis</li>
                  <li>• 10 AI queries/month</li>
                  <li>• Email alerts</li>
                  <li>• Basic financial modeling</li>
                </ul>
                <Button className="w-full">Upgrade Now</Button>
              </div>
            </Card>

            <Card className="p-6 border border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Amazon Command Center</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">$999</div>
                <p className="text-gray-600 text-sm mb-6">per year</p>
                <ul className="text-left text-sm space-y-2 mb-6">
                  <li>• Everything in Hunter</li>
                  <li>• Unlimited AI research</li>
                  <li>• Advanced financial modeling</li>
                  <li>• Deep competitor analysis</li>
                  <li>• Priority support</li>
                  <li>• Data exports & API</li>
                </ul>
                <Button variant="outline" className="w-full">Upgrade to Pro</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}