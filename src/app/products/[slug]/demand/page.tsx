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
import DemandAnalysisReal from '@/components/products/analysis/DemandAnalysisReal'
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

// Function to fetch history data
const fetchHistoryData = async (nicheId: string) => {
  try {
    const response = await fetch(`/api/niches/${nicheId}/history`, {
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching history data:', error)
    return null
  }
}

export default function DemandPage({ params }: DemandPageProps) {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(fallbackProductData)
  const [nicheData, setNicheData] = useState<any>(null)
  const [nicheId, setNicheId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      console.log('Demand page: Loading data...')
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      console.log('Demand page: Slug set to:', resolvedParams.slug)
      
      // Check if we have a nicheId in the query params
      const urlParams = new URLSearchParams(window.location.search)
      const nicheIdParam = urlParams.get('nicheId')
      setNicheId(nicheIdParam)
      
      if (nicheIdParam) {
        // Fetch niche data with keyword hierarchy (same as keywords page)
        try {
          const response = await fetch(`/api/niches/${nicheIdParam}/data`)
          if (response.ok) {
            const historyData = await response.json()
            console.log('Fetched niche data with', historyData.products?.length, 'products')
            console.log('Fetched niche data with', historyData.keywords?.length, 'keywords')
            console.log('Keyword hierarchy data:', historyData.keywordHierarchy)
          
          // Process keyword data
          let keywordMetrics = fallbackProductData.demandData.keywordMetrics
          if (historyData.keywords && historyData.keywords.length > 0) {
            // Calculate total market revenue from keywords
            const totalRevenue = historyData.keywords.reduce((sum: number, kw: any) => {
              const estimatedOrders = kw.estimated_orders || Math.max(1, Math.round((kw.suggested_bid || 100) / 50))
              const avgPrice = historyData.products?.[0]?.price || 29.99
              return sum + (estimatedOrders * avgPrice)
            }, 0)
            
            // Sort keywords by revenue and get top performers
            const keywordData = historyData.keywords.map((kw: any) => {
              const estimatedOrders = kw.estimated_orders || Math.max(1, Math.round((kw.suggested_bid || 100) / 50))
              const estimatedClicks = kw.estimated_clicks || estimatedOrders * 8
              const avgPrice = historyData.products?.[0]?.price || 29.99
              const revenue = estimatedOrders * avgPrice
              const conversionRate = estimatedClicks > 0 ? (estimatedOrders / estimatedClicks) * 100 : 12.5
              
              return {
                keyword: kw.keyword,
                orders: estimatedOrders,
                revenue: revenue,
                growth: '+' + Math.round(Math.random() * 50 + 10) + '%', // Mock growth for now
                searchVolume: estimatedClicks * 2, // Estimate search volume
                clickShare: Math.round(50 + Math.random() * 30), // Mock click share
                conversionRate: conversionRate.toFixed(1)
              }
            }).sort((a: any, b: any) => b.revenue - a.revenue)
            
            // Calculate revenue distribution
            const top10Revenue = keywordData.slice(0, 10).reduce((sum: number, kw: any) => sum + kw.revenue, 0)
            const top50Revenue = keywordData.slice(0, 50).reduce((sum: number, kw: any) => sum + kw.revenue, 0)
            const top10Percentage = (top10Revenue / totalRevenue) * 100
            const top50Percentage = (top50Revenue / totalRevenue) * 100
            const longTailPercentage = 100 - top10Percentage
            
            // Calculate concentration index (0-1, higher = more concentrated)
            const concentrationIndex = (top10Revenue / totalRevenue).toFixed(2)
            
            keywordMetrics = {
              totalKeywords: historyData.keywords.length,
              totalMarketRevenue: totalRevenue,
              topKeywords: keywordData.slice(0, 10),
              keywordDepth: {
                top10: Math.round(top10Percentage),
                top50: Math.round(top50Percentage),
                longTail: Math.round(longTailPercentage)
              },
              concentrationIndex: parseFloat(concentrationIndex)
            }
          }
          
          // Transform sales rank history for the chart
          let chartData: any[] = []
          if (historyData.salesRankHistory && historyData.salesRankHistory.length > 0) {
            // Group by date and average the ranks
            const groupedByDate: { [key: string]: number[] } = {}
            historyData.salesRankHistory.forEach((entry: any) => {
              const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              if (!groupedByDate[date]) {
                groupedByDate[date] = []
              }
              groupedByDate[date].push(entry.sales_rank)
            })
            
            // Create chart data
            chartData = Object.entries(groupedByDate).map(([date, ranks]) => ({
              date,
              rank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
              categoryRank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
              subcategory: historyData.niche?.name || 'Health & Personal Care'
            })).slice(-30) // Last 30 days
          }
          
          // Transform price history for pricing trends
          let priceData: any[] = []
          if (historyData.priceHistory && historyData.priceHistory.length > 0) {
            // Group prices by date
            const priceByDate: { [key: string]: number[] } = {}
            historyData.priceHistory.forEach((entry: any) => {
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
              keywordMetrics,
              salesRankHistory: chartData,
              _priceHistory: priceData, // Store price data for pricing tab
              _nicheProducts: historyData.products || [] // Store product details
            },
            // Pass keyword hierarchy at the top level for the network visualization
            keywordHierarchy: historyData.keywordHierarchy || {}
          })
          setNicheData(historyData)
          } else {
            console.error('Failed to fetch niche data')
            setProductData(fallbackProductData)
          }
        } catch (error) {
          console.error('Error fetching niche data:', error)
          setProductData(fallbackProductData)
        }
      } else {
        // Original flow - fetch niche data to get real sales rank history
        const fetchedNicheData = await fetchNicheData(resolvedParams.slug)
        if (fetchedNicheData) {
          console.log('Fetched niche data with', fetchedNicheData.salesRankHistory?.length, 'sales rank points')
          console.log('Fetched niche data with', fetchedNicheData.keywords?.length, 'keywords')
          setNicheData(fetchedNicheData)
          
          // Process keyword data
          let keywordMetrics = fallbackProductData.demandData.keywordMetrics
          if (fetchedNicheData.keywords && fetchedNicheData.keywords.length > 0) {
            // Calculate total market revenue from keywords
            const totalRevenue = fetchedNicheData.keywords.reduce((sum: number, kw: any) => {
              const estimatedOrders = kw.estimated_orders || Math.max(1, Math.round((kw.suggested_bid || 100) / 50))
              const avgPrice = fetchedNicheData.products?.[0]?.price || 29.99
              return sum + (estimatedOrders * avgPrice)
            }, 0)
            
            // Sort keywords by revenue and get top performers
            const keywordData = fetchedNicheData.keywords.map((kw: any) => {
              const estimatedOrders = kw.estimated_orders || Math.max(1, Math.round((kw.suggested_bid || 100) / 50))
              const estimatedClicks = kw.estimated_clicks || estimatedOrders * 8
              const avgPrice = fetchedNicheData.products?.[0]?.price || 29.99
              const revenue = estimatedOrders * avgPrice
              const conversionRate = estimatedClicks > 0 ? (estimatedOrders / estimatedClicks) * 100 : 12.5
              
              return {
                keyword: kw.keyword,
                orders: estimatedOrders,
                revenue: revenue,
                growth: '+' + Math.round(Math.random() * 50 + 10) + '%', // Mock growth for now
                searchVolume: estimatedClicks * 2, // Estimate search volume
                clickShare: Math.round(50 + Math.random() * 30), // Mock click share
                conversionRate: conversionRate.toFixed(1)
              }
            }).sort((a: any, b: any) => b.revenue - a.revenue)
            
            // Calculate revenue distribution
            const top10Revenue = keywordData.slice(0, 10).reduce((sum: number, kw: any) => sum + kw.revenue, 0)
            const top50Revenue = keywordData.slice(0, 50).reduce((sum: number, kw: any) => sum + kw.revenue, 0)
            const top10Percentage = (top10Revenue / totalRevenue) * 100
            const top50Percentage = (top50Revenue / totalRevenue) * 100
            const longTailPercentage = 100 - top10Percentage
            
            // Calculate concentration index (0-1, higher = more concentrated)
            const concentrationIndex = (top10Revenue / totalRevenue).toFixed(2)
            
            keywordMetrics = {
              totalKeywords: fetchedNicheData.keywords.length,
              totalMarketRevenue: totalRevenue,
              topKeywords: keywordData.slice(0, 10),
              keywordDepth: {
                top10: Math.round(top10Percentage),
                top50: Math.round(top50Percentage),
                longTail: Math.round(longTailPercentage)
              },
              concentrationIndex: parseFloat(concentrationIndex)
            }
          }
          
          // Transform sales rank history for the chart
          let chartData: any[] = []
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
            chartData = Object.entries(groupedByDate).map(([date, ranks]) => ({
              date,
              rank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
              categoryRank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
              subcategory: fetchedNicheData.niche?.name || 'Sleep Technology'
            })).slice(-30) // Last 30 days
          }
          
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
              keywordMetrics,
              salesRankHistory: chartData,
              _priceHistory: priceData, // Store price data for pricing tab
              _nicheProducts: fetchedNicheData.products || [] // Store product details
            },
            // Pass keyword hierarchy at the top level for the network visualization
            keywordHierarchy: fetchedNicheData.keywordHierarchy || {}
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
              <Link href={`/products/${slug}${nicheId ? `?nicheId=${nicheId}` : ''}`}>
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
          <Link href={`/products/${slug}${nicheId ? `?nicheId=${nicheId}` : ''}`} className="hover:text-blue-600">
            {nicheData?.niche?.name || 'Product Analysis'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Demand Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Demand Analysis Component - Use real component if we have product data */}
        {nicheData?.products && nicheData.products.length > 0 ? (
          <>
            <DemandAnalysis data={productData} />
            <div className="mt-6">
              <DemandAnalysisReal products={nicheData.products} />
            </div>
          </>
        ) : (
          <DemandAnalysis data={productData} />
        )}
      </div>
    </div>
  )
}