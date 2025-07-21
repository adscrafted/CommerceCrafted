import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeDuplicateReviews() {
  console.log('🧹 Removing duplicate reviews...')
  
  try {
    // Get all reviews
    const { data: reviews, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .order('created_at', { ascending: true }) // Keep the oldest
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return
    }
    
    console.log(`📊 Total reviews found: ${reviews?.length || 0}`)
    
    // Track seen reviews to identify duplicates
    const seenReviews = new Map<string, string>() // key: product_id|reviewer_id|content, value: review_id
    const duplicateIds: string[] = []
    
    reviews?.forEach(review => {
      const key = `${review.product_id}|${review.reviewer_id}|${review.content}`
      
      if (seenReviews.has(key)) {
        // This is a duplicate
        duplicateIds.push(review.id)
      } else {
        // First occurrence
        seenReviews.set(key, review.id)
      }
    })
    
    console.log(`🔍 Found ${duplicateIds.length} duplicate reviews to remove`)
    
    if (duplicateIds.length > 0) {
      // Delete duplicates in batches
      const batchSize = 100
      for (let i = 0; i < duplicateIds.length; i += batchSize) {
        const batch = duplicateIds.slice(i, i + batchSize)
        
        const { error: deleteError } = await supabase
          .from('customer_reviews')
          .delete()
          .in('id', batch)
        
        if (deleteError) {
          console.error(`❌ Error deleting batch ${i / batchSize + 1}:`, deleteError)
        } else {
          console.log(`✅ Deleted batch ${i / batchSize + 1} (${batch.length} reviews)`)
        }
      }
      
      console.log(`\n✅ Cleanup complete! Removed ${duplicateIds.length} duplicate reviews`)
      
      // Verify the cleanup
      const { count } = await supabase
        .from('customer_reviews')
        .select('*', { count: 'exact', head: true })
      
      console.log(`📊 Total reviews after cleanup: ${count}`)
    } else {
      console.log('✅ No duplicates found!')
    }
    
  } catch (error) {
    console.error('Error removing duplicates:', error)
  }
}

// Run the cleanup
removeDuplicateReviews()