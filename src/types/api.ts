// Real API Types for CommerceCrafted Production Platform
// These types define the structure of real data from external APIs

// Core Product Types
export interface Product {
  id: string
  asin: string
  title: string
  brand: string
  category: string
  subcategory?: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  imageUrls: string[]
  thumbnailUrl?: string
  description: string
  features: string[]
  dimensions?: string
  weight?: string
  availability: 'in_stock' | 'out_of_stock' | 'limited_stock' | 'unknown'
  bsr?: number // Best Seller Rank
  listPrice?: number
  salesRank?: number
  variations?: ProductVariation[]
  createdAt: string
  updatedAt: string
  lastScrapedAt?: string
  
  // Analysis data (populated separately)
  analysis?: ProductAnalysis
  deepAnalysis?: DeepAnalysis
}

export interface ProductVariation {
  id: string
  asin: string
  title: string
  price: number
  imageUrl?: string
  attributes: Record<string, string> // e.g., { "Color": "Red", "Size": "Large" }
  availability: string
}

export interface ProductAnalysis {
  id: string
  productId: string
  opportunityScore: number // 1-10
  demandScore: number // 1-10  
  competitionScore: number // 1-10
  feasibilityScore: number // 1-10
  
  // Financial projections
  financialAnalysis: {
    estimatedMonthlySales: number
    estimatedRevenue: number
    profitMargin: number
    breakEvenUnits: number
    roi: number
    costOfGoodsSold: number
    fbaFees: number
    marketingCosts: number
  }
  
  // Market insights
  marketAnalysis: {
    marketSize: string
    totalAddressableMarket: number
    growthRate: number
    seasonality: 'high' | 'medium' | 'low'
    seasonalityMultipliers: Record<string, number> // month -> multiplier
    trends: string[]
    marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining'
  }
  
  // Competition data
  competitionAnalysis: {
    competitorCount: number
    averageRating: number
    priceRange: { min: number; max: number }
    marketShare: string
    competitionLevel: 'low' | 'medium' | 'high'
    barrierToEntry: 'low' | 'medium' | 'high'
    topCompetitors: Array<{
      asin: string
      title: string
      price: number
      rating: number
      reviewCount: number
      marketShare: number
    }>
  }
  
  // Keyword research
  keywordAnalysis: {
    primaryKeywords: string[]
    searchVolume: number
    difficulty: number // 1-100
    cpc: number // Cost per click
    suggestions: string[]
    longTailKeywords: Array<{
      keyword: string
      searchVolume: number
      difficulty: number
      intent: 'commercial' | 'informational' | 'navigational' | 'transactional'
    }>
  }
  
  // Review insights
  reviewAnalysis: {
    sentiment: number // -1 to 1
    positivePercentage: number
    negativePercentage: number
    neutralPercentage: number
    commonComplaints: string[]
    commonPraises: string[]
    opportunities: string[]
    reviewVelocity: number // reviews per month
    averageReviewLength: number
  }
  
  // Supply chain assessment
  supplyChainAnalysis: {
    complexity: 'low' | 'medium' | 'high'
    leadTime: string
    minimumOrder: number
    supplierCount: number
    manufacturingRegions: string[]
    shippingCosts: number
    customsDuties: number
    qualityRequirements: string[]
  }
  
  // Risk assessment
  riskFactors: Array<{
    factor: string
    severity: 'low' | 'medium' | 'high'
    probability: number // 0-1
    impact: number // 0-1
    mitigation: string
  }>
  
  createdAt: string
  updatedAt: string
  analysisVersion: string
}

// Daily Feature
export interface DailyFeature {
  id: string
  date: string
  nicheName?: string | null
  nicheSlug?: string | null
  nicheId?: string | null
  nicheProducts?: any[] // Array of products in the niche for carousel
  product: Product
  reason: string
  highlights: string[]
  marketContext: string
  aiInsights: string[]
  createdAt: string
}

// Advanced Analysis Types
export interface DeepAnalysis {
  id: string
  productId: string
  opportunityScore: number
  
