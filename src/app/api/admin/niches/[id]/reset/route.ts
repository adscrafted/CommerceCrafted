import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const nicheId = params.id
    
    console.log(`🔄 Resetting niche status for ID: ${nicheId}`)
    
    // Reset niche to pending status
    const { error } = await supabase
      .from('niches')
      .update({
        status: 'pending',
        processing_progress: null,
        process_started_at: null,
        process_completed_at: null,
        error_message: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', nicheId)
    
    if (error) {
      console.error('Failed to reset niche:', error)
      return NextResponse.json(
        { error: 'Failed to reset niche', details: error.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ Niche reset successfully`)
    
    return NextResponse.json({
      success: true,
      message: 'Niche reset to pending status'
    })
    
  } catch (error) {
    console.error('Error resetting niche:', error)
    return NextResponse.json(
      { 
        error: 'Failed to reset niche',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}