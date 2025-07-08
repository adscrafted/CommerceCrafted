import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET list of user's reports
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where = {
      userId: session.user.id,
      ...(type && { type }),
      ...(status && { status })
    }

    // Get reports with pagination
    const [reports, total] = await Promise.all([
      prisma.amazonReport.findMany({
        where,
        select: {
          id: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          marketplaceId: true,
          createdAt: true,
          completedAt: true,
          error: true,
          reportData: {
            select: {
              recordCount: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.amazonReport.count({ where })
    ])

    // Format response
    const formattedReports = reports.map(report => ({
      id: report.id,
      type: report.type,
      status: report.status,
      startDate: report.startDate,
      endDate: report.endDate,
      marketplaceId: report.marketplaceId,
      createdAt: report.createdAt,
      completedAt: report.completedAt,
      error: report.error,
      recordCount: report.reportData?.recordCount
    }))

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error listing reports:', error)
    return NextResponse.json(
      { error: 'Failed to list reports' },
      { status: 500 }
    )
  }
}