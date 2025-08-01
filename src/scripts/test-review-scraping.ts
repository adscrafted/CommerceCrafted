import { createReviewScraper } from '@/lib/services/review-scraper'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testReviewScraping() {
  try {
    console.log('🚀 Testing review scraping...')
    
    const apifyKey = process.env.APIFY_API_KEY
    if (!apifyKey) {
      console.error('❌ APIFY_API_KEY not found in environment')
      return
    }
    
    console.log('✅ Apify API key found')
    
    // Create review scraper service
    const reviewScraper = createReviewScraper(apifyKey, true)
    
    // Test with a popular product ASIN (Echo Dot)
    const testAsin = 'B07FZ8S74R' // Amazon Echo Dot (3rd Gen)
    console.log(`\n📦 Testing review scraping for ASIN: ${testAsin}`)
    
    const result = await reviewScraper.scrapeReviews(testAsin, {
      maxReviews: 10,
      sortBy: 'recent'
    })
    
    if (result) {
      console.log(`✅ Successfully scraped reviews!`)
      console.log(`   📊 Total reviews: ${result.totalReviews}`)
      console.log(`   ⭐ Average rating: ${result.averageRating}`)
      console.log(`   💬 Reviews with text: ${result.reviews.length}`)
      console.log(`   💰 Compute units: ${result.computeUnits}`)
      console.log(`   💵 Estimated cost: $${result.estimatedCost?.toFixed(4)}`)
      
      // Show sample review
      if (result.reviews.length > 0) {
        const sample = result.reviews[0]
        console.log(`\n📝 Sample review:`)
        console.log(`   👤 Reviewer: ${sample.reviewerName}`)
        console.log(`   ⭐ Rating: ${sample.rating}/5`)
        console.log(`   📰 Title: ${sample.reviewTitle}`)
        console.log(`   💬 Text: ${sample.reviewText.substring(0, 100)}...`)
        console.log(`   ✅ Verified: ${sample.verifiedPurchase}`)
      }
      
      // Test storing in database
      console.log(`\n💾 Testing database storage...`)
      await reviewScraper.storeReviewsInDatabase(testAsin, result.reviews)
      console.log(`✅ Reviews stored in database successfully`)
      
    } else {
      console.log(`❌ Review scraping failed`)
    }
    
  } catch (error) {
    console.error('❌ Error testing review scraping:', error)
  }
}

testReviewScraping().catch(console.error)