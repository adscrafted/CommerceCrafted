import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function testMinimalInsert() {
  const nicheId = 'test_niche_1753642897779'
  const supabase = createServiceSupabaseClient()
  
  console.log('🧪 Testing minimal inserts for each table...')
  
  // Test each table with minimal data
  const tests = [
    {
      table: 'niches_competition_analysis',
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_financial_analysis',  
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_keyword_analysis',
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_launch_strategy',
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_listing_optimization',
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_market_intelligence',
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_demand_analysis',
      data: {
        niche_id: nicheId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  ]
  
  // First, clean up any existing records
  console.log('🗑️ Cleaning up existing records...')
  for (const test of tests) {
    await supabase
      .from(test.table)
      .delete()
      .eq('niche_id', nicheId)
  }
  
  // Try minimal inserts
  for (const test of tests) {
    console.log(`\n📝 Testing ${test.table}...`)
    
    const { data, error } = await supabase
      .from(test.table)
      .insert(test.data)
      .select()
      .single()
    
    if (error) {
      console.error(`❌ Error:`, error.message)
      
      // If product_id is required, add it
      if (error.message.includes('product_id')) {
        console.log('   Adding product_id and retrying...')
        const dataWithProductId = {
          ...test.data,
          product_id: 'B0CFZLNC5F' // Use first ASIN
        }
        
        const { error: error2 } = await supabase
          .from(test.table)
          .insert(dataWithProductId)
          .select()
          .single()
        
        if (error2) {
          console.error(`   ❌ Still failed:`, error2.message)
        } else {
          console.log(`   ✅ Success with product_id`)
        }
      }
    } else {
      console.log(`✅ Success! Record created with ID:`, data.id)
    }
  }
  
  // Check final status
  console.log('\n📊 Final check:')
  for (const test of tests) {
    const { count } = await supabase
      .from(test.table)
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId)
    
    console.log(`   ${test.table}: ${count || 0} records`)
  }
}

testMinimalInsert().catch(console.error)