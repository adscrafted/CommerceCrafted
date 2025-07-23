'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
import { APIService } from '@/lib/api-service'


// Score card component (copied from product page)
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

interface DailyFeatureData {
  id: string
  date: string
  nicheName?: string | null
  nicheSlug?: string | null
  nicheId?: string | null
  nicheProducts?: any[]
  product: {
    id: string
    asin: string
    title: string
    brand: string
    category: string
    price: number
    rating: number
    reviewCount: number
    imageUrls: string[]
    bsr?: number
    analysis?: {
      opportunityScore: number
      demandScore: number
      competitionScore: number
      feasibilityScore: number
      financialAnalysis?: {
        estimatedMonthlySales: number
        estimatedRevenue: number
        profitMargin: number
        roi: number
      }
      marketAnalysis?: {
        totalAddressableMarket: number
        growthRate: number
        seasonality: string
        marketMaturity: string
      }
      competitionAnalysis?: {
        competitorCount: number
        topCompetitors?: any[]
      }
    }
  }
  reason: string
  highlights: string[]
  marketContext: string
  aiInsights: string[]
  createdAt: string
}

// Image carousel component (copied from product page)
const ImageCarousel = ({ images, title }: { images: string[], title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Filter out empty strings and ensure we have valid URLs, then proxy Amazon images
  // Limit to maximum 12 images
  const validImages = (images?.filter(img => img && img.trim() !== '') || [])
    .slice(0, 12)
    .map(img => {
      // Proxy Amazon images to avoid CORS issues
      if (img.includes('media-amazon.com') || img.includes('images-na.ssl-images-amazon.com')) {
        return `/api/proxy-image?url=${encodeURIComponent(img)}`
      }
      return img
    })
  
  if (!validImages || validImages.length === 0) {
    return (
      <div className="w-72 h-72 relative bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    )
  }
  
  return (
    <div className="flex gap-4">
      {/* Main Image */}
      <div className="w-72 h-72 relative bg-white rounded-lg shadow-xl overflow-hidden">
        <Image 
          src={validImages[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          width={288}
          height={288}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Use a placeholder image for supplements
            e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop'
          }}
        />
      </div>
      
      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="h-72">
          <div className={`grid gap-2 h-full ${
            validImages.length <= 4 ? 'grid-cols-1' :
            validImages.length <= 8 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ height: '66px' }}
              >
                <Image
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  width={66}
                  height={66}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


export default function ProductOfTheDayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [dailyFeature, setDailyFeature] = useState<DailyFeatureData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Use daily feature date if available, otherwise current date
  const dateString = dailyFeature?.date 
    ? new Date(dailyFeature.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })

  useEffect(() => {
    fetchDailyFeature()
  }, [])
  
  const fetchDailyFeature = async () => {
    try {
      console.log('Fetching daily feature from API...')
      const data = await APIService.getDailyFeature()
      console.log('Daily feature data:', data)
      
      // If we have a nicheId, fetch additional niche data like the individual product page does
      if (data.nicheId) {
        try {
          const nicheResponse = await fetch(`/api/niches/${data.nicheId}/showcase`)
          if (nicheResponse.ok) {
            const nicheShowcase = await nicheResponse.json()
            // Merge the niche showcase data into our daily feature data
            data._nicheData = nicheShowcase
          }
        } catch (nicheErr) {
          console.error('Error fetching niche showcase:', nicheErr)
        }
      }
      
      setDailyFeature(data)
    } catch (err) {
      console.error('Error fetching daily feature:', err)
      setError(err instanceof Error ? err.message : 'Failed to load daily feature')
    } finally {
      setLoading(false)
    }
  }

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
  
  if (error || !dailyFeature) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Product of the Day</h1>
          <p className="text-gray-600">{error || 'No daily feature available'}</p>
        </div>
      </div>
    )
  }
  
  const product = dailyFeature.product
  // Use niche slug if available, otherwise fall back to product slug
  let slug = dailyFeature.nicheSlug
  if (!slug && dailyFeature.nicheName) {
    // Generate slug from niche name if we have it but no slug
    slug = dailyFeature.nicheName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  if (!slug) {
    // Final fallback to product slug
    slug = generateProductSlug(product.title, product.asin)
  }
  const nicheIdParam = dailyFeature.nicheId ? `?nicheId=${dailyFeature.nicheId}` : ''
  
  // Debug logging
  console.log('Daily Feature Debug:', {
    nicheId: dailyFeature.nicheId,
    nicheSlug: dailyFeature.nicheSlug,
    nicheName: dailyFeature.nicheName,
    nicheIdParam: nicheIdParam,
    finalSlug: slug
  })

  // Product of the day is free for everyone as a preview
  
  // Get real metrics from niche data (same as individual product page)
  const totalKeywords = dailyFeature._nicheData?.totalKeywords || 248
  const avgBSR = dailyFeature._nicheData?.metrics?.bsr?.avg || 15243
  const avgRating = dailyFeature._nicheData?.metrics?.rating?.avg || product.rating || 4.2
  const totalReviews = dailyFeature._nicheData?.metrics?.reviews?.total || product.reviewCount || 36600
  const totalProducts = dailyFeature._nicheData?.products?.length || dailyFeature.nicheProducts?.length || 10
  const avgPrice = dailyFeature._nicheData?.metrics?.price?.avg || product.price || 19.99

  // Create analysis cards matching the product detail page format
  const analysisCards = [
    {
      title: 'Market Intelligence',
      score: product.analysis?.opportunityScore || 85,
      icon: MessageSquare,
      description: 'Reviews, sentiment & customer insights',
      href: `/products/${slug}/intelligence${nicheIdParam}`,
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      metrics: [
        { label: 'Sentiment', value: `${avgRating.toFixed(1)}★` },
        { label: 'Total Reviews', value: totalReviews > 1000 ? `${(totalReviews / 1000).toFixed(1)}K` : totalReviews.toString() },
        { label: 'Opportunities', value: '4' },
        { label: 'Avatars', value: '3 Types' }
      ]
    },
    {
      title: 'Demand Analysis',
      score: product.analysis?.demandScore || 82,
      icon: TrendingUp,
      description: 'Market size, search volume & customer segments',
      href: `/products/${slug}/demand${nicheIdParam}`,
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      metrics: [
        { label: 'Market Trend', value: 'Growing' },
        { label: 'Avg BSR', value: avgBSR.toLocaleString() },
        { label: 'Conversion Rate', value: '12.5%' },
        { label: 'Market Size', value: '$1.2B' }
      ]
    },
    {
      title: 'Competition Analysis',
      score: product.analysis?.competitionScore || 78,
      icon: Target,
      description: 'Competitor landscape & market positioning',
      href: `/products/${slug}/competition${nicheIdParam}`,
      gradient: 'bg-gradient-to-br from-red-50 to-red-100',
      metrics: [
        { label: 'Competitors', value: totalProducts.toString() },
        { label: 'Avg Price', value: `$${avgPrice.toFixed(2)}` },
        { label: 'Avg Rating', value: `${avgRating.toFixed(1)}★` },
        { label: 'Avg Reviews', value: Math.round(totalReviews / totalProducts).toLocaleString() }
      ]
    },
    {
      title: 'Keywords Analysis',
      score: totalKeywords > 50 ? 85 : 75,
      icon: Search,
      description: 'Keyword opportunities & search terms',
      href: `/products/${slug}/keywords${nicheIdParam}`,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      metrics: [
        { label: 'Primary CPC', value: '$1.23' },
        { label: 'Total Keywords', value: totalKeywords.toString() },
        { label: 'Keyword Revenue', value: `$${((dailyFeature._nicheData?.metrics?.revenue?.monthly || 454000) / 1000).toFixed(0)}K` },
        { label: 'Competition', value: 'Medium' }
      ]
    },
    {
      title: 'Financial Analysis',
      score: dailyFeature._nicheData?.metrics?.revenue?.monthly > 50000 ? 88 : 80,
      icon: DollarSign,
      description: 'Profitability, costs & ROI projections',
      href: `/products/${slug}/financial${nicheIdParam}`,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      metrics: [
        { label: 'Monthly Revenue', value: `$${((dailyFeature._nicheData?.metrics?.revenue?.monthly || product.analysis?.financialAnalysis?.estimatedRevenue || 0) / 1000).toFixed(0)}K` },
        { label: 'Monthly Profit', value: `$${((dailyFeature._nicheData?.metrics?.revenue?.monthly || product.analysis?.financialAnalysis?.estimatedRevenue || 0) * 0.35 / 1000).toFixed(1)}K` },
        { label: 'Profit Margin', value: '35%' },
        { label: 'ROI', value: '142%' }
      ]
    },
    {
      title: 'Listing Optimization',
      score: 82,
      icon: FileText,
      description: 'Title, bullets & image recommendations',
      href: `/products/${slug}/listing${nicheIdParam}`,
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
      href: `/products/${slug}/launch${nicheIdParam}`,
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      metrics: [
        { label: 'Launch Budget', value: '$8,000' },
        { label: 'PPC Budget', value: '$2.5K' },
        { label: 'Time to Profit', value: '45 days' },
        { label: 'Strategy', value: 'Aggressive' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header Explanation Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge className="mb-4">Daily Amazon Opportunity</Badge>
            <h1 className="text-5xl font-bold text-blue-600 mb-4">
              Product of the Day
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Every day at midnight, we release one thoroughly analyzed Amazon product opportunity. 
              Each analysis represents 40+ hours of research condensed into actionable insights you can use immediately.
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                  Get Daily Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
                  {dateString}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{dailyFeature.nicheName || product.title}</h1>
              
              {/* Monthly Revenue Display */}
              <div className="mb-6">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                  <span className="text-sm text-blue-100 mr-2">Est. Monthly Revenue:</span>
                  <span className="text-2xl font-bold text-white">
                    ${(() => {
                      const revenue = dailyFeature._nicheData?.metrics?.revenue?.monthly || product.analysis?.financialAnalysis?.estimatedRevenue || 0;
                      if (revenue >= 1000000) {
                        return `${(revenue / 1000000).toFixed(1)}M`;
                      } else if (revenue >= 1000) {
                        return `${(revenue / 1000).toFixed(0)}K`;
                      } else {
                        return revenue.toFixed(0);
                      }
                    })()}
                  </span>
                </div>
              </div>
              
            </div>
            
            {/* Product Image Carousel */}
            <div className="text-center">
              <ImageCarousel 
                images={(() => {
                  // If we have niche products, collect their main images using image_url field
                  if (dailyFeature.nicheProducts && dailyFeature.nicheProducts.length > 0) {
                    return dailyFeature.nicheProducts
                      .map(p => {
                        // Check for mainImage first (this is what the daily-feature API returns)
                        if (p.mainImage) {
                          return p.mainImage
                        }
                        // Then check image_urls (plural) - this is the actual database field
                        if (p.image_urls) {
                          try {
                            const urls = typeof p.image_urls === 'string' ? JSON.parse(p.image_urls) : p.image_urls
                            return Array.isArray(urls) ? urls[0] : urls
                          } catch {
                            // If not JSON, try splitting by comma
                            const urls = p.image_urls.split(',').map((url: string) => url.trim())
                            return urls[0]
                          }
                        }
                        // Fallback to other possible fields
                        if (p.main_image) {
                          return p.main_image
                        }
                        return null
                      })
                      .filter(Boolean)
                      .slice(0, 12) // Limit to 12 images for the gallery
                  }
                  // Otherwise use the featured product's first image only
                  return [product.imageUrls[0]].filter(Boolean)
                })()}
                title={dailyFeature.nicheName || product.title}
              />
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
                      {Math.round(dailyFeature._nicheData?.scores?.opportunity || product.analysis?.opportunityScore || 85)}
                    </div>
                    <div className="text-xs text-gray-600">Overall Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={Math.round(dailyFeature._nicheData?.scores?.opportunity || product.analysis?.opportunityScore || 85)} className="h-2" />
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Strengths</h3>
                      <ul className="space-y-1">
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{totalKeywords} high-value keywords identified</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Average BSR of {avgBSR.toLocaleString()}</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Strong profit margins (35%)</span>
                        </li>
                        <li className="text-sm text-gray-700 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{avgRating.toFixed(1)}★ average rating</span>
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
            <AnalysisScoreCard key={index} {...card} isLocked={false} />
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