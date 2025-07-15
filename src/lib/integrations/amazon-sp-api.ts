// Amazon SP-API Integration
// Docs: https://developer-docs.amazon.com/sp-api/

import crypto from 'crypto'

interface SpApiConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  region: string
  sellerId: string
  marketplaceId: string
}

interface SpApiTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

interface CatalogItem {
  asin: string
  productTitle?: string
  brand?: string
  manufacturer?: string
  color?: string
  size?: string
  productCategory?: string
  salesRankings?: Array<{
    productCategoryId: string
    rank: number
    displayGroupRanks?: Array<{
      website: string
      title: string
      link: string
      rank: number
    }>
  }>
  summaries?: Array<{
    marketplaceId: string
    adultProduct?: boolean
    autographed?: boolean
    eligibleForTrade?: boolean
    itemClassification: string
    itemName: string
    memorabilia?: boolean
    packageQuantity?: number
  }>
  attributeSets?: Array<{
    [key: string]: any
  }>
  relationships?: Array<{
    color?: string
    edition?: string
    flavor?: string
    format?: string
    size?: string
    childAsins?: string[]
    parentAsins?: string[]
    type: string
  }>
  images?: Array<{
    variant: string
    link: string
    height: number
    width: number
  }>
}

interface ProductPricing {
  ASIN: string
  status: string
  Product?: {
    Identifiers: {
      MarketplaceASIN: {
        MarketplaceId: string
        ASIN: string
      }
      SKUIdentifier?: {
        MarketplaceId: string
        SellerId: string
        SKU: string
      }
    }
    AttributeSets?: Array<{
      [key: string]: any
    }>
    Relationships?: Array<{
      [key: string]: any
    }>
    CompetitivePricing?: {
      CompetitivePrices: Array<{
        CompetitivePrice: {
          condition: string
          subcondition: string
          LandedPrice: {
            CurrencyCode: string
            Amount: number
          }
          ListingPrice: {
            CurrencyCode: string
            Amount: number
          }
          Shipping: {
            CurrencyCode: string
            Amount: number
          }
        }
        belongsToRequester: boolean
      }>
      NumberOfOfferListings: Array<{
        condition: string
        fulfillmentChannel: string
        Count: number
      }>
    }
    SalesRankings?: Array<{
      ProductCategoryId: string
      Rank: number
      DisplayGroupRanks?: Array<{
        Website: string
        Title: string
        Link: string
        Rank: number
      }>
    }>
    LowestPricedOffers?: Array<{
      [key: string]: any
    }>
  }
}

