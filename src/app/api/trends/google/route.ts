import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { z } from 'zod'

const execAsync = promisify(exec)

// Request validation schema
const requestSchema = z.object({
  keywords: z.array(z.string()).min(1).max(5),
  timeframe: z.string().optional().default('today 12-m'),
  geo: z.string().optional().default('US')
})

// Cache for storing trends data
const trendsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keywords, timeframe, geo } = requestSchema.parse(body)
    
    // Create cache key
    const cacheKey = `${keywords.join(',')}-${timeframe}-${geo}`
    
    // Check cache
    const cached = trendsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        ...cached.data,
        cached: true
      })
    }
    
    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'google_trends.py')
    
    // Execute Python script with keywords
    const command = `python3 ${scriptPath} ${keywords.map(k => `"${k}"`).join(' ')}`
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        env: {
          ...process.env,
          PYTHONPATH: path.join(process.cwd(), 'scripts')
        }
      })
      
      if (stderr) {
        console.error('Python script stderr:', stderr)
      }
      
      const result = JSON.parse(stdout)
      
      // Cache the result
      trendsCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      return NextResponse.json(result)
      
    } catch (execError: any) {
      // If pytrends is not installed, return mock data
      if (execError.message.includes('ModuleNotFoundError') || execError.message.includes('pytrends')) {
        return NextResponse.json({
          keywords,
          timeframe,
          geo,
          mock: true,
          message: 'Using mock data. Install pytrends: pip install pytrends',
          interest_over_time: generateMockTrendData(keywords),
          related_queries: generateMockRelatedQueries(keywords),
          seasonality: generateMockSeasonality(keywords)
        })
      }
      
      throw execError
    }
    
  } catch (error) {
    console.error('Google Trends API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Google Trends data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Mock data generators for development/fallback
function generateMockTrendData(keywords: string[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  
  return months.map((month, index) => {
    const dataPoint: any = {
      date: `${currentYear}-${String(index + 1).padStart(2, '0')}-01`,
      month,
      year: currentYear
    }
    
    keywords.forEach(keyword => {
      // Generate realistic trend values with seasonality
      const baseValue = 50 + Math.random() * 30
      const seasonalMultiplier = 1 + 0.3 * Math.sin((index / 12) * 2 * Math.PI)
      dataPoint[keyword] = Math.round(baseValue * seasonalMultiplier)
    })
    
    return dataPoint
  })
}

function generateMockRelatedQueries(keywords: string[]) {
  const result: any = {}
  
  keywords.forEach(keyword => {
    result[keyword] = {
      top: [
        { query: `${keyword} amazon`, value: 100 },
        { query: `best ${keyword}`, value: 85 },
        { query: `${keyword} reviews`, value: 70 },
        { query: `cheap ${keyword}`, value: 65 },
        { query: `${keyword} price`, value: 60 }
      ],
      rising: [
        { query: `${keyword} 2024`, value: 'Breakout' },
        { query: `wireless ${keyword}`, value: '+250%' },
        { query: `${keyword} deals`, value: '+180%' },
        { query: `portable ${keyword}`, value: '+150%' }
      ]
    }
  })
  
  return result
}

function generateMockSeasonality(keywords: string[]) {
  const result: any = {}
  
  keywords.forEach(keyword => {
    const monthlyData = [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 82 },
      { month: 'Mar', value: 78 },
      { month: 'Apr', value: 75 },
      { month: 'May', value: 70 },
      { month: 'Jun', value: 68 },
      { month: 'Jul', value: 65 },
      { month: 'Aug', value: 70 },
      { month: 'Sep', value: 75 },
      { month: 'Oct', value: 80 },
      { month: 'Nov', value: 90 },
      { month: 'Dec', value: 100 }
    ]
    
    result[keyword] = {
      monthly_averages: monthlyData,
      peak_season: 'Dec',
      peak_value: 100,
      low_season: 'Jul',
      low_value: 65,
      seasonality_score: 35.0
    }
  })
  
  return result
}