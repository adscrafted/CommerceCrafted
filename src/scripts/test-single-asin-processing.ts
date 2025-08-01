import { nicheProcessor } from '@/lib/queue/niche-processor'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testSingleAsinProcessing() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const nicheId = 'timeless_1753731633499'
  const testAsin = 'B0CFZLNC5F'
  
  console.log(`\n🧪 TESTING SINGLE ASIN PROCESSING`)
  console.log(`📦 Niche: ${nicheId}`)
  console.log(`📦 ASIN: ${testAsin}`)
  console.log(`🕐 Started at: ${new Date().toISOString()}\n`)
  
  try {
    // Get niche data
    const { data: niche } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (!niche) {
      console.error('Niche not found')
      return
    }
    
    // Clean up existing data for this ASIN
    console.log('🧹 Cleaning up existing data...')
    await supabase.from('product_customer_reviews').delete().eq('product_id', testAsin)
    await supabase.from('product_keywords').delete().eq('product_id', testAsin)
    await supabase.from('product').delete().eq('asin', testAsin)
    
    // Process just this one ASIN
    console.log('\n🚀 Processing single ASIN...')
    await nicheProcessor.processNiche(nicheId, niche.niche_name, [testAsin], 'US')
    
    // Wait for processing to complete (with timeout)
    console.log('\n⏳ Waiting for processing to complete...')
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      
      const { data: updatedNiche } = await supabase
        .from('niches')
        .select('status, error_message')
        .eq('id', nicheId)
        .single()
      
      if (updatedNiche?.status === 'completed' || updatedNiche?.status === 'failed') {
        console.log(`\n✅ Processing finished with status: ${updatedNiche.status}`)
        if (updatedNiche.error_message) {
          console.log(`Error: ${updatedNiche.error_message}`)
        }
        break
      }
      
      attempts++
      if (attempts % 12 === 0) { // Every minute
        console.log(`Still processing... (${attempts * 5} seconds elapsed)`)
      }
    }
    
    // Check final results
    console.log('\n📊 Final Results:')
    
    // Check product
    const { data: product } = await supabase
      .from('product')
      .select('*')
      .eq('asin', testAsin)
      .single()
    
    if (product) {
      console.log('\n✅ Product created:')
      console.log(`  Title: ${product.title}`)
      console.log(`  Brand: ${product.brand}`)
      console.log(`  Price: $${product.price}`)
      console.log(`  BSR: ${product.bsr || 'N/A'}`)
      console.log(`  Reviews: ${product.review_count}`)
    } else {
      console.log('\n❌ Product not created')
    }
    
    // Check keywords
    const { count: keywordCount } = await supabase
      .from('product_keywords')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', testAsin)
    
    console.log(`\n📝 Keywords: ${keywordCount || 0}`)
    
    // Check reviews
    const { count: reviewCount } = await supabase
      .from('product_customer_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', testAsin)
    
    console.log(`💬 Reviews: ${reviewCount || 0}`)
    
    // Check if any analysis was generated
    const analysisTables = [
      'niches_overall_analysis',
      'niches_market_intelligence',
      'niches_demand_analysis'
    ]
    
    console.log('\n📈 Analysis Tables:')
    for (const table of analysisTables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('niche_id', nicheId)
      
      console.log(`  ${table}: ${count || 0} records`)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
  
  console.log(`\n🕐 Finished at: ${new Date().toISOString()}`)
}

// Run the test
testSingleAsinProcessing().catch(console.error)