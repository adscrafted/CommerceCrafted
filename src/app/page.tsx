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
import Image from 'next/image'
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
            {/* Header with Navigation */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">Product of the Day</h2>
              <div className="flex items-center justify-center gap-6 mb-2">
                <Link href="/products/smart-bluetooth-sleep-mask-with-built-in-speakers">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                </Link>
                
                <div className="text-gray-600 font-medium">
                  July 10, 2025
                </div>
                
                <Link href="/next-product">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                  >
                    Next Product
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
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
                    
                    {/* Product Image */}
                    <div className="relative text-center">
                      <div className="relative inline-block">
                        <Image 
                          src={dailyFeature.product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'}
                          alt={dailyFeature.product.title}
                          width={256}
                          height={256}
                          className="rounded-lg shadow-2xl w-64 h-64 object-cover"
                        />
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

              {/* Analysis Cards Section */}
              <CardContent className="px-8 pb-8">
                <div className="mb-8 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Product Analysis</h2>
                  <p className="text-gray-600">Deep-dive analysis across 8 key dimensions</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Opportunity Score Card - Spans 2 columns */}
                  <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <BarChart3 className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Opportunity Score</CardTitle>
                            <CardDescription className="text-sm">Overall product opportunity rating</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-indigo-600">{dailyFeature.product.analysis?.opportunityScore || 87}</div>
                          <div className="text-xs text-gray-600">Overall</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={dailyFeature.product.analysis?.opportunityScore || 87} className="h-2 mb-3" />
                      <p className="text-sm text-gray-700 mb-3">
                        This comprehensive score combines all analysis dimensions to give you an overall product opportunity rating.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white/50 rounded">
                          <div className="text-2xl font-bold text-green-600">High</div>
                          <div className="text-xs text-gray-600">Market Opportunity</div>
                        </div>
                        <div className="text-center p-3 bg-white/50 rounded">
                          <div className="text-2xl font-bold text-blue-600">Strong</div>
                          <div className="text-xs text-gray-600">Success Potential</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Intelligence Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <MessageSquare className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Market Intelligence</CardTitle>
                            <CardDescription className="text-sm">Reviews & customer insights</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-yellow-600">88</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={88} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">Sentiment:</span> <span className="font-medium">4.2★</span></div>
                        <div><span className="text-gray-600">Reviews:</span> <span className="font-medium">36.6K</span></div>
                        <div><span className="text-gray-600">Opportunities:</span> <span className="font-medium">4</span></div>
                        <div><span className="text-gray-600">Avatars:</span> <span className="font-medium">3 Types</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Demand Analysis Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <TrendingUp className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Demand Analysis</CardTitle>
                            <CardDescription className="text-sm">Market size & growth</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">92</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={92} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">Trend:</span> <span className="font-medium">Growing</span></div>
                        <div><span className="text-gray-600">Growth:</span> <span className="font-medium">+15%</span></div>
                        <div><span className="text-gray-600">Conv Rate:</span> <span className="font-medium">12.5%</span></div>
                        <div><span className="text-gray-600">Market:</span> <span className="font-medium">$1.2B</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Competition Analysis Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-red-50 to-red-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <Target className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Competition Analysis</CardTitle>
                            <CardDescription className="text-sm">Market positioning</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">78</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={78} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">Competitors:</span> <span className="font-medium">127</span></div>
                        <div><span className="text-gray-600">Avg Price:</span> <span className="font-medium">$27.99</span></div>
                        <div><span className="text-gray-600">Avg Rating:</span> <span className="font-medium">4.2★</span></div>
                        <div><span className="text-gray-600">Avg Reviews:</span> <span className="font-medium">3.4K</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords Analysis Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <Search className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Keywords Analysis</CardTitle>
                            <CardDescription className="text-sm">Search opportunities</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">85</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={85} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">CPC:</span> <span className="font-medium">$1.23</span></div>
                        <div><span className="text-gray-600">Keywords:</span> <span className="font-medium">248</span></div>
                        <div><span className="text-gray-600">Revenue:</span> <span className="font-medium">$454K</span></div>
                        <div><span className="text-gray-600">Competition:</span> <span className="font-medium">Medium</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Analysis Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <DollarSign className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Financial Analysis</CardTitle>
                            <CardDescription className="text-sm">Profitability & ROI</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">88</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={88} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">Revenue:</span> <span className="font-medium">$52K</span></div>
                        <div><span className="text-gray-600">Profit:</span> <span className="font-medium">$18.2K</span></div>
                        <div><span className="text-gray-600">Margin:</span> <span className="font-medium">35%</span></div>
                        <div><span className="text-gray-600">ROI:</span> <span className="font-medium">142%</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Listing Optimization Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <FileText className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Listing Optimization</CardTitle>
                            <CardDescription className="text-sm">Title, images & content</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">82</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={82} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">Title Score:</span> <span className="font-medium">85%</span></div>
                        <div><span className="text-gray-600">Image Score:</span> <span className="font-medium">78%</span></div>
                        <div><span className="text-gray-600">A+ Content:</span> <span className="font-medium">Ready</span></div>
                        <div><span className="text-gray-600">Video:</span> <span className="font-medium">3 Types</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Launch Strategy Card */}
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-orange-50 to-orange-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <Rocket className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Launch Strategy</CardTitle>
                            <CardDescription className="text-sm">90-day roadmap</CardDescription>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600">90</div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={90} className="h-2 mb-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-gray-600">Price:</span> <span className="font-medium">$19.99</span></div>
                        <div><span className="text-gray-600">Reviews:</span> <span className="font-medium">100+</span></div>
                        <div><span className="text-gray-600">PPC:</span> <span className="font-medium">$75/day</span></div>
                        <div><span className="text-gray-600">Timeline:</span> <span className="font-medium">90 days</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CTA */}
                <div className="text-center mb-8">
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

                {/* Debug Link */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Debug: <Link href="/products/smart-bluetooth-sleep-mask-with-built-in-speakers" className="text-blue-600 hover:text-blue-700 underline">
                      View Main Product Detail Page (Smart Bluetooth Sleep Mask)
                    </Link>
                  </p>
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

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {trendingProducts.slice(0, 6).map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 h-full">
                  <div className="p-8">
                    {/* Header with product info */}
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/80x80?text=Product'}
                          alt={product.title}
                          width={80}
                          height={80}
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
                    <div className="h-32 w-full">
                      {renderTrendChart(trend.searchVolumeHistory)}
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
