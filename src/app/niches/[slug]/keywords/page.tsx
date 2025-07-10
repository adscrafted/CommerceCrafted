'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import KeywordsAnalysis from '@/components/products/analysis/KeywordsAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/mockNicheData'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface KeywordsPageProps {
  params: Promise<{ slug: string }>
}

export default function NicheKeywordsPage({ params }: KeywordsPageProps) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [nicheData, setNicheData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      const data = getNicheBySlug(resolvedParams.slug)
      setNicheData(data)
      setTimeout(() => setLoading(false), 500)
    }

    loadData()
  }, [params])

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

  // Transform niche data to match the component's expected format
  const transformedData = {
    ...nicheData,
    title: nicheData.nicheName,
    keywordsData: {
      ...nicheData.keywordsData,
      keywords: [
        nicheData.keywordsData.primaryKeyword,
        ...nicheData.keywordsData.longTailKeywords
      ].map((kw) => ({
        ...kw,
        difficulty: kw.competition === 'Low' ? 25 : kw.competition === 'Medium' ? 50 : 75,
        trend: '+15%',
        seasonality: 'Stable'
      })),
      ppcStrategy: {
        recommendedBudget: nicheData.keywordsData.recommendedBudget,
        estimatedACoS: nicheData.keywordsData.estimatedACoS,
        targetKeywords: [
          {
            keyword: nicheData.keywordsData.primaryKeyword.keyword,
            bidRange: { min: nicheData.keywordsData.primaryKeyword.cpc * 0.8, max: nicheData.keywordsData.primaryKeyword.cpc * 1.2 },
            matchType: 'Exact',
            strategy: 'Main focus keyword'
          },
          ...nicheData.keywordsData.longTailKeywords.slice(0, 3).map((kw: any) => ({
            keyword: kw.keyword,
            bidRange: { min: kw.cpc * 0.8, max: kw.cpc * 1.2 },
            matchType: 'Phrase',
            strategy: 'Long-tail targeting'
          }))
        ],
        campaignStructure: [
          'Brand Defense Campaign',
          'Category Targeting Campaign',
          'Competitor ASIN Targeting',
          'Long-tail Discovery Campaign'
        ]
      },
      listingOptimization: {
        titleKeywords: [nicheData.keywordsData.primaryKeyword.keyword, ...nicheData.keywordsData.longTailKeywords.slice(0, 2).map((k: any) => k.keyword)],
        bulletKeywords: nicheData.keywordsData.longTailKeywords.map((k: any) => k.keyword),
        backendKeywords: nicheData.listingData.backendKeywords,
        searchTermsField: nicheData.listingData.backendKeywords.join(' ')
      }
    }
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
                  <p className="text-base text-gray-600">Search terms, PPC strategy & optimization</p>
                </div>
              </div>
            </div>
            
            {/* Score Display */}
            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(nicheData.scores.keywords)}`}>
                    {nicheData.scores.keywords}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(nicheData.scores.keywords)}</div>
                  <Progress value={nicheData.scores.keywords} className="h-2 mt-2 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <NicheNavigation nicheSlug={slug} nicheName={nicheData.nicheName} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-500">
          <Link href={`/niches/${slug}`} className="hover:text-blue-600">
            {nicheData.nicheName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Keywords Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <KeywordsAnalysis data={transformedData} />
      </div>
    </div>
  )
}