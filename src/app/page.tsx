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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">CommerceCrafted</h1>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">
                  Product Database
                </Link>
                <Link href="/trends" className="text-gray-600 hover:text-gray-900 font-medium">
                  Trends
                </Link>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                  Admin
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">Login</Button>
              <Button size="sm">Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idea of the Day Section */}
        {dailyFeature && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Product of the Day</h2>
              <div className="flex items-center justify-center space-x-4">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <ChevronLeft className="h-5 w-5 text-gray-400" />
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Image and Basic Info */}
                  <div className="space-y-6">
                    <div className="aspect-square bg-white rounded-lg border overflow-hidden">
                      <img
                        src={dailyFeature.product.imageUrls[0]}
                        alt={dailyFeature.product.title}
                        className="w-full h-full object-contain p-8"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.floor(dailyFeature.product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="font-medium">{dailyFeature.product.rating}</span>
                        <span className="text-gray-500">({dailyFeature.product.reviewCount.toLocaleString()} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Analysis */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {dailyFeature.product.title}
                      </h3>
                      <p className="text-lg text-gray-600 mb-4">
                        {formatCurrency(dailyFeature.product.price)}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{dailyFeature.product.category}</Badge>
                        <Badge variant="secondary">{dailyFeature.product.brand}</Badge>
                        <Badge className="bg-green-100 text-green-800">High Opportunity</Badge>
                      </div>
                    </div>

                    {dailyFeature.product.analysis && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {dailyFeature.product.analysis.opportunityScore}/10
                            </div>
                            <div className="text-sm text-gray-600">Opportunity</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(dailyFeature.product.analysis.financialAnalysis.estimatedRevenue)}
                            </div>
                            <div className="text-sm text-gray-600">Est. Revenue</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Demand Score</span>
                            <span className="text-sm">{dailyFeature.product.analysis.demandScore}/10</span>
                          </div>
                          <Progress value={dailyFeature.product.analysis.demandScore * 10} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Competition</span>
                            <span className="text-sm">{dailyFeature.product.analysis.competitionScore}/10</span>
                          </div>
                          <Progress value={dailyFeature.product.analysis.competitionScore * 10} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Feasibility</span>
                            <span className="text-sm">{dailyFeature.product.analysis.feasibilityScore}/10</span>
                          </div>
                          <Progress value={dailyFeature.product.analysis.feasibilityScore * 10} className="h-2" />
                        </div>

                        <Link href={`/products/${dailyFeature.product.id}`}>
                          <Button className="w-full">
                            View Full Analysis
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Product Database</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dive into deep research and analysis on 100+ high-opportunity products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trendingProducts.slice(0, 6).map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-video bg-white border-b overflow-hidden">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.description.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                Browse All Products
              </Button>
            </Link>
          </div>
        </section>

        {/* Trends Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trends</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover emerging trends and opportunities in 100+ business ideas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.map((trend) => (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {trend.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {trend.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {trend.growth}
                      </div>
                      <div className="text-xs text-gray-500">Growth</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {trend.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <BarChart3 className="h-4 w-4" />
                      <span>{trend.volume}</span>
                      <span className="text-xs">Volume</span>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/trends">
              <Button variant="outline" size="lg">
                See All Trends
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
