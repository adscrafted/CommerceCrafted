'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  TrendingUp, 
  DollarSign, 
  Target,
  ArrowLeft,
  Package,
  Users,
  MessageSquare,
  BarChart3,
  Lightbulb,
  ShoppingCart,
  ExternalLink
} from 'lucide-react'
import { APIService } from '@/lib/api-service'
import { Product } from '@/types/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
      
      try {
        setError(null)
        const productData = await APIService.getProductById(resolvedParams.id)
        if (!productData) {
          notFound()
          return
        }
        setProduct(productData)
      } catch (error) {
        console.error('Failed to load product:', error)
        setError(error instanceof Error ? error.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
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
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">CommerceCrafted</h1>
              </div>
              <nav className="flex items-center space-x-8">
                <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">Products</Link>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">Admin</Link>
                <Button>Sign In</Button>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
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
              Failed to Load Product
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

  if (!product) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CommerceCrafted</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium">Products</Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">Admin</Link>
              <Button>Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Product Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
              <img
                src={product.imageUrls[0]}
                alt={product.title}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                <Badge variant="secondary">{product.brand}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{product.rating}</span>
                  <span className="text-gray-500 ml-1">({product.reviewCount.toLocaleString()} reviews)</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-green-600 mb-4">
                ${product.price}
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            {/* Opportunity Score Overview */}
            {product.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Opportunity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(product.analysis.opportunityScore)}`}>
                        {product.analysis.opportunityScore}/10
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                      <div className={`text-lg font-medium ${getScoreColor(product.analysis.opportunityScore)} mt-1`}>
                        {getScoreLabel(product.analysis.opportunityScore)}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Demand</span>
                          <span className={getScoreColor(product.analysis.demandScore)}>
                            {product.analysis.demandScore}/10
                          </span>
                        </div>
                        <Progress value={product.analysis.demandScore * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Competition</span>
                          <span className={getScoreColor(product.analysis.competitionScore)}>
                            {product.analysis.competitionScore}/10
                          </span>
                        </div>
                        <Progress value={product.analysis.competitionScore * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Feasibility</span>
                          <span className={getScoreColor(product.analysis.feasibilityScore)}>
                            {product.analysis.feasibilityScore}/10
                          </span>
                        </div>
                        <Progress value={product.analysis.feasibilityScore * 10} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Save Product
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Amazon
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Analysis Tabs */}
        {product.analysis && (
          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="competition">Competition</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="supply">Supply Chain</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Analysis
                  </CardTitle>
                  <CardDescription>
                    Revenue projections and profitability metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${(product.analysis.financialAnalysis.estimatedRevenue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-gray-600">Estimated Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {product.analysis.financialAnalysis.profitMargin}%
                      </div>
                      <div className="text-sm text-gray-600">Profit Margin</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {product.analysis.financialAnalysis.breakEvenUnits}
                      </div>
                      <div className="text-sm text-gray-600">Break-even Units</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {product.analysis.financialAnalysis.roi}%
                      </div>
                      <div className="text-sm text-gray-600">Expected ROI</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Analysis
                  </CardTitle>
                  <CardDescription>
                    Market size, growth trends, and seasonality patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Market Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Market Size:</span>
                          <span className="font-medium">{product.analysis.marketAnalysis.marketSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth Rate:</span>
                          <span className="font-medium text-green-600">
                            +{product.analysis.marketAnalysis.growthRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seasonality:</span>
                          <span className="font-medium">{product.analysis.marketAnalysis.seasonality}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Market Trends</h4>
                      <div className="space-y-2">
                        {product.analysis.marketAnalysis.trends.map((trend, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{trend}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competition" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Competition Analysis
                  </CardTitle>
                  <CardDescription>
                    Competitive landscape and market positioning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Competition Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Competitors:</span>
                          <span className="font-medium">{product.analysis.competitionAnalysis.competitorCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Rating:</span>
                          <span className="font-medium">{product.analysis.competitionAnalysis.averageRating}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price Range:</span>
                          <span className="font-medium">
                            ${product.analysis.competitionAnalysis.priceRange.min} - ${product.analysis.competitionAnalysis.priceRange.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Market Share:</span>
                          <span className="font-medium">{product.analysis.competitionAnalysis.marketShare}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Keyword Analysis
                  </CardTitle>
                  <CardDescription>
                    SEO keywords and search optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Primary Keywords</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.analysis.keywordAnalysis.primaryKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Search Volume:</span>
                          <span className="font-medium">{product.analysis.keywordAnalysis.searchVolume.toLocaleString()}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Difficulty:</span>
                          <span className={`font-medium ${product.analysis.keywordAnalysis.difficulty >= 70 ? 'text-red-600' : product.analysis.keywordAnalysis.difficulty >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {product.analysis.keywordAnalysis.difficulty}/100
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Keyword Suggestions</h4>
                      <div className="space-y-2">
                        {product.analysis.keywordAnalysis.suggestions.map((keyword, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{keyword}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Review Analysis
                  </CardTitle>
                  <CardDescription>
                    Customer sentiment and improvement opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Customer Sentiment</h4>
                      <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                        <div className="text-3xl font-bold text-green-600">
                          {(product.analysis.reviewAnalysis.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Positive Sentiment</div>
                      </div>
                      <h4 className="font-semibold mb-2">Common Complaints</h4>
                      <div className="space-y-1">
                        {product.analysis.reviewAnalysis.commonComplaints.map((complaint, index) => (
                          <div key={index} className="text-sm text-gray-600">• {complaint}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Improvement Opportunities</h4>
                      <div className="space-y-2">
                        {product.analysis.reviewAnalysis.opportunities.map((opportunity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supply" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Supply Chain Analysis
                  </CardTitle>
                  <CardDescription>
                    Manufacturing and sourcing considerations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Supply Chain Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Complexity:</span>
                          <span className="font-medium">{product.analysis.supplyChainAnalysis.complexity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lead Time:</span>
                          <span className="font-medium">{product.analysis.supplyChainAnalysis.leadTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minimum Order:</span>
                          <span className="font-medium">{product.analysis.supplyChainAnalysis.minimumOrder} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available Suppliers:</span>
                          <span className="font-medium">{product.analysis.supplyChainAnalysis.suppliers}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
} 