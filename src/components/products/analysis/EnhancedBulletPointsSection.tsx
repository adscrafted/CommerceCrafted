'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Check,
  X,
  Edit3,
  Download,
  Users,
  Award,
  List,
  TrendingUp,
  Lightbulb
} from 'lucide-react'

interface EnhancedBulletPointsSectionProps {
  data: any
  listingInfo: any
}

interface RootKeywordCoverage {
  keyword: string
  isInBullets: boolean
  importance: 'high' | 'medium' | 'low'
  revenue?: number
  orders?: number
  bulletContext?: string
}

interface CompetitorBulletAnalysis {
  asin: string
  title: string
  score: number
  rootsCovered: number
  totalRoots: number
  bulletCount: number
  product: any
  image: string
  topMissingRoots: string[]
}

export default function EnhancedBulletPointsSection({ data, listingInfo }: EnhancedBulletPointsSectionProps) {
  const [selectedProductAsin, setSelectedProductAsin] = useState<string>('')
  const [keywordHierarchy, setKeywordHierarchy] = useState<any>({})
  const [loadingKeywords, setLoadingKeywords] = useState(false)

  // Fetch keyword hierarchy data
  useEffect(() => {
    const fetchKeywordData = async () => {
      if (!data.nicheId) return

      setLoadingKeywords(true)
      try {
        const response = await fetch(`/api/niches/${data.nicheId}/data`)
        if (response.ok) {
          const result = await response.json()
          setKeywordHierarchy(result.keywordHierarchy || {})
        }
      } catch (error) {
        console.error('Error fetching keyword data:', error)
      } finally {
        setLoadingKeywords(false)
      }
    }

    fetchKeywordData()
  }, [data.nicheId])

  // Set initial selected product
  useEffect(() => {
    if (listingInfo?.products?.length > 0 && !selectedProductAsin) {
      setSelectedProductAsin(listingInfo.products[0].asin)
    }
  }, [listingInfo, selectedProductAsin])

  if (!listingInfo?.products?.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No product data available
      </div>
    )
  }

  const selectedProduct = listingInfo.products.find((p: any) => p.asin === selectedProductAsin) || listingInfo.products[0]

  // Build root keyword coverage for bullet points
  const buildRootKeywordCoverage = (product: any) => {
    const keywords: RootKeywordCoverage[] = []
    const bulletText = product.bulletPoints.join(' ').toLowerCase()

    // Add root keywords only
    Object.entries(keywordHierarchy).forEach(([root, rootData]: [string, any]) => {
      const isInBullets = bulletText.includes(root.toLowerCase())
      let bulletContext = ''
      
      if (isInBullets) {
        // Find which bullet point contains this keyword
        const containingBullet = product.bulletPoints.find((bullet: string) => 
          bullet.toLowerCase().includes(root.toLowerCase())
        )
        bulletContext = containingBullet || ''
      }

      keywords.push({
        keyword: root,
        isInBullets,
        importance: rootData.totalRevenue > 1000 ? 'high' : rootData.totalRevenue > 500 ? 'medium' : 'low',
        revenue: rootData.totalRevenue,
        orders: rootData.totalOrders,
        bulletContext: bulletContext.length > 80 ? bulletContext.substring(0, 80) + '...' : bulletContext
      })
    })

    return keywords.sort((a, b) => {
      // Sort by importance first, then by revenue
      const importanceOrder = { high: 3, medium: 2, low: 1 }
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[b.importance] - importanceOrder[a.importance]
      }
      return (b.revenue || 0) - (a.revenue || 0)
    })
  }

  // Calculate competitor bullet point performance
  const competitorAnalysis: CompetitorBulletAnalysis[] = listingInfo.products.map((product: any, index: number) => {
    const rootKeywords = buildRootKeywordCoverage(product)
    const rootsCovered = rootKeywords.filter(kw => kw.isInBullets).length
    const totalRoots = rootKeywords.length
    const score = totalRoots > 0 ? Math.round((rootsCovered / totalRoots) * 100) : 0
    const topMissingRoots = rootKeywords
      .filter(kw => !kw.isInBullets && kw.importance === 'high')
      .slice(0, 3)
      .map(kw => kw.keyword)

    return {
      asin: product.asin,
      title: product.title,
      score,
      rootsCovered,
      totalRoots,
      bulletCount: product.bulletPoints.length,
      product,
      image: product.images?.[0] || `https://m.media-amazon.com/images/I/${product.image_urls?.split(',')[0]?.trim() || 'placeholder'}`,
      topMissingRoots
    }
  }).sort((a, b) => b.score - a.score)

  const selectedKeywordCoverage = buildRootKeywordCoverage(selectedProduct)

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const exportData = () => {
    const dataToExport = {
      analysis: {
        competitors: competitorAnalysis,
        rootKeywordsCoverage: selectedKeywordCoverage,
        summary: {
          totalProducts: listingInfo.products.length,
          averageBulletPoints: listingInfo.analysis.bulletPoints.averageBulletPoints,
          commonFeatures: listingInfo.analysis.bulletPoints.commonFeatures,
          recommendations: listingInfo.analysis.bulletPoints.recommendations
        }
      },
      products: listingInfo.products.map((p: any) => ({
        asin: p.asin,
        title: p.title,
        bulletPoints: p.bulletPoints
      }))
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.nicheName || 'products'}_bullet_points_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5 text-green-600" />
              <span>Competitor Bullet Points Performance</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardTitle>
          <CardDescription>
            Compare competitor root keyword coverage in bullet points across {listingInfo.products.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side: Competitor Performance List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Competitors by Root Coverage</h4>
                </div>
                <Badge variant="outline" className="text-xs">
                  {competitorAnalysis.length} products
                </Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {competitorAnalysis.map((competitor, index) => (
                  <div
                    key={competitor.asin}
                    onClick={() => setSelectedProductAsin(competitor.asin)}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProductAsin === competitor.asin 
                        ? 'border-green-500 bg-green-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={competitor.image}
                        alt={competitor.title}
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image'
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {index === 0 && (
                          <Award className="h-3 w-3 text-yellow-500" />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {competitor.asin}
                        </Badge>
                        <Badge className={`text-xs ${
                          competitor.score >= 80 ? 'bg-green-100 text-green-800' :
                          competitor.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {competitor.score}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {competitor.bulletCount} bullets
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-900 mb-1">
                        {competitor.title}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {competitor.rootsCovered}/{competitor.totalRoots} roots
                        </div>
                        <Progress value={competitor.score} className="h-1 w-16" />
                      </div>
                      {/* Show top missing high-value roots */}
                      {competitor.topMissingRoots.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Missing: {competitor.topMissingRoots.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Selected Product Root Keyword Coverage */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <List className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Root Keywords in Bullet Points</h4>
                {selectedProduct && (
                  <Badge variant="outline" className="text-xs">
                    {selectedProduct.asin}
                  </Badge>
                )}
              </div>

              {/* Root Keyword Coverage List */}
              {loadingKeywords ? (
                <div className="p-8 text-center text-gray-500">
                  Loading keyword data...
                </div>
              ) : selectedKeywordCoverage.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <div className="space-y-3">
                    {selectedKeywordCoverage.map((keyword, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${
                          keyword.isInBullets ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-1 rounded-full ${keyword.isInBullets ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {keyword.isInBullets ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 capitalize flex-1">
                            {keyword.keyword}
                          </span>
                          <Badge className={`text-xs ${getImportanceColor(keyword.importance)}`}>
                            {keyword.importance}
                          </Badge>
                          {keyword.revenue && (
                            <span className="text-xs text-gray-500 font-mono">
                              ${(keyword.revenue / 1000).toFixed(0)}k
                            </span>
                          )}
                        </div>
                        {keyword.isInBullets && keyword.bulletContext && (
                          <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600 italic border-l-2 border-green-300">
                            "{keyword.bulletContext}"
                          </div>
                        )}
                        {!keyword.isInBullets && keyword.importance === 'high' && (
                          <div className="mt-2 text-xs text-red-600 flex items-center">
                            <Lightbulb className="h-3 w-3 mr-1" />
                            High-value keyword missing from bullets
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No keyword data available
                </div>
              )}
            </div>
          </div>

          {/* Summary Analytics Section */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Analysis Summary
            </h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {listingInfo.analysis.bulletPoints.averageBulletPoints.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Bullet Points</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(competitorAnalysis.reduce((sum, comp) => sum + comp.score, 0) / competitorAnalysis.length)}%
                </div>
                <div className="text-sm text-gray-600">Avg Root Coverage</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {listingInfo.analysis.bulletPoints.commonFeatures.length}
                </div>
                <div className="text-sm text-gray-600">Common Features</div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {competitorAnalysis.filter(comp => comp.score >= 80).length}
                </div>
                <div className="text-sm text-gray-600">High Performers</div>
              </div>
            </div>

            {/* Recommendations */}
            {listingInfo.analysis.bulletPoints.recommendations.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {listingInfo.analysis.bulletPoints.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-blue-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}