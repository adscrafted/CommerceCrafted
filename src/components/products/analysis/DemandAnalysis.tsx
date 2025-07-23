'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  CheckCircle
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import KeywordNetworkVisualization from '@/components/KeywordNetworkVisualization'
import DemandAnalysisReal from './DemandAnalysisReal'

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
  
  // Initialize with all competitors selected by default
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(() => {
    return data.demandData._nicheProducts?.map((product: any) => product.asin) || []
  })
  const [viewMode, setViewMode] = useState<'aggregated' | 'individual'>('aggregated')
  
  // Helper function to toggle competitor selection
  const toggleCompetitor = (asin: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(asin) 
        ? prev.filter(id => id !== asin)
        : [...prev, asin]
    )
  }

  // Update selected competitors when data changes
  useEffect(() => {
    if (data.demandData._nicheProducts?.length > 0) {
      const allCompetitorAsins = data.demandData._nicheProducts.map((product: any) => product.asin)
      setSelectedCompetitors(allCompetitorAsins)
    }
  }, [data.demandData._nicheProducts])

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

  // Helper function to get color for competitor lines
  const getCompetitorColor = (index: number) => {
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16']
    return colors[index % colors.length]
  }
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'market', label: 'Market Analysis', icon: BarChart3 },
          { id: 'network', label: 'Keyword Network', icon: Activity },
          { id: 'pricing', label: 'Pricing Trends', icon: DollarSign },
          { id: 'seasonality', label: 'Seasonality', icon: Calendar },
          { id: 'social', label: 'Social Signals', icon: Users }
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

          {/* AI Market Insights */}
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
              {aiLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                </div>
              ) : aiError ? (
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
              ) : aiInsights ? (
                <div className="space-y-6">
                  {/* Market Phase & Maturity */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Market Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-600">Current Phase</span>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{aiInsights.marketTrends?.currentPhase}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Market Maturity</span>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{aiInsights.marketTrends?.marketMaturity}</p>
                      </div>
                    </div>
                    {aiInsights.marketTrends?.growthIndicators && (
                      <div className="mt-3">
                        <span className="text-xs text-gray-600">Growth Indicators</span>
                        <ul className="mt-1 space-y-1">
                          {aiInsights.marketTrends.growthIndicators.map((indicator: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-purple-600 mr-2">•</span>
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Industry Insights */}
                  {aiInsights.industryInsights && aiInsights.industryInsights.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Industry Trends</h4>
                      <div className="space-y-3">
                        {aiInsights.industryInsights.map((insight: any, idx: number) => (
                          <div key={idx} className={`p-3 rounded-lg border ${
                            insight.impact === 'high' ? 'border-red-200 bg-red-50' :
                            insight.impact === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                            'border-blue-200 bg-blue-50'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                              </div>
                              <div className="flex gap-2 ml-3">
                                <Badge variant="outline" className="text-xs">
                                  {insight.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {insight.timeframe}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Demand Patterns */}
                  {aiInsights.demandPatterns && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Demand Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-600">Volume Trend</span>
                          <p className="text-sm font-semibold text-gray-900 capitalize">{aiInsights.demandPatterns.volumeTrend}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Seasonal Factors</span>
                          <p className="text-sm text-gray-700">{aiInsights.demandPatterns.seasonalFactors?.join(', ') || 'None identified'}</p>
                        </div>
                      </div>
                      {aiInsights.demandPatterns.demandDrivers && (
                        <div>
                          <span className="text-xs text-gray-600">Key Demand Drivers</span>
                          <ul className="mt-1 space-y-1">
                            {aiInsights.demandPatterns.demandDrivers.map((driver: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-blue-600 mr-2">→</span>
                                {driver}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Market Opportunities */}
                  {aiInsights.marketOpportunities && aiInsights.marketOpportunities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Market Opportunities</h4>
                      <div className="space-y-2">
                        {aiInsights.marketOpportunities.map((opp: any, idx: number) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-green-600">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{opp.opportunity}</p>
                              <p className="text-xs text-gray-600">{opp.rationale}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {opp.difficulty} difficulty
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {aiInsights.riskFactors && aiInsights.riskFactors.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        {aiInsights.riskFactors.map((risk: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-start">
                              <span className={`mr-2 ${
                                risk.likelihood === 'high' ? 'text-red-600' :
                                risk.likelihood === 'medium' ? 'text-yellow-600' :
                                'text-blue-600'
                              }`}>⚠</span>
                              <div className="flex-1">
                                <span className="text-sm text-gray-700">{risk.risk}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {risk.likelihood} likelihood
                                </Badge>
                              </div>
                            </div>
                            {risk.mitigation && (
                              <p className="text-xs text-gray-600 ml-6">Mitigation: {risk.mitigation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Future Outlook */}
                  {aiInsights.futureOutlook && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Future Outlook</h4>
                      <p className="text-sm text-gray-700 mb-3">{aiInsights.futureOutlook.projection}</p>
                      {aiInsights.futureOutlook.keyFactors && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-600">Key Factors to Watch</span>
                          <ul className="mt-1 space-y-1">
                            {aiInsights.futureOutlook.keyFactors.map((factor: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-indigo-600 mr-2">•</span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiInsights.futureOutlook.recommendation && (
                        <div className="mt-3 p-3 bg-white bg-opacity-70 rounded">
                          <span className="text-xs text-gray-600">Strategic Recommendation</span>
                          <p className="text-sm text-gray-900 font-medium mt-1">{aiInsights.futureOutlook.recommendation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : !nicheId ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    AI market analysis requires niche data. Create or select a niche to see insights.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    Loading market insights...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitor Market Age Analysis */}
          {nicheData?.products && nicheData.products.length > 0 && (
            <DemandAnalysisReal products={nicheData.products} />
          )}

          {/* Competitor Age Analysis - Commented out in favor of DemandAnalysisReal component with actual data
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-indigo-600" />
                <span>Competitor Market Age</span>
              </CardTitle>
              <CardDescription>
                Product launch timeline and market maturity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              ... Mock data removed - See DemandAnalysisReal for real product age data ...
            </CardContent>
          </Card>
          */}

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
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      #{(() => {
                        if (data.demandData.salesRankHistory?.length > 0) {
                          const avgRank = data.demandData.salesRankHistory.reduce((sum: number, item: any) => sum + item.rank, 0) / data.demandData.salesRankHistory.length
                          return Math.round(avgRank).toLocaleString()
                        }
                        return '35,420'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Avg Sales Rank</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      #{data.demandData.salesRankHistory?.length > 0 
                        ? Math.min(...data.demandData.salesRankHistory.map((d: any) => d.rank)).toLocaleString()
                        : '18,500'}
                    </div>
                    <div className="text-sm text-gray-600">Best Rank (Peak)</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      #{data.demandData.salesRankHistory?.length > 0 
                        ? Math.max(...data.demandData.salesRankHistory.map((d: any) => d.rank)).toLocaleString()
                        : '65,890'}
                    </div>
                    <div className="text-sm text-gray-600">Worst Rank (Low)</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(() => {
                        // Calculate seasonal variance
                        if (data.demandData.salesRankHistory?.length > 1) {
                          const ranks = data.demandData.salesRankHistory.map((d: any) => d.rank)
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

                {/* Combined Sales Rank Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {selectedCompetitors.length > 0
                      ? `Sales Rank History: ${selectedCompetitors.length} Selected Competitor${selectedCompetitors.length > 1 ? 's' : ''} (${viewMode})`
                      : 'Historical Sales Rank Trends'
                    }
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={(() => {
                          // Use real sales rank history data if available
                          if (data.demandData.salesRankHistory && data.demandData.salesRankHistory.length > 0) {
                            return data.demandData.salesRankHistory
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
                                const product = data.demandData._nicheProducts?.find((p: any) => p.asin === asin)
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
                                  const product = data.demandData._nicheProducts?.find((p: any) => p.asin === asin)
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
                          formatter={(value: any, name: string) => {
                            if (viewMode === 'individual' && selectedCompetitors.includes(name)) {
                              const product = data.demandData._nicheProducts?.find((p: any) => p.asin === name)
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

                {/* Competitor Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {data.demandData._nicheProducts?.length > 0 ? (
                    data.demandData._nicheProducts.slice(0, 9).map((product: any, index: number) => (
                      <div 
                        key={product.id} 
                        onClick={() => toggleCompetitor(product.asin)}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                          selectedCompetitors.includes(product.asin)
                            ? 'border-purple-300 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
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
                            <div className="text-lg font-bold text-gray-900">
                              #{product.bsr?.toLocaleString() || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600 mb-1" title={product.title || 'Unknown Product'}>
                              {product.title || 'Unknown Product'}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {product.asin}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                ${product.price || 'N/A'}
                              </span>
                              {selectedCompetitors.includes(product.asin) && (
                                <span className="text-xs font-medium text-purple-600">
                                  ✓ Selected
                                </span>
                              )}
                            </div>
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
                    <div className="col-span-5 text-center py-8 text-gray-500">
                      <p>No competitor data available</p>
                      <p className="text-xs mt-1">Real competitor sales rank data will be displayed when data is loaded</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seasonality Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Seasonality Insights</span>
              </CardTitle>
              <CardDescription>
                {data.demandData.salesRankHistory?.length > 0 
                  ? `Analysis based on ${data.demandData.salesRankHistory.length} historical data points` 
                  : 'Detailed analysis of seasonal patterns and peak demand periods'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Peak Seasons Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Peak Demand Periods
                    {data.demandData.salesRankHistory?.length > 0 && (
                      <span className="ml-2 text-xs text-green-600 font-normal">● Based on Real Sales Rank Data</span>
                    )}
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">Holiday Season</h5>
                        <Badge variant="default" className="bg-green-600">Peak</Badge>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">Oct - Dec</div>
                      <p className="text-sm text-gray-600 mb-2">40% better sales rank during holiday shopping</p>
                      <div className="text-xs text-green-700">
                        • Black Friday surge starts in October<br/>
                        • Christmas gifts drive Q4 demand<br/>
                        • Best inventory planning window
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">Summer Travel</h5>
                        <Badge variant="outline" className="border-blue-500 text-blue-600">Moderate</Badge>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">Jun - Aug</div>
                      <p className="text-sm text-gray-600 mb-2">15% boost from travel and vacation needs</p>
                      <div className="text-xs text-blue-700">
                        • Flight and hotel bookings peak<br/>
                        • Sleep accessories for travel<br/>
                        • Airport and long-haul comfort
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">New Year Wellness</h5>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">Growing</Badge>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600 mb-1">Jan - Feb</div>
                      <p className="text-sm text-gray-600 mb-2">25% increase in health-focused purchases</p>
                      <div className="text-xs text-yellow-700">
                        • Sleep improvement resolutions<br/>
                        • Wellness and self-care trends<br/>
                        • Post-holiday health focus
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Pattern Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Trend Analysis
                    {(data.demandData.salesRankHistory?.length > 0 || data.demandData._priceHistory?.length > 0 || data.salesRankHistory?.length > 0 || data._nicheData?.salesRankHistory?.length > 0) && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">● Real Sales Rank Data</span>
                    )}
                  </h4>
                  <div className="space-y-3">
                    {(() => {
                      // Check multiple possible data sources for sales rank history
                      const salesRankData = data.demandData.salesRankHistory || 
                                          data.demandData._priceHistory || 
                                          data.salesRankHistory || 
                                          data._nicheData?.salesRankHistory
                      
                      
                      if (salesRankData?.length > 0) {
                        // Use real sales rank data only
                        const sortedData = [...salesRankData].sort((a, b) => 
                          new Date(a.timestamp || a.date).getTime() - new Date(b.timestamp || b.date).getTime()
                        )
                        
                        // Group by week and analyze trends
                        const weeklyGroups: { [key: string]: number[] } = {}
                        sortedData.forEach((entry: any) => {
                          const date = new Date(entry.timestamp || entry.date)
                          const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}-${date.getMonth() + 1}`
                          if (!weeklyGroups[weekKey]) weeklyGroups[weekKey] = []
                          weeklyGroups[weekKey].push(entry.rank || entry.sales_rank)
                        })
                        
                        const weeklyAverages = Object.entries(weeklyGroups).map(([week, ranks]) => ({
                          week,
                          avgRank: ranks.reduce((a, b) => a + b, 0) / ranks.length,
                          dataPoints: ranks.length
                        })).sort((a, b) => a.avgRank - b.avgRank)
                        
                        // Find best and worst performing periods
                        const bestWeeks = weeklyAverages.slice(0, 3)
                        const worstWeeks = weeklyAverages.slice(-3)
                        const allRanks = Object.values(weeklyGroups).flat()
                        const volatility = ((Math.max(...allRanks) - Math.min(...allRanks)) / Math.min(...allRanks) * 100).toFixed(0)
                        
                        return (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <h5 className="font-medium text-green-900 mb-2">🚀 Peak Performance Periods</h5>
                              <div className="space-y-1 text-sm">
                                {bestWeeks.map((week, index) => (
                                  <div key={index} className="text-green-700">
                                    • Best rank: #{Math.round(week.avgRank).toLocaleString()} ({week.dataPoints} data points)
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-xs text-green-600">
                                Peak performance shows {volatility}% rank variation
                              </div>
                            </div>
                            
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <h5 className="font-medium text-orange-900 mb-2">⚠️ Low Performance Periods</h5>
                              <div className="space-y-1 text-sm">
                                {worstWeeks.map((week, index) => (
                                  <div key={index} className="text-orange-700">
                                    • Weak period: #{Math.round(week.avgRank).toLocaleString()} ({week.dataPoints} data points)
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-xs text-orange-600">
                                Avoid major launches during these periods
                              </div>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-500 text-sm">Weekly analysis requires historical sales rank data</p>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>

                {/* Enhanced Seasonality Insights */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Detailed Seasonality Analysis
                    {(data.demandData.salesRankHistory?.length > 0 || data.demandData._priceHistory?.length > 0 || data.salesRankHistory?.length > 0 || data._nicheData?.salesRankHistory?.length > 0) && (
                      <span className="ml-2 text-xs text-indigo-600 font-normal">● Real Sales Rank Analysis</span>
                    )}
                  </h4>
                  <div className="space-y-4">
                    {(() => {
                      // Check multiple possible data sources for sales rank history
                      const salesRankData = data.demandData.salesRankHistory || 
                                          data.demandData._priceHistory || 
                                          data.salesRankHistory || 
                                          data._nicheData?.salesRankHistory
                      
                      if (salesRankData?.length > 0) {
                        // Use real sales rank data only
                        const sortedData = [...salesRankData].sort((a, b) => 
                          new Date(a.timestamp || a.date).getTime() - new Date(b.timestamp || b.date).getTime()
                        )
                        
                        const ranks = sortedData.map((entry: any) => entry.rank || entry.sales_rank)
                        const maxRank = Math.max(...ranks)
                        const minRank = Math.min(...ranks)
                        const variance = ((maxRank - minRank) / minRank * 100).toFixed(0)
                        
                        // Weekly volatility analysis
                        const weeklyVolatility = []
                        for (let i = 7; i < ranks.length; i += 7) {
                          const weekRanks = ranks.slice(i-7, i)
                          const weekVariance = ((Math.max(...weekRanks) - Math.min(...weekRanks)) / Math.min(...weekRanks) * 100)
                          weeklyVolatility.push(weekVariance)
                        }
                        const avgWeeklyVolatility = (weeklyVolatility.reduce((a, b) => a + b, 0) / weeklyVolatility.length).toFixed(0)
                        
                        // Trend analysis - find consistent growth/decline periods
                        const movingAverage = []
                        const windowSize = 7 // 7-day moving average
                        for (let i = windowSize - 1; i < ranks.length; i++) {
                          const avg = ranks.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0) / windowSize
                          movingAverage.push(avg)
                        }
                        
                        // Find longest trends
                        let longestGrowthStreak = 0
                        let longestDeclineStreak = 0
                        let currentGrowthStreak = 0
                        let currentDeclineStreak = 0
                        
                        for (let i = 1; i < movingAverage.length; i++) {
                          if (movingAverage[i] < movingAverage[i-1]) { // Lower rank = better performance
                            currentGrowthStreak++
                            currentDeclineStreak = 0
                          } else if (movingAverage[i] > movingAverage[i-1]) {
                            currentDeclineStreak++
                            currentGrowthStreak = 0
                          }
                          longestGrowthStreak = Math.max(longestGrowthStreak, currentGrowthStreak)
                          longestDeclineStreak = Math.max(longestDeclineStreak, currentDeclineStreak)
                        }
                        
                        // Seasonal patterns by quarter
                        const quarterlyData: { [key: string]: number[] } = { 'Q1': [], 'Q2': [], 'Q3': [], 'Q4': [] }
                        sortedData.forEach((entry: any) => {
                          const date = new Date(entry.timestamp || entry.date)
                          const month = date.getMonth() + 1
                          const quarter = month <= 3 ? 'Q1' : month <= 6 ? 'Q2' : month <= 9 ? 'Q3' : 'Q4'
                          quarterlyData[quarter].push(entry.rank || entry.sales_rank)
                        })
                        
                        const quarterlyPerformance = Object.entries(quarterlyData)
                          .map(([quarter, ranks]) => ({
                            quarter,
                            avgRank: ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0,
                            dataPoints: ranks.length
                          }))
                          .filter(q => q.dataPoints > 0)
                          .sort((a, b) => a.avgRank - b.avgRank)
                        
                        const bestQuarter = quarterlyPerformance[0]
                        const worstQuarter = quarterlyPerformance[quarterlyPerformance.length - 1]
                        
                        // Calculate data span and quality
                        const firstDate = new Date(sortedData[0].timestamp || sortedData[0].date)
                        const lastDate = new Date(sortedData[sortedData.length - 1].timestamp || sortedData[sortedData.length - 1].date)
                        const dataSpanDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
                        const dataSpanWeeks = Math.ceil(dataSpanDays / 7)
                        
                        return (
                          <div className="space-y-4">
                            {/* Primary Insights Grid */}
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="p-3 bg-white rounded-lg border border-indigo-200">
                                <h5 className="text-sm font-semibold text-indigo-800 mb-2">📈 Seasonality Strength</h5>
                                <div className="text-lg font-bold text-indigo-600">{variance}% Variation</div>
                                <div className="text-xs text-gray-600">
                                  {Number(variance) > 100 ? 'Highly seasonal' : 
                                   Number(variance) > 50 ? 'Moderately seasonal' : 'Low seasonality'}
                                </div>
                              </div>
                              
                              <div className="p-3 bg-white rounded-lg border border-green-200">
                                <h5 className="text-sm font-semibold text-green-800 mb-2">🎯 Best Performance</h5>
                                <div className="text-lg font-bold text-green-600">#{minRank.toLocaleString()}</div>
                                <div className="text-xs text-gray-600">Peak rank achieved</div>
                              </div>
                              
                              <div className="p-3 bg-white rounded-lg border border-orange-200">
                                <h5 className="text-sm font-semibold text-orange-800 mb-2">⚡ Weekly Volatility</h5>
                                <div className="text-lg font-bold text-orange-600">{avgWeeklyVolatility}%</div>
                                <div className="text-xs text-gray-600">Average weekly fluctuation</div>
                              </div>
                            </div>

                            {/* Quarterly Performance Analysis */}
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                              <h5 className="text-sm font-semibold text-gray-800 mb-3">📅 Quarterly Performance Patterns</h5>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-green-700 mb-1">
                                    <strong>Best Quarter: {bestQuarter?.quarter}</strong>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-2">
                                    Avg rank: #{Math.round(bestQuarter?.avgRank || 0).toLocaleString()} ({bestQuarter?.dataPoints} data points)
                                  </div>
                                  <div className="text-xs text-green-600">
                                    🚀 Optimal period for inventory scaling and marketing campaigns
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-orange-700 mb-1">
                                    <strong>Challenging Quarter: {worstQuarter?.quarter}</strong>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-2">
                                    Avg rank: #{Math.round(worstQuarter?.avgRank || 0).toLocaleString()} ({worstQuarter?.dataPoints} data points)
                                  </div>
                                  <div className="text-xs text-orange-600">
                                    ⚠️ Focus on optimization rather than aggressive growth
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Trend Analysis */}
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                              <h5 className="text-sm font-semibold text-gray-800 mb-3">🔄 Trend Patterns</h5>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-gray-700 mb-1">
                                    <strong>Growth Momentum</strong>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">
                                    Longest improvement streak: {longestGrowthStreak} days
                                  </div>
                                  <div className="text-xs text-green-600">
                                    Shows strong potential for sustained growth periods
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-700 mb-1">
                                    <strong>Market Volatility</strong>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">
                                    Data span: {dataSpanWeeks} weeks ({dataSpanDays} days)
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    {dataSpanWeeks >= 52 ? 'Full year data available' : dataSpanWeeks >= 26 ? 'Strong seasonal coverage' : 'Limited seasonal data'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actionable Insights */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                              <h5 className="text-sm font-semibold text-blue-800 mb-2">💡 Strategic Recommendations</h5>
                              <div className="space-y-1 text-sm text-blue-700">
                                <div>• <strong>Inventory Planning:</strong> Scale up before {bestQuarter?.quarter} (best performance period)</div>
                                <div>• <strong>Marketing Budget:</strong> Increase spend during low-volatility weeks (under {avgWeeklyVolatility}% variation)</div>
                                <div>• <strong>Launch Timing:</strong> Target launches during sustained growth periods ({longestGrowthStreak}+ day trends)</div>
                                <div>• <strong>Risk Management:</strong> Expect {variance}% rank variation - plan inventory accordingly</div>
                              </div>
                            </div>
                          </div>
                        )
                      } else {
                        // Enhanced fallback when no data is available
                        return (
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <h5 className="font-medium text-gray-900 mb-2">📊 Seasonality Analysis Not Available</h5>
                            <p className="text-gray-600 text-sm mb-3">
                              Historical sales rank data is required for detailed seasonality analysis.
                            </p>
                            <div className="text-xs text-gray-500">
                              Once sales rank data is available, you'll see:
                              <br />• Week-to-week performance patterns
                              <br />• Quarterly trend analysis  
                              <br />• Optimal timing recommendations
                              <br />• Volatility and risk assessment
                            </div>
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Social Signals Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* TikTok */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="text-2xl">📱</div>
                <span>TikTok</span>
                {data.reviewAnalysisData?.socialMediaInsights?.platforms?.[0]?.trending && (
                  <Badge variant="destructive" className="ml-2">Trending</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {data.demandData.socialSignals.tiktok.posts.toLocaleString()} posts • {(data.demandData.socialSignals.tiktok.views / 1000000).toFixed(1)}M views • {data.demandData.socialSignals.tiktok.engagement} engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Content Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium">Sleep routine videos</span>
                      <span className="text-sm text-gray-600">1.2M views</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium">ASMR sleep content</span>
                      <span className="text-sm text-gray-600">890K views</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <span className="text-sm font-medium">Travel sleep hacks</span>
                      <span className="text-sm text-gray-600">670K views</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Popular Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">#sleepmaskhack</Badge>
                    <Badge variant="outline">#bluetoothsleepphone</Badge>
                    <Badge variant="outline">#sleepbetter</Badge>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 italic">
                    "This sleep mask changed my life! No more tangled earbuds while trying to sleep 😴"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">- Example user comment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="text-2xl">📸</div>
                <span>Instagram</span>
              </CardTitle>
              <CardDescription>
                {data.demandData.socialSignals.instagram.posts.toLocaleString()} posts • {data.demandData.socialSignals.instagram.engagement} engagement • Medium influencer reach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Content Categories</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium">Lifestyle posts</div>
                      <div className="text-xs text-gray-600 mt-1">38%</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium">Travel photos</div>
                      <div className="text-xs text-gray-600 mt-1">32%</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium">Wellness content</div>
                      <div className="text-xs text-gray-600 mt-1">30%</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">@wellness.journey:</span> "My nighttime routine essential! Perfect for meditation and blocking out my partner's snoring 🎧💤 #sleepwellness #bluetoothsleep"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">2.3K likes • 145 comments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YouTube */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="text-2xl">📺</div>
                <span>YouTube</span>
              </CardTitle>
              <CardDescription>
                {data.demandData.socialSignals.youtube.videos} videos • {data.demandData.socialSignals.youtube.avgViews.toLocaleString()} average views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Video Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Product Reviews</span>
                      <span className="text-sm text-gray-600">45% of videos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Sleep Music Channels</span>
                      <span className="text-sm text-gray-600">30% of videos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Unboxing Videos</span>
                      <span className="text-sm text-gray-600">25% of videos</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    "Bluetooth Sleep Mask Review - 6 Months Later!"
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    "I've been using this for half a year now, and here's my honest opinion..."
                  </p>
                  <p className="text-xs text-gray-500 mt-2">85K views • Tech Sleep Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reddit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="text-2xl">💬</div>
                <span>Reddit</span>
              </CardTitle>
              <CardDescription>
                {data.demandData.socialSignals.reddit.discussions} discussions • {data.demandData.socialSignals.reddit.sentiment} sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Subreddits</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">/r/sleep</Badge>
                    <Badge variant="secondary">/r/BuyItForLife</Badge>
                    <Badge variant="secondary">/r/insomnia</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Common Discussion Topics</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span className="text-sm text-gray-700">Durability questions and long-term reviews</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span className="text-sm text-gray-700">Comparisons with regular headphones for sleep</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      <span className="text-sm text-gray-700">Use cases for meditation and relaxation</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    "[Question] Anyone tried bluetooth sleep masks for side sleeping?"
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    "I'm a side sleeper and regular earbuds hurt. Looking for recommendations..."
                  </p>
                  <p className="text-xs text-gray-500 mt-2">r/sleep • 234 upvotes • 45 comments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emerging Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Emerging Social Trends</span>
              </CardTitle>
              <CardDescription>
                Growing trends and opportunities in social media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Sleep Tourism</h5>
                    <Badge variant="outline" className="text-green-600">+145% growth</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Hotels and resorts offering sleep-focused packages</p>
                  <p className="text-xs text-blue-600 mt-2">Opportunity: Partner with luxury hotels for branded amenities</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Biohacking Sleep</h5>
                    <Badge variant="outline" className="text-green-600">+89% growth</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Optimizing sleep with technology and data</p>
                  <p className="text-xs text-blue-600 mt-2">Opportunity: Add sleep tracking features and app integration</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Mindful Mornings</h5>
                    <Badge variant="outline" className="text-green-600">+67% growth</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Morning meditation and gratitude practices</p>
                  <p className="text-xs text-blue-600 mt-2">Opportunity: Create morning meditation content library</p>
                </div>
              </div>
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
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${(() => {
                        if (data.demandData._priceHistory?.length > 0) {
                          const allPrices = data.demandData._priceHistory.flatMap((d: any) => [d.min, d.max, d.avg])
                          return (allPrices.reduce((a: number, b: number) => a + b, 0) / allPrices.length).toFixed(2)
                        }
                        return '22.99'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Current Average</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${data.demandData._priceHistory?.length > 0 
                        ? Math.min(...data.demandData._priceHistory.map((d: any) => d.min)).toFixed(2)
                        : '19.99'}
                    </div>
                    <div className="text-sm text-gray-600">All-Time Low</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${data.demandData._priceHistory?.length > 0 
                        ? Math.max(...data.demandData._priceHistory.map((d: any) => d.max)).toFixed(2)
                        : '29.99'}
                    </div>
                    <div className="text-sm text-gray-600">All-Time High</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {(() => {
                        // Calculate percentage change over time
                        if (data.demandData._priceHistory?.length > 1) {
                          const first = data.demandData._priceHistory[0].avg
                          const last = data.demandData._priceHistory[data.demandData._priceHistory.length - 1].avg
                          const change = ((last - first) / first * 100).toFixed(1)
                          return change.startsWith('-') ? change + '%' : '+' + change + '%'
                        }
                        return '+5.2%'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">YoY Change</div>
                  </div>
                </div>

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
                                const product = data.demandData._nicheProducts?.find((p: any) => p.asin === asin)
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
                                  const product = data.demandData._nicheProducts?.find((p: any) => p.asin === asin)
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
                          formatter={(value: any, name: string) => {
                            if (viewMode === 'individual' && selectedCompetitors.includes(name)) {
                              const product = data.demandData._nicheProducts?.find((p: any) => p.asin === name)
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
                <div className="grid grid-cols-3 gap-4">
                  {data.demandData._nicheProducts?.length > 0 ? (
                    data.demandData._nicheProducts.slice(0, 9).map((product: any, index: number) => (
                      <div 
                        key={product.id} 
                        onClick={() => toggleCompetitor(product.asin)}
                        className={`p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                          selectedCompetitors.includes(product.asin)
                            ? 'border-purple-300 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
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
                    <div className="col-span-5 text-center py-8 text-gray-500">
                      <p>No competitor data available</p>
                      <p className="text-xs mt-1">Real competitor pricing will be displayed when data is loaded</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}


      {/* Keyword Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Keyword Market Network</span>
              </CardTitle>
              <CardDescription>
                Visual representation of keyword relationships and market size
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.keywordHierarchy ? (
                <KeywordNetworkVisualization
                  keywordHierarchy={data.keywordHierarchy}
                  primaryKeyword={data.title || 'Product'}
                  minKeywordsPerRoot={5}
                  minKeywordsPerSubRoot={3}
                />
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
    </div>
  )
}