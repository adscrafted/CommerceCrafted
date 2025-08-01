import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function testSimpleInsert() {
  const supabase = createServiceSupabaseClient()
  const nicheId = 'test_niche_1753642897779'
  
  console.log('🧪 Testing simple analysis inserts...')
  
  // Try minimal inserts for each table to see what works
  const tests = [
    {
      table: 'niches_competition_analysis',
      data: {
        niche_id: nicheId,
        total_competitors: 10,
        competition_level: 'MEDIUM',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      table: 'niches_demand_analysis',
      data: {
        niche_id: nicheId,
        market_insights: { test: 'data' },
        pricing_trends: { test: 'data' },
        seasonality_insights: { test: 'data' },
        social_signals: { test: 'data' },
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
    }
  ]
  
  for (const test of tests) {
    console.log(`\n📝 Testing ${test.table}...`)
    
    const { data, error } = await supabase
      .from(test.table)
      .upsert(test.data, {
        onConflict: 'niche_id'
      })
      .select()
    
    if (error) {
      console.error(`❌ Error:`, error.message)
      
      // Try with different columns
      if (error.message.includes('column')) {
        console.log('   Retrying with minimal data...')
        const minimalData = {
          niche_id: nicheId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error: error2 } = await supabase
          .from(test.table)
          .upsert(minimalData, {
            onConflict: 'niche_id'
          })
        
        if (error2) {
          console.error(`   ❌ Still failed:`, error2.message)
        } else {
          console.log(`   ✅ Success with minimal data`)
        }
      }
    } else {
      console.log(`✅ Success! Inserted:`, data)
    }
  }
  
  // Check final status
  console.log('\n📊 Final check of all tables...')
  for (const test of tests) {
    const { count } = await supabase
      .from(test.table)
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId)
    
    console.log(`   ${test.table}: ${count || 0} records`)
  }
}

testSimpleInsert().catch(console.error)