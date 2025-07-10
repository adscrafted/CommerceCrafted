import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  try {
    console.log('Running database migrations...')
    
    // Read migration files
    const migrationFiles = [
      '20240101000000_create_niche_tables.sql',
      '20240102000000_create_product_tables.sql'
    ]
    
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(
        path.join(__dirname, '..', 'supabase', 'migrations', file),
        'utf8'
      )
      
      // Split by semicolons but be careful with functions
      const statements = sql
        .split(/;\s*$/gm)
        .filter(stmt => stmt.trim().length > 0)
        .map(stmt => stmt.trim() + ';')
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement
          }).single()
          
          if (error && !error.message.includes('already exists')) {
            console.error(`Error executing: ${statement.substring(0, 50)}...`)
            console.error(error)
          }
        }
      }
    }
    
    console.log('✅ Migrations completed')
    
    // Run seed data
    console.log('\nRunning seed data...')
    const seedSql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'seed.sql'),
      'utf8'
    )
    
    const seedStatements = seedSql
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';')
    
    for (const statement of seedStatements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        }).single()
        
        if (error && !error.message.includes('duplicate key')) {
          console.error(`Error executing seed: ${statement.substring(0, 50)}...`)
          console.error(error)
        }
      }
    }
    
    console.log('✅ Seed data completed')
    
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

runMigrations()