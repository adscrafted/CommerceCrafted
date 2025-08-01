import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET list of user's reports
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where = {
      user_id: authUser.id,
      ...(type && { type }),
      ...(status && { status })
    }

    // Get reports with pagination
    let query = supabase
      .from('amazon_reports')
      .select('id, type, status, start_date, end_date, marketplace_id, created_at, completed_at, error, report_data:amazon_report_data(record_count)', { count: 'exact' })
      .eq('user_id', authUser.id)
    
    if (type) query = query.eq('type', type)
    if (status) query = query.eq('status', status)
    
    const { data: reports, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    const total = count || 0

    // Format response
    const formattedReports = (reports || []).map(report => ({
      id: report.id,
      type: report.type,
      status: report.status,
      startDate: report.start_date,
      endDate: report.end_date,
      marketplaceId: report.marketplace_id,
      createdAt: report.created_at,
      completedAt: report.completed_at,
      error: report.error,
      recordCount: report.report_data?.record_count
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