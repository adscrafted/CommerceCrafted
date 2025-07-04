// AI Research Agent for CommerceCrafted
// Interactive AI assistant for deep Amazon product research
// Now powered by real OpenAI API integration

import { AIResearchSession } from '@/types/deep-research'
import { openai, AI_CONFIG, OpenAIError, calculateCost } from '@/lib/openai-client'
import { conversationManager } from '@/lib/conversation-manager'

export interface AIQuery {
  question: string
  context?: {
    productId?: string
    sessionType?: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy'
    userTier?: 'free' | 'hunter' | 'pro' | 'enterprise'
    conversationHistory?: Array<{
      role: 'user' | 'assistant'
      content: string
    }>
  }
}

export interface AIResponse {
  answer: string
  insights: {
    category: string
    insight: string
    confidence: number
    actionable: boolean
  }[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    action: string
    rationale: string
    timeline: string
  }[]
  followUpQuestions: string[]
  tokensUsed: number
  cost: number
  model: string
  error?: string
}

export class AIResearchAgent {
  // Track usage for rate limiting
  private static usageCache = new Map<string, { count: number; resetDate: Date }>()

  static async processQuery(query: AIQuery): Promise<AIResponse> {
    const { question, context } = query
    const sessionType = context?.sessionType || 'product_validation'
    const userTier = context?.userTier || 'free'
    
    try {
      // Check usage limits
      const canUse = await this.checkUsageLimit(userTier)
      if (!canUse) {
        return {
          answer: `You've reached your monthly query limit for the ${userTier} tier. Upgrade to continue using the AI research agent.`,
          insights: [],
          recommendations: [{
            priority: 'high' as const,
            action: 'Upgrade your subscription plan',
            rationale: 'Access more AI queries and advanced features',
            timeline: 'Immediate'
          }],
          followUpQuestions: [],
          tokensUsed: 0,
          cost: 0,
          model: 'none',
          error: 'USAGE_LIMIT_EXCEEDED'
        }
      }
      
      // Make real OpenAI API call
      return await this.callOpenAI(question, sessionType, userTier, context?.conversationHistory)
      
    } catch (error) {
      console.error('AI Research Agent Error:', error)
      return this.handleError(error, userTier)
    }
  }

  static async startResearchSession(
    userId: string, 
    sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy', 
    productId?: string
  ): Promise<AIResearchSession> {
    return conversationManager.createSession(userId, sessionType, productId)
  }

  static async continueSession(
    sessionId: string,
    question: string,
    context?: any
  ): Promise<AIResponse> {
    // Load session from conversation manager
    const session = conversationManager.getSession(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }
    
    // Get conversation history for context
    const conversationHistory = conversationManager.getFormattedConversation(sessionId, 6)
    
    // Merge context with conversation history
    const enrichedContext = {
      ...context,
      sessionType: session.sessionType,
      conversationHistory
    }
    
    // Process the query with context
    const response = await this.processQuery({ question, context: enrichedContext })
    
    // Add messages to conversation manager
    conversationManager.addMessage(sessionId, 'user', question)
    conversationManager.addMessage(sessionId, 'assistant', response.answer, response.tokensUsed, response.cost)
    
    // Add insights and recommendations to session
    response.insights.forEach(insight => {
      conversationManager.addInsight(sessionId, insight)
    })
    
    response.recommendations.forEach(rec => {
      conversationManager.addRecommendation(sessionId, rec)
    })
    
    return response
  }

