'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Activity,
  TrendingUp,
  Sparkles
} from 'lucide-react'

interface DemandAnalysisProps {
  data: any
}

export default function DemandAnalysis({ data }: DemandAnalysisProps) {
  return (
    <div className="space-y-6">
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

      {/* Social Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-pink-600" />
            <span>Social Media Signals</span>
          </CardTitle>
          <CardDescription>
            Social media buzz and engagement around this product category
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