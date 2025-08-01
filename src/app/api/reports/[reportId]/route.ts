import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET report status
export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reportId } = params

    // Get report from database
    const { data: report } = await supabase
      .from('amazon_reports')
      .select('*, report_data:amazon_report_data(record_count, created_at)')
      .eq('id', reportId)
      .eq('user_id', authUser.id)
      .single()

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Format response
    const response = {
      id: report?.id,
      type: report?.type,
      status: report?.status,
      startDate: report?.start_date,
      endDate: report?.end_date,
      marketplaceId: report?.marketplace_id,
      createdAt: report?.created_at,
      completedAt: report?.completed_at,
      error: report?.error,
      retryCount: report?.retry_count,
      recordCount: report?.report_data?.record_count,
      dataAvailable: !!report?.report_data
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