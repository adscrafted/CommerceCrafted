'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DemandAnalysis from '@/components/products/analysis/DemandAnalysis'
import { MembershipGate } from '@/components/MembershipGate'

interface DemandPageProps {
  params: Promise<{ slug: string }>
}

// Mock data - in production this would come from API
const productData = {
  id: 'daily_product_1',
  title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
  mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
  scores: {
    demand: 92
  },
  demandData: {
    monthlySearchVolume: 45000,
    searchTrend: '+23%',
    marketSize: 1200000000,
    marketGrowth: '+15%',
    conversionRate: 12.5,
    clickShare: 32,
    seasonality: {
      jan: 85, feb: 82, mar: 78, apr: 75, may: 70, jun: 68,
      jul: 65, aug: 70, sep: 75, oct: 80, nov: 90, dec: 100
    },
    googleTrends: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 82 },
      { month: 'Mar', value: 78 },
      { month: 'Apr', value: 75 },
      { month: 'May', value: 70 },
      { month: 'Jun', value: 68 },
      { month: 'Jul', value: 65 },
      { month: 'Aug', value: 70 },
      { month: 'Sep', value: 75 },
      { month: 'Oct', value: 80 },
      { month: 'Nov', value: 90 },
      { month: 'Dec', value: 100 }
    ],
    socialSignals: {
      tiktok: { posts: 2341, views: 4500000, engagement: '8.2%' },
      instagram: { posts: 5678, engagement: '6.5%' },
      youtube: { videos: 892, avgViews: 45000 },
      reddit: { discussions: 234, sentiment: 'positive' }
    }
  }
}

export default function DemandPage({ params }: DemandPageProps) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setTimeout(() => setLoading(false), 500)
    }

    loadData()
  }, [params])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  }

  const userTier = session.user?.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Demand Analysis</h1>
                  <p className="text-base text-gray-600">Market size, search volume & customer segments</p>
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
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(productData.scores.demand)}`}>
                    {productData.scores.demand}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(productData.scores.demand)}</div>
                  <Progress value={productData.scores.demand} className="h-2 mt-2 w-full" />
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
            {productData.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Demand Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Key Insights */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>Key Demand Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">High</div>
                <div className="text-sm text-gray-600">Market Demand</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">Growing</div>
                <div className="text-sm text-gray-600">Search Trend</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">Strong</div>
                <div className="text-sm text-gray-600">Social Buzz</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">Q4 Peak</div>
                <div className="text-sm text-gray-600">Seasonality</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demand Analysis Component */}
        <DemandAnalysis data={productData} />
      </div>
    </div>
  )
}