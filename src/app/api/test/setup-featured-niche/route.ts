import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // First, let's check if there are any niches
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('*')
      .limit(5)
    
    if (nichesError) {
      return NextResponse.json({ 
        error: 'Failed to fetch niches',
        details: nichesError.message 
      }, { status: 500 })
    }
    
    if (!niches || niches.length === 0) {
      return NextResponse.json({ 
        message: 'No niches found in database',
        suggestion: 'Please create niches first using the admin panel'
      })
    }
    
    // Set the first niche as featured for today
    const today = new Date().toISOString().split('T')[0]
    const nicheToFeature = niches[0]
    
    const { data: updated, error: updateError } = await supabase
      .from('niches')
      .update({ featured_date: today })
      .eq('id', nicheToFeature.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to set featured niche',
        details: updateError.message 
      }, { status: 500 })
    }
    
    // Also check if products exist for this niche
    const asinList = nicheToFeature.asins?.split(',').map((a: string) => a.trim()) || []
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('id, asin, title')
      .in('asin', asinList.slice(0, 5))
    
    return NextResponse.json({
      message: 'Featured niche set successfully',
      featuredNiche: {
        id: updated.id,
        name: updated.niche_name,
        featured_date: updated.featured_date,
        asins: asinList.length
      },
      products: products?.length || 0,
      productSample: products?.slice(0, 3) || []
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}