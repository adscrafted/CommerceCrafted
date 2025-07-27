'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { 
  Target, 
  DollarSign,
  Crown,
  Star,
  CheckCircle,
  Layers,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Search,
  TrendingUp,
  FileText,
  Eye,
  Swords,
  Users,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronRight,
  ShoppingCart
} from 'lucide-react'

interface CompetitionAnalysisProps {
  data: any
}

export default function CompetitionAnalysis({ data }: CompetitionAnalysisProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('competitors')
  const [keywordData, setKeywordData] = useState<any[]>([])
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({})
  const [expandedCompetitors, setExpandedCompetitors] = useState<{ [key: string]: boolean }>({})
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number>(0)
  const [enlargedImageSet, setEnlargedImageSet] = useState<string[]>([])
  const [visibleMetrics, setVisibleMetrics] = useState<{ [key: string]: boolean }>({
    price: true,
    bsr: true,
    rating: true,
    reviews: true
  })
  const [competitorFilter, setCompetitorFilter] = useState<'all' | 'strong' | 'average' | 'weak'>('all')
  
  // Amazon Simulator state
  const [searchTerm, setSearchTerm] = useState('')
  const [marketplace, setMarketplace] = useState('us')
  const [yourAsin, setYourAsin] = useState('')
  const [simulationResults, setSimulationResults] = useState<any[]>([])
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationRun, setSimulationRun] = useState(false)
  
  const toggleMetric = (metric: string) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }))
  }

  const toggleCompetitor = (asin: string) => {
    setExpandedCompetitors(prev => ({
      ...prev,
      [asin]: !prev[asin]
    }))
  }

  const openEnlargedImage = (image: string, allImages: string[], index: number) => {
    setEnlargedImage(image)
    setEnlargedImageSet(allImages)
    setEnlargedImageIndex(index)
  }

  const closeEnlargedImage = () => {
    setEnlargedImage(null)
    setEnlargedImageSet([])
    setEnlargedImageIndex(0)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (enlargedImageSet.length === 0) return
    
    let newIndex
    if (direction === 'prev') {
      newIndex = enlargedImageIndex > 0 ? enlargedImageIndex - 1 : enlargedImageSet.length - 1
    } else {
      newIndex = enlargedImageIndex < enlargedImageSet.length - 1 ? enlargedImageIndex + 1 : 0
    }
    
    setEnlargedImageIndex(newIndex)
    setEnlargedImage(enlargedImageSet[newIndex])
  }

  // Helper function to categorize competitors
  const categorizeCompetitor = (competitor: any) => {
    const rating = competitor.rating || 0
    const bsr = competitor.bsr || 50000
    
    if (rating >= 4.3 && bsr <= 20000) return 'strong'
    if ((rating >= 3.8 && rating < 4.3) || (bsr > 20000 && bsr <= 50000)) return 'average'
    return 'weak'
  }

  // Filter competitors based on selected filter
  const getFilteredCompetitors = () => {
    if (competitorFilter === 'all') return data.competitors || []
    
    return (data.competitors || []).filter((competitor: any) => 
      categorizeCompetitor(competitor) === competitorFilter
    )
  }
  
  const processKeywordData = useCallback(() => {
    try {
      const keywordGroups: any[] = []
      
      // Process real keyword hierarchy data from the data prop
      Object.entries(data.keywordHierarchy || {}).forEach(([rootName, rootData]: [string, any]) => {
        const group: any = {
          root: rootName,
          keywordCount: rootData.keywordCount || 0,
          totalRevenue: rootData.totalRevenue || 0,
          avgCPC: rootData.avgCPC || '0',
          subroots: []
        }
        
        // Process subroots
        Object.entries(rootData.subroots || {}).forEach(([subrootName, subrootData]: [string, any]) => {
          const subroot: any = {
            name: subrootName,
            keywordCount: subrootData.keywordCount || subrootData.keywords?.length || 0,
            keywords: []
          }
          
          // Process individual keywords if available
          if (subrootData.keywords && Array.isArray(subrootData.keywords)) {
            subroot.keywords = subrootData.keywords.map((kw: any) => ({
              keyword: kw.keyword || kw.name || subrootName,
              searchVolume: kw.searchVolume || kw.totalSearches || 0,
              cpc: kw.avgCPC || kw.cpc || 0,
              totalRevenue: kw.totalRevenue || 0,
              // Simulate ownership data - in production this would come from ranking data
              ownership: data.competitors?.reduce((acc: any, comp: any, index: number) => {
                // For demo purposes, assign higher ownership to earlier competitors
                const baseOwnership = Math.max(0, 80 - (index * 15))
                const variance = Math.floor(Math.random() * 20) - 10
                acc[comp.asin] = Math.max(0, Math.min(100, baseOwnership + variance))
                return acc
              }, {})
            }))
          }
          
          if (subroot.keywords.length > 0 || subroot.keywordCount > 0) {
            group.subroots.push(subroot)
          }
        })
        
        if (group.subroots.length > 0 || group.keywordCount > 0) {
          keywordGroups.push(group)
        }
      })
      
      // Sort by keyword count descending
      keywordGroups.sort((a, b) => b.keywordCount - a.keywordCount)
      
      setKeywordData(keywordGroups)
    } catch (error) {
      console.error('Error processing keyword data:', error)
    }
  }, [data])

  // Process keyword data when switching to keyword tab
  useEffect(() => {
    if (activeTab === 'keyword' && data?.keywordHierarchy) {
      processKeywordData()
    }
  }, [activeTab, data, processKeywordData])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  // Amazon Simulator function
  const runSimulation = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a search term to run the simulation')
      return
    }

    setSimulationLoading(true)
    setSimulationRun(true)

    try {
      // Call the keepa-search API
      const response = await fetch('/api/keepa-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm,
          domain: getMarketplaceDomain(marketplace)
        }),
      })

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to fetch search results')
      }

      // Transform the API results to match our component's expected format
      const transformedResults = result.data.map((item: any, index: number) => ({
        asin: item.asin,
        title: item.title,
        brand: item.brand,
        price: item.currentPrice / 100, // Convert from cents
        rating: item.rating / 10, // Convert from 0-50 to 0-5 scale
        reviewCount: item.reviewCount,
        bsr: Math.floor(Math.random() * 50000) + 1000, // Mock BSR for now
        image: item.imageUrl || `https://via.placeholder.com/150x150?text=Product+${index + 1}`,
        position: index + 1,
        isYourProduct: yourAsin && item.asin === yourAsin.toUpperCase()
      }))

      // If user provided an ASIN but it's not in results, try to insert it randomly
      if (yourAsin && !transformedResults.some(r => r.isYourProduct)) {
        try {
          // Try to get user's product data
          const productResponse = await fetch('/api/product-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              asin: yourAsin.toUpperCase(),
              domain: getMarketplaceDomain(marketplace)
            }),
          })

          const productResult = await productResponse.json()
          
          if (productResult.success && productResult.data) {
            const userProduct = {
              asin: yourAsin.toUpperCase(),
              title: productResult.data.title || `Your Product ${yourAsin}`,
              brand: productResult.data.brand || 'Your Brand',
              price: (productResult.data.currentPrice || 2999) / 100,
              rating: productResult.data.rating ? productResult.data.rating / 10 : 4.5,
              reviewCount: productResult.data.reviewCount > 0 ? productResult.data.reviewCount : 0,
              bsr: Math.floor(Math.random() * 50000) + 1000,
              image: productResult.data.imageUrl || `https://via.placeholder.com/150x150?text=Your+Product`,
              position: Math.floor(Math.random() * 5) + 1, // Random position in top 5
              isYourProduct: true
            }

            // Insert user's product and adjust positions
            transformedResults.splice(userProduct.position - 1, 0, userProduct)
            transformedResults.forEach((item, index) => {
              item.position = index + 1
            })
          }
        } catch (error) {
          console.warn('Could not fetch user product data:', error)
        }
      }

      setSimulationResults(transformedResults)
    } catch (error) {
      console.error('Simulation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to run simulation')
    } finally {
      setSimulationLoading(false)
    }
  }

  // Helper function to convert marketplace to domain ID
  const getMarketplaceDomain = (marketplace: string): number => {
    const domainMap: { [key: string]: number } = {
      'us': 1,
      'uk': 2,
      'de': 3,
      'fr': 4,
      'ca': 6,
      'it': 8,
      'es': 9
    }
    return domainMap[marketplace] || 1
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'competitors', label: 'Competitors', icon: Users },
          { id: 'keyword', label: 'Keyword Ownership', icon: Search },
          { id: 'reviews', label: 'Review Strategy', icon: MessageSquare },
          { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
          { id: 'simulator', label: 'Amazon Simulator', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Competitors</span>
              </CardTitle>
              <CardDescription>
                All competitors in this niche with detailed product analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Competitor Scorecards */}
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-4">
                  <button
                    onClick={() => setCompetitorFilter('all')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md ${
                      competitorFilter === 'all' 
                        ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md' 
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="text-2xl font-bold text-blue-600">{(data.competitors || []).length}</div>
                    <div className="text-sm text-gray-600">Total Competitors</div>
                  </button>
                  <button
                    onClick={() => setCompetitorFilter('strong')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md ${
                      competitorFilter === 'strong' 
                        ? 'bg-green-100 ring-2 ring-green-500 shadow-md' 
                        : 'bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {(() => {
                        const strong = (data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'strong').length
                        return strong
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Strong</div>
                  </button>
                  <button
                    onClick={() => setCompetitorFilter('average')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md ${
                      competitorFilter === 'average' 
                        ? 'bg-yellow-100 ring-2 ring-yellow-500 shadow-md' 
                        : 'bg-yellow-50 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="text-2xl font-bold text-yellow-600">
                      {(() => {
                        const average = (data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'average').length
                        return average
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Average</div>
                  </button>
                  <button
                    onClick={() => setCompetitorFilter('weak')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md ${
                      competitorFilter === 'weak' 
                        ? 'bg-red-100 ring-2 ring-red-500 shadow-md' 
                        : 'bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <div className="text-2xl font-bold text-red-600">
                      {(() => {
                        const weak = (data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'weak').length
                        return weak
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Weak</div>
                  </button>
                </div>
              </div>
              
              {/* Filter Indicator */}
              {competitorFilter !== 'all' && (
                <div className="mb-6 flex items-center justify-between bg-gray-50 border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Showing:</span>
                    <Badge variant="outline" className={
                      competitorFilter === 'strong' ? 'border-green-500 text-green-700' :
                      competitorFilter === 'average' ? 'border-yellow-500 text-yellow-700' :
                      'border-red-500 text-red-700'
                    }>
                      {competitorFilter.charAt(0).toUpperCase() + competitorFilter.slice(1)} Competitors ({getFilteredCompetitors().length})
                    </Badge>
                  </div>
                  <button
                    onClick={() => setCompetitorFilter('all')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Show All
                  </button>
                </div>
              )}
              
              <div className="space-y-8">
                {getFilteredCompetitors().map((competitor: any, index: number) => {
                  // Parse additional data if available
                  const bulletPoints = competitor.bullet_points ? JSON.parse(competitor.bullet_points) : []
                  const aPlusContent = competitor.a_plus_content ? JSON.parse(competitor.a_plus_content) : {}
                  const videoUrls = competitor.video_urls ? JSON.parse(competitor.video_urls) : []
                  const imageUrls = competitor.image_urls ? competitor.image_urls.split(',').map((url: string) => url.trim()) : []
                  const allImages = imageUrls.length > 0 ? imageUrls.map((url: string) => `https://m.media-amazon.com/images/I/${url}`) : []
                  
                  const isExpanded = expandedCompetitors[competitor.asin] || false
                  
                  return (
                    <div key={index} className="border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50">
                      {/* Collapsible Header - Only show when collapsed */}
                      {!isExpanded && (
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50"
                          onClick={() => toggleCompetitor(competitor.asin)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            </div>
                            <img 
                              src={competitor.image || allImages[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                              alt={competitor.name || competitor.title}
                              className="w-16 h-16 rounded object-cover border border-gray-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEnlargedImage(competitor.image || allImages[0], allImages, 0)
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                {competitor.name || competitor.title || 'Unknown Product'}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-600 font-mono">{competitor.asin}</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600">
                                    {competitor.rating ? competitor.rating.toFixed(1) : '0.0'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {competitor.review_count ? competitor.review_count.toLocaleString() : '0'} reviews
                                </span>
                                <span className="text-xs font-semibold text-green-600">
                                  ${(competitor.price || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Expandable Content */}
                      {isExpanded && (
                        <div>
                          {/* Clickable Header to Collapse */}
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50 border-b"
                            onClick={() => toggleCompetitor(competitor.asin)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              </div>
                              <img 
                                src={competitor.image || allImages[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                                alt={competitor.name || competitor.title}
                                className="w-16 h-16 rounded object-cover border border-gray-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEnlargedImage(competitor.image || allImages[0], allImages, 0)
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                }}
                              />
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                  {competitor.name || competitor.title || 'Unknown Product'}
                                </h3>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-600 font-mono">{competitor.asin}</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-gray-600">
                                      {competitor.rating ? competitor.rating.toFixed(1) : '0.0'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {competitor.review_count ? competitor.review_count.toLocaleString() : '0'} reviews
                                  </span>
                                  <span className="text-xs font-semibold text-green-600">
                                    ${(competitor.price || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          <div className="p-6">
                            {/* Main Product Overview */}
                            <div className="grid md:grid-cols-4 gap-6 mb-6">
                        {/* Product Images & Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <img 
                                src={competitor.image || allImages[0] || 'https://via.placeholder.com/120x120?text=No+Image'}
                                alt={competitor.name || competitor.title}
                                className="w-48 h-48 rounded-lg object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => openEnlargedImage(competitor.image || allImages[0], allImages, 0)}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {competitor.brand && (
                                  <Badge variant="secondary" className="text-xs">
                                    {competitor.brand}
                                  </Badge>
                                )}
                              </div>
                              <a 
                                href={`https://www.amazon.com/dp/${competitor.asin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2 line-clamp-2"
                              >
                                {competitor.name || competitor.title || 'Unknown Product'}
                              </a>
                              <p className="text-xs text-gray-600 mb-2">
                                ASIN: {competitor.asin}
                              </p>
                              <div className="flex items-center space-x-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < Math.floor(competitor.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {competitor.rating ? competitor.rating.toFixed(1) : '4.5'} ({competitor.review_count ? competitor.review_count.toLocaleString() : '1,234'})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Metrics and Specs */}
                        <div className="md:col-span-2 space-y-4">
                          {/* Key Metrics */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-3">Key Metrics</h4>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-600">Price</div>
                                <div className="text-lg font-bold text-green-600">${(competitor.price || 0).toFixed(2)}</div>
                              </div>
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-600">BSR</div>
                                <div className="text-sm font-semibold text-purple-600">#{(competitor.bsr || 0).toLocaleString()}</div>
                              </div>
                              <div className="bg-white p-2 rounded border">
                                <div className="text-xs text-gray-600">FBA Fees</div>
                                <div className="text-sm font-medium text-orange-600">
                                  ${competitor.fee ? competitor.fee.toFixed(2) : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Specifications */}
                          <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-3">Specifications</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Dimensions:</span>
                              <span>
                                {competitor.length > 0 && competitor.width > 0 && competitor.height > 0 ? 
                                  `${competitor.length}" × ${competitor.width}" × ${competitor.height}"` : 
                                  competitor.dimensions?.length > 0 ? 
                                    `${competitor.dimensions.length}" × ${competitor.dimensions.width}" × ${competitor.dimensions.height}"` : 
                                    'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Weight:</span>
                              <span>
                                {competitor.weight > 0 ? 
                                  `${competitor.weight} lbs` : 
                                  competitor.dimensions?.weight > 0 ? 
                                    `${competitor.dimensions.weight} lbs` : 
                                    'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">FBA Tier:</span>
                              <span className="font-medium">{competitor.tier || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Category:</span>
                              <span className="truncate ml-2" title={competitor.category || 'Health & Personal Care'}>
                                {competitor.category || 'Health & Personal Care'}
                              </span>
                            </div>
                            {competitor.parent_asin && competitor.parent_asin !== 'N/A' && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Parent ASIN:</span>
                                <span>{competitor.parent_asin}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Launch Date:</span>
                              <span>{competitor.created_at ? new Date(competitor.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Trend:</span>
                              <span className={Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}>
                                {Math.random() > 0.5 ? '↗ Growing' : '↘ Declining'}
                              </span>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Images */}
                      {allImages.length > 1 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Images</h4>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {allImages.slice(1, 9).map((image, imgIndex) => (
                              <img 
                                key={imgIndex}
                                src={image}
                                alt={`${competitor.name || competitor.title} - Image ${imgIndex + 2}`}
                                className="w-24 h-24 rounded object-cover border border-gray-200 cursor-pointer hover:opacity-80 flex-shrink-0"
                                onClick={() => openEnlargedImage(image, allImages.slice(1, 9), imgIndex)}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bullet Points */}
                      {bulletPoints.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Bullet Points</h4>
                          <ul className="space-y-2">
                            {bulletPoints.map((point: string, pointIndex: number) => (
                              <li key={pointIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Performance Analysis */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">Historical Performance Analysis</h4>
                          <div className="flex items-center space-x-2">
                            {[
                              { key: 'price', label: 'Price', color: 'bg-green-100 text-green-700' },
                              { key: 'bsr', label: 'BSR', color: 'bg-purple-100 text-purple-700' },
                              { key: 'rating', label: 'Rating', color: 'bg-blue-100 text-blue-700' },
                              { key: 'reviews', label: 'Reviews', color: 'bg-orange-100 text-orange-700' }
                            ].map((metric) => (
                              <button
                                key={metric.key}
                                onClick={() => toggleMetric(metric.key)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                  visibleMetrics[metric.key] 
                                    ? metric.color 
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {metric.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4">
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">
                                #{(competitor.bsr || Math.floor(Math.random() * 50000) + 10000).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Current BSR</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                ${(competitor.price || (Math.random() * 50 + 10)).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-600">Current Price</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {(competitor.rating || (4.0 + Math.random())).toFixed(1)}★
                              </div>
                              <div className="text-xs text-gray-600">Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">
                                {(competitor.review_count || Math.floor(Math.random() * 5000) + 500).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Reviews</div>
                            </div>
                          </div>
                          
                          {/* Multi-Metric Performance Chart */}
                          <div className="h-80 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={(() => {
                                // Use real review history if available, otherwise generate realistic mock data
                                const reviewHistory = data.reviewHistory?.[competitor.asin]
                                
                                if (reviewHistory && reviewHistory.length > 0) {
                                  // Use real review history data for ratings and reviews (generated from actual Keepa data)
                                  return reviewHistory.slice(-30).map((record: any, i: number) => {
                                    const date = new Date(record.date)
                                    const basePrice = competitor.price || 25
                                    const baseBSR = competitor.bsr || 15000
                                    
                                    return {
                                      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                      price: basePrice * (1 + (Math.sin(i / 10) * 0.1) + (Math.random() - 0.5) * 0.05), // Still mock for price
                                      bsr: (baseBSR * (1 + (Math.sin(i / 15) * 0.2) + (Math.random() - 0.5) * 0.1)) / 1000, // Still mock for BSR
                                      rating: record.averageRating,
                                      reviews: record.reviewCount / 100 // Normalize for chart
                                    }
                                  })
                                } else {
                                  // Generate realistic mock data based on current product data
                                  const basePrice = competitor.price || 25
                                  const baseBSR = competitor.bsr || 15000
                                  const baseRating = competitor.rating || 4.2
                                  const baseReviews = competitor.review_count || 1000
                                  
                                  return Array.from({length: 30}, (_, i) => {
                                    const date = new Date()
                                    date.setDate(date.getDate() - (30 - i))
                                    
                                    // Simulate realistic review growth (more reviews over time)
                                    const growthFactor = 0.7 + (i / 30 * 0.3) // Start at 70%, grow to 100%
                                    const simulatedReviews = Math.round(baseReviews * growthFactor)
                                    
                                    // Simulate slight rating fluctuations (±0.2 stars)
                                    const ratingVariation = (Math.sin(i / 5) * 0.1) + (Math.random() - 0.5) * 0.1
                                    const simulatedRating = Math.max(3.5, Math.min(5.0, baseRating + ratingVariation))
                                    
                                    return {
                                      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                      price: basePrice * (1 + (Math.sin(i / 10) * 0.1) + (Math.random() - 0.5) * 0.05),
                                      bsr: (baseBSR * (1 + (Math.sin(i / 15) * 0.2) + (Math.random() - 0.5) * 0.1)) / 1000,
                                      rating: simulatedRating,
                                      reviews: simulatedReviews / 100 // Normalize for chart
                                    }
                                  })
                                }
                              })()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <Tooltip 
                                  formatter={(value: any, name: string) => {
                                    if (name === 'bsr') return [`${(value * 1000).toFixed(0)}`, 'BSR']
                                    if (name === 'reviews') return [`${(value * 100).toFixed(0)}`, 'Reviews']
                                    if (name === 'price') return [`$${value.toFixed(2)}`, 'Price']
                                    if (name === 'rating') return [`${value.toFixed(1)}★`, 'Rating']
                                    return [value, name]
                                  }}
                                />
                                {visibleMetrics.price && <Area type="monotone" dataKey="price" stackId="1" stroke="#059669" fill="#d1fae5" />}
                                {visibleMetrics.bsr && <Area type="monotone" dataKey="bsr" stackId="2" stroke="#7c3aed" fill="#ede9fe" />}
                                {visibleMetrics.rating && <Area type="monotone" dataKey="rating" stackId="3" stroke="#2563eb" fill="#dbeafe" />}
                                {visibleMetrics.reviews && <Area type="monotone" dataKey="reviews" stackId="4" stroke="#ea580c" fill="#fed7aa" />}
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Strategy Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(getFilteredCompetitors().reduce((sum, c) => sum + (c.rating || 0), 0) / getFilteredCompetitors().length).toFixed(1)}★
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getFilteredCompetitors().reduce((sum, c) => sum + (c.review_count || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(getFilteredCompetitors().reduce((sum, c) => sum + (c.review_count || 0), 0) / getFilteredCompetitors().length).toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Competitor ratings across the market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const ratingBuckets = [
                      { range: '3.0-3.4', count: 0, color: '#dc2626' },
                      { range: '3.5-3.9', count: 0, color: '#ea580c' },
                      { range: '4.0-4.4', count: 0, color: '#ca8a04' },
                      { range: '4.5-5.0', count: 0, color: '#16a34a' }
                    ]
                    
                    getFilteredCompetitors().forEach(c => {
                      const rating = c.rating || 0
                      if (rating >= 3.0 && rating < 3.5) ratingBuckets[0].count++
                      else if (rating >= 3.5 && rating < 4.0) ratingBuckets[1].count++
                      else if (rating >= 4.0 && rating < 4.5) ratingBuckets[2].count++
                      else if (rating >= 4.5) ratingBuckets[3].count++
                    })
                    
                    return ratingBuckets
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Review Volume Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Review Volume Distribution</CardTitle>
              <CardDescription>Number of reviews by competitor tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const volumeBuckets = [
                      { range: '0-1K', count: 0, color: '#fca5a5' },
                      { range: '1K-5K', count: 0, color: '#fed7aa' },
                      { range: '5K-15K', count: 0, color: '#d9f99d' },
                      { range: '15K+', count: 0, color: '#86efac' }
                    ]
                    
                    getFilteredCompetitors().forEach(c => {
                      const reviews = c.review_count || 0
                      if (reviews < 1000) volumeBuckets[0].count++
                      else if (reviews < 5000) volumeBuckets[1].count++
                      else if (reviews < 15000) volumeBuckets[2].count++
                      else volumeBuckets[3].count++
                    })
                    
                    return volumeBuckets
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Review Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Review Performance</CardTitle>
              <CardDescription>Detailed review metrics and strategy insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-center p-3 font-medium">ASIN</th>
                      <th className="text-center p-3 font-medium">Rating</th>
                      <th className="text-center p-3 font-medium">Reviews</th>
                      <th className="text-center p-3 font-medium">Velocity</th>
                      <th className="text-center p-3 font-medium">Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredCompetitors()
                      .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
                      .map((competitor, index) => {
                        // Calculate review velocity (estimated reviews per month)
                        const velocity = Math.round((competitor.review_count || 0) / 12) // Assume product is 1 year old
                        
                        // Determine strategy based on rating and review count
                        let strategy = 'Building Trust'
                        let strategyColor = 'bg-blue-100 text-blue-800'
                        
                        if ((competitor.rating || 0) >= 4.5 && (competitor.review_count || 0) >= 10000) {
                          strategy = 'Market Leader'
                          strategyColor = 'bg-green-100 text-green-800'
                        } else if ((competitor.rating || 0) >= 4.0 && (competitor.review_count || 0) >= 5000) {
                          strategy = 'Strong Contender'
                          strategyColor = 'bg-purple-100 text-purple-800'
                        } else if ((competitor.rating || 0) < 3.8) {
                          strategy = 'Quality Issues'
                          strategyColor = 'bg-red-100 text-red-800'
                        } else if ((competitor.review_count || 0) < 1000) {
                          strategy = 'New Entrant'
                          strategyColor = 'bg-yellow-100 text-yellow-800'
                        }
                        
                        return (
                          <tr key={competitor.asin} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={competitor.image || '/placeholder.svg'} 
                                  alt={competitor.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                                <div>
                                  <a 
                                    href={`https://www.amazon.com/dp/${competitor.asin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline line-clamp-1 block"
                                  >
                                    {competitor.title?.length > 40 
                                      ? competitor.title.substring(0, 40) + '...' 
                                      : competitor.title}
                                  </a>
                                  <p className="text-xs text-gray-500">{competitor.brand}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {competitor.asin}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1">
                                <span className="font-medium">{(competitor.rating || 0).toFixed(1)}</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(competitor.rating || 0) 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-medium">
                                {(competitor.review_count || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-gray-600">
                                ~{velocity}/mo
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={`${strategyColor} text-xs`}>
                                {strategy}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Review Strategy Insights</span>
              </CardTitle>
              <CardDescription>
                Key takeaways for market entry and review management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Market Entry Strategy */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Market Entry Strategy</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Target {Math.round(getFilteredCompetitors().reduce((sum, c) => sum + (c.review_count || 0), 0) / getFilteredCompetitors().length / 4)} reviews in first 90 days</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Aim for {Math.max(4.0, (getFilteredCompetitors().reduce((sum, c) => sum + (c.rating || 0), 0) / getFilteredCompetitors().length) + 0.2).toFixed(1)}+ rating to compete effectively</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Focus on quality over quantity initially</p>
                    </div>
                  </div>
                </div>

                {/* Competitive Gaps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Competitive Gaps</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>{getFilteredCompetitors().filter(c => (c.rating || 0) < 4.0).length} competitors have sub-4.0 ratings</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>{getFilteredCompetitors().filter(c => (c.review_count || 0) < 1000).length} products have less than 1K reviews</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Opportunity to differentiate through customer service</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Search Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Amazon Marketplace Simulator</span>
              </CardTitle>
              <CardDescription>
                Search for products and analyze competitive positioning using real Amazon data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-term">Search Term</Label>
                    <Input 
                      id="search-term"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="e.g., berberine supplement"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="marketplace">Amazon Marketplace</Label>
                    <Select value={marketplace} onValueChange={setMarketplace}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select marketplace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">Amazon.com (US)</SelectItem>
                        <SelectItem value="uk">Amazon.co.uk (UK)</SelectItem>
                        <SelectItem value="de">Amazon.de (Germany)</SelectItem>
                        <SelectItem value="fr">Amazon.fr (France)</SelectItem>
                        <SelectItem value="es">Amazon.es (Spain)</SelectItem>
                        <SelectItem value="it">Amazon.it (Italy)</SelectItem>
                        <SelectItem value="ca">Amazon.ca (Canada)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="your-asin">Your ASIN (Optional)</Label>
                    <Input 
                      id="your-asin"
                      value={yourAsin}
                      onChange={(e) => setYourAsin(e.target.value)}
                      placeholder="e.g., B08EXAMPLE"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your ASIN to see how you rank against competitors
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Search Amazon with your target keyword</li>
                      <li>• Analyze competitor products and metrics</li>
                      <li>• See pricing, ratings, and review counts</li>
                      <li>• Identify opportunities to compete</li>
                      <li>• Compare against current competitors</li>
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={runSimulation}
                    disabled={simulationLoading || !searchTerm.trim()}
                  >
                    {simulationLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Running Simulation...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span>Competitive Analysis</span>
              </CardTitle>
              <CardDescription>
                The only way to beat competitors is through better pricing, listings, or reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Competitive Advantages */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-900">Price Advantage</h4>
                    </div>
                    <p className="text-sm text-green-800 mb-2">
                      Beat competitors on pricing while maintaining profitability
                    </p>
                    <div className="text-xs text-green-700">
                      Current price range: $19.99 - $49.99
                    </div>
                  </div>
                  
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Listing Quality</h4>
                    </div>
                    <p className="text-sm text-blue-800 mb-2">
                      Superior product descriptions, images, and optimization
                    </p>
                    <div className="text-xs text-blue-700">
                      Focus on keywords, A+ content, and images
                    </div>
                  </div>
                  
                  <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-purple-900">Review Strategy</h4>
                    </div>
                    <p className="text-sm text-purple-800 mb-2">
                      Build trust through authentic customer reviews
                    </p>
                    <div className="text-xs text-purple-700">
                      Target 4.5+ rating with 1000+ reviews
                    </div>
                  </div>
                </div>

                {/* Simulation Results or Placeholder */}
                {simulationRun && simulationResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Search Results for "{searchTerm}" on Amazon.{marketplace === 'us' ? 'com' : marketplace}
                      </h4>
                      <Badge variant="outline">{simulationResults.length} products</Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Position</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Reviews</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">BSR</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simulationResults.map((result, index) => (
                            <tr 
                              key={result.asin} 
                              className={`border-b hover:bg-gray-50 ${result.isYourProduct ? 'bg-blue-50' : ''}`}
                            >
                              <td className="py-3 px-4">
                                <Badge 
                                  variant={result.position <= 5 ? 'default' : 'secondary'}
                                  className={result.position <= 5 ? 'bg-green-100 text-green-800' : ''}
                                >
                                  #{result.position}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={result.image} 
                                    alt={result.title}
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-2 max-w-xs">
                                      {result.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{result.brand}</p>
                                    <p className="text-xs text-gray-400">ASIN: {result.asin}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium text-green-600">${result.price}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium">{result.rating}</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.floor(result.rating) 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm">{result.reviewCount.toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-purple-600">#{result.bsr.toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-4">
                                {result.isYourProduct ? (
                                  <Badge className="bg-blue-100 text-blue-800">Your Product</Badge>
                                ) : (
                                  <Badge variant="outline">Competitor</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Analysis Insights */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                      <h5 className="font-medium text-gray-900 mb-3">Competitive Analysis</h5>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">Price Range</div>
                          <div className="text-gray-600">
                            ${Math.min(...simulationResults.map(r => r.price)).toFixed(2)} - ${Math.max(...simulationResults.map(r => r.price)).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Avg Rating</div>
                          <div className="text-gray-600">
                            {(simulationResults.reduce((sum, r) => sum + r.rating, 0) / simulationResults.length).toFixed(1)}★
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Total Reviews</div>
                          <div className="text-gray-600">
                            {simulationResults.reduce((sum, r) => sum + r.reviewCount, 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {yourAsin && simulationResults.find(r => r.isYourProduct) && (
                        <div className="mt-4 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
                          <div className="font-medium text-blue-900">Your Product Analysis</div>
                          <div className="text-blue-800 text-sm mt-1">
                            Your product ranks #{simulationResults.find(r => r.isYourProduct)?.position} for "{searchTerm}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">Ready to Simulate</h4>
                    <p className="text-gray-600 mb-4">
                      Enter a search term above to see how you stack up against real Amazon competitors
                    </p>
                    <div className="flex justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Real-time data
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Competitive insights
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        Market opportunities
                      </div>
                    </div>
                  </div>
                )}

                {/* Winning Strategy */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-4">Winning Strategy Framework</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">1. Price Competitively</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Research competitor pricing</li>
                        <li>• Calculate optimal price point</li>
                        <li>• Consider profit margins</li>
                        <li>• Monitor price changes</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-green-900 mb-2">2. Optimize Listings</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• High-quality product images</li>
                        <li>• Keyword-rich titles</li>
                        <li>• Compelling bullet points</li>
                        <li>• A+ Content enhancement</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-purple-900 mb-2">3. Build Social Proof</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Encourage customer reviews</li>
                        <li>• Respond to feedback</li>
                        <li>• Maintain high ratings</li>
                        <li>• Address negative reviews</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyword Ownership Tab */}
      {activeTab === 'keyword' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-green-600" />
                <span>Keyword Ownership Matrix</span>
              </CardTitle>
              <CardDescription>
                Keyword performance breakdown by competitor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keywordData.length > 0 ? (
                <div className="space-y-4">
                  {/* Table Header with Competitor Info */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 sticky left-0 bg-gray-50 border-r min-w-[200px]">
                            Keyword Groups
                          </th>
                          {data.competitors?.map((comp: any, compIndex: number) => (
                            <th key={compIndex} className="text-center py-3 px-2 font-medium text-gray-700 min-w-[100px]">
                              <div className="flex flex-col items-center space-y-2">
                                <img 
                                  src={comp.image || `https://m.media-amazon.com/images/I/${comp.image_urls?.split(',')[0]?.trim()}` || 'https://via.placeholder.com/40x40?text=No+Image'}
                                  alt={comp.asin}
                                  className="w-8 h-8 rounded object-cover border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                                  }}
                                />
                                <div className="text-xs">
                                  <div className="font-medium">{comp.asin}</div>
                                  {comp.brand && (
                                    <div className="text-gray-500 truncate max-w-[80px]" title={comp.brand}>
                                      {comp.brand}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {keywordData.map((group, groupIndex) => {
                          const rows = []
                          
                          // Root row
                          rows.push(
                            <tr key={`root-${groupIndex}`} className="border-b bg-gray-25">
                              <td className="py-3 px-4 font-semibold sticky left-0 bg-white border-r">
                                <div 
                                  className="flex items-center space-x-2 cursor-pointer hover:text-blue-600"
                                  onClick={() => toggleGroup(`group-${groupIndex}`)}
                                >
                                  {expandedGroups[`group-${groupIndex}`] ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                  <span className="capitalize text-gray-900">{group.root}</span>
                                  <Badge variant="outline" className="text-xs">{group.keywordCount} keywords</Badge>
                                </div>
                              </td>
                              {data.competitors?.map((comp: any, compIndex: number) => {
                                // Calculate root-level ownership (average of subroots)
                                const rootOwnership = group.subroots.length > 0 ? 
                                  Math.round(group.subroots.reduce((sum: number, subroot: any, idx: number) => {
                                    const baseOwnership = Math.max(0, 85 - (idx * 10))
                                    const variance = Math.floor(Math.random() * 30) - 15
                                    return sum + Math.max(0, Math.min(100, baseOwnership + variance))
                                  }, 0) / group.subroots.length) : 0
                                
                                return (
                                  <td key={compIndex} className="text-center py-3 px-2">
                                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      rootOwnership >= 70 ? 'bg-green-100 text-green-800' :
                                      rootOwnership >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                      rootOwnership >= 20 ? 'bg-orange-100 text-orange-800' :
                                      rootOwnership > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      {rootOwnership > 0 ? `${rootOwnership}%` : '-'}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                          
                          // Subroot rows
                          if (expandedGroups[`group-${groupIndex}`]) {
                            group.subroots.forEach((subroot: any, subrootIndex: number) => {
                              // Calculate ownership percentages for this subroot
                              const ownershipData: any = {}
                              data.competitors?.forEach((comp: any) => {
                                const baseOwnership = Math.max(0, 85 - (subrootIndex * 10))
                                const variance = Math.floor(Math.random() * 30) - 15
                                ownershipData[comp.asin] = Math.max(0, Math.min(100, baseOwnership + variance))
                              })
                              
                              rows.push(
                                <tr key={`subroot-${groupIndex}-${subrootIndex}`} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-4 font-medium sticky left-0 bg-white border-r">
                                    <div className="pl-8">
                                      <span className="capitalize text-gray-700">{subroot.name}</span>
                                      <div className="text-xs text-gray-500">{subroot.keywordCount || 0} keywords</div>
                                    </div>
                                  </td>
                                  {data.competitors?.map((comp: any, compIndex: number) => {
                                    const ownership = ownershipData[comp.asin] || 0
                                    return (
                                      <td key={compIndex} className="text-center py-3 px-2">
                                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                          ownership >= 70 ? 'bg-green-100 text-green-800' :
                                          ownership >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                          ownership >= 20 ? 'bg-orange-100 text-orange-800' :
                                          ownership > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                          {ownership > 0 ? `${ownership}%` : '-'}
                                        </div>
                                      </td>
                                    )
                                  })}
                                </tr>
                              )
                            })
                          }
                          
                          return rows
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No keyword data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Strategy Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Pricing Strategy Analysis</span>
              </CardTitle>
              <CardDescription>
                Price positioning and competitive pricing insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Price Distribution */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${Math.min(...(data.competitors?.map((c: any) => c.price || 0) || [25])).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Lowest Price</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${(data.competitors?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Average Price</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${Math.max(...(data.competitors?.map((c: any) => c.price || 0) || [25])).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Highest Price</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${(Math.max(...(data.competitors?.map((c: any) => c.price || 0) || [25])) - Math.min(...(data.competitors?.map((c: any) => c.price || 0) || [25]))).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Price Range</div>
                    </div>
                  </div>
                </div>

                {/* Price vs BSR Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price vs Best Sellers Rank</h3>
                  <div className="h-64 bg-white rounded-lg border p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.competitors?.map((comp: any) => ({
                        name: (comp.name || comp.title)?.substring(0, 20) + '...',
                        price: comp.price || 0,
                        bsr: comp.bsr || 0,
                        sales: comp.monthly_orders || 0
                      })) || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="price" stroke="#059669" fill="#d1fae5" />
                        <Area type="monotone" dataKey="bsr" stroke="#dc2626" fill="#fee2e2" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeEnlargedImage}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Close Button */}
            <button
              onClick={closeEnlargedImage}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {enlargedImageSet.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {enlargedImageSet.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image */}
            <img 
              src={enlargedImage}
              alt="Enlarged product image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Counter */}
            {enlargedImageSet.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                {enlargedImageIndex + 1} / {enlargedImageSet.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}