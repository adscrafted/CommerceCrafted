import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Generate unique group ID
function generateGroupId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `kwg_${timestamp}_${random}`
}

// GET: List keyword groups
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's keyword groups
    const { data: groups, error } = await supabase
      .from('keyword_groups')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching keyword groups:', error)
      return NextResponse.json({ error: 'Failed to fetch keyword groups' }, { status: 500 })
    }

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Keyword groups GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create new keyword group
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, asins, marketplace = 'US' } = await request.json()

    // Validate input
    if (!name || !asins || !Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid input. Name and ASINs array are required.' 
      }, { status: 400 })
    }

    if (asins.length > 100) {
      return NextResponse.json({ 
        error: 'Maximum 100 ASINs allowed per group' 
      }, { status: 400 })
    }

    // Generate unique ID
    const groupId = generateGroupId()

    // Create keyword group
    const { data: group, error: insertError } = await supabase
      .from('keyword_groups')
      .insert({
        id: groupId,
        name,
        marketplace,
        asins,
        status: 'pending',
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating keyword group:', insertError)
      return NextResponse.json({ error: 'Failed to create keyword group' }, { status: 500 })
    }

    // Trigger async processing
    fetch(`${request.nextUrl.origin}/api/keyword-groups/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({ groupId })
    }).catch(err => console.error('Failed to trigger processing:', err))

    return NextResponse.json({ 
      success: true,
      group 
    })
  } catch (error) {
    console.error('Keyword groups POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Soft delete a keyword group
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('id')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Soft delete the group
    const { error } = await supabase
      .from('keyword_groups')
      .update({ status: 'deleted' })
      .eq('id', groupId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting keyword group:', error)
      return NextResponse.json({ error: 'Failed to delete keyword group' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Keyword groups DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}