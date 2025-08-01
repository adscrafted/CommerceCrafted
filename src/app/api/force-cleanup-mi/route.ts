import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    console.log('[FORCE CLEANUP MI] Force cleaning niches_market_intelligence')
    
    const supabase = await createServerSupabaseClient()
    
    // First verify there are still 0 niches
    const { count: nicheCount, error: nicheCountError } = await supabase
      .from('niches')
      .select('*', { count: 'exact', head: true })
    
    if (nicheCountError) {
      throw new Error(`Error checking niche count: ${nicheCountError.message}`)
    }
    
    console.log(`[FORCE CLEANUP MI] Found ${nicheCount} niches`)
    
    if (nicheCount && nicheCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot cleanup - found ${nicheCount} existing niches. This cleanup is only safe when there are 0 niches.`
      }, { status: 400 })
    }
    
    // Get current count before deletion
    const { count: beforeCount, error: beforeCountError } = await supabase
      .from('niches_market_intelligence')
      .select('*', { count: 'exact', head: true })
    
    if (beforeCountError) {
      throw new Error(`Error counting records: ${beforeCountError.message}`)
    }
    
    console.log(`[FORCE CLEANUP MI] Found ${beforeCount} records to delete`)
    
    // Force delete all records by using a condition that matches all records
    const { error: deleteError } = await supabase
      .from('niches_market_intelligence')
      .delete()
      .gte('id', 0) // This should match all records since id >= 0
    
    if (deleteError) {
      console.error('[FORCE CLEANUP MI] Delete failed:', deleteError)
      return NextResponse.json({
        success: false,
        error: `Delete failed: ${deleteError.message}`,
        beforeCount
      }, { status: 500 })
    }
    
    // Verify deletion worked
    const { count: afterCount, error: afterCountError } = await supabase
      .from('niches_market_intelligence')
      .select('*', { count: 'exact', head: true })
    
    console.log(`[FORCE CLEANUP MI] After deletion: ${afterCount} records remain`)
    
    return NextResponse.json({
      success: true,
      message: `Force cleanup completed. Deleted ${beforeCount} records.`,
      beforeCount,
      afterCount: afterCount || 0,
      deletedCount: (beforeCount || 0) - (afterCount || 0)
    })
  } catch (error) {
    console.error('[FORCE CLEANUP MI] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}