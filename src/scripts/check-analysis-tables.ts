import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function checkAnalysisTables() {
  const nicheId = 'timeless_1753731633499'
  const supabase = createServiceSupabaseClient()
  
  console.log('🔍 Checking Analysis Tables for Niche:', nicheId)
  console.log('=' .repeat(80))
  
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
    console.log(`\n📊 Table: ${table}`)
    
    // First check if any records exist for this niche
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('niche_id', nicheId)
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
      continue
    }
    
    console.log(`   Records found: ${count}`)
    
    if (data && data.length > 0) {
      console.log(`   Number of records: ${data.length}`)
      
      // Show first record details
      const record = data[0]
      const keys = Object.keys(record).filter(k => !['id', 'niche_id', 'created_at', 'updated_at'].includes(k))
      
      console.log('   Sample data:')
      keys.slice(0, 5).forEach(key => {
        const value = record[key]
        if (value === null) {
          console.log(`     ${key}: null`)
        } else if (typeof value === 'object') {
          console.log(`     ${key}: [object]`)
        } else {
          console.log(`     ${key}: ${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}`)
        }
      })
    }
  }
  
  // Also check the niche status
  console.log('\n📋 Niche Status:')
  const { data: niche } = await supabase
    .from('niches')
    .select('status, progress_percentage, error_message')
    .eq('id', nicheId)
    .single()
  
  if (niche) {
    console.log(`   Status: ${niche.status}`)
    console.log(`   Progress: ${niche.progress_percentage}%`)
    if (niche.error_message) {
      console.log(`   Error: ${niche.error_message}`)
    }
  }
}

checkAnalysisTables().catch(console.error)