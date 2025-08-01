import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProductTable() {
  console.log('\nChecking product table structure...\n')
  
  try {
    // Get a sample product to see the columns
    const { data: sampleProduct, error } = await supabase
      .from('product')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching sample product:', error)
      return
    }
    
    if (sampleProduct) {
      console.log('Product table columns:')
      Object.keys(sampleProduct).forEach(key => {
        console.log(`- ${key}: ${typeof sampleProduct[key]}`)
      })
    } else {
      console.log('No products in table yet')
    }
    
    // Try to get the table structure from Supabase
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'product')
    
    if (!columnsError && columns) {
      console.log('\nProduct table schema:')
      columns.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(nullable)'}`)
      })
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkProductTable()