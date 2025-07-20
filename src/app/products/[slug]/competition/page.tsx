'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import CompetitionAnalysis from '@/components/products/analysis/CompetitionAnalysis'
import { MembershipGate } from '@/components/MembershipGate'

interface CompetitionPageProps {
  params: Promise<{ slug: string }>
}

export default function CompetitionPage({ params }: CompetitionPageProps) {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(null)
  const [nicheId, setNicheId] = useState<string | null>(null)
  const [nicheName, setNicheName] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      const nicheIdParam = searchParams.get('nicheId')
      setNicheId(nicheIdParam)
      console.log('Competition page loading for slug:', resolvedParams.slug, 'nicheId:', nicheIdParam)
      
      // If we have a nicheId, fetch niche data
      if (nicheIdParam) {
        try {
          const response = await fetch(`/api/niches/${nicheIdParam}/data`)
          if (response.ok) {
            const data = await response.json()
            console.log('Fetched niche data:', data)
            
            // Store niche name
            if (data.niche?.name) {
              setNicheName(data.niche.name)
            }
            
            // Find the specific product by slug
            let product = data.products?.find((p: any) => {
              const productSlug = p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
              const matchesSlug = productSlug?.includes(resolvedParams.slug) || resolvedParams.slug.includes(productSlug)
              const matchesAsin = p.asin === resolvedParams.slug
              return matchesSlug || matchesAsin
            })
            
            // If no exact match found and slug matches niche name pattern, use first product
            if (!product && resolvedParams.slug.includes('berberine') && data.products?.length > 0) {
              product = data.products[0]
            }
            
            if (product) {
              // Transform the data to match the expected structure
              const transformedData = {
                title: product.title || '',
                shortTitle: product.title ? (product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title) : '',
                asin: product.asin || '',
                scores: {
                  competition: 78 // Default score
                },
                // Get competitor data from other products in the niche  
                competitors: data.products?.filter((p: any) => p.asin !== product.asin).map((competitor: any) => ({
                  name: competitor.title,
                  title: competitor.title, // Add title field
                  asin: competitor.asin,
                  image: competitor.image_urls ? `https://m.media-amazon.com/images/I/${competitor.image_urls.split(',')[0].trim()}` : '',
                  image_urls: competitor.image_urls, // Keep full image URLs
                  price: competitor.price || 0,
                  rating: competitor.rating || 0,
                  review_count: competitor.review_count || 0,
                  brand: competitor.brand || 'Unknown',
                  category: competitor.category || 'N/A',
                  bsr: competitor.bsr || 0,
                  monthly_orders: competitor.monthly_orders || 0,
                  fee: competitor.fba_fees ? JSON.parse(competitor.fba_fees).total || 0 : 0,
                  // Add individual dimension fields
                  length: competitor.length || 0,
                  width: competitor.width || 0,
                  height: competitor.height || 0,
                  weight: competitor.weight || 0,
                  dimensions: {
                    length: competitor.length || 0,
                    width: competitor.width || 0,
                    height: competitor.height || 0,
                    weight: competitor.weight || 0
                  },
                  tier: calculateFBATier({
                    length: competitor.length || 10,
                    width: competitor.width || 8,
                    height: competitor.height || 6,
                    weight: competitor.weight > 0 ? competitor.weight : 1
                  }),
                  parent_asin: competitor.parent_asin || '',
                  created_at: competitor.created_at,
                  status: competitor.status || 'ACTIVE',
                  // Add additional fields from database
                  bullet_points: competitor.bullet_points || '[]',
                  a_plus_content: competitor.a_plus_content || '{}',
                  video_urls: competitor.video_urls || '[]',
                  fba_fees: competitor.fba_fees
                }))
              },
              // Add keyword hierarchy data
              keywordHierarchy: data.keywordHierarchy || {}
              
              setProductData(transformedData)
            } else {
              setProductData(null)
            }
          } else {
            setProductData(null)
          }
        } catch (error) {
          console.error('Error fetching niche data:', error)
          setProductData(null)
        }
      } else {
        setProductData(null)
      }
      
      setLoading(false)
    }

    loadData()
  }, [params, searchParams])
  
  // Helper function to calculate FBA tier based on dimensions
  const calculateFBATier = (product: any) => {
    if (!product.length || !product.width || !product.height || !product.weight) {
      return 'Large Standard 2'
    }
    
    const dims = [product.length, product.width, product.height].sort((a, b) => b - a)
    const [l, w, h] = dims
    const weight = product.weight
    
    if (l <= 15 && w <= 12 && h <= 0.75 && weight <= 0.75) {
      return 'Small Standard'
    } else if (l <= 18 && w <= 14 && h <= 8 && weight <= 20) {
      return 'Large Standard 1'
    } else if (l <= 60 && w <= 30 && h <= 30 && weight <= 50) {
      return 'Large Standard 2'
    } else if (l <= 60 && w <= 30 && h <= 30 && weight <= 70) {
      return 'Large Standard 3'
    } else {
      return 'Large Bulky'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Please provide a valid nicheId parameter to view competition analysis.</p>
        </div>
      </div>
    )
  }

  // Authentication checks commented out for public access
  // if (!user) {
  //   return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  // }

  // const userTier = user.subscriptionTier || 'free'
  // if (userTier === 'free') {
  //   return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  // }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Competition Analysis</h1>
                  <p className="text-base text-gray-600">Competitor landscape & market positioning</p>
                </div>
              </div>
              <Link href={`/products/${slug}${nicheId ? `?nicheId=${nicheId}` : ''}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
              </Link>
            </div>
            
            {/* Score Display - Horizontal Rectangle */}
            <Card className="border-2 border-red-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(productData.scores.competition)}`}>
                    {productData.scores.competition}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(productData.scores.competition)}</div>
                  <Progress value={productData.scores.competition} className="h-2 mt-2 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-500">
          <Link href={`/products/${slug}${nicheId ? `?nicheId=${nicheId}` : ''}`} className="hover:text-blue-600">
            {nicheName || (productData.title.length > 50 ? productData.title.substring(0, 50) + '...' : productData.title)}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Competition Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Competition Analysis Component */}
        <CompetitionAnalysis data={productData} />
      </div>
    </div>
  )
}