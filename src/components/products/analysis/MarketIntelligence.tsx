'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Heart,
  Brain,
  Zap,
  TrendingUp,
  Target,
  Package,
  DollarSign,
  Megaphone,
  Users,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Eye,
  BarChart3,
  Lightbulb,
  MessageSquare
} from 'lucide-react'

interface MarketIntelligenceProps {
  data: {
    reviewAnalysisData: {
      sentimentScore: number
      overallSentiment: string
      totalReviews: number
      emotionalTriggers: {
        positive: Array<{
          trigger: string
          frequency: number
          examples: string[]
          impact: string
        }>
        negative: Array<{
          trigger: string
          frequency: number
          examples: string[]
          impact: string
        }>
      }
      voiceOfCustomer: {
        featureRequests: Array<{
          feature: string
          mentions: number
          sentiment: string
          examples: string[]
        }>
        useCases: Array<{
          scenario: string
          percentage: number
          description: string
          keywords: string[]
        }>
        purchaseMotivations: Array<{
          motivation: string
          percentage: number
          description: string
        }>
      }
      competitiveIntelligence: {
        marketPosition: {
          topPerformers: Array<{ x: number; y: number; label: string; size: string; type: string }>
          axes: { x: string; y: string }
        }
        featureComparison: {
          features: Array<{
            name: string
            ourScore: number
            competitors: Record<string, number>
          }>
        }
        reviewShareOfVoice: {
          total: number
          breakdown: Array<{
            brand: string
            percentage: number
            reviews: number
          }>
        }
      }
      socialMediaInsights: {
        platforms: Array<{
          name: string
          sentiment: string
          reach?: number
          engagement?: number
          discussions?: number
          videos?: number
          avgViews?: number
          trending?: boolean
          topContent?: Array<{ type: string; views: number }>
          hashtags?: string[]
          topSubreddits?: string[]
          commonTopics?: string[]
          topCategories?: string[]
          influencerReach?: string
          contentTypes?: string[]
        }>
        emergingTrends: Array<{
          trend: string
          growth: string
          description: string
          opportunity: string
        }>
      }
      marketOpportunities: {
        untappedSegments: Array<{
          segment: string
          size: string
          fit: string
          strategy: string
        }>
        productExtensions: Array<{
          idea: string
          description: string
          marketSize: string
          difficulty: string
        }>
      }
      competitorReviews: Array<{
        competitor: string
        sentiment: string
        score: number
        totalReviews: number
        themes: {
          positive: string[]
          negative: string[]
        }
        keyInsights: string[]
      }>
      commonThemes: {
        positive: string[]
        negative: string[]
        opportunities: string[]
      }
      rawReviews?: Array<{
        reviewId: string
        asin: string
        reviewerName: string
        reviewerProfileUrl?: string
        rating: number
        title: string
        text: string
        date: Date
        verified: boolean
        helpfulVotes: number
        totalVotes: number
        variant?: string
        images?: string[]
        videoUrl?: string
        sentiment?: {
          score: number
          label: 'positive' | 'negative' | 'neutral' | 'mixed'
          aspects?: Array<{
            aspect: string
            sentiment: 'positive' | 'negative' | 'neutral'
            confidence: number
          }>
        }
      }>
    }
    demandData: {
      customerAvatars: Array<{
        name: string
        age: string
        gender: string
        income: string
        location: string
        occupation: string
        lifestyle: string
        pain: string
        deepPainPoints: string[]
        motivation: string
        goals: string[]
        shoppingBehavior: {
          researchStyle: string
          decisionFactors: string[]
          pricePoint: string
          purchaseTime: string
          brandLoyalty: string
        }
        psychographics: {
          values: string[]
          interests: string[]
          personality: string
          mediaConsumption: string[]
        }
        buyingJourney: {
          awareness: string
          consideration: string
          decision: string
          retention: string
        }
        reviewExamples?: Array<{
          text: string
          rating: number
          date?: string
          verified?: boolean
          helpfulVotes?: number
        }>
      }>
    }
  }
}

