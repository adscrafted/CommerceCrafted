import { ApifyClient } from 'apify-client';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

interface ReviewData {
  reviewerId: string;
  reviewerName: string;
  reviewerUrl: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  reviewDate: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  reviewImages?: string[];
  variant?: string;
}

interface ScraperResult {
  asin: string;
  totalReviews: number;
  averageRating: number;
  reviews: ReviewData[];
  scrapedAt: string;
  computeUnits?: number;
  estimatedCost?: number;
}

export class ReviewScraperService {
  private client: ApifyClient;
  private supabase: any = null;
  private useServiceClient: boolean;

  constructor(apifyToken: string, useServiceClient: boolean = false) {
    this.client = new ApifyClient({ token: apifyToken });
    this.useServiceClient = useServiceClient;
  }

  private async getSupabase() {
    if (!this.supabase) {
      if (this.useServiceClient) {
        // For standalone scripts and background tasks
        this.supabase = createServiceSupabaseClient();
      } else {
        // Check if we're in a Next.js context
        try {
          this.supabase = await createServerSupabaseClient();
        } catch (error) {
          // Fallback to service client if not in Next.js context
          console.log('[ReviewScraper] Using service client for standalone execution');
          this.supabase = createServiceSupabaseClient();
        }
      }
    }
    return this.supabase;
  }

