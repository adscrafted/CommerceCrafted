'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import KeywordsAnalysis from '@/components/products/analysis/KeywordsAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { useAmazonSearchTerms } from '@/hooks/useAmazonSearchTerms'

interface KeywordsPageProps {
  params: Promise<{ slug: string }>
}

export default function KeywordsPage({ params }: KeywordsPageProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(null)
  const [nicheId, setNicheId] = useState<string | null>(null)

  // Get main keywords for Amazon Search Terms
  const mainKeywords = [
    'bluetooth sleep mask',
    'sleep headphones',
    'sleep mask with speakers',
    'wireless sleep mask',
    'sleeping headphones'
  ]
  
  // Fetch Amazon Search Terms data
  const { data: searchTermsData, loading: searchTermsLoading, error: searchTermsError } = useAmazonSearchTerms(mainKeywords, 4, !loading)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      const nicheIdParam = searchParams.get('nicheId')
      setNicheId(nicheIdParam)
      console.log('Keywords page loading for slug:', resolvedParams.slug, 'nicheId:', nicheIdParam)
      
      // If we have a nicheId, fetch niche data
      if (nicheIdParam) {
        try {
          const response = await fetch(`/api/niches/${nicheIdParam}/data`)
          if (response.ok) {
            const data = await response.json()
            
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
              // Get primary keyword from the data
              const primaryKeyword = data.keywords && data.keywords.length > 0 
                ? data.keywords[0].keyword 
                : data.niche?.slug || 'supplement'
              
              // Calculate average CPC from keywords
              const avgCpc = data.keywords && data.keywords.length > 0
                ? data.keywords.reduce((sum: number, kw: any) => sum + (kw.suggested_bid || 0), 0) / data.keywords.length
                : 1.25
              
              // Transform the data to match the expected structure
              const transformedData = {
                title: product.title || '',
                shortTitle: product.title ? (product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title) : '',
                asin: product.asin || '',
                scores: {
                  keywords: 85 // Default score
                },
                // Store the full niche data for the KeywordsAnalysis component
                _nicheData: data,
                keywordsData: {
                  primaryKeyword: primaryKeyword,
                  totalKeywords: data.totalKeywords || data.keywords?.length || 0,
                  cpc: avgCpc.toFixed(2),
                  monthlySearchVolume: 45000,
                  averageROI: 142,
                  keywordHierarchy: data.keywordHierarchy || {}
                }
              }
              
              
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Comment out authentication checks for now
  // if (!user || !session) {
  //   return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  // }

  // const userTier = user.subscriptionTier || 'free'
  // if (userTier === 'free') {
  //   return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Keywords Analysis</h1>
                  <p className="text-base text-gray-600">Keyword opportunities & search terms</p>
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
            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(productData?.scores?.keywords || 85)}`}>
                    {productData?.scores?.keywords || 85}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(productData?.scores?.keywords || 85)}</div>
                  <Progress value={productData?.scores?.keywords || 85} className="h-2 mt-2 w-full" />
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
            {productData?._nicheData?.niche?.name || 'Product Analysis'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Keywords Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Keywords Analysis Component */}
        {!productData && !nicheId ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No Data Available</div>
            <p className="text-gray-600">Please provide a valid nicheId parameter to view keywords analysis.</p>
          </div>
        ) : (
          <KeywordsAnalysis data={productData} searchTermsData={searchTermsData} />
        )}
      </div>
    </div>
  )
}