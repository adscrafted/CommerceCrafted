import { nicheProcessor } from '@/lib/queue/niche-processor'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function restartNicheAnalysis() {
  const nicheId = 'timeless_1753731633499'
  const supabase = createServiceSupabaseClient()
  
  console.log(`🚀 Restarting analysis generation for niche: ${nicheId}`)
  
  // Get the niche data
  const { data: niche, error } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single()
  
  if (error || !niche) {
    console.error('❌ Failed to get niche:', error)
    return
  }
  
  console.log(`📦 Found niche: ${niche.niche_name}`)
  console.log(`   Status: ${niche.status}`)
  console.log(`   Products: ${niche.total_products}`)
  
  // Get ASINs
  const asins = niche.asins?.split(',').map((a: string) => a.trim()) || []
  
  // Check current data
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
  
  console.log(`\n📊 Current data:`)
  console.log(`   Products: ${productCount || 0}`)
  console.log(`   Keywords: ${keywordCount || 0}`)
  console.log(`   Reviews: ${reviewCount || 0}`)
  
  if (productCount && productCount > 0) {
    console.log(`\n🔄 Running analysis generation...`)
    
    try {
      // Update niche status back to processing
      await supabase
        .from('niches')
        .update({ status: 'processing' })
        .eq('id', nicheId)
      
      // Run each analysis function directly
      console.log('\n📈 1. Calculating niche analytics...')
      await nicheProcessor['calculateNicheAnalytics'](nicheId)
      
      console.log('\n🔮 2. Generating market insights...')
      await nicheProcessor.generateMarketInsightsForNiche(nicheId)
      
      console.log('\n🎯 3. Generating competition analysis...')
      await nicheProcessor['generateCompetitionAnalysis'](nicheId)
      
      console.log('\n💰 4. Generating financial analysis...')
      await nicheProcessor['generateFinancialAnalysis'](nicheId)
      
      console.log('\n🔑 5. Generating keyword analysis...')
      await nicheProcessor['generateKeywordAnalysis'](nicheId)
      
      console.log('\n🚀 6. Generating launch strategy...')
      await nicheProcessor['generateLaunchStrategy'](nicheId)
      
      console.log('\n📝 7. Generating listing optimization...')
      await nicheProcessor['generateListingOptimization'](nicheId)
      
      // Mark as completed
      await supabase
        .from('niches')
        .update({ 
          status: 'completed',
          process_completed_at: new Date().toISOString()
        })
        .eq('id', nicheId)
      
      console.log('\n✅ Analysis generation completed!')
      
      // Check final results
      console.log('\n📊 Final analysis check:')
      const tables = [
        'niches_competition_analysis',
        'niches_demand_analysis',
        'niches_financial_analysis',
        'niches_keyword_analysis',
        'niches_launch_strategy',
        'niches_listing_optimization',
        'niches_market_intelligence'
      ]
      
      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('niche_id', nicheId)
        
        console.log(`   ${table}: ${count || 0} records`)
      }
      
    } catch (error) {
      console.error('❌ Error during analysis:', error)
    }
  } else {
    console.log('❌ No products found - cannot generate analysis')
  }
}

restartNicheAnalysis().catch(console.error)