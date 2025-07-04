'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  Send,
  User,
  Bot,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Sparkles
} from 'lucide-react'

import { AIResearchAgent, AIQuery, AIResponse } from '@/lib/ai-research-agent'

interface AIResearchChatProps {
  productId?: string
  userTier: 'free' | 'hunter' | 'pro' | 'enterprise'
  className?: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  insights?: {
    category: string
    insight: string
    confidence: number
    actionable: boolean
  }[]
  recommendations?: {
    priority: 'high' | 'medium' | 'low'
    action: string
    rationale: string
    timeline: string
  }[]
  followUpQuestions?: string[]
  tokensUsed?: number
}

export default function AIResearchChat({ productId, userTier, className }: AIResearchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionType, setSessionType] = useState<string>('product_validation')
  const [usageCount, setUsageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const usageLimit = AIResearchAgent.getUsageLimit(userTier)
  const canUseUnlimited = usageLimit === -1
  const hasUsageLeft = canUseUnlimited || usageCount < usageLimit

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI research assistant. I can help you analyze Amazon products, research markets, assess competition, and develop launch strategies. What would you like to explore?`,
      timestamp: new Date(),
      followUpQuestions: [
        "Is this product viable for Amazon FBA?",
        "What's the market size and competition level?",
        "How much should I budget for launch?",
        "What keywords should I target?"
      ]
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || !hasUsageLeft || isLoading) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const query: AIQuery = {
        question: input.trim(),
        context: {
          productId,
          sessionType,
          userTier
        }
      }

      const response: AIResponse = await AIResearchAgent.processQuery(query)

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        insights: response.insights,
        recommendations: response.recommendations,
        followUpQuestions: response.followUpQuestions,
        tokensUsed: response.tokensUsed
      }

      setMessages(prev => [...prev, assistantMessage])
      setUsageCount(prev => prev + 1)
    } catch (error) {
      console.error('AI Research error:', error)
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">AI Research Agent</CardTitle>
              <p className="text-sm text-gray-600">Interactive Amazon product research assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              {userTier === 'free' ? 'Limited' : userTier === 'pro' ? 'Unlimited' : userTier}
            </Badge>
            {!canUseUnlimited && (
              <Badge variant="outline">
                {usageCount}/{usageLimit} queries
              </Badge>
            )}
          </div>
        </div>
        
        {!canUseUnlimited && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Usage this month</span>
              <span>{usageCount}/{usageLimit}</span>
            </div>
            <Progress value={(usageCount / usageLimit) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Type Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: 'product_validation', label: 'Product Validation', icon: Target },
            { id: 'market_research', label: 'Market Research', icon: TrendingUp },
            { id: 'competitor_analysis', label: 'Competition', icon: User },
            { id: 'launch_strategy', label: 'Launch Strategy', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={sessionType === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSessionType(id)}
              className="flex items-center space-x-1"
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'} rounded-lg p-3 shadow-sm`}>
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <User className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Insights */}
                    {message.insights && message.insights.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-1" />
                          Key Insights
                        </h4>
                        {message.insights.map((insight, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-blue-800">{insight.category}</span>
                              <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                                {insight.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-blue-700">{insight.insight}</p>
                            {insight.actionable && (
                              <Badge className="mt-1 text-xs bg-green-100 text-green-800">
                                Actionable
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Recommendations
                        </h4>
                        {message.recommendations.map((rec, index) => (
                          <div key={index} className="p-2 bg-green-50 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                {rec.priority} priority
                              </Badge>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {rec.timeline}
                              </div>
                            </div>
                            <p className="font-medium text-green-800">{rec.action}</p>
                            <p className="text-green-700 text-xs mt-1">{rec.rationale}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested questions:</h4>
                        <div className="flex flex-wrap gap-1">
                          {message.followUpQuestions.map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickQuestion(question)}
                              className="text-xs h-7 px-2"
                              disabled={!hasUsageLeft}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tokens used */}
                    {message.tokensUsed && (
                      <div className="mt-2 text-xs text-gray-500">
                        {message.tokensUsed} tokens used
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={hasUsageLeft ? "Ask me anything about Amazon product research..." : "Upgrade to continue asking questions"}
              disabled={!hasUsageLeft || isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!hasUsageLeft && userTier === 'free' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <AlertCircle className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-orange-600">Upgrade for more queries</p>
                </div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || !hasUsageLeft || isLoading}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Upgrade prompt for free users */}
        {userTier === 'free' && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Unlock Unlimited AI Research</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Upgrade to Hunter ($299/year) or Pro ($999/year) for unlimited AI conversations, 
                  advanced analysis, and priority support.
                </p>
                <Button size="sm" className="mt-2">
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}