import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function fixAnalysisTables() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🔧 Checking and fixing analysis table schemas...')
  
  // These tables should have niche_id, not product_id
  const tablesToFix = [
    'niches_market_intelligence',
    'niches_demand_analysis', 
    'niches_competition_analysis',
    'niches_financial_analysis',
    'niches_keyword_analysis',
    'niches_launch_strategy',
    'niches_listing_optimization'
  ]
  
  for (const table of tablesToFix) {
    console.log(`\n📊 Checking ${table}...`)
    
    // First, check if the table has product_id column
    const { data: columns } = await supabase.rpc('get_table_columns', {
      table_name: table
    }).select('*')
    
    console.log(`   Columns query result:`, columns)
    
    // Alternative: Try to query and see what error we get
    const { error: queryError } = await supabase
      .from(table)
      .select('niche_id, product_id')
      .limit(1)
    
    if (queryError) {
      console.log(`   Query error: ${queryError.message}`)
      
      if (queryError.message.includes('column') && queryError.message.includes('does not exist')) {
        // Extract which column doesn't exist
        const match = queryError.message.match(/column "([^"]+)" does not exist/)
        if (match) {
          console.log(`   Missing column: ${match[1]}`)
        }
      }
    } else {
      console.log(`   Table structure seems OK`)
    }
  }
  
  // Also check niches_overall_analysis for feasibility_score
  console.log('\n📊 Checking niches_overall_analysis...')
  const { error: overallError } = await supabase
    .from('niches_overall_analysis')
    .select('feasibility_score')
    .limit(1)
  
  if (overallError) {
    console.log(`   Error: ${overallError.message}`)
  } else {
    console.log(`   feasibility_score column exists`)
  }
}

fixAnalysisTables().catch(console.error)
