import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function forceCompleteNiche() {
  const nicheId = 'test_niche_1753642897779'
  const supabase = createServiceSupabaseClient()
  
  console.log(`🔧 Force completing niche: ${nicheId}`)
  
  // Update the niche status
  const { error } = await supabase
    .from('niches')
    .update({
      status: 'completed',
      process_completed_at: new Date().toISOString(),
      error_message: 'Manually completed - analysis generation timed out'
    })
    .eq('id', nicheId)
  
  if (error) {
    console.error('❌ Failed to update niche:', error)
  } else {
    console.log('✅ Niche marked as completed')
  }
  
  // Check what data we have
  const { data: niche } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single()
  
  if (niche) {
    const asins = niche.asins?.split(',').map((a: string) => a.trim()) || []
    
    // Check all data
    const { count: productCount } = await supabase
      .from('product')
      .select('*', { count: 'exact', head: true })
      .in('id', asins)
    
    const { count: keywordCount } = await supabase
      .from('product_keywords')
      .select('*', { count: 'exact', head: true })
      .in('product_id', asins)
    
    const { count: reviewCount } = await supabase
      .from('product_customer_reviews')
      .select('*', { count: 'exact', head: true })
      .in('product_id', asins)
    
    console.log('\n📊 Final data summary:')
    console.log(`   Products: ${productCount || 0}/${asins.length}`)
    console.log(`   Keywords: ${keywordCount || 0}`)
    console.log(`   Reviews: ${reviewCount || 0}`)
    
    // Check analyses
    const analyses = [
      'niches_competition_analysis',
      'niches_demand_analysis',
      'niches_financial_analysis',
      'niches_keyword_analysis',
      'niches_launch_strategy',
      'niches_listing_optimization',
      'niches_market_intelligence'
    ]
    
    console.log('\n📈 Analysis tables:')
    for (const table of analyses) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('niche_id', nicheId)
      
      console.log(`   ${table}: ${count || 0} records`)
    }
    
    // Let's manually generate at least the competition analysis since we have the data
    if (productCount && productCount > 0) {
      console.log('\n🔄 Generating basic competition analysis...')
      
      const { data: products } = await supabase
        .from('product')
        .select('*')
        .in('id', asins)
      
      if (products && products.length > 0) {
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
          competitive_advantages: ['Product data collected', 'Keywords available', 'Reviews analyzed'],
          market_gaps: ['Further analysis needed'],
          analysis_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error: analysisError } = await supabase
          .from('niches_competition_analysis')
          .upsert(competitionData, {
            onConflict: 'niche_id'
          })
        
        if (!analysisError) {
          console.log('✅ Competition analysis created')
        } else {
          console.error('❌ Failed to create analysis:', analysisError)
        }
      }
    }
  }
}

forceCompleteNiche().catch(console.error)