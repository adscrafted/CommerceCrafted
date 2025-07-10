export interface Product {
  id: string
  asin: string
  title: string
  category?: string
  subcategory?: string
  brand?: string
  price?: number
  bsr?: number
  rating?: number
  reviewCount?: number
  imageUrls?: string
  status: string
  createdAt: Date
  updatedAt: Date
  analysis?: ProductAnalysis
}

export interface ProductAnalysis {
  id: string
  productId: string
  opportunityScore: number
  competitionScore: number
  demandScore: number
  feasibilityScore: number
  timingScore: number
  financialAnalysis: {
    projectedMonthlyRevenue: number
    projectedMonthlySales: number
    estimatedProfitMargin: number
    breakEvenTimeMonths: number
    startupCosts: number
    roi: number
  }
  marketAnalysis: {
    marketSize: number
    growthRate: number
    seasonality: string
    trends: string[]
  }
  competitionAnalysis: {
    competitorCount: number
    topCompetitors: string[]
    averagePrice: number
    competitionLevel: string
  }
  keywordAnalysis: {
    primaryKeywords: string[]
    searchVolume: number
    difficulty: number
  }
  reviewAnalysis: {
    sentiment: string
    commonComplaints: string[]
    strengthPoints: string[]
  }
  supplyChainAnalysis: {
    manufacturingCost: number
    shippingCost: number
    totalCost: number
    suppliers: string[]
  }
  aiGeneratedContent?: string
  humanEditedContent?: string
  focusGraphData?: any
  analystId?: string
  createdAt: Date
  updatedAt: Date
}

export interface DailyFeature {
  id: string
  productId: string
  featuredDate: Date
  headline?: string
  summary?: string
  createdBy: string
  createdAt: Date
  product: Product
}

export interface Keyword {
  id: string
  keyword: string
  searchVolume?: number
  competitionScore?: number
  cpc?: number
  trendData?: {
    trend: string
    monthlyData: number[]
  }
  createdAt: Date
}

export interface Niche {
  id: string
  nicheName: string
  asins: string
  status: string
  addedDate: Date
  scheduledDate: Date
  category?: string
  totalProducts: number
  avgBsr?: number
  avgPrice?: number
  avgRating?: number
  totalReviews?: number
  totalMonthlyRevenue?: number
  opportunityScore?: number
  competitionLevel?: string
  processTime?: string
  analystAssigned?: string
  nicheKeywords?: string
  marketSize?: number
  aiAnalysis?: any
  createdBy: string
  createdAt: Date
  updatedAt: Date
}