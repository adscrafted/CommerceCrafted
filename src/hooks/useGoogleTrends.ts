import { useState, useEffect } from 'react'

interface TrendDataPoint {
  date: string
  month: string
  year: number
  [keyword: string]: string | number
}

interface RelatedQuery {
  query: string
  value: string | number
}

interface GoogleTrendsData {
  keywords: string[]
  timeframe: string
  timestamp: string
  interest_over_time: TrendDataPoint[]
  related_queries: {
    [keyword: string]: {
      top: RelatedQuery[]
      rising: RelatedQuery[]
    }
  }
  seasonality: {
    [keyword: string]: {
      monthly_averages: { month: string; value: number }[]
      peak_season: string
      peak_value: number
      low_season: string
      low_value: number
      seasonality_score: number
    }
  }
  mock?: boolean
  cached?: boolean
  error?: string
}

export function useGoogleTrends(keywords: string[], enabled = true) {
  const [data, setData] = useState<GoogleTrendsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || keywords.length === 0) return

    const fetchTrends = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/trends/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keywords: keywords.slice(0, 5), // Google Trends limit
            timeframe: 'today 12-m',
            geo: 'US'
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }

        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trends data')
        console.error('Google Trends fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [keywords.join(','), enabled]) // Re-fetch when keywords change

  return { data, loading, error }
}