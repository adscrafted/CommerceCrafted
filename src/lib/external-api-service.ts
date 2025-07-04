// External API Service for CommerceCrafted
// Integration with Google Trends, Reddit, TikTok, Twitter, and other external data sources

export interface TrendData {
  keyword: string
  timeframe: string
  data: {
    date: string
    value: number
    formattedDate: string
  }[]
  relatedQueries?: {
    rising: { query: string; value: number }[]
    top: { query: string; value: number }[]
  }
  geoData?: {
    region: string
    value: number
  }[]
}

export interface SocialMediaMention {
  id: string
  platform: 'reddit' | 'twitter' | 'tiktok' | 'instagram' | 'youtube'
  content: string
  author: string
  authorFollowers?: number
  engagement: {
    likes: number
    shares: number
    comments: number
    views?: number
  }
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number // -1 to 1
  url: string
  createdAt: Date
  relevanceScore: number // 0 to 100
}

export interface SocialMediaAnalysis {
  keyword: string
  platform: string
  totalMentions: number
  sentimentBreakdown: {
    positive: number
    negative: number
    neutral: number
  }
  averageSentiment: number
  topMentions: SocialMediaMention[]
  trendingHashtags: string[]
  influencerMentions: SocialMediaMention[]
  engagementMetrics: {
    averageLikes: number
    averageShares: number
    averageComments: number
    totalReach: number
  }
  timeframe: string
}

export interface GoogleTrendsData {
  keyword: string
  timeframe: string
  region: string
  interest: {
    timeline: { date: string; value: number }[]
    averageValue: number
    trend: 'rising' | 'declining' | 'stable'
    changePercent: number
  }
  relatedTopics: {
    topic: string
    type: 'rising' | 'top'
    value: number
  }[]
  relatedQueries: {
    query: string
    type: 'rising' | 'top'
    value: number
  }[]
  regionalInterest: {
    region: string
    value: number
  }[]
  seasonality: {
    month: string
    multiplier: number
  }[]
}

export interface MarketIntelligence {
  keyword: string
  category: string
  overallSentiment: number
  trendMomentum: number
  socialBuzz: number
  seasonalityScore: number
  competitorMentions: {
    brand: string
    mentions: number
    sentiment: number
  }[]
  emergingTrends: string[]
  riskFactors: string[]
  opportunities: string[]
  lastUpdated: Date
}

export class ExternalAPIService {
  
