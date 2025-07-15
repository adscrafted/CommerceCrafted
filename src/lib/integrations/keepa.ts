// Keepa API Integration
// Docs: https://keepa.com/api/

interface KeepaConfig {
  apiKey: string
  baseUrl: string
  domain: number // 1 = US, 2 = UK, 3 = DE, etc.
}

interface KeepaImage {
  l?: string    // Large image filename
  lH?: number   // Height of large image in pixels
  lW?: number   // Width of large image in pixels
  m?: string    // Medium image filename
  mH?: number   // Height of medium image in pixels
  mW?: number   // Width of medium image in pixels
}

interface KeepaProduct {
  productType: number // 0=STANDARD, 1=DOWNLOADABLE, 2=EBOOK, 3=INACCESSIBLE, 4=INVALID, 5=VARIATION_PARENT
  asin: string
  domainId: number
  title: string
  trackingSince: number
  listedSince: number // When product was first listed on Amazon (Keepa time)
  lastUpdate: number
  lastRatingUpdate: number
  lastPriceChange: number
  lastEbayUpdate: number
  lastStockUpdate?: number
  
  // Images - array of image objects
  images?: KeepaImage[]
  
  // Categories
  rootCategory?: number
  categories?: number[]
  categoryTree?: Array<{
    catId: number
    name: string
  }>
  
  // Product identifiers
  parentAsin?: string
  parentAsinHistory?: string[] // History of parent ASINs
  frequentlyBoughtTogether?: string[] // ASINs frequently bought together
  eanList?: string[]
  upcList?: string[]
  gtinList?: string[] // Global Trade Item Numbers
  manufacturer?: string
  brand?: string
  brandStoreName?: string
  brandStoreUrl?: string
  brandStoreUrlName?: string
  model?: string
  color?: string
  size?: string
  partNumber?: string
  
  // Product details
  description?: string
  features?: string[] // Up to 5 bullet points
  packageHeight?: number // in millimeters
  packageLength?: number // in millimeters
  packageWidth?: number  // in millimeters
  packageWeight?: number // in grams
  itemHeight?: number    // in millimeters
  itemLength?: number    // in millimeters
  itemWidth?: number     // in millimeters
  itemWeight?: number    // in grams
  
  // Display and category info
  websiteDisplayGroup?: string
  websiteDisplayGroupName?: string
  salesRankDisplayGroup?: string
  productGroup?: string // Important for backend categorization
  type?: string // Product type string
  binding?: string
  
  // Stats object with current values
  stats?: {
    current?: number[]      // Current values for all data types
    avg?: number[]          // Average values
    avg30?: number[]        // 30-day average
    avg90?: number[]        // 90-day average
    avg180?: number[]       // 180-day average
    min?: (number | number[])[]  // Minimum values (can be array with timestamp)
    max?: (number | number[])[]  // Maximum values (can be array with timestamp)
  }
  
  // Time series data - 2D array where first index is data type
  csv?: (number[] | null)[][]
  
  // FBA fees
  fbaFees?: {
    pickAndPackFee?: number
    lastUpdate?: number
  }
  
  // Sales rank
  salesRankReference?: number
  salesRanks?: { [categoryId: string]: number[] }
  
  // Additional metadata
  numberOfItems?: number
  numberOfPages?: number
  publicationDate?: number
  isAdultProduct?: boolean
  monthlySold?: number
  
  // Raw data for any additional fields
  [key: string]: any
}

interface KeepaResponse {
  products: KeepaProduct[]
  tokensLeft: number
  tokensConsumed: number
  processingTimeInMs: number
  timestamp: number
}

class KeepaAPI {
  private config: KeepaConfig

