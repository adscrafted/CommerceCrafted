import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET report data
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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Verify user owns this report
    const report = await prisma.amazonReport.findUnique({
      where: { 
        id: reportId,
        userId: session.user.id
      },
      select: {
        id: true,
        type: true,
        status: true
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    if (report.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Report data not ready yet' },
        { status: 202 }
      )
    }

    // Get data based on report type
    if (report.type === 'SEARCH_TERMS') {
      // Get search terms data with pagination and search
      const where = {
        reportId: reportId,
        ...(search && {
          OR: [
            { term: { contains: search } },
            { clickedProductTitle: { contains: search } },
            { clickedAsin: { contains: search } }
          ]
        })
      }

      const [data, total] = await Promise.all([
        prisma.searchTerm.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            { searchVolume: 'asc' }, // Lower rank = higher volume
            { relevanceScore: 'desc' }
          ]
        }),
        prisma.searchTerm.count({ where })
      ])

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } else {
      // For other report types, get from report data
      const reportData = await prisma.amazonReportData.findUnique({
        where: { reportId: reportId },
        select: {
          data: true,
          recordCount: true
        }
      })

      if (!reportData) {
        return NextResponse.json(
          { error: 'Report data not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: reportData.data,
        recordCount: reportData.recordCount
      })
    }

  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}