  // Market sizing
  marketSize: {
    tam: number // Total Addressable Market
    sam: number // Serviceable Addressable Market  
    som: number // Serviceable Obtainable Market
    currency: string
  }
  
  // Competition assessment
  competitionLevel: 'low' | 'medium' | 'high'
  
  // Growth trends
  demandTrends: {
    historical: Array<{ year: string; growth: number }>
    projected: Array<{ year: string; growth: number }>
    cagr: number // Compound Annual Growth Rate
    seasonality: Record<string, number>
  }
  
  // Keyword opportunities
  keywordOpportunities: Array<{
    keyword: string
    searchVolume: number
    competition: number
    opportunity: 'high' | 'medium' | 'low'
    cpc: number
    difficulty: number
  }>
  
  // PPC strategy
  ppcStrategy: PPCStrategy
  
  // Inventory recommendations
  inventoryRecommendations: InventoryAnalysis
  
  // Risk assessment
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high'
    riskFactors: Array<{
      category: string
      risk: string
      probability: number
      impact: number
      mitigation: string
    }>
  }
  
  // Launch strategy
  launchStrategy: Array<{
    phase: number
    name: string
    duration: string
    budget: number
    objectives: string[]
    keyMetrics: string[]
    expectedOutcomes: string[]
  }>
  
  // Financial projections
  financialProjections: Array<{
    month: string
    revenue: number
    cogs: number
    grossProfit: number
    expenses: number
    netProfit: number
    cumulativeCashFlow: number
  }>
  
  createdAt: string
  updatedAt: string
}

export interface KeywordAnalysis {
  id: string
  productId: string
  
  // Primary keywords
  primaryKeywords: Array<{
    keyword: string
    searchVolume: number
    competition: number
    cpc: number
    difficulty: number
    intent: 'commercial' | 'informational' | 'navigational' | 'transactional'
    ranking?: number
  }>
  
  // Long tail opportunities
  longTailKeywords: Array<{
    keyword: string
    searchVolume: number
    competition: number
    cpc: number
    difficulty: number
    intent: 'commercial' | 'informational' | 'navigational' | 'transactional'
  }>
  
  // Seasonal trends
  seasonalTrends: Array<{
    keyword: string
    monthlyData: Array<{
      month: string
      volume: number
    }>
    seasonality: 'high' | 'medium' | 'low'
  }>
  
  // PPC metrics
  ppcMetrics: {
    avgCpc: number
    competitionLevel: 'low' | 'medium' | 'high'
    suggestedBid: number
    qualityScore: number
  }
  
  // Search intent breakdown
  searchIntent: {
    commercial: number
    informational: number
    navigational: number
    transactional: number
  }
  
  // Competitor keywords
  competitorKeywords: Array<{
    competitor: string
    keywords: string[]
    overlap: number
  }>
  
  createdAt: string
  updatedAt: string
}

export interface PPCStrategy {
  id: string
  productId: string
  
  // Launch costs
  estimatedLaunchCost: number
  
  // Bid recommendations
  suggestedBidRanges: {
    exact: { min: number; max: number }
    phrase: { min: number; max: number }
    broad: { min: number; max: number }
  }
  
  // Competitor analysis
  competitorAdAnalysis: Array<{
    competitor: string
    adCopy: string
    estimatedBudget: number
    keywordTargets: string[]
    adPosition: number
    impressionShare: number
  }>
  
  // Campaign structure
  campaignStructure: {
    campaigns: Array<{
      name: string
      type: 'exact' | 'phrase' | 'broad'
      keywords: string[]
      suggestedBid: number
      dailyBudget: number
      targetAcos: number
    }>
    adGroups: Array<{
      name: string
      keywords: string[]
      adCopy: string
      negativeKeywords: string[]
    }>
  }
  
  // Performance predictions
  expectedACoS: number
  breakEvenACoS: number
  
