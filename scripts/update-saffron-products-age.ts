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

async function updateSaffronProductsAge() {
  console.log('Updating Saffron niche products with age data...\n')
  
  // Get the saffron niche
  const { data: niche, error: nicheError } = await supabase
    .from('niches')
    .select('id, asins')
    .eq('id', 'saffron_supplements_1753229796169')
    .single()
  
  if (nicheError || !niche) {
    console.error('Error fetching niche:', nicheError)
    return
  }
  
  const asinList = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
  console.log(`Found ${asinList.length} ASINs in Saffron niche\n`)
  
  // Process each ASIN
  for (const asin of asinList) {
    console.log(`\nProcessing ${asin}...`)
    
    // Check if product already has age data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, title, first_seen_date, product_age_months')
      .eq('asin', asin)
      .single()
    
    if (productError) {
      console.error(`  ❌ Error fetching product ${asin}:`, productError)
      continue
    }
    
    if (product?.first_seen_date) {
      console.log(`  ✓ Already has age data: ${product.product_age_months} months`)
      continue
    }
    
    try {
      // Call Keepa API to get product data with age
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/amazon/keepa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin })
      })
      
      if (!response.ok) {
        console.error(`  ❌ Keepa API error for ${asin}:`, response.status)
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
            keepa_data: keepaData
          })
          .eq('asin', asin)
        
        if (updateError) {
          console.error(`  ❌ Failed to update ${asin}:`, updateError)
        } else {
          console.log(`  ✅ Updated ${asin}:`)
          console.log(`     - Title: ${product.title?.substring(0, 50)}...`)
          console.log(`     - First seen: ${firstSeenDate.toLocaleDateString()}`)
          console.log(`     - Age: ${keepaData.productAge.months} months (${keepaData.productAge.category})`)
        }
      } else {
        console.log(`  ⚠️  No age data available for ${asin}`)
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`  ❌ Error processing ${asin}:`, error)
    }
  }
  
  console.log('\n✅ Saffron products age update complete!')
}

updateSaffronProductsAge()