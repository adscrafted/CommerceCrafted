import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    console.log('Fetching product with ASIN:', asin)

    // Fetch product with full analysis data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_analyses (
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
          supply_chain_analysis,
          ai_generated_content
        ),
        keyword_analyses (
          primary_keywords,
          long_tail_keywords,
          keyword_difficulty,
          seasonal_trends,
          ppc_metrics,
          search_intent,
          competitor_keywords
        ),
        financial_models (
          roi_calculations,
          break_even_analysis,
          cash_flow_projections,
          risk_metrics,
          scenario_analysis,
          profitability_model,
          investment_requirements,
          fba_fee_analysis
        )
      `)
      .eq('asin', asin)
      .single()

    if (productError || !product) {
      console.error('Product not found:', productError)
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('Product found:', product.title)

    // Transform data to match the frontend format used in the product page
    const analysis = product.product_analyses?.[0]
    const keywordData = product.keyword_analyses?.[0]
    const financialModel = product.financial_models?.[0]

    const transformedProduct = {
      id: product.id,
      asin: product.asin,
      title: product.title,
      subtitle: 'Revolutionary sleep technology combining comfort with audio entertainment',
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      price: product.price,
      bsr: product.bsr,
      rating: product.rating,
      reviewCount: product.review_count,
      images: product.image_urls ? product.image_urls.split(',') : [
        'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop'
      ],
      mainImage: product.image_urls?.split(',')[0] || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      
      // Analysis scores
      opportunityScore: analysis?.opportunity_score || 87,
      competitionScore: analysis?.competition_score || 72,
      demandScore: analysis?.demand_score || 85,
      feasibilityScore: analysis?.feasibility_score || 88,
      timingScore: analysis?.timing_score || 90,
      
      // Scores object for the frontend
      scores: {
        demand: analysis?.demand_score || 92,
        competition: analysis?.competition_score || 78,
        keywords: 85, // Placeholder - should be calculated from keyword analysis
        listing: 82, // Placeholder - should be calculated from listing optimization
        intelligence: 88, // Placeholder - should be calculated from review analysis
        launch: 90, // Placeholder - should be calculated from launch strategy
        financial: 91, // Placeholder - should be calculated from financial analysis
        overall: analysis?.opportunity_score || 87
      },
      
      // Financial data from analysis
      financialAnalysis: analysis?.financial_analysis || {
        monthly_revenue: 520000,
        profit_margin: 45,
        launch_budget: 8000,
        roi: 450,
        monthly_units: 17334,
        avg_selling_price: 29.99,
        net_profit: 234000,
        break_even_months: 3
      },
      
      // Financial data for frontend compatibility
      financialData: {
        avgSellingPrice: product.price || 29.99,
        totalFees: 8.50, // Should be calculated from FBA fees
        monthlyProjections: {
          revenue: analysis?.financial_analysis?.monthly_revenue || 52000,
          profit: analysis?.financial_analysis?.net_profit || 18200,
          units: analysis?.financial_analysis?.monthly_units || 1735
        }
      },
      
      // Market analysis
      marketAnalysis: analysis?.market_analysis || {
        market_size: 450000000,
        growth_rate: 127,
        trends: ['Sleep wellness growth', 'Remote work trend', 'Audio technology boom'],
        seasonality: 'medium',
        maturity: 'growing'
      },
      
      // Competition analysis
      competitionAnalysis: analysis?.competition_analysis || {
        top_competitors: ['MUSICOZY', 'Perytong', 'TOPOINT'],
        market_share: 'Fragmented market with no brand over 15% share',
        differentiation: 'Premium materials, better sound quality, sleep tracking'
      },
      
      // Keyword analysis
      keywordAnalysis: analysis?.keyword_analysis || {
        primary_keywords: ['bluetooth sleep mask', 'sleep headphones', 'wireless sleep mask'],
        keyword_difficulty: 'medium',
        search_volume: 45000,
        cpc: 1.23
      },
      
      // Review analysis
      reviewAnalysis: analysis?.review_analysis || {
        sentiment: 4.3,
        total_reviews: 35678,
        opportunities: 4,
        customer_avatars: 3
      },
      
      // Supply chain
      supplyChainAnalysis: analysis?.supply_chain_analysis || {
        time_to_market: 30,
        supplier_analysis: 'Multiple suppliers available',
        minimum_order: 500
      },
      
      // AI insights
      aiGeneratedContent: analysis?.ai_generated_content || 'The intersection of sleep wellness and audio technology creates a unique opportunity. Post-pandemic remote work has driven demand for sleep optimization products, while the rise of sleep podcasts and meditation apps creates perfect product-market fit. Competition remains fragmented with no dominant brand.',
      
      // Additional data for the frontend
      whyThisProduct: analysis?.ai_generated_content || 'The intersection of sleep wellness and audio technology creates a unique opportunity.',
      highlights: [
        'Growing 127% YoY with consistent demand',
        'Premium positioning opportunity in $40-60 range',
        'Untapped niches: travel, meditation, ASMR',
        'Low competition from major brands'
      ],
      
      // Keywords
      keywordData: keywordData || {},
      
      // Financial model
      financialModel: financialModel || {},
      
      // Metadata
      status: product.status,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}