  /**
   * Scrape reviews for a single ASIN
   */
  async scrapeReviews(
    asin: string, 
    options: {
      maxReviews?: number;
      sortBy?: 'recent' | 'helpful';
      filterByStar?: '' | 'positive' | 'critical' | 'one_star' | 'two_star' | 'three_star' | 'four_star' | 'five_star';
    } = {}
  ): Promise<ScraperResult | null> {
    const { maxReviews = 100, sortBy = 'recent', filterByStar = '' } = options;

    try {
      console.log(`[ReviewScraper] Starting scrape for ASIN: ${asin}`);

      // Check if we have cached reviews
      const cached = await this.getCachedReviews(asin);
      if (cached && this.isCacheValid(cached.scraped_at)) {
        console.log(`[ReviewScraper] Using cached reviews for ${asin}`);
        return this.formatCachedResult(cached);
      }

      // Construct Amazon product URL
      const productUrl = `https://www.amazon.com/dp/${asin}`;
      
      console.log(`[ReviewScraper] Attempting to fetch reviews for ${productUrl}`);

      let run;
      let items;
      let actorUsed = '';
      
      // Use the Axesso Amazon Reviews Scraper with correct input format
      const axessoInput = {
        input: [
          {
            asin: asin,
            domainCode: "com",
            sortBy: sortBy || "recent",
            maxPages: Math.ceil((maxReviews || 100) / 10), // Amazon shows ~10 reviews per page
            filterByStar: filterByStar ? filterByStar.replace('_star', '_star') : undefined,
            reviewerType: "all_reviews",
            formatType: "current_format",
            mediaType: "all_contents"
          }
        ]
      };
      
      console.log(`[ReviewScraper] Calling Axesso Amazon Reviews Scraper with input:`, JSON.stringify(axessoInput, null, 2));
      
      try {
        // Call the Axesso Amazon Reviews Scraper
        run = await this.client.actor('axesso_data/amazon-reviews-scraper').call(axessoInput);
        
        console.log(`[ReviewScraper] Run started with ID: ${run.id}`);
        
        // Wait for the run to complete (with timeout)
        const maxWaitTime = 60000; // 60 seconds
        const checkInterval = 2000; // Check every 2 seconds
        let waited = 0;
        
        while (waited < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          waited += checkInterval;
          
          // Check run status
          const runInfo = await this.client.run(run.id).get();
          console.log(`[ReviewScraper] Run status: ${runInfo.status} (${waited/1000}s elapsed)`);
          
          if (runInfo.status === 'SUCCEEDED') {
            break;
          } else if (runInfo.status === 'FAILED' || runInfo.status === 'ABORTED') {
            throw new Error(`Run failed with status: ${runInfo.status}`);
          }
        }
        
        // Get the results
        const dataset = await this.client.dataset(run.defaultDatasetId).listItems();
        items = dataset.items;
        actorUsed = 'axesso_data/amazon-reviews-scraper';
        
        console.log(`[ReviewScraper] Success! Retrieved ${items.length} review items`);
        
      } catch (error: any) {
        console.error(`[ReviewScraper] Axesso actor failed: ${error.message}`);
        throw new Error(`Failed to fetch reviews from Amazon: ${error.message}`);
      }
      
      // Validate we got results
      if (!items || items.length === 0) {
        throw new Error('No reviews returned from Apify actor');
      }

      console.log(`[ReviewScraper] Received ${items.length} items from actor ${actorUsed}`);
      
      // Debug: Log first item to understand structure
      if (items.length > 0) {
        console.log(`[ReviewScraper] Sample item structure:`, JSON.stringify(items[0], null, 2));
      }
      
      // Check for error responses
      if (items.length > 0 && items[0].statusCode === 404) {
        throw new Error(`Product not found on Amazon: ASIN ${asin} returned 404`);
      }
      
      // Parse Axesso response format
      let totalReviews = 0;
      let averageRating = 0;
      let reviews: ReviewData[] = [];
      
      // Axesso returns each review as a separate item in the dataset
      if (actorUsed === 'axesso_data/amazon-reviews-scraper') {
        // Group reviews by ASIN (should all be the same for our use case)
        const reviewsByAsin = new Map<string, any[]>();
        
        items.forEach((item: any) => {
          const reviewAsin = item.asin;
          if (!reviewsByAsin.has(reviewAsin)) {
            reviewsByAsin.set(reviewAsin, []);
          }
          reviewsByAsin.get(reviewAsin)!.push(item);
        });
        
        // Get reviews for our ASIN
        const asinReviews = reviewsByAsin.get(asin) || items;
        
        // Extract metadata from first review
        if (asinReviews.length > 0) {
          const firstItem = asinReviews[0];
          totalReviews = firstItem.countReviews || asinReviews.length;
          averageRating = parseFloat(firstItem.productRating?.split(' ')[0] || '0');
        }
        
        // Convert Axesso format to our ReviewData format
        reviews = asinReviews.map((item: any) => {
          // Parse rating from "5.0 out of 5 stars" format
          const ratingMatch = item.rating?.match(/(\d+\.?\d*)/);
          const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
          
          // Parse date
          let reviewDate = new Date().toISOString();
          if (item.date) {
            try {
              // Example: "Reviewed in the United Kingdom on 24 November 2024"
              const dateMatch = item.date.match(/on (.+)$/);
              if (dateMatch) {
                reviewDate = new Date(dateMatch[1]).toISOString();
              }
            } catch (e) {
              console.log(`[ReviewScraper] Could not parse date: ${item.date}`);
            }
          }
          
          return {
            reviewerId: item.reviewId || `REV${Date.now()}${Math.random()}`,
            reviewerName: item.userName || 'Anonymous',
            reviewerUrl: '',
            rating: rating,
            reviewTitle: item.title || '',
            reviewText: item.text || '',
            reviewDate: reviewDate,
            verifiedPurchase: item.verified === true,
            helpfulVotes: item.numberOfHelpful || 0,
            totalVotes: item.numberOfHelpful || 0, // Axesso doesn't provide total votes
            reviewImages: item.imageUrlList || [],
            variant: item.variationList?.join(', ') || ''
          };
        });
      }
      
      // Get usage info for cost calculation (only if we have a real run)
      let computeUnits = 0;
      let estimatedCost = 0;
      
      if (run?.id) {
        try {
          const runInfo = await this.client.run(run.id).get();
          computeUnits = runInfo?.usage?.computeUnits || 0;
          estimatedCost = computeUnits * 0.00025; // $0.25 per 1000 units
        } catch (error) {
          console.log(`[ReviewScraper] Could not get run info:`, error);
        }
      }

      const scraperResult: ScraperResult = {
        asin: asin,
        totalReviews: totalReviews || reviews.length,
        averageRating: averageRating,
        reviews: reviews,
        scrapedAt: new Date().toISOString(),
        computeUnits,
        estimatedCost,
      };

      // Cache the results
      await this.cacheReviews(scraperResult);

      console.log(`[ReviewScraper] Successfully scraped ${scraperResult.reviews.length} reviews for ${asin}`);
      return scraperResult;

    } catch (error) {
      console.error(`[ReviewScraper] Error scraping ${asin}:`, error);
      return null;
    }
  }

