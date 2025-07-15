import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('Running keyword groups migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-keyword-groups-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolons but preserve semicolons within functions
    const statements = sql
      .split(/;(?=\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE|COMMENT|--|\s*$))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip comments
      if (statement.startsWith('--')) continue
      
      console.log(`\nExecuting statement ${i + 1}/${statements.length}`)
      console.log(statement.substring(0, 50) + '...')
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      })
      
      if (error) {
        // Try direct query if RPC fails
        const { error: queryError } = await supabase
          .from('_sql')
          .select('*')
          .single()
          .throwOnError()
          .then(() => ({ error: null }))
          .catch(err => ({ error: err }))
        
        if (queryError) {
          console.error(`Error executing statement: ${error.message}`)
          console.error('Statement:', statement.substring(0, 200))
          
          // Continue with other statements even if one fails
          continue
        }
      }
      
      console.log('✓ Success')
    }
    
    console.log('\n✅ Migration completed!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Alternative approach using direct connection
async function runMigrationDirect() {
  try {
    const { Client } = require('pg')
    
    const connectionString = process.env.DATABASE_URL
    const client = new Client({ connectionString })
    
    await client.connect()
    console.log('Connected to database')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-keyword-groups-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('Executing migration...')
    await client.query(sql)
    
    console.log('✅ Migration completed successfully!')
    
    await client.end()
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Try direct connection approach
runMigrationDirect().catch(console.error)