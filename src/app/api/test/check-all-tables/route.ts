import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Query to get all tables from information_schema
    const { data, error } = await supabase
      .rpc('get_all_tables')
    
    if (error) {
      // Fallback - try direct query
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .rpc('exec_sql', { query })
      
      if (fallbackError) {
        return NextResponse.json({
          error: 'Unable to get tables',
          details: {
            primary_error: error.message,
            fallback_error: fallbackError.message
          }
        }, { status: 500 })
      }
      
      return NextResponse.json({
        method: 'fallback_sql',
        tables: fallbackData
      })
    }
    
    return NextResponse.json({
      method: 'rpc',
      tables: data
    })
  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json({ 
      error: 'Failed to check tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}