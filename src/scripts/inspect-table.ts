import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function inspectTable() {
  const supabase = createServiceSupabaseClient()
  
  // Try to insert a test row to see what columns are required
  console.log('🔍 Testing niches_market_intelligence table structure...')
  
  const testData = {
    id: 'test-id',
    niche_id: 'test-niche',
    product_id: 'test-product',
    customer_personas: [],
    voice_of_customer: {},
    created_at: new Date().toISOString()
  }
  
  // Try with niche_id
  console.log('\n1. Trying insert with niche_id:')
  const { error: nicheError } = await supabase
    .from('niches_market_intelligence')
    .insert({
      niche_id: 'test-niche',
      customer_personas: [],
      voice_of_customer: {},
    })
  
  if (nicheError) {
    console.log('   Error:', nicheError.message)
  } else {
    console.log('   Success\!')
  }
  
  // Try with product_id
  console.log('\n2. Trying insert with product_id:')
  const { error: productError } = await supabase
    .from('niches_market_intelligence')
    .insert({
      product_id: 'test-product',
      customer_personas: [],
      voice_of_customer: {},
    })
  
  if (productError) {
    console.log('   Error:', productError.message)
  } else {
    console.log('   Success\!')
  }
  
  // Clean up
  await supabase.from('niches_market_intelligence').delete().eq('product_id', 'test-product')
  await supabase.from('niches_market_intelligence').delete().eq('niche_id', 'test-niche')
}

inspectTable().catch(console.error)
