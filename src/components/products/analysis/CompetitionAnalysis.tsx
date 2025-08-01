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
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ScatterChart, Scatter, Cell } from 'recharts'
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
  Ruler,
  Maximize2,
  Download
} from 'lucide-react'

interface CompetitionAnalysisProps {
  data: any
}

// Fullscreen wrapper component
const FullscreenWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div 
      data-fullscreen-container
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : ''}`}
    >
      {children}
    </div>
  )
}

// Expand Button Component
const ExpandButton = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const tableContainer = document.querySelector('[data-fullscreen-container]') as HTMLElement
    if (!document.fullscreenElement) {
      if (tableContainer) {
        tableContainer.requestFullscreen().then(() => {
          setIsFullscreen(true)
        }).catch((err) => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      }
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err)
      })
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <button 
      onClick={toggleFullscreen}
      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      <Maximize2 className="h-4 w-4" />
      <span>Expand</span>
    </button>
  )
}

export default function CompetitionAnalysis({ data }: CompetitionAnalysisProps) {
  // Function to calculate accurate review velocity from historical data
  const calculateReviewVelocity = (asin: string, reviewHistory: any) => {
    if (!reviewHistory || !reviewHistory[asin] || !Array.isArray(reviewHistory[asin])) {
      // Fallback to simple calculation if no history
      const competitor = data.competitors?.find((c: any) => c.asin === asin)
      return Math.round((competitor?.review_count || 0) / 12) // Assume 1 year
    }

    const history = reviewHistory[asin].sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    if (history.length < 2) {
      // Need at least 2 data points
      const competitor = data.competitors?.find((c: any) => c.asin === asin)
      return Math.round((competitor?.review_count || 0) / 12) // Fallback
    }

    // Try to get 6 months of data (180 days)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000))
    
    // Find the closest data points to 6 months ago and now
    let startPoint = history[0] // Default to earliest
    let endPoint = history[history.length - 1] // Default to latest
    
    // Find better start point (closest to 6 months ago)
    for (let i = 0; i < history.length; i++) {
      const recordDate = new Date(history[i].date)
      if (recordDate >= sixMonthsAgo) {
        startPoint = history[i]
        break
      }
    }
    
    // Calculate the actual time period in days
    const startDate = new Date(startPoint.date)
    const endDate = new Date(endPoint.date)
    const daysDiff = Math.max(1, (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    
    // Calculate review growth over the period
    const reviewGrowth = Math.max(0, endPoint.reviewCount - startPoint.reviewCount)
    
    // Convert to monthly velocity
    const monthlyVelocity = (reviewGrowth / daysDiff) * 30 // reviews per month
    
    return Math.round(monthlyVelocity)
  }

  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('competitors')
  const [keywordData, setKeywordData] = useState<any[]>([])
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({})
  const [expandedSubgroups, setExpandedSubgroups] = useState<{ [key: string]: boolean }>({})
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
  const [dateRange, setDateRange] = useState(365) // Default to 365 days
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('week') // Default to week
  const [competitorFilter, setCompetitorFilter] = useState<'all' | 'strong' | 'average' | 'weak'>('all')
  
  // Amazon Simulator state
  const [searchTerm, setSearchTerm] = useState('')
  const [marketplace, setMarketplace] = useState('us')
  const [yourAsin, setYourAsin] = useState('')
  const [simulationResults, setSimulationResults] = useState<any[]>([])
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationRun, setSimulationRun] = useState(false)
  
  // Keyword filtering state
  const [minRootKeywords, setMinRootKeywords] = useState(5)
  const [minSubrootKeywords, setMinSubrootKeywords] = useState(5)
  const [keywordSearchTerm, setKeywordSearchTerm] = useState('')
  
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
    // Generate historical data for the selected date range
    const days = dateRange
    const basePrice = competitor.price || 25
    const baseBSR = competitor.bsr || 5000
    const baseRating = competitor.rating || 4.5
    const baseReviews = competitor.review_count || 1000
    
    const today = new Date()
    const rawData = []
    
    // Generate daily data points
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (days - 1 - i))
      
      // Add seasonal variations
      const monthFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2
      const dayOfYearFactor = Math.sin((i / 365) * Math.PI * 2) * 0.1
      
      rawData.push({
        date: date,
        price: basePrice + (Math.random() - 0.5) * 5 + monthFactor * 5,
        bsr: Math.max(100, baseBSR / 1000 + (Math.random() - 0.5) * 2 - dayOfYearFactor * 2),
        rating: Math.max(3.5, Math.min(5, baseRating + (Math.random() - 0.5) * 0.3)),
        reviews: Math.max(0, baseReviews / 100 + (Math.random() - 0.5) * 5 + i * (baseReviews / 1000))
      })
    }
    
    // Aggregate data based on granularity
    if (granularity === 'day') {
      return rawData.map(item => ({
        day: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: item.date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }),
        price: item.price,
        bsr: item.bsr,
        rating: item.rating,
        reviews: item.reviews
      }))
    } else if (granularity === 'week') {
      // Group by week
      const weeks = new Map()
      rawData.forEach(item => {
        const weekStart = new Date(item.date)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, { items: [], weekStart })
        }
        weeks.get(weekKey).items.push(item)
      })
      
      return Array.from(weeks.values()).map(week => {
        const avgPrice = week.items.reduce((sum: number, item: any) => sum + item.price, 0) / week.items.length
        const avgBsr = week.items.reduce((sum: number, item: any) => sum + item.bsr, 0) / week.items.length
        const avgRating = week.items.reduce((sum: number, item: any) => sum + item.rating, 0) / week.items.length
        const avgReviews = week.items.reduce((sum: number, item: any) => sum + item.reviews, 0) / week.items.length
        
        return {
          day: week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: `Week of ${week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          price: avgPrice,
          bsr: avgBsr,
          rating: avgRating,
          reviews: avgReviews
        }
      })
    } else {
      // Group by month
      const months = new Map()
      rawData.forEach(item => {
        const monthKey = `${item.date.getFullYear()}-${item.date.getMonth()}`
        
        if (!months.has(monthKey)) {
          months.set(monthKey, { items: [], year: item.date.getFullYear(), month: item.date.getMonth() })
        }
        months.get(monthKey).items.push(item)
      })
      
      return Array.from(months.values()).map(month => {
        const avgPrice = month.items.reduce((sum: number, item: any) => sum + item.price, 0) / month.items.length
        const avgBsr = month.items.reduce((sum: number, item: any) => sum + item.bsr, 0) / month.items.length
        const avgRating = month.items.reduce((sum: number, item: any) => sum + item.rating, 0) / month.items.length
        const avgReviews = month.items.reduce((sum: number, item: any) => sum + item.reviews, 0) / month.items.length
        const monthDate = new Date(month.year, month.month, 1)
        
        return {
          day: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          fullDate: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          price: avgPrice,
          bsr: avgBsr,
          rating: avgRating,
          reviews: avgReviews
        }
      })
    }
  }
  
  const processKeywordData = useCallback(() => {
    try {
      const keywordGroups: any[] = []
      
      // Process real keyword hierarchy data from the data prop
      Object.entries(data.keywordHierarchy || {}).forEach(([rootName, rootData]: [string, any]) => {
        const group: any = {
          root: rootName.toLowerCase(), // Make root lowercase
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
        
        // Sort subroots by keyword count descending
        group.subroots.sort((a, b) => b.keywordCount - a.keywordCount)
        
        if (group.subroots.length > 0 || group.keywordCount > 0) {
          keywordGroups.push(group)
        }
      })
      
      // Sort root groups by keyword count descending
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

  const toggleSubgroup = (subgroupKey: string) => {
    setExpandedSubgroups(prev => ({
      ...prev,
      [subgroupKey]: !prev[subgroupKey]
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
    
    // Only return ranges that have data (count > 0)
    return ranges.filter(range => range.count > 0)
  }

  // Generate scatter plot data for competitor prices
  const generatePriceScatterData = (competitors: any[]) => {
    return competitors?.map((competitor, index) => ({
      x: index + 1, // Sequential position for X-axis
      y: competitor.price || 0, // Price for Y-axis
      asin: competitor.asin,
      title: competitor.title || competitor.name,
      rating: competitor.rating || 0,
      reviewCount: competitor.review_count || 0,
      brand: competitor.brand || 'Unknown',
      // Color based on price tier
      fill: (() => {
        const avgPrice = competitors.reduce((sum, c) => sum + (c.price || 0), 0) / competitors.length
        const price = competitor.price || 0
        if (price < avgPrice * 0.8) return '#10b981' // Green for budget
        if (price > avgPrice * 1.2) return '#ef4444' // Red for premium
        return '#3b82f6' // Blue for mid-range
      })()
    })) || []
  }

  const getPriceTier = (price: number, averagePrice: number) => {
    const ratio = price / averagePrice
    const percentDiff = ((price - averagePrice) / averagePrice * 100).toFixed(0)
    
    if (ratio < 0.8) return `${Math.abs(Number(percentDiff))}% Below Avg`
    if (ratio > 1.2) return `${percentDiff}% Above Avg`
    if (ratio < 0.95) return `${Math.abs(Number(percentDiff))}% Below Avg`
    if (ratio > 1.05) return `${percentDiff}% Above Avg`
    return 'Within Average'
  }

  const getPriceAggressiveness = (price: number, averagePrice: number) => {
    const ratio = price / averagePrice
    if (ratio < 0.8) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50' }
    if (ratio < 0.9) return { level: 'Moderate', color: 'text-orange-600', bgColor: 'bg-orange-50' }
    if (ratio > 1.2) return { level: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-50' }
    return { level: 'Average', color: 'text-green-600', bgColor: 'bg-green-50' }
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
      // Call Keepa search API
      const response = await fetch('/api/keepa-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          domain: marketplace === 'us' ? 1 : 1 // Default to US for now
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch search results')
      }

      const searchData = await response.json()
      
      if (!searchData.success) {
        throw new Error(searchData.message || 'Search failed')
      }

      // Transform Keepa API results to simulation format
      const results = searchData.data.map((product: any, index: number) => ({
        position: index + 1,
        asin: product.asin,
        title: product.title,
        price: product.currentPrice / 100, // Convert from cents to dollars
        rating: product.rating / 10, // Convert from Keepa format (0-50) to standard (0-5)
        reviewCount: product.reviewCount,
        bsr: Math.floor(Math.random() * 50000) + 1000, // Mock BSR for now
        image: product.imageUrl || 'https://via.placeholder.com/150x150?text=Product',
        isYourProduct: yourAsin && product.asin === yourAsin,
        isPrime: product.isPrime || false,
        brand: product.brand
      }))
      
      // If user provided their ASIN and it's not in the results, add it
      if (yourAsin && !results.some((r: any) => r.asin === yourAsin)) {
        results.push({
          position: results.length + 1,
          asin: yourAsin,
          title: `Your Product ${yourAsin}`,
          price: 35.99,
          rating: 4.5,
          reviewCount: 250,
          bsr: 8500,
          image: 'https://via.placeholder.com/150x150?text=Your+Product',
          isYourProduct: true,
          isPrime: true,
          brand: 'Your Brand'
        })
        
        // Re-sort to maintain realistic positioning
        results.sort((a: any, b: any) => {
          const scoreA = (a.rating * 20) + (Math.log10(a.reviewCount + 1) * 10)
          const scoreB = (b.rating * 20) + (Math.log10(b.reviewCount + 1) * 10)
          return scoreB - scoreA
        })
        
        // Update positions after sorting
        results.forEach((result: any, index: number) => {
          result.position = index + 1
        })
      }
      
      setSimulationResults(results.slice(0, 10)) // Show top 10 results as requested
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Failed to run simulation. Please try again.')
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
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md border ${
                      competitorFilter === 'all' 
                        ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md border-blue-300' 
                        : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                    }`}
                  >
                    <div className="text-2xl font-bold text-blue-600">{(data.competitors || []).length}</div>
                    <div className="text-sm text-gray-600">Total Competitors</div>
                  </button>
                  <button
                    onClick={() => setCompetitorFilter('strong')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md border ${
                      competitorFilter === 'strong' 
                        ? 'bg-green-100 ring-2 ring-green-500 shadow-md border-green-300' 
                        : 'bg-green-50 hover:bg-green-100 border-green-200'
                    }`}
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {(data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'strong').length}
                    </div>
                    <div className="text-sm text-gray-600">Strong</div>
                  </button>
                  <button
                    onClick={() => setCompetitorFilter('average')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md border ${
                      competitorFilter === 'average' 
                        ? 'bg-yellow-100 ring-2 ring-yellow-500 shadow-md border-yellow-300' 
                        : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
                    }`}
                  >
                    <div className="text-2xl font-bold text-yellow-600">
                      {(data.competitors || []).filter((c: any) => categorizeCompetitor(c) === 'average').length}
                    </div>
                    <div className="text-sm text-gray-600">Average</div>
                  </button>
                  <button
                    onClick={() => setCompetitorFilter('weak')}
                    className={`text-center p-4 rounded-lg transition-all hover:shadow-md border ${
                      competitorFilter === 'weak' 
                        ? 'bg-red-100 ring-2 ring-red-500 shadow-md border-red-300' 
                        : 'bg-red-50 hover:bg-red-100 border-red-200'
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
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span>{competitor.rating ? competitor.rating.toFixed(1) : '0.0'}</span>
                                </div>
                                <span>{competitor.review_count ? competitor.review_count.toLocaleString() : '0'} reviews</span>
                                <span className="text-green-600 font-medium">${(competitor.price || 0).toFixed(2)}</span>
                                <span>BSR: {competitor.bsr ? `#${competitor.bsr.toLocaleString()}` : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-xs text-gray-600">Keyword Ownership</div>
                              <div className={`text-lg font-bold ${
                                calculateAverageKeywordOwnership(competitor.asin) >= 70 ? 'text-green-600' :
                                calculateAverageKeywordOwnership(competitor.asin) >= 40 ? 'text-yellow-600' :
                                calculateAverageKeywordOwnership(competitor.asin) >= 20 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {Math.round(calculateAverageKeywordOwnership(competitor.asin))}%
                              </div>
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
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Keyword Ownership:</span>
                                <span className={`text-lg font-bold ${
                                  calculateAverageKeywordOwnership(competitor.asin) >= 70 ? 'text-green-600' :
                                  calculateAverageKeywordOwnership(competitor.asin) >= 40 ? 'text-yellow-600' :
                                  calculateAverageKeywordOwnership(competitor.asin) >= 20 ? 'text-orange-600' :
                                  'text-red-600'
                                }`}>
                                  {Math.round(calculateAverageKeywordOwnership(competitor.asin))}%
                                </span>
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
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Detailed content */}
                          <div className="p-6 bg-white space-y-6">
                            {/* Product Images Gallery - Amazon Style */}
                            <div className="flex items-start space-x-6">
                              <div className="flex items-start space-x-3 w-1/2">
                                {/* Thumbnail Column - Left Side */}
                                {allImages.length > 1 && (
                                  <div className="flex flex-col space-y-2">
                                    {allImages.map((image: string, imgIndex: number) => (
                                      <img 
                                        key={imgIndex}
                                        src={image}
                                        alt={`${competitor.name || competitor.title} - Thumbnail ${imgIndex + 1}`}
                                        className="w-16 h-16 rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-all object-contain"
                                        onClick={() => {
                                          // Update main image when thumbnail is clicked
                                          const mainImg = document.querySelector(`#main-image-${competitor.asin}`) as HTMLImageElement;
                                          if (mainImg) {
                                            mainImg.src = image;
                                          }
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                                
                                {/* Main Image - Square */}
                                <div className="flex-1">
                                  <img 
                                    id={`main-image-${competitor.asin}`}
                                    src={competitor.image || allImages[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                                    alt={competitor.name || competitor.title}
                                    className="w-full h-auto max-h-[500px] rounded-lg object-contain border border-gray-200 cursor-pointer hover:opacity-90 bg-white"
                                    onClick={() => openEnlargedImage(competitor.image || allImages[0], allImages, 0)}
                                  />
                                </div>
                              </div>
                              
                              {/* Basic Info with Tabs */}
                              <div className="flex-1 w-1/2">
                                {/* Tabs */}
                                <div className="flex space-x-4 border-b mb-4">
                                  {['details', 'bullet_points', 'dimensions'].map((tab) => (
                                    <button
                                      key={tab}
                                      onClick={() => setSelectedCompetitor({ ...competitor, activeTab: tab })}
                                      className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                        selectedCompetitor?.activeTab === tab 
                                          ? 'text-blue-600 border-blue-600' 
                                          : 'text-gray-500 border-transparent hover:text-gray-700'
                                      }`}
                                    >
                                      {tab === 'bullet_points' ? 'Bullet Points' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                  ))}
                                </div>
                                
                                {/* Tab Content */}
                                <div className="space-y-4">
                                  {/* Details Tab */}
                                  {(!selectedCompetitor?.activeTab || selectedCompetitor?.activeTab === 'details') && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="text-xl font-bold text-green-600">${(competitor.price || 0).toFixed(2)}</p>
                                        {competitor.fee && (
                                          <p className="text-xs text-gray-500">FBA Fee: ${competitor.fee.toFixed(2)}</p>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-600">BSR</p>
                                        <p className="text-lg font-bold">#{(competitor.bsr || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{competitor.category || 'N/A'}</p>
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
                                        <p className="text-sm text-gray-600">Monthly Sales</p>
                                        <p className="text-lg font-bold">{(competitor.monthly_orders || 0).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Est. Revenue: ${((competitor.monthly_orders || 0) * (competitor.price || 0)).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Bullet Points Tab */}
                                  {selectedCompetitor?.activeTab === 'bullet_points' && (
                                    <div className="space-y-3">
                                      {(() => {
                                        const bulletPoints = competitor.bullet_points ? 
                                          (typeof competitor.bullet_points === 'string' ? 
                                            JSON.parse(competitor.bullet_points) : 
                                            competitor.bullet_points) : []
                                        
                                        return bulletPoints.length > 0 ? (
                                          <ul className="space-y-2">
                                            {bulletPoints.map((point: string, idx: number) => (
                                              <li key={idx} className="flex items-start">
                                                <span className="text-blue-500 mr-2">•</span>
                                                <span className="text-sm text-gray-700">{point}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <p className="text-sm text-gray-500 italic">No bullet points available</p>
                                        )
                                      })()}
                                    </div>
                                  )}
                                  
                                  {/* Dimensions Tab */}
                                  {selectedCompetitor?.activeTab === 'dimensions' && (
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
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            
                            {/* Historical Performance Analysis */}
                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <span>Historical Performance Analysis</span>
                              </h4>
                              
                              {/* Date Controls and Metric Toggle Buttons */}
                              <div className="space-y-3 mb-4">
                                {/* First Row: Date Range and Granularity */}
                                <div className="flex flex-wrap items-center justify-end gap-4">
                                  {/* Date Range Buttons */}
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 font-medium">Range:</span>
                                    <div className="flex space-x-1">
                                      {[
                                        { label: '30D', value: 30 },
                                        { label: '90D', value: 90 },
                                        { label: '180D', value: 180 },
                                        { label: '1Y', value: 365 }
                                      ].map((range) => (
                                        <button
                                          key={range.value}
                                          onClick={() => setDateRange(range.value)}
                                          className={`px-3 py-1 text-xs rounded transition-colors ${
                                            dateRange === range.value
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          {range.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Granularity Buttons */}
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 font-medium">View by:</span>
                                    <div className="flex space-x-1">
                                      {[
                                        { label: 'Day', value: 'day' as const },
                                        { label: 'Week', value: 'week' as const },
                                        { label: 'Month', value: 'month' as const }
                                      ].map((gran) => (
                                        <button
                                          key={gran.value}
                                          onClick={() => setGranularity(gran.value)}
                                          className={`px-3 py-1 text-xs rounded transition-colors ${
                                            granularity === gran.value
                                              ? 'bg-green-600 text-white'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          {gran.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Chart */}
                              <div className="h-64 mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={generateHistoricalData(competitor)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                      dataKey="day" 
                                      tick={{ fontSize: 10 }}
                                      interval={granularity === 'month' ? 0 : "preserveStartEnd"}
                                      angle={dateRange > 90 && granularity !== 'month' ? -45 : 0}
                                      textAnchor={dateRange > 90 && granularity !== 'month' ? "end" : "middle"}
                                      height={dateRange > 90 && granularity !== 'month' ? 60 : 30}
                                    />
                                    <Tooltip 
                                      labelFormatter={(label: any, payload: any) => {
                                        if (payload && payload.length > 0) {
                                          return payload[0].payload.fullDate
                                        }
                                        return label
                                      }}
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
                              
                              {/* Metric Toggle Buttons - Centered below chart */}
                              <div className="flex items-center justify-center space-x-2">
                                <span className="text-xs text-gray-500 font-medium">Metrics:</span>
                                <div className="flex space-x-2">
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
                <div className="space-y-4">
                  {/* Filter and Action Bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search keywords..."
                          value={keywordSearchTerm}
                          onChange={(e) => setKeywordSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                        <span>Min Keywords Per Root:</span>
                        <input
                          type="number"
                          min="1"
                          value={minRootKeywords}
                          onChange={(e) => setMinRootKeywords(parseInt(e.target.value) || 1)}
                          className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                        <span>Min Keywords Per Sub Root:</span>
                        <input
                          type="number"
                          min="1"
                          value={minSubrootKeywords}
                          onChange={(e) => setMinSubrootKeywords(parseInt(e.target.value) || 1)}
                          className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                        />
                      </div>
                      <ExpandButton />
                    </div>
                  </div>
                  
                  <FullscreenWrapper>
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Keyword Group</th>
                        {data.competitors?.map((comp: any, index: number) => (
                          <th key={comp.asin} className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                            <div className="flex flex-col items-center space-y-2">
                              <img 
                                src={comp.image || `https://m.media-amazon.com/images/I/${comp.image_urls?.split(',')[0]?.trim()}` || 'https://via.placeholder.com/40x40?text=No+Image'}
                                alt={comp.asin}
                                className="w-10 h-10 rounded object-cover border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                                }}
                              />
                              <div className="flex flex-col items-center">
                                <span className="line-clamp-1">{comp.brand || `Comp ${index + 1}`}</span>
                                <span className="text-xs text-gray-500 font-normal">{comp.asin}</span>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {keywordData
                        .filter(group => {
                          // Filter by minimum keywords
                          if (group.keywordCount < minRootKeywords) return false
                          
                          // Filter by search term
                          if (keywordSearchTerm) {
                            const searchLower = keywordSearchTerm.toLowerCase()
                            // Check if root matches
                            if (group.root.toLowerCase().includes(searchLower)) return true
                            // Check if any subroot matches
                            return group.subroots.some((subroot: any) => 
                              subroot.name.toLowerCase().includes(searchLower)
                            )
                          }
                          
                          return true
                        })
                        .map((group, groupIndex) => {
                          const rows = []
                          
                          // Root keyword row
                          rows.push(
                          <tr key={`group-${groupIndex}`} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div 
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition-colors"
                                onClick={() => toggleGroup(`group-${groupIndex}`)}
                              >
                                <div className="text-gray-500 hover:text-gray-700">
                                  {expandedGroups[`group-${groupIndex}`] ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                                <span className="text-gray-900 font-medium">{group.root}</span>
                                <Badge variant="outline" className="text-xs">{group.keywordCount.toLocaleString()} keywords</Badge>
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
                          group.subroots
                            .filter((subroot: any) => {
                              // Filter by minimum keywords
                              if (subroot.keywordCount < minSubrootKeywords) return false
                              
                              // Filter by search term
                              if (keywordSearchTerm) {
                                const searchLower = keywordSearchTerm.toLowerCase()
                                return subroot.name.toLowerCase().includes(searchLower)
                              }
                              
                              return true
                            })
                            .forEach((subroot: any, subrootIndex: number) => {
                              rows.push(
                              <tr key={`subroot-${groupIndex}-${subrootIndex}`} className="border-b bg-gray-50 hover:bg-gray-100">
                                <td className="py-3 px-2 pl-10">
                                  <div 
                                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -mx-2 transition-colors"
                                    onClick={() => toggleSubgroup(`subroot-${groupIndex}-${subrootIndex}`)}
                                  >
                                    {subroot.keywords && subroot.keywords.length > 0 && (
                                      <div className="text-gray-500 hover:text-gray-700">
                                        {expandedSubgroups[`subroot-${groupIndex}-${subrootIndex}`] ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </div>
                                    )}
                                    <span className="text-sm text-gray-700">{subroot.name}</span>
                                    <Badge variant="outline" className="text-xs">{subroot.keywordCount.toLocaleString()} keywords</Badge>
                                  </div>
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

                            // Individual keyword rows (if subroot is expanded)
                            if (expandedSubgroups[`subroot-${groupIndex}-${subrootIndex}`] && subroot.keywords && subroot.keywords.length > 0) {
                              subroot.keywords.forEach((keyword: any, keywordIndex: number) => {
                                rows.push(
                                  <tr key={`keyword-${groupIndex}-${subrootIndex}-${keywordIndex}`} className="border-b bg-blue-50 hover:bg-blue-100">
                                    <td className="py-2 px-2 pl-16">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-600">{keyword.keyword}</span>
                                        {visibleMetrics.searchVolume && keyword.searchVolume > 0 && (
                                          <Badge variant="outline" className="text-xs bg-blue-100">
                                            {keyword.searchVolume.toLocaleString()} vol
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    {data.competitors?.map((comp: any, compIndex: number) => {
                                      const ownership = keyword.ownership?.[comp.asin] || 0
                                      
                                      return (
                                        <td key={compIndex} className="text-center py-2 px-2">
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
                          })
                        }
                        
                        return rows
                      })}
                    </tbody>
                  </table>
                    </div>
                  </FullscreenWrapper>
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
          {/* Overview Metrics - Standardized like Competitors tab */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {(getFilteredCompetitors().reduce((sum, c) => sum + (c.rating || 0), 0) / getFilteredCompetitors().length).toFixed(1)}★
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {getFilteredCompetitors().reduce((sum, c) => sum + (c.review_count || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(getFilteredCompetitors().reduce((sum, c) => sum + (c.review_count || 0), 0) / getFilteredCompetitors().length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Avg Reviews</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {(() => {
                  const competitors = getFilteredCompetitors()
                  const with5Star = competitors.filter(c => c.rating >= 4.5).length
                  return Math.round((with5Star / competitors.length) * 100)
                })()}%
              </div>
              <div className="text-sm text-gray-600">≥4.5★ Rating</div>
            </div>
          </div>

          {/* Rating Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Competitor ratings across the market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution by Range</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        const ratingBuckets = [
                          { range: '3.0-3.4', count: 0, color: '#dc2626', products: [] },
                          { range: '3.5-3.9', count: 0, color: '#ea580c', products: [] },
                          { range: '4.0-4.4', count: 0, color: '#ca8a04', products: [] },
                          { range: '4.5-5.0', count: 0, color: '#16a34a', products: [] }
                        ]
                        
                        getFilteredCompetitors().forEach(c => {
                          const rating = c.rating || 0
                          const productInfo = {
                            asin: c.asin,
                            title: c.title || c.name,
                            image: (() => {
                              if (c.image_urls) {
                                try {
                                  const urls = typeof c.image_urls === 'string' 
                                    ? c.image_urls.split(',').map((url: string) => url.trim())
                                    : c.image_urls
                                  const firstUrl = Array.isArray(urls) ? urls[0] : urls
                                  if (firstUrl && !firstUrl.startsWith('http')) {
                                    return `https://m.media-amazon.com/images/I/${firstUrl}`
                                  } else {
                                    return firstUrl
                                  }
                                } catch {
                                  return c.image || `https://placehold.co/40x40/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                                }
                              } else if (c.image) {
                                return c.image
                              }
                              return `https://placehold.co/40x40/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                            })()
                          }
                          
                          if (rating >= 3.0 && rating < 3.5) {
                            ratingBuckets[0].count++
                            ratingBuckets[0].products.push(productInfo)
                          }
                          else if (rating >= 3.5 && rating < 4.0) {
                            ratingBuckets[1].count++
                            ratingBuckets[1].products.push(productInfo)
                          }
                          else if (rating >= 4.0 && rating < 4.5) {
                            ratingBuckets[2].count++
                            ratingBuckets[2].products.push(productInfo)
                          }
                          else if (rating >= 4.5) {
                            ratingBuckets[3].count++
                            ratingBuckets[3].products.push(productInfo)
                          }
                        })
                        
                        return ratingBuckets
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                                <p className="font-medium">{data.range} Stars</p>
                                <p className="text-sm text-gray-600 mb-2">{data.count} products</p>
                                {data.products && data.products.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Products:</p>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                      {data.products.map((product, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <img 
                                            src={product.image}
                                            alt={product.title}
                                            className="w-8 h-8 object-cover rounded border flex-shrink-0"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement
                                              target.src = `https://placehold.co/32x32/E5E7EB/6B7280?text=${encodeURIComponent(product.asin || 'Product')}`
                                            }}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600 font-mono">{product.asin}</p>
                                            <p className="text-xs text-gray-500 truncate">{product.title}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          }
                          return null
                        }} />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scatter Plot */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Rating vs Review Count</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={getFilteredCompetitors().map(c => ({
                        rating: c.rating || 0,
                        reviewCount: c.review_count || 0,
                        asin: c.asin,
                        title: c.title || c.name,
                        image: (() => {
                          if (c.image_urls) {
                            try {
                              const urls = typeof c.image_urls === 'string' 
                                ? c.image_urls.split(',').map((url: string) => url.trim())
                                : c.image_urls
                              const firstUrl = Array.isArray(urls) ? urls[0] : urls
                              if (firstUrl && !firstUrl.startsWith('http')) {
                                return `https://m.media-amazon.com/images/I/${firstUrl}`
                              } else {
                                return firstUrl
                              }
                            } catch {
                              return c.image || `https://placehold.co/100x100/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                            }
                          } else if (c.image) {
                            return c.image
                          }
                          return `https://placehold.co/100x100/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                        })()
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="rating" 
                          name="Rating"
                          domain={[2.5, 5]}
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="reviewCount" 
                          name="Review Count"
                          tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}K` : value.toString()}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                                  <div className="flex items-start space-x-3">
                                    <img 
                                      src={data.image}
                                      alt={data.title}
                                      className="w-16 h-16 object-cover rounded border"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = `https://placehold.co/64x64/E5E7EB/6B7280?text=${encodeURIComponent(data.asin || 'Product')}`
                                      }}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900 line-clamp-2">{data.title}</p>
                                      <p className="text-xs text-gray-500 font-mono mt-1">{data.asin}</p>
                                      <div className="flex items-center space-x-3 mt-2 text-xs">
                                        <span className="font-medium">{data.rating?.toFixed(1)}★</span>
                                        <span className="text-gray-600">{data.reviewCount?.toLocaleString()} reviews</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Scatter dataKey="reviewCount" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
              <div className="grid grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution by Volume Range</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(() => {
                        const competitors = getFilteredCompetitors()
                        const reviewCounts = competitors.map(c => c.review_count || 0).sort((a, b) => a - b)
                        
                        // Create smart buckets based on actual data distribution
                        let volumeBuckets = []
                        
                        if (reviewCounts.length === 0) {
                          return []
                        }
                        
                        const min = reviewCounts[0]
                        const max = reviewCounts[reviewCounts.length - 1]
                        
                        // Create smart ranges based on data distribution
                        if (max <= 100) {
                          volumeBuckets = [
                            { range: '0-50', count: 0, color: '#fca5a5', products: [] },
                            { range: '51-100', count: 0, color: '#fed7aa', products: [] }
                          ]
                        } else if (max <= 500) {
                          volumeBuckets = [
                            { range: '0-100', count: 0, color: '#fca5a5', products: [] },
                            { range: '101-250', count: 0, color: '#fed7aa', products: [] },
                            { range: '251-500', count: 0, color: '#d9f99d', products: [] }
                          ]
                        } else if (max <= 2000) {
                          volumeBuckets = [
                            { range: '0-250', count: 0, color: '#fca5a5', products: [] },
                            { range: '251-500', count: 0, color: '#fed7aa', products: [] },
                            { range: '501-1K', count: 0, color: '#d9f99d', products: [] },
                            { range: '1K-2K', count: 0, color: '#86efac', products: [] }
                          ]
                        } else if (max <= 10000) {
                          volumeBuckets = [
                            { range: '0-1K', count: 0, color: '#fca5a5', products: [] },
                            { range: '1K-3K', count: 0, color: '#fed7aa', products: [] },
                            { range: '3K-6K', count: 0, color: '#d9f99d', products: [] },
                            { range: '6K-10K', count: 0, color: '#86efac', products: [] }
                          ]
                        } else {
                          volumeBuckets = [
                            { range: '0-1K', count: 0, color: '#fca5a5', products: [] },
                            { range: '1K-5K', count: 0, color: '#fed7aa', products: [] },
                            { range: '5K-15K', count: 0, color: '#d9f99d', products: [] },
                            { range: '15K+', count: 0, color: '#86efac', products: [] }
                          ]
                        }
                        
                        // Categorize competitors into buckets
                        competitors.forEach(c => {
                          const reviews = c.review_count || 0
                          const productInfo = {
                            asin: c.asin,
                            title: c.title || c.name,
                            image: (() => {
                              if (c.image_urls) {
                                try {
                                  const urls = typeof c.image_urls === 'string' 
                                    ? c.image_urls.split(',').map((url: string) => url.trim())
                                    : c.image_urls
                                  const firstUrl = Array.isArray(urls) ? urls[0] : urls
                                  if (firstUrl && !firstUrl.startsWith('http')) {
                                    return `https://m.media-amazon.com/images/I/${firstUrl}`
                                  } else {
                                    return firstUrl
                                  }
                                } catch {
                                  return c.image || `https://placehold.co/40x40/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                                }
                              } else if (c.image) {
                                return c.image
                              }
                              return `https://placehold.co/40x40/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                            })()
                          }
                          
                          if (max <= 100) {
                            if (reviews <= 50) {
                              volumeBuckets[0].count++
                              volumeBuckets[0].products.push(productInfo)
                            } else {
                              volumeBuckets[1].count++
                              volumeBuckets[1].products.push(productInfo)
                            }
                          } else if (max <= 500) {
                            if (reviews <= 100) {
                              volumeBuckets[0].count++
                              volumeBuckets[0].products.push(productInfo)
                            } else if (reviews <= 250) {
                              volumeBuckets[1].count++
                              volumeBuckets[1].products.push(productInfo)
                            } else {
                              volumeBuckets[2].count++
                              volumeBuckets[2].products.push(productInfo)
                            }
                          } else if (max <= 2000) {
                            if (reviews <= 250) {
                              volumeBuckets[0].count++
                              volumeBuckets[0].products.push(productInfo)
                            } else if (reviews <= 500) {
                              volumeBuckets[1].count++
                              volumeBuckets[1].products.push(productInfo)
                            } else if (reviews <= 1000) {
                              volumeBuckets[2].count++
                              volumeBuckets[2].products.push(productInfo)
                            } else {
                              volumeBuckets[3].count++
                              volumeBuckets[3].products.push(productInfo)
                            }
                          } else if (max <= 10000) {
                            if (reviews <= 1000) {
                              volumeBuckets[0].count++
                              volumeBuckets[0].products.push(productInfo)
                            } else if (reviews <= 3000) {
                              volumeBuckets[1].count++
                              volumeBuckets[1].products.push(productInfo)
                            } else if (reviews <= 6000) {
                              volumeBuckets[2].count++
                              volumeBuckets[2].products.push(productInfo)
                            } else {
                              volumeBuckets[3].count++
                              volumeBuckets[3].products.push(productInfo)
                            }
                          } else {
                            if (reviews < 1000) {
                              volumeBuckets[0].count++
                              volumeBuckets[0].products.push(productInfo)
                            } else if (reviews < 5000) {
                              volumeBuckets[1].count++
                              volumeBuckets[1].products.push(productInfo)
                            } else if (reviews < 15000) {
                              volumeBuckets[2].count++
                              volumeBuckets[2].products.push(productInfo)
                            } else {
                              volumeBuckets[3].count++
                              volumeBuckets[3].products.push(productInfo)
                            }
                          }
                        })
                        
                        // Filter out empty buckets
                        return volumeBuckets.filter(bucket => bucket.count > 0)
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                                <p className="font-medium">{data.range} Reviews</p>
                                <p className="text-sm text-gray-600 mb-2">{data.count} products</p>
                                {data.products && data.products.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Products:</p>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                      {data.products.map((product, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <img 
                                            src={product.image}
                                            alt={product.title}
                                            className="w-8 h-8 object-cover rounded border flex-shrink-0"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement
                                              target.src = `https://placehold.co/32x32/E5E7EB/6B7280?text=${encodeURIComponent(product.asin || 'Product')}`
                                            }}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600 font-mono">{product.asin}</p>
                                            <p className="text-xs text-gray-500 truncate">{product.title}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          }
                          return null
                        }} />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scatter Plot */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Reviews vs Price Analysis</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={getFilteredCompetitors().map(c => ({
                        reviewCount: c.review_count || 0,
                        price: c.price || 0,
                        asin: c.asin,
                        title: c.title || c.name,
                        rating: c.rating || 0,
                        image: (() => {
                          if (c.image_urls) {
                            try {
                              const urls = typeof c.image_urls === 'string' 
                                ? c.image_urls.split(',').map((url: string) => url.trim())
                                : c.image_urls
                              const firstUrl = Array.isArray(urls) ? urls[0] : urls
                              if (firstUrl && !firstUrl.startsWith('http')) {
                                return `https://m.media-amazon.com/images/I/${firstUrl}`
                              } else {
                                return firstUrl
                              }
                            } catch {
                              return c.image || `https://placehold.co/100x100/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                            }
                          } else if (c.image) {
                            return c.image
                          }
                          return `https://placehold.co/100x100/E5E7EB/6B7280?text=${encodeURIComponent(c.asin || 'Product')}`
                        })()
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="reviewCount" 
                          name="Review Count"
                          tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}K` : value.toString()}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="price" 
                          name="Price"
                          tickFormatter={(value) => `$${value.toFixed(0)}`}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
                                  <div className="flex items-start space-x-3">
                                    <img 
                                      src={data.image}
                                      alt={data.title}
                                      className="w-16 h-16 object-cover rounded border"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = `https://placehold.co/64x64/E5E7EB/6B7280?text=${encodeURIComponent(data.asin || 'Product')}`
                                      }}
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900 line-clamp-2">{data.title}</p>
                                      <p className="text-xs text-gray-500 font-mono mt-1">{data.asin}</p>
                                      <div className="flex items-center space-x-3 mt-2 text-xs">
                                        <span className="font-medium">{data.rating?.toFixed(1)}★</span>
                                        <span className="text-gray-600">{data.reviewCount?.toLocaleString()} reviews</span>
                                        <span className="font-medium text-green-600">${data.price?.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Scatter dataKey="price" fill="#10b981" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Insights - Moved Above Table */}
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
                        // Calculate review velocity using historical data
                        const velocity = calculateReviewVelocity(competitor.asin, data.reviewHistory)
                        
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
                                ~{velocity.toLocaleString()}/mo
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
        </div>
      )}

      {/* Pricing Strategy Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Overview Metrics - Following same pattern as review tab */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                ${(data.competitors?.reduce((sum: any, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Avg Price</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.min(...(data.competitors?.map((c: any) => c.price || 0) || [0])).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Lowest Price</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                ${Math.max(...(data.competitors?.map((c: any) => c.price || 0) || [0])).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Highest Price</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {(() => {
                  const avgPrice = data.competitors?.reduce((sum: any, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)
                  const aggressive = data.competitors?.filter((c: any) => (c.price || 0) < avgPrice * 0.8).length || 0
                  return Math.round((aggressive / (data.competitors?.length || 1)) * 100)
                })()}%
              </div>
              <div className="text-sm text-gray-600">Price Aggressive</div>
            </div>
          </div>

          {/* Price Distribution Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Price Distribution</CardTitle>
              <CardDescription>Individual competitor prices with ASIN details (hover for info)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    data={generatePriceScatterData(data.competitors)}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[1, data.competitors?.length || 10]}
                      label={{ value: 'Competitor Index', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={['dataMin - 5', 'dataMax + 5']}
                      label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white border rounded-lg shadow-lg p-3 max-w-xs">
                              <div className="font-medium text-gray-900 mb-1">
                                ASIN: {data.asin}
                              </div>
                              <div className="text-sm text-gray-700 mb-2">
                                {data.title}
                              </div>
                              <div className="text-lg font-bold text-green-600 mb-1">
                                ${data.y.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>Rating: {data.rating.toFixed(1)}★</div>
                                <div>Reviews: {data.reviewCount.toLocaleString()}</div>
                                <div>Brand: {data.brand}</div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="y">
                      {generatePriceScatterData(data.competitors).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center mt-4 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Budget (&lt; 80% avg)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Mid-range</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Premium (&gt; 120% avg)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Pricing Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Pricing Details</CardTitle>
              <CardDescription>Detailed pricing information for each competitor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Product</th>
                      <th className="text-right py-3 px-2">Current Price</th>
                      <th className="text-center py-3 px-2">Price Tier</th>
                      <th className="text-center py-3 px-2">Lightning Deal</th>
                      <th className="text-center py-3 px-2">Coupons</th>
                      <th className="text-center py-3 px-2">Price Aggressiveness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.competitors?.map((competitor: any, index: number) => {
                      const avgPrice = data.competitors?.reduce((sum: any, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)
                      const priceTier = getPriceTier(competitor.price || 0, avgPrice)
                      const aggressiveness = getPriceAggressiveness(competitor.price || 0, avgPrice)
                      
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-3">
                              {competitor.image && (
                                <Image
                                  src={competitor.image}
                                  alt={competitor.title}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium text-sm truncate max-w-[200px]">
                                  {competitor.title || `Product ${index + 1}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {competitor.rating}★ ({competitor.review_count?.toLocaleString()} reviews)
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-2 font-bold text-green-600">
                            ${(competitor.price || 0).toFixed(2)}
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={
                              priceTier.includes('Below') ? 'secondary' : 
                              priceTier.includes('Above') ? 'default' : 'outline'
                            }>
                              {priceTier}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={competitor.has_lightning_deal ? 'destructive' : 'outline'}>
                              {competitor.lightning_deal_count || competitor.has_lightning_deal ? 
                                (competitor.lightning_deal_count || 1) : 0}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={competitor.has_coupon || competitor.coupon_discount ? 'default' : 'outline'}>
                              {(() => {
                                if (competitor.coupon_count) return competitor.coupon_count
                                if (competitor.has_coupon || competitor.coupon_discount) return 1
                                return 0
                              })()}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge variant="outline" className={`${aggressiveness.color} ${aggressiveness.bgColor}`}>
                              {aggressiveness.level}
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

          {/* Pricing Aggressiveness Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Aggressiveness Analysis</CardTitle>
              <CardDescription>Understanding competitor pricing strategies and market positioning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Aggressive Competitors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Most Price-Aggressive Competitors</h4>
                  <div className="space-y-3">
                    {data.competitors
                      ?.map((c: any, index: number) => ({
                        ...c,
                        index,
                        ratio: (c.price || 0) / (data.competitors?.reduce((sum: any, comp: any) => sum + (comp.price || 0), 0) / (data.competitors?.length || 1))
                      }))
                      .filter((c: any) => c.ratio < 0.9)
                      .sort((a: any, b: any) => a.ratio - b.ratio)
                      .slice(0, 3)
                      .map((competitor: any) => (
                        <div key={competitor.index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-3">
                            {competitor.image && (
                              <Image
                                src={competitor.image}
                                alt={competitor.title}
                                width={32}
                                height={32}
                                className="rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium truncate max-w-[150px]">
                                {competitor.title || `Product ${competitor.index + 1}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {((1 - competitor.ratio) * 100).toFixed(0)}% below average
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">${(competitor.price || 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{competitor.rating}★</div>
                          </div>
                        </div>
                      )) || []
                    }
                  </div>
                </div>

                {/* Market Insights */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Market Price Positioning Insights</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-700">Price Competition Level</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          const avgPrice = data.competitors?.reduce((sum: any, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)
                          const aggressive = data.competitors?.filter((c: any) => (c.price || 0) < avgPrice * 0.8).length || 0
                          const total = data.competitors?.length || 1
                          const percentage = (aggressive / total) * 100
                          
                          if (percentage > 40) return "High - Many competitors are pricing aggressively below market average"
                          if (percentage > 20) return "Moderate - Some competitors are using aggressive pricing strategies"
                          return "Low - Most competitors are pricing at or above market average"
                        })()}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">Pricing Opportunity</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          const avgPrice = data.competitors?.reduce((sum: any, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)
                          const valueChampions = data.competitors?.filter((c: any) => (c.price || 0) < avgPrice * 0.9 && (c.rating || 0) >= 4.0).length || 0
                          
                          if (valueChampions === 0) return "High opportunity to become a value champion with competitive pricing and quality"
                          if (valueChampions <= 2) return "Moderate opportunity to compete in the value segment"
                          return "Saturated value segment - consider premium positioning or differentiation"
                        })()}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-700">Recommended Strategy</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          const avgPrice = data.competitors?.reduce((sum: any, c: any) => sum + (c.price || 0), 0) / (data.competitors?.length || 1)
                          const recommendedPrice = avgPrice * 0.85
                          return `Price competitively at ~$${recommendedPrice.toFixed(2)} (15% below average) to capture market share while maintaining profitability`
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price vs Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Price vs Performance Matrix</CardTitle>
              <CardDescription>Competitor positioning by price and rating performance</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amazon Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          
          {/* Input ASIN Container with Marketplace Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Your Product ASIN & Marketplace</span>
              </CardTitle>
              <CardDescription>
                Enter your ASIN and select marketplace to see how it would appear in search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <Input
                    type="text"
                    value={yourAsin}
                    onChange={(e) => setYourAsin(e.target.value)}
                    placeholder="Enter your ASIN (e.g., B08XXXXX)"
                    className="flex-1"
                  />
                  <Select value={marketplace} onValueChange={setMarketplace}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">🇺🇸 United States</SelectItem>
                      <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                      <SelectItem value="de">🇩🇪 Germany</SelectItem>
                      <SelectItem value="fr">🇫🇷 France</SelectItem>
                      <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      if (yourAsin.trim()) {
                        // Insert the ASIN into a random position in top 5
                        const randomPosition = Math.floor(Math.random() * Math.min(5, data.competitors.length))
                        console.log(`Inserting ASIN ${yourAsin} at position ${randomPosition + 1}`)
                        // This will trigger re-rendering of the simulator
                        setSimulationRun(true)
                      }
                    }}
                    disabled={!yourAsin.trim()}
                  >
                    Insert into Results
                  </Button>
                </div>
                {yourAsin && (
                  <div className="mt-2 text-sm text-gray-600">
                    Your ASIN will be randomly placed in the top 5 search results for {marketplace.toUpperCase()} marketplace
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amazon Search Results - Direct Display */}
          {data.competitors && data.competitors.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Amazon Header - Simplified */}
              <div className="bg-[#131921] p-3">
                <div className="flex items-center gap-4">
                  <div className="text-white font-bold text-xl">amazon</div>
                  <div className="flex-1">
                    <div className="flex">
                      <select className="px-3 py-2 text-sm bg-gray-100 border-0 rounded-l">
                        <option>All</option>
                      </select>
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border-0 bg-white"
                        placeholder="Search for products..."
                      />
                      <button 
                        className="bg-[#febd69] px-6 py-2 rounded-r hover:bg-[#f3a847] transition-colors"
                        onClick={runSimulation}
                      >
                        <Search className="h-5 w-5 text-gray-800" />
                      </button>
                    </div>
                  </div>
                  <div className="text-white text-sm">Returns & Orders</div>
                  <div className="text-white flex items-center">
                    <span className="text-xs">0</span>
                    <ShoppingCart className="ml-1 h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Results count bar */}
              <div className="px-4 py-2 text-sm text-[#0F1111] border-b bg-gray-50">
                1-{data.competitors.length} of over 1,000 results for <span className="text-[#C7511F] font-medium">"{searchTerm || 'sea moss supplement'}"</span>
              </div>

              {/* Products List - 5 per row grid */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-5 gap-4">
                  {(() => {
                    // Prepare the competitors list, potentially inserting user's ASIN
                    let competitorsToShow = [...data.competitors]
                    
                    // If user entered an ASIN and clicked "Insert into Results", insert it randomly in top 5
                    if (yourAsin.trim() && simulationRun) {
                      const randomPosition = Math.floor(Math.random() * Math.min(5, competitorsToShow.length))
                      const userProduct = {
                        asin: yourAsin,
                        title: `Your Product - ${yourAsin}`,
                        name: `Your Product - ${yourAsin}`,
                        brand: 'Your Brand',
                        price: 25.99, // Default price
                        rating: 4.2, // Default rating
                        review_count: 1250, // Default review count
                        image_urls: 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=YOUR+PRODUCT',
                        isUserProduct: true // Flag to identify user's product
                      }
                      competitorsToShow.splice(randomPosition, 0, userProduct)
                    }

                    return competitorsToShow.map((competitor: any, index: number) => {
                    // Get the product image URL
                    let imageUrl = null
                    if (competitor.image_urls) {
                      try {
                        const urls = typeof competitor.image_urls === 'string' 
                          ? competitor.image_urls.split(',').map((url: string) => url.trim())
                          : competitor.image_urls
                        const firstUrl = Array.isArray(urls) ? urls[0] : urls
                        if (firstUrl && !firstUrl.startsWith('http')) {
                          imageUrl = `https://m.media-amazon.com/images/I/${firstUrl}`
                        } else {
                          imageUrl = firstUrl
                        }
                      } catch {
                        imageUrl = competitor.image
                      }
                    } else if (competitor.image) {
                      imageUrl = competitor.image
                    }

                    return (
                      <div 
                        key={competitor.asin}
                        className={`p-3 rounded-lg hover:shadow-md transition-shadow flex flex-col h-full ${
                          competitor.isUserProduct 
                            ? 'bg-green-50 border-2 border-green-300 shadow-lg' 
                            : 'bg-white'
                        }`}
                      >
                        {/* User Product Badge */}
                        {competitor.isUserProduct && (
                          <div className="mb-2">
                            <Badge className="bg-green-600 text-white text-xs">YOUR PRODUCT</Badge>
                          </div>
                        )}
                        {/* Product Image - Top */}
                        <div className="w-full aspect-square bg-white border border-gray-200 flex items-center justify-center rounded mb-3 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={competitor.title || competitor.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `https://placehold.co/300x300/FFFFFF/6B7280?text=${encodeURIComponent(competitor.brand || 'Product')}`
                              }}
                            />
                          ) : (
                            <div className="text-center p-4">
                              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <span className="text-xs text-gray-500">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details - Flex grow to push button down */}
                        <div className="flex flex-col flex-grow space-y-2">
                          {/* Title - Full display */}
                          <h3 className="text-sm text-[#0F1111] hover:text-[#C7511F] cursor-pointer font-normal leading-tight">
                            {competitor.title || competitor.name}
                          </h3>
                          
                          {/* Brand */}
                          {competitor.brand && (
                            <div className="text-xs text-gray-600 truncate">{competitor.brand}</div>
                          )}
                          
                          {/* Rating - Compact */}
                          <div className="flex items-center">
                            <div className="flex text-[#FFA41C] text-xs mr-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(competitor.rating || 0)
                                      ? 'fill-current'
                                      : 'fill-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[#007185] text-xs">{(competitor.rating || 0).toFixed(1)}</span>
                            <span className="text-xs text-gray-500 ml-1">({(competitor.review_count || 0).toLocaleString()})</span>
                          </div>
                          
                          {/* Price */}
                          <div className="text-lg font-medium text-[#0F1111]">
                            ${(competitor.price || 0).toFixed(2)}
                          </div>
                          
                          {/* Badges - Compact with flex-grow to push button down */}
                          <div className="flex flex-col gap-1 flex-grow">
                            {/* Prime Badge - Always show */}
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs bg-[#FF9900] text-white px-1 py-0">Prime</Badge>
                              <span className="text-xs text-gray-600">FREE delivery</span>
                            </div>
                            
                            {/* Best Seller Badge */}
                            {competitor.rating >= 4.5 && competitor.review_count > 5000 && (
                              <Badge variant="secondary" className="text-xs bg-[#FF6000] text-white px-1 py-0 w-fit">
                                #1 Best Seller
                              </Badge>
                            )}
                          </div>
                          
                          {/* Add to Cart Button - At bottom */}
                          <button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-1.5 px-3 rounded text-xs font-medium transition-colors w-full mt-auto">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    )
                  })})()}
                </div>
              </div>
            </div>
          )}

          {/* Conversion Rate Analysis */}
          {yourAsin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Conversion Rate Analysis</span>
                </CardTitle>
                <CardDescription>
                  Compare your ASIN against competitors to maximize conversion rate based on rating, review count, and price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Analysis Overview */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {(() => {
                          // Calculate predicted conversion rate for user's product
                          const userProduct = {
                            rating: 4.2,
                            review_count: 1250,
                            price: 25.99
                          }
                          
                          // Simple conversion rate formula based on Amazon factors
                          const ratingScore = (userProduct.rating / 5) * 30 // Max 30 points
                          const reviewScore = Math.min((userProduct.review_count / 10000) * 25, 25) // Max 25 points
                          const priceScore = data.competitors?.length > 0 ? 
                            (1 - (userProduct.price - Math.min(...data.competitors.map((c: any) => c.price || 0))) / 
                             (Math.max(...data.competitors.map((c: any) => c.price || 0)) - Math.min(...data.competitors.map((c: any) => c.price || 0)))) * 20 : 20 // Max 20 points
                          
                          const totalScore = ratingScore + reviewScore + priceScore + 25 // Base 25 points
                          return Math.round(totalScore) + '%'
                        })()}
                      </div>
                      <div className="text-sm text-gray-600">Predicted Conversion</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">4.2★</div>
                      <div className="text-sm text-gray-600">Your Rating</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">1,250</div>
                      <div className="text-sm text-gray-600">Your Reviews</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">$25.99</div>
                      <div className="text-sm text-gray-600">Your Price</div>
                    </div>
                  </div>

                  {/* Competitor Comparison */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Conversion Rate Ranking</h4>
                    <div className="space-y-3">
                      {(() => {
                        // Add user product to comparison
                        const userProduct = {
                          asin: yourAsin,
                          title: `Your Product - ${yourAsin}`,
                          rating: 4.2,
                          review_count: 1250,
                          price: 25.99,
                          isUserProduct: true
                        }

                        const allProducts = [userProduct, ...data.competitors.slice(0, 9)] // Top 10 total

                        // Calculate conversion scores and sort
                        const scoredProducts = allProducts.map(product => {
                          const ratingScore = ((product.rating || 0) / 5) * 30
                          const reviewScore = Math.min(((product.review_count || 0) / 10000) * 25, 25)
                          const avgPrice = allProducts.reduce((sum, p) => sum + (p.price || 0), 0) / allProducts.length
                          const priceScore = avgPrice > 0 ? (1 - Math.abs((product.price || 0) - avgPrice) / avgPrice) * 20 : 20
                          
                          const totalScore = ratingScore + reviewScore + priceScore + 25
                          
                          return {
                            ...product,
                            conversionScore: Math.round(totalScore)
                          }
                        }).sort((a, b) => b.conversionScore - a.conversionScore)

                        return scoredProducts.map((product, index) => (
                          <div 
                            key={product.asin}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              product.isUserProduct 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                #{index + 1}
                              </div>
                              <div>
                                <div className={`font-medium ${product.isUserProduct ? 'text-green-800' : 'text-gray-900'}`}>
                                  {product.isUserProduct ? 'Your Product' : (product.title?.substring(0, 40) + '...' || 'Product')}
                                </div>
                                <div className="text-xs text-gray-500">{product.asin}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <div className="font-medium">{(product.rating || 0).toFixed(1)}★</div>
                                <div className="text-xs text-gray-500">Rating</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{(product.review_count || 0).toLocaleString()}</div>
                                <div className="text-xs text-gray-500">Reviews</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">${(product.price || 0).toFixed(2)}</div>
                                <div className="text-xs text-gray-500">Price</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-bold text-lg ${
                                  product.conversionScore >= 80 ? 'text-green-600' :
                                  product.conversionScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {product.conversionScore}%
                                </div>
                                <div className="text-xs text-gray-500">Conv. Rate</div>
                              </div>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Optimization Recommendations
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Aim for 4.5+ star rating to compete with top performers</li>
                      <li>• Target 5,000+ reviews for social proof and conversion boost</li>
                      <li>• Consider competitive pricing within ±15% of market average</li>
                      <li>• Focus on review velocity and quality to improve conversion rate</li>
                    </ul>
                  </div>
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