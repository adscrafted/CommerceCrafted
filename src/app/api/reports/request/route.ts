import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReportPollingService, ReportType } from '@/lib/report-polling-service'
import { z } from 'zod'

// Request schema
const RequestReportSchema = z.object({
  type: z.enum(['SEARCH_TERMS', 'MARKET_BASKET', 'REPEAT_PURCHASE', 'ITEM_COMPARISON']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  marketplaceId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validatedData = RequestReportSchema.parse(body)

    // Validate date requirements for SEARCH_TERMS reports
    if (validatedData.type === 'SEARCH_TERMS') {
      const startDate = new Date(validatedData.startDate)
      const endDate = new Date(validatedData.endDate)
      
      // Check if start date is Sunday
      if (startDate.getUTCDay() !== 0) {
        return NextResponse.json(
          { error: 'For Search Terms reports, start date must be a Sunday (UTC)' },
          { status: 400 }
        )
      }
      
      // Check if end date is Saturday
      if (endDate.getUTCDay() !== 6) {
        return NextResponse.json(
          { error: 'For Search Terms reports, end date must be a Saturday (UTC)' },
          { status: 400 }
        )
      }
      
      // Check if it's exactly one week
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      if (Math.round(daysDiff) !== 6) {
        return NextResponse.json(
          { error: 'Search Terms reports must cover exactly one week (Sunday to Saturday)' },
          { status: 400 }
        )
      }
    }

    // Request the report
    const pollingService = getReportPollingService()
    const reportId = await pollingService.requestReport(
      session.user.id,
      validatedData.type as ReportType,
      new Date(validatedData.startDate),
      new Date(validatedData.endDate),
      validatedData.marketplaceId
    )

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Report requested successfully. We will notify you when it\'s ready.',
      estimatedTime: '5-30 minutes'
    })

  } catch (error) {
    console.error('Error requesting report:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to request report' },
      { status: 500 }
    )
  }
}