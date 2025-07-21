'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Search,
  ChevronDown,
  ArrowRight,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Target,
  DollarSign,
  Zap,
  AlertCircle,
  ChevronUp,
  Users,
  Sparkles,
  Eye,
  List,
  Activity,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KeywordsAnalysisProps {
  data: any
  searchTermsData?: any[]
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

// Keyword Pivot Table Component
const KeywordPivotTable = ({ 
  keywordHierarchy, 
  searchTerm, 
  minKeywordsPerRoot,
  minKeywordsPerSubRoot
}: { 
  keywordHierarchy: any
  searchTerm: string
  minKeywordsPerRoot: number
  minKeywordsPerSubRoot: number
}) => {
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set())
  const [expandedSubroots, setExpandedSubroots] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const toggleRoot = (rootName: string) => {
    const newExpanded = new Set(expandedRoots)
    if (newExpanded.has(rootName)) {
      newExpanded.delete(rootName)
      const newExpandedSubroots = new Set(expandedSubroots)
      Object.keys(keywordHierarchy[rootName].subroots).forEach(subroot => {
        newExpandedSubroots.delete(`${rootName}-${subroot}`)
      })
      setExpandedSubroots(newExpandedSubroots)
    } else {
      newExpanded.add(rootName)
    }
    setExpandedRoots(newExpanded)
  }

  const toggleSubroot = (rootName: string, subrootName: string) => {
    const key = `${rootName}-${subrootName}`
    const newExpanded = new Set(expandedSubroots)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSubroots(newExpanded)
  }

  // Financial calculation constants
  const COGS_PERCENT = 30 // 30% cost of goods sold
  const FBA_FEES_PERCENT = 19 // 19% Amazon FBA fees average

  // Calculate additional metrics
  const calculateMetrics = (data: any) => {
    const revenue = data.totalRevenue || 0
    const clicks = data.totalClicks || 0
    const orders = data.totalOrders || 0
    const cpc = parseFloat(data.avgCPC || 0)
    const price = parseFloat(data.avgSellingPrice || 29.99)
    
    // Calculate Expected ACOS (Advertising Cost of Sale)
    const adSpend = cpc * clicks
    const expectedAcos = revenue > 0 ? (adSpend / revenue) * 100 : 30
    
    // Calculate Net Profit
    const netProfitPercent = 100 - COGS_PERCENT - FBA_FEES_PERCENT - expectedAcos
    const netProfit = revenue * (netProfitPercent / 100)
    
    // Calculate uniqueness/relevancy (simplified - would need ASIN data for accurate calc)
    const relevancy = Math.min(75, Math.max(25, 50 + (data.keywordCount * 0.5)))
    const uniqueAsins = Math.min(10, Math.max(1, Math.round(data.keywordCount / 20)))
    
    return {
      netProfit,
      expectedAcos,
      netProfitPercent,
      relevancy,
      uniqueAsins
    }
  }

  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="min-w-full text-sm relative">
        <thead className="bg-gray-50 sticky top-0 z-20">
          <tr>
            <th className="sticky left-0 bg-gray-50 z-30 text-left py-3 px-4 font-medium text-gray-900 whitespace-nowrap border-r border-gray-200 min-w-[200px]">
              <span>KEYWORD GROUP</span>
            </th>
            {/* Add sortable/filterable UI to all columns */}
            {[
              { label: 'RELEVANCY\n%', key: 'relevancy' },
              { label: 'UNIQUE\nASINS', key: 'uniqueAsins' },
              { label: '# OF\nKEYWORDS', key: 'keywords' },
              { label: 'EST.\nMONTHLY\nREVENUE', key: 'revenue' },
              { label: 'EST.\nMONTHLY\nNET PROFIT', key: 'netProfit' },
              { label: 'EST.\nMONTHLY\nCLICKS', key: 'clicks' },
              { label: 'EST.\nMONTHLY\nORDERS', key: 'orders' },
              { label: 'EST.\nCVR', key: 'cvr' },
              { label: 'EST.\nCPC', key: 'cpc' }
            ].map(({ label, key }) => (
              <th key={key} className="text-center py-3 px-3 font-medium text-gray-900 whitespace-nowrap">
                <span dangerouslySetInnerHTML={{ __html: label.replace(/\n/g, '<br/>') }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(() => {
            const filteredData = Object.entries(keywordHierarchy)
              .filter(([rootName, rootData]: [string, any]) => {
                // Apply minimum keywords filter
                if (rootData.keywordCount < minKeywordsPerRoot) return false
                // Apply search filter
                if (searchTerm && !rootName.toLowerCase().includes(searchTerm.toLowerCase())) return false
                return true
              })
              .sort(([, a], [, b]) => (b as any).totalRevenue - (a as any).totalRevenue)
            
            const totalPages = Math.ceil(filteredData.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)
            
            return paginatedData.map(([rootName, rootData]: [string, any]) => {
            const metrics = calculateMetrics(rootData)
            return (
              <React.Fragment key={rootName}>
                {/* Root Level */}
                <tr className="border-b bg-white hover:bg-gray-50 cursor-pointer" onClick={() => toggleRoot(rootName)}>
                  <td className="sticky left-0 bg-white z-10 py-3 px-4 border-r border-gray-200">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {expandedRoots.has(rootName) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{rootName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>{metrics.relevancy.toFixed(0)}%</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>{metrics.uniqueAsins}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span className="font-medium">{(rootData.keywordCount || 0).toLocaleString('en-US')}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>
                      ${rootData.totalRevenue >= 1000000 
                        ? (rootData.totalRevenue / 1000000).toFixed(2) + 'M'
                        : (rootData.totalRevenue / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'K'
                      }
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>${(metrics.netProfit / 1000).toFixed(0)}K</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>{(rootData.totalClicks / 1000).toFixed(1)}K</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>{(rootData.totalOrders / 1000).toFixed(1)}K</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>{parseFloat(rootData.avgConversionRate).toFixed(0)}%</span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span>${rootData.avgCPC}</span>
                  </td>
                </tr>

                {/* Subroot Level */}
                {expandedRoots.has(rootName) && Object.entries(rootData.subroots)
                  .filter(([, subrootData]: [string, any]) => (subrootData.keywordCount || subrootData.keywords?.length || 0) >= minKeywordsPerSubRoot)
                  .sort(([, a], [, b]) => (b as any).totalRevenue - (a as any).totalRevenue)
                  .map(([subrootName, subrootData]: [string, any]) => {
                  const subrootMetrics = calculateMetrics(subrootData)
                  return (
                    <React.Fragment key={`${rootName}-${subrootName}`}>
                      <tr className="border-b bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleSubroot(rootName, subrootName)}>
                        <td className="sticky left-0 bg-gray-50 z-10 py-3 px-4 border-r border-gray-200">
                          <div className="flex items-center">
                            <div className="ml-8 mr-2">
                              {expandedSubroots.has(`${rootName}-${subrootName}`) ? (
                                <ChevronDown className="h-3 w-3 text-gray-500" />
                              ) : (
                                <ArrowRight className="h-3 w-3 text-gray-500" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700">{subrootName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>{subrootMetrics.relevancy.toFixed(0)}%</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>{subrootMetrics.uniqueAsins}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>{(subrootData.keywordCount || 0).toLocaleString('en-US')}</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>${(subrootData.totalRevenue / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>${(subrootMetrics.netProfit / 1000).toFixed(0)}K</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>{(subrootData.totalClicks / 1000).toFixed(1)}K</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>{(subrootData.totalOrders / 1000).toFixed(1)}K</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>{parseFloat(subrootData.avgConversionRate).toFixed(0)}%</span>
                        </td>
                        <td className="py-3 px-3 text-center text-sm">
                          <span>${subrootData.avgCPC}</span>
                        </td>
                      </tr>

                      {/* Leaf Keywords */}
                      {expandedSubroots.has(`${rootName}-${subrootName}`) && subrootData.keywords
                        .sort((a: any, b: any) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
                        .map((keyword: any, index: number) => {
                        const keywordMetrics = {
                          revenue: keyword.monthlyRevenue || 0,
                          clicks: keyword.monthlyClicks || 0,
                          orders: keyword.monthlyOrders || 0,
                          cpc: keyword.cpc || 0,
                          price: keyword.sellingPrice || 29.99,
                          adSpend: (keyword.cpc || 0) * (keyword.monthlyClicks || 0),
                          expectedAcos: keyword.monthlyRevenue > 0 ? ((keyword.cpc || 0) * (keyword.monthlyClicks || 0) / keyword.monthlyRevenue) * 100 : 30,
                          netProfitPercent: 100 - COGS_PERCENT - FBA_FEES_PERCENT - (keyword.monthlyRevenue > 0 ? ((keyword.cpc || 0) * (keyword.monthlyClicks || 0) / keyword.monthlyRevenue) * 100 : 30),
                        }
                        keywordMetrics.netProfit = keywordMetrics.revenue * (keywordMetrics.netProfitPercent / 100)
                        
                        return (
                          <tr key={`${rootName}-${subrootName}-${index}`} className="border-b hover:bg-gray-50">
                            <td className="sticky left-0 bg-white z-10 py-2 px-4 border-r border-gray-200">
                              <div className="ml-16">
                                <span className="text-sm text-gray-600">{keyword.keyword}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center text-sm text-gray-500">-</td>
                            <td className="py-2 px-3 text-center text-sm text-gray-500">1</td>
                            <td className="py-2 px-3 text-center text-sm text-gray-500">1</td>
                            <td className="py-2 px-3 text-center text-sm">
                              <span>${keywordMetrics.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </td>
                            <td className="py-2 px-3 text-center text-sm">
                              <span>${keywordMetrics.netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </td>
                            <td className="py-2 px-3 text-center text-sm">
                              <span>{keywordMetrics.clicks.toLocaleString('en-US')}</span>
                            </td>
                            <td className="py-2 px-3 text-center text-sm">
                              <span>{keywordMetrics.orders.toLocaleString('en-US')}</span>
                            </td>
                            <td className="py-2 px-3 text-center text-sm">
                              <span>{parseFloat(keyword.conversionRate).toFixed(0)}%</span>
                            </td>
                            <td className="py-2 px-3 text-center text-sm">
                              <span>${keywordMetrics.cpc.toFixed(2)}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            )
          })
          })()}
        </tbody>
      </table>
    </div>
    
    {/* Pagination */}
    {(() => {
      const filteredData = Object.entries(keywordHierarchy)
        .filter(([rootName, rootData]: [string, any]) => {
          if (rootData.keywordCount < minKeywordsPerRoot) return false
          if (searchTerm && !rootName.toLowerCase().includes(searchTerm.toLowerCase())) return false
          return true
        })
      const totalPages = Math.ceil(filteredData.length / itemsPerPage)
      
      if (totalPages > 1) {
        return (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )
      }
      return null
    })()}
    </>
  )
}

// Fullscreen wrapper component for the table
const KeywordTableWithFullscreen = ({ children }: { children: React.ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div 
      ref={containerRef} 
      data-fullscreen-container
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto' : ''}`}
    >
      {children}
    </div>
  )
}

// Keyword Profit Analysis Component
const KeywordProfitAnalysis = ({ 
  keywordHierarchy, 
  minKeywordsPerRoot,
  minKeywordsPerSubRoot
}: { 
  keywordHierarchy: any
  minKeywordsPerRoot: number
  minKeywordsPerSubRoot: number
}) => {
  const [cogsPercent, setCogsPercent] = useState(30)

  // Calculate profitability metrics
  const calculateProfitability = (data: any) => {
    const revenue = data.totalRevenue || 0
    const avgCPC = parseFloat(data.avgCPC || '0')
    const avgConversionRate = parseFloat(data.avgConversionRate || '0') / 100
    const totalClicks = data.totalClicks || 0
    
    // Calculate ACOS
    const adSpend = avgCPC * totalClicks
    const acos = revenue > 0 ? (adSpend / revenue) * 100 : 0
    
    // Calculate net profit percentage
    const fbaFeesPercent = 19 // Fixed FBA fees
    const netProfitPercent = 100 - cogsPercent - fbaFeesPercent - acos
    const netProfit = revenue * (netProfitPercent / 100)
    
    return {
      revenue,
      acos,
      netProfitPercent,
      netProfit,
      isProfitable: netProfitPercent > 0
    }
  }

  // Process and categorize keywords
  const processKeywords = () => {
    const profitable: any[] = []
    const unprofitable: any[] = []

    Object.entries(keywordHierarchy)
      .filter(([, rootData]: [string, any]) => (rootData.keywordCount || 0) >= minKeywordsPerRoot)
      .forEach(([rootName, rootData]: [string, any]) => {
        const rootMetrics = calculateProfitability(rootData)
        
        const rootItem = {
          name: rootName,
          type: 'root',
          keywordCount: rootData.keywordCount || 0,
          ...rootMetrics,
          subroots: [] as any[]
        }

        // Process subroots
        Object.entries(rootData.subroots || {})
          .filter(([, subrootData]: [string, any]) => 
            (subrootData.keywordCount || subrootData.keywords?.length || 0) >= minKeywordsPerSubRoot
          )
          .forEach(([subrootName, subrootData]: [string, any]) => {
            const subrootMetrics = calculateProfitability(subrootData)
            
            const subrootItem = {
              name: subrootName,
              type: 'subroot',
              keywordCount: subrootData.keywordCount || subrootData.keywords?.length || 0,
              ...subrootMetrics,
              keywords: [] as any[]
            }

            // Process individual keywords
            if (subrootData.keywords && Array.isArray(subrootData.keywords)) {
              subrootData.keywords
                .sort((a: any, b: any) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                .slice(0, 10) // Limit to top 10 keywords per subroot
                .forEach((keywordData: any) => {
                  const keywordMetrics = calculateProfitability(keywordData)
                  
                  subrootItem.keywords.push({
                    name: keywordData.keyword || keywordData.name || 'Unknown Keyword',
                    type: 'keyword',
                    keywordCount: 1,
                    ...keywordMetrics
                  })
                })
            }
            
            rootItem.subroots.push(subrootItem)
          })

        if (rootMetrics.isProfitable) {
          profitable.push(rootItem)
        } else {
          unprofitable.push(rootItem)
        }
      })

    // Sort by net profit descending
    profitable.sort((a, b) => b.netProfit - a.netProfit)
    unprofitable.sort((a, b) => b.netProfit - a.netProfit)

    return { profitable, unprofitable }
  }

  const { profitable, unprofitable } = processKeywords()

  const ProfitTable = ({ items, isProfitable }: { items: any[], isProfitable: boolean }) => {
    const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set())
    const [expandedSubroots, setExpandedSubroots] = useState<Set<string>>(new Set())

    const toggleRoot = (rootName: string) => {
      const newExpanded = new Set(expandedRoots)
      if (newExpanded.has(rootName)) {
        newExpanded.delete(rootName)
        // Also collapse all subroots when root is collapsed
        const newExpandedSubroots = new Set(expandedSubroots)
        items.find(item => item.name === rootName)?.subroots?.forEach((subroot: any) => {
          newExpandedSubroots.delete(`${rootName}-${subroot.name}`)
        })
        setExpandedSubroots(newExpandedSubroots)
      } else {
        newExpanded.add(rootName)
      }
      setExpandedRoots(newExpanded)
    }

    const toggleSubroot = (rootName: string, subrootName: string) => {
      const key = `${rootName}-${subrootName}`
      const newExpanded = new Set(expandedSubroots)
      if (newExpanded.has(key)) {
        newExpanded.delete(key)
      } else {
        newExpanded.add(key)
      }
      setExpandedSubroots(newExpanded)
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900 min-w-[200px]">Keyword Group</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900"># Keywords</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900">Monthly Revenue</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900">CPC</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900">ACOS %</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900">Net Profit %</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900">Monthly Net Profit</th>
              <th className="text-center py-3 px-3 font-medium text-gray-900">Annual Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {/* Root Level */}
                <tr 
                  className={`border-b ${isProfitable ? 'bg-green-50' : 'bg-red-50'} hover:bg-opacity-80 cursor-pointer`}
                  onClick={() => toggleRoot(item.name)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {item.subroots.length > 0 && (
                        <button className="p-1 hover:bg-gray-200 rounded">
                          {expandedRoots.has(item.name) ? (
                            <ChevronUp className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      )}
                      <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">{item.keywordCount.toLocaleString('en-US')}</td>
                  <td className="py-3 px-3 text-center text-sm">
                    ${item.revenue >= 1000000 
                      ? (item.revenue / 1000000).toFixed(2) + 'M'
                      : (item.revenue / 1000).toFixed(0) + 'K'
                    }
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    ${item.avgCPC || '0.00'}
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span className={item.acos > 30 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {item.acos.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span className={item.netProfitPercent < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {item.netProfitPercent > 0 ? '+' : ''}{item.netProfitPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span className={item.netProfit < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${item.netProfit >= 1000 
                        ? (item.netProfit / 1000).toFixed(0) + 'K'
                        : item.netProfit.toFixed(0)
                      }
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-sm">
                    <span className={item.netProfit < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${(item.netProfit * 12) >= 1000000 
                        ? ((item.netProfit * 12) / 1000000).toFixed(1) + 'M'
                        : (item.netProfit * 12) >= 1000 
                        ? ((item.netProfit * 12) / 1000).toFixed(0) + 'K'
                        : (item.netProfit * 12).toFixed(0)
                      }
                    </span>
                  </td>
                </tr>

                {/* Subroot Level */}
                {expandedRoots.has(item.name) && item.subroots.map((subroot: any, subIndex: number) => (
                  <React.Fragment key={`${index}-${subIndex}`}>
                    <tr 
                      className="border-b bg-white hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSubroot(item.name, subroot.name)
                      }}
                    >
                      <td className="py-2 px-4 pl-8">
                        <div className="flex items-center space-x-2">
                          {subroot.keywords && subroot.keywords.length > 0 && (
                            <button className="p-1 hover:bg-gray-200 rounded">
                              {expandedSubroots.has(`${item.name}-${subroot.name}`) ? (
                                <ChevronUp className="h-3 w-3 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-gray-600" />
                              )}
                            </button>
                          )}
                          <span className="text-sm text-gray-700">↳ {subroot.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center text-sm">{subroot.keywordCount.toLocaleString('en-US')}</td>
                      <td className="py-2 px-3 text-center text-sm">
                        ${subroot.revenue >= 1000 
                          ? (subroot.revenue / 1000).toFixed(0) + 'K'
                          : subroot.revenue.toFixed(0)
                        }
                      </td>
                      <td className="py-2 px-3 text-center text-sm">
                        ${subroot.avgCPC || '0.00'}
                      </td>
                      <td className="py-2 px-3 text-center text-sm">
                        <span className={subroot.acos > 30 ? 'text-red-600' : 'text-green-600'}>
                          {subroot.acos.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-sm">
                        <span className={subroot.netProfitPercent < 0 ? 'text-red-600' : 'text-green-600'}>
                          {subroot.netProfitPercent > 0 ? '+' : ''}{subroot.netProfitPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-sm">
                        <span className={subroot.netProfit < 0 ? 'text-red-600' : 'text-green-600'}>
                          ${subroot.netProfit >= 1000 
                            ? (subroot.netProfit / 1000).toFixed(0) + 'K'
                            : subroot.netProfit.toFixed(0)
                          }
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-sm">
                        <span className={subroot.netProfit < 0 ? 'text-red-600' : 'text-green-600'}>
                          ${(subroot.netProfit * 12) >= 1000000 
                            ? ((subroot.netProfit * 12) / 1000000).toFixed(1) + 'M'
                            : (subroot.netProfit * 12) >= 1000 
                            ? ((subroot.netProfit * 12) / 1000).toFixed(0) + 'K'
                            : (subroot.netProfit * 12).toFixed(0)
                          }
                        </span>
                      </td>
                    </tr>

                    {/* Individual Keywords Level */}
                    {expandedSubroots.has(`${item.name}-${subroot.name}`) && subroot.keywords && subroot.keywords.map((keyword: any, keywordIndex: number) => (
                      <tr key={`${index}-${subIndex}-${keywordIndex}`} className="border-b bg-gray-50 hover:bg-gray-100">
                        <td className="py-2 px-4 pl-16">
                          <span className="text-xs text-gray-600">⤷ {keyword.name}</span>
                        </td>
                        <td className="py-2 px-3 text-center text-xs">{keyword.keywordCount}</td>
                        <td className="py-2 px-3 text-center text-xs">
                          ${keyword.revenue >= 1000 
                            ? (keyword.revenue / 1000).toFixed(1) + 'K'
                            : keyword.revenue.toFixed(0)
                          }
                        </td>
                        <td className="py-2 px-3 text-center text-xs">
                          ${keyword.avgCPC || '0.00'}
                        </td>
                        <td className="py-2 px-3 text-center text-xs">
                          <span className={keyword.acos > 30 ? 'text-red-600' : 'text-green-600'}>
                            {keyword.acos.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-xs">
                          <span className={keyword.netProfitPercent < 0 ? 'text-red-600' : 'text-green-600'}>
                            {keyword.netProfitPercent > 0 ? '+' : ''}{keyword.netProfitPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-xs">
                          <span className={keyword.netProfit < 0 ? 'text-red-600' : 'text-green-600'}>
                            ${keyword.netProfit >= 1000 
                              ? (keyword.netProfit / 1000).toFixed(1) + 'K'
                              : keyword.netProfit.toFixed(0)
                            }
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-xs">
                          <span className={keyword.netProfit < 0 ? 'text-red-600' : 'text-green-600'}>
                            ${(keyword.netProfit * 12) >= 100000 
                              ? ((keyword.netProfit * 12) / 1000).toFixed(0) + 'K'
                              : (keyword.netProfit * 12).toFixed(0)
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* COGS Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                COGS (Cost of Goods Sold):
              </label>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md">
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={cogsPercent}
                  onChange={(e) => setCogsPercent(parseInt(e.target.value) || 30)}
                  className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                />
                <span className="text-sm text-gray-700">%</span>
              </div>
            </div>

            {/* Min Keywords Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                <span>Min Keywords Per Root:</span>
                <input
                  type="number"
                  min="1"
                  value={minKeywordsPerRoot}
                  onChange={(e) => setMinKeywordsPerRoot(parseInt(e.target.value) || 1)}
                  className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                />
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                <span>Min Keywords Per Sub Root:</span>
                <input
                  type="number"
                  min="1"
                  value={minKeywordsPerSubRoot}
                  onChange={(e) => setMinKeywordsPerSubRoot(parseInt(e.target.value) || 1)}
                  className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profitable Keywords */}
      {profitable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span>Profitable Keywords</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {profitable.length} Groups
              </Badge>
            </CardTitle>
            <CardDescription>
              Keywords that remain profitable after accounting for COGS ({cogsPercent}%), FBA fees (19%), and advertising costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfitTable items={profitable} isProfitable={true} />
          </CardContent>
        </Card>
      )}

      {/* Unprofitable Keywords */}
      {unprofitable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span>Unprofitable Keywords</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {unprofitable.length} Groups
              </Badge>
            </CardTitle>
            <CardDescription>
              Keywords that become unprofitable when factoring in all costs - consider optimizing or avoiding these
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfitTable items={unprofitable} isProfitable={false} />
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600">Total Profitable Revenue</h3>
            <div className="text-2xl font-bold text-green-600 mt-2">
              ${profitable.reduce((sum, item) => sum + item.revenue, 0) >= 1000000
                ? (profitable.reduce((sum, item) => sum + item.revenue, 0) / 1000000).toFixed(2) + 'M'
                : (profitable.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(0) + 'K'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600">Total Profitable Keywords</h3>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              {profitable.reduce((sum, item) => sum + item.keywordCount, 0).toLocaleString('en-US')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-medium text-gray-600">Avg Net Profit Margin</h3>
            <div className="text-2xl font-bold text-purple-600 mt-2">
              {profitable.length > 0 
                ? (profitable.reduce((sum, item) => sum + item.netProfitPercent, 0) / profitable.length).toFixed(1) + '%'
                : '0%'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function KeywordsAnalysis({ data, searchTermsData }: KeywordsAnalysisProps) {
  const [activeTab, setActiveTab] = useState('hierarchy')
  const [searchTerm, setSearchTerm] = useState('')
  const [minKeywordsPerRoot, setMinKeywordsPerRoot] = useState(5)
  const [minKeywordsPerSubRoot, setMinKeywordsPerSubRoot] = useState(5)
  
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'hierarchy', label: 'Keyword Hierarchy', icon: List },
          { id: 'profit', label: 'Keyword Profitability', icon: DollarSign },
          { id: 'trending', label: 'Trending Keywords', icon: TrendingUp }
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


      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Score Cards */}
          {data.keywordsData?.keywordHierarchy && Object.keys(data.keywordsData.keywordHierarchy).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Monthly Revenue */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-medium text-gray-600">Total Monthly Revenue</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(() => {
                      const totalRevenue = Object.values(data.keywordsData.keywordHierarchy).reduce((sum: number, root: any) => 
                        sum + (root.totalRevenue || 0), 0
                      )
                      return totalRevenue >= 1000000 
                        ? (totalRevenue / 1000000).toFixed(2) + 'M'
                        : (totalRevenue / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'K'
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Across all keyword groups</p>
                </CardContent>
              </Card>
              
              {/* Total Keyword Depth */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Search className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-gray-600">Total Keyword Depth</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(data.keywordsData.keywordHierarchy).reduce((sum: number, root: any) => 
                      sum + (root.keywordCount || 0), 0
                    ).toLocaleString('en-US')}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unique keywords tracked</p>
                </CardContent>
              </Card>
              
              {/* Average CPC */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-sm font-medium text-gray-600">Average CPC</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(() => {
                      let totalCPC = 0
                      let count = 0
                      Object.values(data.keywordsData.keywordHierarchy).forEach((root: any) => {
                        // Parse CPC and only include if > 0
                        let cpc = 0
                        if (typeof root.avgCPC === 'string') {
                          cpc = parseFloat(root.avgCPC.replace('$', ''))
                        } else if (typeof root.avgCPC === 'number') {
                          cpc = root.avgCPC
                        }
                        
                        if (cpc > 0) {
                          totalCPC += cpc
                          count++
                        }
                      })
                      return count > 0 ? (totalCPC / count).toFixed(2) : '0.00'
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Average cost per click</p>
                </CardContent>
              </Card>
              
              {/* Average Conversion Rate */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-medium text-gray-600">Avg Conversion Rate</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(() => {
                      let totalCVR = 0
                      let count = 0
                      Object.values(data.keywordsData.keywordHierarchy).forEach((root: any) => {
                        const cvr = parseFloat(root.avgConversionRate || '0')
                        if (cvr > 0) {
                          totalCVR += cvr
                          count++
                        }
                      })
                      return count > 0 ? (totalCVR / count).toFixed(0) + '%' : '0%'
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click to order conversion</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Keyword Hierarchy Pivot Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="h-5 w-5 text-blue-600" />
                <span>Keyword Hierarchy</span>
              </CardTitle>
              <CardDescription>
                Hierarchical view of keyword groups and their revenue potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.keywordsData?.keywordHierarchy && Object.keys(data.keywordsData.keywordHierarchy).length > 0 ? (
                <div className="space-y-4">
                  {/* Filter and Action Bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search keywords..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
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
                          value={minKeywordsPerRoot}
                          onChange={(e) => setMinKeywordsPerRoot(parseInt(e.target.value) || 1)}
                          className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                        <span>Min Keywords Per Sub Root:</span>
                        <input
                          type="number"
                          min="1"
                          value={minKeywordsPerSubRoot}
                          onChange={(e) => setMinKeywordsPerSubRoot(parseInt(e.target.value) || 1)}
                          className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
                        />
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </button>
                      <ExpandButton />
                    </div>
                  </div>
                  
                  {/* Table */}
                  <KeywordTableWithFullscreen>
                    <KeywordPivotTable 
                      keywordHierarchy={data.keywordsData.keywordHierarchy}
                      searchTerm={searchTerm}
                      minKeywordsPerRoot={minKeywordsPerRoot}
                      minKeywordsPerSubRoot={minKeywordsPerSubRoot}
                    />
                  </KeywordTableWithFullscreen>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No keyword hierarchy data available.</p>
                  <p className="text-sm mt-2">Keywords may still be processing or no keywords found for this product.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}


      {/* Keyword Profitability Tab */}
      {activeTab === 'profit' && (
        <KeywordProfitAnalysis 
          keywordHierarchy={data.keywordsData?.keywordHierarchy || {}}
          minKeywordsPerRoot={minKeywordsPerRoot}
          minKeywordsPerSubRoot={minKeywordsPerSubRoot}
        />
      )}

      {/* Trending Tab */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
          {/* Trending Keywords */}
          {data.keywordsData?.trendingKeywords && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Trending Keywords</span>
                </CardTitle>
                <CardDescription>
                  Fast-growing keywords with high opportunity potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.keywordsData.trendingKeywords.map((keyword: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{keyword.keyword}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Volume: {keyword.currentVolume.toLocaleString('en-US')}</span>
                            <span>CPC: ${keyword.cpc}</span>
                            <span className="capitalize">Seasonality: {keyword.seasonality}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-green-600 font-semibold">
                            <ChevronUp className="h-4 w-4" />
                            <span>{keyword.trend}</span>
                          </div>
                          <Badge 
                            variant={keyword.velocity === 'skyrocketing' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {keyword.velocity}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Opportunity Score:</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={keyword.opportunity} className="w-24 h-2" />
                            <span className="text-sm font-medium">{keyword.opportunity}/100</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Target className="h-3 w-3 mr-1" />
                          Target Keyword
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seasonal Keywords */}
          {data.keywordsData?.seasonalKeywords && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Seasonal Keyword Trends</span>
                </CardTitle>
                <CardDescription>
                  Keywords with strong seasonal patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.keywordsData.seasonalKeywords.map((keyword: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{keyword.keyword}</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold">{keyword.peak.month}</div>
                          <div className="text-xs text-gray-600">{keyword.peak.volume.toLocaleString('en-US')}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">Off-peak</div>
                          <div className="text-xs text-gray-600">{keyword.offPeak.volume.toLocaleString('en-US')}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold">{keyword.multiplier}x</div>
                          <div className="text-xs text-gray-600">Peak Multiplier</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold">{keyword.nextPeak}</div>
                          <div className="text-xs text-gray-600">Next Peak</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Real-time Amazon Search Data - Always show if available */}
      {searchTermsData && searchTermsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Real-Time Amazon Search Data</span>
            </CardTitle>
            <CardDescription>
              Live search term data from Amazon's API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchTermsData.slice(0, 6).map((term: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="font-medium text-gray-900 mb-2">{term.keyword}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Search Volume:</span>
                      <span className="font-medium">{term.searchVolume?.toLocaleString('en-US') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Competition:</span>
                      <span className="font-medium">{term.competition || 'Medium'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPC:</span>
                      <span className="font-medium">${term.cpc || '1.25'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rising Keywords */}
      {data.demandData?.trendingKeywords && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Rising Keywords</span>
            </CardTitle>
            <CardDescription>
              Top search terms with highest growth velocity in the niche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.demandData.trendingKeywords.slice(0, 6).map((keyword: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex-grow">
                    <h5 className="font-medium text-gray-900 text-sm">{keyword.keyword}</h5>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                      <span>Rank: #{keyword.oldRank} → #{keyword.newRank}</span>
                      <Badge variant="secondary" className="text-xs">{keyword.growth}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600">
                      {parseInt(keyword.growth) > 100 ? '🔥' : '↑'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Opportunity</h4>
              <p className="text-sm text-gray-700">
                These rapidly growing keywords represent emerging demand. Target these terms early to capture market share before competition intensifies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}