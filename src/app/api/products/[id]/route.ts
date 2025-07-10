// API Route: GET /api/products/[id]
// Returns detailed product information with analysis

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types/api'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Extract ASIN from ID (handle both direct ASINs and internal IDs)
    const asin = id.startsWith('amazon_') ? id.replace('amazon_', '') : id
    
    // Get product data from database
    // TODO: Convert to Supabase with proper joins
    // const { data: dbProduct } = await supabase.from('products').select('*, analysis:product_analysis(*)').or(`asin.eq.${asin},id.eq.${asin}`).single()
    const dbProduct = null
    
    if (!dbProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Convert database product to API format
    const product: Product = {
      id: dbProduct.id,
      asin: dbProduct.asin,
      title: dbProduct.title,
      brand: dbProduct.brand || "Unknown",
      category: dbProduct.category || "Unknown",
      subcategory: dbProduct.subcategory || "Unknown",
      price: dbProduct.price || 0,
      currency: "USD",
      rating: dbProduct.rating || 0,
      reviewCount: dbProduct.reviewCount || 0,
      images: dbProduct.imageUrls ? [dbProduct.imageUrls] : [],
      imageUrl: dbProduct.imageUrls || 'https://via.placeholder.com/400x400?text=Product',
      bsr: dbProduct.bsr || 0,
      monthlySales: dbProduct.analysis?.financialAnalysis?.projectedMonthlySales || 0,
      isPrime: true,
      isAmazonChoice: dbProduct.bsr && dbProduct.bsr < 100,
      isBestSeller: dbProduct.bsr && dbProduct.bsr < 10,
      updatedAt: dbProduct.updatedAt.toISOString(),
      analysis: dbProduct.analysis ? {
        id: dbProduct.analysis.id,
        productId: dbProduct.analysis.productId,
        opportunityScore: dbProduct.analysis.opportunityScore / 10, // Convert to 0-10 scale
        demandScore: dbProduct.analysis.demandScore / 10,
        competitionScore: dbProduct.analysis.competitionScore / 10,
        feasibilityScore: dbProduct.analysis.feasibilityScore / 10,
        financialAnalysis: {
          estimatedMonthlySales: (dbProduct.analysis.financialAnalysis as any).projectedMonthlySales || 150,
          estimatedRevenue: (dbProduct.analysis.financialAnalysis as any).projectedMonthlyRevenue || 52200,
          profitMargin: ((dbProduct.analysis.financialAnalysis as any).estimatedProfitMargin || 0.35) * 100,
          breakEvenUnits: 75,
          roi: (dbProduct.analysis.financialAnalysis as any).roi || 185,
          costOfGoodsSold: dbProduct.price ? dbProduct.price * 0.3 : 0,
          fbaFees: dbProduct.price ? dbProduct.price * 0.15 : 0,
          marketingCosts: dbProduct.price ? dbProduct.price * 0.1 : 0
        },
        marketAnalysis: {
          marketSize: `$${((dbProduct.analysis.marketAnalysis as any).marketSize / 1000000).toFixed(1)}M`,
          totalAddressableMarket: (dbProduct.analysis.marketAnalysis as any).marketSize || 2300000000,
          growthRate: (dbProduct.analysis.marketAnalysis as any).growthRate || 15.2,
          seasonality: "medium" as const,
          seasonalityMultipliers: {
            'Jan': 0.9, 'Feb': 0.95, 'Mar': 1.0, 'Apr': 1.05,
            'May': 1.1, 'Jun': 1.15, 'Jul': 1.2, 'Aug': 1.15,
            'Sep': 1.1, 'Oct': 1.3, 'Nov': 1.45, 'Dec': 1.35
          },
          trends: (dbProduct.analysis.marketAnalysis as any).trends || ["Growing demand", "Market expansion"],
          marketMaturity: "growing" as const
        },
        competitionAnalysis: {
          competitorCount: (dbProduct.analysis.competitionAnalysis as any).competitorCount || 28,
          averageRating: 4.2,
          priceRange: { min: dbProduct.price ? dbProduct.price * 0.7 : 199, max: dbProduct.price ? dbProduct.price * 1.5 : 450 },
          marketShare: "Strong",
          competitionLevel: "medium" as const,
          barrierToEntry: "medium" as const,
          topCompetitors: []
        },
        keywordAnalysis: {
          primaryKeywords: (dbProduct.analysis.keywordAnalysis as any).primaryKeywords || ["product keyword"],
          searchVolume: (dbProduct.analysis.keywordAnalysis as any).searchVolume || 89000,
          difficulty: (dbProduct.analysis.keywordAnalysis as any).difficulty || 72,
          cpc: 2.15,
          suggestions: ["related keyword", "variant keyword"],
          longTailKeywords: ["best product 2024", "quality product review"]
        },
        reviewAnalysis: {
          sentiment: 0.82,
          positivePercentage: 82,
          negativePercentage: 12,
          neutralPercentage: 6,
          commonComplaints: (dbProduct.analysis.reviewAnalysis as any).commonComplaints || ["Price point", "Delivery time"],
          commonPraises: (dbProduct.analysis.reviewAnalysis as any).strengthPoints || ["Quality", "Value", "Design"],
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
          shippingCosts: (dbProduct.analysis.supplyChainAnalysis as any).shippingCost || 17.4,
          customsDuties: 6.96,
          qualityRequirements: ["CE marking", "FCC certification"]
        },
        riskFactors: ["Market competition", "Supply chain disruption"],
        createdAt: dbProduct.analysis.createdAt.toISOString(),
        updatedAt: dbProduct.analysis.updatedAt.toISOString(),
        analysisVersion: "1.0"
      } : undefined
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product API error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Cache product details for 30 minutes
export const revalidate = 1800 // 30 minutes in seconds