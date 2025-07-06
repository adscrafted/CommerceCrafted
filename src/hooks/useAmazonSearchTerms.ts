import { useState, useEffect } from 'react'

export interface SearchTermTrend {
  keyword: string
  searchFrequencyRank: number
  weeklySearchVolume: number
  weeklySearchVolumeGrowth: number
  top3ClickShare: number
  top3ConversionShare: number
  topASINs: {
    asin: string
    title: string
    clickShare: number
    conversionShare: number
    position: number
  }[]
  trendData: {
    week: string
    rank: number
    searchVolume: number
  }[]
}

interface AmazonSearchTermsData {
  keywords: string[]
  weeks: number
  timestamp: string
  trends: SearchTermTrend[]
  mock?: boolean
  cached?: boolean
}

export function useAmazonSearchTerms(keywords: string[], weeks = 4, enabled = true) {
  const [data, setData] = useState<AmazonSearchTermsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || keywords.length === 0) return

    const fetchSearchTerms = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/analytics/search-terms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keywords,
            weeks,
            fetchLatest: false, // Set to true to fetch fresh data from Amazon
          })
        })

        if (!response.ok) {
          // Try to get error details from response
          const errorText = await response.text()
          console.error('API Error Response:', errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }

        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch search terms data'
        setError(errorMessage)
        console.error('Amazon search terms fetch error:', err)
        
        // Return mock data as fallback
        setData({
          keywords,
          weeks,
          mock: true,
          message: 'Using fallback mock data due to API error',
          trends: generateFallbackData(keywords)
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSearchTerms()
  }, [keywords.join(','), weeks, enabled])

  return { data, loading, error }
}

// Generate fallback mock data when API fails
function generateFallbackData(keywords: string[]) {
  return keywords.map(keyword => ({
    keyword,
    searchFrequencyRank: 287,
    weeklySearchVolume: 980077,
    weeklySearchVolumeGrowth: -0.60,
    top3ClickShare: 41.82,
    top3ConversionShare: 0.00,
    topASINs: [
      {
        asin: 'B07TPLZY74',
        title: 'MUSICOZY Sleep Headphones Bluetooth 5.2 Headband',
        clickShare: 15.09,
        conversionShare: 0.00,
        position: 1,
      },
      {
        asin: 'B08MFG9M3H',
        title: 'LC-dolida Sleep Mask with Bluetooth Headphones',
        clickShare: 15.03,
        conversionShare: 0.00,
        position: 2,
      },
      {
        asin: 'B07DG279MB',
        title: 'Perytong Sleep Headphones Wireless',
        clickShare: 11.70,
        conversionShare: 0.00,
        position: 3,
      }
    ],
    trendData: Array.from({ length: 4 }, (_, i) => {
      const weekDate = new Date()
      weekDate.setDate(weekDate.getDate() - (i * 7))
      return {
        week: weekDate.toISOString().split('T')[0],
        rank: 287 + Math.floor(Math.random() * 20 - 10),
        searchVolume: 980077 + Math.floor(Math.random() * 50000 - 25000),
      }
    }).reverse()
  }))
}