  // Launch phases
  launchPhases: Array<{
    phase: number
    name: string
    duration: string
    budget: number
    objectives: string[]
    keyMetrics: string[]
    expectedResults: {
      impressions: number
      clicks: number
      conversions: number
      acos: number
      sales: number
    }
  }>
  
  // Budget allocation
  budgetAllocation: {
    research: number
    launch: number
    scale: number
    total: number
  }
  
  // Targeting strategy
  targetingStrategy: {
    keywords: string[]
    products: string[]
    categories: string[]
    audiences: string[]
    placements: string[]
  }
  
  createdAt: string
  updatedAt: string
}

export interface InventoryAnalysis {
  id: string
  productId: string
  
  // Optimal order quantity
  optimalOrderQuantity: number
  
  // Seasonal demand patterns
  seasonalDemand: Array<{
    month: string
    demandMultiplier: number
    stockoutRisk: 'high' | 'medium' | 'low'
    recommendedInventory: number
  }>
  
  // Supplier analysis
  supplierAnalysis: Array<{
    supplier: string
    rating: number
    moq: number
    unitCost: number
    leadTime: number
    qualityScore: number
    riskFactors: string[]
    paymentTerms: string
    shippingCosts: number
  }>
  
  // Cash flow projections
  cashFlowProjections: Array<{
    month: string
    inventory: number
    sales: number
    cashOutflow: number
    cashInflow: number
    netCashFlow: number
  }>
  
  // Risk assessment
  riskAssessment: {
    supplierRisk: 'low' | 'medium' | 'high'
    demandRisk: 'low' | 'medium' | 'high'
    seasonalityRisk: 'low' | 'medium' | 'high'
    competitionRisk: 'low' | 'medium' | 'high'
    overallRisk: 'low' | 'medium' | 'high'
  }
  
  // Lead times
  leadTimes: {
    manufacturing: number
    shipping: number
    customsProcessing: number
    amazonReceiving: number
    total: number
  }
  
  // Quality requirements
  qualityRequirements: {
    standards: string[]
    certifications: string[]
    testingRequirements: string[]
    complianceChecks: string[]
  }
  
  // Cost breakdown
  costBreakdown: {
    unitCost: number
    shipping: number
    duties: number
    fbaFees: number
    totalCost: number
  }
  
  // MOQ analysis
  moqAnalysis: {
    supplierMoq: number
    recommendedOrder: number
    riskAssessment: string
    cashRequirement: number
    timeToBreakEven: number
  }
  
  createdAt: string
  updatedAt: string
}

export interface DemandAnalysis {
  id: string
  productId: string
  
  // Market size
  marketSize: {
    tam: number
    sam: number
    som: number
    currency: string
  }
  
  // Growth trends
  growthTrends: {
    historical: Array<{ year: string; growth: number }>
    projected: Array<{ year: string; growth: number }>
    cagr: number
  }
  
  // Geographic demand
  geographicDemand: Array<{
    region: string
    demandShare: number
    growthRate: number
    competitionLevel: 'low' | 'medium' | 'high'
  }>
  
  // Customer behavior
  customerBehavior: {
    demographics: {
      ageGroups: Array<{ range: string; percentage: number }>
      gender: { male: number; female: number; other: number }
      income: Array<{ range: string; percentage: number }>
    }
    purchasePatterns: {
      averageOrderValue: number
      purchaseFrequency: number
      seasonalityFactors: Array<{
        season: string
        multiplier: number
      }>
    }
    preferences: {
      priceRange: { min: number; max: number }
      features: string[]
      brands: string[]
    }
  }
  
  // Seasonal patterns
  seasonalPatterns: Array<{
    month: string
    demandIndex: number
    competitionLevel: number
    priceElasticity: number
  }>
  
  // Demand drivers
  demandDrivers: Array<{
    driver: string
    impact: 'low' | 'medium' | 'high'
    description: string
  }>
  
  // Market segmentation
  marketSegmentation: Array<{
    segment: string
    size: number
    characteristics: string[]
    opportunity: 'low' | 'medium' | 'high'
  }>
  
