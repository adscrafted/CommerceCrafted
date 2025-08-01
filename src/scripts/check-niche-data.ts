import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function checkNicheData() {
  const nicheId = 'timeless_1753731633499'
  const supabase = createServiceSupabaseClient()
  
  console.log('📊 Comprehensive Data Verification for Niche:', nicheId)
  console.log('=' .repeat(80))
  
  // 1. Check niche details
  const { data: niche, error: nicheError } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single()
  
  if (nicheError) {
    console.log('❌ Could not fetch niche:', nicheError.message)
    return
  }
  
  console.log('\n📋 NICHE DETAILS:')
  console.log('   ID:', niche.id)
  console.log('   Name:', niche.niche_name)
  console.log('   Status:', niche.status)
  console.log('   Total Products:', niche.total_products)
  console.log('   Total Keywords:', niche.total_keywords)
  console.log('   ASINs:', niche.asins)
  
  const asins = niche.asins?.split(',').map((a: string) => a.trim()) || []
  
  // 2. Check products
  console.log('\n📦 PRODUCTS:')
  const { data: products, count: productCount } = await supabase
    .from('product')
    .select('*', { count: 'exact' })
    .in('id', asins)
  
  console.log(`   Total: ${productCount} products saved (out of ${asins.length} ASINs)`)
  if (products && products.length > 0) {
    products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.id} - ${p.title?.substring(0, 50)}...`)
      console.log(`      Price: $${p.price || 0}, BSR: ${p.bsr || 'N/A'}`)
    })
  }
  
  // 3. Check keywords
  console.log('\n🔑 KEYWORDS:')
  const { data: keywords, count: keywordCount } = await supabase
    .from('product_keywords')
    .select('*', { count: 'exact' })
    .in('product_id', asins)
  
  console.log(`   Total: ${keywordCount} keywords`)
  if (keywords && keywords.length > 0) {
    // Group by product
    const keywordsByProduct = keywords.reduce((acc: any, k) => {
      if (!acc[k.product_id]) acc[k.product_id] = []
      acc[k.product_id].push(k)
      return acc
    }, {})
    
    Object.entries(keywordsByProduct).slice(0, 3).forEach(([productId, kws]: [string, any]) => {
      console.log(`   Product ${productId}: ${kws.length} keywords`)
      kws.slice(0, 3).forEach((k: any) => {
        console.log(`      - "${k.keyword}" (Volume: ${k.search_volume})`)
      })
    })
  }
  
  // 4. Check reviews
  console.log('\n💬 REVIEWS:')
  const { data: reviews, count: reviewCount } = await supabase
    .from('product_customer_reviews')
    .select('*', { count: 'exact' })
    .in('product_id', asins)
  
  console.log(`   Total: ${reviewCount} reviews`)
  if (reviews && reviews.length > 0) {
    // Group by product
    const reviewsByProduct = reviews.reduce((acc: any, r) => {
      if (!acc[r.product_id]) acc[r.product_id] = 0
      acc[r.product_id]++
      return acc
    }, {})
    
    Object.entries(reviewsByProduct).forEach(([productId, count]) => {
      console.log(`   Product ${productId}: ${count} reviews`)
    })
  }
  
  // 5. Check all analysis tables
  console.log('\n🤖 AI ANALYSIS TABLES:')
  const analysisTables = [
    { name: 'niches_overall_analysis', key: 'executive_summary' },
    { name: 'niches_market_intelligence', key: 'sentiment_themes' },
    { name: 'niches_demand_analysis', key: 'demand_score' },
    { name: 'niches_competition_analysis', key: 'competition_level' },
    { name: 'niches_financial_analysis', key: 'average_profit_margin' },
    { name: 'niches_keyword_analysis', key: 'total_keywords' },
    { name: 'niches_launch_strategy', key: 'recommended_strategy' },
    { name: 'niches_listing_optimization', key: 'title_optimization' }
  ]
  
  for (const table of analysisTables) {
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .eq('niche_id', nicheId)
      .single()
    
    if (error) {
      console.log(`   ❌ ${table.name}: ${error.message}`)
    } else if (data) {
      console.log(`   ✅ ${table.name}: Data exists`)
      if (data[table.key]) {
        const value = typeof data[table.key] === 'string' 
          ? data[table.key].substring(0, 50) + '...' 
          : JSON.stringify(data[table.key]).substring(0, 50) + '...'
        console.log(`      ${table.key}: ${value}`)
      }
    } else {
      console.log(`   ⚠️ ${table.name}: No data`)
    }
  }
  
  // 6. Summary
  console.log('\n' + '=' .repeat(80))
  console.log('📊 SUMMARY:')
  console.log(`   ✅ Products saved: ${productCount}/${asins.length}`)
  console.log(`   ✅ Keywords collected: ${keywordCount}`)
  console.log(`   ✅ Reviews scraped: ${reviewCount}`)
  
  // Count how many analysis tables have data
  let analysisCount = 0
  for (const table of analysisTables) {
    const { data } = await supabase
      .from(table.name)
      .select('id')
      .eq('niche_id', nicheId)
      .single()
    if (data) analysisCount++
  }
  
  console.log(`   ✅ Analysis tables populated: ${analysisCount}/${analysisTables.length}`)
  
  if (productCount === asins.length) {
    console.log('\n🎉 SUCCESS: All products were saved to the database!')
  } else {
    console.log('\n⚠️ WARNING: Not all products were saved to the database')
  }
}

checkNicheData().catch(console.error)