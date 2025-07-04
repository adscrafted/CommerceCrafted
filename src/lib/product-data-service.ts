// Enhanced Product Data Service
// Combines real Amazon SP-API data with advanced analysis capabilities

import { amazonAPI, AmazonProduct, ProductPricing, BSRData, ReviewData } from './amazon-api'
import { DeepResearchService } from './deep-research-service'
import { 
  DeepAnalysis, 
  KeywordAnalysis, 
  PPCStrategy, 
  InventoryAnalysis, 
  DemandAnalysis, 
  CompetitorAnalysis, 
  FinancialModel,
  TrendAnalysis 
} from '@/types/deep-research'

// Enhanced product interface that combines Amazon data with our analysis
export interface EnhancedProduct extends AmazonProduct {
  analysis?: ProductAnalysis
  deepAnalysis?: DeepAnalysis
  keywordAnalysis?: KeywordAnalysis
  ppcStrategy?: PPCStrategy
  inventoryAnalysis?: InventoryAnalysis
  demandAnalysis?: DemandAnalysis
  competitorAnalysis?: CompetitorAnalysis
  financialModel?: FinancialModel
  pricing?: ProductPricing
  bsrData?: BSRData
  reviewData?: ReviewData
}

export interface ProductAnalysis {
  id: string
  opportunityScore: number
  demandScore: number
  competitionScore: number
  feasibilityScore: number
  financialAnalysis: {
    estimatedRevenue: number
    profitMargin: number
    breakEvenUnits: number
    roi: number
  }
  marketAnalysis: {
    marketSize: string
    growthRate: number
    seasonality: string
    trends: string[]
  }
  competitionAnalysis: {
    competitorCount: number
    averageRating: number
    priceRange: { min: number; max: number }
    marketShare: string
  }
  keywordAnalysis: {
    primaryKeywords: string[]
    searchVolume: number
    difficulty: number
    suggestions: string[]
  }
  reviewAnalysis: {
    sentiment: number
    commonComplaints: string[]
    opportunities: string[]
  }
  supplyChainAnalysis: {
    complexity: string
    leadTime: string
    minimumOrder: number
    suppliers: number
  }
  createdAt: string
  updatedAt: string
}

export interface DailyFeature {
  id: string
  product: EnhancedProduct
  reason: string
  date: string
}

export interface SearchResult {
  products: EnhancedProduct[]
  total: number
  hasNextPage: boolean
  nextPageToken?: string
}

export class ProductDataService {
  // Cache for analyzed products to avoid re-analyzing
  private analyzedProducts = new Map<string, EnhancedProduct>()

  // Get product by ASIN with full analysis
  async getProductByASIN(asin: string, includeFullAnalysis = false): Promise<EnhancedProduct | null> {
    try {
      // Check cache first
      if (this.analyzedProducts.has(asin)) {
        return this.analyzedProducts.get(asin)!
      }

      // Fetch base product data from Amazon
      const amazonProduct = await amazonAPI.getProductByASIN(asin)
      if (!amazonProduct) {
        return null
      }

      // Fetch additional data in parallel
      const [pricing, bsrData, reviewData] = await Promise.all([
        amazonAPI.getProductPricing(asin),
        amazonAPI.getBSRData(asin),
        amazonAPI.getReviewData(asin)
      ])

      // Create enhanced product
      const enhancedProduct: EnhancedProduct = {
        ...amazonProduct,
        pricing: pricing || undefined,
        bsrData: bsrData || undefined,
        reviewData: reviewData || undefined
      }

      // Generate basic analysis
      enhancedProduct.analysis = await this.generateBasicAnalysis(enhancedProduct)

      // Generate full deep analysis if requested
      if (includeFullAnalysis) {
        await this.generateFullAnalysis(enhancedProduct)
      }

      // Cache the result
      this.analyzedProducts.set(asin, enhancedProduct)
      
      return enhancedProduct

    } catch (error) {
      console.error(`Error fetching product ${asin}:`, error)
      return null
    }
  }

