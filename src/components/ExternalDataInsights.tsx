'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Globe,
  MapPin,
  Calendar,
  User,
  Hash,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Activity
} from 'lucide-react'
import { ExternalAPIService, GoogleTrendsData, SocialMediaAnalysis, MarketIntelligence, SocialMediaMention } from '@/lib/external-api-service'

interface ExternalDataInsightsProps {
  keyword: string
  category?: string
  className?: string
}

export default function ExternalDataInsights({ keyword, category = 'Electronics', className }: ExternalDataInsightsProps) {
  const [activeTab, setActiveTab] = useState('trends')
  const [isLoading, setIsLoading] = useState(true)
  const [trendsData, setTrendsData] = useState<GoogleTrendsData | null>(null)
  const [socialData, setSocialData] = useState<{
    reddit: SocialMediaAnalysis | null
    tiktok: SocialMediaAnalysis | null
    twitter: SocialMediaAnalysis | null
    youtube: SocialMediaAnalysis | null
  }>({
    reddit: null,
    tiktok: null,
    twitter: null,
    youtube: null
  })
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadExternalData()
  }, [keyword])

  const loadExternalData = async () => {
    setIsLoading(true)
    try {
      // Load data from all external sources
      const [trends, reddit, tiktok, twitter, youtube, intelligence] = await Promise.all([
        ExternalAPIService.getGoogleTrends(keyword),
        ExternalAPIService.getRedditAnalysis(keyword),
        ExternalAPIService.getTikTokAnalysis(keyword),
        ExternalAPIService.getTwitterAnalysis(keyword),
        ExternalAPIService.getYouTubeAnalysis(keyword),
        ExternalAPIService.getMarketIntelligence(keyword, category)
      ])

      setTrendsData(trends)
      setSocialData({ reddit, tiktok, twitter, youtube })
      setMarketIntelligence(intelligence)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load external data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600'
    if (sentiment < -0.3) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getSentimentBadgeColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'bg-green-100 text-green-800'
    if (sentiment < -0.3) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.3) return 'Positive'
    if (sentiment < -0.3) return 'Negative'
    return 'Neutral'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return <ThumbsUp className="h-4 w-4" />
    if (sentiment < -0.3) return <ThumbsDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    const iconClass = "h-4 w-4"
    switch (platform) {
      case 'reddit': return <div className={`${iconClass} bg-orange-500 rounded-full`} />
      case 'tiktok': return <div className={`${iconClass} bg-black rounded-sm`} />
      case 'twitter': return <div className={`${iconClass} bg-blue-400 rounded-full`} />
      case 'youtube': return <div className={`${iconClass} bg-red-500 rounded-sm`} />
      default: return <Globe className={iconClass} />
    }
  }

  const renderSocialMention = (mention: SocialMediaMention) => (
    <div key={mention.id} className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getPlatformIcon(mention.platform)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-gray-900">{mention.author}</span>
              {mention.authorFollowers && (
                <Badge variant="secondary" className="text-xs">
                  {formatNumber(mention.authorFollowers)} followers
                </Badge>
              )}
              <Badge className={getSentimentBadgeColor(mention.sentimentScore)}>
                {getSentimentIcon(mention.sentimentScore)}
                <span className="ml-1">{getSentimentLabel(mention.sentimentScore)}</span>
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={mention.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
          
          <p className="text-sm text-gray-700">{mention.content}</p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(mention.engagement.likes)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="h-3 w-3" />
              <span>{formatNumber(mention.engagement.shares)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{formatNumber(mention.engagement.comments)}</span>
            </div>
            {mention.engagement.views && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(mention.engagement.views)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{mention.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Globe className="h-6 w-6 mr-2 text-blue-600" />
                External Market Intelligence
              </CardTitle>
              <CardDescription>
                Real-time social media sentiment, trends data, and market insights for "{keyword}"
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Updated {lastUpdated.toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm" onClick={loadExternalData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Google Trends</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="intelligence">Market Intelligence</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Mentions</TabsTrigger>
        </TabsList>

        {/* Google Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {trendsData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getTrendIcon(trendsData.interest.trend)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{trendsData.interest.averageValue}</div>
                    <div className="text-sm text-gray-600">Avg Interest</div>
                    <Badge className={trendsData.interest.changePercent > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {trendsData.interest.changePercent > 0 ? '+' : ''}{trendsData.interest.changePercent}%
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{trendsData.relatedQueries.length}</div>
                    <div className="text-sm text-gray-600">Related Queries</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{trendsData.regionalInterest.length}</div>
                    <div className="text-sm text-gray-600">Regions</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.max(...trendsData.seasonality.map(s => s.multiplier)).toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">Peak Season</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rising Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trendsData.relatedQueries.filter(q => q.type === 'rising').slice(0, 5).map((query, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{query.query}</span>
                          <Badge className="bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{query.value}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regional Interest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trendsData.regionalInterest.slice(0, 5).map((region, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{region.region}</span>
                            <span className="font-medium">{region.value}%</span>
                          </div>
                          <Progress value={region.value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seasonal Trends</CardTitle>
                  <CardDescription>Search interest variation throughout the year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {trendsData.seasonality.map((season, index) => (
                      <div key={index} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">{season.month}</div>
                        <div className={`text-sm font-medium ${
                          season.multiplier > 1.2 ? 'text-green-600' :
                          season.multiplier < 0.9 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {season.multiplier.toFixed(1)}x
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(socialData).map(([platform, data]) => (
              data && (
                <Card key={platform}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(platform)}
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                      <Badge className={getSentimentBadgeColor(data.averageSentiment)}>
                        {getSentimentLabel(data.averageSentiment)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{formatNumber(data.totalMentions)}</div>
                        <div className="text-xs text-gray-600">Mentions</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Positive</span>
                          <span>{data.sentimentBreakdown.positive}%</span>
                        </div>
                        <Progress value={data.sentimentBreakdown.positive} className="h-1" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="font-medium">{formatNumber(data.engagementMetrics.averageLikes)}</div>
                          <div className="text-gray-500">Likes</div>
                        </div>
                        <div>
                          <div className="font-medium">{formatNumber(data.engagementMetrics.averageShares)}</div>
                          <div className="text-gray-500">Shares</div>
                        </div>
                        <div>
                          <div className="font-medium">{formatNumber(data.engagementMetrics.averageComments)}</div>
                          <div className="text-gray-500">Comments</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>

          {/* Top Mentions from All Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Social Media Mentions</CardTitle>
              <CardDescription>Most engaging mentions across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(socialData)
                  .filter(data => data !== null)
                  .flatMap(data => data!.topMentions)
                  .sort((a, b) => b.relevanceScore - a.relevanceScore)
                  .slice(0, 5)
                  .map(mention => renderSocialMention(mention))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(socialData).map(([platform, data]) => (
              data && (
                <Card key={platform}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center capitalize">
                      {getPlatformIcon(platform)}
                      <span className="ml-2">{platform} Sentiment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getSentimentColor(data.averageSentiment)}`}>
                          {(data.averageSentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Overall Sentiment</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm">Positive</span>
                          </div>
                          <span className="text-sm font-medium">{data.sentimentBreakdown.positive}%</span>
                        </div>
                        <Progress value={data.sentimentBreakdown.positive} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Minus className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">Neutral</span>
                          </div>
                          <span className="text-sm font-medium">{data.sentimentBreakdown.neutral}%</span>
                        </div>
                        <Progress value={data.sentimentBreakdown.neutral} className="h-2" />
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                            <span className="text-sm">Negative</span>
                          </div>
                          <span className="text-sm font-medium">{data.sentimentBreakdown.negative}%</span>
                        </div>
                        <Progress value={data.sentimentBreakdown.negative} className="h-2" />
                      </div>
                      
                      {data.trendingHashtags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Trending Hashtags</h4>
                          <div className="flex flex-wrap gap-1">
                            {data.trendingHashtags.slice(0, 3).map((hashtag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Hash className="h-3 w-3 mr-1" />
                                {hashtag.replace('#', '')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </TabsContent>

        {/* Market Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          {marketIntelligence && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <ThumbsUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getSentimentColor(marketIntelligence.overallSentiment)}`}>
                      {(marketIntelligence.overallSentiment * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Sentiment</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{marketIntelligence.trendMomentum.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Trend Momentum</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{marketIntelligence.socialBuzz.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Social Buzz</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{marketIntelligence.seasonalityScore.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Seasonality</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Market Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketIntelligence.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketIntelligence.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    Emerging Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketIntelligence.emergingTrends.map((trend, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-800">{trend}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Competitor Mentions Tab */}
        <TabsContent value="competitors" className="space-y-6">
          {marketIntelligence && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Competitor Social Media Presence</CardTitle>
                <CardDescription>Brand mentions and sentiment across social platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketIntelligence.competitorMentions.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{competitor.brand}</h4>
                          <p className="text-sm text-gray-600">{formatNumber(competitor.mentions)} mentions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getSentimentColor(competitor.sentiment)}`}>
                            {(competitor.sentiment * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">Sentiment</div>
                        </div>
                        
                        <Badge className={getSentimentBadgeColor(competitor.sentiment)}>
                          {getSentimentIcon(competitor.sentiment)}
                          <span className="ml-1">{getSentimentLabel(competitor.sentiment)}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}