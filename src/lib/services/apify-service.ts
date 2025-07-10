/**
 * Apify Service
 * Comprehensive service for web scraping using Apify actors
 * 
 * @module apify-service
 * @description Handles Amazon reviews, social media monitoring, and competitor data scraping
 */

import { apiConfig } from '../api-config';
import { supabase } from '@/lib/supabase';
import { Redis } from 'ioredis';

// Types and Interfaces
export interface ApifyActorRun {
  id: string;
  actorId: string;
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED' | 'TIMED_OUT';
  startedAt: Date;
  finishedAt?: Date;
  defaultDatasetId?: string;
  defaultKeyValueStoreId?: string;
  buildId: string;
  exitCode?: number;
  stats: {
    inputBodyLen: number;
    restartCount: number;
    resurrectCount: number;
    memAvgBytes: number;
    memMaxBytes: number;
    memCurrentBytes: number;
    cpuAvgUsage: number;
    cpuMaxUsage: number;
    cpuCurrentUsage: number;
    netRxBytes: number;
    netTxBytes: number;
    durationMillis: number;
    runTimeSecs: number;
    metamorph: number;
    computeUnits: number;
  };
  options: {
    build?: string;
    timeoutSecs?: number;
    memoryMbytes?: number;
    diskMbytes?: number;
  };
  buildNumber?: string;
  usage?: {
    ACTOR_COMPUTE_UNITS?: number;
    DATASET_READS?: number;
    KEY_VALUE_STORE_READS?: number;
    KEY_VALUE_STORE_WRITES?: number;
    REQUEST_QUEUE_READS?: number;
    REQUEST_QUEUE_WRITES?: number;
    DATA_TRANSFER_INTERNAL_GBYTES?: number;
    DATA_TRANSFER_EXTERNAL_GBYTES?: number;
    PROXY_RESIDENTIAL_TRANSFER_GBYTES?: number;
    PROXY_SERPS?: number;
  };
  usageTotalUsd?: number;
  usageUsd?: {
    ACTOR_COMPUTE_UNITS?: number;
    DATASET_READS?: number;
    KEY_VALUE_STORE_READS?: number;
    KEY_VALUE_STORE_WRITES?: number;
    REQUEST_QUEUE_READS?: number;
    REQUEST_QUEUE_WRITES?: number;
    DATA_TRANSFER_INTERNAL_GBYTES?: number;
    DATA_TRANSFER_EXTERNAL_GBYTES?: number;
    PROXY_RESIDENTIAL_TRANSFER_GBYTES?: number;
    PROXY_SERPS?: number;
  };
}

export interface AmazonReview {
  reviewId: string;
  asin: string;
  reviewerName: string;
  reviewerProfileUrl?: string;
  rating: number;
  title: string;
  text: string;
  date: Date;
  verified: boolean;
  helpfulVotes: number;
  totalVotes: number;
  variant?: string;
  images?: string[];
  videoUrl?: string;
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
    aspects?: Array<{
      aspect: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
    }>;
  };
}

export interface SocialMediaMention {
  id: string;
  platform: 'twitter' | 'reddit' | 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  url: string;
  authorName: string;
  authorUrl?: string;
  authorFollowers?: number;
  content: string;
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
  };
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
  };
  hashtags?: string[];
  mentions?: string[];
  productMentions?: Array<{
    asin: string;
    confidence: number;
  }>;
}

export interface CompetitorData {
  asin: string;
  title: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  bsr: number;
  category: string;
  subcategory?: string;
  images: string[];
  features: string[];
  description: string;
  variations?: Array<{
    asin: string;
    title: string;
    price: number;
    inStock: boolean;
  }>;
  sellerInfo?: {
    name: string;
    rating: number;
    reviewCount: number;
  };
  fbaStatus: boolean;
  primeEligible: boolean;
  coupons?: Array<{
    discount: string;
    terms: string;
  }>;
  promotions?: string[];
  lastUpdated: Date;
}

