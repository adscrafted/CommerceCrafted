'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import KeywordsAnalysis from '@/components/products/analysis/KeywordsAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { useAmazonSearchTerms } from '@/hooks/useAmazonSearchTerms'
import { mockProductData } from '@/lib/mockProductData'

interface KeywordsPageProps {
  params: Promise<{ slug: string }>
}

export default function KeywordsPage({ params }: KeywordsPageProps) {
  const { user, session, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')

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
      setTimeout(() => setLoading(false), 500)
    }

    loadData()
  }, [params])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !session) {
    return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  }

  const userTier = user.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  }

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
              <Link href={`/products/${slug}`}>
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
                  <div className={`text-3xl font-bold ${getScoreColor(mockProductData.scores.keywords)}`}>
                    {mockProductData.scores.keywords}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(mockProductData.scores.keywords)}</div>
                  <Progress value={mockProductData.scores.keywords} className="h-2 mt-2 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-500">
          <Link href={`/products/${slug}`} className="hover:text-blue-600">
            {mockProductData.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Keywords Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Keywords Analysis Component */}
        <KeywordsAnalysis data={mockProductData} searchTermsData={searchTermsData} />
      </div>
    </div>
  )
}