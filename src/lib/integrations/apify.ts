// Apify Integration for Amazon Reviews and Reddit Scraping
// Docs: https://docs.apify.com/api/v2

interface ApifyConfig {
  apiKey: string
  baseUrl: string
}

interface AmazonReviewsInput {
  asins: string[]
  country?: string
  maxReviews?: number
  sortBy?: 'recent' | 'helpful' | 'top'
  filterByStar?: number[]
  fetchProductDetails?: boolean
}

interface RedditSearchInput {
  searchQueries: string[]
  searchType?: 'posts' | 'comments' | 'both'
  subreddits?: string[]
  maxItems?: number
  sort?: 'relevance' | 'hot' | 'top' | 'new'
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
}

interface Review {
  reviewId: string
  asin: string
  title: string
  text: string
  rating: number
  date: string
  variantAttributes?: { [key: string]: string }
  verified: boolean
  helpful: number
  totalHelpful: number
  reviewerName: string
  reviewerProfileUrl?: string
  images?: string[]
}

interface RedditPost {
  id: string
  title: string
  text?: string
  subreddit: string
  author: string
  score: number
  numComments: number
  url: string
  createdAt: string
  permalink: string
  searchQuery: string
  type: 'post' | 'comment'
}

interface ReviewAnalysis {
  asin: string
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  verifiedPurchaseRate: number
  sentimentAnalysis: {
    positive: number
    negative: number
    neutral: number
    topPositiveKeywords: string[]
    topNegativeKeywords: string[]
    commonComplaints: string[]
    commonPraise: string[]
  }
  reviewsByMonth: { [key: string]: number }
  topVariants?: { [key: string]: { count: number; rating: number } }
}

interface RedditAnalysis {
  searchQueries: string[]
  totalPosts: number
  totalComments: number
  engagementScore: number
  sentimentDistribution: {
    positive: number
    negative: number
    neutral: number
  }
  topSubreddits: { name: string; count: number; avgScore: number }[]
  temporalTrends: { date: string; mentions: number; sentiment: number }[]
  topMentions: { text: string; count: number; context: string[] }[]
  competitorMentions?: { [brand: string]: number }
}

class ApifyIntegration {
  private config: ApifyConfig

  constructor() {
    this.config = {
      apiKey: process.env.APIFY_API_KEY || '',
      baseUrl: 'https://api.apify.com/v2'
    }

    if (!this.config.apiKey) {
      console.warn('Apify API key not configured')
    }
  }

  /**
   * Start an Apify actor run
   */
  private async startActorRun(actorId: string, input: any): Promise<string> {
    const url = `${this.config.baseUrl}/acts/${actorId}/runs?token=${this.config.apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      throw new Error(`Apify actor start failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.id
  }

