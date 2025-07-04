'use client'

import React, { useState } from 'react'
import ExternalDataInsights from '@/components/ExternalDataInsights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  MessageCircle,
  Activity,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Database,
  Target,
  Hash,
  ExternalLink,
  Shield,
  Clock
} from 'lucide-react'

export default function ExternalDataPage() {
  const [selectedKeyword, setSelectedKeyword] = useState('wireless headphones')
  const [customKeyword, setCustomKeyword] = useState('')

  const popularKeywords = [
    'wireless headphones',
    'security camera',
    'office chair',
    'kitchen knife set',
    'fitness tracker',
    'robot vacuum',
    'air purifier',
    'standing desk'
  ]

  const handleKeywordChange = (keyword: string) => {
    setSelectedKeyword(keyword)
  }

  const handleCustomKeyword = () => {
    if (customKeyword.trim()) {
      setSelectedKeyword(customKeyword.trim())
      setCustomKeyword('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">External API Integrations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time social media sentiment analysis, Google Trends data, and comprehensive market intelligence
          </p>
        </div>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">Live Data Insights</TabsTrigger>
            <TabsTrigger value="apis">API Integrations</TabsTrigger>
            <TabsTrigger value="monitoring">Data Monitoring</TabsTrigger>
            <TabsTrigger value="features">System Features</TabsTrigger>
          </TabsList>

          {/* Live Data Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Keyword Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Keyword Analysis
                </CardTitle>
                <CardDescription>
                  Select a keyword to analyze across all external data sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {popularKeywords.map(keyword => (
                    <Button
                      key={keyword}
                      variant={selectedKeyword === keyword ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleKeywordChange(keyword)}
                      className="capitalize"
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter custom keyword..."
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomKeyword()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button onClick={handleCustomKeyword}>
                    Analyze
                  </Button>
                </div>
                
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    Currently analyzing: <span className="font-medium capitalize">{selectedKeyword}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* External Data Insights Component */}
            <ExternalDataInsights keyword={selectedKeyword} category="Electronics" />
          </TabsContent>

          {/* API Integrations Tab */}
          <TabsContent value="apis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Google Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    Google Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Search interest over time</li>
                      <li>• Related queries and topics</li>
                      <li>• Regional interest data</li>
                      <li>• Seasonal trend analysis</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-900">100/day</div>
                      <div className="text-blue-700">Rate Limit</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-900">30min</div>
                      <div className="text-green-700">Cache TTL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reddit */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-orange-600 mr-2" />
                    Reddit API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Post and comment analysis</li>
                      <li>• Sentiment scoring</li>
                      <li>• Subreddit targeting</li>
                      <li>• Engagement metrics</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="font-bold text-orange-900">60/hour</div>
                      <div className="text-orange-700">Rate Limit</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-900">15min</div>
                      <div className="text-green-700">Cache TTL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TikTok */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 text-black mr-2" />
                    TikTok Research API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Video content analysis</li>
                      <li>• Hashtag trending data</li>
                      <li>• Influencer mentions</li>
                      <li>• Engagement analytics</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="font-bold text-gray-900">100/day</div>
                      <div className="text-gray-700">Rate Limit</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-900">1hour</div>
                      <div className="text-green-700">Cache TTL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Twitter/X */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hash className="h-5 w-5 text-blue-400 mr-2" />
                    Twitter API v2
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Tweet sentiment analysis</li>
                      <li>• Hashtag tracking</li>
                      <li>• Influencer monitoring</li>
                      <li>• Real-time mentions</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-900">300/15min</div>
                      <div className="text-blue-700">Rate Limit</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-900">5min</div>
                      <div className="text-green-700">Cache TTL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* YouTube */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="h-5 w-5 text-red-600 mr-2" />
                    YouTube Data API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Video content analysis</li>
                      <li>• Comment sentiment</li>
                      <li>• Channel statistics</li>
                      <li>• Trending topics</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-red-50 rounded">
                      <div className="font-bold text-red-900">100/day</div>
                      <div className="text-red-700">Rate Limit</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-900">30min</div>
                      <div className="text-green-700">Cache TTL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amazon Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 text-yellow-600 mr-2" />
                    Amazon Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Rate Limited
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Review sentiment analysis</li>
                      <li>• Key phrase extraction</li>
                      <li>• Complaint categorization</li>
                      <li>• Rating distribution</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-yellow-50 rounded">
                      <div className="font-bold text-yellow-900">10/hour</div>
                      <div className="text-yellow-700">Rate Limit</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-900">2hours</div>
                      <div className="text-green-700">Cache TTL</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 text-gray-600 mr-2" />
                  API Configuration & Management
                </CardTitle>
                <CardDescription>
                  Manage API keys, rate limits, and data refresh settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Rate Limiting</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Google Trends</span>
                        <Badge className="bg-green-100 text-green-800">47/100</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Reddit API</span>
                        <Badge className="bg-green-100 text-green-800">23/60</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Twitter API</span>
                        <Badge className="bg-yellow-100 text-yellow-800">89/100</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>TikTok API</span>
                        <Badge className="bg-green-100 text-green-800">12/100</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Data Freshness</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Google Trends</span>
                        <span className="text-green-600">12min ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Media</span>
                        <span className="text-green-600">5min ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Market Intel</span>
                        <span className="text-green-600">8min ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sentiment Data</span>
                        <span className="text-yellow-600">45min ago</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Health Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>All APIs operational</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Cache system healthy</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Data pipeline active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span>Rate limits approaching</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">6.2M</div>
                  <div className="text-sm text-gray-600">Data Points Collected</div>
                  <Badge className="mt-1 bg-green-100 text-green-800">+12% today</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <RefreshCw className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">1,247</div>
                  <div className="text-sm text-gray-600">API Calls Today</div>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">Within limits</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">API Uptime</div>
                  <Badge className="mt-1 bg-green-100 text-green-800">Excellent</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">2.3s</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                  <Badge className="mt-1 bg-green-100 text-green-800">Fast</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Data Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 text-green-600 mr-2" />
                  Real-time Data Monitoring
                </CardTitle>
                <CardDescription>
                  Live monitoring of external API data ingestion and processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Google Trends', status: 'active', lastUpdate: '2min ago', dataPoints: 156 },
                    { source: 'Reddit', status: 'active', lastUpdate: '5min ago', dataPoints: 89 },
                    { source: 'TikTok', status: 'active', lastUpdate: '3min ago', dataPoints: 234 },
                    { source: 'Twitter', status: 'rate_limited', lastUpdate: '15min ago', dataPoints: 67 },
                    { source: 'YouTube', status: 'active', lastUpdate: '8min ago', dataPoints: 45 },
                    { source: 'Amazon Reviews', status: 'paused', lastUpdate: '1hr ago', dataPoints: 23 }
                  ].map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          source.status === 'active' ? 'bg-green-500' :
                          source.status === 'rate_limited' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{source.source}</h4>
                          <p className="text-sm text-gray-600">Last update: {source.lastUpdate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{source.dataPoints}</div>
                        <div className="text-xs text-gray-600">data points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                    Google Trends Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time search interest tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Related queries and topics discovery</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Regional interest distribution</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Seasonal trend analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Historical data comparison</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-green-500 mr-2" />
                    Social Media Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Multi-platform sentiment analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Influencer mention tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Engagement metrics analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Trending hashtag identification</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time mention monitoring</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                    Market Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Comprehensive sentiment aggregation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Trend momentum calculation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Social buzz scoring</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Competitor mention tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Emerging trend identification</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 text-orange-500 mr-2" />
                    System Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Intelligent rate limiting</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Multi-tier caching system</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Automatic failover handling</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time monitoring dashboard</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Data quality validation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>Current status of external API integration components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: 'External API Service', status: 'completed', description: 'Comprehensive service for all external API integrations' },
                    { feature: 'Google Trends Integration', status: 'completed', description: 'Real-time trends data with caching and rate limiting' },
                    { feature: 'Social Media Analysis', status: 'completed', description: 'Multi-platform sentiment analysis and monitoring' },
                    { feature: 'Market Intelligence Engine', status: 'completed', description: 'Aggregated insights and trend analysis' },
                    { feature: 'Data Insights Interface', status: 'completed', description: 'Comprehensive UI for external data visualization' },
                    { feature: 'Rate Limiting & Caching', status: 'completed', description: 'Intelligent API management and optimization' },
                    { feature: 'Production API Keys', status: 'pending', description: 'Integration with live API endpoints' },
                    { feature: 'Background Data Sync', status: 'pending', description: 'Automated data refresh and monitoring' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.feature}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <Badge className={item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {item.status === 'completed' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}