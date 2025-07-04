// Conversation Manager for AI Research Sessions
// Handles conversation memory and context persistence

import { AIResearchSession } from '@/types/deep-research'

export interface ConversationMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed?: number
  cost?: number
  timestamp: Date
}

export interface SessionContext {
  productId?: string
  sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy'
  userTier: 'free' | 'hunter' | 'pro' | 'enterprise'
  totalTokensUsed: number
  totalCost: number
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
}

// In-memory storage for development
// In production, this would be replaced with database operations
class ConversationStore {
  private sessions = new Map<string, AIResearchSession>()
  private messages = new Map<string, ConversationMessage[]>()

  // Create a new research session
  createSession(
    userId: string,
    sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy',
    productId?: string
  ): AIResearchSession {
    const session: AIResearchSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      sessionType,
      conversation: [],
      insights: [],
      recommendations: [],
      followUpActions: [],
      sessionStatus: 'active',
      tokensUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.sessions.set(session.id, session)
    this.messages.set(session.id, [])
    
    return session
  }

  // Get a session by ID
  getSession(sessionId: string): AIResearchSession | null {
    return this.sessions.get(sessionId) || null
  }

  // Get sessions for a user
  getUserSessions(userId: string): AIResearchSession[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId)
  }

  // Add a message to a session
  addMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    tokensUsed?: number,
    cost?: number
  ): ConversationMessage | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      role,
      content,
      tokensUsed,
      cost,
      timestamp: new Date()
    }

    // Add to messages store
    const messages = this.messages.get(sessionId) || []
    messages.push(message)
    this.messages.set(sessionId, messages)

    // Update session conversation
    session.conversation.push({
      role,
      content,
      timestamp: new Date()
    })

    // Update session metadata
    if (tokensUsed) {
      session.tokensUsed += tokensUsed
    }
    session.updatedAt = new Date()

    this.sessions.set(sessionId, session)
    
    return message
  }

  // Get conversation history for a session
  getConversationHistory(sessionId: string, limit?: number): ConversationMessage[] {
    const messages = this.messages.get(sessionId) || []
    
    if (limit) {
      return messages.slice(-limit)
    }
    
    return messages
  }

  // Update session insights
  addInsight(
    sessionId: string,
    insight: {
      category: string
      insight: string
      confidence: number
      actionable: boolean
    }
  ): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    session.insights.push(insight)
    session.updatedAt = new Date()
    this.sessions.set(sessionId, session)
    
    return true
  }

  // Update session recommendations
  addRecommendation(
    sessionId: string,
    recommendation: {
      priority: 'high' | 'medium' | 'low'
      action: string
      rationale: string
      timeline: string
    }
  ): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    session.recommendations.push(recommendation)
    session.updatedAt = new Date()
    this.sessions.set(sessionId, session)
    
    return true
  }

  // Archive a session
  archiveSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    session.sessionStatus = 'archived'
    session.updatedAt = new Date()
    this.sessions.set(sessionId, session)
    
    return true
  }

  // Delete a session
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId)
    this.messages.delete(sessionId)
    return deleted
  }

  // Get session context for AI calls
  getSessionContext(sessionId: string): SessionContext | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const messages = this.messages.get(sessionId) || []
    const totalTokensUsed = messages.reduce((sum, msg) => sum + (msg.tokensUsed || 0), 0)
    const totalCost = messages.reduce((sum, msg) => sum + (msg.cost || 0), 0)

    return {
      productId: session.productId,
      sessionType: session.sessionType,
      userTier: 'free', // This should come from user data
      totalTokensUsed,
      totalCost,
      insights: session.insights,
      recommendations: session.recommendations
    }
  }

  // Get conversation messages formatted for OpenAI
  getFormattedConversation(sessionId: string, limit: number = 6): Array<{
    role: 'user' | 'assistant'
    content: string
  }> {
    const messages = this.getConversationHistory(sessionId, limit)
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  }

  // Clear all data (for testing)
  clear(): void {
    this.sessions.clear()
    this.messages.clear()
  }
}

// Export singleton instance
export const conversationManager = new ConversationStore()

// Export types for external use
export type { AIResearchSession } from '@/types/deep-research'