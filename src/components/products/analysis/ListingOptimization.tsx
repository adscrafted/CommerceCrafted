'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import NextImage from 'next/image'
import MainImagePuller from '@/app/admin/components/MainImagePuller'
import SecondaryImagePuller from '@/app/admin/components/SecondaryImagePuller'
import { 
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Activity,
  Image,
  Edit3,
  Target,
  Play,
  Gauge,
  Shield,
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Camera,
  Type,
  MessageSquare,
  Video,
  Settings,
  Award,
  Search,
  Clock,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package
} from 'lucide-react'

interface ListingOptimizationProps {
  data: any
}

export default function ListingOptimization({ data }: ListingOptimizationProps) {
  const [activeTab, setActiveTab] = useState('main-image')
  const [listingInfo, setListingInfo] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [error, setError] = useState('')

  // Fetch listing data from database on mount
  useEffect(() => {
    if (data.nicheId) {
      fetchListingData()
    }
  }, [data.nicheId])

  const fetchListingData = async () => {
    setLoadingData(true)
    setError('')

    try {
      const response = await fetch(`/api/niches/${data.nicheId}/listing-data`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch listing data')
      }

      const result = await response.json()
      setListingInfo(result)
    } catch (err) {
      console.error('Error fetching listing data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch listing data')
    } finally {
      setLoadingData(false)
    }
  }

  const renderAplusModule = (module: any, index: number) => {
    switch (module.type) {
      case 'IMAGE_HEADER':
        return (
          <div className="space-y-4">
            {module.heading && (
              <h5 className="text-lg font-semibold text-gray-900">{module.heading}</h5>
            )}
            {module.body && (
              <p className="text-gray-700">{module.body}</p>
            )}
            {module.images && module.images.length > 0 && (
              <div className="grid gap-4">
                {module.images.map((image: string, i: number) => (
                  <img
                    key={i}
                    src={image}
                    alt={`Module image ${i + 1}`}
                    className="w-full rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'STANDARD_TEXT':
        return (
          <div className="space-y-4">
            {module.heading && (
              <h5 className="text-lg font-semibold text-gray-900">{module.heading}</h5>
            )}
            {module.body && (
              <p className="text-gray-700 whitespace-pre-wrap">{module.body}</p>
            )}
          </div>
        )

      case 'FOUR_IMAGE_TEXT':
      case 'THREE_IMAGE_TEXT':
        return (
          <div className="space-y-4">
            {module.heading && (
              <h5 className="text-lg font-semibold text-gray-900">{module.heading}</h5>
            )}
            {module.body && (
              <p className="text-gray-700">{module.body}</p>
            )}
            {module.images && module.images.length > 0 && (
              <div className={`grid gap-4 ${module.type === 'FOUR_IMAGE_TEXT' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                {module.images.map((image: string, i: number) => (
                  <img
                    key={i}
                    src={image}
                    alt={`Product image ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'COMPARISON_TABLE':
        return (
          <div className="space-y-4">
            {module.heading && (
              <h5 className="text-lg font-semibold text-gray-900">{module.heading}</h5>
            )}
            {module.tableData && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {module.tableData.map((row: any[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        {row.map((cell: string, cellIdx: number) => (
                          <td key={cellIdx} className="px-4 py-2 text-sm text-gray-700 border">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Module type: {module.type}</p>
            {module.heading && <p className="font-medium mt-2">{module.heading}</p>}
            {module.body && <p className="mt-2">{module.body}</p>}
          </div>
        )
    }
  }

  const exportData = (type: string) => {
    if (!listingInfo) return

    let dataToExport = {}
    
    switch (type) {
      case 'bulletPoints':
        dataToExport = {
          products: listingInfo.products.map((p: any) => ({
            asin: p.asin,
            title: p.title,
            bulletPoints: p.bulletPoints
          })),
          analysis: listingInfo.analysis.bulletPoints
        }
        break
      case 'aplusContent':
        dataToExport = {
          products: listingInfo.products.map((p: any) => ({
            asin: p.asin,
            title: p.title,
            aplusContent: p.aplusContent
          })),
          analysis: listingInfo.analysis.aplusContent
        }
        break
      case 'productTypes':
        dataToExport = {
          products: listingInfo.products.map((p: any) => ({
            asin: p.asin,
            title: p.title,
            category: p.category,
            subcategory: p.subcategory,
            productType: p.productType,
            brand: p.brand
          })),
          analysis: listingInfo.analysis.productTypes
        }
        break
      case 'videos':
        dataToExport = {
          products: listingInfo.products.map((p: any) => ({
            asin: p.asin,
            title: p.title,
            videos: p.videos
          })),
          analysis: listingInfo.analysis.videos
        }
        break
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.nicheName || 'products'}_${type}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    )
  }

  const currentProduct = listingInfo?.products?.[currentProductIndex]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'main-image', label: 'Main Image', icon: Image },
          { id: 'secondary-images', label: 'Secondary Images', icon: Camera },
          { id: 'title', label: 'Title', icon: Type },
          { id: 'bullets', label: 'Bullet Points', icon: Edit3 },
          { id: 'product-type', label: 'Product Type', icon: Package },
          { id: 'aplus', label: 'A+ Content', icon: Sparkles },
          { id: 'video', label: 'Video', icon: Video }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Image Tab */}
      {activeTab === 'main-image' && (
        <MainImagePuller 
          nicheId={data.nicheId} 
          nicheName={data.nicheName || 'Product Collection'} 
        />
      )}

      {/* Secondary Images Tab */}
      {activeTab === 'secondary-images' && (
        <SecondaryImagePuller 
          nicheId={data.nicheId} 
          nicheName={data.nicheName || 'Product Collection'} 
        />
      )}

      {/* Title Tab */}
      {activeTab === 'title' && listingInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="h-5 w-5 text-blue-600" />
                <span>Product Titles</span>
              </CardTitle>
              <CardDescription>
                Review and analyze product titles in your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Product Navigation */}
              {listingInfo.products.length > 1 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                    disabled={currentProductIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Product {currentProductIndex + 1} of {listingInfo.products.length}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.min(listingInfo.products.length - 1, currentProductIndex + 1))}
                    disabled={currentProductIndex === listingInfo.products.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {currentProduct && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{currentProduct.asin}</Badge>
                      <span className="text-sm text-gray-500">
                        {currentProduct.title.length} characters
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{currentProduct.title}</h3>
                  </div>

                  {/* Title Analysis */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentProduct.title.length}
                      </div>
                      <div className="text-sm text-gray-600">Characters</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentProduct.title.split(' ').length}
                      </div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentProduct.title.length <= 80 ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-gray-600">Mobile Optimized</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round((currentProduct.title.length / 200) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Utilization</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bullet Points Tab */}
      {activeTab === 'bullets' && listingInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5 text-green-600" />
                  <span>Bullet Points Analysis</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('bulletPoints')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardTitle>
              <CardDescription>
                Analysis of bullet points across {listingInfo.niche.totalProducts} products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {listingInfo.niche.totalProducts}
                  </div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {listingInfo.analysis.bulletPoints.averageBulletPoints.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Bullet Points</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {listingInfo.analysis.bulletPoints.commonFeatures.length}
                  </div>
                  <div className="text-sm text-gray-600">Common Features</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {listingInfo.analysis.bulletPoints.recommendations.length}
                  </div>
                  <div className="text-sm text-gray-600">Recommendations</div>
                </div>
              </div>

              {/* Product Navigation */}
              {listingInfo.products.length > 1 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                    disabled={currentProductIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Product {currentProductIndex + 1} of {listingInfo.products.length}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.min(listingInfo.products.length - 1, currentProductIndex + 1))}
                    disabled={currentProductIndex === listingInfo.products.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Current Product Bullet Points */}
              {currentProduct && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{currentProduct.title}</h4>
                      <Badge variant="secondary">{currentProduct.asin}</Badge>
                    </div>
                    <ul className="space-y-2">
                      {currentProduct.bulletPoints.map((bullet: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-gray-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Common Features */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Common Features Across Products</h4>
                <div className="flex flex-wrap gap-2">
                  {listingInfo.analysis.bulletPoints.commonFeatures.map((feature: any, i: number) => (
                    <Badge key={i} variant="outline">
                      {feature.feature} ({feature.count})
                    </Badge>
                  ))}
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* A+ Content Tab */}
      {activeTab === 'aplus' && listingInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>A+ Content Analysis</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('aplusContent')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardTitle>
              <CardDescription>
                {listingInfo.analysis.aplusContent.productsWithAplus} of {listingInfo.niche.totalProducts} products have A+ content ({listingInfo.analysis.aplusContent.percentageWithAplus.toFixed(0)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Product Navigation */}
              {listingInfo.products.length > 1 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                    disabled={currentProductIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Product {currentProductIndex + 1} of {listingInfo.products.length}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.min(listingInfo.products.length - 1, currentProductIndex + 1))}
                    disabled={currentProductIndex === listingInfo.products.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Current Product A+ Content */}
              {currentProduct && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{currentProduct.title}</h4>
                    <Badge variant="secondary">{currentProduct.asin}</Badge>
                  </div>

                  {currentProduct.aplusContent && currentProduct.aplusContent.modules && currentProduct.aplusContent.modules.length > 0 ? (
                    <div className="space-y-6">
                      {currentProduct.aplusContent.modules.map((module: any, i: number) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <Badge className="mb-4">{module.type}</Badge>
                          {renderAplusModule(module, i)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-600">No A+ content available for this product</p>
                    </div>
                  )}
                </div>
              )}

              {/* Common Module Types */}
              {listingInfo.analysis.aplusContent.commonModules.length > 0 && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-3">Common A+ Module Types</h4>
                  <div className="space-y-2">
                    {listingInfo.analysis.aplusContent.commonModules.map((module: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-purple-700">{module.type}</span>
                        <Badge variant="outline" className="bg-white">
                          {module.count} products
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Type Tab */}
      {activeTab === 'product-type' && listingInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Product Type Analysis</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('productTypes')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardTitle>
              <CardDescription>
                Category and attribute analysis across {listingInfo.niche.totalProducts} products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Overview */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {listingInfo.analysis.productTypes.categories.map((cat: string, i: number) => (
                      <div key={i} className="text-sm text-gray-700">{cat || 'Uncategorized'}</div>
                    ))}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Subcategories</h4>
                  <div className="space-y-2">
                    {listingInfo.analysis.productTypes.subcategories.slice(0, 5).map((sub: string, i: number) => (
                      <div key={i} className="text-sm text-gray-700">{sub || 'None'}</div>
                    ))}
                    {listingInfo.analysis.productTypes.subcategories.length > 5 && (
                      <div className="text-sm text-gray-500">
                        +{listingInfo.analysis.productTypes.subcategories.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                  <div className="space-y-2">
                    {listingInfo.analysis.productTypes.brands.slice(0, 5).map((brand: string, i: number) => (
                      <div key={i} className="text-sm text-gray-700">{brand || 'Unknown'}</div>
                    ))}
                    {listingInfo.analysis.productTypes.brands.length > 5 && (
                      <div className="text-sm text-gray-500">
                        +{listingInfo.analysis.productTypes.brands.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Navigation */}
              {listingInfo.products.length > 1 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                    disabled={currentProductIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Product {currentProductIndex + 1} of {listingInfo.products.length}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.min(listingInfo.products.length - 1, currentProductIndex + 1))}
                    disabled={currentProductIndex === listingInfo.products.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Current Product Details */}
              {currentProduct && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">{currentProduct.title}</h4>
                      <Badge variant="secondary">{currentProduct.asin}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Category</Label>
                        <p className="font-medium">{currentProduct.category || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Subcategory</Label>
                        <p className="font-medium">{currentProduct.subcategory || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Product Type</Label>
                        <p className="font-medium">{currentProduct.productType}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Brand</Label>
                        <p className="font-medium">{currentProduct.brand || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Attributes */}
              {listingInfo.analysis.productTypes.commonAttributes.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Common Attributes</h4>
                  <div className="space-y-3">
                    {listingInfo.analysis.productTypes.commonAttributes.map((attr: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900 mb-1 capitalize">{attr.attribute}</div>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.slice(0, 10).map((value: string, j: number) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                          {attr.values.length > 10 && (
                            <span className="text-xs text-gray-500">
                              +{attr.values.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Video Tab */}
      {activeTab === 'video' && listingInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="h-5 w-5 text-red-600" />
                  <span>Video Analysis</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportData('videos')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardTitle>
              <CardDescription>
                {listingInfo.analysis.videos.productsWithVideos} of {listingInfo.niche.totalProducts} products have videos ({listingInfo.analysis.videos.percentageWithVideos.toFixed(0)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Video Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {listingInfo.analysis.videos.totalVideos}
                  </div>
                  <div className="text-sm text-gray-600">Total Videos</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {listingInfo.analysis.videos.productsWithVideos}
                  </div>
                  <div className="text-sm text-gray-600">Products with Videos</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(listingInfo.analysis.videos.totalVideos / (listingInfo.analysis.videos.productsWithVideos || 1)).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Videos/Product</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(listingInfo.analysis.videos.videoTypes).length}
                  </div>
                  <div className="text-sm text-gray-600">Video Types</div>
                </div>
              </div>

              {/* Product Navigation */}
              {listingInfo.products.length > 1 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.max(0, currentProductIndex - 1))}
                    disabled={currentProductIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Product {currentProductIndex + 1} of {listingInfo.products.length}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProductIndex(Math.min(listingInfo.products.length - 1, currentProductIndex + 1))}
                    disabled={currentProductIndex === listingInfo.products.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Current Product Videos */}
              {currentProduct && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{currentProduct.title}</h4>
                    <Badge variant="secondary">{currentProduct.asin}</Badge>
                  </div>

                  {currentProduct.videos && currentProduct.videos.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentProduct.videos.map((video: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                            <Play className="h-12 w-12 text-gray-400" />
                          </div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            {video.title || 'Product Video'}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {video.type || 'Unknown Type'}
                          </Badge>
                          {video.url && (
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-2 block"
                            >
                              View on Amazon
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 rounded-lg text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No videos available for this product</p>
                    </div>
                  )}
                </div>
              )}

              {/* Video Type Distribution */}
              {Object.keys(listingInfo.analysis.videos.videoTypes).length > 0 && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3">Video Type Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(listingInfo.analysis.videos.videoTypes).map(([type, count]: [string, any], i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-red-700 capitalize">{type}</span>
                        <Badge variant="outline" className="bg-white">
                          {count} videos
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}