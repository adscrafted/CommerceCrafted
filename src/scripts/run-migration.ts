import { createServiceSupabaseClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function runMigration() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🚀 Running migration to create missing keywords and reviews tables...')
  
  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250129_create_missing_keywords_reviews_tables.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  // Split by semicolon to run each statement separately
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  let successCount = 0
  let errorCount = 0
  
  for (const statement of statements) {
    if (statement.startsWith('--') || statement.length === 0) continue
    
    console.log(`\n📝 Running: ${statement.substring(0, 50)}...`)
    
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      })
      
      if (error) {
        console.error(`❌ Error: ${error.message}`)
        errorCount++
      } else {
        console.log(`✅ Success`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Error: ${err}`)
      errorCount++
    }
  }
  
  console.log(`\n📊 Migration complete:`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  
  // If RPC doesn't work, let's try a different approach
  if (errorCount === statements.length) {
    console.log('\n🔄 RPC method failed, trying direct approach...')
    
    // Let's just verify the tables exist and manually insert test data
    const tables = [
      'product_keywords',
      'product_customer_reviews',
      'product_customer_reviews_cache'
    ]
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table ${table} check failed:`, error.message)
      } else {
        console.log(`✅ Table ${table} exists`)
      }
    }
  }
}

runMigration().catch(console.error)