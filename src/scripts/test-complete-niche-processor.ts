import { nicheProcessor } from '@/lib/queue/niche-processor'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testCompleteNicheProcessor() {
  const nicheId = 'timeless_1753731633499'
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log(`\n🧪 COMPREHENSIVE NICHE PROCESSOR TEST`)
  console.log(`📦 Testing niche: ${nicheId}`)
  console.log(`🕐 Started at: ${new Date().toISOString()}\n`)
  
  try {
    // Step 1: Check initial niche status
    console.log('📊 Step 1: Checking initial niche status...')
    const { data: initialNiche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !initialNiche) {
      console.error('❌ Failed to get niche:', nicheError)
      return
    }
    
    console.log(`   Name: ${initialNiche.niche_name}`)
    console.log(`   Status: ${initialNiche.status}`)
    console.log(`   ASINs: ${initialNiche.asins}`)
    console.log(`   Total Products: ${initialNiche.total_products}`)
    
    // Step 2: Reset niche to fresh state
    console.log('\n🔄 Step 2: Resetting niche to fresh state...')
    
    // Delete existing data
    const asins = initialNiche.asins?.split(',').map((a: string) => a.trim()) || []
    
    // Delete analysis data
    const analysisTables = [
      'niches_overall_analysis',
      'niches_market_intelligence',
      'niches_demand_analysis',
      'niches_competition_analysis',
      'niches_financial_analysis',
      'niches_keyword_analysis',
      'niches_launch_strategy',
      'niches_listing_optimization'
    ]
    
    for (const table of analysisTables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('niche_id', nicheId)
      
      if (error) {
        console.log(`   ⚠️  Error deleting from ${table}:`, error.message)
      } else {
        console.log(`   ✅ Cleared ${table}`)
      }
    }
    
    // Delete products, keywords, and reviews
    await supabase.from('product_customer_reviews').delete().in('product_id', asins)
    await supabase.from('product_keywords').delete().in('product_id', asins)
    await supabase.from('product').delete().in('asin', asins)
    
    // Reset niche status
    await supabase
      .from('niches')
      .update({ 
        status: 'pending',
        total_reviews: null,
        error_message: null,
        process_started_at: null,
        process_completed_at: null
      })
      .eq('id', nicheId)
    
    console.log('   ✅ Niche reset to pending state')
    
    // Step 3: Start the niche processor
    console.log('\n🚀 Step 3: Starting niche processor...')
    console.log('   This will process the niche through all stages:')
    console.log('   - Fetch products from Keepa')
    console.log('   - Collect keywords')
    console.log('   - Scrape reviews')
    console.log('   - Generate AI analysis')
    
    // Process the niche
    await nicheProcessor.processNiche(nicheId, initialNiche.niche_name, asins, 'US')
    
    // Step 4: Check final results
    console.log('\n📊 Step 4: Checking final results...')
    
    // Get updated niche
    const { data: finalNiche } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    console.log(`\n   Final Status: ${finalNiche?.status}`)
    console.log(`   Total Reviews: ${finalNiche?.total_reviews}`)
    
    // Check products
    const { data: products, count: productCount } = await supabase
      .from('product')
      .select('*', { count: 'exact' })
      .in('asin', asins)
    
    console.log(`\n   Products: ${productCount}/${asins.length}`)
    if (products && products.length > 0) {
      products.forEach(p => {
        console.log(`     - ${p.asin}: ${p.title?.substring(0, 50)}...`)
      })
    }
    
    // Check keywords
    const { count: keywordCount } = await supabase
      .from('product_keywords')
      .select('*', { count: 'exact', head: true })
      .in('product_id', asins)
    
    console.log(`\n   Keywords: ${keywordCount} total`)
    
    // Check reviews
    const { count: reviewCount } = await supabase
      .from('product_customer_reviews')
      .select('*', { count: 'exact', head: true })
      .in('product_id', asins)
    
    console.log(`   Reviews: ${reviewCount} total`)
    
    // Check analysis tables
    console.log('\n   Analysis Tables:')
    for (const table of analysisTables) {
      const { data, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .eq('niche_id', nicheId)
      
      console.log(`     - ${table}: ${count} records`)
      
      // Show a sample of the data if it exists
      if (data && data.length > 0 && table === 'niches_overall_analysis') {
        const sample = data[0]
        console.log(`       Sample keys: ${Object.keys(sample).slice(0, 5).join(', ')}...`)
      }
    }
    
    // Step 5: Test frontend API endpoints
    console.log('\n🌐 Step 5: Testing frontend API endpoints...')
    
    const endpoints = [
      '/api/niches/by-id',
      `/api/niches/${nicheId}/overview`,
      `/api/niches/${nicheId}/competition`,
      `/api/niches/${nicheId}/financial`,
      `/api/niches/${nicheId}/keywords`,
      `/api/niches/${nicheId}/launch`,
      `/api/niches/${nicheId}/listing`
    ]
    
    for (const endpoint of endpoints) {
      try {
        const url = endpoint.includes('by-id') 
          ? `http://localhost:3000${endpoint}?nicheId=${nicheId}`
          : `http://localhost:3000${endpoint}`
        
        const response = await fetch(url)
        console.log(`   ${endpoint}: ${response.status} ${response.statusText}`)
      } catch (error) {
        console.log(`   ${endpoint}: ❌ Failed to fetch`)
      }
    }
    
    // Final summary
    console.log('\n✅ TEST COMPLETED')
    console.log(`🕐 Finished at: ${new Date().toISOString()}`)
    
    if (finalNiche?.status === 'completed') {
      console.log('\n🎉 SUCCESS: Niche processing completed successfully!')
    } else if (finalNiche?.status === 'failed') {
      console.log('\n❌ FAILED: Niche processing failed')
      console.log(`   Error: ${finalNiche.error_message}`)
    } else {
      console.log(`\n⚠️  WARNING: Niche processing ended with status: ${finalNiche?.status}`)
    }
    
  } catch (error) {
    console.error('\n❌ Script error:', error)
  }
}

// Run the test
testCompleteNicheProcessor().catch(console.error)