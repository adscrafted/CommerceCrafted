import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Package, 
  Star, 
  DollarSign, 
  Users, 
  BarChart3,
  Calendar,
  Clock,
  Target,
  Zap,
  ShoppingCart,
  Award,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { generateProductSlug } from '@/lib/utils/slug'

export const metadata: Metadata = {
  title: 'Product of the Day - CommerceCrafted',
  description: 'Daily featured Amazon product opportunity with comprehensive market analysis'
}

// Mock daily feature data - in production this would come from the API
const getDailyFeature = () => {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
  
  // Rotate through products based on day of year
  const products = [
    {
      id: 'daily_product_1',
      asin: 'B08MVBRNKV',
      title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
      brand: 'LC-dolida',
      category: 'Health & Personal Care',
      price: 29.99,
      rating: 4.3,
      reviewCount: 35678,
      monthlyRevenue: 520000,
      bsr: 2341,
      images: ['https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=600&h=400&fit=crop'],
      opportunityScore: 87,
      demandScore: 85,
      competitionScore: 72,
      profitMargin: 45,
      launchBudget: 8000,
      timeToMarket: 30,
      highlights: [
        'Growing 127% YoY with consistent demand',
        'Premium positioning opportunity in $40-60 range',
        'Untapped niches: travel, meditation, ASMR',
        'Low competition from major brands'
      ],
      whyThisProduct: 'The intersection of sleep wellness and audio technology creates a unique opportunity. Post-pandemic remote work has driven demand for sleep optimization products, while the rise of sleep podcasts and meditation apps creates perfect product-market fit. Competition remains fragmented with no dominant brand.',
      marketAnalysis: {
        size: 450000000,
        growth: 127,
        trend: 'Accelerating growth',
        seasonality: 'Peaks in January (New Year) and November (holidays)'
      },
      competitorAnalysis: {
        topCompetitors: ['MUSICOZY', 'Perytong', 'TOPOINT'],
        marketShare: 'Fragmented market with no brand over 15% share',
        differentiation: 'Premium materials, better sound quality, sleep tracking'
      },
      financialProjection: {
        monthlyUnits: 17334,
        avgSellingPrice: 29.99,
        monthlyRevenue: 520000,
        netProfit: 234000,
        roi: 450
      }
    }
  ]
  
  const selectedProduct = products[dayOfYear % products.length]
  return {
    product: selectedProduct,
    date: today.toISOString().split('T')[0],
    reason: 'High opportunity score with growing market demand'
  }
}

export default function ProductOfTheDayPage() {
  const dailyFeature = getDailyFeature()
  const product = dailyFeature.product
  const slug = generateProductSlug(product.title, product.asin)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">Members Only</Badge>
              <h1 className="text-4xl font-bold text-gray-900">Unlock the Full Idea Report</h1>
              <p className="text-xl text-gray-600 mt-2">
                Save hours of research with the action-ready report including pre-validation, market data, GTM plan, proven frameworks, and more.
              </p>
            </div>
            <Link href="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explore Plans
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Feature Content */}
      <div className="container mx-auto px-4 py-12">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8" />
                <div>
                  <p className="text-blue-100">Daily Idea</p>
                  <CardTitle className="text-3xl">
                    {product.title}
                  </CardTitle>
                </div>
              </div>
              <Badge className="bg-white text-blue-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Product Overview */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Why This Product?</h3>
                  <p className="text-gray-700 leading-relaxed">{product.whyThisProduct}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Opportunity Score</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{product.opportunityScore}%</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Monthly Revenue</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      ${(product.monthlyRevenue / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Key Highlights</h4>
                  <ul className="space-y-2">
                    {product.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Market Analysis */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${(product.marketAnalysis.size / 1000000000).toFixed(1)}B</div>
                  <div className="flex items-center gap-1 text-green-600 mt-2">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm">{product.marketAnalysis.growth}% YoY Growth</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Competition Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={product.competitionScore} className="mb-2" />
                  <div className="text-sm text-gray-600">
                    {product.competitionScore < 70 ? 'Low to Medium' : 'Medium to High'} Competition
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Customer Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-bold">{product.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {product.reviewCount.toLocaleString()} reviews
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Financial Projections */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Units</p>
                    <p className="text-2xl font-bold">{product.financialProjection.monthlyUnits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg. Selling Price</p>
                    <p className="text-2xl font-bold">${product.financialProjection.avgSellingPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${(product.financialProjection.monthlyRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ROI</p>
                    <p className="text-2xl font-bold text-green-600">{product.financialProjection.roi}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* CTA */}
            <div className="text-center">
              <Link href={`/products/${slug}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  See Full Analysis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-600 mt-4">
                Get access to complete market research, competitor analysis, and launch strategies
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}