export interface ApifyRunOptions {
  memory?: number;
  timeout?: number;
  waitForFinish?: boolean;
  webhooks?: Array<{
    eventTypes: string[];
    requestUrl: string;
  }>;
}

export interface ReviewAnalysisResult {
  asin: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  commonPhrases: Array<{
    phrase: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  aspectAnalysis: Array<{
    aspect: string;
    mentions: number;
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
  }>;
  verifiedPercentage: number;
  reviewTrends: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
}

// Error classes
export class ApifyError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public runId?: string
  ) {
    super(message);
    this.name = 'ApifyError';
  }
}

export class ApifyRateLimitError extends ApifyError {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class ApifyRunError extends ApifyError {
  constructor(runId: string, status: string, exitCode?: number) {
    super(
      `Actor run failed with status ${status}${exitCode ? ` (exit code: ${exitCode})` : ''}`,
      'RUN_FAILED',
      500,
      runId
    );
  }
}

/**
 * Apify Service Class
 * Handles all interactions with Apify actors for web scraping
 */
export class ApifyService {
  private apiKey: string;
  private apiUrl = 'https://api.apify.com/v2';
  private actors: typeof apiConfig.apify.actors;
  private defaultSettings: typeof apiConfig.apify.defaultSettings;
  private redis: Redis | null = null;
  private cacheEnabled: boolean;
  private cacheTTL = {
    reviews: 86400, // 24 hours
    social: 3600, // 1 hour
    competitor: 21600, // 6 hours
  };

  constructor() {
    const config = apiConfig.apify;
    this.apiKey = config.apiKey;
    this.actors = config.actors;
    this.defaultSettings = config.defaultSettings;
    this.cacheEnabled = apiConfig.features.enableCaching;

    // Initialize Redis if caching is enabled
    if (this.cacheEnabled && apiConfig.redis) {
      this.redis = new Redis({
        host: apiConfig.redis.host,
        port: apiConfig.redis.port,
        password: apiConfig.redis.password,
        db: apiConfig.redis.db,
        tls: apiConfig.redis.tls ? {} : undefined,
      });
    }
  }

  /**
   * Scrape Amazon reviews for a product
   */
  async scrapeAmazonReviews(
    asin: string,
    options?: {
      maxReviews?: number;
      startPage?: number;
      endPage?: number;
      reviewsFilter?: 'all' | 'verified' | 'critical';
      sortBy?: 'helpful' | 'recent';
    }
  ): Promise<AmazonReview[]> {
    // Check cache first
    const cacheKey = `apify:reviews:${asin}:${JSON.stringify(options || {})}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    const input = {
      productUrls: [`https://www.amazon.com/dp/${asin}`],
      maxReviews: options?.maxReviews || 100,
      startPage: options?.startPage || 1,
      endPage: options?.endPage,
      reviewsFilter: options?.reviewsFilter || 'all',
      sortBy: options?.sortBy || 'helpful',
    };

