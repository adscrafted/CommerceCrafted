// Hook for fetching real Amazon search terms from BigQuery
import { useState, useEffect } from 'react'

export interface SearchTermData {
  searchTerm: string
  searchFrequencyRank: number
  totalClickShare: number
  totalConversionShare: number
  topAsins: Array<{
    clicked_asin: string
    clicked_item_name: string
    click_share: number
    conversion_share: number
  }>
  uniqueProducts: number
  marketplaceId: string
}

export interface TrendData {
  id: string
  keyword: string
  searchFrequencyRank: number
  topClickShare: number
  top3ConversionShare: number
  top3ASINs: Array<{
    asin: string
    clickShare: number
    conversionShare: number
  }>
  weeklyData?: Array<{
    week_start_date: string
    week_end_date: string
    search_frequency_rank: number
    total_click_share: number
    total_conversion_share: number
  }>
  marketplaceId?: string
}

export function useSearchTerms() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true)
        console.log('🚀 Starting to fetch trends...')
        
        // Fetch search terms from our public trends API - reduced limit for performance
        const response = await fetch('/api/trends?limit=50')
        console.log('📡 API Response status:', response.status)
        
        if (!response.ok) {
          throw new Error('Failed to fetch search terms')
        }
        
        const data = await response.json()
        console.log('📊 API Response data:', data)
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch data')
        }

        // Transform the data directly since it's already grouped by search term
        const transformedTrends: TrendData[] = data.data.map((term: SearchTermData, index: number) => ({
          id: `trend-${index}`,
          keyword: term.searchTerm,
          searchFrequencyRank: term.searchFrequencyRank,
          topClickShare: (term.totalClickShare || 0) * 100,
          top3ConversionShare: (term.totalConversionShare || 0) * 100,
          top3ASINs: (term.topAsins || []).map(asin => ({
            asin: asin.clicked_asin || 'N/A',
            clickShare: (asin.click_share || 0) * 100,
            conversionShare: (asin.conversion_share || 0) * 100
          })),
          weeklyData: (term as any).weeklyData || [], // Include historical weekly data for trends
          marketplaceId: term.marketplaceId || 'US' // Default to US if not specified
        }))

        // Sort by search frequency rank
        transformedTrends.sort((a, b) => a.searchFrequencyRank - b.searchFrequencyRank)
        
        console.log('🔄 Transformed trends:', transformedTrends.slice(0, 3))

        setTrends(transformedTrends)
        setError(null)
        console.log('✅ Successfully set trends data')
      } catch (err) {
        console.error('❌ Error fetching trends:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
        console.log('🔄 Loading state set to false')
      }
    }

    fetchTrends()
  }, [])

  return { trends, loading, error }
}