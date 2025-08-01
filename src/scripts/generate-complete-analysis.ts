import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function generateCompleteAnalysis() {
  const nicheId = 'test_niche_1753642897779'
  const supabase = createServiceSupabaseClient()
  
  console.log(`🚀 Generating complete analysis for niche: ${nicheId}`)
  
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
  const primaryAsin = asins[0] // Use first ASIN as primary
  
  const { data: products } = await supabase
    .from('product')
    .select('*')
    .in('id', asins)
  
  if (!products || products.length === 0) {
    console.error('❌ No products found')
    return
  }
  
  // Clean up existing records
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
  
  // 1. Competition Analysis
  console.log('\n🎯 Creating competition analysis...')
  const { error: compError } = await supabase
    .from('niches_competition_analysis')
    .insert({
      niche_id: nicheId,
      product_id: primaryAsin,
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
    })
  
  console.log(compError ? `❌ Error: ${compError.message}` : '✅ Competition analysis created')
  
  // 2. Financial Analysis
  console.log('\n💰 Creating financial analysis...')
  const avgPrice = products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
  const monthlyRevenue = products.reduce((sum, p) => sum + (p.monthly_orders || 0) * (p.price || 0), 0)
  
  const { error: finError } = await supabase
    .from('niches_financial_analysis')
    .insert({
      niche_id: nicheId,
      product_id: primaryAsin,
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
        penetration: { price: avgPrice * 0.85 },
        competitive: { price: avgPrice },
        premium: { price: avgPrice * 1.15 }
      },
      cost_breakdown: {
        product_cost: avgPrice * 0.3,
        amazon_fees: avgPrice * 0.15,
        shipping: avgPrice * 0.05,
        marketing: avgPrice * 0.1
      },
      analysis_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  
  console.log(finError ? `❌ Error: ${finError.message}` : '✅ Financial analysis created')
  
  // 3. Keyword Analysis
  const { data: keywords } = await supabase
    .from('product_keywords')
    .select('*')
    .in('product_id', asins)
  
  if (keywords && keywords.length > 0) {
    console.log('\n🔑 Creating keyword analysis...')
    
    const { error: kwError } = await supabase
      .from('niches_keyword_analysis')
      .insert({
        niche_id: nicheId,
        product_id: primaryAsin,
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
      })
    
    console.log(kwError ? `❌ Error: ${kwError.message}` : '✅ Keyword analysis created')
  }
  
  // 4. Launch Strategy
  console.log('\n🚀 Creating launch strategy...')
  const { error: launchError } = await supabase
    .from('niches_launch_strategy')
    .insert({
      niche_id: nicheId,
      product_id: primaryAsin,
      launch_timeline: {
        pre_launch: { duration: '2 weeks', tasks: ['Product design', 'Photography'] },
        soft_launch: { duration: '4 weeks', tasks: ['Initial inventory', 'First reviews'] },
        scale_up: { duration: '8 weeks', tasks: ['Increase PPC', 'Review generation'] }
      },
      marketing_strategy: {
        ppc_strategy: { initial_budget: 1500, campaign_types: ['Sponsored Products'] },
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
    })
  
  console.log(launchError ? `❌ Error: ${launchError.message}` : '✅ Launch strategy created')
  
  // 5. Listing Optimization
  console.log('\n📝 Creating listing optimization...')
  const { error: listingError } = await supabase
    .from('niches_listing_optimization')
    .insert({
      niche_id: nicheId,
      product_id: primaryAsin,
      title_optimization: {
        structure: '[Brand] + [Main Keyword] + [Product Type]',
        character_limit: 200
      },
      bullet_points: {
        structure: ['Key benefit', 'Include keywords'],
        keywords_per_bullet: 2
      },
      description_strategy: {
        sections: ['Brand story', 'Benefits'],
        keyword_density: '2-3%'
      },
      backend_keywords: {
        strategy: 'Include synonyms',
        character_limit: 250
      },
      image_guidelines: {
        main_image: 'White background',
        lifestyle_images: 'Show in use'
      },
      a_plus_content: {
        recommended: true,
        modules: ['Comparison chart']
      },
      seo_keywords: ['supplements', 'health', 'wellness'],
      conversion_elements: ['Social proof', 'Guarantee'],
      analysis_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  
  console.log(listingError ? `❌ Error: ${listingError.message}` : '✅ Listing optimization created')
  
  // 6. Market Intelligence  
  console.log('\n🔮 Creating market intelligence...')
  const { error: marketError } = await supabase
    .from('niches_market_intelligence')
    .insert({
      niche_id: nicheId,
      product_id: primaryAsin,
      customer_personas: [
        {
          name: 'Health Conscious Consumer',
          demographics: '25-45 years old',
          motivations: ['Natural health', 'Wellness'],
          painPoints: ['Quality concerns'],
          buyingBehavior: 'Research-driven'
        }
      ],
      voice_of_customer: {
        keyThemes: [
          {
            theme: 'Quality',
            sentiment: 'positive',
            commonPhrases: ['high quality', 'works well']
          }
        ]
      },
      emotional_triggers: [
        {
          trigger: 'Health improvement',
          description: 'Desire for better health',
          sentiment: 'positive'
        }
      ],
      total_reviews_analyzed: 129,
      analysis_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  
  console.log(marketError ? `❌ Error: ${marketError.message}` : '✅ Market intelligence created')
  
  // 7. Demand Analysis
  console.log('\n📈 Creating demand analysis...')
  const { error: demandError } = await supabase
    .from('niches_demand_analysis')
    .insert({
      niche_id: nicheId,
      product_id: primaryAsin,
      market_insights: {
        marketTrends: {
          currentPhase: 'Growing',
          growthIndicators: ['Increasing searches', 'New entrants'],
          marketMaturity: 'Developing'
        }
      },
      pricing_trends: {
        priceOptimization: { currentAverage: avgPrice },
        optimalPriceRange: { min: avgPrice * 0.8, max: avgPrice * 1.2 }
      },
      seasonality_insights: {
        peakSeasons: ['Q1', 'Q4'],
        demandPatterns: ['Holiday shopping', 'New Year resolutions']
      },
      social_signals: {
        trendingTopics: ['Natural health', 'Supplements'],
        customerSentiment: 'Positive',
        viralPotential: 'Moderate'
      },
      demand_velocity: {
        monthOverMonth: '+12%',
        quarterOverQuarter: '+35%',
        yearOverYear: '+78%'
      },
      market_size_estimate: {
        monthly: monthlyRevenue,
        annual: monthlyRevenue * 12
      },
      customer_segments: {
        budget: { percentage: 25 },
        mid: { percentage: 50 },
        premium: { percentage: 25 }
      },
      demand_drivers: ['Health trends', 'Social media'],
      analysis_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  
  console.log(demandError ? `❌ Error: ${demandError.message}` : '✅ Demand analysis created')
  
  // Final check
  console.log('\n📊 Final results:')
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId)
    
    console.log(`   ${table}: ${count || 0} records`)
  }
  
  console.log('\n✅ Analysis generation completed!')
}

generateCompleteAnalysis().catch(console.error)