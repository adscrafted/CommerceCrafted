'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  Rocket
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { MembershipGate } from '@/components/MembershipGate'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// Helper function to extract ASIN from slug
const extractAsinFromSlug = (slug: string): string => {
  // Slug format: "smart-bluetooth-sleep-mask-with-built-in-speakers"
  // We need to map this to ASIN. For now, we'll use a mapping or extract from the end
  const slugToAsinMap: { [key: string]: string } = {
    'smart-bluetooth-sleep-mask-with-built-in-speakers': 'B08MVBRNKV'
  }
  return slugToAsinMap[slug] || 'B08MVBRNKV' // fallback to our known ASIN
}

// Function to fetch niche data from database
const fetchNicheData = async (slug: string) => {
  try {
    console.log('Fetching niche data for slug:', slug)
    const response = await fetch(`/api/niches/${slug}/data`, {
      cache: 'no-cache' // Ensure fresh data
    })
    
    if (!response.ok) {
      console.error('Failed to fetch niche:', response.status, response.statusText)
      return null
    }
    
    const nicheData = await response.json()
    console.log('Niche data fetched successfully:', nicheData.niche?.name)
    return nicheData
  } catch (error) {
    console.error('Error fetching niche data:', error)
    return null
  }
}

// Function to fetch product from database
const fetchProductData = async (asin: string) => {
  try {
    console.log('Fetching product data for ASIN:', asin)
    const response = await fetch(`/api/database/products/${asin}`, {
      cache: 'no-cache' // Ensure fresh data
    })
    
    if (!response.ok) {
      console.error('Failed to fetch product:', response.status, response.statusText)
      return null
    }
    
    const productData = await response.json()
    console.log('Product data fetched successfully:', productData.title)
    return productData
  } catch (error) {
    console.error('Error fetching product data:', error)
    return null
  }
}

