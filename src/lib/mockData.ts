// Mock data service for CommerceCrafted
// This provides realistic sample data while backend integration is being completed

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
import { DeepResearchService } from './deep-research-service'

export interface MockProductAnalysis {
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

export interface MockProduct {
  id: string
  asin: string
  title: string
  brand: string
  category: string
  price: number
  rating: number
  reviewCount: number
  imageUrls: string[]
  description: string
  features: string[]
  dimensions: string
  weight: string
  availability: string
  createdAt: string
  updatedAt: string
  analysis?: MockProductAnalysis
  // New deep research fields
  deepAnalysis?: DeepAnalysis
  keywordAnalysis?: KeywordAnalysis
  ppcStrategy?: PPCStrategy
  inventoryAnalysis?: InventoryAnalysis
  demandAnalysis?: DemandAnalysis
  competitorAnalysis?: CompetitorAnalysis
  financialModel?: FinancialModel
}

export interface MockDailyFeature {
  id: string
  product: MockProduct
  reason: string
  date: string
}

// Mock products with realistic data
const mockProducts: MockProduct[] = [
  {
    id: "1",
    asin: "B08MVBRNKV",
    title: "Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones with Mic",
    brand: "Sony",
    category: "Electronics",
    price: 349.99,
    rating: 4.4,
    reviewCount: 85432,
    imageUrls: [
      "https://images-na.ssl-images-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg"
    ],
    description: "Industry-leading noise canceling with Dual Noise Sensor technology. Next-level music with Edge-AI, co-developed with Sony Music Studios Tokyo.",
    features: [
      "Industry-leading noise canceling technology",
      "30-hour battery life with quick charge",
      "Touch sensor controls",
      "Speak-to-chat technology",
      "Wearing detection"
    ],
    dimensions: "7.27 x 9.94 x 3.03 inches",
    weight: "8.96 ounces",
    availability: "In Stock",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    analysis: {
      id: "analysis-1",
      opportunityScore: 8,
      demandScore: 9,
      competitionScore: 7,
      feasibilityScore: 6,
      financialAnalysis: {
        estimatedRevenue: 125000,
        profitMargin: 25,
        breakEvenUnits: 150,
        roi: 180
      },
      marketAnalysis: {
        marketSize: "$8.2B",
        growthRate: 12,
        seasonality: "High in Q4, steady demand year-round",
        trends: ["Wireless audio growth", "Noise cancellation demand", "Work-from-home boom"]
      },
      competitionAnalysis: {
        competitorCount: 45,
        averageRating: 4.3,
        priceRange: { min: 199, max: 450 },
        marketShare: "Moderate - Strong brand presence"
      },
      keywordAnalysis: {
        primaryKeywords: ["noise canceling headphones", "wireless headphones", "sony headphones"],
        searchVolume: 165000,
        difficulty: 85,
        suggestions: ["bluetooth headphones", "over ear headphones", "premium headphones"]
      },
      reviewAnalysis: {
        sentiment: 0.8,
        commonComplaints: ["Price point", "Comfort for extended wear", "App complexity"],
        opportunities: ["Battery life improvement", "Better carrying case", "More color options"]
      },
      supplyChainAnalysis: {
        complexity: "High",
        leadTime: "45-60 days",
        minimumOrder: 100,
        suppliers: 12
      },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z"
    }
  },
  {
    id: "2",
    asin: "B077JBQZPX",
    title: "Breville BES870XL Barista Express Espresso Machine",
    brand: "Breville",
    category: "Kitchen",
    price: 699.95,
    rating: 4.3,
    reviewCount: 15847,
    imageUrls: [
      "https://images-na.ssl-images-amazon.com/images/I/81FiE7gCqOL._AC_SL1500_.jpg"
    ],
    description: "The Barista Express allows you to grind, dose, tamp, extract, steam and pour all in one compact footprint.",
    features: [
      "Integrated precision conical burr grinder",
      "15 bar pressure pump",
      "Pre-infusion feature",
      "Precise espresso extraction",
      "Micro-foam milk texturing"
    ],
    dimensions: "12.5 x 13.1 x 15.7 inches",
    weight: "23 pounds",
    availability: "In Stock",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
    analysis: {
      id: "analysis-2",
      opportunityScore: 7,
      demandScore: 8,
      competitionScore: 6,
      feasibilityScore: 5,
      financialAnalysis: {
        estimatedRevenue: 89000,
        profitMargin: 35,
        breakEvenUnits: 45,
        roi: 220
      },
      marketAnalysis: {
        marketSize: "$1.8B",
        growthRate: 8,
        seasonality: "Peak in Q4 and Q1",
        trends: ["Home coffee culture", "Premium appliance demand", "Barista-quality at home"]
      },
      competitionAnalysis: {
        competitorCount: 25,
        averageRating: 4.1,
        priceRange: { min: 299, max: 1200 },
        marketShare: "High - Premium segment leader"
      },
      keywordAnalysis: {
        primaryKeywords: ["espresso machine", "coffee machine", "barista express"],
        searchVolume: 45000,
        difficulty: 65,
        suggestions: ["home espresso machine", "coffee maker", "automatic espresso"]
      },
      reviewAnalysis: {
        sentiment: 0.75,
        commonComplaints: ["Learning curve", "Cleaning maintenance", "Size/counter space"],
        opportunities: ["Easier cleaning system", "Beginner-friendly presets", "Compact design"]
      },
      supplyChainAnalysis: {
        complexity: "Medium",
        leadTime: "30-45 days",
        minimumOrder: 50,
        suppliers: 8
      },
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-18T10:00:00Z"
    }
  },
  {
    id: "3",
    asin: "B01AKRSDTU",
    title: "Gaiam Essentials Thick Yoga Mat Fitness & Exercise Mat",
    brand: "Gaiam",
    category: "Sports",
    price: 25.98,
    rating: 4.5,
    reviewCount: 58921,
    imageUrls: [
      "https://images-na.ssl-images-amazon.com/images/I/81JjBW7KJSL._AC_SL1500_.jpg"
    ],
    description: "Thick yoga mat provides the most comfortable yoga experience. Superior cushioning for knees, hips and elbows on hard floors.",
    features: [
      "Extra thick 2/3 inch (10mm) mat",
      "Superior cushioning",
      "Non-slip textured surface",
      "Lightweight and easy to carry",
      "Free from latex, phthalates and heavy metals"
    ],
    dimensions: "68 x 24 x 0.4 inches",
    weight: "2.2 pounds",
    availability: "In Stock",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    analysis: {
      id: "analysis-3",
      opportunityScore: 9,
      demandScore: 8,
      competitionScore: 8,
      feasibilityScore: 9,
      financialAnalysis: {
        estimatedRevenue: 45000,
        profitMargin: 55,
        breakEvenUnits: 75,
        roi: 280
      },
      marketAnalysis: {
        marketSize: "$400M",
        growthRate: 15,
        seasonality: "Peak in Q1 (New Year), steady demand",
        trends: ["Home fitness boom", "Wellness focus", "Yoga popularity growth"]
      },
      competitionAnalysis: {
        competitorCount: 180,
        averageRating: 4.2,
        priceRange: { min: 15, max: 80 },
        marketShare: "Low - Highly fragmented market"
      },
      keywordAnalysis: {
        primaryKeywords: ["yoga mat", "exercise mat", "fitness mat"],
        searchVolume: 125000,
        difficulty: 45,
        suggestions: ["thick yoga mat", "non slip yoga mat", "yoga mat for beginners"]
      },
      reviewAnalysis: {
        sentiment: 0.85,
        commonComplaints: ["Durability over time", "Chemical smell initially", "Slippery when wet"],
        opportunities: ["Eco-friendly materials", "Better grip texture", "Longer warranty"]
      },
      supplyChainAnalysis: {
        complexity: "Low",
        leadTime: "15-30 days",
        minimumOrder: 200,
        suppliers: 25
      },
      createdAt: "2024-01-05T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    }
  },
  {
    id: "4",
    asin: "B08N5WRWNW",
    title: "ZAGG InvisibleShield Glass Elite Screen Protector for iPhone 13",
    brand: "ZAGG",
    category: "Electronics",
    price: 44.99,
    rating: 4.2,
    reviewCount: 12456,
    imageUrls: [
      "https://images-na.ssl-images-amazon.com/images/I/71KQhX1BFML._AC_SL1500_.jpg"
    ],
    description: "The strongest glass screen protection available. Military-grade protection with anti-microbial properties.",
    features: [
      "5X stronger than traditional glass",
      "Anti-microbial properties",
      "Easy installation",
      "Case-friendly design",
      "Limited lifetime warranty"
    ],
    dimensions: "6.1 x 3.1 x 0.01 inches",
    weight: "0.3 ounces",
    availability: "In Stock",
    createdAt: "2024-01-08T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
    analysis: {
      id: "analysis-4",
      opportunityScore: 6,
      demandScore: 7,
      competitionScore: 4,
      feasibilityScore: 7,
      financialAnalysis: {
        estimatedRevenue: 35000,
        profitMargin: 45,
        breakEvenUnits: 120,
        roi: 150
      },
      marketAnalysis: {
        marketSize: "$3.2B",
        growthRate: 5,
        seasonality: "Spikes with new phone releases",
        trends: ["Premium protection demand", "Screen durability focus", "Anti-microbial features"]
      },
      competitionAnalysis: {
        competitorCount: 250,
        averageRating: 4.0,
        priceRange: { min: 8, max: 60 },
        marketShare: "Very Low - Extremely competitive"
      },
      keywordAnalysis: {
        primaryKeywords: ["iphone screen protector", "glass screen protector", "zagg screen protector"],
        searchVolume: 89000,
        difficulty: 95,
        suggestions: ["iphone 13 screen protector", "tempered glass", "invisible shield"]
      },
      reviewAnalysis: {
        sentiment: 0.7,
        commonComplaints: ["Installation difficulty", "Price point", "Touch sensitivity"],
        opportunities: ["Easier installation kit", "Better value proposition", "Enhanced touch response"]
      },
      supplyChainAnalysis: {
        complexity: "Medium",
        leadTime: "20-35 days",
        minimumOrder: 500,
        suppliers: 15
      },
      createdAt: "2024-01-08T10:00:00Z",
      updatedAt: "2024-01-12T10:00:00Z"
    }
  },
  {
    id: "5",
    asin: "B085HZ5TCR",
    title: "Echo Dot (4th Gen) | Smart speaker with Alexa",
    brand: "Amazon",
    category: "Electronics",
    price: 49.99,
    rating: 4.7,
    reviewCount: 234567,
    imageUrls: [
      "https://images-na.ssl-images-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg"
    ],
    description: "Our most popular smart speaker with Alexa. Crisp vocals and balanced bass for full sound.",
    features: [
      "Improved speaker quality",
      "Voice control your music",
      "Built-in hub for smart home",
      "Alexa is always learning",
      "Designed to protect your privacy"
    ],
    dimensions: "3.9 x 3.9 x 3.5 inches",
    weight: "12.8 ounces",
    availability: "In Stock",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
    analysis: {
      id: "analysis-5",
      opportunityScore: 5,
      demandScore: 9,
      competitionScore: 2,
      feasibilityScore: 3,
      financialAnalysis: {
        estimatedRevenue: 25000,
        profitMargin: 15,
        breakEvenUnits: 300,
        roi: 85
      },
      marketAnalysis: {
        marketSize: "$4.1B",
        growthRate: 20,
        seasonality: "Extremely high in Q4",
        trends: ["Smart home adoption", "Voice assistant integration", "IoT device growth"]
      },
      competitionAnalysis: {
        competitorCount: 15,
        averageRating: 4.4,
        priceRange: { min: 25, max: 200 },
        marketShare: "Very High - Market dominated by Amazon"
      },
      keywordAnalysis: {
        primaryKeywords: ["echo dot", "alexa speaker", "smart speaker"],
        searchVolume: 245000,
        difficulty: 99,
        suggestions: ["amazon echo", "voice assistant", "smart home device"]
      },
      reviewAnalysis: {
        sentiment: 0.9,
        commonComplaints: ["Privacy concerns", "Limited without subscription", "Occasional misheard commands"],
        opportunities: ["Enhanced privacy features", "Better offline capabilities", "Improved voice recognition"]
      },
      supplyChainAnalysis: {
        complexity: "Very High",
        leadTime: "60-90 days",
        minimumOrder: 1000,
        suppliers: 5
      },
      createdAt: "2024-01-12T10:00:00Z",
      updatedAt: "2024-01-16T10:00:00Z"
    }
  }
]

// Mock API service
export const mockAPI = {
  // Get daily featured product
  getDailyFeature: async (): Promise<MockDailyFeature> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      id: "daily-1",
      product: mockProducts[2], // Yoga mat - highest opportunity score
      reason: "This yoga mat represents an excellent opportunity due to growing home fitness trends, low competition barriers, and strong profit margins. The wellness industry continues to expand, making this a strategic entry point.",
      date: new Date().toISOString().split('T')[0]
    }
  },

