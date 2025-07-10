'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import LaunchStrategy from '@/components/products/analysis/LaunchStrategy'
import { MembershipGate } from '@/components/MembershipGate'
import { getNicheBySlug } from '@/lib/mockNicheData'
import { NicheNavigation } from '@/components/niches/NicheNavigation'

interface LaunchPageProps {
  params: Promise<{ slug: string }>
}

export default function NicheLaunchPage({ params }: LaunchPageProps) {
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
    launchData: {
      ...nicheData.launchData,
      preLaunch: {
        tasks: [
          'Finalize product sourcing and quality control',
          'Professional product photography',
          'Create listing with optimized content',
          'Set up brand registry and trademark',
          'Prepare inventory (500+ units recommended)',
          'Set up PPC campaigns (not live yet)',
          'Identify and contact potential reviewers'
        ],
        timeline: '2-3 weeks before launch'
      },
      launchWeek: {
        price: nicheData.launchData.launchPrice,
        strategy: nicheData.launchData.week1Strategy.focus,
        tactics: [
          'Activate PPC campaigns with aggressive bidding',
          'Send products to early reviewers',
          'Monitor and adjust pricing hourly',
          'Respond to all customer questions immediately',
          'Track competitor responses'
        ]
      },
      postLaunch: {
        month1: {
          focus: 'Build reviews and optimize listing',
          price: nicheData.launchData.week2to4Strategy.price,
          ppcBudget: nicheData.launchData.week2to4Strategy.ppcBudget,
          goals: nicheData.launchData.milestones[0].target
        },
        month2: {
          focus: 'Scale PPC and improve ranking',
          price: nicheData.launchData.week5to12Strategy.price,
          ppcBudget: nicheData.launchData.week5to12Strategy.ppcBudget,
          goals: nicheData.launchData.milestones[1].target
        },
        month3: {
          focus: 'Optimize for profitability',
          price: nicheData.launchData.regularPrice,
          ppcBudget: nicheData.launchData.week5to12Strategy.ppcBudget,
          goals: nicheData.launchData.milestones[2].target
        }
      },
      reviewStrategy: {
        target: 100,
        tactics: [
          'Amazon Vine program (30 units)',
          'Insert cards with follow-up sequence',
          'Email automation for verified buyers',
          'Early reviewer program',
          'Influencer partnerships'
        ]
      },
      ppcCampaigns: [
        {
          type: 'Sponsored Products - Auto',
          budget: 50,
          strategy: 'Discovery and data gathering'
        },
        {
          type: 'Sponsored Products - Manual',
          budget: 75,
          strategy: 'Target high-converting keywords'
        },
        {
          type: 'Sponsored Brands',
          budget: 25,
          strategy: 'Brand awareness and defense'
        },
        {
          type: 'Product Targeting',
          budget: 25,
          strategy: 'Competitor ASIN targeting'
        }
      ],
      riskMitigation: [
        'Keep 20% budget reserve for adjustments',
        'Monitor competitor price changes daily',
        'Have backup inventory supplier ready',
        'Prepare for potential hijackers',
        'Set up brand protection monitoring'
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
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Rocket className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Launch Strategy</h1>
                  <p className="text-base text-gray-600">90-day roadmap to market domination</p>
                </div>
              </div>
            </div>
            
            {/* Score Display */}
            <Card className="border-2 border-orange-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(nicheData.scores.launch)}`}>
                    {nicheData.scores.launch}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(nicheData.scores.launch)}</div>
                  <Progress value={nicheData.scores.launch} className="h-2 mt-2 w-full" />
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
          <span className="text-gray-900">Launch Strategy</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <LaunchStrategy data={transformedData} />
      </div>
    </div>
  )
}