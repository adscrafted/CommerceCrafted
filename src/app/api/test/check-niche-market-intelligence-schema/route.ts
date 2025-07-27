import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get a sample row to see the structure
    const { data: sample, error: sampleError } = await supabase
      .from('niches_market_intelligence')
      .select('*')
      .limit(1)
    
    // Try to insert an empty row to see what columns are required
    const { error: insertError } = await supabase
      .from('niches_market_intelligence')
      .insert({
        niche_id: 'test_schema_check',
        customer_personas: [],
        voice_of_customer: {},
        emotional_triggers: []
      })
    
    let columnsError = null
    let columns = null
    if (insertError) {
      columnsError = insertError.message
      // Extract column info from error message if possible
      if (insertError.message.includes('column')) {
        columns = 'Check error message for column details'
      }
    }
    
    return NextResponse.json({
      table: 'niches_market_intelligence',
      has_data: sample && sample.length > 0,
      sample_row: sample?.[0] || null,
      columns: columns || 'Unable to fetch column info',
      structure: sample?.[0] ? Object.keys(sample[0]) : [],
      errors: {
        sample: sampleError?.message,
        columns: columnsError
      }
    })
  } catch (error) {
    console.error('Error checking table schema:', error)
    return NextResponse.json({ 
      error: 'Failed to check table schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}