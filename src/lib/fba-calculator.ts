// Real Amazon FBA Fee Calculator
// Calculates accurate FBA fees based on current Amazon fee structure

export interface ProductDimensions {
  length: number // inches
  width: number // inches
  height: number // inches
  weight: number // pounds
}

export interface FBAFees {
  referralFee: number
  fulfillmentFee: number
  storageFee: number
  longTermStorageFee: number
  returnProcessingFee: number
  inboundDefectFee: number
  totalFees: number
  feePercentage: number
  netProfit: number
}

export interface FBACalculation {
  sellingPrice: number
  productCost: number
  fees: FBAFees
  profitMargin: number
  roi: number
  breakEvenPrice: number
  recommendedPrice: number
}

export class FBACalculator {
  
  // 2024 Amazon Referral Fee Rates by Category
  private static readonly REFERRAL_FEES: Record<string, number> = {
    'Automotive': 0.12,
    'Baby Products': 0.08,
    'Beauty': 0.08,
    'Books': 0.15,
    'Camera & Photo': 0.08,
    'Cell Phones & Accessories': 0.08,
    'Clothing & Accessories': 0.17,
    'Computers': 0.08,
    'Consumer Electronics': 0.08,
    'Electronics': 0.08,
    'Grocery & Gourmet Food': 0.08,
    'Health & Personal Care': 0.08,
    'Home & Garden': 0.15,
    'Home & Kitchen': 0.15,
    'Industrial & Scientific': 0.12,
    'Jewelry': 0.20,
    'Kitchen & Dining': 0.15,
    'Luggage': 0.15,
    'Musical Instruments': 0.15,
    'Office Products': 0.15,
    'Outdoors': 0.15,
    'Pet Supplies': 0.15,
    'Shoes': 0.15,
    'Software': 0.15,
    'Sports & Outdoors': 0.15,
    'Tools & Home Improvement': 0.15,
    'Toys & Games': 0.15,
    'Video Games': 0.15,
    'Watches': 0.16,
    'default': 0.15
  }

  // Monthly Storage Fee Rates (per cubic foot)
  private static readonly STORAGE_FEES = {
    standard: {
      janSep: 0.87, // January-September
      octDec: 2.40  // October-December (peak season)
    },
    oversized: {
      janSep: 0.56,
      octDec: 1.40
    }
  }

  // Long-term Storage Fee (per cubic foot, charged on 15th of month)
  private static readonly LONG_TERM_STORAGE_FEE = 6.90 // for items stored >365 days
  
  /**
   * Calculate comprehensive FBA fees for a product
   */
  static calculateFees(
    sellingPrice: number,
    productCost: number,
    category: string,
    dimensions: ProductDimensions,
    options: {
      month?: number // 1-12, used for seasonal storage fees
      isOversized?: boolean
      longTermStorage?: boolean
      includeReturns?: boolean
    } = {}
  ): FBACalculation {
    const {
      month = new Date().getMonth() + 1,
      isOversized = false,
      longTermStorage = false,
      includeReturns = true
    } = options

    // Calculate individual fees
    const referralFee = this.calculateReferralFee(sellingPrice, category)
    const fulfillmentFee = this.calculateFulfillmentFee(dimensions, isOversized)
    const storageFee = this.calculateStorageFee(dimensions, month, isOversized)
    const longTermStorageFee = longTermStorage ? this.calculateLongTermStorageFee(dimensions) : 0
    const returnProcessingFee = includeReturns ? this.calculateReturnProcessingFee(sellingPrice, category) : 0
    const inboundDefectFee = this.calculateInboundDefectFee(sellingPrice)

    // Calculate totals
    const totalFees = referralFee + fulfillmentFee + storageFee + longTermStorageFee + returnProcessingFee + inboundDefectFee
    const feePercentage = (totalFees / sellingPrice) * 100
    const netProfit = sellingPrice - productCost - totalFees
    const profitMargin = (netProfit / sellingPrice) * 100
    const roi = (netProfit / productCost) * 100

    // Calculate pricing recommendations
    const breakEvenPrice = productCost + totalFees
    const recommendedPrice = this.calculateRecommendedPrice(productCost, totalFees)

    const fees: FBAFees = {
      referralFee,
      fulfillmentFee,
      storageFee,
      longTermStorageFee,
      returnProcessingFee,
      inboundDefectFee,
      totalFees,
      feePercentage,
      netProfit
    }

    return {
      sellingPrice,
      productCost,
      fees,
      profitMargin,
      roi,
      breakEvenPrice,
      recommendedPrice
    }
  }

