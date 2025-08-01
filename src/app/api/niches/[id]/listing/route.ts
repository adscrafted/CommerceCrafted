import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceSupabaseClient()
    
    // Get niche by ID or slug
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get listing optimization data
    const { data: listingData, error: listingError } = await supabase
      .from('niches_listing_optimization')
      .select('*')
      .eq('niche_id', niche.id)
      .single()
    
    if (listingError && listingError.code !== 'PGRST116') {
      console.error('Error fetching listing optimization:', listingError)
    }
    
    // Get products for reference
    const asins = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    const { data: products } = await supabase
      .from('product')
      .select('*')
      .in('asin', asins)
      .limit(5)
    
    return NextResponse.json({
      niche,
      listingOptimization: listingData || {},
      products: products || [],
      hasData: !!listingData
    })
  } catch (error) {
    console.error('Error fetching listing data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing data' },
      { status: 500 }
    )
  }
}