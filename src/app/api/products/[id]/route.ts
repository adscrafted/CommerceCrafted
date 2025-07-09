// API Route: GET /api/products/[id]
// Returns detailed product information with analysis

import { NextRequest, NextResponse } from 'next/server'
import { amazonApiService } from '@/lib/amazon-api-service'
import { aiService } from '@/lib/ai-service'
import { Product } from '@/types/api'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Extract ASIN from ID (handle both direct ASINs and internal IDs)
    const asin = id.startsWith('amazon_') ? id.replace('amazon_', '') : id
    
    // Get product data from Amazon
    const product = await amazonApiService.importProduct(asin)
    
    // Generate comprehensive analysis
    const analysis = await aiService.generateDeepAnalysis({
      product,
      context: 'detailed_product_analysis'
    })
    
    // Get additional analysis components
    const [keywordAnalysis, _ppcStrategy, inventoryAnalysis, _demandAnalysis, competitorAnalysis, financialModel] = await Promise.all([
      aiService.analyzeKeywords({ product }),
      aiService.calculatePPCStrategy({ product }),
      aiService.analyzeInventory({ product }),
      aiService.analyzeDemand({ product }),
      aiService.analyzeCompetitors({ product }),
      aiService.createFinancialModel({ product })
    ])
    
    // Combine all analysis data
    const detailedProduct: Product = {
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
          estimatedRevenue: financialModel.roiCalculations.monthlyRevenue || product.price * 75,
          profitMargin: financialModel.profitabilityModel.grossMargin || 30,
          breakEvenUnits: financialModel.breakEvenAnalysis.breakEvenUnits || 50,
          roi: financialModel.roiCalculations.roi || 180,
          costOfGoodsSold: product.price * 0.3,
          fbaFees: financialModel.fbaFeeAnalysis.totalFbaFees || product.price * 0.15,
          marketingCosts: product.price * 0.1
        },
        marketAnalysis: {
          marketSize: `$${(analysis.marketSize?.som / 1000000 || 1).toFixed(1)}M`,
          totalAddressableMarket: analysis.marketSize?.tam || 100000000,
          growthRate: analysis.demandTrends?.cagr || 12,
          seasonality: 'medium' as const,
          seasonalityMultipliers: analysis.demandTrends?.seasonality || {
            'Jan': 0.9, 'Feb': 0.95, 'Mar': 1.0, 'Apr': 1.05,
            'May': 1.1, 'Jun': 1.15, 'Jul': 1.2, 'Aug': 1.15,
            'Sep': 1.1, 'Oct': 1.3, 'Nov': 1.45, 'Dec': 1.35
          },
          trends: ['Growing demand', 'Market expansion', 'Quality focus'],
          marketMaturity: 'growing' as const
        },
        competitionAnalysis: {
          competitorCount: competitorAnalysis.topCompetitors.length || 45,
          averageRating: 4.2,
          priceRange: competitorAnalysis.priceAnalysis.priceRange || { min: product.price * 0.7, max: product.price * 1.5 },
          marketShare: 'Medium',
          competitionLevel: analysis.competitionLevel || 'medium',
          barrierToEntry: 'medium' as const,
          topCompetitors: competitorAnalysis.topCompetitors.slice(0, 5).map(comp => ({
            asin: comp.asin,
            title: comp.name,
            price: comp.price,
            rating: comp.rating,
            reviewCount: comp.reviewCount,
            marketShare: comp.marketShare
          }))
        },
        keywordAnalysis: {
          primaryKeywords: keywordAnalysis.primaryKeywords.slice(0, 5).map(k => k.keyword),
          searchVolume: keywordAnalysis.primaryKeywords[0]?.searchVolume || 50000,
          difficulty: keywordAnalysis.primaryKeywords[0]?.difficulty || 65,
          cpc: keywordAnalysis.ppcMetrics.avgCpc || 1.25,
          suggestions: keywordAnalysis.longTailKeywords.slice(0, 5).map(k => k.keyword),
          longTailKeywords: keywordAnalysis.longTailKeywords.slice(0, 10)
        },
        reviewAnalysis: {
          sentiment: 0.75,
          positivePercentage: 75,
          negativePercentage: 15,
          neutralPercentage: 10,
          commonComplaints: ['Price point', 'Shipping time', 'Packaging'],
          commonPraises: ['Quality', 'Features', 'Value', 'Design'],
          opportunities: ['Better packaging', 'Extended warranty', 'More colors'],
          reviewVelocity: 15,
          averageReviewLength: 150
        },
        supplyChainAnalysis: {
          complexity: inventoryAnalysis.riskAssessment.supplierRisk === 'low' ? 'low' : inventoryAnalysis.riskAssessment.supplierRisk === 'high' ? 'high' : 'medium',
          leadTime: `${inventoryAnalysis.leadTimes.total} days`,
          minimumOrder: inventoryAnalysis.moqAnalysis.supplierMoq || 100,
          supplierCount: inventoryAnalysis.supplierAnalysis.length || 8,
          manufacturingRegions: ['China', 'Taiwan'],
          shippingCosts: inventoryAnalysis.costBreakdown.shipping || product.price * 0.05,
          customsDuties: inventoryAnalysis.costBreakdown.duties || product.price * 0.02,
          qualityRequirements: inventoryAnalysis.qualityRequirements.standards || ['CE marking', 'FCC certification']
        },
        riskFactors: analysis.riskAssessment?.riskFactors?.map(risk => ({
          factor: risk.risk,
          severity: risk.impact > 0.7 ? 'high' as const : risk.impact > 0.4 ? 'medium' as const : 'low' as const,
          probability: risk.probability,
          impact: risk.impact,
          mitigation: risk.mitigation
        })) || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analysisVersion: '1.0'
      },
      deepAnalysis: analysis
    }

    return NextResponse.json(detailedProduct)
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