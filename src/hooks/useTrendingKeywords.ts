import { useState, useEffect } from 'react'
import { TrendingKeyword } from '@/lib/trending-keywords-service'

export function useTrendingKeywords(marketplaceId: string = 'ATVPDKIKX0DER') {
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([])
  const [newKeywords, setNewKeywords] = useState<TrendingKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendingKeywords = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch both skyrocketing and new keywords in parallel
        const [skyrocketingRes, newKeywordsRes] = await Promise.all([
          fetch(`/api/trends/skyrocketing?marketplaceId=${marketplaceId}`),
          fetch(`/api/trends/new-keywords?marketplaceId=${marketplaceId}`)
        ])

        if (!skyrocketingRes.ok || !newKeywordsRes.ok) {
          throw new Error('Failed to fetch trending keywords')
        }

        const [skyrocketingData, newKeywordsData] = await Promise.all([
          skyrocketingRes.json(),
          newKeywordsRes.json()
        ])

        setTrendingKeywords(skyrocketingData.keywords || [])
        setNewKeywords(newKeywordsData.keywords || [])
      } catch (err) {
        console.error('Error fetching trending keywords:', err)
        setError(err instanceof Error ? err.message : 'Failed to load trending keywords')
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingKeywords()
  }, [marketplaceId])

  return {
    trendingKeywords,
    newKeywords,
    loading,
    error
  }
}