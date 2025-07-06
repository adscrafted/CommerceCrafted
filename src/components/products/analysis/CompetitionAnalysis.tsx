'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  DollarSign,
  Crown,
  Star,
  CheckCircle
} from 'lucide-react'

interface CompetitionAnalysisProps {
  data: any
}

export default function CompetitionAnalysis({ data }: CompetitionAnalysisProps) {
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
                    <div className="grid grid-cols-2 gap-1">
                      {competitor.images.slice(0, 4).map((image: string, imgIndex: number) => (
                        <img 
                          key={imgIndex}
                          src={image}
                          alt={`${competitor.name} ${imgIndex + 1}`}
                          className="w-full h-12 rounded object-cover"
                        />
                      ))}
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
    </div>
  )
}