'use client'

import React from 'react'
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
  Package
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

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
  return (
    <div className="space-y-6">
      {/* 1. Keyword Market Revenue - The foundation of demand */}
      {data.demandData.keywordMetrics && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Keyword Market Revenue Analysis</span>
          </CardTitle>
          <CardDescription>
            Total addressable market and revenue distribution across keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Market Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${(data.demandData.keywordMetrics.totalMarketRevenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Monthly Market Revenue</div>
              <div className="text-xs text-gray-500 mt-1">
                Across {data.demandData.keywordMetrics.totalKeywords.toLocaleString()} keywords
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.demandData.keywordMetrics.keywordDepth.top10}%
              </div>
              <div className="text-sm text-gray-600">Revenue from Top 10</div>
              <div className="text-xs text-gray-500 mt-1">
                Concentration Index: {data.demandData.keywordMetrics.concentrationIndex}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.demandData.keywordMetrics.keywordDepth.longTail}%
              </div>
              <div className="text-sm text-gray-600">Long-tail Opportunity</div>
              <div className="text-xs text-gray-500 mt-1">
                Less competitive keywords
              </div>
            </div>
          </div>

          {/* Top Keywords */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Top Revenue-Generating Keywords
            </h4>
            <div className="space-y-3">
              {data.demandData.keywordMetrics.topKeywords.slice(0, 5).map((keyword, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{keyword.keyword}</h5>
                      <div className="flex items-center space-x-2 text-sm">
                        {keyword.growth.startsWith('+') ? (
                          <ChevronUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={keyword.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {keyword.growth}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>${keyword.revenue.toLocaleString()}/mo</span>
                        <span>{keyword.orders.toLocaleString()} orders</span>
                        <span>{keyword.searchVolume.toLocaleString()} searches</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {keyword.clickShare}% click
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {keyword.conversionRate}% conv
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Depth Visualization */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600">Top 10</div>
                <div className="flex-grow">
                  <Progress value={data.demandData.keywordMetrics.keywordDepth.top10} className="h-6" />
                </div>
                <div className="w-16 text-sm text-gray-700 text-right">
                  {data.demandData.keywordMetrics.keywordDepth.top10}%
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600">Top 50</div>
                <div className="flex-grow">
                  <Progress value={data.demandData.keywordMetrics.keywordDepth.top50} className="h-6" />
                </div>
                <div className="w-16 text-sm text-gray-700 text-right">
                  {data.demandData.keywordMetrics.keywordDepth.top50}%
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600">Long-tail</div>
                <div className="flex-grow">
                  <Progress value={100} className="h-6" />
                </div>
                <div className="w-16 text-sm text-gray-700 text-right">
                  100%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* 2. Market Overview & Trends */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Market Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Market Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.demandData.monthlySearchVolume.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Monthly Searches</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {data.demandData.searchTrend} YoY
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${(data.demandData.marketSize / 1000000000).toFixed(1)}B
                </div>
                <div className="text-sm text-gray-600">Market Size</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {data.demandData.marketGrowth} Growth
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data.demandData.conversionRate}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {data.demandData.clickShare}%
                </div>
                <div className="text-sm text-gray-600">Click Share</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Search Trend (12 Months)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <div className="flex items-end justify-between h-full space-x-1">
                {data.demandData.googleTrends.map((point: any, index: number) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-full mb-2"
                      style={{ height: `${(point.value / 100) * 200}px` }}
                    ></div>
                    <div className="text-xs text-gray-600 transform -rotate-45">
                      {point.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Demand Velocity & Growth Indicators */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Demand Velocity */}
        {data.demandData.demandVelocity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Demand Velocity</span>
            </CardTitle>
            <CardDescription>
              Growth acceleration and momentum indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{data.demandData.demandVelocity.monthOverMonth}</div>
                  <div className="text-xs text-gray-600">MoM</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{data.demandData.demandVelocity.quarterOverQuarter}</div>
                  <div className="text-xs text-gray-600">QoQ</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{data.demandData.demandVelocity.yearOverYear}</div>
                  <div className="text-xs text-gray-600">YoY</div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Momentum Score</span>
                  <span className="text-2xl font-bold text-orange-600">{data.demandData.demandVelocity.momentumScore}</span>
                </div>
                <Progress value={data.demandData.demandVelocity.momentumScore} className="h-2" />
                <div className="text-xs text-gray-600 mt-1">
                  Acceleration: {data.demandData.demandVelocity.acceleration}
                </div>
              </div>

              {data.demandData.demandVelocity.signals && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Signals</h4>
                  <div className="space-y-1">
                    {data.demandData.demandVelocity.signals.slice(0, 3).map((signal, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="mr-1">•</span>
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Trending Keywords */}
        {data.demandData.trendingKeywords && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Rising Keywords</span>
            </CardTitle>
            <CardDescription>
              Fastest growing search terms in this niche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.demandData.trendingKeywords.slice(0, 4).map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex-grow">
                    <h5 className="font-medium text-gray-900 text-sm">{keyword.keyword}</h5>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                      <span>#{keyword.oldRank} → #{keyword.newRank}</span>
                      <Badge variant="secondary" className="text-xs">{keyword.growth}</Badge>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* 4. Sales Performance & Category Analysis */}
      {data.demandData.salesRankHistory && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-orange-600" />
            <span>Sales Rank Performance</span>
          </CardTitle>
          <CardDescription>
            Best Sellers Rank (BSR) trend showing demand momentum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.demandData.salesRankHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis reversed domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.date}</p>
                          <p className="text-sm">Rank: #{payload[0].value}</p>
                          <p className="text-xs text-gray-600">{payload[0].payload.subcategory}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rank" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  dot={{ fill: '#F97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      )}

      {/* 5. Market Maturity & Pricing Strategy */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Penetration */}
        {data.demandData.categoryPenetration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Market Maturity Analysis</span>
            </CardTitle>
            <CardDescription>
              Category penetration and growth opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(data.demandData.categoryPenetration.nicheSize * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Niche Size</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data.demandData.categoryPenetration.whiteSpaceOpportunity}
                  </div>
                  <div className="text-sm text-gray-600">Opportunity Score</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Market Phase</span>
                  <Badge variant="secondary">{data.demandData.categoryPenetration.marketMaturity}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Saturation</span>
                  <Badge variant="outline">{data.demandData.categoryPenetration.saturationLevel}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-gray-600">Niche Growth</span>
                  <span className="font-medium text-green-600">{data.demandData.categoryPenetration.nicheGrowth}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Price Elasticity */}
        {data.demandData.priceElasticity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              <span>Price Sensitivity Analysis</span>
            </CardTitle>
            <CardDescription>
              Optimal pricing based on demand elasticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  ${data.demandData.priceElasticity.optimalPrice}
                </div>
                <div className="text-sm text-gray-600">Sweet Spot Price</div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.demandData.priceElasticity.sensitivityScore} sensitivity
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price vs Volume</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.demandData.priceElasticity.priceVsVolume} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <XAxis dataKey="price" tickFormatter={(value) => `$${value}`} />
                      <YAxis hide />
                      <Tooltip 
                        formatter={(value: any) => [`${value.toLocaleString()} units`, 'Volume']}
                        labelFormatter={(label) => `Price: $${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="estimatedVolume" 
                        stroke="#6366F1" 
                        fill="#6366F1" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">Budget</div>
                  <div className="text-sm font-medium">{data.demandData.priceElasticity.segmentDemand.budget.percentage}%</div>
                  <div className="text-xs text-gray-500">{data.demandData.priceElasticity.segmentDemand.budget.range}</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-xs text-gray-600">Mid-range</div>
                  <div className="text-sm font-medium">{data.demandData.priceElasticity.segmentDemand.mid.percentage}%</div>
                  <div className="text-xs text-gray-500">{data.demandData.priceElasticity.segmentDemand.mid.range}</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="text-xs text-gray-600">Premium</div>
                  <div className="text-sm font-medium">{data.demandData.priceElasticity.segmentDemand.premium.percentage}%</div>
                  <div className="text-xs text-gray-500">{data.demandData.priceElasticity.segmentDemand.premium.range}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {/* 6. Social Proof & Market Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-pink-600" />
            <span>Social Media Validation</span>
          </CardTitle>
          <CardDescription>
            Consumer interest and engagement across social platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-red-50">
              <div className="text-3xl mb-2">📱</div>
              <div className="font-semibold text-gray-900">TikTok</div>
              <div className="text-sm text-gray-600 mt-2">
                <div>{data.demandData.socialSignals.tiktok.posts.toLocaleString()} posts</div>
                <div>{(data.demandData.socialSignals.tiktok.views / 1000000).toFixed(1)}M views</div>
                <div className="text-xs text-green-600 font-medium">
                  {data.demandData.socialSignals.tiktok.engagement} engagement
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-3xl mb-2">📸</div>
              <div className="font-semibold text-gray-900">Instagram</div>
              <div className="text-sm text-gray-600 mt-2">
                <div>{data.demandData.socialSignals.instagram.posts.toLocaleString()} posts</div>
                <div className="text-xs text-green-600 font-medium">
                  {data.demandData.socialSignals.instagram.engagement} engagement
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-red-50 to-orange-50">
              <div className="text-3xl mb-2">📺</div>
              <div className="font-semibold text-gray-900">YouTube</div>
              <div className="text-sm text-gray-600 mt-2">
                <div>{data.demandData.socialSignals.youtube.videos} videos</div>
                <div>{data.demandData.socialSignals.youtube.avgViews.toLocaleString()} avg views</div>
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50">
              <div className="text-3xl mb-2">💬</div>
              <div className="font-semibold text-gray-900">Reddit</div>
              <div className="text-sm text-gray-600 mt-2">
                <div>{data.demandData.socialSignals.reddit.discussions} discussions</div>
                <div className="text-xs text-green-600 font-medium capitalize">
                  {data.demandData.socialSignals.reddit.sentiment} sentiment
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}