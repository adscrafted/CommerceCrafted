'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { 
  Target, 
  DollarSign,
  Crown,
  Star,
  CheckCircle,
  Layers,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Search,
  TrendingUp,
  Eye,
  Swords,
  Users,
  BarChart3,
  Activity
} from 'lucide-react'

interface CompetitionAnalysisProps {
  data: any
}

export default function CompetitionAnalysis({ data }: CompetitionAnalysisProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'competitors', label: 'Top Competitors', icon: Users },
          { id: 'keyword', label: 'Keyword Analysis', icon: Search },
          { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
          { id: 'strengths', label: 'Competitive Advantages', icon: Swords }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Competition Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-red-600" />
                  <span>Competition Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {data.competitionData.totalCompetitors}
                  </div>
                  <div className="text-sm text-gray-600">Total Competitors</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {data.competitionData.averageRating}
                    </div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      ${data.competitionData.averagePrice}
                    </div>
                    <div className="text-sm text-gray-600">Avg Price</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {data.competitionData.averageReviews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Avg Reviews</div>
                </div>
              </CardContent>
            </Card>

            {/* Price Distribution */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Price Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.competitionData.priceDistribution.map((range: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-gray-600">
                        {range.range}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${range.percentage}%` }}
                            >
                              <span className="text-white text-xs font-medium">
                                {range.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="w-16 text-sm text-gray-600">
                            {range.count} items
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Share Overview */}
          {data.competitionData.marketShareData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Market Share Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {data.competitionData.marketShareData.slice(0, 3).map((company: any, index: number) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{company.share}%</div>
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {company.growth > 0 ? '+' : ''}{company.growth}% YoY
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Top Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span>Top 3 Competitors</span>
              </CardTitle>
              <CardDescription>
                Leading products in this space and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.competitionData.topCompetitors.map((competitor: any, index: number) => (
                  <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* Product Info */}
                      <div className="md:col-span-1">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Image 
                              src={competitor.mainImage}
                              alt={competitor.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                #{competitor.rank}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-sm text-gray-900 mb-1">
                              {competitor.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2">
                              ASIN: {competitor.asin}
                            </p>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-3 w-3 ${i < Math.floor(competitor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">
                                ({competitor.reviews.toLocaleString()})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financial Metrics */}
                      <div className="md:col-span-1">
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-600">Price</div>
                            <div className="text-lg font-bold text-green-600">${competitor.price}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Monthly Revenue</div>
                            <div className="text-sm font-semibold text-blue-600">
                              ${competitor.monthlyRevenue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Conversion Rate</div>
                            <div className="text-sm font-medium">{competitor.conversionRate}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="md:col-span-1">
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-600">Monthly Orders</div>
                            <div className="text-sm font-semibold text-purple-600">
                              {competitor.monthlyOrders.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Monthly Clicks</div>
                            <div className="text-sm font-medium">
                              {competitor.monthlyClicks.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Click Share</div>
                            <div className="text-sm font-medium">{competitor.clickShare}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      {competitor.insights && competitor.insights.length > 0 && (
                        <div className="md:col-span-1">
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-700">Key Insights</h4>
                            <div className="space-y-1">
                              {competitor.insights.map((insight: string, i: number) => (
                                <div key={i} className="flex items-start text-xs text-gray-600">
                                  <span className="mr-1">•</span>
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Competitive Features */}
                    {competitor.features && competitor.features.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {competitor.features.map((feature: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Sentiment */}
                    {(competitor.positiveReviews || competitor.negativeReviews) && (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        {competitor.positiveReviews && competitor.positiveReviews.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              What Customers Love
                            </h4>
                            <ul className="space-y-1">
                              {competitor.positiveReviews.map((review: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600">• {review}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {competitor.negativeReviews && competitor.negativeReviews.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Common Complaints
                            </h4>
                            <ul className="space-y-1">
                              {competitor.negativeReviews.map((review: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600">• {review}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyword Analysis Tab */}
      {activeTab === 'keyword' && (
        <div className="space-y-6">
          {/* Keyword Ownership Matrix */}
          {data.competitionData.keywordOwnership && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-purple-600" />
                  <span>Keyword Ownership Matrix</span>
                </CardTitle>
                <CardDescription>
                  Which competitors dominate key search terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-700">Keyword</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-gray-700">Search Volume</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-gray-700">Dominant ASIN</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-gray-700">Dominance</th>
                        <th className="text-left py-3 px-3 text-sm font-medium text-gray-700">Top 3 Competitors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.competitionData.keywordOwnership.map((keyword: any, index: number) => {
                        const dominantCompetitor = data.competitionData.topCompetitors.find(
                          (comp: any) => comp.asin === keyword.dominantASIN
                        )
                        
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-3 text-sm text-gray-900 font-medium">
                              {keyword.keyword}
                            </td>
                            <td className="py-3 px-3 text-sm text-center">
                              <Badge variant="outline">
                                {keyword.searchVolume ? keyword.searchVolume.toLocaleString() : 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-sm text-center">
                              <div className="flex items-center justify-center space-x-2">
                                {dominantCompetitor && (
                                  <div className="flex items-center space-x-1">
                                    <Image 
                                      src={dominantCompetitor.mainImage}
                                      alt={dominantCompetitor.name}
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded"
                                    />
                                    <span className="text-xs font-medium">{dominantCompetitor.name.split(' ')[0]}</span>
                                  </div>
                                )}
                                {!dominantCompetitor && (
                                  <span className="text-xs text-gray-500">{keyword.dominantASIN}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="flex-1 max-w-[100px]">
                                  <Progress 
                                    value={keyword.dominanceScore} 
                                    className="h-2"
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {keyword.dominanceScore}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                {keyword.top3ASINs.map((asin: string, i: number) => {
                                  const competitor = data.competitionData.topCompetitors.find(
                                    (comp: any) => comp.asin === asin
                                  )
                                  if (competitor) {
                                    return (
                                      <div key={i} className="flex items-center space-x-1">
                                        <Image 
                                          src={competitor.mainImage}
                                          alt={competitor.name}
                                          width={20}
                                          height={20}
                                          className="w-5 h-5 rounded"
                                        />
                                        <span className="text-xs text-gray-600">#{i + 1}</span>
                                      </div>
                                    )
                                  }
                                  return null
                                })}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Keyword Dominance Summary */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {data.competitionData.keywordOwnership.filter((k: any) => k.dominanceScore > 40).length}
                          </div>
                          <div className="text-sm text-gray-600">High Dominance Keywords</div>
                        </div>
                        <Crown className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {data.competitionData.keywordOwnership.filter((k: any) => k.dominanceScore < 30).length}
                          </div>
                          <div className="text-sm text-gray-600">Opportunity Keywords</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {new Set(data.competitionData.keywordOwnership.map((k: any) => k.dominantASIN)).size}
                          </div>
                          <div className="text-sm text-gray-600">Unique Leaders</div>
                        </div>
                        <Target className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pricing Strategy Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Price-Performance Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Price-Performance Analysis</span>
              </CardTitle>
              <CardDescription>
                Market positioning based on price and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg p-4">
                {/* Axes Labels */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                  Price ($) →
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600">
                  Performance Score →
                </div>
                
                {/* Grid Lines */}
                <div className="absolute inset-4 grid grid-cols-4 grid-rows-4">
                  {[...Array(4)].map((_, i) => (
                    <React.Fragment key={i}>
                      <div className="border-r border-gray-200 h-full" />
                      <div className="border-b border-gray-200 w-full" />
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Quadrant Labels */}
                <div className="absolute top-8 left-8 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  Low Price<br />High Performance
                </div>
                <div className="absolute top-8 right-8 text-xs text-gray-500 bg-white px-2 py-1 rounded text-right">
                  High Price<br />High Performance
                </div>
                <div className="absolute bottom-8 left-8 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  Low Price<br />Low Performance
                </div>
                <div className="absolute bottom-8 right-8 text-xs text-gray-500 bg-white px-2 py-1 rounded text-right">
                  High Price<br />Low Performance
                </div>
                
                {/* Plot Competitors */}
                {data.competitionData.topCompetitors.map((competitor: any, index: number) => {
                  // Calculate position based on price (x-axis) and performance score (y-axis)
                  // Performance score = rating * log(reviews) to normalize large review counts
                  const performanceScore = competitor.rating * Math.log10(competitor.reviews + 1)
                  const maxPrice = Math.max(...data.competitionData.topCompetitors.map((c: any) => c.price))
                  const minPrice = Math.min(...data.competitionData.topCompetitors.map((c: any) => c.price))
                  const maxPerformance = Math.max(...data.competitionData.topCompetitors.map((c: any) => 
                    c.rating * Math.log10(c.reviews + 1)
                  ))
                  const minPerformance = Math.min(...data.competitionData.topCompetitors.map((c: any) => 
                    c.rating * Math.log10(c.reviews + 1)
                  ))
                  
                  // Normalize to percentage positions
                  const xPos = ((competitor.price - minPrice) / (maxPrice - minPrice)) * 80 + 10
                  const yPos = 90 - ((performanceScore - minPerformance) / (maxPerformance - minPerformance)) * 80
                  
                  // Determine bubble size based on revenue
                  const revenueScale = Math.sqrt(competitor.monthlyRevenue / 10000)
                  const bubbleSize = Math.min(Math.max(revenueScale, 8), 24)
                  
                  return (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{
                        left: `${xPos}%`,
                        top: `${yPos}%`
                      }}
                    >
                      <div 
                        className={`
                          rounded-full flex items-center justify-center text-white text-xs font-medium
                          ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : index === 2 ? 'bg-orange-600' : 'bg-purple-600'}
                          hover:scale-110 transition-transform cursor-pointer shadow-lg
                        `}
                        style={{
                          width: `${bubbleSize * 2}px`,
                          height: `${bubbleSize * 2}px`
                        }}
                      >
                        {index + 1}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10">
                        <div className="font-semibold">{competitor.name}</div>
                        <div>Price: ${competitor.price}</div>
                        <div>Rating: {competitor.rating} ({competitor.reviews.toLocaleString()} reviews)</div>
                        <div>Revenue: ${competitor.monthlyRevenue.toLocaleString()}/mo</div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Price axis markers */}
                <div className="absolute bottom-2 left-8 text-xs text-gray-500">
                  ${Math.min(...data.competitionData.topCompetitors.map((c: any) => c.price)).toFixed(0)}
                </div>
                <div className="absolute bottom-2 right-8 text-xs text-gray-500">
                  ${Math.max(...data.competitionData.topCompetitors.map((c: any) => c.price)).toFixed(0)}
                </div>
                
                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-lg">
                  <div className="text-xs font-medium text-gray-700 mb-2">Bubble Size = Revenue</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <span className="text-xs">Market Leader</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <span className="text-xs">Strong Competitor</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                    <span className="text-xs">Value Player</span>
                  </div>
                </div>
              </div>
              
              {/* Market Insights */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sweet Spot Analysis</h4>
                  <p className="text-sm text-gray-600">
                    The optimal price range appears to be $25-30, where competitors achieve high performance scores
                    while maintaining strong revenue. This zone balances customer value perception with profitability.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Market Gaps</h4>
                  <p className="text-sm text-gray-600">
                    There's an opportunity in the premium segment ($35-45) with high performance features.
                    The market lacks strong players in this space, suggesting room for differentiation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitive Advantages Tab */}
      {activeTab === 'strengths' && (
        <div className="space-y-6">
          {/* Competitive Intelligence Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>Competitive Intelligence Report</span>
              </CardTitle>
              <CardDescription>
                Strategic insights and actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Competitive Advantages */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Competitive Advantages to Leverage
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 mb-1">Keyword Opportunities</div>
                      <p className="text-sm text-gray-600">
                        {data.competitionData.keywordOwnership.filter((k: any) => k.dominanceScore < 30).length} keywords 
                        with low competition present immediate ranking opportunities
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 mb-1">Price Positioning</div>
                      <p className="text-sm text-gray-600">
                        Sweet spot identified at $25-30 range with limited strong competitors
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 mb-1">Feature Gaps</div>
                      <p className="text-sm text-gray-600">
                        Top competitors lack advanced features like app integration and sleep tracking
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strategic Threats */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-red-600" />
                    Strategic Threats to Monitor
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-red-200">
                      <div className="font-medium text-red-800 mb-1">Market Leader Dominance</div>
                      <p className="text-sm text-gray-600">
                        MUSICOZY controls {data.competitionData.marketShareData[0].share}% market share 
                        with strong keyword rankings
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-red-200">
                      <div className="font-medium text-red-800 mb-1">Review Moat</div>
                      <p className="text-sm text-gray-600">
                        Top 3 competitors have {data.competitionData.topCompetitors.slice(0, 3).reduce((sum: number, c: any) => sum + c.reviews, 0).toLocaleString()} 
                        combined reviews creating trust barriers
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-red-200">
                      <div className="font-medium text-red-800 mb-1">Price Competition</div>
                      <p className="text-sm text-gray-600">
                        Budget segment below $20 is saturated with {data.competitionData.priceDistribution[0].percentage}% 
                        of competitors
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                  Strategic Action Items
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        1
                      </div>
                      <h5 className="font-medium">Launch Strategy</h5>
                    </div>
                    <p className="text-sm text-gray-600">
                      Target low-competition keywords first, price at $24.99 for market entry, 
                      focus on differentiating features
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        2
                      </div>
                      <h5 className="font-medium">Content Strategy</h5>
                    </div>
                    <p className="text-sm text-gray-600">
                      Create comparison content against top 3 competitors, emphasize unique features, 
                      target long-tail keywords
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        3
                      </div>
                      <h5 className="font-medium">Growth Strategy</h5>
                    </div>
                    <p className="text-sm text-gray-600">
                      Build review velocity through early customer incentives, expand to underserved 
                      segments, premium line at $39.99
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Success Metrics to Track</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">Top 20</div>
                    <div className="text-xs text-gray-600">Keyword Rankings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">15%</div>
                    <div className="text-xs text-gray-600">Market Share Goal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">4.2+</div>
                    <div className="text-xs text-gray-600">Rating Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">$250K</div>
                    <div className="text-xs text-gray-600">Monthly Revenue</div>
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