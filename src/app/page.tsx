'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  Globe,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Activity
} from 'lucide-react'
import { APIService } from '@/lib/api-service'
import { Product, DailyFeature } from '@/types/api'
import Link from 'next/link'

// Trends data structure
interface TrendData {
  id: string
  name: string
  volume: string
  growth: string
  category: string
  description: string
}

// Mock Product Database
interface MockProduct {
  id: string
  title: string
  category: string
  price: string
  rating: number
  reviewCount: string
  imageUrl: string
  opportunityScore: number
  demandScore: number
  competitionScore: number
  profitMargin: number
  roi: number
  description: string
}

const trendingTopics: TrendData[] = [
  {
    id: '1',
    name: 'AI Assistants',
    volume: '2.1M',
    growth: '+234%',
    category: 'Technology',
    description: 'AI-powered virtual assistants revolutionizing customer service and productivity'
  },
  {
    id: '2', 
    name: 'Wireless Earbuds',
    volume: '890K',
    growth: '+156%',
    category: 'Electronics',
    description: 'Premium wireless audio solutions with noise cancellation and smart features'
  },
  {
    id: '3',
    name: 'Smart Home Security',
    volume: '445K', 
    growth: '+189%',
    category: 'Home & Garden',
    description: 'Connected security systems with AI monitoring and mobile integration'
  },
  {
    id: '4',
    name: 'Sustainable Packaging',
    volume: '267K',
    growth: '+98%', 
    category: 'Business',
    description: 'Eco-friendly packaging solutions driving brand differentiation and compliance'
  },
  {
    id: '5',
    name: 'Fitness Trackers',
    volume: '1.2M',
    growth: '+67%',
    category: 'Health',
    description: 'Advanced wearable devices monitoring health metrics and fitness goals'
  },
  {
    id: '6',
    name: 'Electric Vehicles',
    volume: '3.4M',
    growth: '+423%',
    category: 'Automotive', 
    description: 'Electric vehicle market expansion with charging infrastructure growth'
  }
]

const mockProducts: MockProduct[] = [
  {
    id: 'mock-1',
    title: 'Wireless Charging Desk Organizer',
    category: 'Office & Business',
    price: '$89.99',
    rating: 4.6,
    reviewCount: '2.3K',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop',
    opportunityScore: 8.7,
    demandScore: 9.1,
    competitionScore: 6.8,
    profitMargin: 42,
    roi: 215,
    description: 'Premium bamboo desk organizer with built-in wireless charging pad for smartphones and tablets.'
  },
  {
    id: 'mock-2', 
    title: 'Smart Plant Watering System',
    category: 'Home & Garden',
    price: '$129.99',
    rating: 4.4,
    reviewCount: '1.8K',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    opportunityScore: 8.2,
    demandScore: 8.5,
    competitionScore: 7.2,
    profitMargin: 38,
    roi: 185,
    description: 'Automated plant care system with soil moisture sensors and app-controlled watering schedules.'
  },
  {
    id: 'mock-3',
    title: 'Ergonomic Standing Desk Converter',
    category: 'Furniture',
    price: '$199.99',
    rating: 4.5,
    reviewCount: '4.1K',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    opportunityScore: 7.9,
    demandScore: 8.8,
    competitionScore: 7.5,
    profitMargin: 35,
    roi: 165,
    description: 'Height-adjustable desk converter with gas spring mechanism for smooth sit-to-stand transitions.'
  },
  {
    id: 'mock-4',
    title: 'LED Light Therapy Mask',
    category: 'Beauty & Personal Care',
    price: '$149.99',
    rating: 4.3,
    reviewCount: '3.2K',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop',
    opportunityScore: 8.5,
    demandScore: 9.3,
    competitionScore: 6.5,
    profitMargin: 45,
    roi: 225,
    description: 'Professional-grade LED light therapy device for anti-aging and acne treatment at home.'
  },
  {
    id: 'mock-5',
    title: 'Portable Coffee Espresso Maker',
    category: 'Kitchen & Dining',
    price: '$79.99',
    rating: 4.7,
    reviewCount: '5.6K',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
    opportunityScore: 8.0,
    demandScore: 8.7,
    competitionScore: 7.8,
    profitMargin: 40,
    roi: 195,
    description: 'Manual espresso maker for travel and outdoor use, requiring no electricity or pods.'
  },
  {
    id: 'mock-6',
    title: 'Smart Fitness Mirror',
    category: 'Sports & Outdoors',
    price: '$299.99',
    rating: 4.2,
    reviewCount: '1.5K',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    opportunityScore: 8.9,
    demandScore: 9.5,
    competitionScore: 6.2,
    profitMargin: 48,
    roi: 285,
    description: 'Interactive home gym mirror with AI personal trainer and real-time form correction.'
  }
]

