'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DemandAnalysis from '@/components/products/analysis/DemandAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface DemandPageProps {
  params: Promise<{ slug: string }>
}

export default function NicheDemandPage({ params }: DemandPageProps) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [nicheData, setNicheData] = useState<any>(null)
  const [demandData, setDemandData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      
      try {
        // Fetch real data from API
        const response = await fetch(`/api/niches/${resolvedParams.slug}/demand`)
        if (!response.ok) throw new Error('Failed to fetch demand data')
        
        const data = await response.json()
        setNicheData(data.niche)
        setDemandData(data)
      } catch (error) {
        console.error('Error loading demand data:', error)
      } finally {
        setLoading(false)
      }
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
    return <MembershipGate productTitle={nicheData?.niche_name || 'Niche Analysis'} productImage="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop" />
  }

  const userTier = session.user?.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={nicheData?.niche_name || 'Niche Analysis'} productImage="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop" />
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

  // Transform real data to match the component's expected format
  const transformedData = {
    title: nicheData.niche_name || nicheData.name,
    nicheName: nicheData.niche_name || nicheData.name,
    scores: {
      demand: demandData?.demandAnalysis?.demand_score || 85
    },
    demandData: {
      marketSize: demandData?.demandAnalysis?.market_size || 0,
      marketGrowth: demandData?.demandAnalysis?.growth_rate || 0,
      searchVolume: demandData?.demandAnalysis?.search_volume || 0,
      trendScore: demandData?.demandAnalysis?.trend_score || 0,
      seasonality: demandData?.demandAnalysis?.seasonality_data || {},
      googleTrends: demandData?.demandAnalysis?.search_trends || [],
      socialTrends: demandData?.demandAnalysis?.social_trends || [],
      customerAvatars: demandData?.demandAnalysis?.customer_segments || [],
      ...demandData?.demandAnalysis
    },
    hasData: demandData?.hasData || false
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
                  <div className={`text-3xl font-bold ${getScoreColor(transformedData.scores.demand)}`}>
                    {transformedData.scores.demand}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(transformedData.scores.demand)}</div>
                  <Progress value={transformedData.scores.demand} className="h-2 mt-2 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <NicheNavigation nicheSlug={slug} nicheName={transformedData.nicheName} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-500">
          <Link href={`/niches/${slug}`} className="hover:text-blue-600">
            {transformedData.nicheName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Demand Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DemandAnalysis data={transformedData} nicheId={nicheData?.id} />
      </div>
    </div>
  )
}