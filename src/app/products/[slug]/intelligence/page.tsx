'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import MarketIntelligenceReal from '@/components/products/analysis/MarketIntelligenceReal'
import { MembershipGate } from '@/components/MembershipGate'
import { mockProductData } from '@/lib/mockProductData'

interface IntelligencePageProps {
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
  
  // Special handling for known patterns
  const slugToAsinMap: { [key: string]: string } = {
    'berberine-supplments': 'B08QRPYKLD' // Add mapping for berberine supplements
  }
  
  return slugToAsinMap[slug] || slug // fallback to using slug as ASIN if no mapping found
}

export default function IntelligencePage({ params }: IntelligencePageProps) {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [marketData, setMarketData] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const nicheId = searchParams.get('nicheId')

  useEffect(() => {
    const loadData = async () => {
      console.log('Intelligence page: Loading data...')
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      console.log('Intelligence page: Slug set to:', resolvedParams.slug)
      console.log('Intelligence page: nicheId =', nicheId)
      
      // Fetch market intelligence data for this product
      try {
        // If we have a nicheId, fetch market intelligence for that niche
        if (nicheId) {
          const response = await fetch(`/api/niches/${nicheId}/market-intelligence`)
          if (response.ok) {
            const data = await response.json()
            setMarketData(data)
            console.log('Market intelligence data loaded from niche:', data)
          } else {
            const errorText = await response.text()
            console.error('API Error:', response.status, response.statusText, errorText)
            throw new Error(`Failed to fetch niche market intelligence data: ${response.status} ${response.statusText}`)
          }
        } else {
          // Fallback to product-based intelligence
          const asin = extractAsinFromSlug(resolvedParams.slug)
          console.log('Intelligence page: Using ASIN:', asin, 'for slug:', resolvedParams.slug)
          
          const response = await fetch(`/api/database/products/${asin}?marketIntelligence=true`)
          if (response.ok) {
            const data = await response.json()
            setMarketData(data)
            console.log('Market intelligence data loaded:', data)
          } else {
            const errorText = await response.text()
            console.error('API Error:', response.status, response.statusText, errorText)
            throw new Error(`Failed to fetch market intelligence data: ${response.status} ${response.statusText}`)
          }
        }
      } catch (err) {
        console.error('Error loading market intelligence:', err)
        setError('Failed to load market intelligence data')
      }
      
      setLoading(false)
    }

    loadData()
  }, [params, nicheId])

  console.log('Intelligence page: loading =', loading, 'authLoading =', authLoading)

  // Only wait for page loading, not auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For now, we'll make this page public since we don't have subscription tier data in the user object
  // You can uncomment these lines when subscription management is implemented
  /*
  if (!user) {
    return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  }

  const userTier = user.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  }
  */

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
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Market Intelligence</h1>
                  <p className="text-base text-gray-600">Deep analysis of customer sentiment & niche dynamics</p>
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
            <Card className="border-2 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(mockProductData.scores.intelligence)}`}>
                    {mockProductData.scores.intelligence}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(mockProductData.scores.intelligence)}</div>
                  <Progress value={mockProductData.scores.intelligence} className="h-2 mt-2 w-full" />
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
            Product Analysis
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Market Intelligence</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Error State */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Market Intelligence Component */}
        {marketData ? (
          marketData.hasData ? (
            <MarketIntelligenceReal data={marketData} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Market Intelligence Data Available
                </h3>
                <p className="text-gray-600 mb-4">
                  {marketData.message}
                </p>
                {marketData.reviewCount > 0 && (
                  <p className="text-sm text-gray-500">
                    Found {marketData.reviewCount} reviews but no AI analysis yet.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading market intelligence data...</p>
          </div>
        )}
      </div>
    </div>
  )
}