// Fallback mock data in case database fetch fails
const fallbackProductData = {
  id: 'daily_product_1',
  title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
  subtitle: 'Revolutionary sleep technology combining comfort with audio entertainment',
  category: 'Health & Personal Care',
  asin: 'B08MVBRNKV',
  date: 'July 4, 2025',
  mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
  
  // Overall scores
  opportunityScore: 87,
  scores: {
    demand: 92,
    competition: 78,
    keywords: 85,
    listing: 82,
    intelligence: 88,
    launch: 90,
    financial: 88,
    overall: 87
  },
  
  // Financial Data
  financialData: {
    avgSellingPrice: 29.99,
    totalFees: 8.50,
    monthlyProjections: {
      revenue: 52000,
      profit: 18200,
      units: 1735
    }
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
  metrics,
  isLocked = false
}: {
  title: string
  score: number
  icon: any
  description: string
  href: string
  gradient: string
  metrics?: { label: string; value: string }[]
  isLocked?: boolean
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

  const cardContent = (
    <Card className={`h-full transition-all duration-300 border-2 ${isLocked ? 'cursor-default' : 'hover:shadow-lg cursor-pointer hover:border-blue-200'} ${gradient}`}>
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
          {!isLocked && (
            <div className="flex items-center justify-end text-sm text-blue-600 font-medium">
              View Analysis
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLocked) {
    return cardContent
  }

  return (
    <Link href={href} className="h-full">
      {cardContent}
    </Link>
  )
}

export default function ProductPage({ params }: ProductPageProps) {
  // Remove auth dependency since this is now a public page
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showDebugUnlocked, setShowDebugUnlocked] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const currentSlug = resolvedParams.slug
      setSlug(currentSlug)
      
      // First try to fetch niche data
      const nicheData = await fetchNicheData(currentSlug)
      
      if (nicheData && nicheData.niche) {
        console.log('Using niche data with real product image')
        // Transform niche data to match our product data structure
        setProductData({
          ...fallbackProductData,
          title: nicheData.niche.name,
          mainImage: nicheData.niche.mainImage,
          opportunityScore: Math.round(nicheData.niche.avgOpportunityScore || 87),
          financialData: {
            ...fallbackProductData.financialData,
            avgSellingPrice: nicheData.niche.avgPrice || 29.99,
            monthlyProjections: {
              revenue: nicheData.niche.totalRevenue || 52000
            }
          },
          // Store the full niche data for use in child pages
          _nicheData: nicheData
        })
      } else {
        // Fallback to ASIN-based fetch
        const asin = extractAsinFromSlug(currentSlug)
        console.log('Extracted ASIN:', asin, 'from slug:', currentSlug)
        
        const fetchedProduct = await fetchProductData(asin)
        
        if (fetchedProduct) {
          console.log('Using database product data')
          setProductData(fetchedProduct)
        } else {
          console.log('Falling back to mock data')
          setProductData(fallbackProductData)
        }
      }
      
      setLoading(false)
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
          title: currentProduct.title,
          text: `Check out this Amazon product opportunity with a ${currentProduct.opportunityScore} opportunity score!`,
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

  // Since this is now a public page, always show access (or use debug toggle)
  const hasAccess = true // Public page - always has access
  
  // No membership gate needed for public pages
  
  // Use productData if available, otherwise fallback to mock data
  const currentProduct = productData || fallbackProductData

  const analysisCards = [
    {
      title: 'Market Intelligence',
      score: currentProduct.scores.intelligence,
      icon: MessageSquare,
      description: 'Reviews, sentiment & customer insights',
      href: `/products/${slug}/intelligence`,
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      metrics: [
        { label: 'Sentiment', value: '4.2★' },
        { label: 'Total Reviews', value: '36.6K' },
        { label: 'Opportunities', value: '4' },
        { label: 'Avatars', value: '3 Types' }
      ]
    },
    {
      title: 'Demand Analysis',
      score: currentProduct.scores.demand,
      icon: TrendingUp,
      description: 'Market size, search volume & customer segments',
      href: `/products/${slug}/demand`,
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      metrics: [
        { label: 'Market Trend', value: 'Growing' },
        { label: 'Market Growth', value: '+15%' },
        { label: 'Conversion Rate', value: '12.5%' },
        { label: 'Market Size', value: '$1.2B' }
      ]
    },
    {
      title: 'Competition Analysis',
      score: currentProduct.scores.competition,
      icon: Target,
      description: 'Competitor landscape & market positioning',
      href: `/products/${slug}/competition`,
      gradient: 'bg-gradient-to-br from-red-50 to-red-100',
      metrics: [
        { label: 'Competitors', value: '127' },
        { label: 'Avg Price', value: '$27.99' },
        { label: 'Avg Rating', value: '4.2★' },
        { label: 'Avg Reviews', value: '3,421' }
      ]
    },
    {
      title: 'Keywords Analysis',
      score: currentProduct.scores.keywords,
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
      score: currentProduct.scores.financial,
      icon: DollarSign,
      description: 'Profitability, pricing & ROI projections',
      href: `/products/${slug}/financial`,
      gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      metrics: [
        { label: 'Monthly Revenue', value: '$52K' },
        { label: 'Monthly Profit', value: '$18.2K' },
        { label: 'Profit Margin', value: '35%' },
        { label: 'ROI', value: '142%' }
      ]
    },
    {
      title: 'Listing Optimization',
      score: currentProduct.scores.listing,
      icon: FileText,
      description: 'Title, images, A+ content & video strategy',
      href: `/products/${slug}/listing`,
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
      metrics: [
        { label: 'Title Score', value: '85%' },
        { label: 'Image Score', value: '78%' },
        { label: 'A+ Content', value: 'Ready' },
        { label: 'Video Strategy', value: '3 Types' }
      ]
    },
    {
      title: 'Launch Strategy',
      score: currentProduct.scores.launch,
      icon: Rocket,
      description: '90-day roadmap & growth tactics',
      href: `/products/${slug}/launch`,
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      metrics: [
        { label: 'Launch Price', value: '$19.99' },
        { label: 'Target Reviews', value: '100+' },
        { label: 'PPC Budget', value: '$75/day' },
        { label: 'Timeline', value: '90 days' }
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
                  {currentProduct.date}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{currentProduct.title}</h1>
              <p className="text-xl mb-6 text-blue-100">{currentProduct.subtitle}</p>
              
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
                    src={currentProduct.mainImage}
                    alt={currentProduct.title}
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
                ${currentProduct.financialData.monthlyProjections.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Est. Monthly Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${currentProduct.financialData.avgSellingPrice}
              </div>
              <div className="text-sm text-gray-600">Avg. Selling Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                127
              </div>
              <div className="text-sm text-gray-600">Total Competitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Score Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Product Analysis</h2>
          <p className="text-gray-600">Click any analysis below to explore detailed insights and recommendations</p>
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
                      {currentProduct.opportunityScore}
                    </div>
                    <div className="text-xs text-gray-600">Overall Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={currentProduct.opportunityScore} className="h-2" />
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
                          <span>Growing market (+15% YoY)</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Strong profit margins (35%)</span>
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
            <AnalysisScoreCard key={index} {...card} isLocked={!hasAccess} />
          ))}
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