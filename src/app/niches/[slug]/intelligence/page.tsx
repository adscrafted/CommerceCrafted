'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import MarketIntelligence from '@/components/products/analysis/MarketIntelligence'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/mockNicheData'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface IntelligencePageProps {
  params: Promise<{ slug: string }>
}

export default function NicheIntelligencePage({ params }: IntelligencePageProps) {
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
    intelligenceData: {
      ...nicheData.intelligenceData,
      reviewInsights: {
        totalReviews: nicheData.intelligenceData.totalReviews,
        avgRating: nicheData.intelligenceData.sentimentScore,
        sentimentScore: nicheData.intelligenceData.sentimentScore,
        reviewGrowth: nicheData.intelligenceData.reviewGrowth,
        commonThemes: {
          positive: [
            'High quality materials',
            'Comfortable for long use',
            'Great battery life',
            'Easy to connect'
          ],
          negative: nicheData.intelligenceData.commonComplaints.map((c: any) => c.issue),
          opportunities: nicheData.intelligenceData.opportunities.map((o: any) => o.opportunity)
        }
      },
      customerAvatars: nicheData.intelligenceData.customerAvatars.map((avatar: any) => ({
        ...avatar,
        shoppingBehavior: {
          preferredChannels: ['Amazon Prime', 'Direct brand websites'],
          priceRange: `$${(avatar.avgSpend * 0.8).toFixed(2)} - $${(avatar.avgSpend * 1.2).toFixed(2)}`,
          decisionFactors: avatar.preferredFeatures || []
        }
      })),
      marketIntelligence: {
        trends: [
          `Market growing at ${nicheData.marketOverview.marketGrowth} annually`,
          'Increasing demand for premium features',
          'Shift towards sustainable materials',
          'Rising interest in app-connected devices'
        ],
        competitorWeaknesses: [
          'Poor battery life in most products',
          'Limited comfort for side sleepers',
          'Basic feature sets',
          'Poor customer support'
        ],
        untappedOpportunities: nicheData.intelligenceData.opportunities.map((o: any) => ({
          opportunity: o.opportunity,
          impact: o.potentialImpact
        }))
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
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Market Intelligence</h1>
                  <p className="text-base text-gray-600">Deep analysis of customer sentiment & niche dynamics</p>
                </div>
              </div>
            </div>
            
            {/* Score Display */}
            <Card className="border-2 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(nicheData.scores.intelligence)}`}>
                    {nicheData.scores.intelligence}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(nicheData.scores.intelligence)}</div>
                  <Progress value={nicheData.scores.intelligence} className="h-2 mt-2 w-full" />
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
          <span className="text-gray-900">Market Intelligence</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <MarketIntelligence data={transformedData} />
      </div>
    </div>
  )
}