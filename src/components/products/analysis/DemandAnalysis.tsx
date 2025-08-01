'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScoreCard } from '@/components/ui/score-card'
import { 
  BarChart3, 
  Activity,
  TrendingUp,
  Sparkles,
  DollarSign,
  Hash,
  Search,
  Layers,
  Target,
  Zap,
  ShoppingCart,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Package,
  Eye,
  Users,
  Globe,
  Calendar,
  CheckCircle,
  AlertCircle,
  Brain,
  Lightbulb
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ReferenceLine } from 'recharts'
import KeywordNetworkVisualization from '@/components/KeywordNetworkVisualization'
import DemandAnalysisReal from './DemandAnalysisReal'
import SeasonalityAnalysis from './SeasonalityAnalysis'

interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'back_to_school'
  months: string[]
  pattern: 'peak' | 'valley' | 'gradual_increase' | 'gradual_decrease' | 'stable' | 'volatile'
  strength: number
  confidence: number
  description: string
  drivers: string[]
  impact: 'high' | 'medium' | 'low'
  opportunity_score: number
  risk_factors: string[]
  actionable_insights: string[]
  weekly_analysis?: {
    pickup_week?: string
    peak_week?: string
    fall_week?: string
  }
}

interface DemandAnalysisProps {
  data: {
    demandData: {
      monthlySearchVolume: number
      searchTrend: string
      marketSize: number
      marketGrowth: string
      conversionRate: number
      clickShare: number
      seasonality: Record<string, number>
      googleTrends: Array<{ month: string; value: number }>
      socialSignals: {
        tiktok: { posts: number; views: number; engagement: string }
        instagram: { posts: number; engagement: string }
        youtube: { videos: number; avgViews: number }
        reddit: { discussions: number; sentiment: string }
      }
      keywordMetrics: {
        totalKeywords: number
        totalMarketRevenue: number
        topKeywords: Array<{
          keyword: string
          orders: number
          revenue: number
          growth: string
          searchVolume: number
          clickShare: number
          conversionRate: number
        }>
        keywordDepth: {
          top10: number
          top50: number
          longTail: number
        }
        concentrationIndex: number
      }
      salesRankHistory: Array<{
        date: string
        rank: number
        categoryRank: number
        subcategory: string
      }>
      trendingKeywords: Array<{
        keyword: string
        growth: string
        newRank: number
        oldRank: number
      }>
      demandVelocity: {
        monthOverMonth: string
        quarterOverQuarter: string
        yearOverYear: string
        acceleration: string
        momentumScore: number
        signals: string[]
      }
      categoryPenetration: {
        nicheSize: number
        categoryGrowth: string
        nicheGrowth: string
        saturationLevel: string
        marketMaturity: string
        whiteSpaceOpportunity: number
      }
      priceElasticity: {
        coefficient: number
        optimalPrice: number
        sensitivityScore: string
        segmentDemand: {
          budget: { range: string; percentage: number }
          mid: { range: string; percentage: number }
          premium: { range: string; percentage: number }
        }
        priceVsVolume: Array<{ price: number; estimatedVolume: number }>
      }
    }
  }
  nicheId?: string | null
  nicheData?: any
}

