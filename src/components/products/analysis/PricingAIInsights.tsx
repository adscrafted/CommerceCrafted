'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  Target,
  Lightbulb,
  RefreshCw,
  Sparkles
} from 'lucide-react'

interface PricingTheme {
  name: string
  type: 'trending_up' | 'trending_down' | 'seasonal' | 'stable' | 'volatile' | 'promotional'
  confidence: number
  description: string
  timeframe: string
  evidence: string[]
  impact: 'high' | 'medium' | 'low'
  actionable_insights: string[]
}

interface PricingAnalysisResult {
  overall_trend: 'bullish' | 'bearish' | 'sideways' | 'volatile'
  trend_strength: number
  volatility_score: number
  themes: PricingTheme[]
  market_insights: {
    average_price: number
    price_range: { min: number; max: number }
    price_stability: string
    seasonal_patterns: Array<{
      period: string
      pattern: string
      strength: number
    }>
  }
  competitive_insights: {
    price_leaders: string[]
    price_followers: string[]
    outliers: string[]
    convergence_patterns: string[]
  }
  recommendations: {
    optimal_pricing_strategy: string
    timing_recommendations: string[]
    risk_factors: string[]
    opportunities: string[]
  }
}

interface PricingAIInsightsProps {
  nicheId: string | null
}

export default function PricingAIInsights({ nicheId }: PricingAIInsightsProps) {
  const [analysis, setAnalysis] = useState<PricingAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchAnalysis = async () => {
    if (!nicheId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/niches/${nicheId}/pricing-analysis`)
      const result = await response.json()
      
      if (result.hasData && result.analysis) {
        setAnalysis(result.analysis)
        setLastUpdated(result.generatedAt || new Date().toISOString())
      } else {
        setError(result.error || 'Unable to generate pricing analysis')
      }
    } catch (error) {
      console.error('Failed to fetch pricing analysis:', error)
      setError('Failed to load pricing analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [nicheId])

  const getThemeIcon = (type: string) => {
    switch (type) {
      case 'trending_up': return TrendingUp
      case 'trending_down': return TrendingDown
      case 'seasonal': return Calendar
      case 'volatile': return AlertTriangle
      case 'promotional': return Target
      default: return DollarSign
    }
  }

  const getThemeColor = (type: string) => {
    switch (type) {
      case 'trending_up': return 'bg-green-50 border-green-200 text-green-800'
      case 'trending_down': return 'bg-red-50 border-red-200 text-red-800'
      case 'seasonal': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'volatile': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'promotional': return 'bg-purple-50 border-purple-200 text-purple-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-600'
      case 'bearish': return 'text-red-600'
      case 'volatile': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive" className="text-xs">High Impact</Badge>
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium Impact</Badge>
      case 'low': return <Badge variant="outline" className="text-xs">Low Impact</Badge>
      default: return null
    }
  }

  if (!nicheId) {
    return null
  }

  return (
    <Card className="mt-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="text-purple-800">Pricing Analysis</span>
          <Sparkles className="h-4 w-4 text-purple-500" />
        </CardTitle>
        <CardDescription>
          Analysis of pricing trends, patterns, and market opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing pricing patterns...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <Button onClick={fetchAnalysis} size="sm" variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className={`text-2xl font-bold ${getTrendColor(analysis.overall_trend || 'sideways')}`}>
                  {analysis.overall_trend ? 
                    analysis.overall_trend.charAt(0).toUpperCase() + analysis.overall_trend.slice(1) : 
                    'Unknown'
                  }
                </div>
                <div className="text-sm text-gray-600">Overall Trend</div>
                <div className="text-xs text-purple-600 mt-1">
                  {analysis.trend_strength || 0}% strength
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  ${analysis.market_insights?.average_price?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">Avg Price</div>
                <div className="text-xs text-gray-500 mt-1">
                  ${analysis.market_insights?.price_range?.min?.toFixed(2) || '0.00'} - ${analysis.market_insights?.price_range?.max?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.volatility_score || 0}%
                </div>
                <div className="text-sm text-gray-600">Volatility</div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {analysis.market_insights?.price_stability?.replace('_', ' ') || 'unknown'}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.themes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Key Themes</div>
                <div className="text-xs text-gray-500 mt-1">
                  Patterns identified
                </div>
              </div>
            </div>

            {/* Pricing Themes */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-purple-600" />
                Pricing Themes & Patterns
              </h4>
              <div className="space-y-3">
                {(analysis.themes || []).map((theme, index) => {
                  const Icon = getThemeIcon(theme.type)
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${getThemeColor(theme.type)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{theme.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getImpactBadge(theme.impact)}
                          <Badge variant="outline" className="text-xs">
                            {theme.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{theme.description}</p>
                      <div className="text-xs opacity-75 mb-2">
                        <strong>Timeframe:</strong> {theme.timeframe}
                      </div>
                      {theme.evidence.length > 0 && (
                        <div className="text-xs opacity-75 mb-2">
                          <strong>Evidence:</strong> {theme.evidence.join(', ')}
                        </div>
                      )}
                      {theme.actionable_insights.length > 0 && (
                        <div className="text-xs">
                          <strong>Actions:</strong>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {theme.actionable_insights.map((insight, i) => (
                              <li key={i}>{insight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-600" />
                Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-green-700 mb-2">Strategy</h5>
                  <p className="text-sm text-gray-700">{analysis.recommendations?.optimal_pricing_strategy || 'No strategy available'}</p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-blue-700 mb-2">Timing</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {(analysis.recommendations?.timing_recommendations || []).map((rec, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-purple-700 mb-2">Opportunities</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {(analysis.recommendations?.opportunities || []).map((opp, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h5 className="font-medium text-red-700 mb-2">Risk Factors</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {(analysis.recommendations?.risk_factors || []).map((risk, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}