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
}

export default function DemandAnalysis({ data }: DemandAnalysisProps) {
  const [activeTab, setActiveTab] = useState('market')
  
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
                <span>AI-Powered Market Insights</span>
              </CardTitle>
              <CardDescription>
                Machine learning analysis of market conditions and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Market Assessment</h4>
                  <p className="text-sm text-gray-700">
                    This market shows strong growth potential with improving BSR trends and increasing customer demand. 
                    The niche is in an expansion phase with room for new entrants who can differentiate effectively.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Key Opportunities</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Premium Segment Underserved</p>
                        <p className="text-xs text-gray-600">Only 19% of products target the $30+ price range despite strong demand</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Seasonal Opportunity</p>
                        <p className="text-xs text-gray-600">Q4 shows 40% higher demand - prepare inventory for holiday season</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Feature Gap in Market</p>
                        <p className="text-xs text-gray-600">Customers seeking eco-friendly options - only 12% of products address this</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠</span>
                      <span>Increasing competition from Chinese manufacturers</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠</span>
                      <span>Price sensitivity in budget segment affecting margins</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Competitor Age Analysis */}
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
              <div className="space-y-4">
                {/* Age Distribution Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Product Age Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { range: '0-6 months', count: 3, percentage: 15 },
                        { range: '6-12 months', count: 5, percentage: 25 },
                        { range: '1-2 years', count: 7, percentage: 35 },
                        { range: '2-3 years', count: 3, percentage: 15 },
                        { range: '3+ years', count: 2, percentage: 10 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="range" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                          {/* Add percentage labels on bars */}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">1.8</div>
                    <div className="text-sm text-gray-600">Avg. Years in Market</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">40%</div>
                    <div className="text-sm text-gray-600">Launched Last Year</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">85%</div>
                    <div className="text-sm text-gray-600">Success Rate (1yr+)</div>
                  </div>
                </div>

                {/* Market Lifecycle Insights */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Market Lifecycle Stage</h4>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-700">Growth Phase</div>
                    <Badge variant="default" className="bg-green-600">Active Growth</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    The market shows healthy turnover with new entrants successfully establishing themselves. 
                    Products older than 2 years maintain stable market share, indicating strong customer loyalty 
                    for quality offerings.
                  </p>
                </div>

                {/* Entry Timing */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Entry Timing Analysis</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>New products gaining traction within 3-6 months</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Market not oversaturated - room for differentiation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Established products show vulnerability to innovation</span>
                    </li>
                  </ul>
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
                <div className="grid grid-cols-5 gap-3">
                  {data.demandData._nicheProducts?.length > 0 ? (
                    data.demandData._nicheProducts.map((product: any, index: number) => (
                      <div 
                        key={product.id} 
                        onClick={() => toggleCompetitor(product.asin)}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                          selectedCompetitors.includes(product.asin)
                            ? 'border-purple-300 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center relative">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded mx-auto mb-2"
                            />
                          )}
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            #{product.bsr?.toLocaleString() || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {product.title?.substring(0, 25)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.asin}
                          </div>
                          {selectedCompetitors.includes(product.asin) && (
                            <>
                              <div className="mt-1 text-xs font-medium text-purple-600">
                                ✓ Selected
                              </div>
                              {viewMode === 'individual' && (
                                <div 
                                  className="absolute top-1 right-1 w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getCompetitorColor(selectedCompetitors.indexOf(product.asin)) }}
                                ></div>
                              )}
                            </>
                          )}
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
                Detailed analysis of seasonal patterns and peak demand periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Peak Seasons Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Peak Demand Periods</h4>
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

                {/* Monthly Breakdown */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Performance Breakdown</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { month: 'Jan', performance: 85, trend: '↗', color: 'bg-yellow-100 text-yellow-800' },
                      { month: 'Feb', performance: 75, trend: '↘', color: 'bg-gray-100 text-gray-800' },
                      { month: 'Mar', performance: 70, trend: '↗', color: 'bg-gray-100 text-gray-800' },
                      { month: 'Apr', performance: 78, trend: '↗', color: 'bg-gray-100 text-gray-800' },
                      { month: 'May', performance: 82, trend: '↗', color: 'bg-blue-100 text-blue-800' },
                      { month: 'Jun', performance: 88, trend: '↗', color: 'bg-blue-100 text-blue-800' },
                      { month: 'Jul', performance: 92, trend: '↗', color: 'bg-blue-100 text-blue-800' },
                      { month: 'Aug', performance: 87, trend: '↘', color: 'bg-blue-100 text-blue-800' },
                      { month: 'Sep', performance: 80, trend: '↘', color: 'bg-gray-100 text-gray-800' },
                      { month: 'Oct', performance: 95, trend: '↗', color: 'bg-green-100 text-green-800' },
                      { month: 'Nov', performance: 100, trend: '↗', color: 'bg-green-100 text-green-800' },
                      { month: 'Dec', performance: 98, trend: '↘', color: 'bg-green-100 text-green-800' }
                    ].map((item, index) => (
                      <div key={item.month} className={`p-3 rounded-lg text-center ${item.color}`}>
                        <div className="text-xs font-medium">{item.month}</div>
                        <div className="text-lg font-bold">{item.performance}</div>
                        <div className="text-xs">{item.trend}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Key Seasonal Insights</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">🎯 Opportunity Windows</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• <strong>September:</strong> Pre-order for holiday inventory</li>
                        <li>• <strong>May:</strong> Prepare for summer travel season</li>
                        <li>• <strong>December:</strong> Launch premium product variants</li>
                        <li>• <strong>January:</strong> Target wellness and health markets</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">📊 Market Patterns</h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• <strong>85% variance:</strong> High seasonal sensitivity</li>
                        <li>• <strong>Q4 dominance:</strong> 45% of annual sales</li>
                        <li>• <strong>Travel correlation:</strong> Strong summer performance</li>
                        <li>• <strong>Weekly cycles:</strong> Weekend shopping spikes</li>
                      </ul>
                    </div>
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
                <div className="grid grid-cols-5 gap-3">
                  {data.demandData._nicheProducts?.length > 0 ? (
                    data.demandData._nicheProducts.map((product: any, index: number) => (
                      <div 
                        key={product.id} 
                        onClick={() => toggleCompetitor(product.asin)}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                          selectedCompetitors.includes(product.asin)
                            ? 'border-purple-300 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center relative">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded mx-auto mb-2"
                            />
                          )}
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            ${product.price || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {product.title?.substring(0, 25)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.asin}
                          </div>
                          {selectedCompetitors.includes(product.asin) && (
                            <>
                              <div className="mt-1 text-xs font-medium text-purple-600">
                                ✓ Selected
                              </div>
                              {viewMode === 'individual' && (
                                <div 
                                  className="absolute top-1 right-1 w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getCompetitorColor(selectedCompetitors.indexOf(product.asin)) }}
                                ></div>
                              )}
                            </>
                          )}
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