  // Search products with analysis
  async searchProducts(
    keyword: string,
    options: {
      category?: string
      priceMin?: number
      priceMax?: number
      minOpportunityScore?: number
      sortBy?: 'opportunity' | 'demand' | 'recent' | 'price' | 'bsr'
      limit?: number
      pageToken?: string
    } = {}
  ): Promise<SearchResult> {
    try {
      // Search using Amazon API
      const searchResult = await amazonAPI.searchProducts(keyword, {
        category: options.category,
        priceMin: options.priceMin,
        priceMax: options.priceMax,
        limit: options.limit,
        pageToken: options.pageToken
      })

      // Enhance each product with basic analysis
      const enhancedProducts = await Promise.all(
        searchResult.products.map(async (product) => {
          const enhanced: EnhancedProduct = { ...product }
          enhanced.analysis = await this.generateBasicAnalysis(enhanced)
          return enhanced
        })
      )

      // Apply additional filters
      let filteredProducts = enhancedProducts

      if (options.minOpportunityScore !== undefined) {
        filteredProducts = filteredProducts.filter(
          p => (p.analysis?.opportunityScore || 0) >= options.minOpportunityScore!
        )
      }

      // Apply sorting
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'opportunity':
            filteredProducts.sort((a, b) => 
              (b.analysis?.opportunityScore || 0) - (a.analysis?.opportunityScore || 0)
            )
            break
          case 'demand':
            filteredProducts.sort((a, b) => 
              (b.analysis?.demandScore || 0) - (a.analysis?.demandScore || 0)
            )
            break
          case 'bsr':
            filteredProducts.sort((a, b) => 
              (a.bsrData?.rank || 999999) - (b.bsrData?.rank || 999999)
            )
            break
          case 'price':
            filteredProducts.sort((a, b) => a.price - b.price)
            break
          case 'recent':
            filteredProducts.sort((a, b) => 
              b.lastUpdated.getTime() - a.lastUpdated.getTime()
            )
            break
        }
      }

