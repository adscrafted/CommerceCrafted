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
  ArrowLeft,
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

// Mobile-friendly carousel showing 5 images side by side
const ImageCarousel = ({ images, title }: { images: string[], title: string }) => {
  const [currentStartIndex, setCurrentStartIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, startIndex: 0 })
  
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
      <div className="w-full">
        <div className="flex justify-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 relative bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">No images available</span>
          </div>
        </div>
      </div>
    )
  }

  // Number of images to show at once based on screen size
  const getImagesPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2 // mobile: 2 images
      if (window.innerWidth < 1024) return 3 // tablet: 3 images  
      return 5 // desktop: 5 images
    }
    return 5
  }

  const [imagesPerView, setImagesPerView] = useState(5)

  useEffect(() => {
    const handleResize = () => {
      setImagesPerView(getImagesPerView())
    }
    
    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxStartIndex = Math.max(0, validImages.length - imagesPerView)
  
  const nextImages = () => {
    setCurrentStartIndex(prev => Math.min(prev + 1, maxStartIndex))
  }

  const prevImages = () => {
    setCurrentStartIndex(prev => Math.max(prev - 1, 0))
  }

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (validImages.length <= imagesPerView) return // No need to drag if all images are visible
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      startIndex: currentStartIndex
    })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const sensitivity = 100 // pixels needed to move one image
    const imageMove = Math.round(-deltaX / sensitivity)
    
    const newIndex = Math.max(0, Math.min(maxStartIndex, dragStart.startIndex + imageMove))
    setCurrentStartIndex(newIndex)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (validImages.length <= imagesPerView) return
    
    setIsDragging(true)
    setDragStart({
      x: e.touches[0].clientX,
      startIndex: currentStartIndex
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const deltaX = e.touches[0].clientX - dragStart.x
    const sensitivity = 80 // More sensitive on mobile
    const imageMove = Math.round(-deltaX / sensitivity)
    
    const newIndex = Math.max(0, Math.min(maxStartIndex, dragStart.startIndex + imageMove))
    setCurrentStartIndex(newIndex)
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const visibleImages = validImages.slice(currentStartIndex, currentStartIndex + imagesPerView)

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="relative">
        {/* Image Grid */}
        <div 
          className={`flex justify-center items-center space-x-4 sm:space-x-6 md:space-x-8 select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } ${validImages.length > imagesPerView ? 'cursor-grab' : 'cursor-default'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {visibleImages.map((image, index) => (
            <div
              key={currentStartIndex + index}
              className={`w-50 h-50 sm:w-60 sm:h-60 md:w-70 md:h-70 lg:w-80 lg:h-80 relative bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-all duration-200 ${
                isDragging ? 'pointer-events-none' : ''
              }`}
            >
              <Image 
                src={image}
                alt={`${title} - Image ${currentStartIndex + index + 1}`}
                width={320}
                height={320}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  // Use a placeholder image for supplements
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
                }}
                draggable={false}
              />
            </div>		
          ))}
        </div>

        {/* Navigation Arrows - Only show if we have more images than can be displayed */}
        {validImages.length > imagesPerView && (
          <>
            {/* Left Arrow */}
            <button
              onClick={prevImages}
              disabled={currentStartIndex === 0}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed p-2 rounded-full shadow-lg transition-all duration-200 z-10 border"
              aria-label="Show previous images"
            >
              <ArrowLeft className={`h-4 w-4 ${currentStartIndex === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            
            {/* Right Arrow */}
            <button
              onClick={nextImages}
              disabled={currentStartIndex >= maxStartIndex}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed p-2 rounded-full shadow-lg transition-all duration-200 z-10 border"
              aria-label="Show next images"
            >
              <ArrowRight className={`h-4 w-4 ${currentStartIndex >= maxStartIndex ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </>
        )}
      </div>

      {/* Progress indicators */}
      {validImages.length > imagesPerView && (
        <div className="flex justify-center mt-4 space-x-1">
          {Array.from({ length: Math.ceil(validImages.length / imagesPerView) }).map((_, pageIndex) => {
            const isActive = Math.floor(currentStartIndex / imagesPerView) === pageIndex
            return (
              <button
                key={pageIndex}
                onClick={() => setCurrentStartIndex(pageIndex * imagesPerView)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to page ${pageIndex + 1}`}
              />
            )
          })}
        </div>
      )}

      {/* Image counter */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-500">
          Showing {currentStartIndex + 1}-{Math.min(currentStartIndex + imagesPerView, validImages.length)} of {validImages.length}
        </span>
      </div>
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
                  profit: (totalKeywordRevenue || nicheShowcase.metrics.revenue.monthly) * (nicheShowcase.profitMargin || 0.30),
                  units: Math.round((totalKeywordRevenue || nicheShowcase.metrics.revenue.monthly) / avgPrice)
                }
              },
              mainImage: productImages[0],
              images: productImages,
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
      
      // Try multiple approaches to find the data
      let dataFound = false
      
      // First try to fetch niche data
      const nicheData = await fetchNicheData(currentSlug)
      
      if (nicheData && nicheData.niche) {
        console.log('Using niche data with real product image')
        // Transform niche data to match our product data structure
        setProductData({
          id: nicheData.niche.id,
          title: nicheData.niche.niche_name || nicheData.niche.name,
          mainImage: nicheData.niche.mainImage,
          opportunityScore: Math.round(nicheData.niche.avgOpportunityScore),
          financialData: {
            avgSellingPrice: nicheData.niche.avgPrice,
            monthlyProjections: {
              revenue: nicheData.niche.totalRevenue,
              profit: nicheData.niche.totalProfit || (nicheData.niche.totalRevenue * 0.30),
              units: Math.round(nicheData.niche.totalRevenue / nicheData.niche.avgPrice)
            }
          },
          // Store the full niche data for use in child pages
          _nicheData: nicheData
        })
        dataFound = true
      }
      
      if (!dataFound) {
        // Try to extract ASIN from slug
        const asin = extractAsinFromSlug(currentSlug)
        if (asin) {
          console.log('Extracted ASIN:', asin, 'from slug:', currentSlug)
          
          const fetchedProduct = await fetchProductData(asin)
          
          if (fetchedProduct) {
            console.log('Using database product data')
            setProductData(fetchedProduct)
            dataFound = true
          }
        }
      }
      
      if (!dataFound) {
        console.log('No data found for slug:', currentSlug)
        setError('Product not found')
        setProductData(null)
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

  // Remove the error state - we'll always show something
  // if (error || !productData) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
  //         <p className="text-gray-600 mb-6">{error || 'The requested product could not be found.'}</p>
  //         <Link href="/database">
  //           <Button>Browse Product Database</Button>
  //         </Link>
  //       </div>
  //     </div>
  //   )
  // }

  // Since this is now a public page, always show access (or use debug toggle)
  const hasAccess = true // Public page - always has access
  const nicheIdParam = searchParams.get('nicheId')
  
  // No membership gate needed for public pages
  
  // Check if we have product data
  if (!productData) {
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
  
  const currentProduct = productData


  // Calculate metrics with real data
  const totalKeywords = currentProduct._nicheData?.totalKeywords || 0
  const avgBSR = currentProduct._nicheData?.metrics?.bsr?.avg || 0
  const avgRating = currentProduct._nicheData?.metrics?.rating?.avg || 0
  const totalReviews = currentProduct._nicheData?.metrics?.reviews?.total || 0

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
        { label: 'Opportunities', value: currentProduct._nicheData?.opportunities?.length?.toString() || '0' },
        { label: 'Avatars', value: currentProduct._nicheData?.customerAvatars?.length ? `${currentProduct._nicheData.customerAvatars.length} Types` : '0' }
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
        { label: 'Market Trend', value: currentProduct._nicheData?.marketTrend || 'N/A' },
        { label: 'Avg BSR', value: avgBSR > 0 ? avgBSR.toLocaleString() : 'N/A' },
        { label: 'Conversion Rate', value: currentProduct._nicheData?.conversionRate ? `${currentProduct._nicheData.conversionRate}%` : 'N/A' },
        { label: 'Market Size', value: currentProduct._nicheData?.marketSize || 'N/A' }
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

      {/* Simplified Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Centered Date and Title */}
          <div className="text-center space-y-6 mb-12">
            {/* Date Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1.5 font-medium">
                {currentProduct.date}
              </Badge>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-4xl mx-auto">
                {currentProduct.title}
              </h1>
            </div>
          </div>
          
          {/* Centered Image Carousel */}
          <div className="flex justify-center">
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

      {/* Analysis Score Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Product Analysis</h2>
          <p className="text-gray-600">Click any analysis below to explore detailed insights and recommendations</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Summary Card - Takes 2 slots */}
          <div className="md:col-span-2">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <BarChart3 className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Product Summary</CardTitle>
                      <CardDescription className="text-sm">Comprehensive market overview</CardDescription>
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
                <div className="space-y-4">
                  <Progress value={currentProduct.opportunityScore} className="h-2" />
                  
                  {/* Product Summary Description */}
                  {currentProduct.productSummary || currentProduct._nicheData?.nicheSummary ? (
                    <div className="bg-white/70 rounded-lg p-6">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {currentProduct.productSummary || currentProduct._nicheData?.nicheSummary}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/70 rounded-lg p-6">
                      <p className="text-sm text-gray-600 italic">
                        Loading product summary data... This comprehensive analysis will provide insights into market opportunities, competitive landscape, and growth potential.
                      </p>
                    </div>
                  )}
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