  /**
   * Calculate referral fee based on category and price
   */
  private static calculateReferralFee(sellingPrice: number, category: string): number {
    const rate = this.REFERRAL_FEES[category] || this.REFERRAL_FEES.default
    
    // Apply minimum fees for certain categories
    let fee = sellingPrice * rate
    
    // Category-specific minimums and maximums
    switch (category) {
      case 'Books':
        fee = Math.max(fee, 1.80) // Minimum $1.80
        break
      case 'Consumer Electronics':
      case 'Electronics':
        fee = Math.min(fee, 100.00) // Maximum $100
        break
      case 'Computers':
        fee = Math.min(fee, 100.00) // Maximum $100
        break
      case 'Cell Phones & Accessories':
        fee = Math.min(fee, 100.00) // Maximum $100
        break
    }

    return Math.round(fee * 100) / 100
  }

  /**
   * Calculate fulfillment fee based on size and weight
   */
  private static calculateFulfillmentFee(dimensions: ProductDimensions, isOversized: boolean = false): number {
    const { length, width, height, weight } = dimensions
    const volume = length * width * height
    
    if (isOversized || this.isOversized(dimensions)) {
      return this.calculateOversizedFulfillmentFee(weight, volume)
    } else {
      return this.calculateStandardFulfillmentFee(weight, volume)
    }
  }

  /**
   * Calculate standard size fulfillment fee
   */
  private static calculateStandardFulfillmentFee(weight: number, volume: number): number {
    // 2024 Standard Size Fulfillment Fees
    if (weight <= 0.25) {
      if (volume <= 6.25) return 3.06
      if (volume <= 9) return 3.28
      if (volume <= 18) return 3.40
      return 3.58
    } else if (weight <= 0.5) {
      if (volume <= 9) return 3.43
      if (volume <= 18) return 3.58
      return 3.77
    } else if (weight <= 0.75) {
      if (volume <= 18) return 3.77
      return 3.97
    } else if (weight <= 1) {
      if (volume <= 18) return 3.97
      return 4.19
    } else if (weight <= 1.25) {
      return 4.40
    } else if (weight <= 1.5) {
      return 4.62
    } else if (weight <= 1.75) {
      return 4.84
    } else if (weight <= 2) {
      return 5.06
    } else if (weight <= 2.25) {
      return 5.28
    } else if (weight <= 2.5) {
      return 5.50
    } else if (weight <= 2.75) {
      return 5.72
    } else if (weight <= 3) {
      return 5.94
    } else {
      // Additional weight charges
      const additionalWeight = weight - 3
      const additionalPounds = Math.ceil(additionalWeight)
      return 5.94 + (additionalPounds * 0.22)
    }
  }

  /**
   * Calculate oversized fulfillment fee
   */
  private static calculateOversizedFulfillmentFee(weight: number, volume: number): number {
    // 2024 Oversized Fulfillment Fees
    const baseWeight = Math.max(weight, volume / 139) // Dimensional weight
    
    if (baseWeight <= 70) {
      if (baseWeight <= 1) return 8.58
      if (baseWeight <= 2) return 9.25
      if (baseWeight <= 3) return 10.71
      if (baseWeight <= 20) return 18.41
      if (baseWeight <= 50) return 25.71
      return 48.86
    } else if (baseWeight <= 150) {
      return 63.98 + ((baseWeight - 70) * 0.83)
    } else {
      return 130.38 + ((baseWeight - 150) * 0.83)
    }
  }

  /**
   * Calculate monthly storage fee
   */
  private static calculateStorageFee(dimensions: ProductDimensions, month: number, isOversized: boolean): number {
    const { length, width, height } = dimensions
    const cubicFeet = (length * width * height) / 1728 // Convert cubic inches to cubic feet
    
    const isPeakSeason = month >= 10 && month <= 12
    const storageType = isOversized ? 'oversized' : 'standard'
    const rate = isPeakSeason ? 
      this.STORAGE_FEES[storageType].octDec : 
      this.STORAGE_FEES[storageType].janSep
    
    return Math.round(cubicFeet * rate * 100) / 100
  }

  /**
   * Calculate long-term storage fee
   */
  private static calculateLongTermStorageFee(dimensions: ProductDimensions): number {
    const { length, width, height } = dimensions
    const cubicFeet = (length * width * height) / 1728
    
    return Math.round(cubicFeet * this.LONG_TERM_STORAGE_FEE * 100) / 100
  }

  /**
   * Calculate return processing fee (estimated based on category return rates)
   */
  private static calculateReturnProcessingFee(sellingPrice: number, category: string): number {
    // Estimated return rates by category
    const returnRates: Record<string, number> = {
      'Clothing & Accessories': 0.20,
      'Shoes': 0.25,
      'Electronics': 0.08,
      'Books': 0.05,
      'Home & Kitchen': 0.12,
      'Beauty': 0.15,
      'default': 0.10
    }
    
    const returnRate = returnRates[category] || returnRates.default
    const returnProcessingCost = Math.min(sellingPrice * 0.20, 5.00) // Estimated cost per return
    
    return Math.round(returnRate * returnProcessingCost * 100) / 100
  }

  /**
   * Calculate inbound defect fee (estimated)
   */
  private static calculateInboundDefectFee(sellingPrice: number): number {
    // Estimated 1% defect rate with $5 processing fee
    return Math.round(0.01 * Math.min(sellingPrice * 0.10, 5.00) * 100) / 100
  }

