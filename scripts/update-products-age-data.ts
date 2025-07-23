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

async function updateProductAgeData() {
  console.log('Updating existing products with age data...\n')
  
  // Get all products that don't have age data
  const { data: products, error } = await supabase
    .from('products')
    .select('id, asin, title')
    .is('first_seen_date', null)
    .limit(10) // Process 10 at a time
  
  if (error) {
    console.error('Error fetching products:', error)
    return
  }
  
  console.log(`Found ${products?.length || 0} products without age data\n`)
  
  if (!products || products.length === 0) {
    console.log('All products have age data!')
    return
  }
  
  // Process each product
  for (const product of products) {
    console.log(`\nProcessing ${product.asin}: ${product.title.substring(0, 50)}...`)
    
    try {
      // Call Keepa API to get product data with age
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/amazon/keepa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin: product.asin })
      })
      
      if (!response.ok) {
        console.error(`  ❌ Keepa API error for ${product.asin}:`, response.status)
        continue
      }
      
      const keepaData = await response.json()
      
      if (keepaData.productAge && keepaData.firstSeenTimestamp) {
        // Calculate first seen date
        const keepaEpoch = new Date('2011-01-01').getTime()
        const firstSeenDate = new Date(keepaEpoch + (keepaData.firstSeenTimestamp * 60000))
        
        // Update product with age data
        const { error: updateError } = await supabase
          .from('products')
          .update({
            first_seen_date: firstSeenDate.toISOString(),
            product_age_months: keepaData.productAge.months,
            product_age_category: keepaData.productAge.category,
            keepa_data: keepaData // Also update full keepa data
          })
          .eq('id', product.id)
        
        if (updateError) {
          console.error(`  ❌ Failed to update ${product.asin}:`, updateError)
        } else {
          console.log(`  ✅ Updated ${product.asin}:`)
          console.log(`     - First seen: ${firstSeenDate.toLocaleDateString()}`)
          console.log(`     - Age: ${keepaData.productAge.months} months (${keepaData.productAge.category})`)
        }
      } else {
        console.log(`  ⚠️  No age data available for ${product.asin}`)
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`  ❌ Error processing ${product.asin}:`, error)
    }
  }
  
  console.log('\n✅ Product age update complete!')
}

updateProductAgeData()