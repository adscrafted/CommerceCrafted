'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Users,
  UserCheck
} from 'lucide-react'

interface MarketIntelligenceProps {
  data: any
}

export default function MarketIntelligence({ data }: MarketIntelligenceProps) {
  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overall Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.reviewAnalysisData.sentimentScore}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {data.reviewAnalysisData.overallSentiment}
              </div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(data.reviewAnalysisData.sentimentScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Reviews Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {data.reviewAnalysisData.totalReviews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Across all competitors
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Market Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {data.reviewAnalysisData.commonThemes.opportunities.length}
              </div>
              <div className="text-sm text-gray-600">
                Key opportunities identified
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            {data.demandData.customerAvatars.map((avatar: any, index: number) => (
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
            {data.reviewAnalysisData.competitorReviews.map((competitor: any, index: number) => (
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
                          {competitor.themes.positive.map((theme: string, themeIndex: number) => (
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
                          {competitor.themes.negative.map((theme: string, themeIndex: number) => (
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
                      {competitor.keyInsights.map((insight: string, insightIndex: number) => (
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
                {data.reviewAnalysisData.commonThemes.positive.map((theme: string, index: number) => (
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
                {data.reviewAnalysisData.commonThemes.negative.map((theme: string, index: number) => (
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
                {data.reviewAnalysisData.commonThemes.opportunities.map((opportunity: string, index: number) => (
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