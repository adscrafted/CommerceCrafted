import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const nicheId = params.id
    
    // Get niche details
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Parse ASINs
    const asins = niche.asins ? niche.asins.split(',').map(a => a.trim()) : []
    
    // Check which products exist in database
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, asin, title, last_keepa_sync')
      .in('id', asins)
    
    // Check for any product_keywords
    const { data: keywords, count: keywordCount } = await supabase
      .from('product_keywords')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', nicheId)
    
    // Get recent logs if any
    const logs = {
      niche_status: niche.status,
      processing_started: niche.process_started_at,
      processing_completed: niche.process_completed_at,
      processing_progress: niche.processing_progress,
      error_message: niche.error_message,
      asins_in_niche: asins,
      products_in_db: products?.map(p => p.asin) || [],
      missing_products: asins.filter(a => !products?.find(p => p.asin === a)),
      total_keywords: keywordCount || 0,
      last_updated: niche.updated_at
    }
    
    return NextResponse.json({
      debug_info: logs,
      recommendations: [
        logs.niche_status === 'processing' && !logs.processing_progress?.currentAsin 
          ? '⚠️ Processing appears stuck - no current ASIN. Try resetting.'
          : null,
        logs.missing_products.length > 0
          ? `⚠️ ${logs.missing_products.length} products not found in database`
          : null,
        logs.total_keywords === 0 && logs.products_in_db.length > 0
          ? '⚠️ No keywords found despite having products'
          : null
      ].filter(Boolean)
    })
    
  } catch (error) {
    console.error('Error debugging niche:', error)
    return NextResponse.json({ 
      error: 'Failed to debug niche',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}