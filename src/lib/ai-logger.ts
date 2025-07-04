// AI Research Logging Utility
// Comprehensive logging for debugging and monitoring

export interface AIRequestLog {
  id: string
  userId: string
  sessionId?: string
  sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy'
  question: string
  userTier: 'free' | 'hunter' | 'pro' | 'enterprise'
  model: string
  tokensUsed: number
  cost: number
  responseTime: number
  success: boolean
  error?: string
  timestamp: Date
}

export interface AIUsageLog {
  userId: string
  userTier: 'free' | 'hunter' | 'pro' | 'enterprise'
  action: 'query' | 'session_start' | 'session_end'
  metadata?: Record<string, any>
  timestamp: Date
}

export interface AIErrorLog {
  id: string
  userId?: string
  sessionId?: string
  error: string
  errorCode?: string
  stack?: string
  context?: Record<string, any>
  timestamp: Date
}

class AILogger {
  private requestLogs: AIRequestLog[] = []
  private usageLogs: AIUsageLog[] = []
  private errorLogs: AIErrorLog[] = []
  private maxLogSize = 1000 // Keep last 1000 logs in memory

  // Log a successful AI request
  logRequest(data: Omit<AIRequestLog, 'id' | 'timestamp'>): void {
    const log: AIRequestLog = {
      ...data,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.requestLogs.push(log)
    this.trimLogs('requests')

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Request:', {
        userId: log.userId,
        sessionType: log.sessionType,
        model: log.model,
        tokensUsed: log.tokensUsed,
        cost: log.cost,
        responseTime: log.responseTime,
        success: log.success
      })
    }

    // In production, send to logging service (e.g., Winston, DataDog, etc.)
    this.sendToLoggingService('request', log)
  }

  // Log usage events
  logUsage(data: Omit<AIUsageLog, 'timestamp'>): void {
    const log: AIUsageLog = {
      ...data,
      timestamp: new Date()
    }

    this.usageLogs.push(log)
    this.trimLogs('usage')

    if (process.env.NODE_ENV === 'development') {
      console.log('AI Usage:', {
        userId: log.userId,
        userTier: log.userTier,
        action: log.action
      })
    }

    this.sendToLoggingService('usage', log)
  }

  // Log errors
  logError(data: Omit<AIErrorLog, 'id' | 'timestamp'>): void {
    const log: AIErrorLog = {
      ...data,
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.errorLogs.push(log)
    this.trimLogs('errors')

    // Always log errors to console
    console.error('AI Error:', {
      userId: log.userId,
      sessionId: log.sessionId,
      error: log.error,
      errorCode: log.errorCode,
      context: log.context
    })

    this.sendToLoggingService('error', log)
  }

  // Get request logs for analytics
  getRequestLogs(limit?: number): AIRequestLog[] {
    const logs = this.requestLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? logs.slice(0, limit) : logs
  }

  // Get usage statistics
  getUsageStats(timeRange?: { start: Date; end: Date }): {
    totalRequests: number
    successRate: number
    averageTokens: number
    averageCost: number
    averageResponseTime: number
    byTier: Record<string, number>
    byModel: Record<string, number>
  } {
    let logs = this.requestLogs

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      )
    }

    const totalRequests = logs.length
    const successfulRequests = logs.filter(log => log.success).length
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0

    const totalTokens = logs.reduce((sum, log) => sum + log.tokensUsed, 0)
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0)
    const totalResponseTime = logs.reduce((sum, log) => sum + log.responseTime, 0)

    const averageTokens = totalRequests > 0 ? totalTokens / totalRequests : 0
    const averageCost = totalRequests > 0 ? totalCost / totalRequests : 0
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0

    // Count by tier
    const byTier = logs.reduce((acc, log) => {
      acc[log.userTier] = (acc[log.userTier] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Count by model
    const byModel = logs.reduce((acc, log) => {
      acc[log.model] = (acc[log.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalRequests,
      successRate,
      averageTokens,
      averageCost,
      averageResponseTime,
      byTier,
      byModel
    }
  }

  // Get error logs
  getErrorLogs(limit?: number): AIErrorLog[] {
    const logs = this.errorLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return limit ? logs.slice(0, limit) : logs
  }

  // Get user-specific logs
  getUserLogs(userId: string, limit?: number): AIRequestLog[] {
    const logs = this.requestLogs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    return limit ? logs.slice(0, limit) : logs
  }

  // Clear all logs
  clearLogs(): void {
    this.requestLogs = []
    this.usageLogs = []
    this.errorLogs = []
  }

  // Trim logs to maintain memory usage
  private trimLogs(type: 'requests' | 'usage' | 'errors'): void {
    switch (type) {
      case 'requests':
        if (this.requestLogs.length > this.maxLogSize) {
          this.requestLogs = this.requestLogs.slice(-this.maxLogSize)
        }
        break
      case 'usage':
        if (this.usageLogs.length > this.maxLogSize) {
          this.usageLogs = this.usageLogs.slice(-this.maxLogSize)
        }
        break
      case 'errors':
        if (this.errorLogs.length > this.maxLogSize) {
          this.errorLogs = this.errorLogs.slice(-this.maxLogSize)
        }
        break
    }
  }

  // Send logs to external logging service
  private sendToLoggingService(type: string, data: any): void {
    // In production, implement actual logging service integration
    // Examples: Winston, DataDog, Logtail, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external service
      // await loggingService.log(type, data)
    }
  }

  // Performance monitoring
  measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now()
    
    return fn().then(result => {
      const duration = Date.now() - start
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${operation}]: ${duration}ms`)
      }
      
      return { result, duration }
    })
  }
}

// Export singleton instance
export const aiLogger = new AILogger()

// Helper function to create structured log data
export function createRequestLog(
  userId: string,
  sessionId: string | undefined,
  sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy',
  question: string,
  userTier: 'free' | 'hunter' | 'pro' | 'enterprise',
  model: string,
  tokensUsed: number,
  cost: number,
  responseTime: number,
  success: boolean,
  error?: string
): Omit<AIRequestLog, 'id' | 'timestamp'> {
  return {
    userId,
    sessionId,
    sessionType,
    question: question.substring(0, 1000), // Truncate long questions
    userTier,
    model,
    tokensUsed,
    cost,
    responseTime,
    success,
    error
  }
}

// Helper function to log errors with context
export function logAIError(
  error: Error | string,
  context?: {
    userId?: string
    sessionId?: string
    operation?: string
    metadata?: Record<string, any>
  }
): void {
  const errorMessage = error instanceof Error ? error.message : error
  const stack = error instanceof Error ? error.stack : undefined

  aiLogger.logError({
    error: errorMessage,
    stack,
    userId: context?.userId,
    sessionId: context?.sessionId,
    context: {
      operation: context?.operation,
      ...context?.metadata
    }
  })
}