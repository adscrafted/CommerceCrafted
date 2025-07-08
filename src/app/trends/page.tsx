'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Calendar,
  Loader2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { useSearchTerms, TrendData } from '@/hooks/useSearchTerms'
import { useTrendingKeywords } from '@/hooks/useTrendingKeywords'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, Sparkles, ArrowUp, ArrowDown } from 'lucide-react'

// Marketplace flags mapping
const marketplaceFlags: Record<string, string> = {
  US: '🇺🇸',
  DE: '🇩🇪',
  UK: '🇬🇧',
  CA: '🇨🇦',
  FR: '🇫🇷',
  ES: '🇪🇸',
  IT: '🇮🇹',
  MX: '🇲🇽',
  JP: '🇯🇵',
  AU: '🇦🇺',
  AE: '🇦🇪',
  SA: '🇸🇦'
}

export default function TrendsPage() {
  const { trends, loading, error } = useSearchTerms()
  const { trendingKeywords, newKeywords, loading: trendingLoading, error: trendingError } = useTrendingKeywords()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTrends, setFilteredTrends] = useState<TrendData[]>([])
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedView, setSelectedView] = useState<'ranking' | 'skyrocket' | 'newtrending'>('ranking')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Generate Amazon search URL for a keyword
  const getAmazonSearchUrl = (keyword: string) => {
    const encodedKeyword = encodeURIComponent(keyword)
    return `https://www.amazon.com/s?k=${encodedKeyword}&ref=nb_sb_noss`
  }

  // Get trend data for visualization using actual historical data
  const getTrendData = (trend: TrendData) => {
    // Use actual weekly data if available, otherwise fall back to current week only
    if (trend.weeklyData && trend.weeklyData.length > 0) {
      return trend.weeklyData.map((week: any, index: number) => {
        // Handle date extraction - check if it's an object with value property
        const dateValue = typeof week.week_start_date === 'object' ? 
          week.week_start_date.value : week.week_start_date
        
        return {
          week: `Week ${index + 1}`,
          date: dateValue || `Data Point ${index + 1}`,
          rank: week.search_frequency_rank,
          clickShare: (week.total_click_share || 0) * 100, // Convert to percentage
          conversionShare: (week.total_conversion_share || 0) * 100 // Convert to percentage
        }
      })
    }
    
    // Fallback to current week only
    return [{
      week: 'Current',
      date: '2025-04-06',
      rank: trend.searchFrequencyRank,
      clickShare: trend.topClickShare,
      conversionShare: trend.top3ConversionShare
    }]
  }

  useEffect(() => {
    let filtered = trends

    if (searchQuery) {
      filtered = filtered.filter(trend => 
        trend.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTrends(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, trends])

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrends.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTrends = filteredTrends.slice(startIndex, endIndex)

  // Show loading state
  if (loading || (selectedView === 'skyrocket' && trendingLoading)) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {selectedView === 'skyrocket' ? 'Loading trending keywords...' : 'Loading Amazon search terms...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || (selectedView === 'skyrocket' && trendingError)) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error || trendingError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="text-center py-8 bg-white border-b">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Trending Search Terms</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Weekly keyword ranking data with search volume, click share, and conversion metrics
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white border-b">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Country Selector and Toggles */}
            <div className="py-4 flex flex-wrap items-center justify-between gap-4">
              {/* Left side: View Toggles */}
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedView('ranking')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedView === 'ranking'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ABA Ranking List
                  </button>
                  <button
                    onClick={() => setSelectedView('skyrocket')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedView === 'skyrocket'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Search Skyrocket List
                  </button>
                  <button
                    onClick={() => setSelectedView('newtrending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedView === 'newtrending'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    New Trending
                  </button>
                </div>
              </div>

              {/* Right side: Country Selector */}
              <div className="flex items-center gap-2">
                {Object.entries(marketplaceFlags).map(([country, flag]) => (
                  <div key={country} className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        setSelectedCountry(country)
                        // Show message that data for other countries will be available soon
                        if (country !== 'US') {
                          alert(`Data for ${country} marketplace will be available soon. Currently showing US data.`)
                        }
                      }}
                      className={`p-2 text-2xl rounded-lg transition-all ${
                        selectedCountry === country
                          ? 'bg-blue-100 ring-2 ring-blue-500'
                          : 'hover:bg-gray-100'
                      }`}
                      title={country}
                    >
                      {flag}
                    </button>
                    <span className="text-xs text-gray-600 mt-1">{country}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="py-4 border-t">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Weekly:</span>
            <span>2025-06-29 ~ 2025-07-05</span>
            <span className="text-gray-400">•</span>
            <span>
              {selectedView === 'ranking' 
                ? `${filteredTrends.length.toLocaleString()} search terms`
                : selectedView === 'skyrocket'
                ? `${trendingKeywords.length} skyrocketing keywords`
                : `${newKeywords.length} new keywords`
              }
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
            <div className="overflow-x-auto">
              {selectedView === 'ranking' ? (
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-gray-50 text-xs text-gray-600">
                      <th className="text-left p-4 font-medium whitespace-nowrap">Keyword</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Search Frequency Rank</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Top 3 Click Share</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Top 3 Conversion Share</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap min-w-[400px]">Top ASINs</th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    {paginatedTrends.map((trend, index) => (
                    <tr
                      key={trend.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* Keyword */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-blue-600">
                            {trend.keyword}
                          </div>
                          <a
                            href={getAmazonSearchUrl(trend.keyword)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-600 transition-colors"
                            title={`Search "${trend.keyword}" on Amazon`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </td>

                      {/* Search Frequency Rank */}
                      <td className="p-3 text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-lg">{trend.searchFrequencyRank}</div>
                          <div className="h-8 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={getTrendData(trend)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Area
                                  type="monotone"
                                  dataKey="rank"
                                  stroke="#3B82F6"
                                  fill="#3B82F6"
                                  fillOpacity={0.1}
                                  strokeWidth={1.5}
                                />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload[0]) {
                                      const data = payload[0].payload
                                      const dateValue = typeof data.date === 'object' ? data.date.value : data.date
                                      return (
                                        <div className="bg-white border rounded p-2 text-xs shadow-lg">
                                          <p className="font-medium text-gray-600 mb-1">{dateValue}</p>
                                          <p>Rank: {Math.round(payload[0].value)}</p>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </td>

                      {/* Click Share */}
                      <td className="p-3 text-center">
                        <div className="space-y-1">
                          <div className="font-semibold">{Math.round(trend.topClickShare)}%</div>
                          <div className="h-8 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={getTrendData(trend)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Area
                                  type="monotone"
                                  dataKey="clickShare"
                                  stroke="#10B981"
                                  fill="#10B981"
                                  fillOpacity={0.1}
                                  strokeWidth={1.5}
                                />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload[0]) {
                                      const data = payload[0].payload
                                      const dateValue = typeof data.date === 'object' ? data.date.value : data.date
                                      return (
                                        <div className="bg-white border rounded p-2 text-xs shadow-lg">
                                          <p className="font-medium text-gray-600 mb-1">{dateValue}</p>
                                          <p>Click: {Math.round(payload[0].value)}%</p>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </td>

                      {/* Conversion Share */}
                      <td className="p-3 text-center">
                        <div className="space-y-1">
                          <div className="font-semibold">{Math.round(trend.top3ConversionShare)}%</div>
                          <div className="h-8 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={getTrendData(trend)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Area
                                  type="monotone"
                                  dataKey="conversionShare"
                                  stroke="#F59E0B"
                                  fill="#F59E0B"
                                  fillOpacity={0.1}
                                  strokeWidth={1.5}
                                />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload[0]) {
                                      const data = payload[0].payload
                                      const dateValue = typeof data.date === 'object' ? data.date.value : data.date
                                      return (
                                        <div className="bg-white border rounded p-2 text-xs shadow-lg">
                                          <p className="font-medium text-gray-600 mb-1">{dateValue}</p>
                                          <p>Conv: {Math.round(payload[0].value)}%</p>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </td>

                      {/* Top ASINs */}
                      <td className="p-3">
                        <div className="flex items-center gap-3 justify-center">
                          {trend.top3ASINs.filter(asin => asin.asin && asin.asin !== 'N/A').map((asin, i) => (
                            <div key={i} className="text-center">
                              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden mb-1 mx-auto">
                                <img
                                  src={`https://via.placeholder.com/40x40/e2e8f0/64748b?text=${asin.asin.slice(-3)}`}
                                  alt={asin.asin}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="text-xs font-mono text-gray-600 mb-1">
                                {asin.asin}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="text-xs">
                                  <span className="text-gray-500">Clicks:</span>
                                  <span className="text-blue-600 font-medium ml-0.5">{Math.round(asin.clickShare)}%</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-gray-500">Conversions:</span>
                                  <span className="text-green-600 font-medium ml-0.5">{Math.round(asin.conversionShare || 0)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : selectedView === 'skyrocket' ? (
                // Search Skyrocket List View
                <div>
                  {/* Skyrocketing Keywords Table */}
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b bg-gray-50 text-xs text-gray-600">
                        <th className="text-left p-4 font-medium whitespace-nowrap">Keyword</th>
                        <th className="text-center p-4 font-medium whitespace-nowrap">Search Frequency Rank</th>
                        <th className="text-center p-4 font-medium whitespace-nowrap">Weekly Search Volume</th>
                        <th className="text-center p-4 font-medium whitespace-nowrap">Top 3 Click Share</th>
                        <th className="text-center p-4 font-medium whitespace-nowrap">Top 3 Conversion Share</th>
                        <th className="text-center p-4 font-medium whitespace-nowrap min-w-[200px]">Top 3 ASINs</th>
                      </tr>
                    </thead>
                    <tbody className="relative">
                      {trendingKeywords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No skyrocketing keywords found this week</p>
                            <p className="text-sm mt-1">Check back after next week's data is available</p>
                          </td>
                        </tr>
                      ) : (
                        trendingKeywords.slice(0, 50).map((keyword, index) => (
                          <tr key={keyword.searchTerm} className="border-b hover:bg-gray-50 transition-colors">
                            {/* Keyword */}
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-blue-600">
                                  {keyword.searchTerm}
                                </div>
                                <a
                                  href={getAmazonSearchUrl(keyword.searchTerm)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-500 hover:text-orange-600 transition-colors"
                                  title={`Search "${keyword.searchTerm}" on Amazon`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </td>

                            {/* Search Frequency Rank */}
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center">
                                <div className="font-semibold text-lg">{keyword.currentRank}</div>
                                {keyword.previousRank && (
                                  <div className="text-xs text-green-600 flex items-center gap-0.5">
                                    <ArrowUp className="h-3 w-3" />
                                    <span>{keyword.rankImprovement.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Weekly Search Volume */}
                            <td className="p-3 text-center">
                              <div className="h-8 flex items-center justify-center">
                                <div className="bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                                  Data Available Soon
                                </div>
                              </div>
                            </td>

                            {/* Click Share */}
                            <td className="p-3 text-center">
                              <div className="font-semibold">{Math.round(keyword.totalClickShare)}%</div>
                            </td>

                            {/* Conversion Share */}
                            <td className="p-3 text-center">
                              <div className="font-semibold">{Math.round(keyword.totalConversionShare)}%</div>
                            </td>

                            {/* Top ASINs */}
                            <td className="p-3">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="bg-gray-100 rounded px-2 py-1 text-xs text-gray-500">
                                  Loading ASINs...
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                // New Trending View
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold">New Trending Keywords</h2>
                    <span className="text-sm text-gray-500">Brand new keywords entering the top rankings</span>
                  </div>
                  <div className="grid gap-3">
                    {newKeywords.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No new trending keywords found this week</p>
                      </div>
                    ) : (
                      newKeywords.slice(0, 20).map((keyword) => (
                        <div key={keyword.searchTerm} className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-purple-700">{keyword.searchTerm}</span>
                                  <a
                                    href={getAmazonSearchUrl(keyword.searchTerm)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-500 hover:text-orange-600"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                    New This Week
                                  </span>
                                  <span>Rank: #{keyword.currentRank}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm font-medium">{Math.round(keyword.totalClickShare)}%</div>
                                <div className="text-xs text-gray-500">Click Share</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{Math.round(keyword.totalConversionShare)}%</div>
                                <div className="text-xs text-gray-500">Conv Share</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Pagination Controls - Only show for ranking view */}
          {selectedView === 'ranking' && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTrends.length)} of {filteredTrends.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
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
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}