import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReportPollingService } from '@/lib/report-polling-service'

// Admin endpoint to start/stop polling
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { action } = await request.json()
    const pollingService = getReportPollingService()

    if (action === 'start') {
      await pollingService.startPolling()
      return NextResponse.json({
        success: true,
        message: 'Report polling started'
      })
    } else if (action === 'stop') {
      pollingService.stopPolling()
      return NextResponse.json({
        success: true,
        message: 'Report polling stopped'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error managing polling:', error)
    return NextResponse.json(
      { error: 'Failed to manage polling service' },
      { status: 500 }
    )
  }
}