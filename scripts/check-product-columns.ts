import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProductColumns() {
  console.log('Checking product table columns...\n')
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  if (data && data[0]) {
    console.log('Available columns in products table:')
    Object.keys(data[0]).forEach(col => {
      console.log(`  - ${col}: ${typeof data[0][col]}`)
    })
    
    // Check specifically for age-related columns
    console.log('\nAge-related columns:')
    const ageColumns = ['first_seen_date', 'product_age_months', 'product_age_category', 'created_at', 'launch_date']
    ageColumns.forEach(col => {
      if (data[0].hasOwnProperty(col)) {
        console.log(`  ✓ ${col}: ${data[0][col]}`)
      } else {
        console.log(`  ✗ ${col}: NOT FOUND`)
      }
    })
  }
}

checkProductColumns()