import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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
    // TODO: Convert to Supabase with proper joins
    // const { data: report } = await supabase.from('amazon_reports').select('*, report_data:amazon_report_data(record_count, created_at)').eq('id', reportId).eq('user_id', session.user.id).single()
    const report = null

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