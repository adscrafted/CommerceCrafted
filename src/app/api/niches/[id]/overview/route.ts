import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Fetch the niche
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .or(`id.eq.${id},niche_name.ilike.%${id}%`)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Fetch all related analysis data
    const [
      { data: overallAnalysis },
      { data: marketIntelligence },
      { data: demandAnalysis },
      { data: competitionAnalysis },
      { data: financialAnalysis },
      { data: keywordAnalysis },
      { data: launchStrategy },
      { data: listingOptimization }
    ] = await Promise.all([
      supabase.from('niches_overall_analysis').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_market_intelligence').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_demand_analysis').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_competition_analysis').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_financial_analysis').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_keyword_analysis').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_launch_strategy').select('*').eq('niche_id', niche.id).single(),
      supabase.from('niches_listing_optimization').select('*').eq('niche_id', niche.id).single()
    ])
    
    // Fetch products for the niche
    const asins = niche.asins.split(',').map((asin: string) => asin.trim())
    const { data: products } = await supabase
      .from('product')
      .select('*')
      .in('asin', asins)
      .limit(10)
    
    // Transform data to match the expected format
    const transformedData = {
      id: niche.id,
      slug: niche.niche_name.toLowerCase().replace(/\s+/g, '-'),
      nicheName: niche.niche_name,
      category: overallAnalysis?.category || 'General',
      subcategory: overallAnalysis?.subcategory || 'General',
      nicheSummary: overallAnalysis?.niche_summary || '',
      createdAt: niche.created_at,
      updatedAt: niche.updated_at,
      
      // Overall scores
      opportunityScore: Math.round((overallAnalysis?.overall_score || overallAnalysis?.opportunity_score_legacy || 0) * 100),
      scores: {
        demand: Math.round((overallAnalysis?.demand_score || demandAnalysis?.demand_score || 0) * 100),
        competition: Math.round((overallAnalysis?.competition_score || 0) * 100),
        keywords: Math.round((overallAnalysis?.keywords_score || overallAnalysis?.feasibility_score_legacy || 0) * 100),
        listing: Math.round((overallAnalysis?.listing_optimization_score || 0.82) * 100),
        intelligence: Math.round((overallAnalysis?.market_intelligence_score || overallAnalysis?.timing_score_legacy || 0) * 100),
        launch: Math.round((overallAnalysis?.launch_strategy_score || 0.90) * 100),
        financial: Math.round((overallAnalysis?.financial_score || 0.80) * 100),
        overall: Math.round((overallAnalysis?.overall_score || overallAnalysis?.opportunity_score_legacy || 0) * 100)
      },
      
      // Market Overview
      marketOverview: {
        totalMarketSize: overallAnalysis?.market_analysis?.totalMarketSize || 0,
        nicheMarketSize: demandAnalysis?.market_size || 0,
        marketGrowth: `+${demandAnalysis?.growth_rate || overallAnalysis?.market_analysis?.yearlyGrowth || 0}%`,
        avgSellingPrice: competitionAnalysis?.average_price || 0,
        totalProducts: competitionAnalysis?.total_competitors || 0,
        topBrands: competitionAnalysis?.top_brands || [],
        totalMonthlyRevenue: financialAnalysis?.revenue_projections?.month_1 || 0,
        avgMonthlyUnitsSold: financialAnalysis?.unit_sales_projections?.month_1 || 0,
        keyDrivers: overallAnalysis?.market_analysis?.keyDrivers || [],
        targetDemographics: overallAnalysis?.market_analysis?.targetDemographics || []
      },
      
      // Top Products
      topProducts: products?.slice(0, 3).map((product: any) => ({
        asin: product.asin,
        title: product.title,
        price: product.price,
        rating: product.rating,
        reviews: product.review_count,
        monthlyRevenue: product.monthly_revenue || 0,
        bsr: product.best_seller_rank,
        image: product.image_urls ? JSON.parse(product.image_urls)[0] : 'https://via.placeholder.com/200'
      })) || [],
      
      // Intelligence Data
      intelligenceData: {
        sentimentScore: marketIntelligence?.sentiment_score || 4.2,
        totalReviews: marketIntelligence?.total_reviews || 0,
        opportunities: marketIntelligence?.improvement_opportunities || [],
        customerAvatars: marketIntelligence?.customer_personas || []
      },
      
      // Demand Data
      demandData: {
        searchTrend: `+${demandAnalysis?.trend_score || 0}%`,
        conversionRate: 12,
        monthlySearchVolume: demandAnalysis?.search_volume || 0
      },
      
      // Competition Data
      competitionData: {
        totalCompetitors: competitionAnalysis?.total_competitors || 0,
        averagePrice: competitionAnalysis?.average_price || 0,
        averageRating: competitionAnalysis?.average_rating || 0,
        averageReviews: competitionAnalysis?.average_reviews || 0
      },
      
      // Keywords Data
      keywordsData: {
        primaryKeyword: {
          cpc: keywordAnalysis?.top_keywords?.[0]?.cpc || 0.5,
          competition: keywordAnalysis?.top_keywords?.[0]?.competition || 'Medium'
        },
        totalKeywords: keywordAnalysis?.total_keywords || 0,
        keywordRevenue: 50000
      },
      
      // Financial Data
      financialData: {
        monthlyProjections: {
          revenue: financialAnalysis?.revenue_projections?.month_1 || 0,
          profit: financialAnalysis?.profit_projections?.month_1 || 0,
          roi: financialAnalysis?.roi_projections?.month_1 ? Math.round(financialAnalysis.roi_projections.month_1 * 100) : 0
        },
        profitMargin: financialAnalysis?.profit_margins?.net_margin ? Math.round(financialAnalysis.profit_margins.net_margin * 100) : 0
      },
      
      // Listing Data
      listingData: {
        recommendedTitle: listingOptimization?.title_recommendations?.[0] || '',
        bulletPoints: listingOptimization?.bullet_points || [],
        backendKeywords: listingOptimization?.backend_keywords || [],
        mainImageRecommendations: listingOptimization?.image_recommendations || []
      },
      
      // Launch Data
      launchData: {
        launchPrice: launchStrategy?.pricing_strategy?.launch_price || 0,
        week1Strategy: {
          ppcBudget: launchStrategy?.marketing_strategy?.ppc_daily_budget || 0
        }
      }
    }
    
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching niche overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}