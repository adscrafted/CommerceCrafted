import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function populateIgniteNiche() {
  console.log('\nPopulating ignite niche with sample data...\n')
  
  try {
    // Get the ASINs from the niche
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('asins')
      .eq('id', 'ignite_1753685009886')
      .single()
    
    if (nicheError || !niche) {
      console.error('Error fetching niche:', nicheError)
      return
    }
    
    const asinList = niche.asins.split(',').map((a: string) => a.trim())
    console.log(`Processing ${asinList.length} ASINs...`)
    
    let totalKeywords = 0
    let totalReviews = 0
    
    for (const asin of asinList) {
      console.log(`\nPopulating data for ${asin}...`)
      
      // Add keywords
      const keywords = [
        { keyword: `${asin} main keyword`, match_type: 'exact', suggested_bid: 1.2 },
        { keyword: `best ${asin} product`, match_type: 'phrase', suggested_bid: 0.8 },
        { keyword: `buy ${asin} online`, match_type: 'broad', suggested_bid: 0.5 }
      ]
      
      for (const kw of keywords) {
        const { error } = await supabase
          .from('product_keywords')
          .insert({
            product_id: asin,
            keyword: kw.keyword,
            match_type: kw.match_type,
            suggested_bid: kw.suggested_bid,
            estimated_clicks: Math.floor(Math.random() * 100) + 10,
            estimated_orders: Math.floor(Math.random() * 20) + 1
          })
        
        if (!error) totalKeywords++
      }
      
      // Add reviews
      const reviews = [
        { rating: 5, title: 'Excellent product!', content: 'Really impressed with the quality and fast shipping.' },
        { rating: 4, title: 'Good value', content: 'Works as described, good for the price.' },
        { rating: 3, title: 'Average', content: 'It is okay, nothing special but does the job.' }
      ]
      
      for (const review of reviews) {
        const { error } = await supabase
          .from('product_customer_reviews')
          .insert({
            product_id: asin,
            reviewer_id: `reviewer_${Date.now()}_${Math.random()}`,
            reviewer_name: 'Sample Reviewer',
            rating: review.rating,
            title: review.title,
            content: review.content,
            verified_purchase: true,
            helpful_votes: Math.floor(Math.random() * 50),
            total_votes: Math.floor(Math.random() * 100),
            review_date: new Date().toISOString()
          })
        
        if (!error) totalReviews++
      }
    }
    
    console.log(`\n✅ Populated ignite niche!`)
    console.log(`- Total keywords added: ${totalKeywords}`)
    console.log(`- Total reviews added: ${totalReviews}`)
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

populateIgniteNiche()