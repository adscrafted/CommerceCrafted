import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkReviewDuplicates() {
  console.log('🔍 Checking for duplicate reviews...')
  
  try {
    // Get all reviews for berberine products
    const berberineAsins = ['B0DQ1LHZ9R', 'B0CNQC2TWG']
    
    const { data: reviews, error } = await supabase
      .from('customer_reviews')
      .select('*')
      .in('product_id', berberineAsins)
      .order('product_id')
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return
    }
    
    console.log(`\n📊 Total reviews found: ${reviews?.length || 0}`)
    
    // Group by product
    const reviewsByProduct: Record<string, any[]> = {}
    reviews?.forEach(review => {
      if (!reviewsByProduct[review.product_id]) {
        reviewsByProduct[review.product_id] = []
      }
      reviewsByProduct[review.product_id].push(review)
    })
    
    // Check each product
    for (const [productId, productReviews] of Object.entries(reviewsByProduct)) {
      console.log(`\n📦 Product: ${productId}`)
      console.log(`   Total reviews: ${productReviews.length}`)
      
      // Check for duplicate reviewer_ids
      const reviewerIds = productReviews.map(r => r.reviewer_id)
      const uniqueReviewerIds = new Set(reviewerIds)
      console.log(`   Unique reviewers: ${uniqueReviewerIds.size}`)
      
      if (reviewerIds.length !== uniqueReviewerIds.size) {
        console.log(`   ⚠️  DUPLICATES FOUND!`)
        
        // Find which reviewers have multiple reviews
        const reviewerCounts: Record<string, number> = {}
        reviewerIds.forEach(id => {
          reviewerCounts[id] = (reviewerCounts[id] || 0) + 1
        })
        
        const duplicateReviewers = Object.entries(reviewerCounts)
          .filter(([_, count]) => count > 1)
          .sort((a, b) => b[1] - a[1])
        
        console.log(`   Duplicate reviewers: ${duplicateReviewers.length}`)
        duplicateReviewers.slice(0, 5).forEach(([reviewerId, count]) => {
          const reviewerReviews = productReviews.filter(r => r.reviewer_id === reviewerId)
          console.log(`     - ${reviewerId}: ${count} reviews`)
          reviewerReviews.forEach(r => {
            console.log(`       * "${r.title}" - ${new Date(r.review_date).toLocaleDateString()}`)
          })
        })
      }
      
      // Check for exact duplicate content
      const contentSet = new Set(productReviews.map(r => r.content))
      if (contentSet.size < productReviews.length) {
        console.log(`   ⚠️  Duplicate content found: ${productReviews.length - contentSet.size} duplicates`)
      }
    }
    
    // Check across all products
    console.log(`\n📊 Cross-product analysis:`)
    const allReviewerIds = reviews?.map(r => r.reviewer_id) || []
    const uniqueReviewersTotal = new Set(allReviewerIds).size
    console.log(`   Total unique reviewers across all products: ${uniqueReviewersTotal}`)
    
  } catch (error) {
    console.error('Error checking duplicates:', error)
  }
}

// Run the check
checkReviewDuplicates()