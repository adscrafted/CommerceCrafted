// AI Research API Route
// Real OpenAI integration for CommerceCrafted research agent

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { openai, AI_CONFIG, OpenAIError, calculateCost } from '@/lib/openai-client'
import { aiLogger, createRequestLog, logAIError } from '@/lib/ai-logger'
import { authOptions } from '@/lib/auth'

export interface AIResearchRequest {
  question: string
  sessionType?: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy'
  context?: {
    productId?: string
    userTier?: 'free' | 'hunter' | 'pro' | 'enterprise'
    sessionId?: string
    conversationHistory?: Array<{
      role: 'user' | 'assistant'
      content: string
    }>
  }
}

export interface AIResearchResponse {
  answer: string
  insights: Array<{
    category: string
    insight: string
    confidence: number
    actionable: boolean
  }>
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    rationale: string
    timeline: string
  }>
  followUpQuestions: string[]
  tokensUsed: number
  cost: number
  model: string
}

// POST /api/ai/research
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: AIResearchRequest = await request.json()
    const { question, sessionType = 'product_validation', context } = body

    if (!question?.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Get user tier from context or default to free
    const userTier = context?.userTier || 'free'
    
    // Check usage limits for the user's tier
    const tierLimits = AI_CONFIG.limits.tiers[userTier]
    if (tierLimits.queriesPerMonth === 0) {
      return NextResponse.json(
        { error: 'Upgrade your plan to access AI research features' },
        { status: 403 }
      )
    }

    // TODO: Implement actual usage tracking in database
    // For now, we'll proceed with the request

    // Determine model based on user tier
    const model = userTier === 'free' ? AI_CONFIG.models.standard : AI_CONFIG.models.premium
    const maxTokens = tierLimits.maxTokensPerQuery

    // Get system prompt for session type
    const systemPrompt = AI_CONFIG.systemPrompts[sessionType]

    // Build conversation context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history if provided
    if (context?.conversationHistory && context.conversationHistory.length > 0) {
      // Keep only the last 6 messages to manage token usage
      const recentHistory = context.conversationHistory.slice(-6)
      messages.push(...recentHistory)
    }

    // Add current question
    messages.push({ role: 'user', content: question })

    // Track start time for performance monitoring
    const startTime = Date.now()

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: AI_CONFIG.limits.temperature,
      response_format: { type: 'json_object' },
      tools: [
        {
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
        }
      ],
      tool_choice: { type: 'function', function: { name: 'provide_research_analysis' } }
    })

    // Extract the structured response
    const toolCall = completion.choices[0]?.message?.tool_calls?.[0]
    if (!toolCall || toolCall.function.name !== 'provide_research_analysis') {
      throw new OpenAIError('Invalid response format from OpenAI')
    }

    const analysisData = JSON.parse(toolCall.function.arguments)
    const tokensUsed = completion.usage?.total_tokens || 0
    const cost = calculateCost(model, tokensUsed)
    const responseTime = Date.now() - startTime

    // Log the successful request
    aiLogger.logRequest(createRequestLog(
      session.user.id!,
      context?.sessionId,
      sessionType,
      question,
      userTier,
      model,
      tokensUsed,
      cost,
      responseTime,
      true
    ))

    // Log usage event
    aiLogger.logUsage({
      userId: session.user.id!,
      userTier,
      action: 'query',
      metadata: {
        sessionType,
        tokensUsed,
        cost
      }
    })

    // TODO: Save conversation to database for context management
    // TODO: Update user usage tracking

    const response: AIResearchResponse = {
      answer: analysisData.answer,
      insights: analysisData.insights,
      recommendations: analysisData.recommendations,
      followUpQuestions: analysisData.followUpQuestions,
      tokensUsed,
      cost,
      model
    }

    return NextResponse.json(response)

  } catch (error) {
    // Log the error with context
    logAIError(error instanceof Error ? error : new Error(String(error)), {
      userId: session?.user?.id,
      sessionId: context?.sessionId,
      operation: 'ai_research_query',
      metadata: {
        sessionType,
        userTier,
        question: question.substring(0, 100) // First 100 chars for context
      }
    })

    // Log failed request
    if (session?.user?.id) {
      aiLogger.logRequest(createRequestLog(
        session.user.id,
        context?.sessionId,
        sessionType,
        question,
        userTier,
        model,
        0,
        0,
        Date.now() - (startTime || Date.now()),
        false,
        error instanceof Error ? error.message : String(error)
      ))
    }

    // Handle OpenAI specific errors
    if (error instanceof OpenAIError) {
      return NextResponse.json(
        { 
          error: 'AI service error',
          details: error.message,
          code: 'OPENAI_ERROR'
        },
        { status: error.statusCode || 500 }
      )
    }

    // Handle rate limiting
    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT'
        },
        { status: 429 }
      )
    }

    // Handle quota exceeded
    if (error && typeof error === 'object' && 'status' in error && error.status === 402) {
      return NextResponse.json(
        { 
          error: 'API quota exceeded',
          details: 'OpenAI API quota has been exceeded.',
          code: 'QUOTA_EXCEEDED'
        },
        { status: 402 }
      )
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// GET /api/ai/research/status - Check AI service status
export async function GET() {
  try {
    // Simple health check
    const models = await openai.models.list()
    const isHealthy = models.data.length > 0

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      modelsAvailable: models.data.length
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Cannot connect to OpenAI API',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}