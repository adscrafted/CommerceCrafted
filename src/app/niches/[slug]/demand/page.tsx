'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DemandAnalysis from '@/components/products/analysis/DemandAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/mockNicheData'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface DemandPageProps {
  params: Promise<{ slug: string }>
}

export default function NicheDemandPage({ params }: DemandPageProps) {
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
    demandData: {
      ...nicheData.demandData,
      marketSize: nicheData.marketOverview.nicheMarketSize,
      marketGrowth: nicheData.marketOverview.marketGrowth,
      googleTrends: Object.entries(nicheData.demandData.seasonality).map(([month, value]) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        value
      })),
      customerAvatars: nicheData.intelligenceData.customerAvatars.map((avatar: any) => ({
        name: avatar.name,
        age: `${avatar.percentage}% of market`,
        gender: 'Mixed',
        income: `Avg spend: $${avatar.avgSpend}`,
        location: 'United States',
        occupation: avatar.name,
        lifestyle: avatar.keyNeeds.join(', '),
        pain: avatar.keyNeeds[0],
        deepPainPoints: avatar.keyNeeds,
        motivation: 'Find quality products that meet specific needs',
        goals: avatar.preferredFeatures,
        shoppingBehavior: {
          researchStyle: 'Reads detailed reviews',
          decisionFactors: avatar.preferredFeatures,
          pricePoint: `$${(avatar.avgSpend * 0.8).toFixed(2)}-$${(avatar.avgSpend * 1.2).toFixed(2)}`,
          purchaseTime: 'Various',
          brandLoyalty: 'Medium'
        },
        psychographics: {
          values: ['Quality', 'Innovation', 'Value'],
          interests: avatar.preferredFeatures,
          personality: 'Practical and research-oriented',
          mediaConsumption: ['Amazon reviews', 'YouTube', 'Forums']
        },
        buyingJourney: {
          awareness: 'Searches for specific features',
          consideration: 'Compares multiple products',
          decision: 'Buys based on reviews and features',
          retention: 'Likely to repurchase if satisfied'
        }
      }))
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Demand Analysis</h1>
                  <p className="text-base text-gray-600">Market size, trends & customer demographics</p>
                </div>
              </div>
            </div>
            
            {/* Score Display */}
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(nicheData.scores.demand)}`}>
                    {nicheData.scores.demand}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(nicheData.scores.demand)}</div>
                  <Progress value={nicheData.scores.demand} className="h-2 mt-2 w-full" />
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
          <span className="text-gray-900">Demand Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DemandAnalysis data={transformedData} />
      </div>
    </div>
  )
}