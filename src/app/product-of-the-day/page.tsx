'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useAuth } from '@/lib/supabase/auth-context'
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
  ChevronLeft,
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


// Score card component with debug mode support
const AnalysisScoreCard = ({ 
  title, 
  score, 
  icon: Icon, 
  description, 
  href, 
  gradient,
  metrics,
  showDebugUnlocked = false
}: {
  title: string
  score: number
  icon: any
  description: string
  href: string
  gradient: string
  metrics?: { label: string; value: string }[]
  showDebugUnlocked?: boolean
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

  if (showDebugUnlocked) {
    // Show full content without membership gate (debug mode)
    return (
      <Card className={`h-full transition-all duration-300 border-2 ${gradient}`}>
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
          <Progress value={score} className="h-2 mb-3" />
          {metrics && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {metrics.map((metric, index) => (
                <div key={index}>
                  <span className="text-gray-600">{metric.label}:</span> <span className="font-medium">{metric.value}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-800 font-medium">✓ Full Analysis Available</div>
            <div className="text-xs text-green-600 mt-1">Complete insights and recommendations included</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Regular locked version (shows membership gate)
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
          <Progress value={score} className="h-2 mb-3" />
          {metrics && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {metrics.map((metric, index) => (
                <div key={index}>
                  <span className="text-gray-600">{metric.label}:</span> <span className="font-medium">{metric.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Mock daily feature data - in production this would come from the API
const getDailyFeature = () => {
  // Use current date
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
        trends: ['Sleep wellness growth', 'Remote work trend', 'Audio technology boom'],
        seasonality: 'medium',
        marketMaturity: 'growing'
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
  // Remove auth dependency since this is a public page
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showDebugUnlocked, setShowDebugUnlocked] = useState(false)

  const dailyFeature = getDailyFeature()
  const product = dailyFeature.product
  const slug = generateProductSlug(product.title, product.asin)
  
  // Use current date formatting
  const dateString = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Product of the day is free for everyone as a preview

  // Create analysis cards matching the product detail page format
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
      {/* Debug Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowDebugUnlocked(!showDebugUnlocked)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          {showDebugUnlocked ? 'Show Locked' : 'Debug Unlocked'}
        </Button>
      </div>

      {/* Header with Navigation */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-blue-600 mb-8">Product of the Day</h1>
            
            {/* Navigation */}
            <div className="flex items-center justify-center space-x-8">
              <Link href="/products/smart-bluetooth-sleep-mask-with-built-in-speakers" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Link>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{dateString}</span>
              </div>
              
              <Link href="/next-product" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <span>Next Product</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Daily Amazon Opportunity
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Free Preview
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
              <p className="text-xl mb-6 text-blue-100">{product.whyThisProduct}</p>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveAnalysis}
                  disabled={isSaved}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                  {isSaved ? 'Saved!' : 'Save Analysis'}
                </Button>
                <Button 
                  onClick={handleShareReport}
                  disabled={isSharing}
                  variant="outline" 
                  className="bg-white/10 border-white text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {isSharing ? 'Sharing...' : 'Share Report'}
                </Button>
              </div>
            </div>
            
            {/* Product Image */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-80 h-80 relative">
                  <Image 
                    src={product.images[0]}
                    alt={product.title}
                    width={320}
                    height={320}
                    className="rounded-lg shadow-2xl w-full h-full object-cover"
                  />
                  <div className="absolute -top-4 -right-4 bg-yellow-400 text-black rounded-full p-3">
                    <Crown className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                ${product.financialProjection.monthlyRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Est. Monthly Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${product.price}
              </div>
              <div className="text-sm text-gray-600">Avg. Selling Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {product.competitorAnalysis.topCompetitors.length || 3}
              </div>
              <div className="text-sm text-gray-600">Total Competitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Score Cards - Conditional Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Product Analysis</h2>
          <p className="text-gray-600">
            {showDebugUnlocked 
              ? "Full analysis available to all users as part of our daily product showcase"
              : "Click any analysis below to explore detailed insights and recommendations"
            }
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analysis Summary Card - Takes 2 slots */}
          <div className="md:col-span-2">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Analysis Summary</CardTitle>
                      <CardDescription className="text-sm">Key insights and opportunities</CardDescription>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold text-indigo-600`}>
                      {product.opportunityScore}
                    </div>
                    <div className="text-xs text-gray-600">Overall Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={product.opportunityScore} className="h-2" />
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Strengths</h3>
                      <ul className="space-y-1">
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>High demand with 45K monthly searches</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Growing market (+{product.marketAnalysis.growth}% YoY)</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Strong profit margins ({product.profitMargin}%)</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Low competition in premium segment</span>
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
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>Expandable product line potential</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regular Analysis Cards */}
          {analysisCards.map((card, index) => (
            <AnalysisScoreCard key={index} {...card} showDebugUnlocked={showDebugUnlocked} />
          ))}
        </div>
      </div>

      {/* Large CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Award className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-4xl font-bold mb-4">
              Love This Analysis? Get More Every Day.
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              This is just a taste of what's possible. Join thousands of successful Amazon sellers who rely on our comprehensive product research to find their next winning opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">1000+</div>
              <div className="text-blue-200">Products Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">40+ hrs</div>
              <div className="text-blue-200">Research Per Product</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">365</div>
              <div className="text-blue-200">Days Per Year</div>
            </div>
          </div>

          <div>
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                Unlock Full Access
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}