  // Get trending products (highest opportunity scores)
  getTrendingProducts: async (): Promise<MockProduct[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return mockProducts
      .filter(p => p.analysis && p.analysis.opportunityScore >= 7)
      .sort((a, b) => (b.analysis?.opportunityScore || 0) - (a.analysis?.opportunityScore || 0))
      .slice(0, 3)
  },

  // Search products with filters
  searchProducts: async (params: {
    query?: string
    category?: string
    minScore?: number
    maxPrice?: number
    sortBy?: 'opportunity' | 'demand' | 'recent' | 'price'
    limit?: number
    offset?: number
  }): Promise<{products: MockProduct[], total: number}> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    let filtered = [...mockProducts]

    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.asin.toLowerCase().includes(query)
      )
    }

    if (params.category && params.category !== 'all') {
      filtered = filtered.filter(p => p.category === params.category)
    }

    if (params.minScore !== undefined) {
      filtered = filtered.filter(p => (p.analysis?.opportunityScore || 0) >= params.minScore!)
    }

    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= params.maxPrice!)
    }

    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'opportunity':
          filtered.sort((a, b) => (b.analysis?.opportunityScore || 0) - (a.analysis?.opportunityScore || 0))
          break
        case 'demand':
          filtered.sort((a, b) => (b.analysis?.demandScore || 0) - (a.analysis?.demandScore || 0))
          break
        case 'recent':
          filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          break
        case 'price':
          filtered.sort((a, b) => a.price - b.price)
          break
      }
    }

    const total = filtered.length
    const offset = params.offset || 0
    const limit = params.limit || 10
    const products = filtered.slice(offset, offset + limit)

    return { products, total }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<MockProduct | null> => {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    return mockProducts.find(p => p.id === id) || null
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return [...new Set(mockProducts.map(p => p.category))]
  },

  // Analytics data
  getAnalytics: async () => {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    return {
      totalProducts: mockProducts.length,
      averageOpportunityScore: mockProducts.reduce((acc, p) => acc + (p.analysis?.opportunityScore || 0), 0) / mockProducts.length,
      topCategories: [
        { category: 'Electronics', count: 3, avgScore: 6.3 },
        { category: 'Sports', count: 1, avgScore: 9.0 },
        { category: 'Kitchen', count: 1, avgScore: 7.0 }
      ],
      monthlyTrends: [
        { month: 'Dec', products: 2, avgScore: 7.5 },
        { month: 'Jan', products: 3, avgScore: 6.8 }
      ]
    }
  },

  // Deep Research API Methods
  
  // Generate comprehensive deep analysis for a product
  getDeepAnalysis: async (productId: string): Promise<DeepAnalysis | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate AI processing time
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return null

    // Generate deep analysis using our service
    const deepAnalysis = await DeepResearchService.generateDeepAnalysis({
      title: product.title,
      price: product.price,
      category: product.category,
      asin: product.asin,
      estimatedMonthlySales: 75 // Default estimate
    })

    // Cache the result on the product
    product.deepAnalysis = deepAnalysis
    
    return deepAnalysis
  },

  // Get keyword analysis for a product
  getKeywordAnalysis: async (productId: string): Promise<KeywordAnalysis | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const product = mockProducts.find(p => p.id === productId)
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
  },

  // Get PPC strategy for a product
  getPPCStrategy: async (productId: string): Promise<PPCStrategy | null> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return null

    if (!product.ppcStrategy) {
      product.ppcStrategy = await DeepResearchService.calculatePPCStrategy({
        title: product.title,
        price: product.price,
        category: product.category
      })
    }

    return product.ppcStrategy
  },

  // Get inventory analysis for a product
  getInventoryAnalysis: async (productId: string): Promise<InventoryAnalysis | null> => {
    await new Promise(resolve => setTimeout(resolve, 350))
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return null

    if (!product.inventoryAnalysis) {
      product.inventoryAnalysis = await DeepResearchService.analyzeInventory({
        price: product.price,
        category: product.category,
        seasonality: 'medium'
      })
    }

    return product.inventoryAnalysis
  },

  // Get demand analysis for a product
  getDemandAnalysis: async (productId: string): Promise<DemandAnalysis | null> => {
    await new Promise(resolve => setTimeout(resolve, 450))
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return null

    if (!product.demandAnalysis) {
      product.demandAnalysis = await DeepResearchService.analyzeDemand({
        category: product.category,
        price: product.price,
        title: product.title
      })
    }

    return product.demandAnalysis
  },

  // Get competitor analysis for a product
  getCompetitorAnalysis: async (productId: string): Promise<CompetitorAnalysis | null> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return null

    if (!product.competitorAnalysis) {
      product.competitorAnalysis = await DeepResearchService.analyzeCompetitors({
        category: product.category,
        price: product.price,
        asin: product.asin
      })
    }

    return product.competitorAnalysis
  },

  // Get financial model for a product
  getFinancialModel: async (productId: string): Promise<FinancialModel | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return null

    if (!product.financialModel) {
      product.financialModel = await DeepResearchService.createFinancialModel({
        price: product.price,
        estimatedMonthlySales: 75,
        category: product.category
      })
    }

    return product.financialModel
  },

  // Get trend analysis
  getTrendAnalysis: async (): Promise<TrendAnalysis[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return [
      {
        id: "trend_1",
        trendName: "Wireless Audio Devices",
        category: "Electronics",
        volume: "2.1M",
        growthRate: 234,
        description: "Explosive growth in wireless audio market driven by mobile adoption",
        opportunities: [
          { opportunity: "Premium wireless earbuds", potential: 'high', timeframe: "6-12 months" },
          { opportunity: "Gaming headsets", potential: 'medium', timeframe: "3-6 months" }
        ],
        relatedProducts: [
          { asin: "B08MVBRNKV", title: "Sony WH-1000XM4", relevance: 95, opportunity: 'high' }
        ],
        marketData: {
          searchVolume: 2100000,
          competition: 75,
          seasonality: [
            { month: "Jan", index: 85 },
            { month: "Feb", index: 90 },
            { month: "Mar", index: 95 },
            { month: "Apr", index: 100 },
            { month: "May", index: 105 },
            { month: "Jun", index: 110 },
            { month: "Jul", index: 115 },
            { month: "Aug", index: 120 },
            { month: "Sep", index: 125 },
            { month: "Oct", index: 130 },
            { month: "Nov", index: 140 },
            { month: "Dec", index: 150 }
          ],
          geographicData: [
            { region: "North America", interest: 45 },
            { region: "Europe", interest: 30 },
            { region: "Asia", interest: 25 }
          ]
        },
        riskFactors: [
          { risk: "Market saturation", severity: 'medium', mitigation: "Focus on premium segment" },
          { risk: "Price competition", severity: 'high', mitigation: "Differentiate through features" }
        ],
        timeframe: "long",
        confidence: 87,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "trend_2", 
        trendName: "Smart Home Security",
        category: "Home & Garden",
        volume: "890K",
        growthRate: 156,
        description: "Growing demand for connected home security solutions",
        opportunities: [
          { opportunity: "DIY security systems", potential: 'high', timeframe: "3-9 months" },
          { opportunity: "Smart doorbells", potential: 'medium', timeframe: "6-12 months" }
        ],
        relatedProducts: [],
        marketData: {
          searchVolume: 890000,
          competition: 65,
          seasonality: [
            { month: "Jan", index: 90 },
            { month: "Feb", index: 85 },
            { month: "Mar", index: 95 },
            { month: "Apr", index: 100 },
            { month: "May", index: 105 },
            { month: "Jun", index: 110 },
            { month: "Jul", index: 115 },
            { month: "Aug", index: 120 },
            { month: "Sep", index: 125 },
            { month: "Oct", index: 130 },
            { month: "Nov", index: 135 },
            { month: "Dec", index: 125 }
          ],
          geographicData: [
            { region: "North America", interest: 55 },
            { region: "Europe", interest: 25 },
            { region: "Asia", interest: 20 }
          ]
        },
        riskFactors: [
          { risk: "Privacy concerns", severity: 'high', mitigation: "Strong privacy policies" },
          { risk: "Technical complexity", severity: 'medium', mitigation: "User-friendly interfaces" }
        ],
        timeframe: "medium",
        confidence: 82,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },

  // Get market trends by category
  getTrendsByCategory: async (category: string): Promise<TrendAnalysis[]> => {
    const allTrends = await mockAPI.getTrendAnalysis()
    return allTrends.filter(trend => trend.category === category)
  }
}

export default mockAPI 