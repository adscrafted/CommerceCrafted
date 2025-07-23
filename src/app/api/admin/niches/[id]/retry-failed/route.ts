import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { nicheProcessor } from '@/lib/queue/niche-processor'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const nicheId = params.id
    
    console.log(`🔄 Retrying failed ASINs for niche ID: ${nicheId}`)
    
    // Get niche details
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get failed ASINs from processing progress
    const failedAsins = niche.processing_progress?.failedAsins || []
    
    if (failedAsins.length === 0) {
      return NextResponse.json({ 
        message: 'No failed ASINs to retry',
        niche_status: niche.status 
      })
    }
    
    console.log(`📦 Found ${failedAsins.length} failed ASINs to retry:`, failedAsins)
    
    // Process each failed ASIN individually with better error handling
    const results = {
      retried: [],
      succeeded: [],
      failed: []
    }
    
    for (const asin of failedAsins) {
      try {
        console.log(`\n🔄 Retrying ASIN: ${asin}`)
        
        // Try Keepa first
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
        const keepaResponse = await fetch(`${baseUrl}/api/amazon/keepa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asin })
        })
        
        if (keepaResponse.ok) {
          const keepaData = await keepaResponse.json()
          
          // Store in database
          const { error: dbError } = await supabase
            .from('products')
            .upsert({
              id: asin,
              asin: asin,
              title: keepaData.title || `Product ${asin}`,
              price: keepaData.currentPrice || 0,
              bsr: keepaData.salesRank || 0,
              rating: keepaData.rating || 0,
              review_count: keepaData.reviewCount || 0,
              category: keepaData.rootCategory || '',
              brand: keepaData.brand || '',
              image_url: keepaData.images?.[0] || '',
              last_keepa_sync: new Date().toISOString(),
              keepa_data: keepaData
            })
          
          if (!dbError) {
            results.succeeded.push(asin)
            console.log(`✅ Successfully processed ${asin}`)
          } else {
            results.failed.push({ asin, error: dbError.message })
            console.error(`❌ Database error for ${asin}:`, dbError)
          }
        } else {
          const errorText = await keepaResponse.text()
          results.failed.push({ asin, error: `Keepa API: ${keepaResponse.status}` })
          console.error(`❌ Keepa API failed for ${asin}:`, errorText)
        }
        
        results.retried.push(asin)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        results.failed.push({ 
          asin, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        console.error(`❌ Failed to retry ${asin}:`, error)
      }
    }
    
    // Update niche progress
    const currentProgress = niche.processing_progress || {}
    const updatedProgress = {
      ...currentProgress,
      failedAsins: results.failed.map(f => f.asin),
      completedAsins: [
        ...(currentProgress.completedAsins || []),
        ...results.succeeded
      ],
      lastUpdate: new Date().toISOString()
    }
    
    // Update niche status
    const allProcessed = updatedProgress.completedAsins.length + updatedProgress.failedAsins.length >= (niche.asins?.split(',').length || 0)
    
    await supabase
      .from('niches')
      .update({
        processing_progress: updatedProgress,
        status: allProcessed ? 'completed' : niche.status,
        process_completed_at: allProcessed ? new Date().toISOString() : null
      })
      .eq('id', nicheId)
    
    console.log(`\n📊 Retry Results:`, {
      total_retried: results.retried.length,
      succeeded: results.succeeded.length,
      failed: results.failed.length
    })
    
    return NextResponse.json({
      success: true,
      results: {
        retried_count: results.retried.length,
        success_count: results.succeeded.length,
        failed_count: results.failed.length,
        succeeded_asins: results.succeeded,
        failed_details: results.failed
      },
      message: `Retried ${results.retried.length} ASINs: ${results.succeeded.length} succeeded, ${results.failed.length} failed`
    })
    
  } catch (error) {
    console.error('Error retrying failed ASINs:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retry ASINs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}