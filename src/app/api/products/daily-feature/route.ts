// API Route: GET /api/products/daily-feature
// Returns the daily featured product with analysis

import { NextResponse } from 'next/server'
import { DailyFeature } from '@/types/api'

// Mock daily feature data for static generation
function getMockDailyFeature(): DailyFeature {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
  
  // Rotate through products based on day of year
  const products = [
    {
      id: 'daily_product_1',
      asin: 'B08MVBRNKV',
      title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
      brand: 'LC-dolida',
      category: 'Health & Personal Care',
      price: 29.99,
      rating: 4.3,
      reviewCount: 35678,
      imageUrls: ['https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=600&h=400&fit=crop'],
      opportunityScore: 87
    }
  ]
  
  const selectedProduct = products[dayOfYear % products.length]
  
  return {
    id: `daily_${today.toISOString().split('T')[0]}`,
    date: today.toISOString().split('T')[0],
    product: {
      id: selectedProduct.id,
      asin: selectedProduct.asin,
      title: selectedProduct.title,
      brand: selectedProduct.brand,
      category: selectedProduct.category,
      subcategory: selectedProduct.category,
      price: selectedProduct.price,
      currency: "USD",
      rating: selectedProduct.rating,
      reviewCount: selectedProduct.reviewCount,
      imageUrls: selectedProduct.imageUrls,
      description: selectedProduct.title,
      features: ["Premium quality", "Customer satisfaction", "Market leader"],
      availability: "in_stock" as const,
      bsr: 2341,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      analysis: {
        id: 'analysis_1',
        productId: selectedProduct.id,
        opportunityScore: selectedProduct.opportunityScore,
        demandScore: 85,
        competitionScore: 72,
        feasibilityScore: 88,
        financialAnalysis: {
          estimatedMonthlySales: 17334,
          estimatedRevenue: 520000,
          profitMargin: 45,
          breakEvenUnits: 75,
          roi: 450,
          costOfGoodsSold: selectedProduct.price * 0.3,
          fbaFees: selectedProduct.price * 0.15,
          marketingCosts: selectedProduct.price * 0.1
        },
        marketAnalysis: {
          marketSize: "$450M",
          totalAddressableMarket: 450000000,
          growthRate: 127,
          seasonality: "medium" as const,
          seasonalityMultipliers: {
            'Jan': 0.9, 'Feb': 0.95, 'Mar': 1.0, 'Apr': 1.05,
            'May': 1.1, 'Jun': 1.15, 'Jul': 1.2, 'Aug': 1.15,
            'Sep': 1.1, 'Oct': 1.3, 'Nov': 1.45, 'Dec': 1.35
          },
          trends: ["Growing demand", "Market expansion"],
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
          primaryKeywords: ["bluetooth sleep mask", "sleep headphones"],
          searchVolume: 89000,
          difficulty: 72,
          cpc: 2.15,
          suggestions: ["sleep mask with speakers", "bluetooth sleep headphones"],
          longTailKeywords: []
        },
        reviewAnalysis: {
          sentiment: 0.82,
          positivePercentage: 82,
          negativePercentage: 12,
          neutralPercentage: 6,
          commonComplaints: ["Price point", "Delivery time"],
          commonPraises: ["Quality", "Value", "Design"],
          opportunities: ["Better packaging", "Improved instructions"],
          reviewVelocity: 25,
          averageReviewLength: 165
        },
        supplyChainAnalysis: {
          complexity: "medium" as const,
          leadTime: "45-60 days",
          minimumOrder: 200,
          supplierCount: 12,
          manufacturingRegions: ["China", "Taiwan"],
          shippingCosts: 17.4,
          customsDuties: 6.96,
          qualityRequirements: ["CE marking", "FCC certification"]
        },
        riskFactors: [],
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
        analysisVersion: "1.0"
      }
    },
    reason: "High opportunity score with growing market demand and clear differentiation opportunities",
    highlights: [
      "Growing 127% YoY with consistent demand",
      "Premium positioning opportunity in $40-60 range", 
      "Untapped niches: travel, meditation, ASMR",
      "Low competition from major brands"
    ],
    marketContext: "Strong market opportunity with favorable conditions for new entrants",
    aiInsights: [
      "Comprehensive analysis available",
      "Market research completed", 
      "Competition assessment done"
    ],
    createdAt: today.toISOString()
  }
}

export async function GET() {
  try {
    // Return mock data for static generation
    const dailyFeature = getMockDailyFeature()
    return NextResponse.json(dailyFeature)
  } catch (error) {
    console.error('Daily feature API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily feature',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Cache the daily feature for 24 hours
export const revalidate = 86400 // 24 hours in seconds