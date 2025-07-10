/**
 * Keepa API Service
 * Comprehensive service for interacting with Keepa API for Amazon product data
 * 
 * @module keepa-service
 * @description Handles price history, sales rank, reviews, and product tracking
 */

import { apiConfig } from '../api-config';
import { supabase } from '@/lib/supabase';
import { Redis } from 'ioredis';

// Types and Interfaces
export interface KeepaProduct {
  asin: string;
  title: string;
  brand?: string;
  category?: string;
  productGroup?: string;
  imagesCSV?: string;
  model?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  
  // Price data (in cents)
  currentPrice?: number;
  amazonPrice?: number;
  newPrice?: number;
  usedPrice?: number;
  
  // Sales rank
  salesRank?: number;
  salesRankReference?: number;
  
  // Reviews
  reviewCount?: number;
  reviewRating?: number;
  
  // Timing data
  lastUpdate: number;
  lastPriceChange?: number;
  trackingSince?: number;
  
  // CSV data arrays
  priceHistory?: PricePoint[];
  salesRankHistory?: RankPoint[];
  reviewHistory?: ReviewPoint[];
  
  // Keepa statistics
  stats?: KeepaStats;
  
  // FBA fees
  fbaFees?: FBAFees;
}

export interface PricePoint {
  timestamp: number;
  price: number; // in cents
}

export interface RankPoint {
  timestamp: number;
  rank: number;
}

export interface ReviewPoint {
  timestamp: number;
  count: number;
  rating: number;
}

export interface KeepaStats {
  current: number;
  avg30: number;
  avg90: number;
  avg180: number;
  min30: number;
  min90: number;
  min180: number;
  max30: number;
  max90: number;
  max180: number;
  outOfStockPercentage30: number;
  outOfStockPercentage90: number;
}

export interface FBAFees {
  pickAndPackFee: number;
  storageFee: number;
  totalFee: number;
}

export interface KeepaRequest {
  asins: string[];
  stats?: number; // Time range for statistics (in days)
  history?: boolean; // Include price/rank history
  update?: number; // Update products older than X minutes
  offers?: number; // Include offers
  rating?: boolean; // Include rating history
}

export interface KeepaResponse {
  tokensLeft: number;
  tokensConsumed: number;
  tokenFloodProtection: number;
  products: KeepaProduct[];
  refillIn: number;
  timestamp: number;
}

export interface ApiUsage {
  date: string;
  tokensUsed: number;
  requestCount: number;
  cost: number;
}

// Error classes
export class KeepaError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public tokensConsumed?: number
  ) {
    super(message);
    this.name = 'KeepaError';
  }
}

export class KeepaRateLimitError extends KeepaError {
  constructor(public refillIn: number, tokensConsumed?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429, tokensConsumed);
  }
}

/**
 * Keepa API Service Class
 * Handles all interactions with Keepa API with caching, rate limiting, and cost tracking
 */
export class KeepaService {
  private apiKey: string;
  private endpoint: string;
  private domain: number;
  private redis: Redis | null = null;
  private tokensPerMinute: number;
  private costPerToken: number;
  private cacheEnabled: boolean;
  private cacheTTL: number = 3600; // 1 hour default

