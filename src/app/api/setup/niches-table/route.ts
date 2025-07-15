import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if table already exists
    const { data: existingTable } = await supabase
      .from('niches')
      .select('id')
      .limit(1)

    if (existingTable) {
      return NextResponse.json({
        success: true,
        message: 'Niches table already exists',
        exists: true
      })
    }

    // If we get here, table doesn't exist
    // Return instructions to create it manually
    return NextResponse.json({
      success: false,
      message: 'Niches table needs to be created',
      instructions: 'Please run the SQL from scripts/create-niches-table.sql in your Supabase SQL editor',
      sqlPath: '/scripts/create-niches-table.sql'
    })

  } catch (error) {
    console.error('Error checking niches table:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check niches table',
        details: error instanceof Error ? error.message : 'Unknown error',
        instructions: 'Please run the SQL from scripts/create-niches-table.sql in your Supabase SQL editor'
      },
      { status: 500 }
    )
  }
}