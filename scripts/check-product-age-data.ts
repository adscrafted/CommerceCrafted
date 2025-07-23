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

async function checkProductAgeData() {
  console.log('Checking product age data...\n')
  
  // Get a sample of products with age data
  const { data: products, error } = await supabase
    .from('products')
    .select('asin, title, first_seen_date, product_age_months, product_age_category, keepa_data')
    .not('first_seen_date', 'is', null)
    .limit(10)
  
  if (error) {
    console.error('Error fetching products:', error)
    return
  }
  
  console.log(`Found ${products?.length || 0} products with age data:\n`)
  
  if (products && products.length > 0) {
    products.forEach(p => {
      console.log(`ASIN: ${p.asin}`)
      console.log(`Title: ${p.title.substring(0, 50)}...`)
      console.log(`First Seen: ${p.first_seen_date}`)
      console.log(`Age (months): ${p.product_age_months}`)
      console.log(`Category: ${p.product_age_category}`)
      console.log('---')
    })
  } else {
    // Check if any products exist
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('asin, title, keepa_data')
      .limit(10)
    
    if (allProducts && allProducts.length > 0) {
      console.log('\nNo products have age data yet. Sample products:')
      allProducts.forEach(p => {
        console.log(`- ${p.asin}: ${p.title.substring(0, 50)}...`)
        // Check if keepa_data has age info
        try {
          const keepaData = typeof p.keepa_data === 'string' ? JSON.parse(p.keepa_data) : p.keepa_data
          if (keepaData?.productAge || keepaData?.firstSeenTimestamp) {
            console.log('  ✓ Has age data in keepa_data JSON')
          }
        } catch (e) {}
      })
    }
  }
}

checkProductAgeData()