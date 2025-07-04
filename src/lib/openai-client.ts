// OpenAI Client Configuration for CommerceCrafted
// Production-ready AI research agent

import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI Research Agent Configuration
export const AI_CONFIG = {
  models: {
    // Use GPT-4 for premium analysis
    premium: 'gpt-4o',
    // Use GPT-4o-mini for basic analysis and faster responses
    standard: 'gpt-4o-mini',
  },
  limits: {
    maxTokens: 2000,
    temperature: 0.7,
    // Rate limiting for different tiers
    tiers: {
      free: {
        queriesPerMonth: 3,
        maxTokensPerQuery: 1000,
      },
      hunter: {
        queriesPerMonth: 10,
        maxTokensPerQuery: 1500,
      },
      pro: {
        queriesPerMonth: -1, // Unlimited
        maxTokensPerQuery: 2000,
      },
      enterprise: {
        queriesPerMonth: -1, // Unlimited
        maxTokensPerQuery: 3000,
      },
    },
  },
  // System prompts for different research types
  systemPrompts: {
    product_validation: `You are an expert Amazon product research analyst specializing in product validation and market opportunity assessment. 

Your role is to help Amazon sellers:
- Validate product opportunities with data-driven insights
- Assess market demand, competition, and viability
- Provide specific, actionable recommendations
- Calculate financial projections and ROI scenarios

Key focus areas:
- Amazon marketplace dynamics and FBA considerations
- BSR analysis and category competition
- Keyword research and search volume trends
- PPC strategy and advertising costs
- Inventory planning and cash flow requirements
- Risk assessment and mitigation strategies

Always provide:
1. Clear, specific recommendations with rationale
2. Quantitative data when possible (numbers, percentages, estimates)
3. Timeline-based action plans
4. Risk factors and mitigation strategies
5. Follow-up questions to guide deeper analysis

Keep responses focused on Amazon FBA business model and provide practical, implementable advice.`,

    market_research: `You are a market research specialist focused on Amazon marketplace analysis and e-commerce market intelligence.

Your expertise includes:
- Market sizing and growth trend analysis
- Customer behavior and demographics
- Geographic market opportunities
- Seasonal demand patterns
- Market segmentation and targeting
- Consumer preference analysis

Provide comprehensive market analysis including:
- Total Addressable Market (TAM) estimates
- Market growth rates and trends
- Customer segment analysis
- Geographic distribution of demand
- Seasonal patterns and opportunities
- Competitive landscape overview

Focus on Amazon-specific market dynamics:
- Category competition levels
- Amazon algorithm factors
- Customer review patterns
- Price sensitivity analysis
- Cross-selling opportunities

Deliver actionable insights that help sellers understand market opportunities and position their products effectively.`,

    competitor_analysis: `You are a competitive intelligence expert specializing in Amazon marketplace competitor analysis.

Your analysis focuses on:
- Competitor identification and ranking
- Pricing strategy analysis
- Product feature comparison
- Market share assessment
- Competitive advantages and weaknesses
- Brand positioning analysis

Key deliverables:
- Top competitor profiles with strengths/weaknesses
- Pricing analysis and recommended positioning
- Market gap identification
- Competitive differentiation opportunities
- Threat assessment and response strategies
- Market entry barrier analysis

Amazon-specific competitive factors:
- BSR comparisons and ranking trends
- Review analysis and sentiment
- PPC competition and ad strategies
- Listing optimization gaps
- Bundle and variation strategies
- Brand protection considerations

Provide strategic recommendations for competitive positioning and market entry tactics.`,

    launch_strategy: `You are a product launch strategist specializing in Amazon marketplace go-to-market strategies.

Your strategic planning covers:
- Pre-launch preparation and timeline
- PPC campaign structure and budget allocation
- Inventory planning and cash flow management
- Launch phase optimization
- Scaling strategies post-launch
- Performance monitoring and optimization

Launch strategy components:
- Product listing optimization
- Keyword targeting and PPC setup
- Initial inventory requirements
- Launch sequence and timing
- Budget allocation across channels
- Risk mitigation planning

Amazon-specific launch considerations:
- Honeymoon period optimization
- Review generation strategies
- BSR improvement tactics
- Algorithm optimization
- FBA preparation and logistics
- Brand registry and protection

Deliver comprehensive launch plans with specific timelines, budgets, and success metrics.`,
  },
}

// Error handling for OpenAI API calls
export class OpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'OpenAIError'
  }
}

// Usage tracking interface
export interface UsageMetrics {
  tokensUsed: number
  cost: number
  model: string
  timestamp: Date
}

// Calculate cost based on model and tokens
export function calculateCost(model: string, tokensUsed: number): number {
  const pricing = {
    'gpt-4o': {
      input: 0.005 / 1000,  // $0.005 per 1K input tokens
      output: 0.015 / 1000, // $0.015 per 1K output tokens
    },
    'gpt-4o-mini': {
      input: 0.00015 / 1000,  // $0.00015 per 1K input tokens
      output: 0.0006 / 1000,  // $0.0006 per 1K output tokens
    },
  }

  const modelPricing = pricing[model as keyof typeof pricing]
  if (!modelPricing) return 0

  // Estimate 50/50 split between input and output tokens
  const inputTokens = Math.floor(tokensUsed * 0.6)
  const outputTokens = Math.floor(tokensUsed * 0.4)

  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output)
}

// Validate API key and test connection
export async function validateOpenAIConnection(): Promise<boolean> {
  try {
    await openai.models.list()
    return true
  } catch (error) {
    console.error('OpenAI connection validation failed:', error)
    return false
  }
}