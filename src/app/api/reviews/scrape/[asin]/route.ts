import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { apifyIntegration } from '@/lib/integrations/apify'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Skip auth checks in development mode
    if (process.env.NODE_ENV !== 'development') {
      // In production, add auth checks here
      console.log('Production mode: Auth checks would be performed here')
    }

    // Get request options
    const { maxReviews = 100, filterByStar, sortBy = 'recent' } = await request.json().catch(() => ({}))

    console.log('Starting Amazon reviews scraping for ASIN:', asin)

    // Check if we have recent review data cached
    const { data: cachedReviews, error: cacheError } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin)
      .eq('data_type', 'amazon_reviews')
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (cachedReviews && !cacheError) {
      console.log('Returning cached review data')
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: cachedReviews.processed_data
      })
    }

    // Scrape fresh reviews
    const reviews = await apifyIntegration.scrapeAmazonReviews({
      asins: [asin],
      maxReviews,
      filterByStar,
      sortBy,
      country: 'US'
    })

    if (!reviews || reviews.length === 0) {
      return NextResponse.json(
        { error: 'No reviews found for this ASIN' },
        { status: 404 }
      )
    }

    console.log(`Scraped ${reviews.length} reviews for ASIN ${asin}`)

    // Analyze the reviews
    const analysis = apifyIntegration.analyzeReviews(reviews)

    // Store individual reviews in database
    const reviewsToInsert = reviews.map(review => ({
      asin: asin,
      review_id: review.reviewId,
      title: review.title,
      text: review.text,
      rating: review.rating,
      verified_purchase: review.verified,
      helpful_votes: review.helpful,
      total_votes: review.totalHelpful,
      reviewer_name: review.reviewerName,
      reviewer_profile_url: review.reviewerProfileUrl,
      review_date: review.date,
      variant_data: review.variantAttributes,
      images: review.images,
      created_at: new Date().toISOString()
    }))

    // Batch insert reviews (upsert to handle duplicates)
    const { error: insertError } = await supabase
      .from('customer_reviews')
      .upsert(reviewsToInsert, {
        onConflict: 'asin,review_id',
        ignoreDuplicates: true
      })

    if (insertError) {
      console.error('Error storing reviews:', insertError)
    }

    // Update review analysis in product_analyses
    const { error: analysisError } = await supabase
      .from('product_analyses')
      .update({
        review_analysis: {
          totalReviews: analysis.totalReviews,
          averageRating: analysis.averageRating,
          ratingDistribution: analysis.ratingDistribution,
          verifiedPurchaseRate: analysis.verifiedPurchaseRate,
          sentimentAnalysis: analysis.sentimentAnalysis,
          reviewsByMonth: analysis.reviewsByMonth,
          topVariants: analysis.topVariants,
          lastUpdated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('asin', asin)

    if (analysisError) {
      console.error('Error updating review analysis:', analysisError)
    }

    // Cache the results
    const cacheExpiresAt = new Date()
    cacheExpiresAt.setHours(cacheExpiresAt.getHours() + 24) // Cache for 24 hours

    const { error: cacheInsertError } = await supabase
      .from('amazon_api_cache')
      .upsert({
        asin: asin,
        data_type: 'amazon_reviews',
        raw_data: { reviews: reviews.slice(0, 10) }, // Store sample of raw reviews
        processed_data: {
          analysis,
          totalScraped: reviews.length,
          scrapedAt: new Date().toISOString()
        },
        cache_expires_at: cacheExpiresAt.toISOString(),
        api_source: 'apify_reviews'
      }, {
        onConflict: 'asin,data_type'
      })

    if (cacheInsertError) {
      console.error('Error caching review data:', cacheInsertError)
    }

    return NextResponse.json({
      success: true,
      source: 'fresh',
      data: {
        analysis,
        totalReviews: reviews.length,
        sampleReviews: reviews.slice(0, 5) // Return sample for immediate display
      }
    })

  } catch (error) {
    console.error('Error scraping Amazon reviews:', error)
    return NextResponse.json(
      { 
        error: 'Failed to scrape Amazon reviews', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Get review analysis from product_analyses
    const { data: productAnalysis, error: analysisError } = await supabase
      .from('product_analyses')
      .select('review_analysis')
      .eq('asin', asin)
      .single()

    if (analysisError || !productAnalysis?.review_analysis) {
      return NextResponse.json(
        { error: 'No review analysis found. Please scrape reviews first.' },
        { status: 404 }
      )
    }

    // Get sample of actual reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('customer_reviews')
      .select('*')
      .eq('asin', asin)
      .order('review_date', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        analysis: productAnalysis.review_analysis,
        sampleReviews: reviews || []
      }
    })

  } catch (error) {
    console.error('Error fetching review data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review data' },
      { status: 500 }
    )
  }
}