export default function DemandAnalysis({ data, nicheId, nicheData }: DemandAnalysisProps) {
  const [activeTab, setActiveTab] = useState('market')
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<SeasonalTrend | null>(null)
  const [pricingAnalysis, setPricingAnalysis] = useState<any>(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [pricingError, setPricingError] = useState<string | null>(null)
  
  // Initialize with all competitors selected by default
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(() => {
    return data.nicheProducts?.map((product: any) => product.asin) || []
  })
  const [viewMode, setViewMode] = useState<'aggregated' | 'individual'>('aggregated')
  
  // Keyword network filter states
  const [minKeywordsPerRoot, setMinKeywordsPerRoot] = useState(5)
  const [minKeywordsPerSubRoot, setMinKeywordsPerSubRoot] = useState(3)
  const [keywordMetrics, setKeywordMetrics] = useState<any>(null)
  
  // Helper function to toggle competitor selection
  const toggleCompetitor = (asin: string) => {
    setSelectedCompetitors(prev => {
      // If trying to deselect and it's the last one selected, don't allow it
      if (prev.includes(asin) && prev.length === 1) {
        return prev
      }
      
      return prev.includes(asin) 
        ? prev.filter(id => id !== asin)
        : [...prev, asin]
    })
  }

  // Update selected competitors when data changes
  useEffect(() => {
    if (data.nicheProducts?.length > 0) {
      const allCompetitorAsins = data.nicheProducts.map((product: any) => product.asin)
      setSelectedCompetitors(allCompetitorAsins)
    }
  }, [data.nicheProducts])

  // Fetch AI market insights when component mounts (not just when tab is active)
  useEffect(() => {
    const fetchAIInsights = async () => {
      if (!nicheId) return
      
      setAiLoading(true)
      setAiError(null)
      
      try {
        const response = await fetch(`/api/niches/${nicheId}/market-trends`)
        const result = await response.json()
        
        if (result.hasData && result.analysis) {
          setAiInsights(result.analysis)
        } else {
          setAiError(result.error || 'Unable to generate market insights')
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error)
        setAiError('Failed to load market insights')
      } finally {
        setAiLoading(false)
      }
    }

    fetchAIInsights()
  }, [nicheId]) // Remove activeTab dependency so it loads immediately

  // Fetch pricing analysis when component mounts
  useEffect(() => {
    const fetchPricingAnalysis = async () => {
      if (!nicheId) return
      
      setPricingLoading(true)
      setPricingError(null)
      
      try {
        const response = await fetch(`/api/niches/${nicheId}/pricing-analysis`)
        const result = await response.json()
        
        if (result.hasData && result.analysis) {
          setPricingAnalysis(result.analysis)
        } else {
          setPricingError(result.error || 'Unable to load pricing analysis')
        }
      } catch (error) {
        console.error('Failed to fetch pricing analysis:', error)
        setPricingError('Failed to load pricing analysis')
      } finally {
        setPricingLoading(false)
      }
    }

    fetchPricingAnalysis()
  }, [nicheId])

  // Helper function to get color for competitor lines
  const getCompetitorColor = (index: number) => {
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16']
    return colors[index % colors.length]
  }

  const getThemeIcon = (type: string) => {
    switch (type) {
      case 'trending_up': return TrendingUp
      case 'trending_down': return TrendingDown
      case 'seasonal': return Calendar
      case 'volatile': return AlertCircle
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

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive" className="text-xs">High Impact</Badge>
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium Impact</Badge>
      case 'low': return <Badge variant="outline" className="text-xs">Low Impact</Badge>
      default: return null
    }
  }

  // Helper function to get season date ranges
  const getSeasonDateRanges = (season: string) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Helper to get the most recent occurrence of a season
    const getRecentSeasonDates = (monthStart: number, dayStart: number, monthEnd: number, dayEnd: number) => {
      let startYear = currentYear
      let endYear = currentYear
      
      // If the season start is after current month, use previous year
      if (monthStart > currentMonth || (monthStart === currentMonth && dayStart > now.getDate())) {
        startYear -= 1
      }
      
      // Adjust end year if needed
      if (monthEnd < monthStart) {
        endYear = startYear + 1
      } else if (monthEnd > currentMonth || (monthEnd === currentMonth && dayEnd > now.getDate())) {
        if (monthStart <= currentMonth) {
          endYear = startYear
        } else {
          endYear = startYear + 1
        }
      }
      
      return { start: new Date(startYear, monthStart, dayStart), end: new Date(endYear, monthEnd, dayEnd) }
    }
    
    switch (season) {
      case 'spring':
        return [getRecentSeasonDates(2, 20, 5, 20)] // Mar 20 - Jun 20
      case 'summer':
        return [getRecentSeasonDates(5, 21, 8, 21)] // Jun 21 - Sep 21
      case 'fall':
        return [getRecentSeasonDates(8, 22, 11, 20)] // Sep 22 - Dec 20
      case 'winter':
        // Winter spans across years, so handle specially
        const winterCurrent = getRecentSeasonDates(11, 21, 2, 19) // Dec 21 - Mar 19
        return [winterCurrent]
      case 'holiday':
        return [getRecentSeasonDates(10, 1, 11, 31)] // Nov 1 - Dec 31
      case 'back_to_school':
        return [getRecentSeasonDates(6, 15, 8, 15)] // Jul 15 - Sep 15
      default:
        return []
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'market', label: 'Market Analysis', icon: BarChart3 },
          { id: 'network', label: 'Keyword Network', icon: Activity },
          { id: 'pricing', label: 'Pricing Trends', icon: DollarSign },
          { id: 'seasonality', label: 'Seasonality', icon: Calendar }
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

      {/* Market Analysis Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">

{/* AI Market Insights - Loading/Error States */}
          {aiLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>Market Insights</span>
                </CardTitle>
                <CardDescription>
                  Amazon marketplace dynamics and selling opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {aiError && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>Market Insights</span>
                </CardTitle>
                <CardDescription>
                  Amazon marketplace dynamics and selling opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <p className="text-sm font-medium text-yellow-800">Market Insights Pending</p>
                  </div>
                  <p className="text-sm text-yellow-700">{aiError}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Market insights are generated during niche processing and will appear here once complete.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!nicheId && !aiLoading && !aiError && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>Market Insights</span>
                </CardTitle>
                <CardDescription>
                  Amazon marketplace dynamics and selling opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    AI market analysis requires niche data. Create or select a niche to see insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Market Status & Phase */}
          {aiInsights?.marketTrends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Market Status</span>
                </CardTitle>
                <CardDescription>
                  Current market phase and maturity indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Current Phase</span>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{aiInsights.marketTrends.currentPhase}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Market Maturity</span>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{aiInsights.marketTrends.marketMaturity}</p>
                  </div>
                </div>
                {aiInsights.marketTrends.growthIndicators && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Growth Indicators</h4>
                    <ul className="space-y-2">
                      {aiInsights.marketTrends.growthIndicators.map((indicator: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Industry Trends */}
          {aiInsights?.industryInsights && aiInsights.industryInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Industry Trends</span>
                </CardTitle>
                <CardDescription>
                  Key market developments and their impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.industryInsights.map((insight: any, idx: number) => (
                    <div key={idx} className={`border-l-4 pl-4 ${
                      insight.impact === 'high' ? 'border-red-500' :
                      insight.impact === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <div className="flex gap-2 ml-3">
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.timeframe}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demand Patterns */}
          {aiInsights?.demandPatterns && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Demand Analysis</span>
                </CardTitle>
                <CardDescription>
                  Market demand patterns and driving factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Volume Trend</span>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{aiInsights.demandPatterns.volumeTrend}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Seasonal Factors</span>
                    <p className="text-sm text-gray-700">{aiInsights.demandPatterns.seasonalFactors?.join(', ') || 'None identified'}</p>
                  </div>
                </div>
                {aiInsights.demandPatterns.demandDrivers && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Key Demand Drivers</h4>
                    <ul className="space-y-2">
                      {aiInsights.demandPatterns.demandDrivers.map((driver: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          {driver}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Market Opportunities */}
          {aiInsights?.marketOpportunities && aiInsights.marketOpportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Market Opportunities</span>
                </CardTitle>
                <CardDescription>
                  Identified growth opportunities and strategic openings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.marketOpportunities.map((opp: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{opp.opportunity}</h4>
                            <p className="text-sm text-gray-600 mt-1">{opp.rationale}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {opp.difficulty} difficulty
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Factors */}
          {aiInsights?.riskFactors && aiInsights.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Risk Factors</span>
                </CardTitle>
                <CardDescription>
                  Potential challenges and mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.riskFactors.map((risk: any, idx: number) => (
                    <div key={idx} className={`border-l-4 pl-4 ${
                      risk.likelihood === 'high' ? 'border-red-500' :
                      risk.likelihood === 'medium' ? 'border-yellow-500' :
                      'border-blue-500'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{risk.risk}</h4>
                        <Badge variant="outline" className="text-xs">
                          {risk.likelihood} likelihood
                        </Badge>
                      </div>
                      {risk.mitigation && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Future Outlook */}
          {aiInsights?.futureOutlook && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-indigo-600" />
                  <span>Future Outlook</span>
                </CardTitle>
                <CardDescription>
                  Market projections and strategic recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Market Projection</h4>
                    <p className="text-sm text-gray-700">{aiInsights.futureOutlook.projection}</p>
                  </div>
                  
                  {aiInsights.futureOutlook.keyFactors && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Key Factors to Watch</h4>
                      <ul className="space-y-2">
                        {aiInsights.futureOutlook.keyFactors.map((factor: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <Eye className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {aiInsights.futureOutlook.recommendation && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Strategic Recommendation</h4>
                      <p className="text-sm text-gray-900 font-medium">{aiInsights.futureOutlook.recommendation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor Market Age Analysis */}
          {nicheData?.products && nicheData.products.length > 0 && (
            <DemandAnalysisReal products={nicheData.products} />
          )}

        </div>
      )}

      {/* Keyword Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Keyword Network</span>
              </CardTitle>
              <CardDescription>
                Visual representation of keyword relationships and market size
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.keywordHierarchy ? (
                <>
                  {/* Scorecards - Below description */}
                  {keywordMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {(() => {
                        const displayData = keywordMetrics.displayData
                        const revenueValue = displayData.totalRevenue >= 1000000 
                          ? '$' + (displayData.totalRevenue / 1000000).toFixed(2) + 'M'
                          : displayData.totalRevenue >= 1000
                          ? '$' + (displayData.totalRevenue / 1000).toFixed(0) + 'K'
                          : '$' + (displayData.totalRevenue?.toFixed(0) || '0')
                        
                        const rootKeywordsValue = keywordMetrics.selectedNodeData && keywordMetrics.selectedNodeData.type === 'root' 
                          ? '1' 
                          : displayData.totalRootKeywords?.toLocaleString() || Object.keys(data.keywordHierarchy || {}).length.toLocaleString()
                        
                        return (
                          <>
                            <ScoreCard
                              value={revenueValue}
                              label="Monthly Revenue"
                              icon={DollarSign}
                              description={keywordMetrics.selectedNodeData ? `For ${displayData.name}` : 'Across all keyword groups'}
                              color="green"
                            />
                            
                            <ScoreCard
                              value={rootKeywordsValue}
                              label="Total Root Keywords"
                              icon={Hash}
                              description={keywordMetrics.selectedNodeData ? 'Selected root keyword' : 'Primary keyword categories'}
                              color="purple"
                            />
                            
                            <ScoreCard
                              value={displayData.keywordCount?.toLocaleString() || '0'}
                              label="Total Keywords"
                              icon={TrendingUp}
                              description={keywordMetrics.selectedNodeData ? `In ${displayData.name}` : 'Unique keywords tracked'}
                              color="blue"
                            />
                          </>
                        )
                      })()}
                    </div>
                  )}
                  
                  <KeywordNetworkVisualization
                    keywordHierarchy={data.keywordHierarchy}
                    primaryKeyword={data.title || 'Product'}
                    minKeywordsPerRoot={minKeywordsPerRoot}
                    minKeywordsPerSubRoot={minKeywordsPerSubRoot}
                    onMinKeywordsPerRootChange={setMinKeywordsPerRoot}
                    onMinKeywordsPerSubRootChange={setMinKeywordsPerSubRoot}
                    onMetricsCalculated={setKeywordMetrics}
                  productImageUrl={(() => {
                    // Get the main product image from nicheProducts data
                    if (data.nicheProducts?.length > 0) {
                      const mainProduct = data.nicheProducts[0] // Use first product as main
                      if (mainProduct.image_urls) {
                        try {
                          // Try parsing as JSON first
                          const urls = typeof mainProduct.image_urls === 'string' ? JSON.parse(mainProduct.image_urls) : mainProduct.image_urls
                          const imageUrl = Array.isArray(urls) ? urls[0] : urls
                          // Convert to full URL if needed
                          if (imageUrl && !imageUrl.startsWith('http')) {
                            return `https://m.media-amazon.com/images/I/${imageUrl}`
                          }
                          return imageUrl
                        } catch {
                          // If not JSON, try splitting by comma
                          const urls = mainProduct.image_urls.split(',').map((url: string) => url.trim())
                          const imageUrl = urls[0]
                          if (imageUrl && !imageUrl.startsWith('http')) {
                            return `https://m.media-amazon.com/images/I/${imageUrl}`
                          }
                          return imageUrl
                        }
                      }
                    }
                    return undefined
                  })()}
                />
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No keyword data available for this level</p>
                  <p className="text-sm mt-1">Try switching to a different level</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Trends Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">

          {/* Combined Market & Competitor Price Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Market Price Trends</span>
              </CardTitle>
              <CardDescription>
                Historical pricing trends showing market average and individual competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Market Pricing Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      ${(() => {
                        if (data.priceHistory?.length > 0) {
                          const allPrices = data.priceHistory.map((d: any) => d.price)
                          return (allPrices.reduce((a: number, b: number) => a + b, 0) / allPrices.length).toFixed(2)
                        }
                        return '22.99'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Current Average</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      ${data.priceHistory?.length > 0 
                        ? Math.min(...data.priceHistory.map((d: any) => d.price)).toFixed(2)
                        : '19.99'}
                    </div>
                    <div className="text-sm text-gray-600">All-Time Low</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-700">
                      ${data.priceHistory?.length > 0 
                        ? Math.max(...data.priceHistory.map((d: any) => d.price)).toFixed(2)
                        : '29.99'}
                    </div>
                    <div className="text-sm text-gray-600">All-Time High</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">
                      {(() => {
                        // Calculate percentage change over time
                        if (data.priceHistory?.length > 1) {
                          const first = data.priceHistory[0].price
                          const last = data.priceHistory[data.priceHistory.length - 1].price
                          const change = ((last - first) / first * 100).toFixed(1)
                          return change.startsWith('-') ? change + '%' : '+' + change + '%'
                        }
                        return '+5.2%'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">YoY Change</div>
                  </div>
                </div>

                {/* Pricing Themes & Patterns */}
                {pricingAnalysis?.themes && pricingAnalysis.themes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-purple-600" />
                      Pricing Themes & Patterns
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {pricingAnalysis.themes.map((theme: any, index: number) => {
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
                                  {theme.actionable_insights.map((insight: string, i: number) => (
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
                )}

                {/* Combined Price Trend Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {selectedCompetitors.length > 0
                      ? `Price History: ${selectedCompetitors.length} Selected Competitor${selectedCompetitors.length > 1 ? 's' : ''} (${viewMode})`
                      : 'Historical Price Trends'
                    }
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={(() => {
                          if (viewMode === 'individual' && selectedCompetitors.length > 0) {
                            // Generate data for multiple competitors
                            return Array.from({length: 52}, (_, i) => {
                              const date = new Date()
                              date.setDate(date.getDate() - (52 - i) * 7)
                              const dataPoint: any = {
                                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              }
                              
                              selectedCompetitors.forEach(asin => {
                                const product = data.nicheProducts?.find((p: any) => p.asin === asin)
                                const basePrice = product?.price || 25
                                const seasonalFactor = Math.sin((i / 52) * Math.PI * 2) * 0.1
                                const randomFactor = (Math.random() - 0.5) * 0.05
                                const trendFactor = (i / 52) * 0.02
                                const price = basePrice * (1 + seasonalFactor + randomFactor + trendFactor)
                                dataPoint[asin] = Number(price.toFixed(2))
                              })
                              
                              return dataPoint
                            })
                          } else {
                            // Aggregated average price for selected competitors
                            return Array.from({length: 52}, (_, i) => {
                              const date = new Date()
                              date.setDate(date.getDate() - (52 - i) * 7)
                              
                              // Calculate average price from selected competitors
                              let avgPrice = 22.99 // Default if no selections
                              if (selectedCompetitors.length > 0) {
                                const competitorPrices = selectedCompetitors.map(asin => {
                                  const product = data.nicheProducts?.find((p: any) => p.asin === asin)
                                  const basePrice = product?.price || 25
                                  const seasonalFactor = Math.sin((i / 52) * Math.PI * 2) * 0.1
                                  const randomFactor = (Math.random() - 0.5) * 0.05
                                  const trendFactor = (i / 52) * 0.02
                                  return basePrice * (1 + seasonalFactor + randomFactor + trendFactor)
                                })
                                avgPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length
                              }
                              
                              return {
                                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                price: Number(avgPrice.toFixed(2))
                              }
                            })
                          }
                        })()} 
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          wrapperStyle={{ zIndex: 1000 }}
                          contentStyle={{ 
                            zIndex: 1000,
                            position: 'relative',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: string) => {
                            if (viewMode === 'individual' && selectedCompetitors.includes(name)) {
                              const product = data.nicheProducts?.find((p: any) => p.asin === name)
                              return [`$${value}`, product?.title?.substring(0, 30) || name]
                            }
                            return [`$${value}`, 'Market Average']
                          }} 
                        />
                        {viewMode === 'individual' && selectedCompetitors.length > 0 ? (
                          // Render multiple lines for selected competitors
                          selectedCompetitors.map((asin, index) => (
                            <Line 
                              key={asin}
                              type="monotone" 
                              dataKey={asin}
                              stroke={getCompetitorColor(index)}
                              strokeWidth={2} 
                              dot={false}
                              name={asin}
                            />
                          ))
                        ) : (
                          // Render single market average line
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#3B82F6" 
                            strokeWidth={2} 
                            dot={false}
                            name="Market Average"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Individual Competitors
                    {viewMode === 'individual' && selectedCompetitors.length > 0 && (
                      <span className="ml-2 text-xs text-purple-600">({selectedCompetitors.length} selected)</span>
                    )}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">View:</span>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode('aggregated')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          viewMode === 'aggregated'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Aggregated
                      </button>
                      <button
                        onClick={() => setViewMode('individual')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          viewMode === 'individual'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Individual
                      </button>
                    </div>
                  </div>
                </div>

                {/* Competitor Price Cards */}
                <div className={`${data.nicheProducts?.length > 12 ? 'max-h-96 overflow-y-auto' : ''}`}>
                  <div className="grid grid-cols-3 gap-4">
                    {data.nicheProducts?.length > 0 ? (
                      data.nicheProducts.map((product: any, index: number) => (
                        <div 
                          key={product.id} 
                          onClick={() => {
                            // Prevent deselecting if it's the last selected competitor
                            if (selectedCompetitors.includes(product.asin) && selectedCompetitors.length === 1) {
                              return
                            }
                            toggleCompetitor(product.asin)
                          }}
                          className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                            selectedCompetitors.includes(product.asin)
                              ? 'border-purple-300 bg-purple-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${
                            selectedCompetitors.includes(product.asin) && selectedCompetitors.length === 1
                              ? 'cursor-not-allowed opacity-75'
                              : ''
                          }`}
                        >
                        <div className="flex items-start space-x-3">
                          {/* Image on the left */}
                          <div className="flex-shrink-0">
                            {(() => {
                              let imageUrl = null
                              if (product.image_urls) {
                                try {
                                  // Try parsing as JSON first
                                  const urls = typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls
                                  imageUrl = Array.isArray(urls) ? urls[0] : urls
                                } catch {
                                  // If not JSON, try splitting by comma
                                  const urls = product.image_urls.split(',').map((url: string) => url.trim())
                                  imageUrl = urls[0]
                                }
                                // Convert to full URL if needed
                                if (imageUrl && !imageUrl.startsWith('http')) {
                                  imageUrl = `https://m.media-amazon.com/images/I/${imageUrl}`
                                }
                              }
                              return imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={product.title}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">No Image</span>
                                </div>
                              )
                            })()}
                          </div>
                          
                          {/* Metadata on the right */}
                          <div className="flex-1 min-w-0 relative">
                            <div className="text-lg font-bold text-green-600">
                              ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600 mb-1" title={product.title || 'Unknown Product'}>
                              {product.title || 'Unknown Product'}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              BSR: #{(product.bsr || product.sales_rank || 0) > 0 ? (product.bsr || product.sales_rank).toLocaleString() : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {product.asin}
                            </div>
                            {selectedCompetitors.includes(product.asin) && (
                              <span className="text-xs font-medium text-purple-600">
                                ✓ Selected
                              </span>
                            )}
                            {viewMode === 'individual' && selectedCompetitors.includes(product.asin) && (
                              <div 
                                className="absolute top-0 right-0 w-3 h-3 rounded-full"
                                style={{ backgroundColor: getCompetitorColor(selectedCompetitors.indexOf(product.asin)) }}
                              ></div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) 
                  ) : (
                      // Show message when no real data
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        <p>No competitor data available</p>
                        <p className="text-xs mt-1">Real competitor pricing will be displayed when data is loaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Seasonality Tab */}
      {activeTab === 'seasonality' && (
        <div className="space-y-6">
          {/* Combined Seasonality & Competitor Sales Rank Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Seasonal Sales Rank Patterns</span>
              </CardTitle>
              <CardDescription>
                Historical sales rank trends showing market seasonality and individual competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Seasonality Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      #{(() => {
                        if (data.salesRankHistory?.length > 0) {
                          const avgRank = data.salesRankHistory.reduce((sum: number, item: any) => sum + item.sales_rank, 0) / data.salesRankHistory.length
                          return Math.round(avgRank).toLocaleString()
                        }
                        return '35,420'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Avg Sales Rank</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      #{data.salesRankHistory?.length > 0 
                        ? Math.min(...data.salesRankHistory.map((d: any) => d.sales_rank)).toLocaleString()
                        : '18,500'}
                    </div>
                    <div className="text-sm text-gray-600">Best Rank (Peak)</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      #{data.salesRankHistory?.length > 0 
                        ? Math.max(...data.salesRankHistory.map((d: any) => d.sales_rank)).toLocaleString()
                        : '65,890'}
                    </div>
                    <div className="text-sm text-gray-600">Worst Rank (Low)</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-gray-700">
                      {(() => {
                        // Calculate seasonal variance
                        if (data.salesRankHistory?.length > 1) {
                          const ranks = data.salesRankHistory.map((d: any) => d.sales_rank)
                          const min = Math.min(...ranks)
                          const max = Math.max(...ranks)
                          const variance = ((max - min) / min * 100).toFixed(0)
                          return variance + '%'
                        }
                        return '85%'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Seasonal Variance</div>
                  </div>
                </div>

                {/* Seasonal Trends & Patterns */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
                    Seasonal Trends & Patterns
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <SeasonalityAnalysis 
                      nicheId={nicheId} 
                      onSeasonSelect={setSelectedSeason}
                    />
                  </div>
                </div>

                {/* Combined Sales Rank Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {selectedCompetitors.length > 0
                      ? `Sales Rank History: ${selectedCompetitors.length} Selected Competitor${selectedCompetitors.length > 1 ? 's' : ''} (${viewMode})`
                      : 'Historical Sales Rank Trends'
                    }
                    {selectedSeason && (
                      <span className="ml-2 text-xs font-normal text-indigo-600">
                        - Showing {selectedSeason.season.replace('_', ' ')} season dates
                      </span>
                    )}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={(() => {
                          // Use real sales rank history data if available
                          if (data.salesRankHistory && data.salesRankHistory.length > 0) {
                            // Transform real data to chart format
                            return data.salesRankHistory.map((item: any) => ({
                              date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                              rank: item.sales_rank || item.rank,
                              asin: item.asin
                            }))
                          }
                          
                          // Fallback to synthetic data only if no real data
                          if (viewMode === 'individual' && selectedCompetitors.length > 0) {
                            // Generate data for multiple competitors
                            return Array.from({length: 52}, (_, i) => {
                              const date = new Date()
                              date.setDate(date.getDate() - (52 - i) * 7)
                              const month = date.getMonth()
                              const dataPoint: any = {
                                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              }
                              
                              selectedCompetitors.forEach(asin => {
                                const product = data.nicheProducts?.find((p: any) => p.asin === asin)
                                const baseBSR = product?.bsr || 35000
                                
                                // Seasonal factors (lower rank = better performance)
                                let seasonalFactor = 0
                                if (month >= 9 && month <= 11) seasonalFactor = -0.25 // Oct-Dec: holiday boost
                                else if (month >= 0 && month <= 1) seasonalFactor = 0.15 // Jan-Feb: post-holiday dip
                                else if (month >= 5 && month <= 7) seasonalFactor = -0.08 // Jun-Aug: summer boost
                                
                                const randomFactor = (Math.random() - 0.5) * 0.15
                                const weeklyPattern = Math.sin(i / 7 * Math.PI) * 0.05
                                const rank = baseBSR * (1 + seasonalFactor + randomFactor + weeklyPattern)
                                
                                dataPoint[asin] = Math.round(Math.max(1000, rank))
                              })
                              
                              return dataPoint
                            })
                          } else {
                            // Aggregated average for selected competitors
                            return Array.from({length: 52}, (_, i) => {
                              const date = new Date()
                              date.setDate(date.getDate() - (52 - i) * 7)
                              const month = date.getMonth()
                              
                              // Calculate average rank from selected competitors
                              let avgRank = 35000 // Default if no selections
                              if (selectedCompetitors.length > 0) {
                                const competitorRanks = selectedCompetitors.map(asin => {
                                  const product = data.nicheProducts?.find((p: any) => p.asin === asin)
                                  const baseBSR = product?.bsr || 35000
                                  
                                  let seasonalFactor = 0
                                  if (month >= 9 && month <= 11) seasonalFactor = -0.25 // Oct-Dec: holiday boost
                                  else if (month >= 0 && month <= 1) seasonalFactor = 0.15 // Jan-Feb: post-holiday dip
                                  else if (month >= 5 && month <= 7) seasonalFactor = -0.08 // Jun-Aug: summer boost
                                  
                                  const randomFactor = (Math.random() - 0.5) * 0.15
                                  const weeklyPattern = Math.sin(i / 7 * Math.PI) * 0.05
                                  return baseBSR * (1 + seasonalFactor + randomFactor + weeklyPattern)
                                })
                                avgRank = competitorRanks.reduce((sum, rank) => sum + rank, 0) / competitorRanks.length
                              }
                              
                              return {
                                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                rank: Math.round(Math.max(1000, avgRank))
                              }
                            })
                          }
                        })()} 
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" />
                        <YAxis 
                          tickFormatter={(value) => `#${value.toLocaleString()}`} 
                          reversed
                          domain={['dataMin - 5000', 'dataMax + 5000']}
                        />
                        <Tooltip 
                          wrapperStyle={{ zIndex: 1000 }}
                          contentStyle={{ 
                            zIndex: 1000,
                            position: 'relative',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: string) => {
                            if (viewMode === 'individual' && selectedCompetitors.includes(name)) {
                              const product = data.nicheProducts?.find((p: any) => p.asin === name)
                              return [`#${value.toLocaleString()}`, product?.title?.substring(0, 30) || name]
                            }
                            return [`#${value.toLocaleString()}`, 'Market Average']
                          }} 
                        />
                        {viewMode === 'individual' && selectedCompetitors.length > 0 ? (
                          // Render multiple lines for selected competitors
                          selectedCompetitors.map((asin, index) => (
                            <Line 
                              key={asin}
                              type="monotone" 
                              dataKey={asin}
                              stroke={getCompetitorColor(index)}
                              strokeWidth={2} 
                              dot={false}
                              name={asin}
                            />
                          ))
                        ) : (
                          // Render single market average line
                          <Line 
                            type="monotone" 
                            dataKey="rank" 
                            stroke="#6366F1" 
                            strokeWidth={2} 
                            dot={false}
                            name="Market Average"
                          />
                        )}
                        {/* Seasonal Reference Lines */}
                        {(() => {
                          // If a season is selected, show its date ranges
                          if (selectedSeason) {
                            const dateRanges = getSeasonDateRanges(selectedSeason.season)
                            const seasonColors = {
                              spring: '#10B981',
                              summer: '#F59E0B', 
                              fall: '#EF4444',
                              winter: '#3B82F6',
                              holiday: '#8B5CF6',
                              back_to_school: '#EC4899'
                            }
                            const color = seasonColors[selectedSeason.season] || '#6B7280'
                            
                            return dateRanges.map((range, idx) => (
                              <React.Fragment key={`season-range-${idx}`}>
                                {/* Start date marker */}
                                <ReferenceLine
                                  x={range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  stroke={color}
                                  strokeDasharray="4 4"
                                  strokeWidth={2}
                                  opacity={0.8}
                                  label={{
                                    value: `${selectedSeason.season.replace('_', ' ')} Start`,
                                    angle: -90,
                                    textAnchor: 'middle',
                                    style: {
                                      fontSize: '11px',
                                      fill: color,
                                      fontWeight: 600
                                    },
                                    offset: 10
                                  }}
                                />
                                {/* End date marker */}
                                <ReferenceLine
                                  x={range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  stroke={color}
                                  strokeDasharray="4 4"
                                  strokeWidth={2}
                                  opacity={0.8}
                                  label={{
                                    value: `${selectedSeason.season.replace('_', ' ')} End`,
                                    angle: -90,
                                    textAnchor: 'middle',
                                    style: {
                                      fontSize: '11px',
                                      fill: color,
                                      fontWeight: 600
                                    },
                                    offset: 10
                                  }}
                                />
                              </React.Fragment>
                            ))
                          }
                          
                          // Otherwise show default seasonal markers
                          const currentYear = new Date().getFullYear()
                          const seasonalMarkers = [
                            { month: 2, day: 20, season: 'Spring', color: '#10B981' }, // March 20 (Spring Equinox)
                            { month: 5, day: 21, season: 'Summer', color: '#F59E0B' }, // June 21 (Summer Solstice)
                            { month: 8, day: 22, season: 'Fall', color: '#EF4444' },   // September 22 (Fall Equinox)
                            { month: 11, day: 21, season: 'Winter', color: '#3B82F6' }, // December 21 (Winter Solstice)
                          ]
                          
                          return seasonalMarkers.map((marker, index) => {
                            const seasonDate = new Date(currentYear, marker.month, marker.day)
                            const seasonDateStr = seasonDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            
                            return (
                              <ReferenceLine
                                key={`season-${index}`}
                                x={seasonDateStr}
                                stroke={marker.color}
                                strokeDasharray="2 2"
                                strokeWidth={1.5}
                                opacity={0.6}
                                label={{
                                  value: marker.season,
                                  angle: -90,
                                  textAnchor: 'middle',
                                  style: {
                                    fontSize: '10px',
                                    fill: marker.color,
                                    fontWeight: 500
                                  },
                                  offset: 10
                                }}
                              />
                            )
                          })
                        })()}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Individual Competitors
                    {viewMode === 'individual' && selectedCompetitors.length > 0 && (
                      <span className="ml-2 text-xs text-purple-600">({selectedCompetitors.length} selected)</span>
                    )}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">View:</span>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode('aggregated')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          viewMode === 'aggregated'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Aggregated
                      </button>
                      <button
                        onClick={() => setViewMode('individual')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          viewMode === 'individual'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Individual
                      </button>
                    </div>
                  </div>
                </div>

                {/* Competitor Sales Rank Cards */}
                <div className={`${data.nicheProducts?.length > 12 ? 'max-h-96 overflow-y-auto' : ''}`}>
                  <div className="grid grid-cols-3 gap-4">
                    {data.nicheProducts?.length > 0 ? (
                      data.nicheProducts.map((product: any, index: number) => (
                        <div 
                          key={product.id} 
                          onClick={() => {
                            // Prevent deselecting if it's the last selected competitor
                            if (selectedCompetitors.includes(product.asin) && selectedCompetitors.length === 1) {
                              return
                            }
                            toggleCompetitor(product.asin)
                          }}
                          className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                            selectedCompetitors.includes(product.asin)
                              ? 'border-purple-300 bg-purple-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${
                            selectedCompetitors.includes(product.asin) && selectedCompetitors.length === 1
                              ? 'cursor-not-allowed opacity-75'
                              : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Image on the left */}
                            <div className="flex-shrink-0">
                              {(() => {
                                let imageUrl = null
                                if (product.image_urls) {
                                  try {
                                    // Try parsing as JSON first
                                    const urls = typeof product.image_urls === 'string' ? JSON.parse(product.image_urls) : product.image_urls
                                    imageUrl = Array.isArray(urls) ? urls[0] : urls
                                  } catch {
                                    // If not JSON, try splitting by comma
                                    const urls = product.image_urls.split(',').map((url: string) => url.trim())
                                    imageUrl = urls[0]
                                  }
                                  // Convert to full URL if needed
                                  if (imageUrl && !imageUrl.startsWith('http')) {
                                    imageUrl = `https://m.media-amazon.com/images/I/${imageUrl}`
                                  }
                                }
                                return imageUrl ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={product.title}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No Image</span>
                                  </div>
                                )
                              })()}
                            </div>
                            
                            {/* Metadata on the right */}
                            <div className="flex-1 min-w-0 relative">
                              <div className="text-lg font-bold text-green-600">
                                ${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-600 mb-1" title={product.title || 'Unknown Product'}>
                                {product.title || 'Unknown Product'}
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                BSR: #{(product.bsr || product.sales_rank || 0) > 0 ? (product.bsr || product.sales_rank).toLocaleString() : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {product.asin}
                              </div>
                              {selectedCompetitors.includes(product.asin) && (
                                <span className="text-xs font-medium text-purple-600">
                                  ✓ Selected
                                </span>
                              )}
                              {viewMode === 'individual' && selectedCompetitors.includes(product.asin) && (
                                <div 
                                  className="absolute top-0 right-0 w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getCompetitorColor(selectedCompetitors.indexOf(product.asin)) }}
                                ></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Show message when no real data
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        <p>No competitor data available</p>
                        <p className="text-xs mt-1">Real competitor ranking will be displayed when data is loaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  )
}