export default function MarketIntelligence({ data }: MarketIntelligenceProps) {
  const [activeTab, setActiveTab] = useState('personas')
  const getEmotionColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very positive': return 'text-green-600'
      case 'positive': return 'text-green-500'
      case 'neutral': return 'text-gray-600'
      case 'negative': return 'text-red-500'
      case 'very negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'personas', label: 'Customer Personas', icon: Users },
          { id: 'voice', label: 'Voice of Customer', icon: Megaphone },
          { id: 'emotions', label: 'Emotional Triggers', icon: Heart },
          { id: 'reviews', label: 'Raw Reviews', icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>


      {/* Voice of Customer Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-orange-600" />
                <span>Voice of Customer Analysis</span>
              </CardTitle>
              <CardDescription>
                Direct insights from customer feedback and reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Patterns */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Key Patterns
                </h4>
                <div className="space-y-3">
                  {[
                    { pattern: "Skepticism about 30-second dissolve claim without visual proof", impact: "Critical", frequency: 45, color: "red" },
                    { pattern: "Poor adhesion causing labels to fall off containers", impact: "Critical", frequency: 12, color: "red" },
                    { pattern: "Temperature range unclear - freezer compatibility questions", impact: "High", frequency: 18, color: "orange" },
                    { pattern: "Writing quality concerns - pen compatibility unknown", impact: "High", frequency: 7, color: "orange" },
                    { pattern: "Residue-free removal doubts need visual confirmation", impact: "High", frequency: 28, color: "orange" }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-gray-900 flex-1">{item.pattern}</p>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={item.impact === 'Critical' ? 'destructive' : 'default'} className="text-xs">
                            {item.impact}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.frequency} mentions
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Barriers */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Purchase Barriers
                </h4>
                <div className="space-y-3">
                  {[
                    { barrier: "Skepticism about 30-second dissolve claim - seems too good to be true", impact: "High" },
                    { barrier: "Unclear if labels work on wet/frozen surfaces or just room temperature", impact: "High" },
                    { barrier: "Concern about ink running or smudging when labels get wet", impact: "Medium" },
                    { barrier: "Price justification - $15+ for 200 labels vs traditional stickers", impact: "Medium" },
                    { barrier: "Size limitation - only 1x2 inches may not fit all labeling needs", impact: "Low" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          item.impact === 'High' ? 'bg-red-500' :
                          item.impact === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{item.barrier}</p>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.impact} Impact
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Customer Questions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Top Customer Questions
                </h4>
                <div className="space-y-3">
                  {[
                    { question: "What temperature water dissolves the labels - cold, warm, or hot?", type: "Usage", icon: "🔧" },
                    { question: "Will the labels stick to wet or condensation-covered containers?", type: "Product", icon: "📦" },
                    { question: "What pens/markers work best and won't run when labels dissolve?", type: "Usage", icon: "🔧" },
                    { question: "Do labels leave any residue on expensive containers or glass jars?", type: "Product", icon: "📦" },
                    { question: "How long do labels stay stuck before accidentally dissolving?", type: "Usage", icon: "🔧" },
                    { question: "Are the labels food-safe for direct contact with food surfaces?", type: "Product", icon: "📦" },
                    { question: "How do these compare to regular removable labels in cost per use?", type: "Comparison", icon: "⚖️" }
                  ].map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-white">
                      <div className="flex items-start space-x-3">
                        <span className="text-sm mt-0.5">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{item.question}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Improvements */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Top 5 Priority Improvements
                </h4>
                <div className="space-y-3">
                  {[
                    { 
                      priority: 1, 
                      action: "Add dissolving proof video/GIF in main image", 
                      type: "🖼️", 
                      impact: "Eliminates primary trust barrier and proves core benefit immediately" 
                    },
                    { 
                      priority: 2, 
                      action: "Address adhesion quality in bullet points", 
                      type: "•", 
                      impact: "Addresses major quality concern and sets proper expectations" 
                    },
                    { 
                      priority: 3, 
                      action: "Clarify temperature range in title", 
                      type: "📝", 
                      impact: "Captures meal prep audience and eliminates temperature uncertainty" 
                    },
                    { 
                      priority: 4, 
                      action: "Show pen compatibility in product images", 
                      type: "🖼️", 
                      impact: "Removes writing quality doubts and demonstrates versatility" 
                    },
                    { 
                      priority: 5, 
                      action: "Add no-residue guarantee in bullets", 
                      type: "•", 
                      impact: "Builds confidence for users with expensive glassware and containers" 
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.priority}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">{item.type}</span>
                            <h5 className="font-medium text-gray-900">{item.action}</h5>
                          </div>
                          <p className="text-sm text-gray-600">{item.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Insights Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Research Insights Summary
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Primary Concerns</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Dissolution effectiveness</li>
                      <li>• Temperature compatibility</li>
                      <li>• Writing quality</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Key Decision Factors</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Residue-free removal</li>
                      <li>• Adhesion strength</li>
                      <li>• Value for price</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Original Voice of Customer Analysis */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Most Requested Features
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.reviewAnalysisData.voiceOfCustomer.featureRequests.map((request, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{request.feature}</h5>
                        <Badge variant="outline" className="text-xs">{request.mentions} mentions</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Sentiment: <span className="font-medium text-blue-600">{request.sentiment}</span>
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        <div className="line-clamp-2">&ldquo;{request.examples[0]}&rdquo;</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Use Cases */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Primary Use Cases
                </h4>
                <div className="space-y-3">
                  {data.reviewAnalysisData.voiceOfCustomer.useCases.map((useCase, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg bg-white">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">{useCase.percentage}%</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-medium text-gray-900">{useCase.scenario}</h5>
                        <p className="text-sm text-gray-600">{useCase.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {useCase.keywords.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase Motivations */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Purchase Motivations
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.reviewAnalysisData.voiceOfCustomer.purchaseMotivations.map((motivation, index) => (
                    <div key={index} className="text-center p-4 border rounded-lg bg-white">
                      <div className="text-2xl font-bold text-gray-700 mb-1">{motivation.percentage}%</div>
                      <div className="text-sm font-medium text-gray-900">{motivation.motivation}</div>
                      <div className="text-xs text-gray-600 mt-1">{motivation.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emotional Triggers Tab */}
      {activeTab === 'emotions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Emotional Triggers Analysis</span>
              </CardTitle>
              <CardDescription>
                Deep psychological drivers that influence purchase decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Positive Triggers */}
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-4 flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Positive Emotional Triggers
                  </h4>
                  <div className="space-y-3">
                    {data.reviewAnalysisData.emotionalTriggers.positive.map((trigger, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getEmotionColor(trigger.impact)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{trigger.trigger}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {trigger.frequency} mentions
                          </Badge>
                        </div>
                        <div className="text-sm opacity-90 mb-2">
                          Impact: <span className="font-medium capitalize">{trigger.impact}</span>
                        </div>
                        <div className="text-xs italic space-y-1">
                          {trigger.examples.slice(0, 2).map((example, i) => (
                            <div key={i} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>&ldquo;{example}&rdquo;</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Negative Triggers */}
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-4 flex items-center">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Negative Emotional Triggers
                  </h4>
                  <div className="space-y-3">
                    {data.reviewAnalysisData.emotionalTriggers.negative.map((trigger, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getEmotionColor(trigger.impact)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{trigger.trigger}</h5>
                          <Badge variant="destructive" className="text-xs">
                            {trigger.frequency} mentions
                          </Badge>
                        </div>
                        <div className="text-sm opacity-90 mb-2">
                          Impact: <span className="font-medium capitalize">{trigger.impact}</span>
                        </div>
                        <div className="text-xs italic space-y-1">
                          {trigger.examples.slice(0, 2).map((example, i) => (
                            <div key={i} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>&ldquo;{example}&rdquo;</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Personas Tab */}
      {activeTab === 'personas' && (
        <div className="space-y-6">
          {data.demandData.customerAvatars.map((avatar, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm">
              <div className="bg-gray-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                      <UserCheck className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{avatar.name}</h3>
                      <p className="text-gray-600">{avatar.age} • {avatar.gender}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Income Range</div>
                    <div className="font-semibold text-gray-900">{avatar.income}</div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Demographics & Lifestyle */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Demographics & Lifestyle</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium text-gray-600">Location:</span> {avatar.location}</div>
                        <div><span className="font-medium text-gray-600">Occupation:</span> {avatar.occupation}</div>
                        <div><span className="font-medium text-gray-600">Lifestyle:</span> {avatar.lifestyle}</div>
                      </div>
                    </div>

                    {/* Pain Points */}
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Pain Points</h4>
                      <div className="bg-red-50 p-3 rounded-lg mb-2">
                        <p className="text-sm font-medium text-red-900">{avatar.pain}</p>
                      </div>
                      <ul className="space-y-1">
                        {avatar.deepPainPoints.map((point, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Goals */}
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Goals & Motivations</h4>
                      <div className="bg-green-50 p-3 rounded-lg mb-2">
                        <p className="text-sm font-medium text-green-900">{avatar.motivation}</p>
                      </div>
                      <ul className="space-y-1">
                        {avatar.goals.map((goal, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Psychographics & Behavior */}
                  <div className="space-y-4">
                    {/* Psychographics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Psychographics</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Personality:</span>
                          <p className="text-gray-700 mt-1">{avatar.psychographics.personality}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Core Values:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {avatar.psychographics.values.map((value, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Interests:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {avatar.psychographics.interests.map((interest, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Media Consumption:</span>
                          <p className="text-gray-700 mt-1">{avatar.psychographics.mediaConsumption.join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shopping Behavior */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Shopping Behavior</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-200">
                        <div><span className="font-medium text-gray-700">Research Style:</span> <span className="text-gray-600">{avatar.shoppingBehavior.researchStyle}</span></div>
                        <div><span className="font-medium text-gray-700">Price Sensitivity:</span> <span className="text-gray-600">{avatar.shoppingBehavior.pricePoint}</span></div>
                        <div><span className="font-medium text-gray-700">Purchase Timing:</span> <span className="text-gray-600">{avatar.shoppingBehavior.purchaseTime}</span></div>
                        <div><span className="font-medium text-gray-700">Brand Loyalty:</span> <span className="text-gray-600">{avatar.shoppingBehavior.brandLoyalty}</span></div>
                        <div>
                          <span className="font-medium text-gray-700">Key Decision Factors:</span>
                          <ul className="mt-1 ml-4">
                            {avatar.shoppingBehavior.decisionFactors.map((factor, i) => (
                              <li key={i} className="text-gray-600">• {factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Buying Journey */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Customer Journey</h4>
                      <div className="space-y-3">
                        <div className="border-l-4 border-gray-400 pl-3">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Awareness</div>
                          <p className="text-sm text-gray-700 mt-1">{avatar.buyingJourney.awareness}</p>
                        </div>
                        <div className="border-l-4 border-gray-400 pl-3">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Consideration</div>
                          <p className="text-sm text-gray-700 mt-1">{avatar.buyingJourney.consideration}</p>
                        </div>
                        <div className="border-l-4 border-gray-400 pl-3">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Decision</div>
                          <p className="text-sm text-gray-700 mt-1">{avatar.buyingJourney.decision}</p>
                        </div>
                        <div className="border-l-4 border-gray-400 pl-3">
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Retention</div>
                          <p className="text-sm text-gray-700 mt-1">{avatar.buyingJourney.retention}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Examples Section */}
                {avatar.reviewExamples && avatar.reviewExamples.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                      Representative Reviews from This Persona
                    </h4>
                    <div className="space-y-3">
                      {avatar.reviewExamples.map((review, reviewIndex) => (
                        <div key={reviewIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            {review.date && (
                              <span className="text-xs text-gray-500">{review.date}</span>
                            )}
                          </div>
                          <blockquote className="text-sm text-gray-700 italic leading-relaxed">
                            &ldquo;{review.text}&rdquo;
                          </blockquote>
                          {review.helpfulVotes && review.helpfulVotes > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {review.helpfulVotes} people found this helpful
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 italic">
                      These reviews were identified as representative of this customer persona based on language patterns, 
                      concerns expressed, and purchase motivations mentioned.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      {/* Raw Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Raw Review Data</span>
              </CardTitle>
              <CardDescription>
                Complete individual customer reviews with sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.reviewAnalysisData.rawReviews?.map((review, index) => (
                  <div key={review.reviewId} className="border rounded-lg p-4 bg-white">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">{review.reviewerName}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {review.date.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {review.helpfulVotes} of {review.totalVotes} helpful
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>

                    {/* Review Text */}
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {review.text}
                    </p>

                    {/* Review Metadata */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        {review.variant && (
                          <span className="text-xs text-gray-500">
                            Variant: <span className="font-medium">{review.variant}</span>
                          </span>
                        )}
                        {review.sentiment && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Sentiment:</span>
                            <Badge
                              variant={
                                review.sentiment.label === 'positive' ? 'default' : 
                                review.sentiment.label === 'negative' ? 'destructive' : 
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {review.sentiment.label} ({(review.sentiment.score * 100).toFixed(0)}%)
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Aspect Sentiments */}
                      {review.sentiment?.aspects && (
                        <div className="flex flex-wrap gap-1">
                          {review.sentiment.aspects.slice(0, 3).map((aspect, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`text-xs ${
                                aspect.sentiment === 'positive' ? 'border-green-300 text-green-700' :
                                aspect.sentiment === 'negative' ? 'border-red-300 text-red-700' :
                                'border-gray-300 text-gray-700'
                              }`}
                            >
                              {aspect.aspect}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex space-x-2">
                          {review.images.map((image, i) => (
                            <img
                              key={i}
                              src={image}
                              alt={`Review image ${i + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}