/**
 * AI-Powered Pricing Trend Analysis Service
 * Analyzes historical pricing data to identify trends, patterns, and themes
 */

interface PriceDataPoint {
  date: string
  price: number
  asin?: string
  product_name?: string
}

interface PricingTheme {
  name: string
  type: 'trending_up' | 'trending_down' | 'seasonal' | 'stable' | 'volatile' | 'promotional'
  confidence: number
  description: string
  timeframe: string
  evidence: string[]
  impact: 'high' | 'medium' | 'low'
  actionable_insights: string[]
}

interface PricingAnalysisResult {
  overall_trend: 'bullish' | 'bearish' | 'sideways' | 'volatile'
  trend_strength: number // 0-100
  volatility_score: number // 0-100
  themes: PricingTheme[]
  market_insights: {
    average_price: number
    price_range: { min: number; max: number }
    price_stability: 'very_stable' | 'stable' | 'moderate' | 'volatile' | 'very_volatile'
    seasonal_patterns: Array<{
      period: string
      pattern: string
      strength: number
    }>
  }
  competitive_insights: {
    price_leaders: string[]
    price_followers: string[]
    outliers: string[]
    convergence_patterns: string[]
  }
  recommendations: {
    optimal_pricing_strategy: string
    timing_recommendations: string[]
    risk_factors: string[]
    opportunities: string[]
  }
}

