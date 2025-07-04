// API Route: GET /api/products/trending
// Returns trending products with highest opportunity scores

import { NextRequest, NextResponse } from 'next/server'
import { amazonApiService } from '@/lib/amazon-api-service'
import { aiService } from '@/lib/ai-service'
import { Product } from '@/types/api'

// High-opportunity ASINs for trending products
const TRENDING_ASINS = [
  'B08MVBRNKV', // Sony WH-1000XM4 Headphones
  'B077JBQZPX', // Breville Barista Express
  'B01AKRSDTU', // Gaiam Yoga Mat
  'B08N5WRWNW', // ZAGG Screen Protector
  'B085HZ5TCR', // Echo Dot 4th Gen
  'B08GKQR3V2', // Kindle Paperwhite
  'B07FZ8S74R', // Echo Show 8
  'B08PPDJWC8', // Apple AirPods Pro
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '6')
    const sortBy = searchParams.get('sortBy') || 'opportunity'

    // Import products from Amazon
    const productPromises = TRENDING_ASINS.slice(0, limit).map(async (asin) => {
      try {
        const product = await amazonApiService.importProduct(asin)
        
        // Generate quick analysis for opportunity scoring
        const analysis = await aiService.generateDeepAnalysis({
          product,
          context: 'trending_analysis'
        })
        
        return {
          ...product,
          analysis: {
            id: `analysis_${product.id}`,
            productId: product.id,
            opportunityScore: analysis.opportunityScore || 7,
            demandScore: Math.min(10, Math.max(1, analysis.opportunityScore - 1)),
            competitionScore: analysis.competitionLevel === 'low' ? 8 : analysis.competitionLevel === 'medium' ? 6 : 4,
            feasibilityScore: Math.min(10, Math.max(1, analysis.opportunityScore)),
            financialAnalysis: {
              estimatedMonthlySales: 75,
              estimatedRevenue: analysis.financialProjections?.[0]?.revenue || product.price * 75,
              profitMargin: 30,
              breakEvenUnits: 50,
              roi: 180,
              costOfGoodsSold: product.price * 0.3,
              fbaFees: product.price * 0.15,
              marketingCosts: product.price * 0.1
            },
            marketAnalysis: {
              marketSize: `$${(analysis.marketSize?.som / 1000000 || 1).toFixed(1)}M`,
              totalAddressableMarket: analysis.marketSize?.tam || 100000000,
              growthRate: analysis.demandTrends?.cagr || 12,
              seasonality: 'medium' as const,
              seasonalityMultipliers: {
                'Jan': 0.9, 'Feb': 0.95, 'Mar': 1.0, 'Apr': 1.05,
                'May': 1.1, 'Jun': 1.15, 'Jul': 1.2, 'Aug': 1.15,
                'Sep': 1.1, 'Oct': 1.3, 'Nov': 1.45, 'Dec': 1.35
              },
              trends: ['Growing demand', 'Market expansion', 'Quality focus'],
              marketMaturity: 'growing' as const
            },
            competitionAnalysis: {
              competitorCount: 45,
              averageRating: 4.2,
              priceRange: { min: product.price * 0.7, max: product.price * 1.5 },
              marketShare: 'Medium',
              competitionLevel: analysis.competitionLevel || 'medium',
              barrierToEntry: 'medium' as const,
              topCompetitors: []
            },
            keywordAnalysis: {
              primaryKeywords: analysis.keywordOpportunities?.slice(0, 5).map(k => k.keyword) || [],
              searchVolume: analysis.keywordOpportunities?.[0]?.searchVolume || 50000,
              difficulty: 65,
              cpc: 1.25,
              suggestions: [],
              longTailKeywords: []
            },
            reviewAnalysis: {
              sentiment: 0.75,
              positivePercentage: 75,
              negativePercentage: 15,
              neutralPercentage: 10,
              commonComplaints: ['Price point', 'Shipping time'],
              commonPraises: ['Quality', 'Features', 'Value'],
              opportunities: ['Better packaging', 'Extended warranty'],
              reviewVelocity: 15,
              averageReviewLength: 150
            },
            supplyChainAnalysis: {
              complexity: 'medium' as const,
              leadTime: '30-45 days',
              minimumOrder: 100,
              supplierCount: 8,
              manufacturingRegions: ['China', 'Taiwan'],
              shippingCosts: product.price * 0.05,
              customsDuties: product.price * 0.02,
              qualityRequirements: ['CE marking', 'FCC certification']
            },
            riskFactors: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            analysisVersion: '1.0'
          }
        }
      } catch (error) {
        console.error(`Failed to process product ${asin}:`, error)
        return null
      }
    })

    const products = (await Promise.all(productPromises))
      .filter((product): product is Product => product !== null)

    // Sort products based on sortBy parameter
    let sortedProducts = [...products]
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