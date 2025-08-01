import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    console.log('[DELETE MI BY ID] Deleting specific market intelligence records')
    
    const supabase = await createServerSupabaseClient()
    
    // Get the specific record IDs that exist
    const { data: records, error: fetchError } = await supabase
      .from('niches_market_intelligence')
      .select('id, niche_id')
    
    if (fetchError) {
      throw new Error(`Error fetching records: ${fetchError.message}`)
    }
    
    console.log(`[DELETE MI BY ID] Found records:`, records)
    
    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No records to delete',
        deletedRecords: []
      })
    }
    
    const deleteResults = []
    
    // Try to delete each record individually
    for (const record of records) {
      console.log(`[DELETE MI BY ID] Attempting to delete record ${record.id}`)
      
      const { error: deleteError } = await supabase
        .from('niches_market_intelligence')
        .delete()
        .eq('id', record.id)
      
      if (deleteError) {
        console.error(`[DELETE MI BY ID] Failed to delete record ${record.id}:`, deleteError)
        deleteResults.push({
          id: record.id,
          niche_id: record.niche_id,
          success: false,
          error: deleteError.message
        })
      } else {
        console.log(`[DELETE MI BY ID] Successfully deleted record ${record.id}`)
        deleteResults.push({
          id: record.id,
          niche_id: record.niche_id,
          success: true
        })
      }
    }
    
    // Verify final state
    const { count: finalCount, error: finalCountError } = await supabase
      .from('niches_market_intelligence')
      .select('*', { count: 'exact', head: true })
    
    const successfulDeletions = deleteResults.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      message: `Deletion completed. ${successfulDeletions} of ${records.length} records deleted.`,
      initialCount: records.length,
      finalCount: finalCount || 0,
      deleteResults
    })
  } catch (error) {
    console.error('[DELETE MI BY ID] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}