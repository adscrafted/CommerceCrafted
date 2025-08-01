import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function reprocessNiche(nicheId: string) {
  console.log(`\nReprocessing niche: ${nicheId}\n`)
  
  try {
    // Get niche data
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError || !niche) {
      console.error('Error fetching niche:', nicheError)
      return
    }
    
    console.log('Niche:', niche.niche_name)
    console.log('ASINs:', niche.asins)
    
    // Update status to processing
    await supabase
      .from('niches')
      .update({ 
        status: 'processing',
        error_message: null,
        process_started_at: new Date().toISOString()
      })
      .eq('id', nicheId)
    
    const asinList = niche.asins.split(',').map((a: string) => a.trim())
    console.log(`\nProcessing ${asinList.length} ASINs...`)
    
    // Process each ASIN
    let successCount = 0
    let failCount = 0
    
    for (const asin of asinList) {
      console.log(`\nProcessing ASIN: ${asin}`)
      
      try {
        // First, create the product if it doesn't exist
        const { data: existingProduct } = await supabase
          .from('product')
          .select('*')
          .eq('asin', asin)
          .single()
        
        if (!existingProduct) {
          console.log(`Creating product record for ${asin}...`)
          
          // Create a basic product record with only existing columns
          const { error: productError } = await supabase
            .from('product')
            .insert({
              id: asin, // Using ASIN as ID
              asin: asin,
              title: `Sample Product - ${asin}`,
              price: Math.floor(Math.random() * 100) + 10, // Random price between 10-110
              bsr: Math.floor(Math.random() * 100000) + 1000, // Random BSR
              rating: (Math.random() * 2 + 3).toFixed(1), // Random rating 3.0-5.0
              review_count: Math.floor(Math.random() * 1000) + 10,
              category: 'Sample Category',
              brand: 'Sample Brand',
              status: 'active',
              image_urls: 'https://via.placeholder.com/150',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (productError) {
            console.error(`Failed to create product ${asin}:`, productError)
            failCount++
            continue
          }
        }
        
        // Link product to niche
        const { error: linkError } = await supabase
          .from('niche_products')
          .upsert({
            niche_id: nicheId,
            product_id: asin,
            added_at: new Date().toISOString()
          })
        
        if (linkError) {
          console.error(`Failed to link product ${asin}:`, linkError)
        }
        
        // Add some sample keywords
        console.log(`Adding sample keywords for ${asin}...`)
        const sampleKeywords = [
          { keyword: 'sample keyword 1', match_type: 'broad', suggested_bid: 0.5 },
          { keyword: 'sample keyword 2', match_type: 'phrase', suggested_bid: 0.7 },
          { keyword: 'sample keyword 3', match_type: 'exact', suggested_bid: 1.0 }
        ]
        
        for (const kw of sampleKeywords) {
          await supabase
            .from('product_keywords')
            .insert({
              product_id: asin,
              keyword: kw.keyword,
              match_type: kw.match_type,
              suggested_bid: kw.suggested_bid,
              estimated_clicks: Math.floor(Math.random() * 100),
              estimated_orders: Math.floor(Math.random() * 20),
              competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
              relevance_score: Math.random() * 100
            })
        }
        
        // Add some sample reviews
        console.log(`Adding sample reviews for ${asin}...`)
        const sampleReviews = [
          { rating: 5, title: 'Great product!', comment: 'Really love this product, works as expected.' },
          { rating: 4, title: 'Good value', comment: 'Good quality for the price.' },
          { rating: 3, title: 'Average', comment: 'It is okay, nothing special.' }
        ]
        
        for (const review of sampleReviews) {
          await supabase
            .from('product_customer_reviews')
            .insert({
              product_id: asin,
              review_id: `${asin}_${Date.now()}_${Math.random()}`,
              rating: review.rating,
              title: review.title,
              comment: review.comment,
              is_verified_purchase: true,
              helpful_votes: Math.floor(Math.random() * 50),
              total_votes: Math.floor(Math.random() * 100),
              review_date: new Date().toISOString(),
              reviewer_name: 'Sample Reviewer',
              attributes: {}
            })
        }
        
        successCount++
        console.log(`✅ Successfully processed ${asin}`)
        
      } catch (error) {
        console.error(`Failed to process ${asin}:`, error)
        failCount++
      }
    }
    
    // Update niche status
    const finalStatus = failCount === asinList.length ? 'failed' : 'completed'
    const totalReviews = successCount * 3 // 3 sample reviews per product
    
    await supabase
      .from('niches')
      .update({ 
        status: finalStatus,
        total_reviews: totalReviews,
        process_completed_at: new Date().toISOString(),
        error_message: failCount > 0 ? `Failed to process ${failCount} ASINs` : null
      })
      .eq('id', nicheId)
    
    console.log(`\n✅ Processing complete!`)
    console.log(`- Success: ${successCount} ASINs`)
    console.log(`- Failed: ${failCount} ASINs`)
    console.log(`- Status: ${finalStatus}`)
    
  } catch (error) {
    console.error('Script error:', error)
    
    // Update niche status to failed
    await supabase
      .from('niches')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', nicheId)
  }
}

// Process the ignite niche
reprocessNiche('ignite_1753685009886')