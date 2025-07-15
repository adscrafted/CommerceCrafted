// OpenAI Integration for AI-Powered Product Analysis
// Docs: https://platform.openai.com/docs/api-reference

interface OpenAIConfig {
  apiKey: string
  model: string
  maxTokens: number
}

interface ProductAnalysisPrompt {
  asin: string
  productTitle: string
  brand?: string
  category?: string
  price?: number
  bsr?: number
  rating?: number
  reviewCount?: number
  competitorData?: any
  keywordData?: any
  marketData?: any
}

interface AIAnalysisResult {
  opportunityScore: number
  competitionScore: number
  demandScore: number
  feasibilityScore: number
  timingScore: number
  overallScore: number
  insights: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  recommendations: {
    pricing: string
    marketing: string
    positioning: string
    launch: string
  }
  marketAnalysis: {
    size: string
    trend: string
    competition: string
    barriers: string
  }
  reasoning: string
}

class OpenAIAnalysis {
  private config: OpenAIConfig

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini', // Use the faster, cheaper model for analysis
      maxTokens: 4000
    }

    if (!this.config.apiKey) {
      console.warn('OpenAI API key not configured')
    }
  }

  /**
   * Generate comprehensive product analysis using AI
   */
  async analyzeProduct(promptData: ProductAnalysisPrompt): Promise<AIAnalysisResult | null> {
    try {
      const systemPrompt = `You are an expert Amazon product research analyst with 10+ years of experience. 
      Analyze the provided product data and return a comprehensive analysis in the exact JSON format specified.
      
      Scoring Criteria (0-100):
      - Opportunity Score: Market size, demand potential, growth trajectory
      - Competition Score: Competitor strength, market saturation, differentiation potential (higher = less competition)
      - Demand Score: Search volume, customer interest, seasonal trends
      - Feasibility Score: Entry barriers, startup costs, complexity
      - Timing Score: Market timing, trends, seasonality factors
      
      Base your analysis on real market dynamics, competitive landscape, and Amazon selling best practices.`

      const userPrompt = `Analyze this Amazon product opportunity:

PRODUCT DETAILS:
- ASIN: ${promptData.asin}
- Title: ${promptData.productTitle}
- Brand: ${promptData.brand || 'Unknown'}
- Category: ${promptData.category || 'Unknown'}
- Price: $${promptData.price || 'Unknown'}
- BSR: ${promptData.bsr ? `#${promptData.bsr.toLocaleString()}` : 'Unknown'}
- Rating: ${promptData.rating || 'Unknown'}/5
- Reviews: ${promptData.reviewCount?.toLocaleString() || 'Unknown'}

ADDITIONAL DATA:
${promptData.competitorData ? `Competitor Analysis: ${JSON.stringify(promptData.competitorData, null, 2)}` : ''}
${promptData.keywordData ? `Keyword Data: ${JSON.stringify(promptData.keywordData, null, 2)}` : ''}
${promptData.marketData ? `Market Data: ${JSON.stringify(promptData.marketData, null, 2)}` : ''}

Return ONLY a valid JSON response in this exact format:
{
  "opportunityScore": 85,
  "competitionScore": 72,
  "demandScore": 88,
  "feasibilityScore": 75,
  "timingScore": 90,
  "overallScore": 82,
  "insights": {
    "strengths": ["High demand niche", "Growing market trend", "Quality differentiation potential"],
    "weaknesses": ["Moderate competition", "Seasonal dependency"],
    "opportunities": ["Untapped premium segment", "Bundle opportunities", "International expansion"],
    "threats": ["New competitors entering", "Price competition", "Platform policy changes"]
  },
  "recommendations": {
    "pricing": "Launch at $24.99, premium positioning with value-added features",
    "marketing": "Focus on sleep quality benefits, target health-conscious consumers",
    "positioning": "Premium comfort with smart technology integration",
    "launch": "90-day launch strategy with PPC budget of $75/day, aim for 100+ reviews"
  },
  "marketAnalysis": {
    "size": "$1.2B sleep accessories market, growing 8% annually",
    "trend": "Strong upward trend driven by wellness awareness",
    "competition": "Medium intensity, opportunity for premium positioning",
    "barriers": "Low entry barriers, requires strong marketing and reviews"
  },
  "reasoning": "This product shows strong potential due to growing wellness market, moderate competition allowing for differentiation, and clear customer pain points that can be addressed through superior product design and marketing."
}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: 0.3, // Lower temperature for more consistent analysis
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        try {
          const analysis = JSON.parse(data.choices[0].message.content)
          console.log('AI analysis generated successfully for ASIN:', promptData.asin)
          return analysis
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError)
          return null
        }
      }

      return null
    } catch (error) {
      console.error('Error generating AI analysis:', error)
      return null
    }
  }

  /**
   * Generate market intelligence insights
   */
  async generateMarketInsights(productData: any): Promise<string | null> {
    try {
      const prompt = `As an Amazon market research expert, provide 3-4 key market insights for this product category:

Product: ${productData.title}
Category: ${productData.category}
Price Range: $${productData.price}
Current BSR: ${productData.bsr}

Focus on:
1. Market trends and growth potential
2. Customer behavior patterns
3. Competitive dynamics
4. Pricing strategies

Keep insights concise, actionable, and specific to Amazon marketplace dynamics.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.4
        })
      })

      const data = await response.json()
      return data.choices?.[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating market insights:', error)
      return null
    }
  }

  /**
   * Generate launch strategy recommendations
   */
  async generateLaunchStrategy(productData: any, competitorData?: any): Promise<string | null> {
    try {
      const prompt = `Create a 90-day Amazon launch strategy for this product:

Product: ${productData.title}
Price: $${productData.price}
Category: ${productData.category}
Target BSR: Top 1000 in category

Include:
1. Pre-launch preparation (Week 1-2)
2. Soft launch phase (Week 3-6) 
3. Scale-up phase (Week 7-12)
4. PPC strategy and budget allocation
5. Review generation tactics
6. Key metrics to track

${competitorData ? `Competitor insights: ${JSON.stringify(competitorData)}` : ''}

Format as a clear, actionable roadmap.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
          temperature: 0.5
        })
      })

      const data = await response.json()
      return data.choices?.[0]?.message?.content || null
    } catch (error) {
      console.error('Error generating launch strategy:', error)
      return null
    }
  }

  /**
   * Generate keyword opportunities analysis
   */
  async analyzeKeywordOpportunities(keywordData: any, productTitle: string): Promise<string | null> {
    try {
      const prompt = `Analyze these keyword opportunities for Amazon PPC campaigns:

Product: ${productTitle}
Keyword Data: ${JSON.stringify(keywordData, null, 2)}

Provide:
1. Top 5 high-opportunity keywords with rationale
2. Long-tail keyword strategies
3. Negative keyword recommendations
4. Bidding strategy suggestions
5. Campaign structure recommendations

Focus on practical, actionable PPC insights for immediate implementation.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.4
        })
      })

      const data = await response.json()
      return data.choices?.[0]?.message?.content || null
    } catch (error) {
      console.error('Error analyzing keyword opportunities:', error)
      return null
    }
  }
}

export const openaiAnalysis = new OpenAIAnalysis()
export type { ProductAnalysisPrompt, AIAnalysisResult }