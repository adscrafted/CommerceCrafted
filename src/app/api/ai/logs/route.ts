// AI Logging API
// Access to AI request logs and analytics for debugging

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { aiLogger } from '@/lib/ai-logger'
import { authOptions } from '@/lib/auth'

// GET /api/ai/logs - Get AI logs and analytics
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'requests'
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const analytics = searchParams.get('analytics') === 'true'

    // TODO: Check if user is admin for accessing all logs
    // For now, users can only see their own logs
    const isAdmin = false // Replace with actual admin check

    switch (type) {
      case 'requests':
        if (userId && !isAdmin && userId !== session.user.id) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }

        const requestLogs = userId 
          ? aiLogger.getUserLogs(userId, limit)
          : (isAdmin ? aiLogger.getRequestLogs(limit) : aiLogger.getUserLogs(session.user.id!, limit))

        return NextResponse.json({
          logs: requestLogs,
          total: requestLogs.length
        })

      case 'errors':
        if (!isAdmin) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }

        const errorLogs = aiLogger.getErrorLogs(limit)
        return NextResponse.json({
          logs: errorLogs,
          total: errorLogs.length
        })

      case 'analytics':
        if (!isAdmin && !analytics) {
          return NextResponse.json(
            { error: 'Admin access required for full analytics' },
            { status: 403 }
          )
        }

        // Parse time range if provided
        let timeRange
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        
        if (startDate && endDate) {
          timeRange = {
            start: new Date(startDate),
            end: new Date(endDate)
          }
        }

        const stats = aiLogger.getUsageStats(timeRange)
        
        // For non-admin users, filter to their data only
        if (!isAdmin) {
          const userLogs = aiLogger.getUserLogs(session.user.id!)
          const userStats = {
            totalRequests: userLogs.length,
            successRate: userLogs.length > 0 
              ? (userLogs.filter(log => log.success).length / userLogs.length) * 100 
              : 0,
            averageTokens: userLogs.length > 0
              ? userLogs.reduce((sum, log) => sum + log.tokensUsed, 0) / userLogs.length
              : 0,
            averageCost: userLogs.length > 0
              ? userLogs.reduce((sum, log) => sum + log.cost, 0) / userLogs.length
              : 0,
            averageResponseTime: userLogs.length > 0
              ? userLogs.reduce((sum, log) => sum + log.responseTime, 0) / userLogs.length
              : 0,
            recentLogs: userLogs.slice(0, 10)
          }
          
          return NextResponse.json({ userStats })
        }

        return NextResponse.json({ stats })

      default:
        return NextResponse.json(
          { error: 'Invalid log type. Use: requests, errors, or analytics' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Logs API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve logs',
        code: 'LOGS_ERROR'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/ai/logs - Clear logs (admin only)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(_request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Check if user is admin
    const isAdmin = false // Replace with actual admin check
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    aiLogger.clearLogs()

    return NextResponse.json({
      success: true,
      message: 'All logs cleared successfully'
    })

  } catch (error) {
    console.error('Log Clear Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to clear logs',
        code: 'LOG_CLEAR_ERROR'
      },
      { status: 500 }
    )
  }
}