'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Check,
  X,
  Target,
  Award,
  Search,
  Users
} from 'lucide-react'

interface EnhancedProductTitlesSectionProps {
  data: any
  listingInfo: any
}

interface KeywordCoverageData {
  keyword: string
  isRoot: boolean
  isInTitle: boolean
  importance: 'high' | 'medium' | 'low'
  revenue?: number
  orders?: number
}

export default function EnhancedProductTitlesSection({ data, listingInfo }: EnhancedProductTitlesSectionProps) {
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

  // Build keyword coverage analysis (root keywords only)
  const buildKeywordCoverage = () => {
    const keywords: KeywordCoverageData[] = []
    const title = selectedProduct.title.toLowerCase()

    // Add root keywords only
    Object.entries(keywordHierarchy).forEach(([root, rootData]: [string, any]) => {
      keywords.push({
        keyword: root,
        isRoot: true,
        isInTitle: title.includes(root.toLowerCase()),
        importance: rootData.totalRevenue > 1000 ? 'high' : rootData.totalRevenue > 500 ? 'medium' : 'low',
        revenue: rootData.totalRevenue,
        orders: rootData.totalOrders
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

  const keywordCoverage = buildKeywordCoverage()
  const totalKeywords = keywordCoverage.length
  const coveredKeywords = keywordCoverage.filter(kw => kw.isInTitle).length
  const coverageScore = totalKeywords > 0 ? Math.round((coveredKeywords / totalKeywords) * 100) : 0

  // Calculate competitor coverage scores
  const competitorScores = listingInfo.products.map((product: any, index: number) => {
    const title = product.title.toLowerCase()
    const tempKeywords = Object.entries(keywordHierarchy).map(([root, rootData]: [string, any]) => ({
      keyword: root,
      isInTitle: title.includes(root.toLowerCase()),
      importance: rootData.totalRevenue > 1000 ? 'high' : rootData.totalRevenue > 500 ? 'medium' : 'low',
      revenue: rootData.totalRevenue,
      orders: rootData.totalOrders
    }))
    const covered = tempKeywords.filter(kw => kw.isInTitle).length
    const total = tempKeywords.length
    const score = total > 0 ? Math.round((covered / total) * 100) : 0
    return {
      index,
      asin: product.asin,
      title: product.title,
      score,
      covered,
      total,
      product,
      image: product.images?.[0] || `https://m.media-amazon.com/images/I/${product.image_urls?.split(',')[0]?.trim() || 'placeholder'}`
    }
  }).sort((a, b) => b.score - a.score)

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-orange-600 bg-orange-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Competitor Title Performance</span>
          </CardTitle>
          <CardDescription>
            Compare competitor root keyword coverage in product titles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Side: Competitor Performance List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Competitors by Coverage</h4>
                </div>
                <Badge variant="outline" className="text-xs">
                  {competitorScores.length} products
                </Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {competitorScores.map((competitor, index) => (
                  <div
                    key={competitor.asin}
                    onClick={() => setSelectedProductAsin(competitor.asin)}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProductAsin === competitor.asin 
                        ? 'border-blue-500 bg-blue-50' 
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
                      </div>
                      <div className="text-sm text-gray-900 mb-1">
                        {competitor.title}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {competitor.covered}/{competitor.total} roots
                        </div>
                        <Progress value={competitor.score} className="h-1 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Selected Product Keyword Coverage */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Root Keyword Analysis</h4>
                {selectedProduct && (
                  <Badge variant="outline" className="text-xs">
                    {selectedProduct.asin}
                  </Badge>
                )}
              </div>


              {/* Keyword Coverage List */}
              {loadingKeywords ? (
                <div className="p-8 text-center text-gray-500">
                  Loading keyword data...
                </div>
              ) : keywordCoverage.length > 0 ? (
                <div className="max-h-[500px] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {keywordCoverage.map((keyword, index) => (
                      <div
                        key={index}
                        className={`flex flex-col p-2 rounded border ${
                          keyword.isInTitle ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`p-1 rounded-full ${keyword.isInTitle ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {keyword.isInTitle ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 capitalize flex-1">
                            {keyword.keyword}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getImportanceColor(keyword.importance)}`}>
                            {keyword.importance}
                          </Badge>
                          {keyword.revenue && (
                            <span className="text-xs text-gray-500 font-mono">
                              ${(keyword.revenue / 1000).toFixed(0)}k
                            </span>
                          )}
                        </div>
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
        </CardContent>
      </Card>
    </div>
  )
}