// Streaming AI Research API Route
// Provides real-time streaming responses for better UX

import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { openai, AI_CONFIG, OpenAIError, calculateCost } from '@/lib/openai-client'
import { conversationManager } from '@/lib/conversation-manager'

export interface StreamingAIResearchRequest {
  question: string
  sessionId?: string
  sessionType?: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy'
  context?: {
    productId?: string
    userTier?: 'free' | 'hunter' | 'pro' | 'enterprise'
  }
}

// POST /api/ai/research/stream
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body: StreamingAIResearchRequest = await request.json()
    const { question, sessionId, sessionType = 'product_validation', context } = body

    if (!question?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get or create session
    let researchSession
    if (sessionId) {
      researchSession = conversationManager.getSession(sessionId)
      if (!researchSession) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    } else {
      researchSession = conversationManager.createSession(
        authUser.id,
        sessionType,
        context?.productId
      )
    }

    // Get user tier from context or default to free
    const userTier = context?.userTier || 'free'
    
    // Check usage limits for the user's tier
    const tierLimits = AI_CONFIG.limits.tiers[userTier]
    if (tierLimits.queriesPerMonth === 0) {
      return new Response(
        JSON.stringify({ error: 'Upgrade your plan to access AI research features' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Add user message to conversation
    conversationManager.addMessage(researchSession.id, 'user', question)

    // Determine model based on user tier
    const model = userTier === 'free' ? AI_CONFIG.models.standard : AI_CONFIG.models.premium
    const maxTokens = tierLimits.maxTokensPerQuery

    // Get system prompt for session type
    const systemPrompt = AI_CONFIG.systemPrompts[sessionType]

    // Build conversation context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history (keep last 6 messages)
    const conversationHistory = conversationManager.getFormattedConversation(researchSession.id, 6)
    messages.push(...conversationHistory)

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenAI API with streaming
          const completion = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: maxTokens,
            temperature: AI_CONFIG.limits.temperature,
            stream: true,
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

          let fullResponse = ''
          let tokensUsed = 0

          // Send initial metadata
          const metadata = {
            type: 'metadata',
            sessionId: researchSession.id,
            model,
            userTier,
            timestamp: new Date().toISOString()
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`))

          // Process streaming chunks
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta
            
            if (delta?.tool_calls) {
              const toolCall = delta.tool_calls[0]
              if (toolCall?.function?.arguments) {
                fullResponse += toolCall.function.arguments
                
                // Send streaming chunk
                const streamChunk = {
                  type: 'chunk',
                  content: toolCall.function.arguments
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(streamChunk)}\n\n`))
              }
            }

            // Track token usage if available
            if (chunk.usage) {
              tokensUsed = chunk.usage.total_tokens
            }
          }

          // Parse the complete response
          try {
            const analysisData = JSON.parse(fullResponse)
            const cost = calculateCost(model, tokensUsed)

            // Add assistant message to conversation
            conversationManager.addMessage(
              researchSession.id,
              'assistant',
              analysisData.answer,
              tokensUsed,
              cost
            )

            // Add insights and recommendations to session
            analysisData.insights?.forEach((insight: any) => {
              conversationManager.addInsight(researchSession.id, insight)
            })

            analysisData.recommendations?.forEach((rec: any) => {
              conversationManager.addRecommendation(researchSession.id, rec)
            })

            // Send final result
            const finalResult = {
              type: 'complete',
              analysis: analysisData,
              tokensUsed,
              cost,
              sessionId: researchSession.id
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalResult)}\n\n`))

            // Log the request for debugging
            console.log('Streaming AI Research Request:', {
              userId: authUser.id,
              sessionId: researchSession.id,
              sessionType,
              tokensUsed,
              cost,
              model,
              timestamp: new Date().toISOString()
            })

          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError)
            const error = {
              type: 'error',
              message: 'Failed to parse AI response',
              code: 'PARSE_ERROR'
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(error)}\n\n`))
          }

          // Close the stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

        } catch (error) {
          console.error('Streaming AI Research Error:', error)
          
          let errorMessage = 'An unexpected error occurred'
          let errorCode = 'INTERNAL_ERROR'

          if (error instanceof OpenAIError) {
            errorMessage = 'AI service error'
            errorCode = 'OPENAI_ERROR'
          } else if (error && typeof error === 'object' && 'status' in error) {
            if ((error as any).status === 429) {
              errorMessage = 'Rate limit exceeded'
              errorCode = 'RATE_LIMIT'
            } else if ((error as any).status === 402) {
              errorMessage = 'API quota exceeded'
              errorCode = 'QUOTA_EXCEEDED'
            }
          }

          const errorResponse = {
            type: 'error',
            message: errorMessage,
            code: errorCode
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('Stream setup error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to initialize stream',
        code: 'STREAM_INIT_ERROR'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}