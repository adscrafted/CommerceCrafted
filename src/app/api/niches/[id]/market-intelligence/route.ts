import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nicheId } = await params
    const supabase = await createServerSupabaseClient()
    
    console.log('Fetching market intelligence for niche:', nicheId)
    
    // Get niche details
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      console.error('Error fetching niche:', nicheError)
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get ASINs from niche
    const asinList = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    
    if (asinList.length === 0) {
      return NextResponse.json({
        customerPersonas: [],
        voiceOfCustomer: {},
        emotionalTriggers: [],
        competitorAnalysis: {},
        reviews: [],
        hasData: false
      })
    }
    
    // Fetch market intelligence data from niches_market_intelligence table
    // Since the table stores data by product_id, we need to fetch for all products in the niche
    const { data: marketIntelligenceList, error: miError } = await supabase
      .from('niches_market_intelligence')
      .select('*')
      .eq('niche_id', nicheId)
    
    if (miError && miError.code !== 'PGRST116') {
      console.error('Error fetching niches market intelligence:', miError)
    }
    
    // If we have multiple product intelligence entries, aggregate them
    let intelligenceData = null
    if (marketIntelligenceList && marketIntelligenceList.length > 0) {
      // For now, use the first entry or the most recent one
      intelligenceData = marketIntelligenceList.reduce((latest, current) => {
        if (!latest) return current
        return new Date(current.analysis_date) > new Date(latest.analysis_date) ? current : latest
      }, null)
      
      // Alternative: You could aggregate all personas, triggers, etc. from all products
      // This would give a more comprehensive view of the niche
    }
    
    // Fetch customer reviews for all products in niche
    const { data: reviews, error: reviewsError } = await supabase
      .from('product_customer_reviews')
      .select('*')
      .in('product_id', asinList)
      .order('review_date', { ascending: false })
      .limit(100)
    
    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }
    
    // If no market intelligence data exists, return empty structure
    if (!intelligenceData) {
      return NextResponse.json({
        customerPersonas: [],
        voiceOfCustomer: {},
        voiceOfCustomerEnhanced: null,
        emotionalTriggers: [],
        competitorAnalysis: {},
        rawReviews: reviews || [],
        hasData: false,
        niche: {
          id: niche.id,
          name: niche.niche_name,
          totalProducts: niche.total_products
        }
      })
    }
    
    // Return market intelligence data
    return NextResponse.json({
      customerPersonas: intelligenceData.customer_personas || [],
      voiceOfCustomer: intelligenceData.voice_of_customer || {},
      voiceOfCustomerEnhanced: intelligenceData.voice_of_customer_enhanced || null,
      emotionalTriggers: intelligenceData.emotional_triggers || [],
      competitorAnalysis: intelligenceData.competitor_analysis || {},
      rawReviews: reviews || [],
      hasData: true,
      niche: {
        id: niche.id,
        name: niche.niche_name,
        totalProducts: niche.total_products
      },
      analysisDate: intelligenceData.analysis_date,
      totalReviewsAnalyzed: intelligenceData.total_reviews_analyzed
    })
    
  } catch (error) {
    console.error('Error in market intelligence API:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch market intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}