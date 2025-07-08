import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBackfillService } from '@/lib/backfill-service'
import { z } from 'zod'

const BackfillRequestSchema = z.object({
  maxWeeks: z.number().min(1).max(10).default(5),
  marketplaceId: z.string().default('ATVPDKIKX0DER'),
  action: z.enum(['check_missing', 'request_reports', 'process_completed']).default('check_missing')
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

    // Parse request
    const body = await request.json()
    const { maxWeeks, marketplaceId, action } = BackfillRequestSchema.parse(body)

    const backfillService = getBackfillService()

    switch (action) {
      case 'check_missing': {
        const missingWeeks = await backfillService.getMissingWeeksForBackfill(marketplaceId)
        const maxBackfillDate = await backfillService.getMaxBackfillDate()
        
        return NextResponse.json({
          success: true,
          data: {
            missingWeeks: missingWeeks.map(date => date.toISOString().split('T')[0]),
            maxBackfillDate: maxBackfillDate.toISOString().split('T')[0],
            totalMissing: missingWeeks.length,
            canBackfill: missingWeeks.slice(0, maxWeeks).map(date => date.toISOString().split('T')[0])
          }
        })
      }

      case 'request_reports': {
        const results = await backfillService.backfillHistoricalData(maxWeeks, marketplaceId)
        
        return NextResponse.json({
          success: true,
          data: {
            requested: results.requested,
            skipped: results.skipped,
            errors: results.errors,
            summary: {
              totalRequested: results.requested.length,
              totalSkipped: results.skipped.length,
              totalErrors: results.errors.length
            }
          }
        })
      }

      case 'process_completed': {
        const results = await backfillService.processCompletedReports()
        
        return NextResponse.json({
          success: true,
          data: {
            processed: results.processed,
            stillPending: results.stillPending,
            errors: results.errors,
            summary: {
              totalProcessed: results.processed.length,
              totalPending: results.stillPending.length,
              totalErrors: results.errors.length
            }
          }
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Backfill API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const backfillService = getBackfillService()
    
    // Default to just checking missing weeks
    const missingWeeks = await backfillService.getMissingWeeksForBackfill()
    const maxBackfillDate = await backfillService.getMaxBackfillDate()
    
    return NextResponse.json({
      success: true,
      data: {
        missingWeeks: missingWeeks.map(date => date.toISOString().split('T')[0]),
        maxBackfillDate: maxBackfillDate.toISOString().split('T')[0],
        totalMissing: missingWeeks.length,
        estimatedTimeToBackfill: `${missingWeeks.length * 15} minutes (15 min per report)`,
        nextActions: [
          'POST /api/reports/backfill with action=request_reports to start backfill',
          'Check report statuses periodically',
          'POST /api/reports/backfill with action=process_completed to process ready reports'
        ]
      }
    })

  } catch (error) {
    console.error('Backfill GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}