  private static async callOpenAI(
    question: string,
    sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy',
    userTier: string,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIResponse> {
    // Determine model based on user tier
    const model = userTier === 'free' ? AI_CONFIG.models.standard : AI_CONFIG.models.premium
    const maxTokens = AI_CONFIG.limits.tiers[userTier].maxTokensPerQuery
    
    // Get system prompt for session type
    const systemPrompt = AI_CONFIG.systemPrompts[sessionType]
    
    // Build conversation context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]
    
    // Add conversation history if provided (keep last 6 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6)
      messages.push(...recentHistory)
    }
    
    // Add current question
    messages.push({ role: 'user', content: question })
    
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: AI_CONFIG.limits.temperature,
        tools: [{
          type: 'function',
          function: {
            name: 'provide_research_analysis',
            description: 'Provide structured Amazon product research analysis',
            parameters: {
              type: 'object',
              properties: {
                answer: {
                  type: 'string',
                  description: 'Comprehensive answer to the research question'
                },
                insights: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string' },
                      insight: { type: 'string' },
                      confidence: { type: 'number', minimum: 0, maximum: 100 },
                      actionable: { type: 'boolean' }
                    },
                    required: ['category', 'insight', 'confidence', 'actionable']
                  }
                },
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      action: { type: 'string' },
                      rationale: { type: 'string' },
                      timeline: { type: 'string' }
                    },
                    required: ['priority', 'action', 'rationale', 'timeline']
                  }
                },
                followUpQuestions: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['answer', 'insights', 'recommendations', 'followUpQuestions']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_research_analysis' } }
      })
      
      // Extract structured response
      const toolCall = completion.choices[0]?.message?.tool_calls?.[0]
      if (!toolCall || toolCall.function.name !== 'provide_research_analysis') {
        throw new OpenAIError('Invalid response format from OpenAI')
      }
      
      const analysisData = JSON.parse(toolCall.function.arguments)
      const tokensUsed = completion.usage?.total_tokens || 0
      const cost = calculateCost(model, tokensUsed)
      
      // Track usage
      this.trackUsage(userTier)
      
      return {
        answer: analysisData.answer,
        insights: analysisData.insights,
        recommendations: analysisData.recommendations,
        followUpQuestions: analysisData.followUpQuestions,
        tokensUsed,
        cost,
        model
      }
      
    } catch (error) {
      throw new OpenAIError(
        `OpenAI API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error && typeof error === 'object' && 'status' in error ? (error as any).status : undefined,
        error
      )
    }
  }

  // Check usage limits for different tiers
  private static async checkUsageLimit(userTier: string): Promise<boolean> {
    const tierLimit = AI_CONFIG.limits.tiers[userTier].queriesPerMonth
    
    // Unlimited for pro and enterprise
    if (tierLimit === -1) return true
    
    // Check current usage (simplified in-memory tracking)
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`
    const userUsage = this.usageCache.get(`${userTier}_${currentMonth}`)
    
    if (!userUsage) {
      // First use this month
      return true
    }
    
    // Check if reset date has passed
    if (now > userUsage.resetDate) {
      // Reset usage for new month
      this.usageCache.delete(`${userTier}_${currentMonth}`)
      return true
    }
    
    return userUsage.count < tierLimit
  }
  
  // Track usage for rate limiting
  private static trackUsage(userTier: string): void {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`
    const key = `${userTier}_${currentMonth}`
    
    const existing = this.usageCache.get(key)
    if (existing) {
      existing.count += 1
    } else {
      // Set reset date to first day of next month
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      this.usageCache.set(key, { count: 1, resetDate })
    }
  }
  
  // Handle errors and provide user-friendly responses
  private static handleError(error: unknown, userTier: string): AIResponse {
    console.error('AI Research Agent Error:', error)
    
    if (error instanceof OpenAIError) {
      return {
        answer: 'I encountered an issue while processing your request. Please try again in a few moments.',
        insights: [],
        recommendations: [{
          priority: 'medium' as const,
          action: 'Retry your question',
          rationale: 'Temporary service interruption',
          timeline: 'Try again in 1-2 minutes'
        }],
        followUpQuestions: [],
        tokensUsed: 0,
        cost: 0,
        model: 'none',
        error: 'AI_SERVICE_ERROR'
      }
    }
    
    // Rate limit error
    if (error && typeof error === 'object' && 'status' in error && (error as any).status === 429) {
      return {
        answer: 'Our AI service is currently experiencing high demand. Please try again in a few minutes.',
        insights: [],
        recommendations: [{
          priority: 'low' as const,
          action: 'Wait and retry',
          rationale: 'Service temporarily overloaded',
          timeline: '5-10 minutes'
        }],
        followUpQuestions: [],
        tokensUsed: 0,
        cost: 0,
        model: 'none',
        error: 'RATE_LIMIT_ERROR'
      }
    }
    
    // Generic error
    return {
      answer: 'I apologize, but I cannot process your request right now. Please try again later or contact support if the issue persists.',
      insights: [],
      recommendations: [{
        priority: 'low' as const,
        action: 'Contact support if issue persists',
        rationale: 'Unexpected technical issue',
        timeline: 'If problem continues after multiple attempts'
      }],
      followUpQuestions: [],
      tokensUsed: 0,
      cost: 0,
      model: 'none',
      error: 'UNKNOWN_ERROR'
    }
  }









  // Usage tracking for different tiers
  static getUsageLimit(userTier: string): number {
    return AI_CONFIG.limits.tiers[userTier]?.queriesPerMonth || 0
  }
  
  // Get current usage for a user tier
  static getCurrentUsage(userTier: string): number {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`
    const usage = this.usageCache.get(`${userTier}_${currentMonth}`)
    return usage?.count || 0
  }
  
  // Check if user can use specific features based on tier
  static canUseFeature(userTier: string, feature: string): boolean {
    const tierFeatures = {
      'free': ['basic_analysis'],
      'hunter': ['basic_analysis', 'keyword_research', 'basic_ppc'],
      'pro': ['basic_analysis', 'keyword_research', 'advanced_ppc', 'financial_modeling', 'competitor_analysis'],
      'enterprise': ['all_features']
    }
    
    const userFeatures = tierFeatures[userTier as keyof typeof tierFeatures] || []
    return userFeatures.includes(feature) || userFeatures.includes('all_features')
  }
  
  // Get usage statistics for dashboard
  static getUsageStats(userTier: string): {
    used: number
    limit: number
    resetDate: Date | null
  } {
    const limit = this.getUsageLimit(userTier)
    const used = this.getCurrentUsage(userTier)
    
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`
    const usage = this.usageCache.get(`${userTier}_${currentMonth}`)
    
    return {
      used,
      limit,
      resetDate: usage?.resetDate || null
    }
  }
  
  // Clear usage cache (for testing or manual reset)
  static clearUsageCache(): void {
    this.usageCache.clear()
  }
}