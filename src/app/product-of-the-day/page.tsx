'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { 
  Star, 
  TrendingUp, 
  DollarSign, 
  Target,
  Users,
  BarChart3,
  Heart,
  Share2,
  Globe,
  Crown,
  CheckCircle,
  FileText,
  MessageSquare,
  Search,
  ArrowUp,
  ArrowRight,
  ChevronRight,
  Rocket,
  Package,
  Calendar,
  Clock,
  Zap,
  ShoppingCart,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { MembershipGate } from '@/components/MembershipGate'
import { generateProductSlug } from '@/lib/utils/slug'


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

// Score card component
const AnalysisScoreCard = ({ 
  title, 
  score, 
  icon: Icon, 
  description, 
  href, 
  gradient,
  metrics 
}: {
  title: string
  score: number
  icon: any
  description: string
  href: string
  gradient: string
  metrics?: { label: string; value: string }[]
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  return (
    <Link href={href} className="h-full">
      <Card className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 ${gradient}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Icon className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-xs text-gray-600">{getScoreLabel(score)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={score} className="h-2" />
            {metrics && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="text-center p-2 bg-white/50 rounded">
                    <div className="text-xs text-gray-600">{metric.label}</div>
                    <div className="text-sm font-semibold text-gray-900">{metric.value}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-end text-sm text-blue-600 font-medium">
              View Analysis
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ProductOfTheDayPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const dailyFeature = getDailyFeature()
  const product = dailyFeature.product
  const slug = generateProductSlug(product.title, product.asin)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveAnalysis = async () => {
    if (isSaved) return
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSaved(true)
      
      setTimeout(() => {
        alert('Analysis saved to your account!')
      }, 100)
    } catch (error) {
      alert('Failed to save analysis. Please try again.')
    }
  }

  const handleShareReport = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out this Amazon product opportunity with an ${product.opportunityScore} opportunity score!`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      const textarea = document.createElement('textarea')
      textarea.value = window.location.href
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Link copied to clipboard!')
    } finally {
      setIsSharing(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return <MembershipGate productTitle={product.title} productImage={product.images[0]} />
  }

  const userTier = session.user?.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={product.title} productImage={product.images[0]} />
  }

  const analysisCards = [
    {
      title: 'Market Intelligence',
      score: 88,
      icon: MessageSquare,
      description: 'Reviews, sentiment & customer insights',
      href: `/products/${slug}/intelligence`,
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      metrics: [
        { label: 'Sentiment', value: '4.3★' },
        { label: 'Total Reviews', value: '35.7K' },
        { label: 'Opportunities', value: '4' },
        { label: 'Avatars', value: '3 Types' }
      ]
    },
    {
      title: 'Demand Analysis',
      score: product.demandScore,
      icon: TrendingUp,
      description: 'Market size, search volume & customer segments',
      href: `/products/${slug}/demand`,
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      metrics: [
        { label: 'Market Trend', value: 'Growing' },
        { label: 'Market Growth', value: `+${product.marketAnalysis.growth}%` },
        { label: 'Conversion Rate', value: '12.5%' },
        { label: 'Market Size', value: `$${(product.marketAnalysis.size / 1000000).toFixed(0)}M` }
      ]
    },
    {
      title: 'Competition Analysis',
      score: product.competitionScore,
      icon: Target,
      description: 'Competitor landscape & market positioning',
      href: `/products/${slug}/competition`,
      gradient: 'bg-gradient-to-br from-red-50 to-red-100',
      metrics: [
        { label: 'Competitors', value: product.competitorAnalysis.topCompetitors.length.toString() },
        { label: 'Avg Price', value: `$${product.price.toFixed(2)}` },
        { label: 'Avg Rating', value: `${product.rating}★` },
        { label: 'Avg Reviews', value: product.reviewCount.toLocaleString() }
      ]
    },
    {
      title: 'Keywords Analysis',
      score: 85,
      icon: Search,
      description: 'Keyword opportunities & search terms',
      href: `/products/${slug}/keywords`,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      metrics: [
        { label: 'Primary CPC', value: '$1.23' },
        { label: 'Total Keywords', value: '248' },
        { label: 'Keyword Revenue', value: '$454K' },
        { label: 'Competition', value: 'Medium' }
      ]
    },
    {
      title: 'Financial Analysis',
      score: 88,
      icon: DollarSign,
      description: 'Profitability, costs & ROI projections',
      href: `/products/${slug}/financial`,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      metrics: [
        { label: 'Monthly Revenue', value: `$${product.financialProjection.monthlyRevenue.toLocaleString()}` },
        { label: 'Profit Margin', value: `${product.profitMargin}%` },
        { label: 'ROI', value: `${product.financialProjection.roi}%` },
        { label: 'Break-even', value: '3 months' }
      ]
    },
    {
      title: 'Listing Optimization',
      score: 82,
      icon: FileText,
      description: 'Title, bullets & image recommendations',
      href: `/products/${slug}/listing`,
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      metrics: [
        { label: 'Title Score', value: '85/100' },
        { label: 'Images Needed', value: '7' },
        { label: 'A+ Content', value: 'Yes' },
        { label: 'Video', value: 'Recommended' }
      ]
    },
    {
      title: 'Launch Strategy',
      score: 90,
      icon: Rocket,
      description: 'PPC, pricing & promotion strategies',
      href: `/products/${slug}/launch`,
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      metrics: [
        { label: 'Launch Budget', value: `$${product.launchBudget.toLocaleString()}` },
        { label: 'PPC Budget', value: '$2.5K' },
        { label: 'Time to Profit', value: '45 days' },
        { label: 'Strategy', value: 'Aggressive' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Badge>
                <Badge className="bg-green-500/20 text-green-100 border-green-300/30">
                  Product of the Day
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              <p className="text-xl text-blue-100 max-w-3xl">
                {product.whyThisProduct}
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur rounded-lg p-6">
              <div className="text-5xl font-bold mb-2">{product.opportunityScore}</div>
              <div className="text-sm text-blue-100">Opportunity Score</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSaveAnalysis}
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved to Account
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Save Analysis
                </>
              )}
            </Button>
            <Button 
              onClick={handleShareReport}
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
              disabled={isSharing}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share Report'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Overview Card */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image and Basic Info */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-6">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="font-semibold">{product.category}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Brand</div>
                    <div className="font-semibold">{product.brand}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="font-semibold text-lg">${product.price.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">BSR</div>
                    <div className="font-semibold">#{product.bsr.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              {/* Key Metrics and Highlights */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Product Performance</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ${product.financialProjection.monthlyRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Monthly Sales</span>
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {product.financialProjection.monthlyUnits.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Net Profit</span>
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        ${product.financialProjection.netProfit.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">ROI</span>
                        <ArrowUpRight className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {product.financialProjection.roi}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Key Success Factors</h4>
                  <ul className="space-y-3">
                    {product.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">Quick Win Opportunity</h5>
                      <p className="text-sm text-gray-700">
                        This product offers a rare combination of high demand ({product.demandScore}/100) 
                        and manageable competition ({product.competitionScore}/100), making it ideal for 
                        new sellers looking to establish a foothold in the market.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Scores Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprehensive Analysis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {analysisCards.map((card, index) => (
              <AnalysisScoreCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Market Analysis Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Market Analysis</CardTitle>
            <CardDescription>Comprehensive market intelligence and opportunity assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Market Size
                  </h4>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${(product.marketAnalysis.size / 1000000000).toFixed(1)}B
                </div>
                <p className="text-sm text-gray-600">
                  Total addressable market with {product.marketAnalysis.trend}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Growth Rate
                  </h4>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{product.marketAnalysis.growth}%
                </div>
                <p className="text-sm text-gray-600">
                  Year-over-year growth with seasonal peaks in {product.marketAnalysis.seasonality}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Market Maturity
                  </h4>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Growing
                </div>
                <p className="text-sm text-gray-600">
                  Early-stage market with room for new entrants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competition Analysis Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Competition Landscape</CardTitle>
            <CardDescription>Understanding the competitive environment and positioning opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">Market Position</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Competition Level</span>
                      <span className="text-sm font-medium">{product.competitorAnalysis.marketShare}</span>
                    </div>
                    <Progress value={product.competitionScore} className="h-2" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {product.competitorAnalysis.differentiation}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Top Competitors</h4>
                <div className="space-y-3">
                  {product.competitorAnalysis.topCompetitors.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="font-medium">{competitor}</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Projections Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Financial Projections</CardTitle>
            <CardDescription>Revenue, profit, and ROI calculations based on market data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Monthly Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${product.financialProjection.monthlyRevenue.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Monthly Units</div>
                <div className="text-2xl font-bold text-gray-900">
                  {product.financialProjection.monthlyUnits.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Net Profit</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${product.financialProjection.netProfit.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <ArrowUpRight className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">ROI</div>
                <div className="text-2xl font-bold text-gray-900">
                  {product.financialProjection.roi}%
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-900 mb-1">Profitability Timeline</h5>
                  <p className="text-sm text-gray-700">
                    Based on current market conditions, you can expect to reach profitability within 
                    3-4 months with an initial investment of ${product.launchBudget.toLocaleString()}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Launch This Product?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get instant access to our complete product research toolkit, including supplier contacts, 
            keyword strategies, and step-by-step launch guides.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href={`/products/${slug}`}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                View Full Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                Upgrade to Pro
                <Crown className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}