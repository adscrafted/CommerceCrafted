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
    
    // Get financial analysis data
    const { data: financialData, error: financialError } = await supabase
      .from('niches_financial_analysis')
      .select('*')
      .eq('niche_id', niche.id)
      .single()
    
    if (financialError && financialError.code !== 'PGRST116') {
      console.error('Error fetching financial analysis:', financialError)
    }
    
    // Get products for additional financial metrics
    const asins = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    const { data: products } = await supabase
      .from('product')
      .select('*')
      .in('asin', asins)
    
    return NextResponse.json({
      niche,
      financialAnalysis: financialData || {},
      products: products || [],
      hasData: !!financialData
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    )
  }
}