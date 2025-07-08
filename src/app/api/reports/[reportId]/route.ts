import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET report status
export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reportId } = params

    // Get report from database
    const report = await prisma.amazonReport.findUnique({
      where: { 
        id: reportId,
        userId: session.user.id // Ensure user owns this report
      },
      include: {
        reportData: {
          select: {
            recordCount: true,
            createdAt: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Format response
    const response = {
      id: report.id,
      type: report.type,
      status: report.status,
      startDate: report.startDate,
      endDate: report.endDate,
      marketplaceId: report.marketplaceId,
      createdAt: report.createdAt,
      completedAt: report.completedAt,
      error: report.error,
      retryCount: report.retryCount,
      recordCount: report.reportData?.recordCount,
      dataAvailable: !!report.reportData
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching report status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report status' },
      { status: 500 }
    )
  }
}