import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create a direct Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Update all entries that belong to saffron products to have the niche_id
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('asins')
      .eq('id', 'saffron_supplements_1753403777466')
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ 
        error: 'Niche not found',
        details: nicheError 
      }, { status: 404 })
    }
    
    // Get all ASINs from the niche
    const asins = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    
    // Update all market intelligence entries for these products
    const { data, error } = await supabase
      .from('niches_market_intelligence')
      .update({ niche_id: 'saffron_supplements_1753403777466' })
      .in('product_id', asins)
      .select()
    
    if (error) {
      console.error('Error updating niche_id:', error)
      return NextResponse.json({ 
        error: 'Failed to update',
        details: error 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Updated niche_id for market intelligence entries',
      updated_count: data?.length || 0,
      updated_products: data?.map(d => d.product_id) || []
    })
  } catch (error) {
    console.error('Error updating niche_id:', error)
    return NextResponse.json({ 
      error: 'Failed to update niche_id',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}