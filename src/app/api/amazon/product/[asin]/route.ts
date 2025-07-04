// Amazon Product Details API Endpoint
// Provides detailed product information and analysis by ASIN

import { NextRequest, NextResponse } from 'next/server'
import { productDataService } from '@/lib/product-data-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const searchParams = request.nextUrl.searchParams
    const includeDeepAnalysis = searchParams.get('deep') === 'true'

    if (!asin) {
      return NextResponse.json(
        { error: 'ASIN is required' },
        { status: 400 }
      )
    }

    // Validate ASIN format (basic check)
    if (!/^B[0-9A-Z]{9}$/.test(asin)) {
      return NextResponse.json(
        { error: 'Invalid ASIN format' },
        { status: 400 }
      )
    }

    const product = await productDataService.getProductByASIN(asin, includeDeepAnalysis)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Comprehensive product response
    const response = {
      product: {
        // Basic product information
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        currency: product.currency,
        description: product.description,
        features: product.features,
        imageUrls: product.imageUrls,
        dimensions: product.dimensions,
        weight: product.weight,
        availability: product.availability,
        lastUpdated: product.lastUpdated,

        // Performance metrics
        bsr: product.bsrData ? {
          rank: product.bsrData.rank,
          category: product.bsrData.category,
          subcategory: product.bsrData.subcategory,
          percentile: product.bsrData.percentile,
          estimatedMonthlySales: product.bsrData.estimatedMonthlySales
        } : null,

        // Review data
        reviews: product.reviewData ? {
          totalReviews: product.reviewData.totalReviews,
          averageRating: product.reviewData.averageRating,
          ratingDistribution: product.reviewData.ratingDistribution,
          sentimentAnalysis: product.reviewData.sentimentAnalysis,
          recentReviews: product.reviewData.recentReviews.slice(0, 5) // Limit recent reviews
        } : null,

        // Pricing information
        pricing: product.pricing ? {
          currentPrice: product.pricing.currentPrice,
          currency: product.pricing.currency,
          listPrice: product.pricing.listPrice,
          savings: product.pricing.savings,
          savingsPercentage: product.pricing.savingsPercentage,
          lastUpdated: product.pricing.lastUpdated
        } : null,

        // Basic analysis
        analysis: product.analysis ? {
          opportunityScore: product.analysis.opportunityScore,
          demandScore: product.analysis.demandScore,
          competitionScore: product.analysis.competitionScore,
          feasibilityScore: product.analysis.feasibilityScore,
          financialAnalysis: product.analysis.financialAnalysis,
          marketAnalysis: product.analysis.marketAnalysis,
          competitionAnalysis: product.analysis.competitionAnalysis,
          keywordAnalysis: product.analysis.keywordAnalysis,
          reviewAnalysis: product.analysis.reviewAnalysis,
          supplyChainAnalysis: product.analysis.supplyChainAnalysis
        } : null
      },

      // Deep analysis (if requested)
      deepAnalysis: includeDeepAnalysis && product.deepAnalysis ? {
        opportunityScore: product.deepAnalysis.opportunityScore,
        marketSize: product.deepAnalysis.marketSize,
        competitionLevel: product.deepAnalysis.competitionLevel,
        demandTrends: product.deepAnalysis.demandTrends,
        keywordOpportunities: product.deepAnalysis.keywordOpportunities,
        ppcStrategy: product.deepAnalysis.ppcStrategy,
        inventoryRecommendations: product.deepAnalysis.inventoryRecommendations,
        riskAssessment: product.deepAnalysis.riskAssessment,
        launchStrategy: product.deepAnalysis.launchStrategy,
        financialProjections: product.deepAnalysis.financialProjections
      } : null,

      // Individual deep research components (if available)
      research: {
        keywords: product.keywordAnalysis || null,
        ppc: product.ppcStrategy || null,
        inventory: product.inventoryAnalysis || null,
        demand: product.demandAnalysis || null,
        competitors: product.competitorAnalysis || null,
        financial: product.financialModel || null
      },

      metadata: {
        fetchTime: new Date().toISOString(),
        includeDeepAnalysis,
        dataFreshness: {
          product: product.lastUpdated,
          pricing: product.pricing?.lastUpdated,
          bsr: product.bsrData?.lastUpdated,
          reviews: product.reviewData?.lastUpdated
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error(`Amazon product API error for ASIN ${params.asin}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error',
        asin: params.asin
      },
      { status: 500 }
    )
  }
}

// Get specific analysis component
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const body = await request.json()
    const { analysisType } = body

    if (!asin || !analysisType) {
      return NextResponse.json(
        { error: 'ASIN and analysisType are required' },
        { status: 400 }
      )
    }

    let analysisResult = null

    switch (analysisType) {
      case 'keywords':
        analysisResult = await productDataService.getKeywordAnalysis(asin)
        break
      case 'ppc':
        analysisResult = await productDataService.getPPCStrategy(asin)
        break
      case 'inventory':
        analysisResult = await productDataService.getInventoryAnalysis(asin)
        break
      case 'demand':
        analysisResult = await productDataService.getDemandAnalysis(asin)
        break
      case 'competitors':
        analysisResult = await productDataService.getCompetitorAnalysis(asin)
        break
      case 'financial':
        analysisResult = await productDataService.getFinancialModel(asin)
        break
      case 'deep':
        analysisResult = await productDataService.getDeepAnalysis(asin)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        )
    }

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Analysis not available for this product' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      asin,
      analysisType,
      result: analysisResult,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error(`Amazon analysis API error for ASIN ${params.asin}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
        asin: params.asin
      },
      { status: 500 }
    )
  }
}