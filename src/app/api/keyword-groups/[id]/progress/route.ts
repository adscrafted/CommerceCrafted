import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const groupId = params.id
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get group status
    const { data: group, error: groupError } = await supabase
      .from('keyword_groups')
      .select('status, total_keywords_found, total_keywords_processed')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get progress details
    const { data: progress, error: progressError } = await supabase
      .from('keyword_group_progress')
      .select('*')
      .eq('group_id', groupId)
      .order('started_at', { ascending: true })

    if (progressError) {
      console.error('Error fetching progress:', progressError)
    }

    // Calculate overall progress
    const phases = ['metadata_collection', 'keyword_discovery', 'bid_enrichment', 'storage', 'complete']
    const completedPhases = progress?.filter(p => p.percentage === 100).length || 0
    const overallProgress = Math.floor((completedPhases / phases.length) * 100)

    return NextResponse.json({
      status: group.status,
      overallProgress,
      totalKeywordsFound: group.total_keywords_found,
      totalKeywordsProcessed: group.total_keywords_processed,
      phases: progress || [],
      currentPhase: progress?.find(p => p.percentage < 100)?.phase || 
                   (group.status === 'completed' ? 'complete' : 'pending')
    })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}