    try {
      const runId = await this.startActorRun(this.actors.amazonReviews, input);
      const results = await this.getRunResults<any[]>(runId);
      
      // Process and enhance reviews with sentiment analysis
      const reviews = await this.processReviews(results, asin);
      
      // Cache results
      await this.setCache(cacheKey, reviews, this.cacheTTL.reviews);
      
      // Track usage
      await this.trackUsage(runId);
      
      return reviews;
    } catch (error) {
      if (error instanceof ApifyError) throw error;
      throw new ApifyError(
        `Failed to scrape reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SCRAPE_ERROR'
      );
    }
  }

  /**
   * Monitor social media mentions for products
   */
  async monitorSocialMedia(
    keywords: string[],
    options?: {
      platforms?: Array<'twitter' | 'reddit' | 'facebook' | 'instagram' | 'tiktok' | 'youtube'>;
      maxResults?: number;
      dateFrom?: Date;
      dateTo?: Date;
      language?: string;
    }
  ): Promise<SocialMediaMention[]> {
    const cacheKey = `apify:social:${keywords.join(',')}:${JSON.stringify(options || {})}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    const input = {
      queries: keywords,
      platforms: options?.platforms || ['twitter', 'reddit'],
      maxItems: options?.maxResults || 100,
      dateFrom: options?.dateFrom?.toISOString(),
      dateTo: options?.dateTo?.toISOString(),
      language: options?.language || 'en',
    };

    try {
      const runId = await this.startActorRun(this.actors.socialMedia, input);
      const results = await this.getRunResults<any[]>(runId);
      
      // Process social media mentions
      const mentions = await this.processSocialMentions(results);
      
      // Cache results
      await this.setCache(cacheKey, mentions, this.cacheTTL.social);
      
      // Track usage
      await this.trackUsage(runId);
      
      return mentions;
    } catch (error) {
      if (error instanceof ApifyError) throw error;
      throw new ApifyError(
        `Failed to monitor social media: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SOCIAL_MONITOR_ERROR'
      );
    }
  }

  /**
   * Scrape competitor data from Amazon
   */
  async scrapeCompetitorData(
    asins: string[],
    options?: {
      includeVariations?: boolean;
      includeSellerInfo?: boolean;
      includePromotions?: boolean;
    }
  ): Promise<CompetitorData[]> {
    const cacheKey = `apify:competitors:${asins.join(',')}:${JSON.stringify(options || {})}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    const input = {
      productUrls: asins.map(asin => `https://www.amazon.com/dp/${asin}`),
      includeVariations: options?.includeVariations || false,
      includeSellerInfo: options?.includeSellerInfo || false,
      includePromotions: options?.includePromotions || false,
    };

    try {
      const runId = await this.startActorRun(this.actors.amazonSearch, input);
      const results = await this.getRunResults<any[]>(runId);
      
      // Process competitor data
      const competitors = await this.processCompetitorData(results);
      
      // Cache results
      await this.setCache(cacheKey, competitors, this.cacheTTL.competitor);
      
      // Track usage
      await this.trackUsage(runId);
      
      return competitors;
    } catch (error) {
      if (error instanceof ApifyError) throw error;
      throw new ApifyError(
        `Failed to scrape competitor data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPETITOR_SCRAPE_ERROR'
      );
    }
  }

  /**
   * Analyze reviews with sentiment analysis
   */
  async analyzeReviews(asin: string, reviews?: AmazonReview[]): Promise<ReviewAnalysisResult> {
    // If reviews not provided, scrape them first
    if (!reviews) {
      reviews = await this.scrapeAmazonReviews(asin, { maxReviews: 500 });
    }

    const analysis: ReviewAnalysisResult = {
      asin,
      totalReviews: reviews.length,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      sentimentAnalysis: { positive: 0, negative: 0, neutral: 0, mixed: 0 },
      commonPhrases: [],
      aspectAnalysis: [],
      verifiedPercentage: 0,
      reviewTrends: [],
    };

    // Calculate basic metrics
    let totalRating = 0;
    let verifiedCount = 0;
    const phraseMap = new Map<string, { count: number; sentiment: string }>();
    const aspectMap = new Map<string, { mentions: number; sentiment: any }>();

    for (const review of reviews) {
      totalRating += review.rating;
      analysis.ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
      
      if (review.verified) verifiedCount++;
      
      if (review.sentiment) {
        analysis.sentimentAnalysis[review.sentiment.label]++;
        
        // Track aspects
        if (review.sentiment.aspects) {
          for (const aspect of review.sentiment.aspects) {
            if (!aspectMap.has(aspect.aspect)) {
              aspectMap.set(aspect.aspect, {
                mentions: 0,
                sentiment: { positive: 0, negative: 0, neutral: 0 },
              });
            }
            const aspectData = aspectMap.get(aspect.aspect)!;
            aspectData.mentions++;
            aspectData.sentiment[aspect.sentiment]++;
          }
        }
      }
      
      // Extract common phrases (simplified)
      const phrases = this.extractPhrases(review.text);
      for (const phrase of phrases) {
        const existing = phraseMap.get(phrase) || { count: 0, sentiment: 'neutral' };
        existing.count++;
        if (review.sentiment) {
          existing.sentiment = review.sentiment.label;
        }
        phraseMap.set(phrase, existing);
      }
    }

    analysis.averageRating = totalRating / reviews.length;
    analysis.verifiedPercentage = (verifiedCount / reviews.length) * 100;

    // Convert maps to arrays
    analysis.commonPhrases = Array.from(phraseMap.entries())
      .map(([phrase, data]) => ({
        phrase,
        count: data.count,
        sentiment: data.sentiment as 'positive' | 'negative' | 'neutral',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    analysis.aspectAnalysis = Array.from(aspectMap.entries())
      .map(([aspect, data]) => ({
        aspect,
        mentions: data.mentions,
        sentiment: data.sentiment,
      }))
      .sort((a, b) => b.mentions - a.mentions);

    // Calculate review trends by month
    const trendMap = new Map<string, { count: number; totalRating: number }>();
    for (const review of reviews) {
      const month = review.date.toISOString().slice(0, 7);
      const existing = trendMap.get(month) || { count: 0, totalRating: 0 };
      existing.count++;
      existing.totalRating += review.rating;
      trendMap.set(month, existing);
    }

    analysis.reviewTrends = Array.from(trendMap.entries())
      .map(([month, data]) => ({
        month,
        count: data.count,
        averageRating: data.totalRating / data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return analysis;
  }

  /**
   * Start an Apify actor run
   */
  private async startActorRun(
    actorId: string,
    input: any,
    options?: ApifyRunOptions
  ): Promise<string> {
    const url = `${this.apiUrl}/acts/${actorId}/runs`;
    
    const body = {
      ...input,
      memory: options?.memory || this.defaultSettings.memory,
      timeout: options?.timeout || this.defaultSettings.timeout,
      webhooks: options?.webhooks,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          throw new ApifyRateLimitError(retryAfter);
        }
        throw new ApifyError(
          `Failed to start actor run: ${response.statusText}`,
          'START_RUN_ERROR',
          response.status
        );
      }

      const data = await response.json();
      const runId = data.data.id;

      // Wait for finish if requested
      if (options?.waitForFinish !== false) {
        await this.waitForRun(runId);
      }

      return runId;
    } catch (error) {
      if (error instanceof ApifyError) throw error;
      throw new ApifyError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Wait for an actor run to complete
   */
  private async waitForRun(runId: string, maxWaitTime: number = 300000): Promise<ApifyActorRun> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const run = await this.getRunInfo(runId);
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED_OUT'].includes(run.status)) {
        if (run.status !== 'SUCCEEDED') {
          throw new ApifyRunError(runId, run.status, run.exitCode);
        }
        return run;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new ApifyError(`Run timeout after ${maxWaitTime}ms`, 'RUN_TIMEOUT', 408, runId);
  }

  /**
   * Get information about an actor run
   */
  private async getRunInfo(runId: string): Promise<ApifyActorRun> {
    const url = `${this.apiUrl}/actor-runs/${runId}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new ApifyError(
          `Failed to get run info: ${response.statusText}`,
          'GET_RUN_ERROR',
          response.status,
          runId
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof ApifyError) throw error;
      throw new ApifyError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        undefined,
        runId
      );
    }
  }

  /**
   * Get results from a completed actor run
   */
  private async getRunResults<T>(runId: string): Promise<T> {
    const run = await this.getRunInfo(runId);
    
    if (run.status !== 'SUCCEEDED') {
      throw new ApifyRunError(runId, run.status, run.exitCode);
    }

    const datasetId = run.defaultDatasetId;
    if (!datasetId) {
      throw new ApifyError('No dataset found for run', 'NO_DATASET', 404, runId);
    }

    const url = `${this.apiUrl}/datasets/${datasetId}/items`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new ApifyError(
          `Failed to get results: ${response.statusText}`,
          'GET_RESULTS_ERROR',
          response.status,
          runId
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApifyError) throw error;
      throw new ApifyError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        undefined,
        runId
      );
    }
  }

  /**
   * Process raw review data
   */
  private async processReviews(rawReviews: any[], asin: string): Promise<AmazonReview[]> {
    return rawReviews.map(raw => ({
      reviewId: raw.id || raw.reviewId,
      asin,
      reviewerName: raw.reviewerName || 'Anonymous',
      reviewerProfileUrl: raw.reviewerProfileUrl,
      rating: parseInt(raw.rating) || 0,
      title: raw.title || '',
      text: raw.text || raw.reviewText || '',
      date: new Date(raw.date || raw.reviewDate),
      verified: raw.verified || raw.verifiedPurchase || false,
      helpfulVotes: parseInt(raw.helpfulVotes) || 0,
      totalVotes: parseInt(raw.totalVotes) || parseInt(raw.helpfulVotes) || 0,
      variant: raw.variant,
      images: raw.images || [],
      videoUrl: raw.videoUrl,
      sentiment: this.analyzeSentiment(raw.text || raw.reviewText || ''),
    }));
  }

  /**
   * Process social media mentions
   */
  private async processSocialMentions(rawMentions: any[]): Promise<SocialMediaMention[]> {
    return rawMentions.map(raw => ({
      id: raw.id || raw.url,
      platform: raw.platform || this.detectPlatform(raw.url),
      url: raw.url,
      authorName: raw.authorName || raw.author || 'Unknown',
      authorUrl: raw.authorUrl || raw.authorProfile,
      authorFollowers: parseInt(raw.authorFollowers) || 0,
      content: raw.text || raw.content || '',
      timestamp: new Date(raw.timestamp || raw.date || raw.createdAt),
      engagement: {
        likes: parseInt(raw.likes) || parseInt(raw.favorites) || 0,
        comments: parseInt(raw.comments) || parseInt(raw.replies) || 0,
        shares: parseInt(raw.shares) || parseInt(raw.retweets) || 0,
        views: parseInt(raw.views) || undefined,
      },
      sentiment: this.analyzeSentiment(raw.text || raw.content || ''),
      hashtags: raw.hashtags || this.extractHashtags(raw.text || raw.content || ''),
      mentions: raw.mentions || this.extractMentions(raw.text || raw.content || ''),
      productMentions: this.detectProductMentions(raw.text || raw.content || ''),
    }));
  }

  /**
   * Process competitor data
   */
  private async processCompetitorData(rawData: any[]): Promise<CompetitorData[]> {
    return rawData.map(raw => ({
      asin: raw.asin || this.extractAsinFromUrl(raw.url),
      title: raw.title || raw.name || '',
      brand: raw.brand || raw.manufacturer || '',
      price: parseFloat(raw.price) || 0,
      rating: parseFloat(raw.rating) || 0,
      reviewCount: parseInt(raw.reviewCount) || 0,
      bsr: parseInt(raw.bestSellersRank) || parseInt(raw.bsr) || 0,
      category: raw.category || '',
      subcategory: raw.subcategory,
      images: raw.images || [raw.image],
      features: raw.features || raw.bulletPoints || [],
      description: raw.description || '',
      variations: raw.variations,
      sellerInfo: raw.sellerInfo,
      fbaStatus: raw.fba || raw.fulfilledByAmazon || false,
      primeEligible: raw.prime || raw.isPrime || false,
      coupons: raw.coupons,
      promotions: raw.promotions || [],
      lastUpdated: new Date(),
    }));
  }

  /**
   * Simple sentiment analysis (in production, use AI service)
   */
  private analyzeSentiment(text: string): AmazonReview['sentiment'] {
    // Simplified sentiment analysis - in production, use OpenAI or similar
    const positiveWords = ['great', 'excellent', 'amazing', 'fantastic', 'love', 'perfect', 'wonderful'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing', 'poor'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    let label: 'positive' | 'negative' | 'neutral' | 'mixed';
    let score: number;
    
    if (positiveCount > negativeCount) {
      label = 'positive';
      score = Math.min(1, positiveCount / 5);
    } else if (negativeCount > positiveCount) {
      label = 'negative';
      score = Math.max(-1, -negativeCount / 5);
    } else if (positiveCount > 0 && negativeCount > 0) {
      label = 'mixed';
      score = 0;
    } else {
      label = 'neutral';
      score = 0;
    }
    
    return { score, label };
  }

  /**
   * Extract common phrases from text
   */
  private extractPhrases(text: string): string[] {
    // Simplified phrase extraction - in production, use NLP library
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    for (let i = 0; i < words.length - 2; i++) {
      if (words[i].length > 3 && words[i + 1].length > 3) {
        phrases.push(`${words[i]} ${words[i + 1]}`);
      }
    }
    
    return phrases;
  }

  /**
   * Detect platform from URL
   */
  private detectPlatform(url: string): SocialMediaMention['platform'] {
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com')) return 'youtube';
    return 'twitter'; // default
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1));
  }

