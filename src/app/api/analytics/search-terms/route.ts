import { NextRequest, NextResponse } from 'next/server'
import { AmazonAnalyticsService } from '@/lib/amazon-analytics-service'
import { z } from 'zod'

// Request validation schema
const requestSchema = z.object({
  keywords: z.array(z.string()).min(1).max(10),
  weeks: z.number().min(1).max(52).optional().default(4),
  fetchLatest: z.boolean().optional().default(false),
})

// Cache for search terms data
const searchTermsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keywords, weeks, fetchLatest } = requestSchema.parse(body)
    
    // Create cache key
    const cacheKey = `${keywords.join(',')}-${weeks}`
    
    // Check cache
    const cached = searchTermsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION && !fetchLatest) {
      return NextResponse.json({
        ...cached.data,
        cached: true
      })
    }
    
    try {
      // Check if required environment variables are set
      if (!process.env.AMAZON_SP_API_REFRESH_TOKEN || !process.env.AMAZON_SP_API_CLIENT_ID || 
          !process.env.AMAZON_SP_API_CLIENT_SECRET || !process.env.GOOGLE_CLOUD_PROJECT_ID) {
        // Return mock data if APIs are not configured
        return NextResponse.json({
          keywords,
          weeks,
          mock: true,
          message: 'Using mock data. Configure Amazon SP-API and BigQuery for real data.',
          trends: generateMockSearchTermsData(keywords, weeks)
        })
      }
      
      const analyticsService = new AmazonAnalyticsService()
      
      // If fetchLatest is true, fetch new data from Amazon
      if (fetchLatest) {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7) // Get last week's data
        
        const reportData = await analyticsService.fetchSearchTermsReport(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
        
        // Store in BigQuery
        await analyticsService.storeInBigQuery(reportData)
      }
      
      // Get processed trends from BigQuery
      const trends = await analyticsService.getSearchTermsTrends(keywords, weeks)
      
      const result = {
        keywords,
        weeks,
        timestamp: new Date().toISOString(),
        trends,
      }
      
      // Cache the result
      searchTermsCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      return NextResponse.json(result)
      
    } catch (error: any) {
      // If Amazon API or BigQuery fails, return mock data
      console.warn('Failed to fetch real data, using mock data:', error.message)
      return NextResponse.json({
        keywords,
        weeks,
        mock: true,
        message: 'Using mock data. Configure Amazon SP-API and BigQuery for real data.',
        trends: generateMockSearchTermsData(keywords, weeks)
      })
    }
    
  } catch (error) {
    console.error('Search terms API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch search terms data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Mock data generator based on the image you showed
function generateMockSearchTermsData(keywords: string[], weeks: number) {
  const mockData = [
    {
      keyword: 'bluetooth sleep mask',
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
      trendData: generateTrendData(287, 980077, weeks),
    },
    {
      keyword: 'sleep headphones',
      searchFrequencyRank: 423,
      weeklySearchVolume: 745234,
      weeklySearchVolumeGrowth: 2.34,
      top3ClickShare: 38.56,
      top3ConversionShare: 0.12,
      topASINs: [
        {
          asin: 'B07SHBQY7Z',
          title: 'MAXROCK Sleep Earplugs - Noise Isolating Ear Plugs',
          clickShare: 14.23,
          conversionShare: 0.05,
          position: 1,
        },
        {
          asin: 'B08K7H1KZP',
          title: 'Fulext Sleep Headphones Bluetooth Headband',
          clickShare: 13.87,
          conversionShare: 0.04,
          position: 2,
        },
        {
          asin: 'B07Q34ZKLF',
          title: 'CozyPhones Sleep Headphones & Travel Bag',
          clickShare: 10.46,
          conversionShare: 0.03,
          position: 3,
        }
      ],
      trendData: generateTrendData(423, 745234, weeks),
    },
  ]
  
  // Return matching keywords or generate new ones
  return keywords.map(keyword => {
    const existing = mockData.find(m => m.keyword === keyword)
    if (existing) return existing
    
    // Generate mock data for unknown keywords
    const rank = Math.floor(Math.random() * 1000) + 100
    const volume = Math.floor(1000000 / rank * (0.8 + Math.random() * 0.4))
    
    return {
      keyword,
      searchFrequencyRank: rank,
      weeklySearchVolume: volume,
      weeklySearchVolumeGrowth: (Math.random() - 0.5) * 10,
      top3ClickShare: 30 + Math.random() * 20,
      top3ConversionShare: Math.random() * 0.5,
      topASINs: generateMockASINs(keyword),
      trendData: generateTrendData(rank, volume, weeks),
    }
  })
}

function generateTrendData(baseRank: number, baseVolume: number, weeks: number) {
  const data = []
  const currentDate = new Date()
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekDate = new Date(currentDate)
    weekDate.setDate(weekDate.getDate() - (i * 7))
    
    // Add some variation
    const rankVariation = Math.floor((Math.random() - 0.5) * baseRank * 0.1)
    const volumeVariation = Math.floor((Math.random() - 0.5) * baseVolume * 0.1)
    
    data.push({
      week: weekDate.toISOString().split('T')[0],
      rank: Math.max(1, baseRank + rankVariation),
      searchVolume: Math.max(1000, baseVolume + volumeVariation),
    })
  }
  
  return data
}

function generateMockASINs(keyword: string) {
  const brands = ['MUSICOZY', 'LC-dolida', 'Perytong', 'Fulext', 'CozyPhones', 'MAXROCK']
  const asins = []
  
  for (let i = 0; i < 3; i++) {
    asins.push({
      asin: `B0${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      title: `${brands[i]} ${keyword} - Premium Quality`,
      clickShare: 15 - i * 2 + Math.random() * 2,
      conversionShare: Math.random() * 0.1,
      position: i + 1,
    })
  }
  
  return asins
}