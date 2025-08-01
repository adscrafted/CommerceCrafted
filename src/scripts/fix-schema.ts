import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

async function fixSchema() {
  // Create a Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
  
  console.log('🔧 Fixing analysis tables schema...')
  
  // First, let's check the current structure
  console.log('\n📊 Checking current structure of niches_market_intelligence...')
  const { data: testData, error: testError } = await supabase
    .from('niches_market_intelligence')
    .select('*')
    .limit(1)
  
  if (testError) {
    console.log('Current structure query error:', testError.message)
  } else {
    console.log('Current structure has data:', testData?.length || 0, 'rows')
  }
  
  // Since we can't run raw SQL, let's work with what we have
  // The tables already exist with product_id, so we need to:
  // 1. Delete any existing test data
  // 2. Work around the schema issue in the niche processor
  
  console.log('\n🗑️ Cleaning up any test data...')
  
  const tables = [
    'niches_market_intelligence',
    'niches_demand_analysis',
    'niches_competition_analysis',
    'niches_financial_analysis',
    'niches_keyword_analysis',
    'niches_launch_strategy',
    'niches_listing_optimization'
  ]
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('product_id', 'test-product')
    
    if (error && error.code !== 'PGRST116') {
      console.log(`Clean ${table}:`, error.message)
    }
  }
  
  console.log('\n✅ Cleanup complete')
  
  // The real fix needs to be in the niche processor code
  // to store data with product_id instead of niche_id
  console.log('\n📝 Note: The analysis tables use product_id as the key.')
  console.log('The niche processor needs to be updated to store analysis per product.')
}