  /**
   * Check if product qualifies as oversized
   */
  private static isOversized(dimensions: ProductDimensions): boolean {
    const { length, width, height, weight } = dimensions
    
    // Amazon oversized criteria
    return weight > 20 ||
           length > 18 ||
           width > 14 ||
           height > 8 ||
           (length * width * height) > 1728 // 1 cubic foot
  }

  /**
   * Calculate recommended selling price for target profit margin
   */
  private static calculateRecommendedPrice(productCost: number, estimatedFees: number, targetMargin: number = 0.30): number {
    // Calculate price needed to achieve target margin
    // Price = (Cost + Fees) / (1 - Target Margin - Fee Percentage)
    const estimatedFeeRate = 0.20 // Estimate 20% total fees
    const recommendedPrice = (productCost + estimatedFees) / (1 - targetMargin - estimatedFeeRate)
    
    return Math.round(recommendedPrice * 100) / 100
  }

  /**
   * Get category-specific insights and recommendations
   */
  static getCategoryInsights(category: string): {
    averageReturnRate: number
    competitiveMargin: number
    seasonalFactors: string[]
    pricingTips: string[]
  } {
    const insights: Record<string, any> = {
      'Electronics': {
        averageReturnRate: 8,
        competitiveMargin: 25,
        seasonalFactors: ['Q4 holiday boost', 'Back-to-school season'],
        pricingTips: ['Price competitively vs major brands', 'Consider bundle deals', 'Monitor for price wars']
      },
      'Clothing & Accessories': {
        averageReturnRate: 20,
        competitiveMargin: 40,
        seasonalFactors: ['Fashion seasons', 'Holiday gifting', 'Summer/winter demand'],
        pricingTips: ['Account for high return rates', 'Seasonal pricing adjustments', 'Size chart accuracy crucial']
      },
      'Home & Kitchen': {
        averageReturnRate: 12,
        competitiveMargin: 35,
        seasonalFactors: ['Spring cleaning', 'Holiday cooking', 'New home purchases'],
        pricingTips: ['Bundle complementary items', 'Emphasize quality and durability', 'Kitchen seasonal trends']
      },
      'default': {
        averageReturnRate: 10,
        competitiveMargin: 30,
        seasonalFactors: ['Q4 holiday season'],
        pricingTips: ['Research competitor pricing', 'Test price points', 'Monitor margin vs velocity']
      }
    }

    return insights[category] || insights.default
  }

  /**
   * Estimate monthly fees for inventory planning
   */
  static estimateMonthlyFees(
    inventory: number,
    dimensions: ProductDimensions,
    averageSales: number,
    sellingPrice: number,
    category: string
  ): {
    totalMonthlyFees: number
    perUnitFees: number
    inventoryTurnover: number
    carryingCost: number
  } {
    const isOversized = this.isOversized(dimensions)
    const currentMonth = new Date().getMonth() + 1
    
    // Calculate per-unit fees
    const perUnitFees = this.calculateFees(sellingPrice, 0, category, dimensions, {
      month: currentMonth,
      isOversized
    }).fees.totalFees

    // Calculate storage costs for entire inventory
    const storagePerUnit = this.calculateStorageFee(dimensions, currentMonth, isOversized)
    const totalStorageFees = inventory * storagePerUnit

    // Calculate fulfillment fees for average sales
    const fulfillmentPerUnit = this.calculateFulfillmentFee(dimensions, isOversized)
    const totalFulfillmentFees = averageSales * fulfillmentPerUnit

    const totalMonthlyFees = totalStorageFees + totalFulfillmentFees
    const inventoryTurnover = averageSales / inventory
    const carryingCost = (totalStorageFees / inventory) * sellingPrice

    return {
      totalMonthlyFees,
      perUnitFees,
      inventoryTurnover,
      carryingCost
    }
  }

  /**
   * Calculate breakeven analysis with different scenarios
   */
  static breakEvenAnalysis(
    productCost: number,
    category: string,
    dimensions: ProductDimensions,
    fixedCosts: number = 0
  ): {
    pricePoints: Array<{
      price: number
      margin: number
      unitsToBreakEven: number
      monthlyBreakEven: number
    }>
  } {
    const pricePoints = []
    const testPrices = [
      productCost * 2,
      productCost * 2.5,
      productCost * 3,
      productCost * 3.5,
      productCost * 4
    ]

    for (const price of testPrices) {
      const calculation = this.calculateFees(price, productCost, category, dimensions)
      const unitsToBreakEven = fixedCosts / calculation.fees.netProfit
      const monthlyBreakEven = unitsToBreakEven / 12

      pricePoints.push({
        price,
        margin: calculation.profitMargin,
        unitsToBreakEven: Math.ceil(unitsToBreakEven),
        monthlyBreakEven: Math.ceil(monthlyBreakEven)
      })
    }

    return { pricePoints }
  }
}

export const fbaCalculator = FBACalculator