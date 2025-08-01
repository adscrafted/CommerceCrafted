import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function generateAnalysisDirectly() {
  const nicheId = 'test_niche_1753642897779'
  const supabase = createServiceSupabaseClient()
  
  console.log(`🔧 Generating analysis data directly for niche: ${nicheId}`)
  
  // Get niche and products
  const { data: niche } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single()
  
  if (!niche) {
    console.error('❌ Niche not found')
    return
  }
  
  const asins = niche.asins?.split(',').map((a: string) => a.trim()) || []
  
  const { data: products } = await supabase
    .from('product')
    .select('*')
    .in('id', asins)
  
  if (!products || products.length === 0) {
    console.error('❌ No products found')
    return
  }
  
  // Delete existing records first
  console.log('🗑️ Cleaning up existing records...')
  const tables = [
    'niches_competition_analysis',
    'niches_financial_analysis',
    'niches_keyword_analysis',
    'niches_launch_strategy',
    'niches_listing_optimization',
    'niches_market_intelligence',
    'niches_demand_analysis'
  ]
  
  for (const table of tables) {
    await supabase
      .from(table)
      .delete()
      .eq('niche_id', nicheId)
  }
  
  // Generate competition analysis
  console.log('\n🎯 Creating competition analysis...')
  const competitionData = {
    niche_id: nicheId,
    total_competitors: products.length,
    competition_level: 'MEDIUM',
    average_price: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length,
    average_rating: products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length,
    average_reviews: products.reduce((sum, p) => sum + (p.review_count || 0), 0) / products.length,
    price_range: {
      min: Math.min(...products.map(p => p.price || 0)),
      max: Math.max(...products.map(p => p.price || 0))
    },
    top_competitors: products.slice(0, 5).map(p => ({
      asin: p.asin,
      title: p.title,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      reviews: p.review_count,
      bsr: p.bsr
    })),
    brand_distribution: [],
    competitive_advantages: ['Low competition', 'High demand', 'Price flexibility'],
    market_gaps: ['Premium segment opportunity', 'Bundle opportunities'],
    analysis_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { error: compError } = await supabase
    .from('niches_competition_analysis')
    .insert(competitionData)
  
  if (compError) {
    console.error('❌ Competition analysis error:', compError)
  } else {
    console.log('✅ Competition analysis created')
  }
  
  // Generate financial analysis
  console.log('\n💰 Creating financial analysis...')
  const avgPrice = products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
  const totalMonthlyOrders = products.reduce((sum, p) => sum + (p.monthly_orders || 0), 0)
  const monthlyRevenue = totalMonthlyOrders * avgPrice
  
  const financialData = {
    niche_id: nicheId,
    average_selling_price: avgPrice,
    estimated_market_size: monthlyRevenue * 12,
    monthly_revenue_potential: monthlyRevenue,
    profit_margins: {
      gross_margin: 0.35,
      net_margin: 0.15
    },
    investment_requirements: {
      initial_inventory: avgPrice * 500,
      marketing_budget: monthlyRevenue * 0.1,
      total_investment: avgPrice * 500 + monthlyRevenue * 0.1 + 5000
    },
    roi_projections: {
      month_3: -0.2,
      month_6: 0.1,
      month_12: 0.35
    },
    break_even_analysis: {
      units: Math.ceil((avgPrice * 500 + 5000) / (avgPrice * 0.35)),
      months: 4
    },
    pricing_strategy: {
      penetration: { price: avgPrice * 0.85, description: 'Enter 15% below market' },
      competitive: { price: avgPrice, description: 'Match market average' },
      premium: { price: avgPrice * 1.15, description: 'Position 15% above' },
      recommended: 'competitive'
    },
    cost_breakdown: {
      product_cost: avgPrice * 0.3,
      amazon_fees: avgPrice * 0.15,
      shipping: avgPrice * 0.05,
      marketing: avgPrice * 0.1,
      other: avgPrice * 0.05
    },
    analysis_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { error: finError } = await supabase
    .from('niches_financial_analysis')
    .insert(financialData)
  
  if (finError) {
    console.error('❌ Financial analysis error:', finError)
  } else {
    console.log('✅ Financial analysis created')
  }
  
  // Get keywords for keyword analysis
  const { data: keywords } = await supabase
    .from('product_keywords')
    .select('*')
    .in('product_id', asins)
  
  if (keywords && keywords.length > 0) {
    console.log('\n🔑 Creating keyword analysis...')
    
    const keywordData = {
      niche_id: nicheId,
      total_keywords: keywords.length,
      top_keywords: keywords.slice(0, 20).map(k => ({
        keyword: k.keyword,
        frequency: 1,
        avg_bid: k.suggested_bid || 125,
        total_clicks: k.estimated_clicks || 0,
        total_orders: k.estimated_orders || 0
      })),
      keyword_themes: ['supplements', 'health', 'wellness', 'natural'],
      search_volume_distribution: {
        high: { count: 10, percentage: '20' },
        medium: { count: 30, percentage: '60' },
        low: { count: 10, percentage: '20' }
      },
      competition_metrics: {
        high_competition: 50,
        medium_competition: 100,
        low_competition: 440
      },
      ppc_insights: {
        avg_cpc: 1.25,
        recommended_budget: 1500,
        estimated_acos: 0.25
      },
      long_tail_opportunities: [],
      analysis_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { error: kwError } = await supabase
      .from('niches_keyword_analysis')
      .insert(keywordData)
    
    if (kwError) {
      console.error('❌ Keyword analysis error:', kwError)
    } else {
      console.log('✅ Keyword analysis created')
    }
  }
  
  // Generate launch strategy
  console.log('\n🚀 Creating launch strategy...')
  const launchData = {
    niche_id: nicheId,
    launch_timeline: {
      pre_launch: {
        duration: '2 weeks',
        tasks: ['Product design', 'Photography', 'Listing creation']
      },
      soft_launch: {
        duration: '4 weeks',
        tasks: ['Initial inventory', 'First reviews', 'PPC testing']
      },
      scale_up: {
        duration: '8 weeks',
        tasks: ['Increase PPC', 'Additional campaigns', 'Review generation']
      }
    },
    marketing_strategy: {
      ppc_strategy: {
        initial_budget: 1500,
        campaign_types: ['Sponsored Products', 'Sponsored Brands']
      },
      external_traffic: ['Social media', 'Influencers'],
      promotions: ['Launch discount', 'Coupons']
    },
    review_strategy: {
      target_reviews: { month_1: 25, month_3: 100, month_6: 250 },
      tactics: ['Amazon Vine', 'Email follow-up']
    },
    inventory_planning: {
      initial_order: 500,
      reorder_point: 150,
      lead_time: '45 days'
    },
    success_metrics: {
      month_1: { sales: 50, reviews: 25, bsr: 50000 },
      month_3: { sales: 200, reviews: 100, bsr: 20000 }
    },
    risk_mitigation: ['Start small', 'Monitor competition', 'Cash reserves'],
    analysis_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { error: launchError } = await supabase
    .from('niches_launch_strategy')
    .insert(launchData)
  
  if (launchError) {
    console.error('❌ Launch strategy error:', launchError)
  } else {
    console.log('✅ Launch strategy created')
  }
  
  // Generate listing optimization
  console.log('\n📝 Creating listing optimization...')
  const listingData = {
    niche_id: nicheId,
    title_optimization: {
      structure: '[Brand] + [Main Keyword] + [Product Type] + [Features]',
      character_limit: 200,
      keyword_placement: 'Front-load keywords'
    },
    bullet_points: {
      structure: ['Key benefit', 'Include keywords', 'Address pain points'],
      keywords_per_bullet: 2,
      optimal_length: '150-200 characters'
    },
    description_strategy: {
      sections: ['Brand story', 'Benefits', 'Use cases', 'Specs'],
      keyword_density: '2-3%'
    },
    backend_keywords: {
      strategy: 'Include synonyms and long-tail',
      character_limit: 250
    },
    image_guidelines: {
      main_image: 'White background',
      lifestyle_images: 'Show in use'
    },
    a_plus_content: {
      recommended: true,
      modules: ['Comparison chart', 'Feature highlights']
    },
    seo_keywords: ['supplements', 'health', 'wellness'],
    conversion_elements: ['Social proof', 'Guarantee', 'Trust signals'],
    analysis_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  const { error: listingError } = await supabase
    .from('niches_listing_optimization')
    .insert(listingData)
  
  if (listingError) {
    console.error('❌ Listing optimization error:', listingError)
  } else {
    console.log('✅ Listing optimization created')
  }
  
  // Check final results
  console.log('\n📊 Final check:')
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId)
    
    console.log(`   ${table}: ${count || 0} records`)
  }
  
  console.log('\n✅ Analysis generation completed!')
}

generateAnalysisDirectly().catch(console.error)