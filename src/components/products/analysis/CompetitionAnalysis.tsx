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
  ShoppingCart,
  Package,
  Ruler
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
  
  const categorizeCompetitor = (competitor: any) => {
    const score = calculateCompetitorScore(competitor)
    if (score >= 80) return 'strong'
    if (score >= 60) return 'average'
    return 'weak'
  }
  
  const calculateCompetitorScore = (competitor: any) => {
    let score = 0
    
    // Rating score (0-25 points)
    const rating = competitor.rating || 0
    score += (rating / 5) * 25
    
    // Review count score (0-25 points)
    const reviews = competitor.review_count || 0
    if (reviews >= 1000) score += 25
    else if (reviews >= 500) score += 20
    else if (reviews >= 100) score += 10
    else score += 5
    
    // BSR score (0-20 points)
    const bsr = competitor.bsr || 999999
    if (bsr <= 1000) score += 20
    else if (bsr <= 5000) score += 15
    else if (bsr <= 10000) score += 10
    else if (bsr <= 50000) score += 5
    
    // Price competitiveness (0-15 points)
    const avgPrice = data.competitors?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)
    const priceDiff = Math.abs((competitor.price || 0) - avgPrice) / avgPrice
    if (priceDiff <= 0.1) score += 15
    else if (priceDiff <= 0.2) score += 10
    else if (priceDiff <= 0.3) score += 5
    else score += 2
    
    // Keyword ownership score (0-15 points) - calculated from keyword data
    const keywordOwnership = calculateAverageKeywordOwnership(competitor.asin)
    score += (keywordOwnership / 100) * 15
    
    return Math.round(score)
  }
  
  const calculateAverageKeywordOwnership = (asin: string) => {
    if (!keywordData || keywordData.length === 0) return 0
    
    let totalOwnership = 0
    let keywordCount = 0
    
    keywordData.forEach(group => {
      group.subroots?.forEach((subroot: any) => {
        subroot.keywords?.forEach((kw: any) => {
          if (kw.ownership && kw.ownership[asin]) {
            totalOwnership += kw.ownership[asin]
            keywordCount++
          }
        })
      })
    })
    
    return keywordCount > 0 ? totalOwnership / keywordCount : 0
  }
  
  const getFilteredCompetitors = () => {
    if (competitorFilter === 'all') return data.competitors || []
    
    return (data.competitors || []).filter((competitor: any) => 
      categorizeCompetitor(competitor) === competitorFilter
    )
  }
  
  const generateHistoricalData = (competitor: any) => {
    // Generate mock historical data for the chart
    const days = 30
    const basePrice = competitor.price || 25
    const baseBSR = competitor.bsr || 5000
    const baseRating = competitor.rating || 4.5
    const baseReviews = competitor.review_count || 1000
    
    return Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      price: basePrice + (Math.random() - 0.5) * 5,
      bsr: baseBSR / 1000 + (Math.random() - 0.5) * 2,
      rating: Math.max(3.5, Math.min(5, baseRating + (Math.random() - 0.5) * 0.3)),
      reviews: baseReviews / 100 + (Math.random() - 0.5) * 5
    }))
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
              // Simulate ownership data
              ownership: data.competitors?.reduce((acc: any, comp: any, index: number) => {
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
  
  // Process keyword data when component mounts or data changes
  useEffect(() => {
    if (data?.keywordHierarchy) {
      processKeywordData()
    }
  }, [data, processKeywordData])
  
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }
  
  const generatePriceDistribution = (competitors: any[]) => {
    const ranges = [
      { range: '$0-20', min: 0, max: 20, count: 0 },
      { range: '$20-30', min: 20, max: 30, count: 0 },
      { range: '$30-40', min: 30, max: 40, count: 0 },
      { range: '$40-50', min: 40, max: 50, count: 0 },
      { range: '$50+', min: 50, max: Infinity, count: 0 }
    ]
    
    competitors?.forEach(comp => {
      const price = comp.price || 0
      const range = ranges.find(r => price >= r.min && price < r.max)
      if (range) range.count++
    })
    
    return ranges
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
      // Simulate search results using existing competitor data
      const results = (data.competitors || []).map((comp: any, index: number) => ({
        position: index + 1,
        asin: comp.asin,
        title: comp.title || comp.name,
        price: comp.price || 29.99,
        rating: comp.rating || 4.2,
        reviews: comp.review_count || 1000,
        bsr: comp.bsr || Math.floor(Math.random() * 10000) + 1000,
        image: comp.image || 'https://via.placeholder.com/150x150?text=Product',
        isYourProduct: yourAsin && comp.asin === yourAsin
      }))
      
      // If user provided their ASIN and it's not in the results, add it
      if (yourAsin && !results.some((r: any) => r.asin === yourAsin)) {
        results.push({
          position: results.length + 1,
          asin: yourAsin,
          title: `Your Product ${yourAsin}`,
          price: 35.99,
          rating: 4.5,
          reviews: 250,
          bsr: 8500,
          image: 'https://via.placeholder.com/150x150?text=Your+Product',
          isYourProduct: true
        })
      }
      
      // Sort by a relevance score (combine rating and reviews)
      results.sort((a: any, b: any) => {
        const scoreA = (a.rating * 20) + (Math.log10(a.reviews + 1) * 10)
        const scoreB = (b.rating * 20) + (Math.log10(b.reviews + 1) * 10)
        return scoreB - scoreA
      })
      
      // Update positions after sorting
      results.forEach((result: any, index: number) => {
        result.position = index + 1
      })
      
      setSimulationResults(results.slice(0, 20)) // Show top 20 results
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Failed to run simulation')
    } finally {
      setSimulationLoading(false)
    }
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
                      {(data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'strong').length}
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
                      {(data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'average').length}
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
                      {(data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'weak').length}
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
                  const isExpanded = expandedCompetitors[competitor.asin] || false
                  const imageUrls = competitor.image_urls ? competitor.image_urls.split(',').map((url: string) => url.trim()) : []
                  const allImages = imageUrls.length > 0 ? imageUrls.map((url: string) => `https://m.media-amazon.com/images/I/${url}`) : []
                  
                  return (
                    <div key={index} className="border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50">
                      {/* Collapsible Header */}
                      {!isExpanded && (
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50"
                          onClick={() => toggleCompetitor(competitor.asin)}
                        >
                          <div className="flex items-center space-x-4">
                            <ChevronRight className="h-5 w-5 text-gray-500" />
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
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${(competitor.price || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">BSR: {competitor.bsr ? `#${competitor.bsr.toLocaleString()}` : 'N/A'}</div>
                            <div className="mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  categorizeCompetitor(competitor) === 'strong' ? 'border-green-500 text-green-700' :
                                  categorizeCompetitor(competitor) === 'average' ? 'border-yellow-500 text-yellow-700' :
                                  'border-red-500 text-red-700'
                                }`}
                              >
                                {categorizeCompetitor(competitor).charAt(0).toUpperCase() + categorizeCompetitor(competitor).slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Expandable Content */}
                      {isExpanded && (
                        <div>
                          {/* Header when expanded */}
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer bg-white border-b"
                            onClick={() => toggleCompetitor(competitor.asin)}
                          >
                            <div className="flex items-center space-x-4">
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                              <h3 className="font-semibold text-lg text-gray-900">
                                {competitor.name || competitor.title || 'Unknown Product'}
                              </h3>
                            </div>
                            <Button variant="ghost" size="sm">Collapse</Button>
                          </div>
                          
                          {/* Detailed content */}
                          <div className="p-6 bg-white space-y-6">
                            {/* Product Images Gallery */}
                            <div className="flex items-start space-x-6">
                              <div className="flex-shrink-0">
                                <img 
                                  src={competitor.image || allImages[0] || 'https://via.placeholder.com/200x200?text=No+Image'}
                                  alt={competitor.name || competitor.title}
                                  className="w-48 h-48 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                                  onClick={() => openEnlargedImage(competitor.image || allImages[0], allImages, 0)}
                                />
                                {allImages.length > 1 && (
                                  <div className="grid grid-cols-4 gap-2 mt-2">
                                    {allImages.slice(0, 4).map((image: string, imgIndex: number) => (
                                      <img 
                                        key={imgIndex}
                                        src={image}
                                        alt={`${competitor.name || competitor.title} - Image ${imgIndex + 1}`}
                                        className="w-10 h-10 rounded object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                                        onClick={() => openEnlargedImage(image, allImages, imgIndex)}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Basic Info Grid */}
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Price</p>
                                  <p className="text-xl font-bold text-green-600">${(competitor.price || 0).toFixed(2)}</p>
                                  {competitor.fee && (
                                    <p className="text-xs text-gray-500">FBA Fee: ${competitor.fee.toFixed(2)}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Rating</p>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-4 w-4 ${i < Math.floor(competitor.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                    <span className="text-sm ml-1">{(competitor.rating || 0).toFixed(1)}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">{(competitor.review_count || 0).toLocaleString()} reviews</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">BSR</p>
                                  <p className="text-lg font-bold">#{(competitor.bsr || 0).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">{competitor.category || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Monthly Sales</p>
                                  <p className="text-lg font-bold">{(competitor.monthly_orders || 0).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">Est. Revenue: ${((competitor.monthly_orders || 0) * (competitor.price || 0)).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Competitor Score</p>
                                  <div className="flex items-center space-x-2">
                                    <div className={`text-lg font-bold ${
                                      calculateCompetitorScore(competitor) >= 80 ? 'text-green-600' :
                                      calculateCompetitorScore(competitor) >= 60 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {calculateCompetitorScore(competitor)}/100
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        categorizeCompetitor(competitor) === 'strong' ? 'border-green-500 text-green-700' :
                                        categorizeCompetitor(competitor) === 'average' ? 'border-yellow-500 text-yellow-700' :
                                        'border-red-500 text-red-700'
                                      }`}
                                    >
                                      {categorizeCompetitor(competitor).charAt(0).toUpperCase() + categorizeCompetitor(competitor).slice(1)}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-500">Based on metrics & keywords</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Keyword Ownership</p>
                                  <div className="flex items-center space-x-2">
                                    <div className={`text-lg font-bold ${
                                      calculateAverageKeywordOwnership(competitor.asin) >= 70 ? 'text-green-600' :
                                      calculateAverageKeywordOwnership(competitor.asin) >= 40 ? 'text-yellow-600' :
                                      calculateAverageKeywordOwnership(competitor.asin) >= 20 ? 'text-orange-600' :
                                      'text-red-600'
                                    }`}>
                                      {Math.round(calculateAverageKeywordOwnership(competitor.asin))}%
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">Avg across all keywords</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Product Details Tabs */}
                            <div className="border-t pt-4">
                              <div className="flex space-x-4 border-b">
                                {['details', 'dimensions', 'keywords'].map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setSelectedCompetitor({ ...competitor, activeTab: tab })}
                                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                      selectedCompetitor?.activeTab === tab 
                                        ? 'text-blue-600 border-blue-600' 
                                        : 'text-gray-500 border-transparent hover:text-gray-700'
                                    }`}
                                  >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                  </button>
                                ))}
                              </div>
                              
                              <div className="mt-4">
                                {/* Details Tab */}
                                {(!selectedCompetitor?.activeTab || selectedCompetitor?.activeTab === 'details') && (
                                  <div className="space-y-4">
                                    {/* Bullet Points */}
                                    {(() => {
                                      const bulletPoints = competitor.bullet_points ? 
                                        (typeof competitor.bullet_points === 'string' ? 
                                          JSON.parse(competitor.bullet_points) : 
                                          competitor.bullet_points) : []
                                      
                                      return bulletPoints.length > 0 ? (
                                        <div>
                                          <h5 className="font-medium text-sm text-gray-700 mb-2">Key Features</h5>
                                          <ul className="space-y-2">
                                            {bulletPoints.map((point: string, index: number) => (
                                              <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span>{point}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : null
                                    })()}
                                    
                                    {/* Brand & ASIN Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-600">Brand:</span>
                                        <span className="ml-2 font-medium">{competitor.brand || 'Unknown'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">ASIN:</span>
                                        <span className="ml-2 font-mono text-xs">{competitor.asin}</span>
                                      </div>
                                      {competitor.parent_asin && (
                                        <div>
                                          <span className="text-gray-600">Parent ASIN:</span>
                                          <span className="ml-2 font-mono text-xs">{competitor.parent_asin}</span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-gray-600">Status:</span>
                                        <Badge variant={competitor.status === 'ACTIVE' ? 'default' : 'secondary'} className="ml-2">
                                          {competitor.status || 'ACTIVE'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Dimensions Tab */}
                                {selectedCompetitor?.activeTab === 'dimensions' && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <h5 className="font-medium text-sm text-gray-700">Package Dimensions</h5>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Length:</span>
                                            <span>{competitor.length || competitor.dimensions?.length || 'N/A'}"</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Width:</span>
                                            <span>{competitor.width || competitor.dimensions?.width || 'N/A'}"</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Height:</span>
                                            <span>{competitor.height || competitor.dimensions?.height || 'N/A'}"</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Weight:</span>
                                            <span>{competitor.weight || competitor.dimensions?.weight || 'N/A'} lbs</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h5 className="font-medium text-sm text-gray-700">FBA Details</h5>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">FBA Tier:</span>
                                            <span>{competitor.tier || 'Standard'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">FBA Fee:</span>
                                            <span className="font-medium">${competitor.fee ? competitor.fee.toFixed(2) : 'N/A'}</span>
                                          </div>
                                          {competitor.fba_fees && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Fee Details:</span>
                                              <button 
                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                                onClick={() => console.log('FBA Fees:', competitor.fba_fees)}
                                              >
                                                View Details
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Keywords Tab */}
                                {selectedCompetitor?.activeTab === 'keywords' && (
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Keyword ownership analysis helps determine competitor strength
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setActiveTab('keyword')}
                                    >
                                      View Keyword Ownership Matrix
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Historical Performance Analysis */}
                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span>Historical Performance Analysis</span>
                              </h4>
                              
                              {/* Metric Toggle Buttons */}
                              <div className="flex space-x-2 mb-4">
                                {['price', 'bsr', 'rating', 'reviews'].map((metric) => (
                                  <button
                                    key={metric}
                                    onClick={() => toggleMetric(metric)}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                      visibleMetrics[metric]
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                  </button>
                                ))}
                              </div>
                              
                              {/* Chart */}
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={generateHistoricalData(competitor)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <Tooltip 
                                      formatter={(value: any, name: string) => {
                                        if (name === 'bsr') return [`#${(value * 1000).toFixed(0)}`, 'BSR']
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
                      )}
                    </div>
                  )
                })}
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
                <Search className="h-5 w-5 text-purple-600" />
                <span>Keyword Ownership Matrix</span>
              </CardTitle>
              <CardDescription>
                Competitive analysis of keyword rankings and ownership percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keywordData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Keyword Group</th>
                        {data.competitors?.map((comp: any, index: number) => (
                          <th key={comp.asin} className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                            <div className="flex flex-col items-center">
                              <span className="line-clamp-1">{comp.brand || `Comp ${index + 1}`}</span>
                              <span className="text-xs text-gray-500 font-normal">{comp.asin}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {keywordData.map((group, groupIndex) => {
                        const rows = []
                        
                        // Root keyword row
                        rows.push(
                          <tr key={`group-${groupIndex}`} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleGroup(`group-${groupIndex}`)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {expandedGroups[`group-${groupIndex}`] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="capitalize text-gray-900 font-medium">{group.root}</span>
                                <Badge variant="outline" className="text-xs">{group.keywordCount} keywords</Badge>
                              </div>
                            </td>
                            {data.competitors?.map((comp: any, compIndex: number) => {
                              // Calculate average ownership for root
                              const rootOwnership = group.subroots.length > 0
                                ? Math.round(group.subroots.reduce((sum: number, subroot: any) => {
                                    const avgOwnership = subroot.keywords.length > 0
                                      ? subroot.keywords.reduce((s: number, kw: any) => s + (kw.ownership?.[comp.asin] || 0), 0) / subroot.keywords.length
                                      : 0
                                    return sum + avgOwnership
                                  }, 0) / group.subroots.length)
                                : 0
                              
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
                        
                        // Subroot rows (expanded)
                        if (expandedGroups[`group-${groupIndex}`]) {
                          group.subroots.forEach((subroot: any, subrootIndex: number) => {
                            rows.push(
                              <tr key={`subroot-${groupIndex}-${subrootIndex}`} className="border-b bg-gray-50 hover:bg-gray-100">
                                <td className="py-3 px-2 pl-10">
                                  <span className="text-sm text-gray-700">{subroot.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">({subroot.keywordCount} keywords)</span>
                                </td>
                                {data.competitors?.map((comp: any, compIndex: number) => {
                                  const ownership = subroot.keywords.length > 0
                                    ? Math.round(subroot.keywords.reduce((sum: number, kw: any) => 
                                        sum + (kw.ownership?.[comp.asin] || 0), 0) / subroot.keywords.length)
                                    : 0
                                  
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No keyword data available. Please ensure keyword hierarchy data is provided.
                </div>
              )}
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
                {/* Price Distribution Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Price Distribution</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generatePriceDistribution(data.competitors)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Price vs Performance Analysis */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Price vs Performance Matrix</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <h5 className="font-medium text-red-700">Low Price, Low Rating</h5>
                      <p className="text-2xl font-bold text-red-600 mt-2">
                        {data.competitors?.filter((c: any) => 
                          (c.price || 0) < 30 && (c.rating || 0) < 4
                        ).length || 0}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Budget Competitors</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-700">High Price, High Rating</h5>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        {data.competitors?.filter((c: any) => 
                          (c.price || 0) >= 30 && (c.rating || 0) >= 4
                        ).length || 0}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Premium Leaders</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <h5 className="font-medium text-yellow-700">Low Price, High Rating</h5>
                      <p className="text-2xl font-bold text-yellow-600 mt-2">
                        {data.competitors?.filter((c: any) => 
                          (c.price || 0) < 30 && (c.rating || 0) >= 4
                        ).length || 0}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Value Champions</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-purple-700">High Price, Low Rating</h5>
                      <p className="text-2xl font-bold text-purple-600 mt-2">
                        {data.competitors?.filter((c: any) => 
                          (c.price || 0) >= 30 && (c.rating || 0) < 4
                        ).length || 0}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Overpriced</p>
                    </div>
                  </div>
                </div>
                
                {/* Pricing Recommendations */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Pricing Recommendations</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Optimal Price Range</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        ${Math.min(...(data.competitors?.map((c: any) => c.price || 0) || [0])).toFixed(2)} - 
                        ${Math.max(...(data.competitors?.map((c: any) => c.price || 0) || [0])).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">Average Market Price</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ${(data.competitors?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium">Best Value Price</span>
                      </div>
                      <span className="font-bold text-yellow-600">
                        ${((data.competitors?.reduce((sum: number, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)) * 0.9).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amazon Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          {/* Search Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Amazon Search Simulator</span>
              </CardTitle>
              <CardDescription>
                Simulate Amazon search results and see where products would rank
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search-term">Search Term</Label>
                    <Input
                      id="search-term"
                      placeholder="e.g., berberine supplement"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="marketplace">Marketplace</Label>
                    <Select value={marketplace} onValueChange={setMarketplace}>
                      <SelectTrigger id="marketplace">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">Amazon.com (US)</SelectItem>
                        <SelectItem value="uk">Amazon.co.uk (UK)</SelectItem>
                        <SelectItem value="de">Amazon.de (DE)</SelectItem>
                        <SelectItem value="fr">Amazon.fr (FR)</SelectItem>
                        <SelectItem value="ca">Amazon.ca (CA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="your-asin">Your ASIN (Optional)</Label>
                    <Input
                      id="your-asin"
                      placeholder="B0XXXXXXXX"
                      value={yourAsin}
                      onChange={(e) => setYourAsin(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={runSimulation}
                  disabled={simulationLoading || !searchTerm}
                  className="w-full"
                >
                  {simulationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Run Search Simulation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Simulation Results */}
          {simulationRun && simulationResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">
                      Search Results for "{searchTerm}" on Amazon.{marketplace === 'us' ? 'com' : marketplace}
                    </h4>
                    <Badge variant="outline">{simulationResults.length} products</Badge>
                  </div>
                  
                  {/* Summary Stats */}
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
                        {(simulationResults.reduce((sum, r) => sum + r.rating, 0) / simulationResults.length).toFixed(1)} ★
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Avg Reviews</div>
                      <div className="text-gray-600">
                        {Math.round(simulationResults.reduce((sum, r) => sum + r.reviews, 0) / simulationResults.length).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Position</th>
                        <th className="text-left py-3 px-4">Product</th>
                        <th className="text-center py-3 px-4">Price</th>
                        <th className="text-center py-3 px-4">Rating</th>
                        <th className="text-center py-3 px-4">Reviews</th>
                        <th className="text-center py-3 px-4">BSR</th>
                        <th className="text-center py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.map((result, index) => (
                        <tr key={index} className={`border-b hover:bg-gray-50 ${
                          result.isYourProduct ? 'bg-blue-50' : ''
                        }`}>
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
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <a 
                                  href={`https://www.amazon.com/dp/${result.asin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline line-clamp-1"
                                >
                                  {result.title}
                                </a>
                                <p className="text-xs text-gray-500">{result.asin}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-medium">
                            ${result.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
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
                              <span className="text-sm ml-1">{result.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {result.reviews.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            #{result.bsr.toLocaleString()}
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
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Image Enlargement Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeEnlargedImage}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeEnlargedImage}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ✕
            </button>
            <img 
              src={enlargedImage}
              alt="Enlarged product image"
              className="max-w-full max-h-screen object-contain"
            />
            {enlargedImageSet.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newIndex = enlargedImageIndex > 0 ? enlargedImageIndex - 1 : enlargedImageSet.length - 1
                    setEnlargedImageIndex(newIndex)
                    setEnlargedImage(enlargedImageSet[newIndex])
                  }}
                  className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const newIndex = enlargedImageIndex < enlargedImageSet.length - 1 ? enlargedImageIndex + 1 : 0
                    setEnlargedImageIndex(newIndex)
                    setEnlargedImage(enlargedImageSet[newIndex])
                  }}
                  className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}