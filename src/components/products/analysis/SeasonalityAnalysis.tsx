'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Target,
  Lightbulb,
  Sparkles,
  BarChart3,
  Snowflake,
  Sun,
  Leaf,
  Flower
} from 'lucide-react'

interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'back_to_school'
  months: string[]
  pattern: 'peak' | 'valley' | 'gradual_increase' | 'gradual_decrease' | 'stable' | 'volatile'
  strength: number // 0-100
  confidence: number // 0-100
  description: string
  drivers: string[]
  impact: 'high' | 'medium' | 'low'
  opportunity_score: number // 0-100
  risk_factors: string[]
  actionable_insights: string[]
}

interface SeasonalAnalysisResult {
  overall_seasonality: 'highly_seasonal' | 'moderately_seasonal' | 'low_seasonal' | 'non_seasonal'
  seasonality_score: number // 0-100
  peak_months: string[]
  valley_months: string[]
  trends: SeasonalTrend[]
  market_insights: {
    best_launch_window: string
    worst_launch_window: string
    inventory_recommendations: Array<{
      period: string
      strategy: string
      stock_level: 'high' | 'medium' | 'low'
    }>
    promotional_calendar: Array<{
      period: string
      type: 'discount' | 'bundle' | 'advertising' | 'content'
      priority: 'high' | 'medium' | 'low'
    }>
  }
  competitive_insights: {
    seasonal_leaders: Array<{ season: string; competitors: string[] }>
    market_gaps: string[]
    timing_advantages: string[]
  }
  recommendations: {
    inventory_strategy: string
    marketing_calendar: string[]
    pricing_strategy: string
    content_strategy: string[]
    risk_mitigation: string[]
  }
}

interface SeasonalityAnalysisProps {
  nicheId: string | null
  onSeasonSelect?: (season: SeasonalTrend | null) => void
}

export default function SeasonalityAnalysis({ nicheId, onSeasonSelect }: SeasonalityAnalysisProps) {
  const [analysis, setAnalysis] = useState<SeasonalAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)

  const fetchAnalysis = async () => {
    if (!nicheId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/niches/${nicheId}/seasonality-analysis`)
      const result = await response.json()
      
      if (result.hasData && result.analysis) {
        setAnalysis(result.analysis)
      } else {
        setError(result.error || 'Unable to generate seasonality analysis')
      }
    } catch (error) {
      console.error('Failed to fetch seasonality analysis:', error)
      setError('Failed to load seasonality analysis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [nicheId])

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return Flower
      case 'summer': return Sun
      case 'fall': return Leaf
      case 'winter': return Snowflake
      case 'holiday': return Sparkles
      case 'back_to_school': return Target
      default: return Calendar
    }
  }

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'spring': return 'bg-green-50 border-green-200 text-green-800'
      case 'summer': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'fall': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'winter': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'holiday': return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'back_to_school': return 'bg-indigo-50 border-indigo-200 text-indigo-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'peak': return TrendingUp
      case 'valley': return TrendingDown
      case 'gradual_increase': return Activity
      case 'gradual_decrease': return Activity
      case 'volatile': return AlertTriangle
      default: return BarChart3
    }
  }

  const getSeasonalityColor = (score: number) => {
    if (score >= 80) return 'text-red-600'      // Highly seasonal
    if (score >= 60) return 'text-orange-600'  // Moderately seasonal
    if (score >= 40) return 'text-yellow-600'  // Low seasonal
    return 'text-green-600'                     // Non-seasonal
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

  // Only return the Seasonal Trends & Patterns section when analysis is available
  if (!analysis || !analysis.trends) {
    return null
  }

  return (
    <>
      {(analysis.trends || []).map((trend, index) => {
        const SeasonIcon = getSeasonIcon(trend.season)
        const PatternIcon = getPatternIcon(trend.pattern)
        const isSelected = selectedSeason === trend.season
        return (
          <div
            key={index}
            onClick={() => {
              if (isSelected) {
                setSelectedSeason(null)
                onSeasonSelect?.(null)
              } else {
                setSelectedSeason(trend.season)
                onSeasonSelect?.(trend)
              }
            }}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
              isSelected 
                ? `${getSeasonColor(trend.season)} ring-2 ring-offset-2 ring-indigo-500 shadow-lg` 
                : getSeasonColor(trend.season)
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <SeasonIcon className="h-4 w-4" />
                <PatternIcon className="h-3 w-3" />
                <span className="font-medium capitalize">{trend.season.replace('_', ' ')}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {trend.pattern.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {getImpactBadge(trend.impact)}
                <Badge variant="outline" className="text-xs">
                  {trend.confidence}% confidence
                </Badge>
              </div>
            </div>
            <p className="text-sm mb-2">{trend.description}</p>
            <div className="text-xs opacity-75 mb-2">
              <strong>Months:</strong> {trend.months.join(', ')}
            </div>
            <div className="text-xs opacity-75 mb-2">
              <strong>Strength:</strong> {trend.strength}% | <strong>Opportunity:</strong> {trend.opportunity_score}%
            </div>
            {trend.weekly_analysis && (
              <div className="text-xs opacity-75 mb-2 bg-blue-50 border border-blue-200 rounded p-2">
                <strong className="text-blue-800">Weekly Timeline:</strong>
                <div className="mt-1 space-y-1">
                  {trend.weekly_analysis.pickup_week && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span><strong>Pickup:</strong> {trend.weekly_analysis.pickup_week}</span>
                    </div>
                  )}
                  {trend.weekly_analysis.peak_week && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span><strong>Peak:</strong> {trend.weekly_analysis.peak_week}</span>
                    </div>
                  )}
                  {trend.weekly_analysis.fall_week && (
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      <span><strong>Fall:</strong> {trend.weekly_analysis.fall_week}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {trend.drivers.length > 0 && (
              <div className="text-xs opacity-75 mb-2">
                <strong>Drivers:</strong> {trend.drivers.join(', ')}
              </div>
            )}
            {trend.actionable_insights.length > 0 && (
              <div className="text-xs">
                <strong>Actions:</strong>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {trend.actionable_insights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}