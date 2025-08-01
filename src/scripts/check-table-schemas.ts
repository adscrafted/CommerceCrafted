import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function checkTableSchemas() {
  const supabase = createServiceSupabaseClient()
  
  const tables = [
    'niches_overall_analysis',
    'niches_market_intelligence', 
    'niches_demand_analysis',
    'niches_competition_analysis'
  ]
  
  for (const table of tables) {
    console.log(`\n📊 Checking schema for ${table}:`)
    
    // Get a sample row to see columns
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error && error.message.includes('does not exist')) {
      console.log('   ❌ Table does not exist')
      continue
    }
    
    // Even if no data, we can check columns from error messages
    const { error: schemaError } = await supabase
      .from(table)
      .insert({ niche_id: 'test' })
      .select()
    
    if (schemaError) {
      console.log('   Schema check error:', schemaError.message)
      
      // Try to extract required columns from error
      if (schemaError.message.includes('null value in column')) {
        const match = schemaError.message.match(/column "([^"]+)"/)
        if (match) {
          console.log('   Required column found:', match[1])
        }
      }
    }
  }
}

checkTableSchemas().catch(console.error)
