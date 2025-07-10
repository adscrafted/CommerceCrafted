import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  try {
    // Try to query the products table
    console.log('Checking products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (productsError) {
      console.log('❌ Products table error:', productsError.message)
    } else {
      console.log('✅ Products table exists')
    }
    
    // Try to query the product_analyses table
    console.log('\nChecking product_analyses table...')
    const { data: analyses, error: analysesError } = await supabase
      .from('product_analyses')
      .select('count')
      .limit(1)
    
    if (analysesError) {
      console.log('❌ Product_analyses table error:', analysesError.message)
    } else {
      console.log('✅ Product_analyses table exists')
    }
    
    // Try to query the daily_features table
    console.log('\nChecking daily_features table...')
    const { data: features, error: featuresError } = await supabase
      .from('daily_features')
      .select('count')
      .limit(1)
    
    if (featuresError) {
      console.log('❌ Daily_features table error:', featuresError.message)
    } else {
      console.log('✅ Daily_features table exists')
    }
    
    // Check if we have any data
    console.log('\nChecking for data...')
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    console.log(`Found ${productCount || 0} products in database`)
    
  } catch (error) {
    console.error('Error checking tables:', error)
  }
}

checkTables()