export default function HomePage() {
  const [dailyFeature, setDailyFeature] = useState<DailyFeature | null>(null)
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        const [daily, trending] = await Promise.all([
          APIService.getDailyFeature(),
          APIService.getTrendingProducts()
        ])
        setDailyFeature(daily)
        setTrendingProducts(trending)
      } catch (error) {
        console.error('Failed to load homepage data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Poor'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-lg mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Failed to Load Data
            </div>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product of the Day Section */}
        {dailyFeature && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-blue-600 mb-4">Product of the Day</h2>
              <div className="flex items-center justify-center space-x-6">
                <Link href="/previous-ideas" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Previous Product</span>
                </Link>
                <div className="flex items-center space-x-2 text-sm text-gray-500 px-4 py-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <Link href="/next-idea" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-gray-700">Next Product</span>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden border-2 border-blue-100 shadow-xl">
              <CardContent className="p-0">
                {/* Header with Title */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {dailyFeature.product.title}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.floor(dailyFeature.product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="font-medium">{dailyFeature.product.rating}</span>
                    </div>
                    <span className="text-gray-500">({dailyFeature.product.reviewCount.toLocaleString()} reviews)</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      ${dailyFeature.product.price}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Left Side - 2/3 width */}
                  <div className="lg:col-span-2 p-6 bg-white border-r border-gray-100">
                    {/* Main Image and Product Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Product Image */}
                      <div className="md:col-span-1">
                        <div className="aspect-square bg-gray-50 rounded-lg border overflow-hidden">
                          <img
                            src={dailyFeature.product.imageUrls[0]}
                            alt={dailyFeature.product.title}
                            className="w-full h-full object-contain p-4"
                          />
                        </div>
                      </div>

                      {/* Product Details - Fill remaining space */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Category</div>
                            <div className="font-semibold text-gray-900">{dailyFeature.product.category}</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Brand</div>
                            <div className="font-semibold text-gray-900">{dailyFeature.product.brand}</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">BSR</div>
                            <div className="font-semibold text-gray-900">#{dailyFeature.product.bsr}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm text-gray-600 mb-1">Opportunity Score</div>
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {dailyFeature.product.analysis?.opportunityScore || 8.5}/10
                            </div>
                            <div className="text-sm font-medium text-green-700">Excellent</div>
                          </div>
                          
                          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-gray-600 mb-1">Est. Monthly Revenue</div>
                            <div className="text-xl font-bold text-blue-600">
                              {formatCurrency(dailyFeature.product.analysis?.financialAnalysis.estimatedRevenue || 52200)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why This Product Section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Why This Product?</h4>
                      <p className="text-gray-700 leading-relaxed mb-3">{dailyFeature.reason}</p>
                      <Link href={`/products/${dailyFeature.product.id}`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        See why this opportunity matters now →
                      </Link>
                    </div>

                    {/* Key Highlights - Stacked Below */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">Key Highlights</h5>
                        <ul className="space-y-1 mb-3">
                          {dailyFeature.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href={`/products/${dailyFeature.product.id}#highlights`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          See full feature breakdown →
                        </Link>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">Market Context</h5>
                        <p className="text-gray-700 mb-3">{dailyFeature.marketContext}</p>
                        <Link href={`/products/${dailyFeature.product.id}#market`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Explore market trends →
                        </Link>
                      </div>

                      {/* Demand Analysis */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">🔥 Demand Analysis</h5>
                        <p className="text-gray-700 mb-3">
                          Strong consumer demand driven by remote work trends and premium audio preferences. Search volume increasing 127% YoY with consistent seasonal patterns.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-white rounded p-2 border">
                            <span className="font-medium">Search Volume:</span> 89K/month
                          </div>
                          <div className="bg-white rounded p-2 border">
                            <span className="font-medium">Trend:</span> +127% YoY
                          </div>
                        </div>
                        <Link href={`/products/${dailyFeature.product.id}#demand`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          See demand analysis →
                        </Link>
                      </div>

                      {/* Competition Analysis */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">⚡ Competition Level</h5>
                        <p className="text-gray-700 mb-3">
                          Moderate competition with 28 active competitors. Premium segment dominated by established brands, but room for differentiation through features and pricing.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-white rounded p-2 border">
                            <span className="font-medium">Competitors:</span> 28 active
                          </div>
                          <div className="bg-white rounded p-2 border">
                            <span className="font-medium">Avg Rating:</span> 4.2/5 stars
                          </div>
                        </div>
                        <Link href={`/products/${dailyFeature.product.id}#competition`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View competitor analysis →
                        </Link>
                      </div>

                      {/* Keywords Analysis */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">🎯 Top Keywords</h5>
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-gray-700">
                            <span>"noise canceling headphones"</span>
                            <span className="font-medium">89K/mo</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>"wireless headphones premium"</span>
                            <span className="font-medium">34K/mo</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>"best headphones 2024"</span>
                            <span className="font-medium">28K/mo</span>
                          </div>
                        </div>
                        <Link href={`/products/${dailyFeature.product.id}#keywords`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Explore keyword opportunities →
                        </Link>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">💰 Financial Outlook</h5>
                        <p className="text-gray-700 mb-3">
                          High-margin opportunity with 35% gross margins. Break-even at 75 units with potential for $52K monthly revenue at scale.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-white rounded p-2 border">
                            <span className="font-medium">ROI:</span> 185%
                          </div>
                          <div className="bg-white rounded p-2 border">
                            <span className="font-medium">Break-even:</span> 75 units
                          </div>
                        </div>
                        <Link href={`/products/${dailyFeature.product.id}#financial`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          See financial projections →
                        </Link>
                      </div>

                      {/* Customer Avatars */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <h5 className="font-semibold text-gray-900 mb-2">👥 Customer Avatars</h5>
                        <div className="space-y-2 mb-3">
                          <div className="bg-white rounded p-2 border">
                            <div className="font-medium text-gray-800">Remote Professionals (40%)</div>
                            <div className="text-xs text-gray-600">Age 25-40, value productivity and quality</div>
                          </div>
                          <div className="bg-white rounded p-2 border">
                            <div className="font-medium text-gray-800">Audio Enthusiasts (35%)</div>
                            <div className="text-xs text-gray-600">Age 20-45, prioritize sound quality</div>
                          </div>
                          <div className="bg-white rounded p-2 border">
                            <div className="font-medium text-gray-800">Commuters (25%)</div>
                            <div className="text-xs text-gray-600">Age 25-50, need noise cancellation</div>
                          </div>
                        </div>
                        <Link href={`/products/${dailyFeature.product.id}#social`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Learn about target customers →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - 1/3 width - Analysis Breakdown */}
                  <div className="p-6 bg-gray-50">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Analysis Breakdown</h4>
                    
                    {dailyFeature.product.analysis && (
                      <div className="space-y-4">
                        {/* Score Metrics */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Demand Score</span>
                            <span className="text-sm font-bold">{dailyFeature.product.analysis.demandScore}/10</span>
                          </div>
                          <Progress value={dailyFeature.product.analysis.demandScore * 10} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Competition</span>
                            <span className="text-sm font-bold">{dailyFeature.product.analysis.competitionScore}/10</span>
                          </div>
                          <Progress value={dailyFeature.product.analysis.competitionScore * 10} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Feasibility</span>
                            <span className="text-sm font-bold">{dailyFeature.product.analysis.feasibilityScore}/10</span>
                          </div>
                          <Progress value={dailyFeature.product.analysis.feasibilityScore * 10} className="h-2" />
                        </div>

                        {/* Financial Metrics */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-600">
                              {dailyFeature.product.analysis.financialAnalysis.profitMargin}%
                            </div>
                            <div className="text-xs text-gray-600">Profit Margin</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {dailyFeature.product.analysis.financialAnalysis.roi}%
                            </div>
                            <div className="text-xs text-gray-600">ROI</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {dailyFeature.product.analysis.marketAnalysis.growthRate}%
                            </div>
                            <div className="text-xs text-gray-600">Growth Rate</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {dailyFeature.product.analysis.competitionAnalysis.competitorCount}
                            </div>
                            <div className="text-xs text-gray-600">Competitors</div>
                          </div>
                        </div>

                        {/* AI Insights */}
                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mt-6">
                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-purple-600" />
                            AI Insights
                          </h5>
                          <ul className="space-y-2 text-sm">
                            {dailyFeature.aiInsights.map((insight, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-800">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link href={`/products/${dailyFeature.product.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Deep Dive Analysis
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* The Product Database Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">The Product Database</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Over 150+ ideas researched and analyzed on 150+ business ideas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockProducts.map((product, index) => (
              <Card key={product.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Trend Chart Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                        {product.title}
                      </h3>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {product.opportunityScore}/10
                      </Badge>
                    </div>
                    
                    {/* Mock Trend Chart */}
                    <div className="h-16 w-full relative bg-white rounded border">
                      <svg className="w-full h-full" viewBox="0 0 200 50">
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                            <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.1 }} />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M 10,${35 + Math.sin(index) * 5} 
                             Q 50,${30 + Math.sin(index + 1) * 8} 70,${25 + Math.sin(index + 2) * 6} 
                             T 120,${20 + Math.sin(index + 3) * 4} 
                             Q 150,${15 + Math.sin(index + 4) * 3} 190,${10 + Math.sin(index + 5) * 2}
                             L 190,45 L 10,45 Z`}
                          fill={`url(#gradient-${index})`}
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />
                        <path
                          d={`M 10,${35 + Math.sin(index) * 5} 
                             Q 50,${30 + Math.sin(index + 1) * 8} 70,${25 + Math.sin(index + 2) * 6} 
                             T 120,${20 + Math.sin(index + 3) * 4} 
                             Q 150,${15 + Math.sin(index + 4) * 3} 190,${10 + Math.sin(index + 5) * 2}`}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="absolute bottom-1 left-2 text-xs text-gray-500">Search Volume</div>
                      <div className="absolute bottom-1 right-2 text-xs text-green-600 font-medium">
                        +{product.roi}%
                      </div>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-video bg-white border-b overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{product.reviewCount} reviews</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {product.price}
                        </div>
                        <div className="text-xs text-gray-600">Price Point</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {product.profitMargin}%
                        </div>
                        <div className="text-xs text-gray-600">Profit Margin</div>
                      </div>
                    </div>

                    {/* Analysis Preview */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Demand</span>
                        <span className="font-medium text-green-600">
                          {product.demandScore}/10
                        </span>
                      </div>
                      <Progress 
                        value={product.demandScore * 10} 
                        className="h-1.5"
                      />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Competition</span>
                        <span className="font-medium text-orange-600">
                          {product.competitionScore}/10
                        </span>
                      </div>
                      <Progress 
                        value={product.competitionScore * 10} 
                        className="h-1.5"
                      />
                    </div>

                    {/* CTA */}
                    <Link href={`/products/${product.id}`} className="block mt-4">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Analysis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button variant="outline" size="lg" className="bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3">
                Browse the product database
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Trends Section - Enhanced to Match Product of the Day Styling */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Trends</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover emerging trends and search insights across 100+ business ideas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {trendingTopics.slice(0, 6).map((trend, index) => (
              <Card key={trend.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden bg-gradient-to-b from-white to-gray-50">
                <CardContent className="p-0">
                  {/* Header with Gradient */}
                  <div className="bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 p-6 border-b">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl mb-2">
                          {trend.name}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            {trend.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Globe className="h-4 w-4" />
                            <span>Worldwide</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {trend.growth}
                        </div>
                        <div className="text-xs text-gray-500">12 months</div>
                      </div>
                    </div>

                    {/* Enhanced Chart with Professional Styling */}
                    <div className="h-24 w-full bg-white rounded-lg border-2 border-gray-100 p-3 shadow-inner">
                      <div className="h-full relative">
                        <svg className="w-full h-full" viewBox="0 0 300 60">
                          <defs>
                            <linearGradient id={`trend-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: index % 2 === 0 ? '#10B981' : '#3B82F6', stopOpacity: 0.4 }} />
                              <stop offset="100%" style={{ stopColor: index % 2 === 0 ? '#10B981' : '#3B82F6', stopOpacity: 0.1 }} />
                            </linearGradient>
                          </defs>
                          
                          {/* Trend line with enhanced styling */}
                          <path
                            d={`M 20,${45 - (index * 5)} 
                               L 40,${40 - (index * 3)}
                               L 60,${35 - (index * 2)}
                               L 80,${42 - (index * 4)}
                               L 100,${30 - (index * 2)}
                               L 120,${25 - index}
                               L 140,${28 - (index * 1.5)}
                               L 160,${20 - index}
                               L 180,${15 - (index * 0.5)}
                               L 200,${18 - index}
                               L 220,${12 - (index * 0.3)}
                               L 240,${8 - (index * 0.2)}
                               L 260,${10 - (index * 0.1)}
                               L 280,${5}
                               L 280,55 L 20,55 Z`}
                            fill={`url(#trend-gradient-${index})`}
                          />
                          <path
                            d={`M 20,${45 - (index * 5)} 
                               L 40,${40 - (index * 3)}
                               L 60,${35 - (index * 2)}
                               L 80,${42 - (index * 4)}
                               L 100,${30 - (index * 2)}
                               L 120,${25 - index}
                               L 140,${28 - (index * 1.5)}
                               L 160,${20 - index}
                               L 180,${15 - (index * 0.5)}
                               L 200,${18 - index}
                               L 220,${12 - (index * 0.3)}
                               L 240,${8 - (index * 0.2)}
                               L 260,${10 - (index * 0.1)}
                               L 280,${5}`}
                            fill="none"
                            stroke={index % 2 === 0 ? '#10B981' : '#3B82F6'}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          
                          {/* Enhanced data points */}
                          {[20, 60, 100, 140, 180, 220, 260].map((x, pointIndex) => {
                            const y = [45, 35, 30, 28, 15, 12, 10][pointIndex] - (index * (pointIndex * 0.5));
                            return (
                              <circle
                                key={pointIndex}
                                cx={x}
                                cy={y}
                                r="3"
                                fill={index % 2 === 0 ? '#10B981' : '#3B82F6'}
                                className="hover:r-4 transition-all"
                              />
                            );
                          })}
                        </svg>
                        
                        {/* Enhanced chart labels */}
                        <div className="absolute bottom-0 left-0 text-xs text-gray-400 font-medium">Jan 2024</div>
                        <div className="absolute bottom-0 right-0 text-xs text-gray-400 font-medium">Dec 2024</div>
                        <div className="absolute top-0 right-0 text-xs font-semibold bg-white px-2 py-1 rounded border" style={{ color: index % 2 === 0 ? '#10B981' : '#3B82F6' }}>
                          Peak: {100 - index * 15}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="p-6">
                    <p className="text-sm text-gray-700 mb-6 leading-relaxed font-medium">
                      {trend.description}
                    </p>

                    {/* Enhanced Analysis Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                        <div className="text-lg font-bold text-blue-600">
                          {trend.volume}
                        </div>
                        <div className="text-xs text-blue-700 font-medium">Search Volume</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                        <div className="text-lg font-bold text-green-600">
                          {(85 + index * 3)}%
                        </div>
                        <div className="text-xs text-green-700 font-medium">Interest Growth</div>
                      </div>
                    </div>

                    {/* Market Insights Section */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-blue-500" />
                        Market Insights
                      </h5>
                      <div className="space-y-3">
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                          <div className="text-sm font-medium text-purple-800">Ranking Position</div>
                          <div className="text-lg font-bold text-purple-600">#{index + 1}</div>
                        </div>
                      </div>
                    </div>

                    {/* Rising Topics Section */}
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">🔥 Rising Related Topics</h5>
                      <div className="flex flex-wrap gap-2">
                        {[
                          `${trend.name.split(' ')[0]} automation`,
                          `Smart ${trend.name.toLowerCase()}`,
                          `${trend.name} trends`
                        ].map((topic, topicIndex) => (
                          <Badge key={topicIndex} variant="outline" className="text-xs bg-white border-gray-200 hover:bg-gray-50">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced CTA */}
                    <Link href={`/trends/${trend.id}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 hover:from-blue-700 hover:via-green-700 hover:to-purple-700 text-sm font-semibold shadow-lg">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Deep Dive Analysis
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Trends Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {trendingTopics.slice(4).map((trend, index) => (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="h-12 w-full mb-3">
                      <svg className="w-full h-full" viewBox="0 0 100 30">
                        <path
                          d={`M 5,${20 + Math.sin(index) * 3} 
                             L 25,${15 + Math.sin(index + 1) * 4} 
                             L 45,${12 + Math.sin(index + 2) * 2} 
                             L 65,${8 + Math.sin(index + 3) * 3} 
                             L 85,${5 + Math.sin(index + 4) * 2} 
                             L 95,${3}`}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {trend.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{trend.volume}</p>
                    <div className="text-xs font-medium text-green-600">
                      {trend.growth}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/trends">
              <Button variant="outline" size="lg" className="bg-white border-2 border-green-200 text-green-600 hover:bg-green-50 px-8 py-3">
                Explore all trends
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