  /**
   * Scrape reviews for multiple ASINs
   */
  async scrapeMultipleReviews(
    asins: string[], 
    options: Parameters<typeof this.scrapeReviews>[1] = {}
  ): Promise<Map<string, ScraperResult>> {
    const results = new Map<string, ScraperResult>();
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (asin) => {
          const result = await this.scrapeReviews(asin, options);
          if (result) {
            results.set(asin, result);
          }
        })
      );
      
      // Add delay between batches
      if (i + batchSize < asins.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  /**
   * Store reviews in Supabase
   */
  async storeReviewsInDatabase(productId: string, reviews: ReviewData[]): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      const reviewsToInsert = reviews.map(review => ({
        product_id: productId,
        reviewer_id: review.reviewerId,
        reviewer_name: review.reviewerName,
        reviewer_url: review.reviewerUrl,
        rating: review.rating,
        title: review.reviewTitle,
        content: review.reviewText,
        review_date: new Date(review.reviewDate).toISOString(),
        verified_purchase: review.verifiedPurchase,
        helpful_votes: review.helpfulVotes,
        total_votes: review.totalVotes,
        images: review.reviewImages,
        variant: review.variant,
      }));

      const { error } = await supabase
        .from('customer_reviews')
        .insert(reviewsToInsert);

      if (error) {
        console.error('[ReviewScraper] Error storing reviews:', error);
        throw error;
      }

      console.log(`[ReviewScraper] Stored ${reviews.length} reviews for product ${productId}`);
    } catch (error) {
      console.error('[ReviewScraper] Database error:', error);
      throw error;
    }
  }

  /**
   * Get cached reviews from database
   */
  private async getCachedReviews(asin: string) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('amazon_review_cache')
      .select('*')
      .eq('asin', asin)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('[ReviewScraper] Cache lookup error:', error);
    }

    return data;
  }

  /**
   * Cache reviews in database
   */
  private async cacheReviews(result: ScraperResult) {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('amazon_review_cache')
      .upsert({
        asin: result.asin,
        total_reviews: result.totalReviews,
        average_rating: result.averageRating,
        reviews: result.reviews,
        scraped_at: result.scrapedAt,
        compute_units: result.computeUnits,
        estimated_cost: result.estimatedCost,
      });

    if (error) {
      console.error('[ReviewScraper] Cache storage error:', error);
    }
  }

  /**
   * Check if cached data is still valid (24 hours)
   */
  private isCacheValid(scrapedAt: string): boolean {
    const cacheTime = new Date(scrapedAt).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (now - cacheTime) < twentyFourHours;
  }

  /**
   * Format cached result
   */
  private formatCachedResult(cached: any): ScraperResult {
    return {
      asin: cached.asin,
      totalReviews: cached.total_reviews,
      averageRating: cached.average_rating,
      reviews: cached.reviews,
      scrapedAt: cached.scraped_at,
      computeUnits: cached.compute_units,
      estimatedCost: cached.estimated_cost,
    };
  }

  /**
   * Calculate review insights
   */
  static calculateReviewInsights(reviews: ReviewData[]) {
    const insights = {
      totalReviews: reviews.length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verifiedPurchaseRate: 0,
      averageHelpfulRate: 0,
      commonWords: {} as Record<string, number>,
      sentimentScore: 0,
      recentTrend: 'stable' as 'improving' | 'declining' | 'stable',
    };

    if (reviews.length === 0) return insights;

    // Calculate metrics
    let totalRating = 0;
    let verifiedCount = 0;
    let totalHelpfulRate = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      insights.ratingDistribution[review.rating as 1|2|3|4|5]++;
      
      if (review.verifiedPurchase) verifiedCount++;
      
      if (review.totalVotes > 0) {
        totalHelpfulRate += review.helpfulVotes / review.totalVotes;
      }

      // Extract common words (simple implementation)
      const words = review.reviewText.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) { // Only count words longer than 4 chars
          insights.commonWords[word] = (insights.commonWords[word] || 0) + 1;
        }
      });
    });

    insights.averageRating = totalRating / reviews.length;
    insights.verifiedPurchaseRate = verifiedCount / reviews.length;
    insights.averageHelpfulRate = totalHelpfulRate / reviews.filter(r => r.totalVotes > 0).length || 0;

    // Simple sentiment based on rating distribution
    const positiveReviews = insights.ratingDistribution[4] + insights.ratingDistribution[5];
    const negativeReviews = insights.ratingDistribution[1] + insights.ratingDistribution[2];
    insights.sentimentScore = (positiveReviews - negativeReviews) / reviews.length;

    // Analyze recent trend (last 20% of reviews)
    const recentCount = Math.ceil(reviews.length * 0.2);
    const recentReviews = reviews.slice(0, recentCount);
    const recentAverage = recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentCount;
    
    if (recentAverage > insights.averageRating + 0.2) {
      insights.recentTrend = 'improving';
    } else if (recentAverage < insights.averageRating - 0.2) {
      insights.recentTrend = 'declining';
    }

    return insights;
  }
}

// Export a factory function to create the service
export function createReviewScraper(apifyToken?: string, useServiceClient: boolean = false) {
  const token = apifyToken || process.env.APIFY_API_KEY || process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error('APIFY_API_KEY is required for review scraping');
  }
  return new ReviewScraperService(token, useServiceClient);
}