      return {
        products: filteredProducts,
        total: filteredProducts.length,
        hasNextPage: searchResult.hasNextPage,
        nextPageToken: searchResult.nextPageToken
      }

    } catch (error) {
      console.error('Error searching products:', error)
      return { products: [], total: 0, hasNextPage: false }
    }
  }

  // Get trending products based on BSR and opportunity scores
  async getTrendingProducts(limit = 10): Promise<EnhancedProduct[]> {
    try {
      // Search for products in high-opportunity categories
      const categories = ['Electronics', 'Kitchen', 'Sports', 'Home', 'Beauty']
      const allProducts: EnhancedProduct[] = []

      for (const category of categories) {
        const results = await this.searchProducts('', {
          category,
          limit: 20,
          sortBy: 'opportunity'
        })
        allProducts.push(...results.products)
      }

      // Sort by combined opportunity score and BSR
      const sortedProducts = allProducts
        .filter(p => p.analysis && p.analysis.opportunityScore >= 7)
        .sort((a, b) => {
          const scoreA = (a.analysis?.opportunityScore || 0) + (a.bsrData ? 1 / Math.log(a.bsrData.rank) : 0)
          const scoreB = (b.analysis?.opportunityScore || 0) + (b.bsrData ? 1 / Math.log(b.bsrData.rank) : 0)
          return scoreB - scoreA
        })
        .slice(0, limit)

      return sortedProducts

    } catch (error) {
      console.error('Error fetching trending products:', error)
      return []
    }
  }

  // Get daily featured product
  async getDailyFeature(): Promise<DailyFeature | null> {
    try {
      const trending = await this.getTrendingProducts(1)
      if (trending.length === 0) {
        return null
      }

      const product = trending[0]
      
      // Generate full analysis for the featured product
      await this.generateFullAnalysis(product)

      return {
        id: `daily-${new Date().toISOString().split('T')[0]}`,
        product,
        reason: this.generateFeatureReason(product),
        date: new Date().toISOString().split('T')[0]
      }

    } catch (error) {
      console.error('Error generating daily feature:', error)
      return null
    }
  }

  // Deep analysis methods
  async getDeepAnalysis(asin: string): Promise<DeepAnalysis | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.deepAnalysis) {
      product.deepAnalysis = await DeepResearchService.generateDeepAnalysis({
        title: product.title,
        price: product.price,
        category: product.category,
        asin: product.asin,
        estimatedMonthlySales: product.bsrData?.estimatedMonthlySales || 50
      })
    }

    return product.deepAnalysis
  }

  async getKeywordAnalysis(asin: string): Promise<KeywordAnalysis | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.keywordAnalysis) {
      product.keywordAnalysis = await DeepResearchService.analyzeKeywords({
        title: product.title,
        category: product.category,
        asin: product.asin,
        price: product.price
      })
    }

    return product.keywordAnalysis
  }

  async getPPCStrategy(asin: string): Promise<PPCStrategy | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.ppcStrategy) {
      product.ppcStrategy = await DeepResearchService.calculatePPCStrategy({
        title: product.title,
        price: product.price,
        category: product.category
      })
    }

    return product.ppcStrategy
  }

  async getInventoryAnalysis(asin: string): Promise<InventoryAnalysis | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.inventoryAnalysis) {
      product.inventoryAnalysis = await DeepResearchService.analyzeInventory({
        price: product.price,
        category: product.category,
        seasonality: this.determineSeasonality(product.category)
      })
    }

    return product.inventoryAnalysis
  }

  async getDemandAnalysis(asin: string): Promise<DemandAnalysis | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.demandAnalysis) {
      product.demandAnalysis = await DeepResearchService.analyzeDemand({
        category: product.category,
        price: product.price,
        title: product.title
      })
    }

    return product.demandAnalysis
  }

  async getCompetitorAnalysis(asin: string): Promise<CompetitorAnalysis | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.competitorAnalysis) {
      product.competitorAnalysis = await DeepResearchService.analyzeCompetitors({
        category: product.category,
        price: product.price,
        asin: product.asin
      })
    }

    return product.competitorAnalysis
  }

  async getFinancialModel(asin: string): Promise<FinancialModel | null> {
    const product = await this.getProductByASIN(asin)
    if (!product) return null

    if (!product.financialModel) {
      product.financialModel = await DeepResearchService.createFinancialModel({
        price: product.price,
        estimatedMonthlySales: product.bsrData?.estimatedMonthlySales || 50,
        category: product.category
      })
    }

    return product.financialModel
  }

  // Helper methods
  private async generateBasicAnalysis(product: EnhancedProduct): Promise<ProductAnalysis> {
    const opportunityScore = this.calculateOpportunityScore(product)
    const demandScore = this.calculateDemandScore(product)
    const competitionScore = this.calculateCompetitionScore(product)
    const feasibilityScore = this.calculateFeasibilityScore(product)

    return {
      id: `analysis-${product.asin}`,
      opportunityScore,
      demandScore,
      competitionScore,
      feasibilityScore,
      financialAnalysis: {
        estimatedRevenue: this.estimateRevenue(product),
        profitMargin: this.estimateProfitMargin(product),
        breakEvenUnits: this.calculateBreakEven(product),
        roi: this.estimateROI(product)
      },
      marketAnalysis: {
        marketSize: this.estimateMarketSize(product.category),
        growthRate: this.estimateGrowthRate(product.category),
        seasonality: this.determineSeasonality(product.category),
        trends: this.identifyTrends(product.category)
      },
      competitionAnalysis: {
        competitorCount: this.estimateCompetitorCount(product.category),
        averageRating: product.reviewData?.averageRating || 4.0,
        priceRange: this.estimatePriceRange(product),
        marketShare: this.estimateMarketShare(product)
      },
      keywordAnalysis: {
        primaryKeywords: this.extractKeywords(product.title),
        searchVolume: this.estimateSearchVolume(product),
        difficulty: this.estimateKeywordDifficulty(product),
        suggestions: this.generateKeywordSuggestions(product)
      },
      reviewAnalysis: {
        sentiment: (product.reviewData?.sentimentAnalysis.positive || 70) / 100,
        commonComplaints: product.reviewData?.sentimentAnalysis.commonNegatives || [],
        opportunities: this.identifyReviewOpportunities(product)
      },
      supplyChainAnalysis: {
        complexity: this.assessSupplyChainComplexity(product.category),
        leadTime: this.estimateLeadTime(product.category),
        minimumOrder: this.estimateMinimumOrder(product.category),
        suppliers: this.estimateSupplierCount(product.category)
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private async generateFullAnalysis(product: EnhancedProduct): Promise<void> {
    try {
      const [deepAnalysis, keywordAnalysis, ppcStrategy, inventoryAnalysis, demandAnalysis, competitorAnalysis, financialModel] = await Promise.all([
        this.getDeepAnalysis(product.asin),
        this.getKeywordAnalysis(product.asin),
        this.getPPCStrategy(product.asin),
        this.getInventoryAnalysis(product.asin),
        this.getDemandAnalysis(product.asin),
        this.getCompetitorAnalysis(product.asin),
        this.getFinancialModel(product.asin)
      ])

      product.deepAnalysis = deepAnalysis || undefined
      product.keywordAnalysis = keywordAnalysis || undefined
      product.ppcStrategy = ppcStrategy || undefined
      product.inventoryAnalysis = inventoryAnalysis || undefined
      product.demandAnalysis = demandAnalysis || undefined
      product.competitorAnalysis = competitorAnalysis || undefined
      product.financialModel = financialModel || undefined

    } catch (error) {
      console.error('Error generating full analysis:', error)
    }
  }

  // Analysis calculation methods
  private calculateOpportunityScore(product: EnhancedProduct): number {
    let score = 5 // Base score

    // BSR factor (lower is better)
    if (product.bsrData) {
      if (product.bsrData.rank < 1000) score += 3
      else if (product.bsrData.rank < 10000) score += 2
      else if (product.bsrData.rank < 100000) score += 1
    }

    // Review factor
    if (product.reviewData) {
      if (product.reviewData.averageRating < 4.0) score += 2 // Opportunity to improve
      if (product.reviewData.totalReviews < 1000) score += 1 // Less saturated
    }

    // Price factor
    if (product.price > 20 && product.price < 100) score += 1 // Sweet spot for FBA

    return Math.min(10, score)
  }

  private calculateDemandScore(product: EnhancedProduct): number {
    let score = 5

    // BSR indicates demand
    if (product.bsrData) {
      if (product.bsrData.rank < 5000) score += 3
      else if (product.bsrData.rank < 50000) score += 2
      else if (product.bsrData.rank < 200000) score += 1
    }

    // Review count indicates popularity
    if (product.reviewData) {
      if (product.reviewData.totalReviews > 1000) score += 2
      else if (product.reviewData.totalReviews > 100) score += 1
    }

    return Math.min(10, score)
  }

  private calculateCompetitionScore(product: EnhancedProduct): number {
    let score = 5

    // Lower review count means less competition
    if (product.reviewData) {
      if (product.reviewData.totalReviews < 100) score += 3
      else if (product.reviewData.totalReviews < 500) score += 2
      else if (product.reviewData.totalReviews < 1000) score += 1
    }

    // Lower rating means opportunity
    if (product.reviewData && product.reviewData.averageRating < 4.0) {
      score += 2
    }

    return Math.min(10, score)
  }

  private calculateFeasibilityScore(product: EnhancedProduct): number {
    let score = 5

    // Price range affects feasibility
    if (product.price > 15 && product.price < 200) score += 2
    if (product.price > 25 && product.price < 100) score += 1

    // Category complexity
    const complexCategories = ['Electronics', 'Automotive', 'Health']
    if (!complexCategories.includes(product.category)) score += 2

    return Math.min(10, score)
  }

  // Estimation methods (simplified for demo)
  private estimateRevenue(product: EnhancedProduct): number {
    const monthlySales = product.bsrData?.estimatedMonthlySales || 50
    return monthlySales * product.price * 12
  }

  private estimateProfitMargin(product: EnhancedProduct): number {
    // Simplified calculation
    if (product.price < 20) return 20
    if (product.price < 50) return 35
    if (product.price < 100) return 45
    return 30
  }

  private calculateBreakEven(product: EnhancedProduct): number {
    const fixedCosts = 5000 // Simplified
    const profitPerUnit = product.price * (this.estimateProfitMargin(product) / 100)
    return Math.ceil(fixedCosts / profitPerUnit)
  }

  private estimateROI(product: EnhancedProduct): number {
    const margin = this.estimateProfitMargin(product)
    const turnover = product.bsrData?.estimatedMonthlySales || 50
    return margin * (turnover / 100) * 12 // Annualized
  }

  private estimateMarketSize(category: string): string {
    const sizes: Record<string, string> = {
      'Electronics': '$200B',
      'Kitchen': '$80B', 
      'Sports': '$60B',
      'Home': '$120B',
      'Beauty': '$90B'
    }
    return sizes[category] || '$50B'
  }

  private estimateGrowthRate(category: string): number {
    const rates: Record<string, number> = {
      'Electronics': 8,
      'Kitchen': 12,
      'Sports': 15,
      'Home': 10,
      'Beauty': 18
    }
    return rates[category] || 10
  }

  private determineSeasonality(category: string): string {
    const seasonality: Record<string, string> = {
      'Electronics': 'High Q4, moderate year-round',
      'Kitchen': 'Peak Q4 and Q1',
      'Sports': 'Peak Q1 and Q2',
      'Home': 'Peak Q2 and Q4',
      'Beauty': 'Steady year-round with Q4 peak'
    }
    return seasonality[category] || 'Moderate seasonality'
  }

  private identifyTrends(category: string): string[] {
    const trends: Record<string, string[]> = {
      'Electronics': ['Smart home integration', 'Wireless technology', 'Sustainability'],
      'Kitchen': ['Air fryer popularity', 'Meal prep tools', 'Eco-friendly materials'],
      'Sports': ['Home fitness', 'Wellness focus', 'Tech integration'],
      'Home': ['Smart home', 'Minimalism', 'Sustainability'],
      'Beauty': ['Clean beauty', 'Personalization', 'Male grooming']
    }
    return trends[category] || ['General market growth']
  }

  private estimateCompetitorCount(category: string): number {
    const counts: Record<string, number> = {
      'Electronics': 150,
      'Kitchen': 200,
      'Sports': 180,
      'Home': 220,
      'Beauty': 300
    }
    return counts[category] || 100
  }

  private estimatePriceRange(product: EnhancedProduct): { min: number; max: number } {
    const basePrice = product.price
    return {
      min: Math.max(1, Math.floor(basePrice * 0.7)),
      max: Math.ceil(basePrice * 1.5)
    }
  }

  private estimateMarketShare(product: EnhancedProduct): string {
    if (product.brand === 'Amazon') return 'Very High'
    if (product.reviewData && product.reviewData.totalReviews > 10000) return 'High'
    if (product.reviewData && product.reviewData.totalReviews > 1000) return 'Medium'
    return 'Low'
  }

  private extractKeywords(title: string): string[] {
    // Simple keyword extraction
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    return words.slice(0, 5)
  }

  private estimateSearchVolume(product: EnhancedProduct): number {
    // Based on category and BSR
    const baseVolume = product.bsrData?.rank ? Math.max(1000, 1000000 / product.bsrData.rank) : 5000
    return Math.floor(baseVolume)
  }

  private estimateKeywordDifficulty(product: EnhancedProduct): number {
    // Higher competition = higher difficulty
    const reviewCount = product.reviewData?.totalReviews || 0
    if (reviewCount > 10000) return 90
    if (reviewCount > 1000) return 70
    if (reviewCount > 100) return 50
    return 30
  }

  private generateKeywordSuggestions(product: EnhancedProduct): string[] {
    const category = product.category.toLowerCase()
    const suggestions = [
      `${category} accessories`,
      `best ${category}`,
      `affordable ${category}`,
      `${category} for beginners`,
      `professional ${category}`
    ]
    return suggestions
  }

  private identifyReviewOpportunities(product: EnhancedProduct): string[] {
    const opportunities = ['Improved packaging', 'Better instructions', 'Enhanced durability']
    
    if (product.reviewData && product.reviewData.averageRating < 4.0) {
      opportunities.push('Quality improvements', 'Customer service enhancement')
    }
    
    return opportunities
  }

  private assessSupplyChainComplexity(category: string): string {
    const complexity: Record<string, string> = {
      'Electronics': 'High',
      'Kitchen': 'Medium',
      'Sports': 'Low',
      'Home': 'Medium',
      'Beauty': 'Medium'
    }
    return complexity[category] || 'Medium'
  }

  private estimateLeadTime(category: string): string {
    const leadTimes: Record<string, string> = {
      'Electronics': '45-60 days',
      'Kitchen': '30-45 days',
      'Sports': '15-30 days',
      'Home': '30-45 days',
      'Beauty': '20-35 days'
    }
    return leadTimes[category] || '30-45 days'
  }

  private estimateMinimumOrder(category: string): number {
    const minimums: Record<string, number> = {
      'Electronics': 500,
      'Kitchen': 200,
      'Sports': 100,
      'Home': 150,
      'Beauty': 300
    }
    return minimums[category] || 200
  }

  private estimateSupplierCount(category: string): number {
    const counts: Record<string, number> = {
      'Electronics': 25,
      'Kitchen': 40,
      'Sports': 50,
      'Home': 35,
      'Beauty': 30
    }
    return counts[category] || 30
  }

  private generateFeatureReason(product: EnhancedProduct): string {
    const score = product.analysis?.opportunityScore || 0
    const category = product.category
    const margin = product.analysis?.financialAnalysis.profitMargin || 0

    return `This ${category.toLowerCase()} product scores ${score}/10 for opportunity with a ${margin}% profit margin. Strong market position with room for improvement makes it an excellent entry point for new sellers.`
  }

  // Analytics methods
  async getAnalytics() {
    // This would typically aggregate data from your database
    // For now, return sample analytics
    return {
      totalProducts: this.analyzedProducts.size,
      averageOpportunityScore: 7.2,
      topCategories: [
        { category: 'Sports', count: 5, avgScore: 8.5 },
        { category: 'Kitchen', count: 8, avgScore: 7.8 },
        { category: 'Electronics', count: 12, avgScore: 6.9 }
      ]
    }
  }

  // Cache management
  clearCache(): void {
    this.analyzedProducts.clear()
    amazonAPI.clearCache()
  }

  getCacheStats() {
    return {
      productsCached: this.analyzedProducts.size,
      amazonCacheStats: amazonAPI.getCacheStats()
    }
  }
}

// Singleton instance
export const productDataService = new ProductDataService()
export default productDataService