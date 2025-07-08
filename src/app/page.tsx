'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Activity,
  MessageSquare,
  Target,
  Search,
  DollarSign,
  FileText,
  Rocket
} from 'lucide-react'
import { APIService } from '@/lib/api-service'
import { Product, DailyFeature } from '@/types/api'
import Link from 'next/link'
import { mockTrends } from '@/lib/trends-data'


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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const renderTrendChart = (data: number[]) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const normalizedData = data.map(val => ((val - min) / range) * 100)
    
    return (
      <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <path
          d={`
            M 0,${80 - (normalizedData[0] * 0.7 + 10)}
            ${normalizedData.map((val, i) => {
              if (i === 0) return ''
              const x = (i / (normalizedData.length - 1)) * 400
              const y = 80 - (val * 0.7 + 10)
              return `L ${x},${y}`
            }).join(' ')}
            L 400,80 L 0,80 Z
          `}
          fill="url(#trendGradient)"
        />
        
        <path
          d={`
            M 0,${80 - (normalizedData[0] * 0.7 + 10)}
            ${normalizedData.map((val, i) => {
              if (i === 0) return ''
              const x = (i / (normalizedData.length - 1)) * 400
              const y = 80 - (val * 0.7 + 10)
              return `L ${x},${y}`
            }).join(' ')}
          `}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
        />
      </svg>
    )
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <Badge variant="secondary">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Badge>
              </div>
              <h2 className="text-4xl font-bold text-blue-600 mb-2">Product of the Day</h2>
              <p className="text-gray-600 text-lg">Today's featured Amazon opportunity with comprehensive analysis</p>
            </div>

            <Card className="overflow-hidden">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                        {dailyFeature.product.category}
                      </Badge>
                      <h1 className="text-3xl font-bold mb-3">{dailyFeature.product.title}</h1>
                      <p className="text-xl mb-6 text-blue-100">
                        {dailyFeature.reason} Strong market fundamentals with clear differentiation opportunities.
                      </p>
                      
                      {/* Key Metrics */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{dailyFeature.product.rating}</span>
                          <span className="text-blue-100">({dailyFeature.product.reviewCount.toLocaleString()} reviews)</span>
                        </div>
                        <div className="font-bold text-lg">${dailyFeature.product.price.toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span>BSR: #{dailyFeature.product.bsr.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Image with Opportunity Score */}
                    <div className="relative text-center">
                      <div className="relative inline-block">
                        <img 
                          src={dailyFeature.product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'}
                          alt={dailyFeature.product.title}
                          className="rounded-lg shadow-2xl w-64 h-64 object-cover"
                        />
                        <div className="absolute -top-4 -right-4 bg-yellow-400 text-black rounded-full p-4 shadow-lg">
                          <div className="text-2xl font-bold">{dailyFeature.product.analysis?.opportunityScore || 8.5}</div>
                          <div className="text-xs">Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-8 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${((dailyFeature.product.analysis?.financialAnalysis.estimatedRevenue || 52200) / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-gray-600">Est. Monthly Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {dailyFeature.product.monthlySales?.toLocaleString() || '15,000'}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Sales</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dailyFeature.product.analysis?.competitionAnalysis.competitorCount || 28}
                      </div>
                      <div className="text-sm text-gray-600">Total Competitors</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Summary Card */}
              <CardContent className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Analysis Summary - Takes 2 columns */}
                    <div className="md:col-span-2">
                      <Card className="h-full bg-gradient-to-br from-indigo-50 to-indigo-100 border-2">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">Analysis Summary</CardTitle>
                              <CardDescription className="text-sm">Key insights and opportunities</CardDescription>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-indigo-600">
                                {dailyFeature.product.analysis?.opportunityScore || 8.5}
                              </div>
                              <div className="text-xs text-gray-600">Overall Score</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Progress value={(dailyFeature.product.analysis?.opportunityScore || 8.5) * 10} className="h-2 mb-4" />
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Strengths</h3>
                              <ul className="space-y-1">
                                <li className="text-sm text-gray-700 flex items-start space-x-2">
                                  <Eye className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>High demand with {dailyFeature.product.analysis?.keywordAnalysis.searchVolume.toLocaleString() || '89K'} monthly searches</span>
                                </li>
                                <li className="text-sm text-gray-700 flex items-start space-x-2">
                                  <Eye className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>Growing market (+{dailyFeature.product.analysis?.marketAnalysis.growthRate || 15.2}% YoY)</span>
                                </li>
                                <li className="text-sm text-gray-700 flex items-start space-x-2">
                                  <Eye className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>Strong profit margins ({dailyFeature.product.analysis?.financialAnalysis.profitMargin || 35}%)</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-2">Opportunities</h3>
                              <ul className="space-y-1">
                                <li className="text-sm text-gray-700 flex items-start space-x-2">
                                  <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <span>Underserved premium segment</span>
                                </li>
                                <li className="text-sm text-gray-700 flex items-start space-x-2">
                                  <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <span>Weak competitor listings</span>
                                </li>
                                <li className="text-sm text-gray-700 flex items-start space-x-2">
                                  <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <span>High keyword opportunities</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Key Scores - Single column */}
                    <div className="space-y-4">
                      {/* Demand Score */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Demand</span>
                          </div>
                          <span className="text-xl font-bold text-blue-600">
                            {dailyFeature.product.analysis?.demandScore || 9.2}
                          </span>
                        </div>
                        <Progress value={(dailyFeature.product.analysis?.demandScore || 9.2) * 10} className="h-1.5" />
                      </div>

                      {/* Competition Score */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-sm">Competition</span>
                          </div>
                          <span className="text-xl font-bold text-red-600">
                            {dailyFeature.product.analysis?.competitionScore || 7.8}
                          </span>
                        </div>
                        <Progress value={(dailyFeature.product.analysis?.competitionScore || 7.8) * 10} className="h-1.5" />
                      </div>

                      {/* Financial Score */}
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">Financial</span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {dailyFeature.product.analysis?.feasibilityScore || 8.0}
                          </span>
                        </div>
                        <Progress value={(dailyFeature.product.analysis?.feasibilityScore || 8.0) * 10} className="h-1.5" />
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <Link href="/product-of-the-day">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        View Complete Analysis
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-600 mt-3">
                      Get detailed insights, competitor analysis, and launch strategies
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Debug Link - Remove in production */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Debug: <Link href="/products/smart-bluetooth-sleep-mask-with-built-in-speakers" className="text-blue-600 hover:text-blue-700 underline">
              View Main Product Detail Page (Smart Bluetooth Sleep Mask)
            </Link>
          </p>
        </div>

        {/* The Product Database Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">The Product Database</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Over 150+ ideas researched and analyzed on 150+ business ideas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {trendingProducts.slice(0, 6).map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 h-full">
                  <div className="p-8">
                    {/* Header with product info */}
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/80x80?text=Product'}
                          alt={product.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                            <span className="text-sm text-gray-500">${product.price.toFixed(2)}</span>
                            <span className="text-sm text-gray-500">• {product.reviewCount.toLocaleString()} reviews</span>
                          </div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h2>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">
                            {product.analysis?.opportunityScore || 0}
                          </div>
                          <div className="text-xs text-gray-600">Opportunity</div>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Progress Bars */}
                    <div className="mt-6 pt-6 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs font-medium text-gray-700">Market Intelligence</span>
                          </div>
                          <Progress value={product.analysis?.marketAnalysis ? 85 : 0} className="h-2 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium text-gray-700">Demand Analysis</span>
                          </div>
                          <Progress value={(product.analysis?.demandScore || 0) * 10} className="h-2 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Target className="h-3 w-3 text-red-600" />
                            <span className="text-xs font-medium text-gray-700">Competition</span>
                          </div>
                          <Progress value={(product.analysis?.competitionScore || 0) * 10} className="h-2 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Search className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-gray-700">Keywords</span>
                          </div>
                          <Progress value={product.analysis?.keywordAnalysis ? 80 : 0} className="h-2 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-3 w-3 text-emerald-600" />
                            <span className="text-xs font-medium text-gray-700">Financial</span>
                          </div>
                          <Progress value={product.analysis?.financialAnalysis ? 88 : 0} className="h-2 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-gray-700">Listing</span>
                          </div>
                          <Progress value={75} className="h-2 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Rocket className="h-3 w-3 text-orange-600" />
                            <span className="text-xs font-medium text-gray-700">Launch Strategy</span>
                          </div>
                          <Progress value={82} className="h-2 [&>div]:bg-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/database">
              <Button variant="outline" size="lg" className="bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3">
                Browse the product database
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Trends Section - Amazon Top Search Terms */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Amazon Top Search Terms</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Weekly trending keywords with search volume and conversion data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mockTrends.slice(0, 6).map((trend, index) => (
              <Link key={trend.id} href={`/trends/${trend.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-sm h-full">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {trend.keyword}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              #{trend.searchFrequencyRank}
                            </span>
                            <div className="text-xs text-gray-500">Rank</div>
                          </div>
                          <div>
                            <span className="text-xl font-bold text-gray-900">
                              {formatNumber(trend.weeklySearchVolume)}
                            </span>
                            <div className="text-xs text-gray-500">Volume</div>
                          </div>
                          <div>
                            <span className={`text-xl font-bold ${
                              trend.weeklySearchVolumeGrowth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {trend.weeklySearchVolumeGrowth > 0 ? '+' : ''}{trend.weeklySearchVolumeGrowth.toFixed(1)}%
                            </span>
                            <div className="text-xs text-gray-500">Growth</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search Volume Chart */}
                    <div className="h-20 w-full mb-4">
                      {renderTrendChart(trend.searchVolumeHistory)}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-semibold">{trend.topClickShare.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Click Share</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-semibold">{trend.top3ConversionShare.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Conversion</div>
                      </div>
                    </div>

                    {/* Top ASINs */}
                    <div className="border-t pt-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Top 3 Products</div>
                      <div className="flex items-center gap-2">
                        {trend.top3ASINs.map((asin, i) => (
                          <div key={i} className="flex-1 text-center">
                            <div className="w-12 h-12 mx-auto bg-gray-100 rounded overflow-hidden mb-1">
                              <img
                                src={asin.image}
                                alt={asin.asin}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/48x48?text=Product';
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-600">
                              {asin.clickShare.toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
