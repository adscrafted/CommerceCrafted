'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Target,
  Shield,
  ChevronRight,
  Sparkles,
  BarChart3,
  Users,
  Package,
  DollarSign,
  Calendar,
  Zap,
  Info
} from 'lucide-react'

interface AIMarketInsightsProps {
  nicheId?: string
  products?: any[]
  keywords?: any[]
  className?: string
}

interface AIInsights {
  marketAssessment: string
  opportunities: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    dataSource?: string
  }>
  riskFactors: Array<{
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
    dataSource?: string
  }>
  marketMetrics?: {
    estimatedSize: string
    growthRate: string
    competitionLevel: string
    profitPotential: string
  }
  keyFindings?: string[]
  timestamp?: string
}

export default function AIMarketInsights({ nicheId, products = [], keywords = [], className = '' }: AIMarketInsightsProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (nicheId) {
      fetchAIInsights()
    } else {
      setLoading(false)
    }
  }, [nicheId])

  const fetchAIInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call the comprehensive analysis endpoint
      const response = await fetch(`/api/niches/${nicheId}/comprehensive-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.slice(0, 20), // Send top 20 products
          keywords: keywords.slice(0, 50), // Send top 50 keywords
          includeProductAge: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch AI insights')
      }

      const data = await response.json()
      
      // Transform the comprehensive analysis into our insights format
      const transformedInsights: AIInsights = {
        marketAssessment: `The ${products[0]?.category || 'product'} market shows ${data.marketOverview?.stage || 'steady'} characteristics with an estimated size of ${data.marketOverview?.size || 'significant revenue'}. ${data.reviewSentiments?.positive?.percentage || 0}% positive sentiment indicates ${data.reviewSentiments?.positive?.percentage > 70 ? 'strong customer satisfaction' : 'room for improvement'}. Key success factors include ${data.customerInsights?.buyingTriggers?.[0] || 'quality and value'}.`,
        
        opportunities: data.competitiveLandscape?.gaps?.map((gap: string, idx: number) => ({
          title: gap,
          description: `Analysis shows this opportunity based on ${data.keywordOpportunities?.untapped?.length || 0} untapped keywords and customer feedback patterns.`,
          priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
          dataSource: 'AI analysis of market gaps'
        })) || [],
        
        riskFactors: data.customerInsights?.painPoints?.map((pain: string, idx: number) => ({
          title: pain,
          description: `Identified from analysis of ${data.reviewSentiments?.negative?.percentage || 0}% negative reviews and market feedback.`,
          severity: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
          dataSource: 'Customer review analysis'
        })) || [],
        
        marketMetrics: {
          estimatedSize: data.marketOverview?.size || 'Data processing',
          growthRate: data.marketOverview?.growth || 'Calculating',
          competitionLevel: `${data.marketOverview?.saturation || 0}% saturated`,
          profitPotential: `${data.marketOverview?.opportunity || 0}% opportunity score`
        },
        
        keyFindings: [
          ...(data.launchRecommendations?.differentiators || []).slice(0, 3),
          `Optimal price range: ${data.pricingIntelligence?.optimalPrice || 'Market-dependent'}`
        ],
        
        timestamp: new Date().toISOString()
      }

      setInsights(transformedInsights)
    } catch (err) {
      console.error('Error fetching AI insights:', err)
      setError('Unable to generate AI insights at this time')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'medium': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'low': return <Info className="h-5 w-5 text-blue-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  if (!nicheId) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          AI market insights require niche analysis. Create or select a niche to see AI-powered insights.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!insights) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Overview Card */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Market Assessment
          </CardTitle>
          <CardDescription>
            Real-time analysis based on {products.length} products and {keywords.length} keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{insights.marketAssessment}</p>
          </div>
          
          {insights.marketMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{insights.marketMetrics.estimatedSize}</div>
                <div className="text-xs text-gray-600">Market Size</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{insights.marketMetrics.growthRate}</div>
                <div className="text-xs text-gray-600">Growth Rate</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Users className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{insights.marketMetrics.competitionLevel}</div>
                <div className="text-xs text-gray-600">Competition</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">{insights.marketMetrics.profitPotential}</div>
                <div className="text-xs text-gray-600">Opportunity</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunities and Risks Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Opportunities Card */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-600" />
              Market Opportunities
            </CardTitle>
            <CardDescription>
              AI-identified growth opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.opportunities.map((opp, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${getPriorityColor(opp.priority)}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{opp.title}</h4>
                    <p className="text-xs leading-relaxed">{opp.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {opp.priority} priority
                      </Badge>
                      {opp.dataSource && (
                        <span className="text-xs text-gray-500">{opp.dataSource}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Risk Factors Card */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Risk Analysis
            </CardTitle>
            <CardDescription>
              Potential challenges to consider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.riskFactors.map((risk, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${getPriorityColor(risk.severity)}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(risk.severity)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{risk.title}</h4>
                    <p className="text-xs leading-relaxed">{risk.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {risk.severity} severity
                      </Badge>
                      {risk.dataSource && (
                        <span className="text-xs text-gray-500">{risk.dataSource}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Key Findings Card */}
      {insights.keyFindings && insights.keyFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Key Strategic Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Update Timestamp */}
      {insights.timestamp && (
        <div className="text-center text-xs text-gray-500">
          AI analysis generated at {new Date(insights.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  )
}