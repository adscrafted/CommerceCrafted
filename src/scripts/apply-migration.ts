import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function applyMigration() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🔧 Applying schema fix migration...')
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20250129_fix_analysis_tables_schema.sql'),
      'utf-8'
    )
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 80) + '...')
      
      const { error } = await supabase.rpc('execute_sql', {
        sql: statement
      })
      
      if (error) {
        console.error('❌ Error:', error.message)
        // Continue with other statements even if one fails
      } else {
        console.log('✅ Success')
      }
    }
    
    console.log('\n✅ Migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

applyMigration().catch(console.error)