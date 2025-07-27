'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

export default function DemandPage({ params }: DemandPageProps) {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(null)
  const [nicheId, setNicheId] = useState<string | null>(null)
  const [nicheName, setNicheName] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      const nicheIdParam = searchParams.get('nicheId')
      setNicheId(nicheIdParam)
      
      if (nicheIdParam) {
        try {
          const response = await fetch(`/api/niches/${nicheIdParam}/data`)
          if (response.ok) {
            const data = await response.json()
            
            if (data.niche?.name) {
              setNicheName(data.niche.name)
            }
            
            let product = data.products?.find((p: any) => {
              const productSlug = p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
              const matchesSlug = productSlug?.includes(resolvedParams.slug) || resolvedParams.slug.includes(productSlug)
              const matchesAsin = p.asin === resolvedParams.slug
              return matchesSlug || matchesAsin
            })
            
            if (!product && data.products?.length > 0) {
              product = data.products[0]
            }
            
            if (product) {
              const transformedData = {
                title: product.title || '',
                shortTitle: product.title ? (product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title) : '',
                asin: product.asin || '',
                scores: {
                  demand: 92 // Can be extracted from real data later
                },
                demandData: {
                  ...data.demandData,
                  keywordHierarchy: data.keywordHierarchy,
                  priceHistory: data.priceHistory || [],
                  salesRankHistory: data.salesRankHistory || [],
                  reviewHistory: data.reviewHistory || {}
                },
                keywordHierarchy: data.keywordHierarchy || {},
                nicheProducts: data.products || [],
                priceHistory: data.priceHistory || [],
                salesRankHistory: data.salesRankHistory || [],
                reviewHistory: data.reviewHistory || {}
              }
              
              setProductData(transformedData)
            } else {
              setProductData(null)
            }
          } else {
            setProductData(null)
          }
        } catch (error) {
          console.error('Error fetching niche data:', error)
          setProductData(null)
        }
      } else {
        setProductData(null)
      }
      
      setLoading(false)
    }

    loadData()
  }, [params, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Please provide a valid nicheId parameter to view demand analysis.</p>
        </div>
      </div>
    )
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
            {nicheName || 'Product Analysis'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Demand Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* Demand Analysis Component */}
        <DemandAnalysis 
          data={productData}
          nicheId={nicheId} 
        />
      </div>
    </div>
  )
}