  constructor() {
    const config = apiConfig.keepa;
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.domain = config.domain;
    this.tokensPerMinute = config.tokensPerMinute;
    this.costPerToken = config.costPerToken;
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
   * Fetch single product data from Keepa
   */
  async getProduct(asin: string, options?: Partial<KeepaRequest>): Promise<KeepaProduct | null> {
    const products = await this.getProducts([asin], options);
    return products[0] || null;
  }

  /**
   * Fetch multiple products from Keepa (bulk operation)
   */
  async getProducts(asins: string[], options?: Partial<KeepaRequest>): Promise<KeepaProduct[]> {
    // Check cache first
    const cachedProducts = await this.getFromCache(asins);
    const uncachedAsins = asins.filter((asin, index) => !cachedProducts[index]);

    if (uncachedAsins.length === 0) {
      return cachedProducts.filter(Boolean) as KeepaProduct[];
    }

    // Prepare request
    const request: KeepaRequest = {
      asins: uncachedAsins,
      stats: options?.stats || 90,
      history: options?.history !== false,
      update: options?.update || apiConfig.keepa.updateInterval,
      rating: options?.rating !== false,
    };

    try {
      // Make API request
      const response = await this.makeRequest(request);
      
      // Process and cache products
      const processedProducts = await this.processProducts(response.products);
      await this.cacheProducts(processedProducts);
      
      // Track usage
      await this.trackUsage(response.tokensConsumed);
      
      // Merge with cached products
      const allProducts = [...cachedProducts.filter(Boolean), ...processedProducts] as KeepaProduct[];
      
      // Sort to match original order
      return asins.map(asin => allProducts.find(p => p.asin === asin)).filter(Boolean) as KeepaProduct[];
    } catch (error) {
      if (error instanceof KeepaError) {
        throw error;
      }
      throw new KeepaError('Failed to fetch products', 'API_ERROR', 500);
    }
  }

  /**
   * Get price history for a product
   */
  async getPriceHistory(asin: string, days: number = 90): Promise<PricePoint[]> {
    const product = await this.getProduct(asin, { stats: days, history: true });
    return product?.priceHistory || [];
  }

  /**
   * Get sales rank history for a product
   */
  async getSalesRankHistory(asin: string, days: number = 90): Promise<RankPoint[]> {
    const product = await this.getProduct(asin, { stats: days, history: true });
    return product?.salesRankHistory || [];
  }

  /**
   * Track price drops for products
   */
  async trackPriceDrops(asins: string[], threshold: number = 10): Promise<Array<{
    asin: string;
    currentPrice: number;
    previousPrice: number;
    dropPercentage: number;
    dropAmount: number;
  }>> {
    const products = await this.getProducts(asins, { stats: 30, history: true });
    const priceDrops = [];

    for (const product of products) {
      if (!product.priceHistory || product.priceHistory.length < 2) continue;

      const currentPrice = product.currentPrice || 0;
      const previousPrices = product.priceHistory.slice(-30); // Last 30 days
      const avgPreviousPrice = previousPrices.reduce((sum, p) => sum + p.price, 0) / previousPrices.length;

      if (currentPrice > 0 && avgPreviousPrice > 0) {
        const dropPercentage = ((avgPreviousPrice - currentPrice) / avgPreviousPrice) * 100;
        
        if (dropPercentage >= threshold) {
          priceDrops.push({
            asin: product.asin,
            currentPrice: currentPrice / 100, // Convert from cents
            previousPrice: avgPreviousPrice / 100,
            dropPercentage: Math.round(dropPercentage * 100) / 100,
            dropAmount: (avgPreviousPrice - currentPrice) / 100,
          });
        }
      }
    }

    return priceDrops;
  }

  /**
   * Calculate Buy Box statistics
   */
  async getBuyBoxStats(asin: string, days: number = 30): Promise<{
    amazonPercentage: number;
    thirdPartyPercentage: number;
    outOfStockPercentage: number;
  }> {
    const product = await this.getProduct(asin, { stats: days });
    
    if (!product.stats) {
      return {
        amazonPercentage: 0,
        thirdPartyPercentage: 0,
        outOfStockPercentage: 0,
      };
    }

    const outOfStock = product.stats.outOfStockPercentage30 || 0;
    const amazonPercentage = 100 - outOfStock; // Simplified - would need more data
    
    return {
      amazonPercentage,
      thirdPartyPercentage: 0, // Would need offers data
      outOfStockPercentage: outOfStock,
    };
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(startDate?: Date, endDate?: Date): Promise<{
    totalTokens: number;
    totalRequests: number;
    totalCost: number;
    dailyUsage: ApiUsage[];
  }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || new Date();

    // TODO: Convert to Supabase - complex aggregation query
    // For now, return mock data
    const usage: ApiUsage[] = [];

    const totalTokens = usage.reduce((sum, day) => sum + day.tokensUsed, 0);
    const totalRequests = usage.reduce((sum, day) => sum + day.requestCount, 0);
    const totalCost = usage.reduce((sum, day) => sum + day.cost, 0);

    return {
      totalTokens,
      totalRequests,
      totalCost,
      dailyUsage: usage,
    };
  }

  /**
   * Make HTTP request to Keepa API
   */
  private async makeRequest(request: KeepaRequest): Promise<KeepaResponse> {
    const url = new URL(`${this.endpoint}/product`);
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('domain', this.domain.toString());
    url.searchParams.append('asin', request.asins.join(','));
    
    if (request.stats) {
      url.searchParams.append('stats', request.stats.toString());
    }
    if (request.history) {
      url.searchParams.append('history', '1');
    }
    if (request.update) {
      url.searchParams.append('update', request.update.toString());
    }
    if (request.rating) {
      url.searchParams.append('rating', '1');
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new KeepaRateLimitError(data.refillIn || 60, data.tokensConsumed);
        }
        throw new KeepaError(
          `API request failed: ${response.statusText}`,
          'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return data as KeepaResponse;
    } catch (error) {
      if (error instanceof KeepaError) {
        throw error;
      }
      throw new KeepaError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Process raw Keepa products into structured format
   */
  private async processProducts(rawProducts: any[]): Promise<KeepaProduct[]> {
    return rawProducts.map(raw => this.parseProduct(raw));
  }

  /**
   * Parse single Keepa product from CSV format
   */
  private parseProduct(raw: any): KeepaProduct {
    const product: KeepaProduct = {
      asin: raw.asin,
      title: raw.title,
      brand: raw.brand,
      category: raw.categoryTree?.join(' > '),
      productGroup: raw.productGroup,
      imagesCSV: raw.imagesCSV,
      model: raw.model,
      color: raw.color,
      size: raw.size,
      manufacturer: raw.manufacturer,
      lastUpdate: raw.lastUpdate,
      lastPriceChange: raw.lastPriceChange,
      trackingSince: raw.trackingSince,
    };

    // Parse current prices (convert from cents)
    if (raw.csv) {
      product.amazonPrice = this.getLatestValue(raw.csv[0]);
      product.newPrice = this.getLatestValue(raw.csv[1]);
      product.usedPrice = this.getLatestValue(raw.csv[2]);
      product.salesRank = this.getLatestValue(raw.csv[3]);
      product.currentPrice = product.amazonPrice || product.newPrice || 0;
    }

    // Parse statistics
    if (raw.stats) {
      product.stats = this.parseStats(raw.stats);
    }

    // Parse history
    if (raw.csv) {
      product.priceHistory = this.parseCSVHistory(raw.csv[0] || raw.csv[1], true);
      product.salesRankHistory = this.parseCSVHistory(raw.csv[3], false);
    }

    // Parse reviews
    if (raw.csv && raw.csv[16]) {
      const reviewData = this.parseCSVHistory(raw.csv[16], false);
      product.reviewCount = reviewData[reviewData.length - 1]?.rank || 0;
    }
    if (raw.csv && raw.csv[17]) {
      const ratingData = this.parseCSVHistory(raw.csv[17], false);
      product.reviewRating = (ratingData[ratingData.length - 1]?.rank || 0) / 10;
    }

    // Parse FBA fees
    if (raw.fbaFees) {
      product.fbaFees = {
        pickAndPackFee: raw.fbaFees.pickAndPackFee / 100,
        storageFee: raw.fbaFees.storageFee / 100,
        totalFee: (raw.fbaFees.pickAndPackFee + raw.fbaFees.storageFee) / 100,
      };
    }

    return product;
  }

  /**
   * Parse Keepa CSV format into time series data
   */
  private parseCSVHistory(csv: number[], isPrice: boolean): Array<PricePoint | RankPoint> {
    if (!csv || csv.length < 2) return [];

    const history = [];
    const baseTime = csv[0];

    for (let i = 1; i < csv.length; i += 2) {
      if (csv[i] !== -1) { // -1 means no data
        const timestamp = baseTime + csv[i] * 60000; // Convert minutes to ms
        const value = csv[i + 1];
        
        if (isPrice) {
          history.push({ timestamp, price: value });
        } else {
          history.push({ timestamp, rank: value });
        }
      }
    }

    return history;
  }

  /**
   * Get latest value from CSV array
   */
  private getLatestValue(csv: number[]): number | undefined {
    if (!csv || csv.length < 2) return undefined;
    
    for (let i = csv.length - 1; i >= 1; i -= 2) {
      if (csv[i] !== -1) {
        return csv[i];
      }
    }
    
    return undefined;
  }

  /**
   * Parse statistics object
   */
  private parseStats(stats: any): KeepaStats {
    return {
      current: stats.current / 100,
      avg30: stats.avg30 / 100,
      avg90: stats.avg90 / 100,
      avg180: stats.avg180 / 100,
      min30: stats.min30 / 100,
      min90: stats.min90 / 100,
      min180: stats.min180 / 100,
      max30: stats.max30 / 100,
      max90: stats.max90 / 100,
      max180: stats.max180 / 100,
      outOfStockPercentage30: stats.outOfStockPercentage30 || 0,
      outOfStockPercentage90: stats.outOfStockPercentage90 || 0,
    };
  }

  /**
   * Cache products in Redis
   */
  private async cacheProducts(products: KeepaProduct[]): Promise<void> {
    if (!this.redis || !this.cacheEnabled) return;

    const pipeline = this.redis.pipeline();
    
    for (const product of products) {
      const key = `keepa:product:${product.asin}`;
      pipeline.set(key, JSON.stringify(product), 'EX', this.cacheTTL);
    }

    await pipeline.exec();
  }

  /**
   * Get products from cache
   */
  private async getFromCache(asins: string[]): Promise<Array<KeepaProduct | null>> {
    if (!this.redis || !this.cacheEnabled) {
      return asins.map(() => null);
    }

    const pipeline = this.redis.pipeline();
    
    for (const asin of asins) {
      pipeline.get(`keepa:product:${asin}`);
    }

    const results = await pipeline.exec();
    
    return results.map(([err, data]) => {
      if (err || !data) return null;
      try {
        return JSON.parse(data as string) as KeepaProduct;
      } catch {
        return null;
      }
    });
  }

  /**
   * Track API usage for cost monitoring
   */
  private async trackUsage(tokensConsumed: number): Promise<void> {
    // TODO: Convert to Supabase - track API usage in api_usage table
    try {
      await supabase
        .from('api_usage')
        .insert({
          service: 'keepa',
          tokens_used: tokensConsumed,
          cost: tokensConsumed * this.costPerToken,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to track API usage:', error);
    }
  }

  /**
   * Clear cache for specific products
   */
  async clearCache(asins?: string[]): Promise<void> {
    if (!this.redis || !this.cacheEnabled) return;

    if (asins && asins.length > 0) {
      const pipeline = this.redis.pipeline();
      for (const asin of asins) {
        pipeline.del(`keepa:product:${asin}`);
      }
      await pipeline.exec();
    } else {
      // Clear all Keepa cache
      const keys = await this.redis.keys('keepa:product:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
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
export const keepaService = new KeepaService();

// Export helper functions
export async function getProductData(asin: string): Promise<KeepaProduct | null> {
  return keepaService.getProduct(asin);
}

export async function getBulkProductData(asins: string[]): Promise<KeepaProduct[]> {
  return keepaService.getProducts(asins);
}

export async function trackPriceChanges(asins: string[]): Promise<any> {
  return keepaService.trackPriceDrops(asins);
}