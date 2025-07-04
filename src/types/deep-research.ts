// Deep Research Types for CommerceCrafted
// IdeaBrowser-style comprehensive Amazon product analysis

// Keyword Analysis Types
export interface KeywordMetrics {
  keyword: string
  searchVolume: number
  competition: number
  cpc: number
  difficulty: number
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional'
  ranking?: number
}

export interface KeywordAnalysis {
  primaryKeywords: KeywordMetrics[]
  longTailKeywords: KeywordMetrics[]
  seasonalTrends: {
    keyword: string
    monthlyData: { month: string; volume: number }[]
    seasonality: 'high' | 'medium' | 'low'
  }[]
  ppcMetrics: {
    avgCpc: number
    competitionLevel: 'high' | 'medium' | 'low'
    suggestedBid: number
    qualityScore: number
  }
  searchIntent: {
    commercial: number
    informational: number
    navigational: number
    transactional: number
  }
  competitorKeywords: {
    competitor: string
    keywords: string[]
    overlap: number
  }[]
}

// PPC Strategy Types
export interface PPCStrategy {
  estimatedLaunchCost: number
  suggestedBidRanges: {
    exact: { min: number; max: number }
    phrase: { min: number; max: number }
    broad: { min: number; max: number }
  }
  competitorAdAnalysis: {
    competitor: string
    adCopy: string
    estimatedBudget: number
    keywordTargets: string[]
  }[]
  campaignStructure: {
    campaigns: {
      name: string
      type: 'exact' | 'phrase' | 'broad' | 'auto'
      keywords: string[]
      suggestedBid: number
      dailyBudget: number
    }[]
    adGroups: {
      name: string
      keywords: string[]
      adCopy: string
    }[]
  }
  expectedACoS: number
  breakEvenACoS: number
  launchPhases: {
    phase: number
    name: string
    duration: string
    budget: number
    objectives: string[]
    keyMetrics: string[]
  }[]
  budgetAllocation: {
    research: number
    launch: number
    scale: number
    total: number
  }
  targetingStrategy: {
    keywords: string[]
    products: string[]
    categories: string[]
    audiences: string[]
  }
}

// Inventory Analysis Types
export interface InventoryAnalysis {
  optimalOrderQuantity: number
  seasonalDemand: {
    month: string
    demandMultiplier: number
    stockoutRisk: 'high' | 'medium' | 'low'
  }[]
  supplierAnalysis: {
    supplier: string
    rating: number
    moq: number
    unitCost: number
    leadTime: number
    qualityScore: number
    riskFactors: string[]
  }[]
  cashFlowProjections: {
    month: string
    inventory: number
    sales: number
    cashOutflow: number
    cashInflow: number
    netCashFlow: number
  }[]
  riskAssessment: {
    supplierRisk: 'high' | 'medium' | 'low'
    demandRisk: 'high' | 'medium' | 'low'
    seasonalityRisk: 'high' | 'medium' | 'low'
    competitionRisk: 'high' | 'medium' | 'low'
    overallRisk: 'high' | 'medium' | 'low'
  }
  leadTimes: {
    manufacturing: number
    shipping: number
    customsProcessing: number
    total: number
  }
  qualityRequirements: {
    standards: string[]
    certifications: string[]
    testingRequirements: string[]
    complianceChecks: string[]
  }
  costBreakdown: {
    unitCost: number
    shipping: number
    duties: number
    fbaFees: number
    totalCost: number
  }
  moqAnalysis: {
    supplierMoq: number
    recommendedOrder: number
    riskAssessment: string
    cashRequirement: number
  }
}

// Demand Analysis Types
export interface DemandAnalysis {
  marketSize: {
    tam: number // Total Addressable Market
    sam: number // Serviceable Addressable Market
    som: number // Serviceable Obtainable Market
    currency: string
  }
  growthTrends: {
    historical: { year: string; growth: number }[]
    projected: { year: string; growth: number }[]
    cagr: number
  }
  geographicDemand: {
    region: string
    demandShare: number
    growthRate: number
    competitionLevel: 'high' | 'medium' | 'low'
  }[]
  customerBehavior: {
    demographics: {
      ageGroups: { range: string; percentage: number }[]
      gender: { male: number; female: number; other: number }
      income: { range: string; percentage: number }[]
    }
    purchasePatterns: {
      averageOrderValue: number
      purchaseFrequency: number
      seasonalityFactors: { season: string; multiplier: number }[]
    }
    preferences: {
      priceRange: { min: number; max: number }
      features: string[]
      brands: string[]
    }
  }
  seasonalPatterns: {
    month: string
    demandIndex: number
    competitionLevel: number
    priceElasticity: number
  }[]
  demandDrivers: {
    driver: string
    impact: 'high' | 'medium' | 'low'
    description: string
  }[]
  marketSegmentation: {
    segment: string
    size: number
    characteristics: string[]
    opportunity: 'high' | 'medium' | 'low'
  }[]
  priceElasticity: {
    pricePoint: number
    demandChange: number
    elasticity: number
  }[]
  forecasting: {
    method: string
    confidence: number
    projections: { period: string; demand: number }[]
  }
}

