'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DemandAnalysis from '@/components/products/analysis/DemandAnalysis'
import { MembershipGate } from '@/components/MembershipGate'
import { mockProductData } from '@/lib/mockProductData'

interface DemandPageProps {
  params: Promise<{ slug: string }>
}

// Fallback to mock data
const fallbackProductData = mockProductData

// Function to fetch niche data from database
const fetchNicheData = async (slug: string) => {
  try {
    const response = await fetch(`/api/niches/${slug}/data`, {
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching niche data:', error)
    return null
  }
}

export default function DemandPage({ params }: DemandPageProps) {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(fallbackProductData)
  const [nicheData, setNicheData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      console.log('Demand page: Loading data...')
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      console.log('Demand page: Slug set to:', resolvedParams.slug)
      
      // Fetch niche data to get real sales rank history
      const fetchedNicheData = await fetchNicheData(resolvedParams.slug)
      if (fetchedNicheData) {
        console.log('Fetched niche data with', fetchedNicheData.salesRankHistory?.length, 'sales rank points')
        setNicheData(fetchedNicheData)
        
        // Transform sales rank history for the chart
        if (fetchedNicheData.salesRankHistory && fetchedNicheData.salesRankHistory.length > 0) {
          // Group by date and average the ranks
          const groupedByDate: { [key: string]: number[] } = {}
          fetchedNicheData.salesRankHistory.forEach((entry: any) => {
            const date = new Date(entry.timestamp).toLocaleDateString()
            if (!groupedByDate[date]) {
              groupedByDate[date] = []
            }
            groupedByDate[date].push(entry.sales_rank)
          })
          
          // Create chart data
          const chartData = Object.entries(groupedByDate).map(([date, ranks]) => ({
            date,
            rank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
            categoryRank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
            subcategory: fetchedNicheData.niche?.name || 'Sleep Technology'
          })).slice(-30) // Last 30 days
          
          // Transform price history for pricing trends
          let priceData: any[] = []
          if (fetchedNicheData.priceHistory && fetchedNicheData.priceHistory.length > 0) {
            // Group prices by date
            const priceByDate: { [key: string]: number[] } = {}
            fetchedNicheData.priceHistory.forEach((entry: any) => {
              const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              if (!priceByDate[date]) {
                priceByDate[date] = []
              }
              priceByDate[date].push(entry.price)
            })
            
            // Calculate min, max, avg for each date
            priceData = Object.entries(priceByDate).map(([date, prices]) => ({
              date,
              avg: Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
              min: Math.min(...prices),
              max: Math.max(...prices)
            })).slice(-90) // Last 90 days for pricing
          }
          
          // Update product data with real data
          setProductData({
            ...fallbackProductData,
            demandData: {
              ...fallbackProductData.demandData,
              salesRankHistory: chartData,
              _priceHistory: priceData, // Store price data for pricing tab
              _nicheProducts: fetchedNicheData.products || [] // Store product details
            }
          })
        }
      }
      
      setLoading(false)
    }

    loadData()
  }, [params])

  console.log('Demand page: loading =', loading, 'authLoading =', authLoading)

  // Only wait for page loading, not auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For now, we'll make this page public since we don't have subscription tier data in the user object
  // You can uncomment these lines when subscription management is implemented
  /*
  if (!user) {
    return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  }

  const userTier = user.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  }
  */

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
        {/* Demand Analysis Component */}
        <DemandAnalysis data={productData} />
      </div>
    </div>
  )
}