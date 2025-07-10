'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import FinancialAnalysis from '@/components/products/analysis/FinancialAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/mockNicheData'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface FinancialPageProps {
  params: Promise<{ slug: string }>
}

export default function NicheFinancialPage({ params }: FinancialPageProps) {
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
    financialData: {
      ...nicheData.financialData,
      totalFees: nicheData.financialData.amazonFees,
      monthlyRevenue: [
        { month: 'Month 1', revenue: nicheData.financialData.monthlyProjections.revenue * 0.3, profit: nicheData.financialData.monthlyProjections.profit * 0.1, units: nicheData.financialData.monthlyProjections.units * 0.3 },
        { month: 'Month 2', revenue: nicheData.financialData.monthlyProjections.revenue * 0.5, profit: nicheData.financialData.monthlyProjections.profit * 0.3, units: nicheData.financialData.monthlyProjections.units * 0.5 },
        { month: 'Month 3', revenue: nicheData.financialData.monthlyProjections.revenue * 0.8, profit: nicheData.financialData.monthlyProjections.profit * 0.7, units: nicheData.financialData.monthlyProjections.units * 0.8 },
        { month: 'Month 4', revenue: nicheData.financialData.monthlyProjections.revenue, profit: nicheData.financialData.monthlyProjections.profit, units: nicheData.financialData.monthlyProjections.units },
        { month: 'Month 5', revenue: nicheData.financialData.monthlyProjections.revenue * 1.1, profit: nicheData.financialData.monthlyProjections.profit * 1.1, units: nicheData.financialData.monthlyProjections.units * 1.1 },
        { month: 'Month 6', revenue: nicheData.financialData.monthlyProjections.revenue * 1.2, profit: nicheData.financialData.monthlyProjections.profit * 1.2, units: nicheData.financialData.monthlyProjections.units * 1.2 }
      ],
      scenarios: {
        conservative: {
          monthlyRevenue: nicheData.financialData.monthlyProjections.revenue * 0.7,
          monthlyProfit: nicheData.financialData.monthlyProjections.profit * 0.6,
          roi: nicheData.financialData.monthlyProjections.roi * 0.7,
          breakEven: nicheData.financialData.breakEvenTimeline * 1.5
        },
        realistic: {
          monthlyRevenue: nicheData.financialData.monthlyProjections.revenue,
          monthlyProfit: nicheData.financialData.monthlyProjections.profit,
          roi: nicheData.financialData.monthlyProjections.roi,
          breakEven: nicheData.financialData.breakEvenTimeline
        },
        optimistic: {
          monthlyRevenue: nicheData.financialData.monthlyProjections.revenue * 1.5,
          monthlyProfit: nicheData.financialData.monthlyProjections.profit * 1.8,
          roi: nicheData.financialData.monthlyProjections.roi * 1.5,
          breakEven: nicheData.financialData.breakEvenTimeline * 0.7
        }
      },
      cashFlow: [
        { month: 'Month 1', income: 0, expenses: nicheData.financialData.investmentRequired.total, balance: -nicheData.financialData.investmentRequired.total },
        { month: 'Month 2', income: nicheData.financialData.monthlyProjections.revenue * 0.3, expenses: 5000, balance: -nicheData.financialData.investmentRequired.total + (nicheData.financialData.monthlyProjections.revenue * 0.3 - 5000) },
        { month: 'Month 3', income: nicheData.financialData.monthlyProjections.revenue * 0.8, expenses: 8000, balance: -nicheData.financialData.investmentRequired.total + (nicheData.financialData.monthlyProjections.revenue * 1.1 - 13000) },
        { month: 'Month 4', income: nicheData.financialData.monthlyProjections.revenue, expenses: 10000, balance: 15000 },
        { month: 'Month 5', income: nicheData.financialData.monthlyProjections.revenue * 1.1, expenses: 11000, balance: 35000 },
        { month: 'Month 6', income: nicheData.financialData.monthlyProjections.revenue * 1.2, expenses: 12000, balance: 60000 }
      ]
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
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Financial Analysis</h1>
                  <p className="text-base text-gray-600">Profitability, ROI & cash flow projections</p>
                </div>
              </div>
            </div>
            
            {/* Score Display */}
            <Card className="border-2 border-emerald-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(nicheData.scores.financial)}`}>
                    {nicheData.scores.financial}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(nicheData.scores.financial)}</div>
                  <Progress value={nicheData.scores.financial} className="h-2 mt-2 w-full" />
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
          <span className="text-gray-900">Financial Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <FinancialAnalysis data={transformedData} />
      </div>
    </div>
  )
}