class AmazonSpApi {
  private config: SpApiConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      clientId: process.env.AMAZON_SP_API_CLIENT_ID || '',
      clientSecret: process.env.AMAZON_SP_API_CLIENT_SECRET || '',
      refreshToken: process.env.AMAZON_SP_API_REFRESH_TOKEN || '',
      region: process.env.AMAZON_SP_API_REGION || 'na',
      sellerId: process.env.SP_API_SELLER_ID || '',
      marketplaceId: process.env.SP_API_MARKETPLACE_ID || ''
    }

    if (!this.config.clientId || !this.config.clientSecret || !this.config.refreshToken) {
      console.warn('Amazon SP-API credentials not fully configured')
    }
  }

  /**
   * Get SP-API base URL for region
   */
  private getApiUrl(): string {
    const regionUrls: { [key: string]: string } = {
      'na': 'https://sellingpartnerapi-na.amazon.com',
      'eu': 'https://sellingpartnerapi-eu.amazon.com',
      'fe': 'https://sellingpartnerapi-fe.amazon.com'
    }
    return regionUrls[this.config.region] || regionUrls['na']
  }

  /**
   * Get access token using refresh token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const tokenUrl = 'https://api.amazon.com/auth/o2/token'
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        })
      })

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
      }

      const tokenData: SpApiTokenResponse = await response.json()
      
      this.accessToken = tokenData.access_token
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 60) * 1000) // Refresh 1 minute early
      
      console.log('SP-API access token refreshed successfully')
      return this.accessToken

    } catch (error) {
      console.error('Error getting SP-API access token:', error)
      throw error
    }
  }

  /**
   * Make authenticated request to SP-API
   */
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const accessToken = await this.getAccessToken()
    const url = `${this.getApiUrl()}${endpoint}`

    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-amz-access-token': accessToken
    }

    const requestOptions: RequestInit = {
      method,
      headers
    }

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    console.log(`Making SP-API request to: ${endpoint}`)

    try {
      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`SP-API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('SP-API request error:', error)
      throw error
    }
  }

  /**
   * Get catalog item by ASIN
   */
  async getCatalogItem(asin: string): Promise<CatalogItem | null> {
    try {
      const endpoint = `/catalog/2022-04-01/items/${asin}`
      const params = new URLSearchParams({
        marketplaceIds: this.config.marketplaceId,
        includedData: 'summaries,attributes,identifiers,images,productTypes,salesRanks,relationships'
      })

      const response = await this.makeRequest(`${endpoint}?${params}`)
      
      if (response && response.payload) {
        return response.payload
      }

      return null
    } catch (error) {
      console.error('Error fetching catalog item:', error)
      return null
    }
  }

  /**
   * Get product pricing by ASIN
   */
  async getProductPricing(asin: string): Promise<ProductPricing | null> {
    try {
      const endpoint = `/products/pricing/v0/price`
      const params = new URLSearchParams({
        MarketplaceId: this.config.marketplaceId,
        Asins: asin,
        ItemType: 'Asin'
      })

      const response = await this.makeRequest(`${endpoint}?${params}`)
      
      if (response && response.payload && response.payload.length > 0) {
        return response.payload[0]
      }

      return null
    } catch (error) {
      console.error('Error fetching product pricing:', error)
      return null
    }
  }

  /**
   * Search catalog items
   */
  async searchCatalogItems(query: string, limit: number = 10): Promise<CatalogItem[]> {
    try {
      const endpoint = '/catalog/2022-04-01/items'
      const params = new URLSearchParams({
        marketplaceIds: this.config.marketplaceId,
        keywords: query,
        includedData: 'summaries,attributes,identifiers,images,productTypes,salesRanks',
        pageSize: limit.toString()
      })

      const response = await this.makeRequest(`${endpoint}?${params}`)
      
      if (response && response.payload && response.payload.items) {
        return response.payload.items
      }

      return []
    } catch (error) {
      console.error('Error searching catalog items:', error)
      return []
    }
  }

  /**
   * Transform SP-API data for database storage
   */
  transformForDatabase(catalogItem: CatalogItem, pricing?: ProductPricing) {
    const summary = catalogItem.summaries?.[0]
    const attributes = catalogItem.attributeSets?.[0]
    const salesRank = catalogItem.salesRankings?.[0]
    const mainImage = catalogItem.images?.find(img => img.variant === 'MAIN')

    return {
      asin: catalogItem.asin,
      title: summary?.itemName || catalogItem.productTitle || '',
      brand: catalogItem.brand || attributes?.Brand || '',
      manufacturer: catalogItem.manufacturer || '',
      category: catalogItem.productCategory || summary?.itemClassification || '',
      color: catalogItem.color || '',
      size: catalogItem.size || '',
      
      // Sales rank
      bsr: salesRank?.rank || null,
      bsrCategory: salesRank?.productCategoryId || '',
      
      // Pricing data
      price: pricing?.Product?.CompetitivePricing?.CompetitivePrices?.[0]?.CompetitivePrice?.LandedPrice?.Amount || null,
      listingPrice: pricing?.Product?.CompetitivePricing?.CompetitivePrices?.[0]?.CompetitivePrice?.ListingPrice?.Amount || null,
      shippingPrice: pricing?.Product?.CompetitivePricing?.CompetitivePrices?.[0]?.CompetitivePrice?.Shipping?.Amount || null,
      
      // Images
      mainImageUrl: mainImage?.link || '',
      imageUrls: catalogItem.images?.map(img => img.link).join(',') || '',
      
      // Additional data
      packageQuantity: summary?.packageQuantity || 1,
      adultProduct: summary?.adultProduct || false,
      
      // Raw data for storage
      rawCatalogData: catalogItem,
      rawPricingData: pricing,
      lastUpdated: new Date()
    }
  }

  /**
   * Get comprehensive product data (catalog + pricing)
   */
  async getCompleteProductData(asin: string) {
    try {
      console.log('Fetching complete SP-API data for ASIN:', asin)
      
      // Fetch catalog and pricing data in parallel
      const [catalogItem, pricing] = await Promise.all([
        this.getCatalogItem(asin),
        this.getProductPricing(asin)
      ])

      if (!catalogItem) {
        console.log('No catalog data found for ASIN:', asin)
        return null
      }

      return this.transformForDatabase(catalogItem, pricing || undefined)
    } catch (error) {
      console.error('Error fetching complete product data:', error)
      return null
    }
  }
}

export const amazonSpApi = new AmazonSpApi()
export type { CatalogItem, ProductPricing }