  /**
   * Wait for actor run to complete
   */
  private async waitForRun(runId: string, maxWaitTime: number = 300000): Promise<any> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      const url = `${this.config.baseUrl}/actor-runs/${runId}?token=${this.config.apiKey}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to check run status: ${response.status}`)
      }

      const data = await response.json()
      const status = data.data.status

      if (status === 'SUCCEEDED') {
        return data.data
      } else if (status === 'FAILED' || status === 'ABORTED') {
        throw new Error(`Actor run ${status}: ${data.data.exitCode}`)
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    throw new Error('Actor run timeout')
  }

  /**
   * Get dataset items from completed run
   */
  private async getDatasetItems(datasetId: string): Promise<any[]> {
    const url = `${this.config.baseUrl}/datasets/${datasetId}/items?token=${this.config.apiKey}&format=json`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.status}`)
    }

    return await response.json()
  }

  /**
   * Scrape Amazon reviews for given ASINs
   */
  async scrapeAmazonReviews(input: AmazonReviewsInput): Promise<Review[]> {
    try {
      console.log('Starting Amazon reviews scraping for ASINs:', input.asins)

      const actorInput = {
        asins: input.asins,
        country: input.country || 'US',
        maxReviews: input.maxReviews || 100,
        sortBy: input.sortBy || 'recent',
        filterByStar: input.filterByStar,
        fetchProductDetails: input.fetchProductDetails ?? true,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL']
        }
      }

      // Start the Amazon Reviews Scraper actor
      const runId = await this.startActorRun('axesso_data~amazon-reviews-scraper', actorInput)
      console.log('Amazon reviews scraper started, run ID:', runId)

      // Wait for completion
      const run = await this.waitForRun(runId)
      console.log('Amazon reviews scraping completed')

      // Get results
      const reviews = await this.getDatasetItems(run.defaultDatasetId)
      console.log(`Scraped ${reviews.length} reviews`)

      return reviews
    } catch (error) {
      console.error('Error scraping Amazon reviews:', error)
      throw error
    }
  }

  /**
   * Scrape Reddit posts and comments
   */
  async scrapeReddit(input: RedditSearchInput): Promise<RedditPost[]> {
    try {
      console.log('Starting Reddit scraping for queries:', input.searchQueries)

      const actorInput = {
        searches: input.searchQueries.map(query => ({
          searchQuery: query,
          type: input.searchType || 'both',
          sort: input.sort || 'relevance',
          time: input.time || 'month'
        })),
        subreddits: input.subreddits,
        maxItems: input.maxItems || 100,
        extendOutputFunction: `($) => {
          return {
            searchQuery: $.searchQuery,
            type: $.type
          }
        }`,
        proxy: {
          useApifyProxy: true
        }
      }

      // Start the Reddit Scraper Lite actor
      const runId = await this.startActorRun('trudax~reddit-scraper-lite', actorInput)
      console.log('Reddit scraper started, run ID:', runId)

      // Wait for completion
      const run = await this.waitForRun(runId)
      console.log('Reddit scraping completed')

      // Get results
      const posts = await this.getDatasetItems(run.defaultDatasetId)
      console.log(`Scraped ${posts.length} Reddit posts/comments`)

      return posts
    } catch (error) {
      console.error('Error scraping Reddit:', error)
      throw error
    }
  }

  /**
   * Analyze scraped reviews for insights
   */
  analyzeReviews(reviews: Review[]): ReviewAnalysis {
    const asin = reviews[0]?.asin || ''
    const totalReviews = reviews.length
    
    // Calculate rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0
    let verifiedCount = 0

    reviews.forEach(review => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
      totalRating += review.rating
      if (review.verified) verifiedCount++
    })

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0
    const verifiedPurchaseRate = totalReviews > 0 ? verifiedCount / totalReviews : 0

    // Simple sentiment analysis based on ratings
    const sentimentAnalysis = {
      positive: (ratingDistribution[4] + ratingDistribution[5]) / totalReviews,
      negative: (ratingDistribution[1] + ratingDistribution[2]) / totalReviews,
      neutral: ratingDistribution[3] / totalReviews,
      topPositiveKeywords: this.extractKeywords(reviews.filter(r => r.rating >= 4)),
      topNegativeKeywords: this.extractKeywords(reviews.filter(r => r.rating <= 2)),
      commonComplaints: this.extractCommonThemes(reviews.filter(r => r.rating <= 2), 'negative'),
      commonPraise: this.extractCommonThemes(reviews.filter(r => r.rating >= 4), 'positive')
    }

    // Reviews by month
    const reviewsByMonth: { [key: string]: number } = {}
    reviews.forEach(review => {
      const date = new Date(review.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      reviewsByMonth[monthKey] = (reviewsByMonth[monthKey] || 0) + 1
    })

    return {
      asin,
      totalReviews,
      averageRating,
      ratingDistribution,
      verifiedPurchaseRate,
      sentimentAnalysis,
      reviewsByMonth,
      topVariants: this.analyzeVariants(reviews)
    }
  }

  /**
   * Analyze Reddit posts for market insights
   */
  analyzeRedditPosts(posts: RedditPost[], searchQueries: string[]): RedditAnalysis {
    const totalPosts = posts.filter(p => p.type === 'post').length
    const totalComments = posts.filter(p => p.type === 'comment').length
    
    // Calculate engagement score
    const engagementScore = posts.reduce((sum, post) => sum + post.score + post.numComments * 0.5, 0) / posts.length

    // Analyze subreddit distribution
    const subredditStats: { [key: string]: { count: number; totalScore: number } } = {}
    posts.forEach(post => {
      if (!subredditStats[post.subreddit]) {
        subredditStats[post.subreddit] = { count: 0, totalScore: 0 }
      }
      subredditStats[post.subreddit].count++
      subredditStats[post.subreddit].totalScore += post.score
    })

    const topSubreddits = Object.entries(subredditStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgScore: stats.totalScore / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Simple sentiment distribution (would need actual NLP in production)
    const sentimentDistribution = {
      positive: 0.4, // Placeholder
      negative: 0.2, // Placeholder
      neutral: 0.4   // Placeholder
    }

    return {
      searchQueries,
      totalPosts,
      totalComments,
      engagementScore,
      sentimentDistribution,
      topSubreddits,
      temporalTrends: this.analyzeTemporal(posts),
      topMentions: this.extractTopMentions(posts),
      competitorMentions: this.analyzeCompetitors(posts)
    }
  }

  // Helper methods for analysis
  private extractKeywords(reviews: Review[]): string[] {
    // Simple keyword extraction - in production, use NLP
    const wordFreq: { [key: string]: number } = {}
    reviews.forEach(review => {
      const words = (review.title + ' ' + review.text).toLowerCase().split(/\W+/)
      words.forEach(word => {
        if (word.length > 4) { // Skip short words
          wordFreq[word] = (wordFreq[word] || 0) + 1
        }
      })
    })

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  private extractCommonThemes(reviews: Review[], sentiment: 'positive' | 'negative'): string[] {
    // Placeholder - would use actual theme extraction in production
    const themes = sentiment === 'negative' 
      ? ['quality issues', 'sizing problems', 'delivery delays']
      : ['great quality', 'comfortable', 'good value']
    return themes.slice(0, 3)
  }

  private analyzeVariants(reviews: Review[]): { [key: string]: { count: number; rating: number } } | undefined {
    const variants: { [key: string]: { totalRating: number; count: number } } = {}
    
    reviews.forEach(review => {
      if (review.variantAttributes) {
        const variantKey = Object.entries(review.variantAttributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        
        if (!variants[variantKey]) {
          variants[variantKey] = { totalRating: 0, count: 0 }
        }
        variants[variantKey].totalRating += review.rating
        variants[variantKey].count++
      }
    })

    const result: { [key: string]: { count: number; rating: number } } = {}
    Object.entries(variants).forEach(([key, data]) => {
      result[key] = {
        count: data.count,
        rating: data.totalRating / data.count
      }
    })

    return Object.keys(result).length > 0 ? result : undefined
  }

  private analyzeTemporal(posts: RedditPost[]): { date: string; mentions: number; sentiment: number }[] {
    // Group posts by date
    const dailyData: { [date: string]: { mentions: number; totalSentiment: number } } = {}
    
    posts.forEach(post => {
      const date = new Date(post.createdAt).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { mentions: 0, totalSentiment: 0 }
      }
      dailyData[date].mentions++
      // Simple sentiment based on score
      dailyData[date].totalSentiment += post.score > 0 ? 1 : -1
    })

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        mentions: data.mentions,
        sentiment: data.totalSentiment / data.mentions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private extractTopMentions(posts: RedditPost[]): { text: string; count: number; context: string[] }[] {
    // Placeholder implementation
    return [
      { text: 'product mention', count: 10, context: ['great product', 'love this item'] }
    ]
  }

  private analyzeCompetitors(posts: RedditPost[]): { [brand: string]: number } {
    // Placeholder - would need brand list and NLP
    return {
      'Brand A': 5,
      'Brand B': 3
    }
  }
}

export const apifyIntegration = new ApifyIntegration()
export type { 
  AmazonReviewsInput, 
  RedditSearchInput, 
  Review, 
  RedditPost, 
  ReviewAnalysis, 
  RedditAnalysis 
}