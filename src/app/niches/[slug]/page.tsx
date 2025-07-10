'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
  Package
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/niche-service'

interface NichePageProps {
  params: Promise<{ slug: string }>
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

export default function NichePage({ params }: NichePageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [nicheData, setNicheData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)
        const data = await getNicheBySlug(resolvedParams.slug)
        setNicheData(data)
      } catch (error) {
        console.error('Error loading niche data:', error)
        setNicheData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

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
        alert('Niche analysis saved to your account!')
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
          title: nicheData?.nicheName,
          text: `Check out this Amazon niche opportunity with a ${nicheData?.opportunityScore} opportunity score!`,
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

  if (loading || status === 'loading' || !nicheData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return <MembershipGate productTitle={nicheData.nicheName} productImage="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop" />
  }

  const userTier = session.user?.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={nicheData.nicheName} productImage="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop" />
  }

  const analysisCards = [
    {
      title: 'Market Intelligence',
      score: nicheData.scores.intelligence,
      icon: MessageSquare,
      description: 'Reviews, sentiment & customer insights',
      href: `/niches/${slug}/intelligence`,
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      metrics: [
        { label: 'Sentiment', value: `${nicheData.intelligenceData.sentimentScore}★` },
        { label: 'Total Reviews', value: `${(nicheData.intelligenceData.totalReviews / 1000).toFixed(1)}K` },
        { label: 'Opportunities', value: `${nicheData.intelligenceData.opportunities.length}` },
        { label: 'Avatars', value: `${nicheData.intelligenceData.customerAvatars.length} Types` }
      ]
    },
    {
      title: 'Demand Analysis',
      score: nicheData.scores.demand,
      icon: TrendingUp,
      description: 'Market size, search volume & customer segments',
      href: `/niches/${slug}/demand`,
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      metrics: [
        { label: 'Market Trend', value: 'Growing' },
        { label: 'Market Growth', value: nicheData.demandData.searchTrend },
        { label: 'Conversion Rate', value: `${nicheData.demandData.conversionRate}%` },
        { label: 'Market Size', value: `$${(nicheData.marketOverview.nicheMarketSize / 1000000).toFixed(0)}M` }
      ]
    },
    {
      title: 'Competition Analysis',
      score: nicheData.scores.competition,
      icon: Target,
      description: 'Competitor landscape & market positioning',
      href: `/niches/${slug}/competition`,
      gradient: 'bg-gradient-to-br from-red-50 to-red-100',
      metrics: [
        { label: 'Competitors', value: nicheData.competitionData.totalCompetitors.toString() },
        { label: 'Avg Price', value: `$${nicheData.competitionData.averagePrice}` },
        { label: 'Avg Rating', value: `${nicheData.competitionData.averageRating}★` },
        { label: 'Avg Reviews', value: nicheData.competitionData.averageReviews.toLocaleString() }
      ]
    },
    {
      title: 'Keywords Analysis',
      score: nicheData.scores.keywords,
      icon: Search,
      description: 'Keyword opportunities & search terms',
      href: `/niches/${slug}/keywords`,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      metrics: [
        { label: 'Primary CPC', value: `$${nicheData.keywordsData.primaryKeyword.cpc}` },
        { label: 'Total Keywords', value: nicheData.keywordsData.totalKeywords.toString() },
        { label: 'Keyword Revenue', value: `$${(nicheData.keywordsData.keywordRevenue / 1000).toFixed(0)}K` },
        { label: 'Competition', value: nicheData.keywordsData.primaryKeyword.competition }
      ]
    },
    {
      title: 'Financial Analysis',
      score: nicheData.scores.financial,
      icon: DollarSign,
      description: 'Profitability, pricing & ROI projections',
      href: `/niches/${slug}/financial`,
      gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      metrics: [
        { label: 'Monthly Revenue', value: `$${(nicheData.financialData.monthlyProjections.revenue / 1000).toFixed(0)}K` },
        { label: 'Monthly Profit', value: `$${(nicheData.financialData.monthlyProjections.profit / 1000).toFixed(1)}K` },
        { label: 'Profit Margin', value: `${nicheData.financialData.profitMargin}%` },
        { label: 'ROI', value: `${nicheData.financialData.monthlyProjections.roi}%` }
      ]
    },
    {
      title: 'Listing Optimization',
      score: nicheData.scores.listing,
      icon: FileText,
      description: 'Title, images, A+ content & video strategy',
      href: `/niches/${slug}/listing`,
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      metrics: [
        { label: 'Title Length', value: `${nicheData.listingData.recommendedTitle.length} chars` },
        { label: 'Bullet Points', value: `${nicheData.listingData.bulletPoints.length}` },
        { label: 'Keywords', value: `${nicheData.listingData.backendKeywords.length}` },
        { label: 'Images', value: `${nicheData.listingData.mainImageRecommendations.length}` }
      ]
    },
    {
      title: 'Launch Strategy',
      score: nicheData.scores.launch,
      icon: Rocket,
      description: '90-day roadmap & growth tactics',
      href: `/niches/${slug}/launch`,
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      metrics: [
        { label: 'Launch Price', value: `$${nicheData.launchData.launchPrice}` },
        { label: 'Target Reviews', value: '100+' },
        { label: 'PPC Budget', value: `$${nicheData.launchData.week1Strategy.ppcBudget}/day` },
        { label: 'Timeline', value: '90 days' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Niche Analysis
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {nicheData.category}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{nicheData.nicheName}</h1>
              <p className="text-xl mb-6 text-purple-100">Comprehensive market analysis and opportunity assessment</p>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleSaveAnalysis}
                  disabled={isSaved}
                  className="bg-white text-purple-600 hover:bg-gray-100"
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
            
            {/* Top Products Preview */}
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Top Products in Niche
              </h3>
              <div className="space-y-3">
                {nicheData.topProducts.slice(0, 3).map((product: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
                    <Image 
                      src={product.image}
                      alt={product.title}
                      width={50}
                      height={50}
                      className="rounded w-12 h-12 object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white truncate">
                        {product.title.substring(0, 40)}...
                      </div>
                      <div className="text-xs text-purple-200">
                        ${product.price} • {product.rating}★ • {(product.reviews / 1000).toFixed(1)}K reviews
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${(product.monthlyRevenue / 1000).toFixed(0)}K</div>
                      <div className="text-xs text-purple-200">Monthly</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${(nicheData.marketOverview.nicheMarketSize / 1000000).toFixed(0)}M
              </div>
              <div className="text-sm text-gray-600">Niche Market Size</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {nicheData.marketOverview.totalProducts.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${nicheData.marketOverview.avgSellingPrice}
              </div>
              <div className="text-sm text-gray-600">Avg. Selling Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {nicheData.marketOverview.marketGrowth}
              </div>
              <div className="text-sm text-gray-600">Market Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Score Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Niche Analysis</h2>
          <p className="text-gray-600">Click any analysis below to explore detailed insights and recommendations</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analysis Summary Card - Takes 2 slots */}
          <div className="md:col-span-2">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Niche Summary</CardTitle>
                      <CardDescription className="text-sm">Key insights and opportunities</CardDescription>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold text-indigo-600`}>
                      {nicheData.opportunityScore}
                    </div>
                    <div className="text-xs text-gray-600">Overall Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={nicheData.opportunityScore} className="h-2" />
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Market Strengths</h3>
                      <ul className="space-y-1">
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>High demand with {(nicheData.demandData.monthlySearchVolume / 1000).toFixed(0)}K searches/month</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Growing market ({nicheData.marketOverview.marketGrowth} YoY)</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Strong profit margins ({nicheData.financialData.profitMargin}%)</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Multiple sub-niches to explore</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Top Opportunities</h3>
                      <ul className="space-y-1">
                        {nicheData.intelligenceData.opportunities.slice(0, 4).map((opp: any, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                            <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>{opp.opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regular Analysis Cards */}
          {analysisCards.map((card, index) => (
            <AnalysisScoreCard key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}