// Competitor Analysis Types
export interface CompetitorAnalysis {
  topCompetitors: {
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
  }[]
  priceAnalysis: {
    averagePrice: number
    priceRange: { min: number; max: number }
    priceDistribution: { range: string; count: number }[]
    recommendedPricing: number
  }
  marketShareData: {
    competitor: string
    marketShare: number
    trend: 'growing' | 'stable' | 'declining'
  }[]
  competitiveAdvantages: {
    advantage: string
    description: string
    exploitability: 'high' | 'medium' | 'low'
  }[]
  threatLevel: 'high' | 'medium' | 'low'
  entryBarriers: {
    barrier: string
    severity: 'high' | 'medium' | 'low'
    description: string
  }[]
  competitorStrategies: {
    competitor: string
    strategy: string
    effectiveness: 'high' | 'medium' | 'low'
  }[]
  swotAnalysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  benchmarking: {
    metric: string
    ourValue: number
    competitorAverage: number
    bestInClass: number
    performance: 'above' | 'at' | 'below'
  }[]
}

// Financial Model Types
export interface FinancialModel {
  roiCalculations: {
    initialInvestment: number
    monthlyRevenue: number
    monthlyProfit: number
    paybackPeriod: number
    roi: number
    irr: number
  }
  breakEvenAnalysis: {
    fixedCosts: number
    variableCosts: number
    unitPrice: number
    contributionMargin: number
    breakEvenUnits: number
    breakEvenRevenue: number
    monthsToBreakEven: number
  }
  cashFlowProjections: {
    month: string
    revenue: number
    cogs: number
    grossProfit: number
    expenses: number
    netProfit: number
    cumulativeCashFlow: number
  }[]
  riskMetrics: {
    volatility: number
    maxDrawdown: number
    sharpeRatio: number
    worstCaseScenario: number
    probabilityOfLoss: number
  }
  scenarioAnalysis: {
    best: { revenue: number; profit: number; roi: number }
    likely: { revenue: number; profit: number; roi: number }
    worst: { revenue: number; profit: number; roi: number }
  }
  profitabilityModel: {
    grossMargin: number
    netMargin: number
    contributionMargin: number
    operatingMargin: number
    ebitdaMargin: number
  }
  investmentRequirements: {
    inventory: number
    marketing: number
    operations: number
    contingency: number
    total: number
  }
  fbaFeeAnalysis: {
    referralFee: number
    fulfillmentFee: number
    storageFee: number
    longTermStorageFee: number
    totalFbaFees: number
    feePercentage: number
  }
  taxImplications: {
    salesTax: number
    incomeTax: number
    importDuties: number
    totalTaxes: number
    effectiveTaxRate: number
  }
}

// AI Research Session Types
export interface AIResearchSession {
  id: string
  userId: string
  productId?: string
  sessionType: 'product_validation' | 'market_research' | 'competitor_analysis' | 'launch_strategy'
  conversation: {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }[]
  insights: {
    category: string
    insight: string
    confidence: number
    actionable: boolean
  }[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    action: string
    rationale: string
    timeline: string
  }[]
  followUpActions: {
    action: string
    description: string
    completed: boolean
  }[]
  sessionStatus: 'active' | 'completed' | 'archived'
  tokensUsed: number
  createdAt: Date
  updatedAt: Date
}

// Trend Analysis Types
export interface TrendAnalysis {
  id: string
  trendName: string
  category: string
  volume: string
  growthRate: number
  description: string
  opportunities: {
    opportunity: string
    potential: 'high' | 'medium' | 'low'
    timeframe: string
  }[]
  relatedProducts: {
    asin: string
    title: string
    relevance: number
    opportunity: 'high' | 'medium' | 'low'
  }[]
  marketData: {
    searchVolume: number
    competition: number
    seasonality: { month: string; index: number }[]
    geographicData: { region: string; interest: number }[]
  }
  riskFactors: {
    risk: string
    severity: 'high' | 'medium' | 'low'
    mitigation: string
  }[]
  timeframe: 'short' | 'medium' | 'long'
  confidence: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Comprehensive Deep Analysis (combining all analyses)
export interface DeepAnalysis {
  opportunityScore: number
  marketSize: DemandAnalysis['marketSize']
  competitionLevel: CompetitorAnalysis['threatLevel']
  demandTrends: DemandAnalysis['growthTrends']
  keywordOpportunities: KeywordAnalysis['primaryKeywords']
  ppcStrategy: PPCStrategy
  inventoryRecommendations: InventoryAnalysis
  riskAssessment: InventoryAnalysis['riskAssessment']
  launchStrategy: PPCStrategy['launchPhases']
  financialProjections: FinancialModel['cashFlowProjections']
}