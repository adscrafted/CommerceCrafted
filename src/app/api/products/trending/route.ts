// API Route: GET /api/products/trending
// Returns trending products with highest opportunity scores

import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types/api'

// Mock trending products data
function getMockTrendingProducts(limit: number = 6): Product[] {
  const products = [
    {
      id: 'mock-1',
      asin: 'B07K9J4F5V',
      title: 'Wireless Charging Desk Organizer',
      brand: 'TechOrganize',
      category: 'Office & Business',
      subcategory: 'Desk Organizers',
      price: 89.99,
      currency: 'USD',
      rating: 4.6,
      reviewCount: 2300,
      imageUrls: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop'],
      description: 'Premium bamboo desk organizer with built-in wireless charging pad',
      features: ['Wireless charging', 'Bamboo construction', 'Multiple compartments'],
      availability: 'in_stock' as const,
      bsr: 156,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysis: {
        id: 'analysis-1',
        productId: 'mock-1',
        opportunityScore: 8.7,
        demandScore: 9.1,
        competitionScore: 6.8,
        feasibilityScore: 8.5,
        financialAnalysis: {
          estimatedMonthlySales: 850,
          estimatedRevenue: 76500,
          profitMargin: 42,
          breakEvenUnits: 125,
          roi: 215,
          costOfGoodsSold: 27.0,
          fbaFees: 13.5,
          marketingCosts: 9.0
        },
        marketAnalysis: {
          marketSize: '$450M',
          totalAddressableMarket: 450000000,
          growthRate: 15.2,
          seasonality: 'medium' as const,
          seasonalityMultipliers: {},
          trends: ['Remote work growth', 'Organization trend'],
          marketMaturity: 'growing' as const
        },
        competitionAnalysis: {
          competitorCount: 28,
          averageRating: 4.2,
          priceRange: { min: 60, max: 120 },
          marketShare: 'Strong',
          competitionLevel: 'medium' as const,
          barrierToEntry: 'medium' as const,
          topCompetitors: []
        },
        keywordAnalysis: {
          primaryKeywords: ['desk organizer', 'wireless charging'],
          searchVolume: 45000,
          difficulty: 68,
          cpc: 1.85,
          suggestions: ['wireless charging desk', 'bamboo organizer'],
          longTailKeywords: []
        },
        reviewAnalysis: {
          sentiment: 0.82,
          positivePercentage: 82,
          negativePercentage: 12,
          neutralPercentage: 6,
          commonComplaints: ['Price point'],
          commonPraises: ['Quality', 'Design'],
          opportunities: ['Better packaging'],
          reviewVelocity: 25,
          averageReviewLength: 165
        },
        supplyChainAnalysis: {
          complexity: 'medium' as const,
          leadTime: '45-60 days',
          minimumOrder: 200,
          supplierCount: 12,
          manufacturingRegions: ['China'],
          shippingCosts: 17.4,
          customsDuties: 6.96,
          qualityRequirements: ['CE marking']
        },
        riskFactors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysisVersion: '1.0'
      }
    },
    {
      id: 'mock-2',
      asin: 'B08P7MCDPT',
      title: 'Smart Plant Watering System',
      brand: 'GreenTech',
      category: 'Home & Garden',
      subcategory: 'Gardening Tools',
      price: 129.99,
      currency: 'USD',
      rating: 4.4,
      reviewCount: 1800,
      imageUrls: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop'],
      description: 'Automated plant care system with soil moisture sensors',
      features: ['Automated watering', 'App controlled', 'Soil sensors'],
      availability: 'in_stock' as const,
      bsr: 89,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysis: {
        id: 'analysis-2',
        productId: 'mock-2',
        opportunityScore: 8.2,
        demandScore: 8.5,
        competitionScore: 7.2,
        feasibilityScore: 8.0,
        financialAnalysis: {
          estimatedMonthlySales: 520,
          estimatedRevenue: 67600,
          profitMargin: 38,
          breakEvenUnits: 95,
          roi: 185,
          costOfGoodsSold: 39.0,
          fbaFees: 19.5,
          marketingCosts: 13.0
        },
        marketAnalysis: {
          marketSize: '$320M',
          totalAddressableMarket: 320000000,
          growthRate: 22.1,
          seasonality: 'high' as const,
          seasonalityMultipliers: {},
          trends: ['Smart home growth', 'Gardening boom'],
          marketMaturity: 'growing' as const
        },
        competitionAnalysis: {
          competitorCount: 15,
          averageRating: 4.1,
          priceRange: { min: 90, max: 200 },
          marketShare: 'Growing',
          competitionLevel: 'low' as const,
          barrierToEntry: 'medium' as const,
          topCompetitors: []
        },
        keywordAnalysis: {
          primaryKeywords: ['smart plant watering', 'automated gardening'],
          searchVolume: 32000,
          difficulty: 55,
          cpc: 2.15,
          suggestions: ['plant watering system', 'smart irrigation'],
          longTailKeywords: []
        },
        reviewAnalysis: {
          sentiment: 0.78,
          positivePercentage: 78,
          negativePercentage: 15,
          neutralPercentage: 7,
          commonComplaints: ['Setup complexity'],
          commonPraises: ['Effectiveness', 'Innovation'],
          opportunities: ['Easier setup'],
          reviewVelocity: 18,
          averageReviewLength: 140
        },
        supplyChainAnalysis: {
          complexity: 'high' as const,
          leadTime: '60-75 days',
          minimumOrder: 150,
          supplierCount: 8,
          manufacturingRegions: ['China', 'Taiwan'],
          shippingCosts: 22.8,
          customsDuties: 9.12,
          qualityRequirements: ['FCC certification', 'CE marking']
        },
        riskFactors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysisVersion: '1.0'
      }
    }
  ]
  
  // Duplicate and modify products to reach the requested limit
  const result = []
  for (let i = 0; i < limit; i++) {
    const product = { ...products[i % products.length] }
    product.id = `mock-${i + 1}`
    product.title = `${product.title} ${i > 1 ? `(Variant ${i})` : ''}`
    result.push(product)
  }
  
  return result
}

// Note: Using mock data for trending products to avoid database dependencies

// Force dynamic behavior since we use searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '6')
    const sortBy = searchParams.get('sortBy') || 'opportunity'

    // Use mock data instead of database
    const mockProducts = getMockTrendingProducts(limit)

    // Apply sorting to mock data
    let sortedProducts = [...mockProducts]
    if (sortBy === 'opportunity' || sortBy === 'demand') {
      sortedProducts.sort((a, b) => (b.analysis?.opportunityScore || 0) - (a.analysis?.opportunityScore || 0))
    } else if (sortBy === 'recent') {
      sortedProducts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (sortBy === 'price') {
      sortedProducts.sort((a, b) => a.price - b.price)
    }

    return NextResponse.json(sortedProducts)
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