// Real API Service for CommerceCrafted
// Production API integrations for Amazon data, AI analysis, and market intelligence

import { 
  Product, 
  ProductAnalysis, 
  DailyFeature,
  DeepAnalysis,
  KeywordAnalysis,
  PPCStrategy,
  InventoryAnalysis,
  DemandAnalysis,
  CompetitorAnalysis,
  FinancialModel
} from '@/types/api'

export interface APIResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface SearchParams {
  query?: string
  category?: string
  minScore?: number
  maxPrice?: number
  sortBy?: 'opportunity' | 'demand' | 'recent' | 'price'
  limit?: number
  offset?: number
}

export interface SearchResult {
  products: Product[]
  total: number
  hasMore: boolean
}

export interface AnalyticsData {
  totalProducts: number
  averageOpportunityScore: number
  topCategories: Array<{
    category: string
    count: number
    avgScore: number
  }>
  monthlyTrends: Array<{
    month: string
    products: number
    avgScore: number
  }>
}

export class APIService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
  private static readonly AMAZON_API_KEY = process.env.AMAZON_SP_API_KEY
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY
  private static readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes

  // Cache for API responses
  private static cache = new Map<string, { data: any; expiresAt: number }>()

  // Rate limiting
  private static rateLimits = new Map<string, { count: number; resetTime: number }>()

  // Generic API request handler
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    useCache: boolean = true
  ): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`
    const cacheKey = `${url}_${JSON.stringify(options)}`
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() < cached.expiresAt) {
        return cached.data as T
      }
      this.cache.delete(cacheKey)
    }

    // Check rate limits
    if (this.isRateLimited(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Cache successful responses
      if (useCache && response.status === 200) {
        this.cache.set(cacheKey, {
          data,
          expiresAt: Date.now() + this.CACHE_TTL
        })
      }

      this.incrementRateLimit(endpoint)
      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Product Data API Methods

  /**
   * Get daily featured product
   */
  static async getDailyFeature(): Promise<DailyFeature> {
    try {
      return await this.request<DailyFeature>('/products/daily-feature')
    } catch (error) {
      throw new Error(`Failed to fetch daily feature: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get trending products (highest opportunity scores)
   */
  static async getTrendingProducts(limit: number = 6): Promise<Product[]> {
    try {
      const params = new URLSearchParams({ 
        limit: limit.toString(),
        sortBy: 'opportunity' 
      })
      return await this.request<Product[]>(`/products/trending?${params}`)
    } catch (error) {
      throw new Error(`Failed to fetch trending products: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search products with filters
   */
  static async searchProducts(params: SearchParams): Promise<SearchResult> {
    try {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
      
      return await this.request<SearchResult>(`/products/search?${searchParams}`)
    } catch (error) {
      throw new Error(`Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.request<Product>(`/products/${id}`)
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw new Error(`Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all product categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      return await this.request<string[]>('/products/categories')
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get analytics data
   */
  static async getAnalytics(): Promise<AnalyticsData> {
    try {
      return await this.request<AnalyticsData>('/analytics/overview')
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // AI Analysis API Methods

  /**
   * Generate comprehensive deep analysis for a product
   */
  static async getDeepAnalysis(productId: string): Promise<DeepAnalysis> {
    try {
      return await this.request<DeepAnalysis>(
        `/analysis/deep/${productId}`,
        { method: 'POST' },
        false // Don't cache AI analysis
      )
    } catch (error) {
      throw new Error(`Failed to generate deep analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get keyword analysis for a product
   */
  static async getKeywordAnalysis(productId: string): Promise<KeywordAnalysis> {
    try {
      return await this.request<KeywordAnalysis>(`/analysis/keywords/${productId}`)
    } catch (error) {
      throw new Error(`Failed to fetch keyword analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get PPC strategy for a product
   */
  static async getPPCStrategy(productId: string): Promise<PPCStrategy> {
    try {
      return await this.request<PPCStrategy>(`/analysis/ppc/${productId}`)
    } catch (error) {
      throw new Error(`Failed to fetch PPC strategy: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get inventory analysis for a product
   */
  static async getInventoryAnalysis(productId: string): Promise<InventoryAnalysis> {
    try {
      return await this.request<InventoryAnalysis>(`/analysis/inventory/${productId}`)
    } catch (error) {
      throw new Error(`Failed to fetch inventory analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get demand analysis for a product
   */
  static async getDemandAnalysis(productId: string): Promise<DemandAnalysis> {
    try {
      return await this.request<DemandAnalysis>(`/analysis/demand/${productId}`)
    } catch (error) {
      throw new Error(`Failed to fetch demand analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get competitor analysis for a product
   */
  static async getCompetitorAnalysis(productId: string): Promise<CompetitorAnalysis> {
    try {
      return await this.request<CompetitorAnalysis>(`/analysis/competitors/${productId}`)
    } catch (error) {
      throw new Error(`Failed to fetch competitor analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get financial model for a product
   */
  static async getFinancialModel(productId: string): Promise<FinancialModel> {
    try {
      return await this.request<FinancialModel>(`/analysis/financial/${productId}`)
    } catch (error) {
      throw new Error(`Failed to fetch financial model: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Amazon Integration Methods

  /**
   * Import product data from Amazon using ASIN
   */
  static async importAmazonProduct(asin: string): Promise<Product> {
    try {
      return await this.request<Product>(
        '/amazon/import',
        {
          method: 'POST',
          body: JSON.stringify({ asin })
        },
        false // Don't cache import operations
      )
    } catch (error) {
      throw new Error(`Failed to import Amazon product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get real-time Amazon product data
   */
  static async getAmazonProductData(asin: string): Promise<{
    price: number
    availability: string
    rating: number
    reviewCount: number
    bsr: number
    lastUpdated: string
  }> {
    try {
      return await this.request(`/amazon/product/${asin}`, {}, false)
    } catch (error) {
      throw new Error(`Failed to fetch Amazon data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Market Intelligence Methods

  /**
   * Get market trends and insights
   */
  static async getMarketTrends(category?: string): Promise<any[]> {
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : ''
      return await this.request<any[]>(`/market/trends${params}`)
    } catch (error) {
      throw new Error(`Failed to fetch market trends: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get social media sentiment for a product
   */
  static async getSocialSentiment(productTitle: string): Promise<{
    overallSentiment: number
    platforms: Record<string, {
      sentiment: number
      mentions: number
    }>
    trendingTopics: string[]
  }> {
    try {
      return await this.request(
        '/market/social-sentiment',
        {
          method: 'POST',
          body: JSON.stringify({ productTitle })
        }
      )
    } catch (error) {
      throw new Error(`Failed to fetch social sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Utility Methods

  /**
   * Health check for API services
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down'
    services: Record<string, boolean>
    timestamp: string
  }> {
    try {
      return await this.request('/health', {}, false)
    } catch (error) {
      return {
        status: 'down',
        services: {},
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Clear cache (useful for development/testing)
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number
    entries: Array<{ key: string; expiresIn: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      expiresIn: Math.max(0, value.expiresAt - now)
    }))

    return {
      size: this.cache.size,
      entries
    }
  }

  // Rate Limiting Helper Methods

  private static isRateLimited(endpoint: string): boolean {
    const limit = this.rateLimits.get(endpoint)
    if (!limit) return false
    
    if (Date.now() > limit.resetTime) {
      this.rateLimits.delete(endpoint)
      return false
    }
    
    return limit.count >= this.getEndpointRateLimit(endpoint)
  }

  private static incrementRateLimit(endpoint: string): void {
    const existing = this.rateLimits.get(endpoint)
    const resetTime = existing?.resetTime || Date.now() + 60 * 60 * 1000 // 1 hour
    
    this.rateLimits.set(endpoint, {
      count: (existing?.count || 0) + 1,
      resetTime
    })
  }

  private static getEndpointRateLimit(endpoint: string): number {
    // Different rate limits for different endpoints
    if (endpoint.includes('/analysis/')) return 100 // AI analysis endpoints
    if (endpoint.includes('/amazon/')) return 300 // Amazon API endpoints
    if (endpoint.includes('/market/')) return 200 // Market intelligence endpoints
    return 500 // Default limit
  }
}

// Export a singleton instance
export const apiService = APIService