  // Google Trends Integration
  static async getGoogleTrends(
    keyword: string, 
    timeframe: string = 'today 12-m',
    region: string = 'US'
  ): Promise<GoogleTrendsData> {
    try {
      // In production, this would use the actual Google Trends API
      // For now, we'll return comprehensive mock data
      
      const mockData: GoogleTrendsData = {
        keyword,
        timeframe,
        region,
        interest: {
          timeline: this.generateTrendTimeline(timeframe),
          averageValue: 65,
          trend: 'rising',
          changePercent: 23.5
        },
        relatedTopics: [
          { topic: 'Wireless headphones', type: 'rising', value: 100 },
          { topic: 'Bluetooth audio', type: 'rising', value: 85 },
          { topic: 'Noise cancellation', type: 'top', value: 75 },
          { topic: 'Apple AirPods', type: 'top', value: 65 },
          { topic: 'Sony headphones', type: 'top', value: 55 }
        ],
        relatedQueries: [
          { query: 'best wireless headphones 2024', type: 'rising', value: 100 },
          { query: 'wireless headphones under $100', type: 'rising', value: 90 },
          { query: 'wireless headphones review', type: 'top', value: 80 },
          { query: 'bluetooth headphones', type: 'top', value: 70 },
          { query: 'noise cancelling headphones', type: 'top', value: 60 }
        ],
        regionalInterest: [
          { region: 'California', value: 100 },
          { region: 'New York', value: 85 },
          { region: 'Texas', value: 78 },
          { region: 'Florida', value: 72 },
          { region: 'Washington', value: 68 }
        ],
        seasonality: [
          { month: 'Jan', multiplier: 0.85 },
          { month: 'Feb', multiplier: 0.90 },
          { month: 'Mar', multiplier: 1.05 },
          { month: 'Apr', multiplier: 1.10 },
          { month: 'May', multiplier: 1.15 },
          { month: 'Jun', multiplier: 1.20 },
          { month: 'Jul', multiplier: 1.25 },
          { month: 'Aug', multiplier: 1.18 },
          { month: 'Sep', multiplier: 1.12 },
          { month: 'Oct', multiplier: 1.30 },
          { month: 'Nov', multiplier: 1.45 },
          { month: 'Dec', multiplier: 1.35 }
        ]
      }

      return mockData
    } catch (error) {
      throw new Error(`Google Trends API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Reddit Analysis
  static async getRedditAnalysis(keyword: string, timeframe: string = '30d'): Promise<SocialMediaAnalysis> {
    try {
      // In production, this would use Reddit API or PRAW
      const mockMentions: SocialMediaMention[] = [
        {
          id: 'reddit_1',
          platform: 'reddit',
          content: 'Just got these wireless headphones and they are amazing! Best purchase I\'ve made this year.',
          author: 'u/audiophile123',
          engagement: { likes: 234, shares: 45, comments: 67 },
          sentiment: 'positive',
          sentimentScore: 0.8,
          url: 'https://reddit.com/r/headphones/example1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          relevanceScore: 95
        },
        {
          id: 'reddit_2',
          platform: 'reddit',
          content: 'Looking for recommendations on wireless headphones under $100. Any suggestions?',
          author: 'u/budgetbuyer',
          engagement: { likes: 89, shares: 12, comments: 156 },
          sentiment: 'neutral',
          sentimentScore: 0.1,
          url: 'https://reddit.com/r/BuyItForLife/example2',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          relevanceScore: 85
        },
        {
          id: 'reddit_3',
          platform: 'reddit',
          content: 'These headphones broke after 3 months. Quality is terrible for the price.',
          author: 'u/disappointed_buyer',
          engagement: { likes: 45, shares: 8, comments: 23 },
          sentiment: 'negative',
          sentimentScore: -0.7,
          url: 'https://reddit.com/r/mildlyinfuriating/example3',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          relevanceScore: 75
        }
      ]

      return {
        keyword,
        platform: 'reddit',
        totalMentions: 1247,
        sentimentBreakdown: {
          positive: 65,
          negative: 15,
          neutral: 20
        },
        averageSentiment: 0.35,
        topMentions: mockMentions,
        trendingHashtags: [],
        influencerMentions: [],
        engagementMetrics: {
          averageLikes: 156,
          averageShares: 22,
          averageComments: 82,
          totalReach: 245000
        },
        timeframe
      }
    } catch (error) {
      throw new Error(`Reddit API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // TikTok Analysis
  static async getTikTokAnalysis(keyword: string, timeframe: string = '7d'): Promise<SocialMediaAnalysis> {
    try {
      // In production, this would use TikTok Research API
      const mockMentions: SocialMediaMention[] = [
        {
          id: 'tiktok_1',
          platform: 'tiktok',
          content: 'Testing out these wireless headphones! 🎧 Sound quality is insane #headphones #tech',
          author: '@techreviewer_sam',
          authorFollowers: 125000,
          engagement: { likes: 15600, shares: 2340, comments: 567, views: 89000 },
          sentiment: 'positive',
          sentimentScore: 0.9,
          url: 'https://tiktok.com/@techreviewer_sam/video/example1',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          relevanceScore: 98
        },
        {
          id: 'tiktok_2',
          platform: 'tiktok',
          content: 'Unboxing my new wireless headphones! Let\'s see if they\'re worth the hype ✨',
          author: '@unboxing_queen',
          authorFollowers: 67000,
          engagement: { likes: 8900, shares: 1234, comments: 345, views: 45000 },
          sentiment: 'positive',
          sentimentScore: 0.6,
          url: 'https://tiktok.com/@unboxing_queen/video/example2',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          relevanceScore: 85
        }
      ]

      return {
        keyword,
        platform: 'tiktok',
        totalMentions: 3456,
        sentimentBreakdown: {
          positive: 78,
          negative: 8,
          neutral: 14
        },
        averageSentiment: 0.65,
        topMentions: mockMentions,
        trendingHashtags: ['#headphones', '#tech', '#unboxing', '#review', '#wireless'],
        influencerMentions: mockMentions,
        engagementMetrics: {
          averageLikes: 5600,
          averageShares: 890,
          averageComments: 234,
          totalReach: 2340000
        },
        timeframe
      }
    } catch (error) {
      throw new Error(`TikTok API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Twitter/X Analysis
  static async getTwitterAnalysis(keyword: string, timeframe: string = '7d'): Promise<SocialMediaAnalysis> {
    try {
      // In production, this would use Twitter API v2
      const mockMentions: SocialMediaMention[] = [
        {
          id: 'twitter_1',
          platform: 'twitter',
          content: 'Just upgraded to wireless headphones and I can never go back to wired! Game changer 🎧',
          author: '@musiclover_jane',
          authorFollowers: 15600,
          engagement: { likes: 234, shares: 89, comments: 45 },
          sentiment: 'positive',
          sentimentScore: 0.8,
          url: 'https://twitter.com/musiclover_jane/status/example1',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          relevanceScore: 88
        },
        {
          id: 'twitter_2',
          platform: 'twitter',
          content: 'Anyone else having connectivity issues with their wireless headphones? So frustrating!',
          author: '@frustrated_user',
          authorFollowers: 890,
          engagement: { likes: 67, shares: 23, comments: 78 },
          sentiment: 'negative',
          sentimentScore: -0.6,
          url: 'https://twitter.com/frustrated_user/status/example2',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          relevanceScore: 72
        }
      ]

      return {
        keyword,
        platform: 'twitter',
        totalMentions: 8934,
        sentimentBreakdown: {
          positive: 58,
          negative: 22,
          neutral: 20
        },
        averageSentiment: 0.25,
        topMentions: mockMentions,
        trendingHashtags: ['#WirelessHeadphones', '#TechReview', '#Audio', '#Bluetooth'],
        influencerMentions: mockMentions.filter(m => m.authorFollowers && m.authorFollowers > 10000),
        engagementMetrics: {
          averageLikes: 156,
          averageShares: 34,
          averageComments: 67,
          totalReach: 567000
        },
        timeframe
      }
    } catch (error) {
      throw new Error(`Twitter API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // YouTube Analysis
  static async getYouTubeAnalysis(keyword: string, timeframe: string = '30d'): Promise<SocialMediaAnalysis> {
    try {
      // In production, this would use YouTube Data API
      const mockMentions: SocialMediaMention[] = [
        {
          id: 'youtube_1',
          platform: 'youtube',
          content: 'Complete Review: Best Wireless Headphones Under $100 (2024)',
          author: 'TechReview Pro',
          authorFollowers: 245000,
          engagement: { likes: 15600, shares: 890, comments: 1234, views: 345000 },
          sentiment: 'positive',
          sentimentScore: 0.7,
          url: 'https://youtube.com/watch?v=example1',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          relevanceScore: 95
        },
        {
          id: 'youtube_2',
          platform: 'youtube',
          content: 'Wireless Headphones Tier List - Which Ones Should You Buy?',
          author: 'Audio Expert',
          authorFollowers: 156000,
          engagement: { likes: 8900, shares: 456, comments: 678, views: 189000 },
          sentiment: 'positive',
          sentimentScore: 0.6,
          url: 'https://youtube.com/watch?v=example2',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          relevanceScore: 90
        }
      ]

      return {
        keyword,
        platform: 'youtube',
        totalMentions: 567,
        sentimentBreakdown: {
          positive: 72,
          negative: 12,
          neutral: 16
        },
        averageSentiment: 0.58,
        topMentions: mockMentions,
        trendingHashtags: [],
        influencerMentions: mockMentions,
        engagementMetrics: {
          averageLikes: 12250,
          averageShares: 673,
          averageComments: 956,
          totalReach: 8900000
        },
        timeframe
      }
    } catch (error) {
      throw new Error(`YouTube API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Comprehensive Market Intelligence
  static async getMarketIntelligence(keyword: string, category: string): Promise<MarketIntelligence> {
    try {
      // Aggregate data from all sources
      const [googleTrends, redditData, tiktokData, twitterData, youtubeData] = await Promise.all([
        this.getGoogleTrends(keyword),
        this.getRedditAnalysis(keyword),
        this.getTikTokAnalysis(keyword),
        this.getTwitterAnalysis(keyword),
        this.getYouTubeAnalysis(keyword)
      ])

      // Calculate aggregated metrics
      const overallSentiment = this.calculateOverallSentiment([
        redditData, tiktokData, twitterData, youtubeData
      ])

      const trendMomentum = this.calculateTrendMomentum(googleTrends)
      const socialBuzz = this.calculateSocialBuzz([redditData, tiktokData, twitterData, youtubeData])
      const seasonalityScore = this.calculateSeasonalityScore(googleTrends.seasonality)

      return {
        keyword,
        category,
        overallSentiment,
        trendMomentum,
        socialBuzz,
        seasonalityScore,
        competitorMentions: [
          { brand: 'Apple AirPods', mentions: 2340, sentiment: 0.7 },
          { brand: 'Sony WH-1000XM4', mentions: 1890, sentiment: 0.8 },
          { brand: 'Bose QuietComfort', mentions: 1567, sentiment: 0.6 },
          { brand: 'Beats Studio', mentions: 1234, sentiment: 0.5 }
        ],
        emergingTrends: [
          'Bone conduction technology gaining traction',
          'Increased focus on sustainable materials',
          'AI-powered noise cancellation becoming standard',
          'Gaming-specific wireless headphones trending'
        ],
        riskFactors: [
          'Market saturation in budget segment',
          'Supply chain disruptions affecting components',
          'Increasing privacy concerns with smart features',
          'Battery life expectations continue to rise'
        ],
        opportunities: [
          'Untapped mid-tier market ($50-100 range)',
          'Enterprise/business use cases growing',
          'Fitness and health monitoring integration',
          'Customizable sound profiles demand increasing'
        ],
        lastUpdated: new Date()
      }
    } catch (error) {
      throw new Error(`Market intelligence error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Amazon Reviews Sentiment Analysis
  static async getAmazonReviewsSentiment(asin: string): Promise<{
    overallSentiment: number
    sentimentBreakdown: { positive: number; negative: number; neutral: number }
    keyPhrases: { phrase: string; sentiment: number; frequency: number }[]
    trendingComplaints: string[]
    trendingPraises: string[]
  }> {
    try {
      // In production, this would scrape Amazon reviews or use Amazon API
      return {
        overallSentiment: 0.65,
        sentimentBreakdown: {
          positive: 72,
          negative: 15,
          neutral: 13
        },
        keyPhrases: [
          { phrase: 'great sound quality', sentiment: 0.8, frequency: 156 },
          { phrase: 'battery life', sentiment: 0.6, frequency: 134 },
          { phrase: 'comfortable fit', sentiment: 0.7, frequency: 98 },
          { phrase: 'connection issues', sentiment: -0.6, frequency: 67 },
          { phrase: 'value for money', sentiment: 0.9, frequency: 89 }
        ],
        trendingComplaints: [
          'Bluetooth connectivity drops occasionally',
          'Case feels flimsy',
          'Touch controls too sensitive',
          'Microphone quality poor for calls'
        ],
        trendingPraises: [
          'Excellent noise cancellation',
          'Long battery life',
          'Comfortable for extended wear',
          'Great value for the price',
          'Quick charging feature'
        ]
      }
    } catch (error) {
      throw new Error(`Amazon reviews analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Helper Methods

  private static generateTrendTimeline(timeframe: string): { date: string; value: number }[] {
    const timeline = []
    const days = timeframe.includes('12-m') ? 365 : timeframe.includes('90d') ? 90 : 30
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const baseValue = 50 + Math.random() * 30
      const seasonalBoost = Math.sin((365 - i) / 365 * 2 * Math.PI) * 20
      const value = Math.max(0, Math.min(100, baseValue + seasonalBoost + (Math.random() - 0.5) * 20))
      
      timeline.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      })
    }
    
    return timeline
  }

  private static calculateOverallSentiment(analyses: SocialMediaAnalysis[]): number {
    const weightedSentiments = analyses.map(analysis => ({
      sentiment: analysis.averageSentiment,
      weight: analysis.totalMentions
    }))
    
    const totalWeight = weightedSentiments.reduce((sum, item) => sum + item.weight, 0)
    const weightedSum = weightedSentiments.reduce((sum, item) => sum + (item.sentiment * item.weight), 0)
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  private static calculateTrendMomentum(trendsData: GoogleTrendsData): number {
    const recentValues = trendsData.interest.timeline.slice(-7) // Last 7 data points
    const earlierValues = trendsData.interest.timeline.slice(-14, -7) // Previous 7 data points
    
    const recentAvg = recentValues.reduce((sum, item) => sum + item.value, 0) / recentValues.length
    const earlierAvg = earlierValues.reduce((sum, item) => sum + item.value, 0) / earlierValues.length
    
    const momentum = ((recentAvg - earlierAvg) / earlierAvg) * 100
    return Math.max(0, Math.min(100, 50 + momentum)) // Normalize to 0-100 scale
  }

  private static calculateSocialBuzz(analyses: SocialMediaAnalysis[]): number {
    const totalMentions = analyses.reduce((sum, analysis) => sum + analysis.totalMentions, 0)
    const totalEngagement = analyses.reduce((sum, analysis) => {
      const engagementScore = (
        analysis.engagementMetrics.averageLikes * 1 +
        analysis.engagementMetrics.averageShares * 3 +
        analysis.engagementMetrics.averageComments * 2
      ) / 6
      return sum + engagementScore
    }, 0)
    
    // Normalize based on typical values for different platforms
    const normalizedMentions = Math.min(100, (totalMentions / 100))
    const normalizedEngagement = Math.min(100, (totalEngagement / 50))
    
    return (normalizedMentions + normalizedEngagement) / 2
  }

  private static calculateSeasonalityScore(seasonality: { month: string; multiplier: number }[]): number {
    const maxMultiplier = Math.max(...seasonality.map(s => s.multiplier))
    const minMultiplier = Math.min(...seasonality.map(s => s.multiplier))
    const variance = maxMultiplier - minMultiplier
    
    // Higher variance means more seasonal, score 0-100
    return Math.min(100, variance * 50)
  }

  // Rate Limiting and Caching
  private static rateLimits = new Map<string, { count: number; resetTime: number }>()
  private static cache = new Map<string, { data: any; expiresAt: number }>()

  static isRateLimited(service: string): boolean {
    const limit = this.rateLimits.get(service)
    if (!limit) return false
    
    if (Date.now() > limit.resetTime) {
      this.rateLimits.delete(service)
      return false
    }
    
    return limit.count >= this.getServiceRateLimit(service)
  }

  static incrementRateLimit(service: string): void {
    const existing = this.rateLimits.get(service)
    const resetTime = existing?.resetTime || Date.now() + 60 * 60 * 1000 // 1 hour
    
    this.rateLimits.set(service, {
      count: (existing?.count || 0) + 1,
      resetTime
    })
  }

  private static getServiceRateLimit(service: string): number {
    const limits = {
      'google_trends': 100,
      'reddit': 60,
      'twitter': 300,
      'tiktok': 100,
      'youtube': 100
    }
    return limits[service as keyof typeof limits] || 100
  }

  static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T
    }
    this.cache.delete(key)
    return null
  }

  static setCachedData(key: string, data: any, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000
    })
  }
}