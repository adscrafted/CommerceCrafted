import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addProductAgeColumns() {
  console.log('Adding product age columns to products table...\n')
  
  try {
    // Add columns using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS first_seen_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS product_age_months INTEGER,
        ADD COLUMN IF NOT EXISTS product_age_category TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_products_age_category ON products(product_age_category);
        CREATE INDEX IF NOT EXISTS idx_products_first_seen ON products(first_seen_date);
      `
    })
    
    if (error) {
      console.error('Error adding columns:', error)
      
      // Try a different approach - add columns one by one
      console.log('Trying alternative approach...')
      
      // Since we can't alter table directly, let's update the Prisma schema and regenerate
      console.log('Please update your Prisma schema to include:')
      console.log(`
  first_seen_date      DateTime?
  product_age_months   Int?
  product_age_category String?
      `)
      console.log('\nThen run: npx prisma db push')
    } else {
      console.log('✅ Successfully added product age columns!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addProductAgeColumns()