  constructor() {
    this.config = {
      apiKey: process.env.KEEPA_API_KEY || '',
      baseUrl: 'https://api.keepa.com',
      domain: 1 // US marketplace
    }

    if (!this.config.apiKey) {
      console.error('❌ Keepa API key not configured!')
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('KEEPA')))
    } else {
      console.log('✅ Keepa API key loaded:', this.config.apiKey.substring(0, 10) + '...')
    }
  }

  /**
   * Fetch product data from Keepa
   */
  async getProduct(asin: string): Promise<KeepaProduct | null> {
    try {
      // Request all available fields for maximum data
      const params = new URLSearchParams({
        key: this.config.apiKey,
        domain: this.config.domain.toString(),
        asin: asin,
        stats: '1',          // Include statistical data
        history: '1',        // Include price history
        offers: '20',        // Include up to 20 offers
        fbafees: '1',        // Include FBA fees
        buybox: '1',         // Include buybox data
        rental: '1',         // Include rental offers
        rating: '1',         // Include rating history
        update: '0',         // Don't force update (use cached if fresh)
        only_live_offers: '0' // Include all offers
      })
      
      const url = `${this.config.baseUrl}/product?${params.toString()}`
      
      console.log('Fetching Keepa data for ASIN:', asin)
      console.log('Full URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Keepa API error: ${response.status} ${response.statusText}`)
      }

      const data: KeepaResponse = await response.json()
      
      console.log(`Keepa API consumed ${data.tokensConsumed} tokens, ${data.tokensLeft} remaining`)
      
      if (data.products && data.products.length > 0) {
        // Skip file logging for now - it might be causing the hang
        console.log('Keepa product found, skipping file logging for now')
        
        return data.products[0]
      }

      return null
    } catch (error) {
      console.error('Error fetching Keepa data:', error)
      return null
    }
  }

  /**
   * Get price history for multiple ASINs
   */
  async getProducts(asins: string[]): Promise<KeepaProduct[]> {
    try {
      const asinList = asins.join(',')
      const url = `${this.config.baseUrl}/product?key=${this.config.apiKey}&domain=${this.config.domain}&asin=${asinList}&stats=1&history=1&offers=20&fbafees=1`
      
      console.log('Fetching Keepa data for ASINs:', asins)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Keepa API error: ${response.status} ${response.statusText}`)
      }

      const data: KeepaResponse = await response.json()
      
      console.log(`Keepa API consumed ${data.tokensConsumed} tokens, ${data.tokensLeft} remaining`)
      
      return data.products || []
    } catch (error) {
      console.error('Error fetching Keepa data:', error)
      return []
    }
  }

  /**
   * Parse Keepa time series data
   */
  parseTimeSeries(data: number[]): Array<{ timestamp: Date; value: number }> {
    const result = []
    
    for (let i = 0; i < data.length; i += 2) {
      const keepaTime = data[i]
      const value = data[i + 1]
      
      if (keepaTime && value !== undefined && value !== -1) {
        // Convert Keepa time to JavaScript Date using official formula
        // Keepa Time Minutes: (keepaTime + 21564000) * 60000 for milliseconds
        const timestampMs = (keepaTime + 21564000) * 60000
        const timestamp = new Date(timestampMs)
        
        result.push({
          timestamp,
          value: value / 100 // Keepa prices are in cents
        })
      }
    }
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * Get current price and stats from CSV data
   * CSV indices according to official Keepa documentation:
   * 0 - AMAZON: Amazon price
   * 1 - NEW: Marketplace New price
   * 2 - USED: Marketplace Used price
   * 3 - SALES: Sales Rank
   * 4 - LISTPRICE: List Price
   * 5 - COLLECTIBLE: Collectible price
   * 6 - REFURBISHED: Refurbished price
   * 7 - NEW_FBM_SHIPPING: 3rd party New price including shipping (FBM only)
   * 8 - LIGHTNING_DEAL: Lightning Deal price
   * 9 - WAREHOUSE: Amazon Warehouse price
   * 10 - NEW_FBA: Price of lowest 3rd party New offer fulfilled by Amazon
   * 11 - COUNT_NEW: New offer count
   * 12 - COUNT_USED: Used offer count
   * 13 - COUNT_REFURBISHED: Refurbished offer count
   * 14 - COUNT_COLLECTIBLE: Collectible offer count
   * 15 - EXTRA_INFO_UPDATES: Update history
   * 16 - RATING: Product rating (0-50, e.g., 45 = 4.5 stars)
   * 17 - COUNT_REVIEWS: Review count
   * 18 - BUY_BOX_SHIPPING: Buy box price including shipping
   * 19-26 - Various used/collectible conditions with shipping
   * 27 - REFURBISHED_SHIPPING: Refurbished with shipping
   * 28 - EBAY_NEW_SHIPPING: eBay new price
   * 29 - EBAY_USED_SHIPPING: eBay used price
   * 30 - TRADE_IN: Trade-in value
   * 31 - RENTAL: Rental price
   * 32 - BUY_BOX_USED_SHIPPING: Used buy box with shipping
   * 33 - PRIME_EXCL: Prime exclusive price
   */
  getCurrentStats(product: KeepaProduct) {
    // Keepa might return current values in different fields
    const csv = product.csv_prices || product.stats?.current || []
    
    // Return empty stats if no data
    if (!csv || csv.length === 0) {
      return {
        amazonPrice: null,
        newPrice: null,
        usedPrice: null,
        salesRank: null,
        rating: null,
        reviewCount: null,
        newOfferCount: null,
        usedOfferCount: null,
        buyBoxPrice: null,
        buyBoxShipping: null
      }
    }
    
    return {
      amazonPrice: csv[0] !== -1 ? csv[0] / 100 : null,
      newPrice: csv[1] !== -1 ? csv[1] / 100 : null,
      usedPrice: csv[2] !== -1 ? csv[2] / 100 : null,
      salesRank: csv[3] !== -1 ? csv[3] : null,
      rating: csv[4] !== -1 ? csv[4] / 10 : null, // Keepa ratings are * 10
      reviewCount: csv[5] !== -1 ? csv[5] : null,
      newOfferCount: csv[6] !== -1 ? csv[6] : null,
      usedOfferCount: csv[7] !== -1 ? csv[7] : null,
      buyBoxPrice: csv[18] !== -1 ? csv[18] / 100 : null,
      buyBoxShipping: csv[19] !== -1 ? csv[19] / 100 : null
    }
  }

  /**
   * Transform Keepa data for database storage
   */
  transformForDatabase(product: KeepaProduct) {
    console.log('Transforming Keepa product:', product.asin)
    
    // Get current values from stats.current array if available
    let currentPrice = null
    let currentBsr = null
    let currentRating = null
    let currentReviewCount = null
    
    if (product.stats?.current && Array.isArray(product.stats.current)) {
      // Get current values from stats array - indices match CSV indices
      // Amazon price (index 0 - AMAZON)
      if (product.stats.current[0] !== -1) {
        currentPrice = product.stats.current[0] / 100
      } else if (product.stats.current[1] !== -1) {
        // Fallback to New price (index 1 - NEW)
        currentPrice = product.stats.current[1] / 100
      } else if (product.stats.current[18] !== -1) {
        // Fallback to Buy Box price (index 18 - BUY_BOX_SHIPPING)
        currentPrice = product.stats.current[18] / 100
      }
      
      // Sales rank (index 3 - SALES)
      currentBsr = product.stats.current[3] !== -1 ? product.stats.current[3] : null
      
      // Rating (index 16 - RATING)
      if (product.stats.current[16] !== -1) {
        currentRating = product.stats.current[16] / 10
      }
      
      // Review count (index 17 - COUNT_REVIEWS)
      if (product.stats.current[17] !== -1) {
        currentReviewCount = product.stats.current[17]
      }
    }
    
    // Try to get current values from CSV if not in stats
    if (!currentPrice && product.csv) {
      // Check price indices in order: AMAZON (0), NEW (1), LIGHTNING_DEAL (8), WAREHOUSE (9)
      const priceIndices = [
        { idx: 0, name: 'AMAZON' },
        { idx: 1, name: 'NEW' },
        { idx: 8, name: 'LIGHTNING_DEAL' },
        { idx: 9, name: 'WAREHOUSE' },
        { idx: 10, name: 'NEW_FBA' },
        { idx: 18, name: 'BUY_BOX_SHIPPING' }
      ]
      
      for (const { idx, name } of priceIndices) {
        if (product.csv[idx] && Array.isArray(product.csv[idx]) && product.csv[idx].length >= 2) {
          // CSV format is [keepaTime, value, keepaTime, value, ...]
          // Get the last value (which is at the last odd index)
          const lastValueIndex = product.csv[idx].length - 1
          const lastValue = product.csv[idx][lastValueIndex]
          
          // For Lightning deals, check if it's active (future timestamp with -1 means deal announced)
          if (idx === 8 && lastValue === -1 && product.csv[idx].length >= 2) {
            // Get the second to last value for active deal price
            const activeDealPrice = product.csv[idx][product.csv[idx].length - 3]
            if (activeDealPrice && activeDealPrice !== -1) {
              currentPrice = activeDealPrice / 100
              console.log(`Found active Lightning Deal price: $${currentPrice}`)
              break
            }
          } else if (lastValue && lastValue !== -1) {
            currentPrice = lastValue / 100
            console.log(`Found current price from CSV ${name} (index ${idx}): $${currentPrice}`)
            break
          }
        }
      }
    }
    
    if (!currentBsr && product.csv && product.csv[3] && product.csv[3].length >= 2) {
      // Sales rank is at index 3
      const lastValueIndex = product.csv[3].length - 1
      const lastValue = product.csv[3][lastValueIndex]
      if (lastValue && lastValue !== -1) {
        currentBsr = lastValue
        console.log(`Found current BSR from CSV: ${currentBsr}`)
      }
    }
    
    // Try to get rating and review count from CSV as fallback
    if (!currentRating && product.csv && product.csv[16] && product.csv[16].length >= 2) {
      const lastValueIndex = product.csv[16].length - 1
      const lastValue = product.csv[16][lastValueIndex]
      if (lastValue && lastValue !== -1) {
        currentRating = lastValue / 10
        console.log(`Found current rating from CSV: ${currentRating}`)
      }
    }
    
    if (!currentReviewCount && product.csv && product.csv[17] && product.csv[17].length >= 2) {
      const lastValueIndex = product.csv[17].length - 1
      const lastValue = product.csv[17][lastValueIndex]
      if (lastValue && lastValue !== -1) {
        currentReviewCount = lastValue
        console.log(`Found current review count from CSV: ${currentReviewCount}`)
      }
    }
    
    // Parse images from Keepa's image objects
    let imageUrls: string[] = []
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        // Use large image if available, otherwise medium
        if (img.l) {
          imageUrls.push(`https://m.media-amazon.com/images/I/${img.l}`)
        } else if (img.m) {
          imageUrls.push(`https://m.media-amazon.com/images/I/${img.m}`)
        }
      })
    }
    
    // If still no images, try to construct from ASIN as fallback
    if (imageUrls.length === 0 && product.asin) {
      // This is a fallback - actual image may not exist
      console.log('No images found for ASIN:', product.asin, '- using fallback')
    }
    
    // Parse dimensions - Keepa returns these in millimeters and grams
    const dimensions = {
      length: product.packageLength || product.itemLength || null,  // in mm
      width: product.packageWidth || product.itemWidth || null,      // in mm
      height: product.packageHeight || product.itemHeight || null,   // in mm
      weight: product.packageWeight || product.itemWeight || null    // in grams
    }
    
    // Parse time series data from csv array
    let priceHistory: Array<{ timestamp: Date; value: number }> = []
    let bsrHistory: Array<{ timestamp: Date; value: number }> = []
    let ratingHistory: Array<{ timestamp: Date; value: number }> = []
    let reviewCountHistory: Array<{ timestamp: Date; value: number }> = []
    
    if (product.csv && Array.isArray(product.csv)) {
      // Price history - try multiple sources in order of preference
      const priceIndices = [0, 1, 18, 10]; // AMAZON, NEW, BUY_BOX_SHIPPING, NEW_FBA
      for (const idx of priceIndices) {
        if (product.csv[idx] && Array.isArray(product.csv[idx]) && product.csv[idx].length > 0) {
          priceHistory = this.parseTimeSeries(product.csv[idx])
          if (priceHistory.length > 0) {
            console.log(`Found price history at index ${idx} with ${priceHistory.length} data points`)
            break
          }
        }
      }
      
      // Sales rank history (index 3 - SALES)
      if (product.csv[3] && Array.isArray(product.csv[3])) {
        bsrHistory = this.parseTimeSeries(product.csv[3])
        console.log(`Found BSR history with ${bsrHistory.length} data points`)
      }
      
      // Rating history (index 16 - RATING)
      if (product.csv[16] && Array.isArray(product.csv[16])) {
        const rawRatingHistory = this.parseTimeSeries(product.csv[16])
        // Convert from Keepa's rating format (0-50) to standard (0-5)
        ratingHistory = rawRatingHistory.map(item => ({
          timestamp: item.timestamp,
          value: item.value / 10
        }))
        console.log(`Found rating history with ${ratingHistory.length} data points`)
      }
      
      // Review count history (index 17 - COUNT_REVIEWS)
      if (product.csv[17] && Array.isArray(product.csv[17])) {
        reviewCountHistory = this.parseTimeSeries(product.csv[17])
        console.log(`Found review count history with ${reviewCountHistory.length} data points`)
      }
    }
    
    // Log what we found for debugging
    console.log(`Keepa data summary for ${product.asin}:`, {
      productType: product.productType,
      hasImages: imageUrls.length > 0,
      hasStats: !!product.stats?.current,
      hasCSV: !!product.csv,
      csvLength: product.csv?.length || 0,
      currentPrice,
      currentBsr,
      currentRating,
      currentReviewCount,
      priceHistoryCount: priceHistory.length,
      bsrHistoryCount: bsrHistory.length
    })
    
    // Convert listedSince from Keepa time to Date
    let listedSinceDate = null
    if (product.listedSince && product.listedSince !== -1) {
      const timestampMs = (product.listedSince + 21564000) * 60000
      listedSinceDate = new Date(timestampMs)
    }
    
    return {
      asin: product.asin,
      title: product.title || 'Unknown Product',
      brand: product.brand || product.manufacturer || null,
      brandStoreName: product.brandStoreName || null,
      brandStoreUrl: product.brandStoreUrl || null,
      category: product.categoryTree && product.categoryTree.length > 0 
        ? product.categoryTree[0].name 
        : (product.rootCategory ? `Category ${product.rootCategory}` : null),
      subcategory: product.categoryTree && product.categoryTree.length > 1
        ? product.categoryTree[product.categoryTree.length - 1].name
        : null,
      description: product.description || null,
      bulletPoints: product.features || [],
      binding: product.binding || null,
      productGroup: product.productGroup || null,
      productGroupType: product.type || null,
      model: product.model || null,
      color: product.color || null,
      size: product.size || null,
      partNumber: product.partNumber || null,
      numberOfItems: product.numberOfItems || null,
      eanList: product.eanList || [],
      upcList: product.upcList || [],
      gtinList: product.gtinList || [],
      frequentlyBoughtTogether: product.frequentlyBoughtTogether || [],
      parentAsin: product.parentAsin || null,
      isAdultProduct: product.isAdultProduct || false,
      monthlySold: product.monthlySold || null,
      productType: product.productType,
      listedSince: listedSinceDate,
      lastUpdate: product.lastUpdate,
      salesRankReference: product.salesRankReference || null,
      aPlusContent: {},
      dimensions: dimensions,
      fbaFees: product.fbaFees || {},
      imageUrls: imageUrls,
      currentPrice: currentPrice,
      currentBsr: currentBsr,
      currentRating: currentRating,
      currentReviewCount: currentReviewCount,
      
      // Historical data
      priceHistory: priceHistory,
      bsrHistory: bsrHistory,
      ratingHistory: ratingHistory,
      reviewCountHistory: reviewCountHistory,
      
      // Raw data for storage (limit size to avoid database issues)
      keepaData: {
        productType: product.productType,
        lastUpdate: product.lastUpdate,
        trackingSince: product.trackingSince,
        rootCategory: product.rootCategory,
        stats: product.stats
      },
      lastKeepaSync: new Date()
    }
  }
}

export const keepaAPI = new KeepaAPI()
export type { KeepaProduct, KeepaResponse }