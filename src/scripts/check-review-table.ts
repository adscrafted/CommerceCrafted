import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkReviewTable() {
  console.log('\nChecking product_customer_reviews table structure...\n')
  
  try {
    // Get a sample review to see the columns
    const { data: sampleReview, error } = await supabase
      .from('product_customer_reviews')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching sample review:', error)
      return
    }
    
    if (sampleReview) {
      console.log('Review table columns:')
      Object.keys(sampleReview).forEach(key => {
        console.log(`- ${key}: ${typeof sampleReview[key]}`)
      })
    } else {
      console.log('No reviews in table yet')
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkReviewTable()