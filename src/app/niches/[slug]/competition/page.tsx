'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import CompetitionAnalysis from '@/components/products/analysis/CompetitionAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/mockNicheData'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface CompetitionPageProps {
  params: Promise<{ slug: string }>
}

export default function NicheCompetitionPage({ params }: CompetitionPageProps) {
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
    competitionData: {
      ...nicheData.competitionData,
      competitionLevel: nicheData.competitionData.totalCompetitors > 200 ? 'High' : 
                       nicheData.competitionData.totalCompetitors > 100 ? 'Medium' : 'Low',
      topCompetitors: nicheData.competitionData.topCompetitors.map((comp: any) => ({
        ...comp,
        asin: `B0${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        title: `${comp.brand} Premium ${nicheData.nicheName}`,
        price: comp.avgPrice,
        rating: comp.avgRating,
        reviews: Math.floor(comp.marketShare * 1000),
        monthlyRevenue: Math.floor(comp.marketShare * nicheData.marketOverview.totalMonthlyRevenue / 100),
        bsr: Math.floor(Math.random() * 2000) + 500,
        hasAPlus: Math.random() > 0.5,
        hasVideo: Math.random() > 0.7,
        hasBrandStore: true,
        adSpend: Math.floor(comp.marketShare * 5000)
      })),
      priceDistribution: [
        { range: '$0-20', count: Math.floor(nicheData.competitionData.totalCompetitors * 0.15) },
        { range: '$20-30', count: Math.floor(nicheData.competitionData.totalCompetitors * 0.25) },
        { range: '$30-40', count: Math.floor(nicheData.competitionData.totalCompetitors * 0.35) },
        { range: '$40-50', count: Math.floor(nicheData.competitionData.totalCompetitors * 0.15) },
        { range: '$50+', count: Math.floor(nicheData.competitionData.totalCompetitors * 0.10) }
      ],
      competitivePositioning: {
        yourAdvantages: nicheData.competitionData.competitiveAdvantages,
        marketGaps: nicheData.intelligenceData.opportunities.map((o: any) => o.opportunity),
        differentiationStrategy: [
          'Focus on underserved customer segments',
          'Premium quality positioning',
          'Superior customer service',
          'Innovative features not offered by competitors'
        ]
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
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Competition Analysis</h1>
                  <p className="text-base text-gray-600">Competitor landscape & market positioning</p>
                </div>
              </div>
            </div>
            
            {/* Score Display */}
            <Card className="border-2 border-red-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(nicheData.scores.competition)}`}>
                    {nicheData.scores.competition}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(nicheData.scores.competition)}</div>
                  <Progress value={nicheData.scores.competition} className="h-2 mt-2 w-full" />
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
          <span className="text-gray-900">Competition Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <CompetitionAnalysis data={transformedData} />
      </div>
    </div>
  )
}