class PricingAnalysisAI {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured for pricing analysis')
    }
  }

  /**
   * Analyze pricing trends using AI
   */
  async analyzePricingTrends(
    priceData: PriceDataPoint[],
    productNames: { [asin: string]: string } = {},
    timeframe: string = '1 year'
  ): Promise<PricingAnalysisResult | null> {
    if (!this.apiKey) {
      console.error('OpenAI API key not available')
      return null
    }

    try {
      // Prepare data summary for AI analysis
      const dataSummary = this.preparePricingDataSummary(priceData, productNames)
      
      const systemPrompt = `You are an expert pricing analyst specializing in Amazon marketplace dynamics. 
      Analyze the provided pricing data to identify trends, patterns, and actionable insights.
      
      Focus on:
      1. Overall market trend direction and strength
      2. Seasonal and cyclical patterns
      3. Competitive pricing behaviors
      4. Volatility and stability patterns
      5. Promotional patterns and their impact
      6. Market opportunity identification
      
      Provide specific, data-driven insights that can inform pricing strategies.`

      const userPrompt = `Analyze this Amazon marketplace pricing data over ${timeframe}:

PRICING DATA SUMMARY:
${dataSummary}

ANALYSIS REQUIREMENTS:
- Identify 3-5 key pricing themes with evidence
- Assess overall trend direction and strength
- Detect seasonal patterns and their significance
- Analyze competitive pricing behaviors
- Provide actionable pricing recommendations
- Quantify volatility and stability metrics

Return analysis in this JSON format:
{
  "overall_trend": "bullish|bearish|sideways|volatile",
  "trend_strength": 85,
  "volatility_score": 32,
  "themes": [
    {
      "name": "Q4 Seasonal Premium Pricing",
      "type": "seasonal",
      "confidence": 95,
      "description": "Consistent 15-20% price increases during Q4 holiday season",
      "timeframe": "October-December",
      "evidence": ["Price increases of 18% in Oct", "Peak pricing in Nov-Dec", "Return to baseline in Jan"],
      "impact": "high",
      "actionable_insights": ["Schedule price increases for October", "Capitalize on holiday demand", "Plan inventory accordingly"]
    }
  ],
  "market_insights": {
    "average_price": 24.99,
    "price_range": {"min": 19.99, "max": 32.99},
    "price_stability": "moderate",
    "seasonal_patterns": [
      {
        "period": "Q4",
        "pattern": "Premium pricing surge",
        "strength": 85
      }
    ]
  },
  "competitive_insights": {
    "price_leaders": ["ASIN1", "ASIN2"],
    "price_followers": ["ASIN3"],
    "outliers": ["ASIN4"],
    "convergence_patterns": ["Price clustering around $25 mark"]
  },
  "recommendations": {
    "optimal_pricing_strategy": "Dynamic pricing with seasonal adjustments",
    "timing_recommendations": ["Increase prices in Q4", "Lower prices in Q1 for volume"],
    "risk_factors": ["High volatility in spring months", "Competitive price wars"],
    "opportunities": ["Premium positioning gap at $35+", "Bundle pricing untapped"]
  }
}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const aiData = await response.json()
      const analysis = JSON.parse(aiData.choices[0].message.content)
      
      console.log('✅ AI pricing analysis completed successfully')
      return analysis

    } catch (error) {
      console.error('Error in AI pricing analysis:', error)
      return null
    }
  }

  /**
   * Prepare pricing data summary for AI analysis
   */
  private preparePricingDataSummary(
    priceData: PriceDataPoint[], 
    productNames: { [asin: string]: string }
  ): string {
    if (!priceData || priceData.length === 0) {
      return "No pricing data available"
    }

    // Sort data by date
    const sortedData = [...priceData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Calculate basic statistics
    const prices = sortedData.map(d => d.price)
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const volatility = this.calculateVolatility(prices)

    // Group by product if ASINs are provided
    const productGroups: { [asin: string]: PriceDataPoint[] } = {}
    sortedData.forEach(point => {
      if (point.asin) {
        if (!productGroups[point.asin]) {
          productGroups[point.asin] = []
        }
        productGroups[point.asin].push(point)
      }
    })

    // Detect trends
    const trendAnalysis = this.detectPriceTrends(sortedData)
    
    let summary = `MARKET OVERVIEW:
- Total data points: ${sortedData.length}
- Time period: ${sortedData[0]?.date} to ${sortedData[sortedData.length - 1]?.date}
- Average price: $${avgPrice.toFixed(2)}
- Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}
- Price volatility: ${volatility.toFixed(1)}%
- Overall trend: ${trendAnalysis.direction} (${trendAnalysis.strength}% confidence)

TEMPORAL PATTERNS:
${this.analyzeTemporalPatterns(sortedData)}

PRODUCT-SPECIFIC ANALYSIS:
${Object.keys(productGroups).map(asin => {
  const productData = productGroups[asin]
  const productName = productNames[asin] || asin
  const productPrices = productData.map(d => d.price)
  const productAvg = productPrices.reduce((sum, p) => sum + p, 0) / productPrices.length
  const productTrend = this.detectPriceTrends(productData)
  
  return `- ${productName} (${asin}): Avg $${productAvg.toFixed(2)}, Trend: ${productTrend.direction}`
}).join('\n')}

RECENT ACTIVITY:
${this.summarizeRecentActivity(sortedData.slice(-10))}
`

    return summary
  }

  /**
   * Calculate price volatility
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0
    
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length
    const standardDeviation = Math.sqrt(variance)
    
    return (standardDeviation / avg) * 100
  }

  /**
   * Detect price trends
   */
  private detectPriceTrends(data: PriceDataPoint[]): { direction: string; strength: number } {
    if (data.length < 3) return { direction: 'insufficient_data', strength: 0 }
    
    const prices = data.map(d => d.price)
    const first = prices[0]
    const last = prices[prices.length - 1]
    const change = ((last - first) / first) * 100
    
    let direction: string
    if (Math.abs(change) < 2) {
      direction = 'stable'
    } else if (change > 0) {
      direction = 'increasing'
    } else {
      direction = 'decreasing'
    }
    
    const strength = Math.min(Math.abs(change) * 10, 100)
    
    return { direction, strength }
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporalPatterns(data: PriceDataPoint[]): string {
    // Group by month to detect seasonal patterns
    const monthlyData: { [month: string]: number[] } = {}
    
    data.forEach(point => {
      const date = new Date(point.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = []
      }
      monthlyData[monthKey].push(point.price)
    })
    
    const monthlyAvg = Object.keys(monthlyData).map(month => {
      const prices = monthlyData[month]
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
      return `${month}: $${avg.toFixed(2)}`
    })
    
    return monthlyAvg.join(', ')
  }

  /**
   * Summarize recent pricing activity
   */
  private summarizeRecentActivity(recentData: PriceDataPoint[]): string {
    if (recentData.length === 0) return "No recent activity"
    
    const prices = recentData.map(d => d.price)
    const minRecent = Math.min(...prices)
    const maxRecent = Math.max(...prices)
    const avgRecent = prices.reduce((sum, price) => sum + price, 0) / prices.length
    
    return `Last ${recentData.length} data points: $${minRecent.toFixed(2)} - $${maxRecent.toFixed(2)}, avg $${avgRecent.toFixed(2)}`
  }
}

export const pricingAnalysisAI = new PricingAnalysisAI()
export type { PriceDataPoint, PricingTheme, PricingAnalysisResult }