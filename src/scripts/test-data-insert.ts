import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDataInsert() {
  const testAsin = 'B0DQYTRD5D'
  
  console.log('\nTesting keyword insert...')
  
  // Try to insert a keyword
  const { data: kwData, error: kwError } = await supabase
    .from('product_keywords')
    .insert({
      product_id: testAsin,
      keyword: 'test keyword',
      match_type: 'broad',
      suggested_bid: 0.5,
      estimated_clicks: 50,
      estimated_orders: 10
    })
    .select()
  
  if (kwError) {
    console.error('Keyword insert error:', kwError)
  } else {
    console.log('✅ Keyword inserted:', kwData)
  }
  
  console.log('\nTesting review insert...')
  
  // Try to insert a review
  const { data: reviewData, error: reviewError } = await supabase
    .from('product_customer_reviews')
    .insert({
      product_id: testAsin,
      review_id: `${testAsin}_test_${Date.now()}`,
      rating: 5,
      title: 'Test Review',
      comment: 'This is a test review.',
      is_verified_purchase: true,
      helpful_votes: 10,
      total_votes: 15,
      review_date: new Date().toISOString(),
      reviewer_name: 'Test Reviewer'
    })
    .select()
  
  if (reviewError) {
    console.error('Review insert error:', reviewError)
  } else {
    console.log('✅ Review inserted:', reviewData)
  }
}

testDataInsert()