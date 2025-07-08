// API Route: GET /api/products/trending
// Returns trending products with highest opportunity scores

import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types/api'

// Mock trending products data
const mockTrendingProducts: Product[] = [
  {
    id: 'B08MVBRNKV',
    asin: 'B08MVBRNKV',
    title: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Headphones',
    price: 348.00,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 54280,
    images: ['https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SX466_.jpg'],
    bsr: 3,
    monthlySales: 15000,
    isPrime: true,
    isAmazonChoice: true,
    isBestSeller: true,
    updatedAt: new Date().toISOString(),
    analysis: {
      id: 'analysis_1',
      productId: 'B08MVBRNKV',
      opportunityScore: 8.5,
      demandScore: 9.2,
      competitionScore: 7.8,
      feasibilityScore: 8.0,
      timingScore: 8.5,
      financialAnalysis: {
        estimatedMonthlySales: 150,
        estimatedRevenue: 52200,
        profitMargin: 35,
        breakEvenUnits: 75,
        roi: 185,
        costOfGoodsSold: 104.4,
        fbaFees: 52.2,
        marketingCosts: 34.8
      },
      marketAnalysis: {
        marketSize: "$2.3B",
        totalAddressableMarket: 2300000000,
        growthRate: 15.2,
        seasonality: "medium" as const,
        seasonalityMultipliers: {
          'Jan': 0.9, 'Feb': 0.95, 'Mar': 1.0, 'Apr': 1.05,
          'May': 1.1, 'Jun': 1.15, 'Jul': 1.2, 'Aug': 1.15,
          'Sep': 1.1, 'Oct': 1.3, 'Nov': 1.45, 'Dec': 1.35
        },
        trends: ["Growing remote work demand", "Premium audio quality focus"],
        marketMaturity: "growing" as const
      },
      competitionAnalysis: {
        competitorCount: 28,
        averageRating: 4.2,
        priceRange: { min: 199, max: 450 },
        marketShare: "Strong",
        competitionLevel: "medium" as const,
        barrierToEntry: "medium" as const,
        topCompetitors: []
      },
      keywordAnalysis: {
        primaryKeywords: ["noise canceling headphones", "wireless headphones"],
        searchVolume: 89000,
        difficulty: 72,
        cpc: 2.15,
        suggestions: ["sony headphones", "noise cancelling"],
        longTailKeywords: ["best noise canceling headphones 2024"]
      },
      reviewAnalysis: {
        sentiment: 0.82,
        positivePercentage: 82,
        negativePercentage: 12,
        neutralPercentage: 6,
        commonComplaints: ["Price point", "Battery life"],
        commonPraises: ["Excellent noise cancellation", "Sound quality"],
        opportunities: ["More color options", "Improved case"],
        reviewVelocity: 25,
        averageReviewLength: 165
      },
      supplyChainAnalysis: {
        complexity: "medium" as const,
        leadTime: "45-60 days",
        minimumOrder: 200,
        supplierCount: 12,
        manufacturingRegions: ["Japan", "China"],
        shippingCosts: 17.4,
        customsDuties: 6.96,
        qualityRequirements: ["CE marking", "FCC certification"]
      },
      riskFactors: ["Premium pricing pressure"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: "1.0"
    }
  },
  {
    id: 'B077JBQZPX',
    asin: 'B077JBQZPX',
    title: 'Breville Barista Express Espresso Machine',
    brand: 'Breville',
    category: 'Kitchen',
    subcategory: 'Coffee Makers',
    price: 699.95,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 18563,
    images: ['https://m.media-amazon.com/images/I/81rF3NNlF2L._AC_SX466_.jpg'],
    bsr: 5,
    monthlySales: 8500,
    isPrime: true,
    isAmazonChoice: false,
    isBestSeller: true,
    updatedAt: new Date().toISOString(),
    analysis: {
      id: 'analysis_2',
      productId: 'B077JBQZPX',
      opportunityScore: 8.2,
      demandScore: 8.8,
      competitionScore: 7.5,
      feasibilityScore: 7.8,
      timingScore: 8.0,
      financialAnalysis: {
        estimatedMonthlySales: 85,
        estimatedRevenue: 59495,
        profitMargin: 32,
        breakEvenUnits: 40,
        roi: 165,
        costOfGoodsSold: 209.99,
        fbaFees: 104.99,
        marketingCosts: 69.99
      },
      marketAnalysis: {
        marketSize: "$1.8B",
        totalAddressableMarket: 1800000000,
        growthRate: 12.5,
        seasonality: "high" as const,
        seasonalityMultipliers: {
          'Jan': 0.8, 'Feb': 0.85, 'Mar': 0.9, 'Apr': 0.95,
          'May': 1.0, 'Jun': 1.05, 'Jul': 1.1, 'Aug': 1.05,
          'Sep': 1.0, 'Oct': 1.2, 'Nov': 1.4, 'Dec': 1.5
        },
        trends: ["Home coffee culture growth", "Premium coffee trend"],
        marketMaturity: "mature" as const
      },
      competitionAnalysis: {
        competitorCount: 45,
        averageRating: 4.3,
        priceRange: { min: 299, max: 1200 },
        marketShare: "Medium",
        competitionLevel: "high" as const,
        barrierToEntry: "high" as const,
        topCompetitors: []
      },
      keywordAnalysis: {
        primaryKeywords: ["espresso machine", "coffee maker"],
        searchVolume: 125000,
        difficulty: 78,
        cpc: 2.85,
        suggestions: ["breville espresso", "home espresso machine"],
        longTailKeywords: ["best espresso machine for home"]
      },
      reviewAnalysis: {
        sentiment: 0.85,
        positivePercentage: 85,
        negativePercentage: 10,
        neutralPercentage: 5,
        commonComplaints: ["Price", "Learning curve"],
        commonPraises: ["Coffee quality", "Build quality"],
        opportunities: ["Better instructions", "More accessories"],
        reviewVelocity: 30,
        averageReviewLength: 180
      },
      supplyChainAnalysis: {
        complexity: "high" as const,
        leadTime: "60-90 days",
        minimumOrder: 100,
        supplierCount: 8,
        manufacturingRegions: ["China", "Italy"],
        shippingCosts: 35.0,
        customsDuties: 14.0,
        qualityRequirements: ["ETL certification", "NSF"]
      },
      riskFactors: ["High initial investment", "Complex supply chain"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: "1.0"
    }
  },
  {
    id: 'B01AKRSDTU',
    asin: 'B01AKRSDTU',
    title: 'Gaiam Yoga Mat - Premium Print Extra Thick',
    brand: 'Gaiam',
    category: 'Sports',
    subcategory: 'Yoga',
    price: 29.98,
    currency: 'USD',
    rating: 4.3,
    reviewCount: 42156,
    images: ['https://m.media-amazon.com/images/I/81F5+5JbKUL._AC_SX466_.jpg'],
    bsr: 8,
    monthlySales: 25000,
    isPrime: true,
    isAmazonChoice: true,
    isBestSeller: false,
    updatedAt: new Date().toISOString(),
    analysis: {
      id: 'analysis_3',
      productId: 'B01AKRSDTU',
      opportunityScore: 7.9,
      demandScore: 8.5,
      competitionScore: 6.8,
      feasibilityScore: 8.5,
      timingScore: 7.8,
      financialAnalysis: {
        estimatedMonthlySales: 250,
        estimatedRevenue: 7495,
        profitMargin: 45,
        breakEvenUnits: 150,
        roi: 225,
        costOfGoodsSold: 8.99,
        fbaFees: 4.50,
        marketingCosts: 2.99
      },
      marketAnalysis: {
        marketSize: "$850M",
        totalAddressableMarket: 850000000,
        growthRate: 18.5,
        seasonality: "medium" as const,
        seasonalityMultipliers: {
          'Jan': 1.2, 'Feb': 1.1, 'Mar': 1.0, 'Apr': 0.95,
          'May': 0.9, 'Jun': 0.85, 'Jul': 0.8, 'Aug': 0.85,
          'Sep': 0.9, 'Oct': 0.95, 'Nov': 1.1, 'Dec': 1.15
        },
        trends: ["Home fitness growth", "Wellness focus"],
        marketMaturity: "growing" as const
      },
      competitionAnalysis: {
        competitorCount: 120,
        averageRating: 4.2,
        priceRange: { min: 15, max: 80 },
        marketShare: "Fragmented",
        competitionLevel: "very high" as const,
        barrierToEntry: "low" as const,
        topCompetitors: []
      },
      keywordAnalysis: {
        primaryKeywords: ["yoga mat", "exercise mat"],
        searchVolume: 165000,
        difficulty: 82,
        cpc: 1.85,
        suggestions: ["thick yoga mat", "non slip yoga mat"],
        longTailKeywords: ["best yoga mat for beginners"]
      },
      reviewAnalysis: {
        sentiment: 0.78,
        positivePercentage: 78,
        negativePercentage: 15,
        neutralPercentage: 7,
        commonComplaints: ["Slippery", "Chemical smell"],
        commonPraises: ["Good thickness", "Nice designs"],
        opportunities: ["Better grip", "Eco-friendly materials"],
        reviewVelocity: 45,
        averageReviewLength: 120
      },
      supplyChainAnalysis: {
        complexity: "low" as const,
        leadTime: "30-45 days",
        minimumOrder: 500,
        supplierCount: 50,
        manufacturingRegions: ["China", "Taiwan"],
        shippingCosts: 2.50,
        customsDuties: 0.50,
        qualityRequirements: ["Non-toxic materials"]
      },
      riskFactors: ["High competition", "Low differentiation"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: "1.0"
    }
  },
  {
    id: 'B08N5WRWNW',
    asin: 'B08N5WRWNW',
    title: 'Echo Dot (4th Gen) Smart Speaker with Alexa',
    brand: 'Amazon',
    category: 'Electronics',
    subcategory: 'Smart Home',
    price: 49.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 125632,
    images: ['https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SX466_.jpg'],
    bsr: 2,
    monthlySales: 45000,
    isPrime: true,
    isAmazonChoice: true,
    isBestSeller: true,
    updatedAt: new Date().toISOString(),
    analysis: {
      id: 'analysis_4',
      productId: 'B08N5WRWNW',
      opportunityScore: 7.5,
      demandScore: 9.5,
      competitionScore: 5.5,
      feasibilityScore: 6.0,
      timingScore: 8.0,
      financialAnalysis: {
        estimatedMonthlySales: 450,
        estimatedRevenue: 22495,
        profitMargin: 25,
        breakEvenUnits: 200,
        roi: 125,
        costOfGoodsSold: 14.99,
        fbaFees: 7.50,
        marketingCosts: 4.99
      },
      marketAnalysis: {
        marketSize: "$4.2B",
        totalAddressableMarket: 4200000000,
        growthRate: 25.5,
        seasonality: "high" as const,
        seasonalityMultipliers: {
          'Jan': 0.7, 'Feb': 0.75, 'Mar': 0.8, 'Apr': 0.85,
          'May': 0.9, 'Jun': 0.95, 'Jul': 1.0, 'Aug': 0.95,
          'Sep': 0.9, 'Oct': 1.2, 'Nov': 1.5, 'Dec': 1.6
        },
        trends: ["Smart home adoption", "Voice assistant growth"],
        marketMaturity: "growing" as const
      },
      competitionAnalysis: {
        competitorCount: 15,
        averageRating: 4.4,
        priceRange: { min: 25, max: 100 },
        marketShare: "Dominated",
        competitionLevel: "medium" as const,
        barrierToEntry: "very high" as const,
        topCompetitors: []
      },
      keywordAnalysis: {
        primaryKeywords: ["alexa", "smart speaker"],
        searchVolume: 245000,
        difficulty: 65,
        cpc: 1.45,
        suggestions: ["echo dot", "alexa speaker"],
        longTailKeywords: ["best smart speaker 2024"]
      },
      reviewAnalysis: {
        sentiment: 0.88,
        positivePercentage: 88,
        negativePercentage: 8,
        neutralPercentage: 4,
        commonComplaints: ["Privacy concerns", "WiFi issues"],
        commonPraises: ["Easy setup", "Great sound"],
        opportunities: ["Better privacy features", "More colors"],
        reviewVelocity: 85,
        averageReviewLength: 95
      },
      supplyChainAnalysis: {
        complexity: "very high" as const,
        leadTime: "90-120 days",
        minimumOrder: 1000,
        supplierCount: 3,
        manufacturingRegions: ["China"],
        shippingCosts: 5.00,
        customsDuties: 1.00,
        qualityRequirements: ["FCC", "CE", "UL"]
      },
      riskFactors: ["Amazon competition", "Tech complexity"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: "1.0"
    }
  },
  {
    id: 'B085HZ5TCR',
    asin: 'B085HZ5TCR',
    title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    brand: 'Instant Pot',
    category: 'Kitchen',
    subcategory: 'Small Appliances',
    price: 89.95,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 89234,
    images: ['https://m.media-amazon.com/images/I/71V1LrY1MSL._AC_SX466_.jpg'],
    bsr: 4,
    monthlySales: 22000,
    isPrime: true,
    isAmazonChoice: true,
    isBestSeller: true,
    updatedAt: new Date().toISOString(),
    analysis: {
      id: 'analysis_5',
      productId: 'B085HZ5TCR',
      opportunityScore: 8.0,
      demandScore: 8.7,
      competitionScore: 7.2,
      feasibilityScore: 7.5,
      timingScore: 8.2,
      financialAnalysis: {
        estimatedMonthlySales: 220,
        estimatedRevenue: 19789,
        profitMargin: 38,
        breakEvenUnits: 100,
        roi: 180,
        costOfGoodsSold: 26.99,
        fbaFees: 13.49,
        marketingCosts: 8.99
      },
      marketAnalysis: {
        marketSize: "$2.1B",
        totalAddressableMarket: 2100000000,
        growthRate: 14.2,
        seasonality: "high" as const,
        seasonalityMultipliers: {
          'Jan': 0.9, 'Feb': 0.85, 'Mar': 0.9, 'Apr': 0.95,
          'May': 1.0, 'Jun': 1.05, 'Jul': 1.1, 'Aug': 1.05,
          'Sep': 1.0, 'Oct': 1.15, 'Nov': 1.35, 'Dec': 1.4
        },
        trends: ["Convenient cooking", "Multi-functional appliances"],
        marketMaturity: "mature" as const
      },
      competitionAnalysis: {
        competitorCount: 35,
        averageRating: 4.4,
        priceRange: { min: 50, max: 150 },
        marketShare: "Strong",
        competitionLevel: "high" as const,
        barrierToEntry: "medium" as const,
        topCompetitors: []
      },
      keywordAnalysis: {
        primaryKeywords: ["instant pot", "pressure cooker"],
        searchVolume: 185000,
        difficulty: 75,
        cpc: 2.25,
        suggestions: ["electric pressure cooker", "multi cooker"],
        longTailKeywords: ["best pressure cooker for beginners"]
      },
      reviewAnalysis: {
        sentiment: 0.86,
        positivePercentage: 86,
        negativePercentage: 9,
        neutralPercentage: 5,
        commonComplaints: ["Learning curve", "Size"],
        commonPraises: ["Versatility", "Time saving"],
        opportunities: ["Better manual", "More accessories"],
        reviewVelocity: 55,
        averageReviewLength: 145
      },
      supplyChainAnalysis: {
        complexity: "medium" as const,
        leadTime: "45-60 days",
        minimumOrder: 200,
        supplierCount: 10,
        manufacturingRegions: ["China"],
        shippingCosts: 8.50,
        customsDuties: 1.70,
        qualityRequirements: ["UL", "ETL"]
      },
      riskFactors: ["Safety concerns", "Brand competition"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: "1.0"
    }
  },
  {
    id: 'B08GKQR3V2',
    asin: 'B08GKQR3V2',
    title: 'Apple AirPods Pro (2nd Generation)',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Earbuds',
    price: 249.00,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 65432,
    images: ['https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SX466_.jpg'],
    bsr: 1,
    monthlySales: 55000,
    isPrime: true,
    isAmazonChoice: false,
    isBestSeller: true,
    updatedAt: new Date().toISOString(),
    analysis: {
      id: 'analysis_6',
      productId: 'B08GKQR3V2',
      opportunityScore: 7.8,
      demandScore: 9.8,
      competitionScore: 6.5,
      feasibilityScore: 6.2,
      timingScore: 8.5,
      financialAnalysis: {
        estimatedMonthlySales: 550,
        estimatedRevenue: 136950,
        profitMargin: 28,
        breakEvenUnits: 150,
        roi: 140,
        costOfGoodsSold: 74.70,
        fbaFees: 37.35,
        marketingCosts: 24.90
      },
      marketAnalysis: {
        marketSize: "$3.8B",
        totalAddressableMarket: 3800000000,
        growthRate: 22.5,
        seasonality: "high" as const,
        seasonalityMultipliers: {
          'Jan': 0.8, 'Feb': 0.85, 'Mar': 0.9, 'Apr': 0.95,
          'May': 1.0, 'Jun': 1.05, 'Jul': 1.1, 'Aug': 1.15,
          'Sep': 1.2, 'Oct': 1.25, 'Nov': 1.4, 'Dec': 1.5
        },
        trends: ["Wireless audio growth", "Premium earbuds"],
        marketMaturity: "growing" as const
      },
      competitionAnalysis: {
        competitorCount: 25,
        averageRating: 4.3,
        priceRange: { min: 50, max: 350 },
        marketShare: "Strong",
        competitionLevel: "high" as const,
        barrierToEntry: "high" as const,
        topCompetitors: []
      },
      keywordAnalysis: {
        primaryKeywords: ["airpods pro", "wireless earbuds"],
        searchVolume: 325000,
        difficulty: 68,
        cpc: 1.95,
        suggestions: ["apple earbuds", "noise cancelling earbuds"],
        longTailKeywords: ["best wireless earbuds for iPhone"]
      },
      reviewAnalysis: {
        sentiment: 0.85,
        positivePercentage: 85,
        negativePercentage: 10,
        neutralPercentage: 5,
        commonComplaints: ["Price", "Fit issues"],
        commonPraises: ["Sound quality", "Noise cancellation"],
        opportunities: ["Better fit options", "Longer battery"],
        reviewVelocity: 75,
        averageReviewLength: 110
      },
      supplyChainAnalysis: {
        complexity: "very high" as const,
        leadTime: "60-90 days",
        minimumOrder: 500,
        supplierCount: 5,
        manufacturingRegions: ["China", "Vietnam"],
        shippingCosts: 12.45,
        customsDuties: 2.49,
        qualityRequirements: ["MFi", "FCC", "CE"]
      },
      riskFactors: ["Apple ecosystem lock-in", "High price point"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisVersion: "1.0"
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '6')
    const sortBy = searchParams.get('sortBy') || 'opportunity'

    // Sort products based on sortBy parameter
    let sortedProducts = [...mockTrendingProducts]
    switch (sortBy) {
      case 'opportunity':
        sortedProducts.sort((a, b) => (b.analysis?.opportunityScore || 0) - (a.analysis?.opportunityScore || 0))
        break
      case 'demand':
        sortedProducts.sort((a, b) => (b.analysis?.demandScore || 0) - (a.analysis?.demandScore || 0))
        break
      case 'recent':
        sortedProducts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case 'price':
        sortedProducts.sort((a, b) => a.price - b.price)
        break
    }

    // Limit the results
    const limitedProducts = sortedProducts.slice(0, limit)

    return NextResponse.json(limitedProducts)
  } catch (error) {
    console.error('Trending products API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Cache trending products for 1 hour
export const revalidate = 3600 // 1 hour in seconds