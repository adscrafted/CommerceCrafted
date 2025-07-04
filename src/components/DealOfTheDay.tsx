'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Mail,
  Share2,
  Bookmark,
  ExternalLink,
  Calendar,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DealProduct {
  id: string
  asin: string
  title: string
  category: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  imageUrl: string
  bsr: number
  opportunityScore: number
  estimatedRevenue: number
  competitionLevel: 'low' | 'medium' | 'high'
  demandTrend: 'rising' | 'stable' | 'declining'
  featuredDate: Date
  headline?: string
  summary?: string
  keyInsights: string[]
  quickStats: {
    marketSize: string
    growthRate: number
    averageMargin: number
    timeToMarket: string
  }
}

interface DealOfTheDayProps {
  className?: string
  onNewsletterSignup?: (email: string) => void
  onProductSave?: (productId: string) => void
  onAnalysisRequest?: (productId: string) => void
}

export default function DealOfTheDay({ 
  className, 
  onNewsletterSignup, 
  onProductSave, 
  onAnalysisRequest 
}: DealOfTheDayProps) {
  const [todaysDeal, setTodaysDeal] = useState<DealProduct | null>(null)
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [showNewsletterForm, setShowNewsletterForm] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Mock data for today's deal - in production this would come from API
  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      const mockDeal: DealProduct = {
        id: 'deal-001',
        asin: 'B08N5WRWNW',
        title: 'Wireless Noise Cancelling Bluetooth Headphones with 30H Playtime',
        category: 'Electronics > Audio > Headphones',
        brand: 'TechSound Pro',
        price: 79.99,
        originalPrice: 129.99,
        discount: 38,
        rating: 4.3,
        reviewCount: 2847,
        imageUrl: '/api/placeholder/300/300',
        bsr: 8542,
        opportunityScore: 8.5,
        estimatedRevenue: 24500,
        competitionLevel: 'medium',
        demandTrend: 'rising',
        featuredDate: new Date(),
        headline: 'Premium Audio Market Gap - High Demand, Manageable Competition',
        summary: 'This wireless headphones category shows exceptional growth with 34% YoY increase. Strong profit margins and clear differentiation opportunities make this an excellent entry point.',
        keyInsights: [
          'Market growing 34% YoY with $2.1B TAM',
          'Average profit margins of 65-70%',
          'Peak Q4 demand (+85% during holidays)',
          'Clear mid-tier positioning opportunity',
          'Strong consumer price sensitivity at $50-100 range'
        ],
        quickStats: {
          marketSize: '$2.1B',
          growthRate: 34,
          averageMargin: 67,
          timeToMarket: '6-8 weeks'
        }
      }
      setTodaysDeal(mockDeal)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Countdown timer for deal expiration
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      
      const difference = endOfDay.getTime() - now.getTime()
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeRemaining({ hours, minutes, seconds })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const handleNewsletterSignup = () => {
    if (emailInput && onNewsletterSignup) {
      onNewsletterSignup(emailInput)
      setIsSubscribed(true)
      setShowNewsletterForm(false)
      setEmailInput('')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800'
    if (score >= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  if (isLoading) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!todaysDeal) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No deal available for today</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              Deal of the Day
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Hand-picked Amazon opportunity • Updated daily by our research team
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Expires in:</span>
            </div>
            <div className="text-lg font-mono font-bold text-red-600">
              {String(timeRemaining.hours).padStart(2, '0')}:
              {String(timeRemaining.minutes).padStart(2, '0')}:
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Deal Header with Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Image & Basic Info */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img 
                src={todaysDeal.imageUrl} 
                alt={todaysDeal.title}
                className="w-full h-64 object-cover rounded-lg border"
              />
              {todaysDeal.discount && (
                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                  -{todaysDeal.discount}% OFF
                </Badge>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= todaysDeal.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({todaysDeal.reviewCount.toLocaleString()})</span>
              </div>
              <p className="text-sm text-gray-600">BSR: #{todaysDeal.bsr.toLocaleString()}</p>
              <p className="text-sm text-gray-600">ASIN: {todaysDeal.asin}</p>
            </div>
          </div>

          {/* Product Details & Opportunity */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{todaysDeal.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{todaysDeal.brand}</Badge>
                <Badge variant="secondary">{todaysDeal.category.split(' > ')[0]}</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(todaysDeal.price)}
                </div>
                {todaysDeal.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">
                    {formatCurrency(todaysDeal.originalPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Opportunity Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className={`text-xl font-bold ${getScoreColor(todaysDeal.opportunityScore)}`}>
                  {todaysDeal.opportunityScore}/10
                </div>
                <div className="text-xs text-gray-600">Opportunity</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(todaysDeal.estimatedRevenue)}
                </div>
                <div className="text-xs text-gray-600">Est. Revenue</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <Badge className={`text-xs ${getCompetitionColor(todaysDeal.competitionLevel)}`}>
                  {todaysDeal.competitionLevel}
                </Badge>
                <div className="text-xs text-gray-600 mt-1">Competition</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                {getTrendIcon(todaysDeal.demandTrend)}
                <div className="text-sm font-medium capitalize text-purple-900">
                  {todaysDeal.demandTrend}
                </div>
                <div className="text-xs text-gray-600">Demand</div>
              </div>
            </div>

            {/* Headline & Summary */}
            {todaysDeal.headline && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">{todaysDeal.headline}</h4>
                <p className="text-sm text-blue-800">{todaysDeal.summary}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Key Insights */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Key Market Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaysDeal.keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{todaysDeal.quickStats.marketSize}</div>
              <div className="text-xs text-gray-600">Market Size</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{todaysDeal.quickStats.growthRate}%</div>
              <div className="text-xs text-gray-600">Growth Rate</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{todaysDeal.quickStats.averageMargin}%</div>
              <div className="text-xs text-gray-600">Avg Margin</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{todaysDeal.quickStats.timeToMarket}</div>
              <div className="text-xs text-gray-600">Time to Market</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              size="lg" 
              onClick={() => onAnalysisRequest?.(todaysDeal.id)}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Get Full Analysis</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onProductSave?.(todaysDeal.id)}
              className="flex items-center space-x-2"
            >
              <Bookmark className="h-4 w-4" />
              <span>Save Product</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Amazon</span>
            </Button>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-purple-900">Never Miss a Deal</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Get tomorrow's deal delivered to your inbox every morning at 6 AM EST.
                </p>
                
                {!isSubscribed && !showNewsletterForm && (
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowNewsletterForm(true)}
                  >
                    Subscribe to Daily Deals
                  </Button>
                )}

                {showNewsletterForm && !isSubscribed && (
                  <div className="flex space-x-2 mt-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button size="sm" onClick={handleNewsletterSignup}>
                      Subscribe
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowNewsletterForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {isSubscribed && (
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      You're subscribed! Check your email for confirmation.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}