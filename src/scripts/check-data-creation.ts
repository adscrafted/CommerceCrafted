import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDataCreation() {
  console.log('\nChecking data creation for ignite niche...\n')
  
  try {
    // Check one ASIN
    const testAsin = 'B0DQYTRD5D'
    
    // Check product
    const { data: product, error: productError } = await supabase
      .from('product')
      .select('*')
      .eq('asin', testAsin)
      .single()
    
    console.log('Product check:')
    if (productError) {
      console.error('Error:', productError)
    } else {
      console.log('✅ Product exists:', product.title)
    }
    
    // Check keywords
    const { data: keywords, error: keywordsError, count: keywordCount } = await supabase
      .from('product_keywords')
      .select('*', { count: 'exact' })
      .eq('product_id', testAsin)
    
    console.log('\nKeywords check:')
    if (keywordsError) {
      console.error('Error:', keywordsError)
    } else {
      console.log(`✅ Found ${keywordCount} keywords`)
      keywords?.forEach(kw => {
        console.log(`  - ${kw.keyword} (${kw.match_type})`)
      })
    }
    
    // Check reviews
    const { data: reviews, error: reviewsError, count: reviewCount } = await supabase
      .from('product_customer_reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', testAsin)
    
    console.log('\nReviews check:')
    if (reviewsError) {
      console.error('Error:', reviewsError)
    } else {
      console.log(`✅ Found ${reviewCount} reviews`)
      reviews?.forEach(r => {
        console.log(`  - ${r.rating}★ ${r.title}`)
      })
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkDataCreation()