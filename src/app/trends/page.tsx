'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Calendar,
  Loader2,
  ExternalLink,
  TrendingUp,
  ArrowUp
} from 'lucide-react'
import { useSearchTerms, TrendData } from '@/hooks/useSearchTerms'
import { useTrendingKeywords } from '@/hooks/useTrendingKeywords'
import { useDebounce } from '@/hooks/useDebounce'

// Import the simplified table row components
import { SimpleTrendTableRow } from '@/components/trends/SimpleTrendTableRow'
import { SimpleTrendingTableRow } from '@/components/trends/SimpleTrendingTableRow'

// Marketplace configuration organized by region
const marketplaces = [
  // Americas
  { code: 'US', flag: '🇺🇸', name: 'United States', region: 'Americas' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', region: 'Americas' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico', region: 'Americas' },
  
  // Europe
  { code: 'UK', flag: '🇬🇧', name: 'United Kingdom', region: 'Europe' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', region: 'Europe' },
  { code: 'FR', flag: '🇫🇷', name: 'France', region: 'Europe' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy', region: 'Europe' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain', region: 'Europe' }
]

export default function TrendsPage() {
  const { trends, loading, error } = useSearchTerms()
  const { trendingKeywords, newKeywords, loading: trendingLoading, error: trendingError } = useTrendingKeywords()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedView, setSelectedView] = useState<'ranking' | 'skyrocket'>('ranking')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25 // Reduced from 50 for better performance
  
  // Debounce search input
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Generate Amazon search URL for a keyword
  const getAmazonSearchUrl = useCallback((keyword: string) => {
    const encodedKeyword = encodeURIComponent(keyword)
    return `https://www.amazon.com/s?k=${encodedKeyword}&ref=nb_sb_noss`
  }, [])

  // Get trend data for visualization using actual historical data
  const getTrendData = useCallback((trend: TrendData) => {
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
  }, [])

  // Memoize filtered trends for better performance
  const filteredTrends = useMemo(() => {
    let filtered = trends
    
    // Filter by marketplace
    if (selectedCountry !== 'US') {
      // For now, show a message for non-US marketplaces
      // In the future, this would filter by marketplace
      filtered = []
    }
    
    // Filter by search query - use debounced value
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(trend => 
        trend.keyword.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [debouncedSearchQuery, trends, selectedCountry])

  // Calculate pagination for both views
  const totalPages = Math.ceil(
    selectedView === 'ranking' 
      ? filteredTrends.length / itemsPerPage
      : trendingKeywords.length / itemsPerPage
  )
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  const paginatedTrends = useMemo(() => 
    filteredTrends.slice(startIndex, endIndex),
    [filteredTrends, startIndex, endIndex]
  )
  
  const paginatedTrendingKeywords = useMemo(() =>
    trendingKeywords.slice(startIndex, endIndex),
    [trendingKeywords, startIndex, endIndex]
  )

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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
          <h1 className="text-5xl font-bold text-blue-600 mb-4">Trending Search Terms</h1>
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
                    Ranking
                  </button>
                  <button
                    onClick={() => setSelectedView('skyrocket')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedView === 'skyrocket'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Trending
                  </button>
                </div>
              </div>

              {/* Right side: Country Selector */}
              <div className="flex items-center gap-2 flex-wrap">
{marketplaces.map((marketplace) => (
                  marketplace.code === 'US' ? (
                    <button
                      key={marketplace.code}
                      onClick={() => {
                        setSelectedCountry(marketplace.code)
                        setCurrentPage(1) // Reset pagination when changing marketplace
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${
                        selectedCountry === marketplace.code
                          ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      title={marketplace.name}
                    >
                      <span className="text-lg">{marketplace.flag}</span>
                      <span>{marketplace.code}</span>
                    </button>
                  ) : (
                    <div
                      key={marketplace.code}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 opacity-50 cursor-not-allowed"
                      title={`${marketplace.name} - Coming Soon`}
                    >
                      <span className="text-lg">{marketplace.flag}</span>
                      <span>{marketplace.code}</span>
                    </div>
                  )
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
                : `${trendingKeywords.length} trending keywords`
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
                    {selectedCountry !== 'US' ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16">
                          <div className="text-gray-500">
                            <div className="text-2xl mb-2">{marketplaces.find(m => m.code === selectedCountry)?.flag}</div>
                            <p className="text-lg font-medium mb-2">
                              {marketplaces.find(m => m.code === selectedCountry)?.name} marketplace data coming soon
                            </p>
                            <p className="text-sm">
                              Currently only US marketplace data is available. We're working on adding more regions.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedTrends.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-gray-500">
                          <p>No search terms found</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedTrends.map((trend) => (
                        <SimpleTrendTableRow
                          key={trend.id}
                          trend={trend}
                          getAmazonSearchUrl={getAmazonSearchUrl}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                // Trending Keywords View
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-gray-50 text-xs text-gray-600">
                      <th className="text-left p-4 font-medium whitespace-nowrap">Keyword</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Search Frequency Rank</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Top 3 Click Share</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Top 3 Conversion Share</th>
                      <th className="text-center p-4 font-medium whitespace-nowrap">Top ASINs</th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    {selectedCountry !== 'US' ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16">
                          <div className="text-gray-500">
                            <div className="text-2xl mb-2">{marketplaces.find(m => m.code === selectedCountry)?.flag}</div>
                            <p className="text-lg font-medium mb-2">
                              {marketplaces.find(m => m.code === selectedCountry)?.name} marketplace data coming soon
                            </p>
                            <p className="text-sm">
                              Currently only US marketplace data is available. We're working on adding more regions.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedTrendingKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-gray-500">
                          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No trending keywords found this week</p>
                          <p className="text-sm mt-1">Check back after next week's data is available</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedTrendingKeywords.map((keyword) => (
                        <SimpleTrendingTableRow
                          key={keyword.searchTerm}
                          keyword={keyword}
                          getAmazonSearchUrl={getAmazonSearchUrl}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Pagination Controls - Show for both views */}
          {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {selectedView === 'ranking' ? (
                <>Showing {startIndex + 1} to {Math.min(endIndex, filteredTrends.length)} of {filteredTrends.length} results</>
              ) : (
                <>Showing {startIndex + 1} to {Math.min(endIndex, trendingKeywords.length)} of {trendingKeywords.length} results</>
              )}
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