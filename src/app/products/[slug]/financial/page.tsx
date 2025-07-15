'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import FinancialAnalysis from '@/components/products/analysis/FinancialAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { mockProductData } from '@/lib/mockProductData'

interface FinancialPageProps {
  params: Promise<{ slug: string }>
}

export default function FinancialPage({ params }: FinancialPageProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      console.log('Financial page loading for slug:', resolvedParams.slug)
      setLoading(false)
    }

    loadData()
  }, [params])

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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calculator className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Financial Analysis</h1>
                  <p className="text-base text-gray-600">Profitability, ROI & investment analysis</p>
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
                  <div className={`text-3xl font-bold ${getScoreColor(mockProductData.scores.financial)}`}>
                    {mockProductData.scores.financial}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(mockProductData.scores.financial)}</div>
                  <Progress value={mockProductData.scores.financial} className="h-2 mt-2 w-full" />
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
          <span className="text-gray-900">Financial Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Financial Analysis Component */}
        <FinancialAnalysis data={mockProductData} />
      </div>
    </div>
  )
}