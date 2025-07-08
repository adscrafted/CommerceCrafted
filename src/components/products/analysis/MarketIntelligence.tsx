'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Heart,
  Brain,
  Zap,
  TrendingUp,
  Target,
  Package,
  DollarSign,
  Megaphone,
  Globe,
  Hash,
  Youtube,
  Award,
  Layers,
  Users,
  UserCheck
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
    }
    demandData: {
      customerAvatars: Array<{
        name: string
        age: string
        pain: string
        motivation: string
      }>
    }
  }
}

export default function MarketIntelligence({ data }: MarketIntelligenceProps) {
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
      {/* Key Insights Scorecards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.reviewAnalysisData.sentimentScore}★</div>
              <div className="text-sm text-gray-600 mt-1">Sentiment Score</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{(data.reviewAnalysisData.totalReviews / 1000).toFixed(1)}K</div>
              <div className="text-sm text-gray-600 mt-1">Reviews Analyzed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.reviewAnalysisData.competitorReviews.length}</div>
              <div className="text-sm text-gray-600 mt-1">Competitors</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.reviewAnalysisData.commonThemes.opportunities.length}</div>
              <div className="text-sm text-gray-600 mt-1">Opportunities</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice of Customer Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-orange-600" />
            <span>Voice of Customer</span>
          </CardTitle>
          <CardDescription>
            Direct insights from customer feedback and reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Requests */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Most Requested Features
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {data.reviewAnalysisData.voiceOfCustomer.featureRequests.map((request, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{request.feature}</h5>
                    <Badge className="text-xs">{request.mentions} mentions</Badge>
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

          {/* Use Cases */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Primary Use Cases
            </h4>
            <div className="space-y-3">
              {data.reviewAnalysisData.voiceOfCustomer.useCases.map((useCase, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-600">{useCase.percentage}%</span>
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
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">{motivation.percentage}%</div>
                  <div className="text-sm font-medium text-gray-900">{motivation.motivation}</div>
                  <div className="text-xs text-gray-600 mt-1">{motivation.description}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emotional Triggers Analysis */}
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

      {/* Customer Avatars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Customer Avatars</span>
          </CardTitle>
          <CardDescription>
            Key customer segments driving demand for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {data.demandData.customerAvatars.map((avatar, index) => (
              <div key={index} className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{avatar.name}</h3>
                  <p className="text-sm text-gray-600">{avatar.age}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-1">Pain Point:</div>
                    <div className="text-sm text-gray-700">{avatar.pain}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-1">Motivation:</div>
                    <div className="text-sm text-gray-700">{avatar.motivation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Intelligence Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span>Competitive Intelligence</span>
          </CardTitle>
          <CardDescription>
            Market positioning and competitive landscape analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market Position Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Market Position Map</h4>
            <div className="mb-3 flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Market Leader</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Opportunity Zone</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Established</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Emerging</span>
              </div>
            </div>
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                {data.reviewAnalysisData.competitiveIntelligence.marketPosition.axes.x} →
              </div>
              <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-500">
                {data.reviewAnalysisData.competitiveIntelligence.marketPosition.axes.y} →
              </div>
              
              {/* Plot market performers */}
              {data.reviewAnalysisData.competitiveIntelligence.marketPosition.topPerformers.map((performer, index) => {
                const getColorByType = (type: string) => {
                  switch (type) {
                    case 'leader': return 'bg-blue-600'
                    case 'opportunity': return 'bg-green-500'
                    case 'established': return 'bg-blue-500'
                    case 'emerging': return 'bg-gray-500'
                    default: return 'bg-gray-400'
                  }
                }
                
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${performer.x}%`,
                      bottom: `${performer.y}%`
                    }}
                  >
                    <div className={`
                      ${performer.size === 'large' ? 'w-12 h-12' : performer.size === 'medium' ? 'w-8 h-8' : 'w-6 h-6'}
                      ${getColorByType(performer.type)} rounded-full flex items-center justify-center text-white text-xs font-medium
                      hover:opacity-90 transition-opacity cursor-pointer relative group
                      ${performer.type === 'opportunity' ? 'animate-pulse' : ''}
                    `}>
                      {performer.type === 'opportunity' ? '★' : index + 1}
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {performer.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Feature Comparison */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Feature Comparison Matrix</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Feature</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-green-600">Niche Average</th>
                    {Object.keys(data.reviewAnalysisData.competitiveIntelligence.featureComparison.features[0].competitors).map((comp) => (
                      <th key={comp} className="text-center py-2 px-3 text-sm font-medium text-gray-700">{comp}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.reviewAnalysisData.competitiveIntelligence.featureComparison.features.map((feature, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-3 text-sm text-gray-900">{feature.name}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center">
                          <Progress value={feature.ourScore * 10} className="w-20 h-2" />
                          <span className="ml-2 text-sm font-medium">{feature.ourScore}/10</span>
                        </div>
                      </td>
                      {Object.entries(feature.competitors).map(([comp, score]) => (
                        <td key={comp} className="py-3 px-3">
                          <div className="flex items-center justify-center">
                            <Progress value={score * 10} className="w-20 h-2" />
                            <span className="ml-2 text-sm">{score}/10</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Share of Voice */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Review Share of Voice</h4>
            <div className="space-y-2">
              {data.reviewAnalysisData.competitiveIntelligence.reviewShareOfVoice.breakdown.map((brand, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-24 text-sm font-medium text-gray-700">{brand.brand}</div>
                  <div className="flex-grow">
                    <Progress 
                      value={brand.percentage} 
                      className="h-6"
                    />
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {brand.percentage}% ({brand.reviews.toLocaleString()})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Market Opportunities</span>
          </CardTitle>
          <CardDescription>
            Untapped segments and expansion opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Untapped Segments */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Untapped Market Segments</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {data.reviewAnalysisData.marketOpportunities.untappedSegments.map((segment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{segment.segment}</h5>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className="text-xs">
                        Size: {segment.size}
                      </Badge>
                      <Badge className="text-xs">
                        Fit: {segment.fit}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{segment.strategy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Extensions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Product Extension Opportunities</h4>
            <div className="space-y-3">
              {data.reviewAnalysisData.marketOpportunities.productExtensions.map((extension, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{extension.idea}</h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-600">{extension.marketSize}</span>
                        <Badge variant={extension.difficulty === 'Low' ? 'secondary' : extension.difficulty === 'Medium' ? 'default' : 'destructive'} className="text-xs">
                          {extension.difficulty} difficulty
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{extension.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Review Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Competitor Review Analysis</span>
          </CardTitle>
          <CardDescription>
            Deep dive into competitor reviews to identify opportunities and threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.reviewAnalysisData.competitorReviews.map((competitor, index) => (
              <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {competitor.competitor}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(competitor.score) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({competitor.totalReviews.toLocaleString()})
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-green-600 mb-2 flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Positive Themes
                        </div>
                        <div className="space-y-1">
                          {competitor.themes.positive.map((theme, themeIndex) => (
                            <Badge key={themeIndex} variant="secondary" className="text-xs mr-1 mb-1">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-red-600 mb-2 flex items-center">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Negative Themes
                        </div>
                        <div className="space-y-1">
                          {competitor.themes.negative.map((theme, themeIndex) => (
                            <Badge key={themeIndex} variant="destructive" className="text-xs mr-1 mb-1">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Key Insights</div>
                    <ul className="space-y-2">
                      {competitor.keyInsights.map((insight, insightIndex) => (
                        <li key={insightIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                          <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-1" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common Themes & Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            <span>Market Insights & Opportunities</span>
          </CardTitle>
          <CardDescription>
            Cross-competitor analysis revealing market gaps and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-green-600 mb-3 flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Common Positive Themes
              </div>
              <div className="space-y-2">
                {data.reviewAnalysisData.commonThemes.positive.map((theme, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-sm text-gray-700">{theme}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-red-600 mb-3 flex items-center">
                <ThumbsDown className="h-4 w-4 mr-2" />
                Common Pain Points
              </div>
              <div className="space-y-2">
                {data.reviewAnalysisData.commonThemes.negative.map((theme, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-700">{theme}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-purple-600 mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Market Opportunities
              </div>
              <div className="space-y-2">
                {data.reviewAnalysisData.commonThemes.opportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <ArrowRight className="h-3 w-3 text-purple-500" />
                    <span className="text-sm text-gray-700">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}