  /**
   * Extract mentions from text
   */
  private extractMentions(text: string): string[] {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map(mention => mention.substring(1));
  }

  /**
   * Detect product mentions in text
   */
  private detectProductMentions(text: string): Array<{ asin: string; confidence: number }> {
    // Simplified ASIN detection - in production, use more sophisticated matching
    const asinPattern = /\b[B0][0-9A-Z]{8}\b/g;
    const matches = text.match(asinPattern) || [];
    
    return matches.map(asin => ({
      asin,
      confidence: 0.9, // High confidence for exact ASIN matches
    }));
  }

  /**
   * Extract ASIN from Amazon URL
   */
  private extractAsinFromUrl(url: string): string {
    const match = url.match(/\/dp\/([B0][0-9A-Z]{8})/);
    return match ? match[1] : '';
  }

  /**
   * Cache data in Redis
   */
  private async setCache(key: string, data: any, ttl: number): Promise<void> {
    if (!this.redis || !this.cacheEnabled) return;
    
    try {
      await this.redis.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get data from cache
   */
  private async getFromCache(key: string): Promise<any | null> {
    if (!this.redis || !this.cacheEnabled) return null;
    
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Track API usage and costs
   */
  private async trackUsage(runId: string): Promise<void> {
    try {
      const run = await this.getRunInfo(runId);
      const cost = run.usageTotalUsd || 0;
      
      // TODO: Convert to Supabase - track API usage in api_usage table
      await supabase
        .from('api_usage')
        .insert({
          service: 'apify',
          run_id: runId,
          actor_id: run.actorId,
          compute_units: run.stats.computeUnits || 0,
          cost: cost,
          status: run.status,
          duration_ms: run.stats.durationMillis || 0,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to track API usage:', error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(startDate?: Date, endDate?: Date): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    totalCost: number;
    totalComputeUnits: number;
    averageDuration: number;
    byActor: Array<{
      actorId: string;
      runs: number;
      cost: number;
      computeUnits: number;
    }>;
  }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    // In production, query from database
    const stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalCost: 0,
      totalComputeUnits: 0,
      averageDuration: 0,
      byActor: [],
    };

    return stats;
  }

  /**
   * Clear cache
   */
  async clearCache(pattern?: string): Promise<void> {
    if (!this.redis || !this.cacheEnabled) return;

    try {
      const keys = await this.redis.keys(pattern || 'apify:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Export singleton instance
export const apifyService = new ApifyService();

// Export helper functions
export async function scrapeReviews(asin: string, maxReviews?: number): Promise<AmazonReview[]> {
  return apifyService.scrapeAmazonReviews(asin, { maxReviews });
}

export async function analyzeProductReviews(asin: string): Promise<ReviewAnalysisResult> {
  return apifyService.analyzeReviews(asin);
}

export async function findSocialMentions(keywords: string[]): Promise<SocialMediaMention[]> {
  return apifyService.monitorSocialMedia(keywords);
}

export async function getCompetitorData(asins: string[]): Promise<CompetitorData[]> {
  return apifyService.scrapeCompetitorData(asins);
}