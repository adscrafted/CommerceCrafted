import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET report data
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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Verify user owns this report
    const { data: report } = await supabase
      .from('amazon_reports')
      .select('id, type, status')
      .eq('id', reportId)
      .eq('user_id', authUser.id)
      .single()

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

      const { data, count } = await supabase
        .from('search_terms')
        .select('*', { count: 'exact' })
        .eq('report_id', reportId)
        .range((page - 1) * limit, page * limit - 1)
      const total = count || 0

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
      const { data: reportData } = await supabase
        .from('amazon_report_data')
        .select('data, record_count')
        .eq('report_id', reportId)
        .single()

      if (!reportData) {
        return NextResponse.json(
          { error: 'Report data not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: reportData?.data,
        recordCount: reportData?.record_count
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