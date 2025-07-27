import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()

    console.log('Fetching niche with ID:', id)

    // Fetch niche data
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select(`
        *,
        creator:users!created_by(name, email)
      `)
      .eq('id', id)
      .single()

    if (nicheError || !niche) {
      console.error('Niche not found:', nicheError)
      return NextResponse.json(
        { error: 'Niche not found' },
        { status: 404 }
      )
    }

    console.log('Niche found:', niche.niche_name)

    // Get all products in this niche with their analyses
    const asins = niche.asins.split(',').map((asin: string) => asin.trim())
    
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select(`
        *,
        niches_overall_analysis (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          financial_analysis,
          market_analysis,
          competition_analysis,
          keyword_analysis,
          review_analysis,
          ai_generated_content
        )
      `)
      .in('asin', asins)

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    // Transform niche data to match frontend expectations
    const transformedNiche = {
      id: niche.id,
      nicheName: niche.niche_name,
      asins: asins,
      status: niche.status,
      addedDate: niche.added_date,
      scheduledDate: niche.scheduled_date,
      category: niche.category,
      totalProducts: niche.total_products,
      totalReviews: niche.total_reviews,
      processTime: niche.process_time,
      creator: niche.creator,
      
      // Transform products data
      products: products?.map(product => {
        const analysis = product.niches_overall_analysis?.[0]
        return {
          id: product.id,
          asin: product.asin,
          title: product.title,
          brand: product.brand,
          price: product.price,
          bsr: product.bsr,
          rating: product.rating,
          reviewCount: product.review_count,
          images: product.image_urls ? product.image_urls.split(',') : [],
          
          // Analysis scores
          opportunityScore: analysis?.opportunity_score || 0,
          competitionScore: analysis?.competition_score || 0,
          demandScore: analysis?.demand_score || 0,
          feasibilityScore: analysis?.feasibility_score || 0,
          timingScore: analysis?.timing_score || 0,
          
          // Analysis data
          financialAnalysis: analysis?.financial_analysis || {},
          marketAnalysis: analysis?.market_analysis || {},
          competitionAnalysis: analysis?.competition_analysis || {},
          keywordAnalysis: analysis?.keyword_analysis || {},
          reviewAnalysis: analysis?.review_analysis || {},
          aiGeneratedContent: analysis?.ai_generated_content || ''
        }
      }) || [],
      
      // Metadata
      createdAt: niche.created_at,
      updatedAt: niche.updated_at
    }

    return NextResponse.json(transformedNiche)
  } catch (error) {
    console.error('Error fetching niche:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}