  // Price elasticity
  priceElasticity: Array<{
    pricePoint: number
    demandChange: number
    elasticity: number
  }>
  
  // Forecasting
  forecasting: {
    method: string
    confidence: number
    projections: Array<{
      period: string
      demand: number
      confidence: number
    }>
  }
  
  createdAt: string
  updatedAt: string
}

export interface CompetitorAnalysis {
  id: string
  productId: string
  
  // Top competitors
  topCompetitors: Array<{
    name: string
    asin: string
    marketShare: number
    rating: number
    reviewCount: number
    price: number
    bsr: number
    features: string[]
    strengths: string[]
    weaknesses: string[]
    priceHistory: Array<{
      date: string
      price: number
    }>
  }>
  
  // Price analysis
  priceAnalysis: {
    averagePrice: number
    priceRange: { min: number; max: number }
    priceDistribution: Array<{
      range: string
      count: number
    }>
    recommendedPricing: number
    priceElasticity: number
  }
  
  // Market share data
  marketShareData: Array<{
    competitor: string
    marketShare: number
    trend: 'growing' | 'stable' | 'declining'
  }>
  
  // Competitive advantages
  competitiveAdvantages: Array<{
    advantage: string
    description: string
    exploitability: 'low' | 'medium' | 'high'
  }>
  
  // Threat level
  threatLevel: 'low' | 'medium' | 'high'
  
  // Entry barriers
  entryBarriers: Array<{
    barrier: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }>
  
  // Competitor strategies
  competitorStrategies: Array<{
    competitor: string
    strategy: string
    effectiveness: 'low' | 'medium' | 'high'
  }>
  
  // SWOT analysis
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  
  // Benchmarking
  benchmarking: Array<{
    metric: string
    ourValue: number
    competitorAverage: number
    bestInClass: number
    performance: 'above' | 'at' | 'below'
  }>
  
  createdAt: string
  updatedAt: string
}

export interface FinancialModel {
  id: string
  productId: string
  
  // ROI calculations
  roiCalculations: {
    initialInvestment: number
    monthlyRevenue: number
    monthlyProfit: number
    paybackPeriod: number
    roi: number
    irr: number
    npv: number
  }
  
  // Break-even analysis
  breakEvenAnalysis: {
    fixedCosts: number
    variableCosts: number
    unitPrice: number
    contributionMargin: number
    breakEvenUnits: number
    breakEvenRevenue: number
    monthsToBreakEven: number
  }
  
  // Cash flow projections
  cashFlowProjections: Array<{
    month: string
    revenue: number
    cogs: number
    grossProfit: number
    expenses: number
    netProfit: number
    cumulativeCashFlow: number
  }>
  
  // Risk metrics
  riskMetrics: {
    volatility: number
    maxDrawdown: number
    sharpeRatio: number
    worstCaseScenario: number
    probabilityOfLoss: number
  }
  
  // Scenario analysis
  scenarioAnalysis: {
    best: { revenue: number; profit: number; roi: number }
    likely: { revenue: number; profit: number; roi: number }
    worst: { revenue: number; profit: number; roi: number }
  }
  
  // Profitability model
  profitabilityModel: {
    grossMargin: number
    netMargin: number
    contributionMargin: number
    operatingMargin: number
    ebitdaMargin: number
  }
  
  // Investment requirements
  investmentRequirements: {
    inventory: number
    marketing: number
    operations: number
    contingency: number
    total: number
  }
  
  // FBA fee analysis
  fbaFeeAnalysis: {
    referralFee: number
    fulfillmentFee: number
    storageFee: number
    longTermStorageFee: number
    totalFbaFees: number
    feePercentage: number
  }
  
  // Tax implications
  taxImplications: {
    salesTax: number
    incomeTax: number
    importDuties: number
    totalTaxes: number
    effectiveTaxRate: number
  }
  
  createdAt: string
  updatedAt: string
}

// API Response Wrappers
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  requestId?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Error Types
export interface APIError {
  code: string
  message: string
  details?: Record<string, unknown> | string | null
  timestamp: string
  requestId?: string
}