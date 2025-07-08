'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  TrendingUp
} from 'lucide-react'

interface CompetitionAnalysisProps {
  data: any
}

export default function CompetitionAnalysis({ data }: CompetitionAnalysisProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  return (
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
                              <img 
                                src={dominantCompetitor.mainImage}
                                alt={dominantCompetitor.name}
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
                                  <img 
                                    src={competitor.mainImage}
                                    alt={competitor.name}
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

      {/* Top Competitors */}
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
                        <img 
                          src={competitor.mainImage}
                          alt={competitor.name}
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
                        <div className="text-xs text-gray-600">Keyword Strength</div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(competitor.keywordStrength / 30) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{competitor.keywordStrength}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="md:col-span-1">
                    <div className="text-xs text-gray-600 mb-2">Product Images</div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1">
                        {competitor.images.slice(0, 4).map((image: any, imgIndex: number) => (
                          <div key={imgIndex} className="relative group">
                            <img 
                              src={image.url || image}
                              alt={image.caption || `${competitor.name} ${imgIndex + 1}`}
                              className="w-full h-12 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                setSelectedCompetitor(competitor)
                                setSelectedImageIndex(imgIndex)
                              }}
                            />
                            {image.type && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="text-white text-xs capitalize">{image.type}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {competitor.images.length > 4 && (
                        <button 
                          onClick={() => {
                            setSelectedCompetitor(competitor)
                            setSelectedImageIndex(0)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          View all {competitor.images.length} images →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Listing Details */}
                <div className="mt-4 pt-4 border-t">
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Product Title</div>
                    <div className="text-sm text-gray-900 font-medium line-clamp-2">
                      {competitor.listing.title}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Key Features</div>
                      <ul className="space-y-1">
                        {competitor.listing.bulletPoints.slice(0, 3).map((point: string, pointIndex: number) => (
                          <li key={pointIndex} className="text-xs text-gray-700 flex items-start space-x-1">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Target Keywords</div>
                      <div className="flex flex-wrap gap-1">
                        {competitor.listing.keywords.map((keyword: string, keywordIndex: number) => (
                          <Badge key={keywordIndex} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
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

      {/* Image Gallery Modal */}
      {selectedCompetitor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCompetitor(null)}>
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedCompetitor.name}</h3>
                <p className="text-sm text-gray-600">Product Gallery - {selectedCompetitor.images.length} images</p>
              </div>
              <button 
                onClick={() => setSelectedCompetitor(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <img 
                  src={selectedCompetitor.images[selectedImageIndex]?.url || selectedCompetitor.images[selectedImageIndex]}
                  alt={selectedCompetitor.images[selectedImageIndex]?.caption || `${selectedCompetitor.name} ${selectedImageIndex + 1}`}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                {selectedCompetitor.images[selectedImageIndex]?.caption && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {selectedCompetitor.images[selectedImageIndex].caption}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {selectedCompetitor.images.map((image: any, index: number) => (
                  <div 
                    key={index}
                    className={`relative cursor-pointer border-2 rounded ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={image.url || image}
                      alt={image.caption || `${selectedCompetitor.name} ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    {image.type && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                        {image.type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Intelligence Dashboard */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Strategic Intelligence Dashboard</span>
          </CardTitle>
          <CardDescription>
            Key insights and strategic recommendations based on competitive analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
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
      )}
    </div>
  )
}