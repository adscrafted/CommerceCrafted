'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ListingOptimization from '@/components/products/analysis/ListingOptimization'
import { MembershipGate } from '@/components/MembershipGate'
import { mockProductData } from '@/lib/mockProductData'

interface ListingPageProps {
  params: Promise<{ slug: string }>
}

export default function ListingPage({ params }: ListingPageProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productTitle, setProductTitle] = useState<string>('Product')
  const [nicheName, setNicheName] = useState<string>('')
  
  // Get nicheId from search params
  const nicheId = searchParams.get('nicheId')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      console.log('Listing page loading for slug:', resolvedParams.slug)
      console.log('NicheId from query params:', nicheId)
      
      if (nicheId) {
        try {
          const response = await fetch(`/api/niches/${nicheId}/showcase`)
          if (response.ok) {
            const nicheData = await response.json()
            setProductTitle(nicheData.title || 'Product')
            setNicheName(nicheData.title || 'Product Collection')
          }
        } catch (error) {
          console.error('Error fetching niche data:', error)
        }
      }
      
      setLoading(false)
    }

    loadData()
  }, [params, nicheId])

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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Listing Optimization</h1>
                  <p className="text-base text-gray-600">Title, images, A+ content & video strategy</p>
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
            <Card className="border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(mockProductData.scores.listing)}`}>
                    {mockProductData.scores.listing}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(mockProductData.scores.listing)}</div>
                  <Progress value={mockProductData.scores.listing} className="h-2 mt-2 w-full" />
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
            {nicheName || 'Product Analysis'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Listing Optimization</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* Listing Optimization Component */}
        <ListingOptimization data={{
          ...mockProductData,
          nicheId: nicheId,
          nicheName: nicheName
        }} />
      </div>
    </div>
  )
}