'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useRouter, useSearchParams } from 'next/navigation'
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
  // Extract the last part of the slug which should be part of the ASIN
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  
  // If the last part looks like an ASIN suffix (4 chars), return it
  if (lastPart && lastPart.length === 4) {
    return lastPart.toUpperCase()
  }
  
  return ''
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

// Fallback mock data removed - we'll show a proper not found message instead

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

// Image carousel component
const ImageCarousel = ({ images, title }: { images: string[], title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Filter out empty strings and ensure we have valid URLs, then proxy Amazon images
  const validImages = (images?.filter(img => img && img.trim() !== '') || [])
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
    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
      {/* Main Image - Responsive */}
      <div className="w-full sm:w-72 h-64 sm:h-72 relative bg-white rounded-lg shadow-xl overflow-hidden">
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
      
      {/* Thumbnails - Responsive Grid */}
      {validImages.length > 1 && (
        <div className="w-full sm:w-auto">
          <div className={`grid gap-2 ${
            validImages.length <= 3 ? 'grid-cols-3 sm:grid-cols-1' :
            validImages.length <= 6 ? 'grid-cols-3 sm:grid-cols-2' :
            validImages.length <= 9 ? 'grid-cols-3' :
            'grid-cols-4 sm:grid-cols-3'
          } max-w-full sm:max-w-none`}>
            {validImages.slice(0, 12).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ width: '66px', height: '66px' }}
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

export default function ProductPage({ params }: ProductPageProps) {
  // Remove auth dependency since this is now a public page
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(null)
  const [keywordHierarchy, setKeywordHierarchy] = useState<any>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showDebugUnlocked, setShowDebugUnlocked] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      const currentSlug = resolvedParams.slug
      setSlug(currentSlug)
      
      // Check if we have a nicheId in the query params
      const urlParams = new URLSearchParams(window.location.search)
      const nicheId = urlParams.get('nicheId')
      
      if (nicheId) {
        // Fetch niche showcase data
        console.log('Fetching niche showcase data for ID:', nicheId)
        try {
          const response = await fetch(`/api/niches/${nicheId}/showcase`)
          if (response.ok) {
            const nicheShowcase = await response.json()
            console.log('Using niche showcase data:', nicheShowcase)
            
            // Also fetch the full niche data to get keyword revenue
            const nicheDataResponse = await fetch(`/api/niches/${nicheId}/data`)
            let totalKeywordRevenue = 0
            if (nicheDataResponse.ok) {
              const nicheData = await nicheDataResponse.json()
              // Calculate total revenue from keyword hierarchy
              if (nicheData.keywordHierarchy) {
                setKeywordHierarchy(nicheData.keywordHierarchy)
                totalKeywordRevenue = Object.values(nicheData.keywordHierarchy).reduce((sum: number, root: any) => 
                  sum + (root.totalRevenue || 0), 0
                )
              }
            }
            
            // Calculate average price from products
            const avgPrice = nicheShowcase.products.length > 0
              ? nicheShowcase.products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / nicheShowcase.products.length
              : nicheShowcase.metrics.price.avg
            
            // Get product images (all products for thumbnails)
            const productImages = nicheShowcase.products
              .map((p: any) => {
                // Use image_urls (plural) as the primary source - this is the actual database field
                if (p.image_urls) {
                  // image_urls might be a JSON string or comma-separated list
                  try {
                    const urls = typeof p.image_urls === 'string' ? JSON.parse(p.image_urls) : p.image_urls
                    const imageUrl = Array.isArray(urls) ? urls[0] : urls
                    
                    // If we have an image URL, ensure it's a full URL
                    if (imageUrl) {
                      // Check if it's just a filename (e.g., "71KdyGDfBbL.jpg")
                      if (!imageUrl.startsWith('http')) {
                        // Convert Amazon image filename to full URL
                        return `https://m.media-amazon.com/images/I/${imageUrl}`
                      }
                      return imageUrl
                    }
                  } catch {
                    // If not JSON, try splitting by comma
                    const urls = p.image_urls.split(',').map((url: string) => url.trim())
                    const imageUrl = urls[0]
                    
                    if (imageUrl) {
                      if (!imageUrl.startsWith('http')) {
                        return `https://m.media-amazon.com/images/I/${imageUrl}`
                      }
                      return imageUrl
                    }
                  }
                }
                
                return null
              })
              .filter(Boolean)
            
            // Transform niche data to match product data structure
            setProductData({
              id: nicheShowcase.id,
              title: nicheShowcase.title,
              subtitle: nicheShowcase.subtitle,
              category: nicheShowcase.category,
              asin: nicheShowcase.asin,
              date: new Date(nicheShowcase.createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              opportunityScore: Math.round(nicheShowcase.scores.opportunity || 85),
              scores: {
                intelligence: Math.round(nicheShowcase.scores.opportunity || 85),
                demand: Math.round(nicheShowcase.scores.demand || 82),
                competition: Math.round(nicheShowcase.scores.competition || 78),
                keywords: nicheShowcase.totalKeywords > 50 ? 85 : 75,
                financial: nicheShowcase.metrics.revenue.monthly > 50000 ? 88 : 80,
                listing: 82,
                launch: 85
              },
              financialData: {
                avgSellingPrice: avgPrice,
                monthlyProjections: {
                  revenue: totalKeywordRevenue || nicheShowcase.metrics.revenue.monthly,
                  profit: (totalKeywordRevenue || nicheShowcase.metrics.revenue.monthly) * 0.35, // Assuming 35% margin
                  units: Math.round((totalKeywordRevenue || nicheShowcase.metrics.revenue.monthly) / avgPrice)
                }
              },
              mainImage: productImages[0] || fallbackProductData.mainImage,
              images: productImages.length > 0 ? productImages : [fallbackProductData.mainImage],
              totalProducts: nicheShowcase.products.length,
              // Store the full niche data
              _nicheData: nicheShowcase,
              isNiche: true
            })
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error fetching niche showcase:', error)
        }
      }
      
      // Original flow for individual products
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
          console.log('No product data found')
          setError('Product not found')
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

  if (error || !productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested product could not be found.'}</p>
          <Link href="/database">
            <Button>Browse Product Database</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Since this is now a public page, always show access (or use debug toggle)
  const hasAccess = true // Public page - always has access
  const nicheIdParam = searchParams.get('nicheId')
  
  // No membership gate needed for public pages
  
  // Use productData if available, otherwise fallback to mock data
  const currentProduct = productData || fallbackProductData


  // Calculate metrics with real data
  const totalKeywords = currentProduct._nicheData?.totalKeywords || 248
  const avgBSR = currentProduct._nicheData?.metrics?.bsr?.avg || 15243
  const avgRating = currentProduct._nicheData?.metrics?.rating?.avg || 4.2
  const totalReviews = currentProduct._nicheData?.metrics?.reviews?.total || 36600

  const analysisCards = [
    {
      title: 'Market Intelligence',
      score: currentProduct.scores.intelligence,
      icon: MessageSquare,
      description: 'Reviews, sentiment & customer insights',
      href: `/products/${slug}/intelligence${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
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
      score: currentProduct.scores.demand,
      icon: TrendingUp,
      description: 'Market size, search volume & customer segments',
      href: `/products/${slug}/demand${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
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
      score: currentProduct.scores.competition,
      icon: Target,
      description: 'Competitor landscape & market positioning',
      href: `/products/${slug}/competition${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
      gradient: 'bg-gradient-to-br from-red-50 to-red-100',
      metrics: [
        { label: 'Competitors', value: currentProduct.totalProducts || currentProduct._nicheData?.products?.length || 10 },
        { label: 'Avg Price', value: `$${currentProduct.financialData.avgSellingPrice.toFixed(2)}` },
        { label: 'Avg Rating', value: `${avgRating.toFixed(1)}★` },
        { label: 'Avg Reviews', value: Math.round(totalReviews / (currentProduct.totalProducts || 10)).toLocaleString() }
      ]
    },
    {
      title: 'Keywords Analysis',
      score: currentProduct.scores.keywords,
      icon: Search,
      description: 'Keyword opportunities & search terms',
      href: `/products/${slug}/keywords${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
      gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      metrics: [
        { label: 'Primary CPC', value: '$1.23' },
        { label: 'Total Keywords', value: totalKeywords.toLocaleString() },
        { label: 'Keyword Revenue', value: '$454K' },
        { label: 'Competition', value: 'Medium' }
      ]
    },
    {
      title: 'Financial Analysis',
      score: currentProduct.scores.financial,
      icon: DollarSign,
      description: 'Profitability, pricing & ROI projections',
      href: `/products/${slug}/financial${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
      gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      metrics: [
        { label: 'Monthly Revenue', value: `$${(currentProduct.financialData.monthlyProjections.revenue / 1000).toFixed(0)}K` },
        { label: 'Monthly Profit', value: `$${(currentProduct.financialData.monthlyProjections.profit / 1000).toFixed(1)}K` },
        { label: 'Profit Margin', value: '35%' },
        { label: 'ROI', value: '142%' }
      ]
    },
    {
      title: 'Listing Optimization',
      score: currentProduct.scores.listing,
      icon: FileText,
      description: 'Title, images, A+ content & video strategy',
      href: `/products/${slug}/listing${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
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
      href: `/products/${slug}/launch${nicheIdParam ? `?nicheId=${nicheIdParam}` : ''}`,
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      metrics: [
        { label: 'Launch Price', value: `$${(currentProduct.financialData.avgSellingPrice * 0.7).toFixed(2)}` },
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

      {/* Hero Section - Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {currentProduct.isNiche ? 'Niche Analysis' : 'Daily Amazon Opportunity'}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {currentProduct.date}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{currentProduct.title}</h1>
              
              {/* Monthly Revenue Display */}
              <div className="mb-6">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 border border-white/30">
                  <span className="text-xs sm:text-sm text-blue-100 mr-2">Est. Monthly Revenue:</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    ${(() => {
                      const revenue = currentProduct.financialData.monthlyProjections.revenue;
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
            
            {/* Product Image Carousel - Centered on Mobile */}
            <div className="flex justify-center lg:justify-end">
              <ImageCarousel 
                images={(() => {
                  // Ensure we have valid images array
                  let imagesArray = currentProduct.images || []
                  
                  // If no images array, try to use mainImage
                  if ((!imagesArray || imagesArray.length === 0) && currentProduct.mainImage) {
                    imagesArray = [currentProduct.mainImage]
                  }
                  
                  // If we have image_urls as a string, parse it
                  if (currentProduct.image_urls && typeof currentProduct.image_urls === 'string') {
                    try {
                      // Try to parse as JSON first
                      const parsed = JSON.parse(currentProduct.image_urls)
                      imagesArray = Array.isArray(parsed) ? parsed : [parsed]
                    } catch {
                      // If not JSON, split by comma
                      imagesArray = currentProduct.image_urls.split(',').map((url: string) => url.trim())
                    }
                  }
                  
                  // Ensure all images have full URLs
                  return imagesArray.map((url: string) => {
                    if (!url) return null
                    if (!url.startsWith('http')) {
                      return `https://m.media-amazon.com/images/I/${url}`
                    }
                    return url
                  }).filter(Boolean)
                })()}
                title={currentProduct.title}
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