// Amazon Trending Products API Endpoint
// Provides trending and high-opportunity products

import { NextRequest, NextResponse } from 'next/server'
import { productDataService } from '@/lib/product-data-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    const category = searchParams.get('category') || undefined
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : 7

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    let trendingProducts

    if (category) {
      // Get trending products for specific category
      const searchResults = await productDataService.searchProducts('', {
        category,
        minOpportunityScore: minScore,
        sortBy: 'opportunity',
        limit
      })
      trendingProducts = searchResults.products
    } else {
      // Get overall trending products
      trendingProducts = await productDataService.getTrendingProducts(limit)
    }

    // Transform results for API response
    const response = {
      trending: trendingProducts.map((product, index) => ({
        rank: index + 1,
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrls[0],
        
        // Performance metrics
        bsr: product.bsrData?.rank,
        bsrCategory: product.bsrData?.category,
        estimatedMonthlySales: product.bsrData?.estimatedMonthlySales,
        
        // Reviews
        rating: product.rating || product.reviewData?.averageRating,
        reviewCount: product.reviewCount || product.reviewData?.totalReviews,
        
        // Analysis scores
        opportunityScore: product.analysis?.opportunityScore,
        demandScore: product.analysis?.demandScore,
        competitionScore: product.analysis?.competitionScore,
        feasibilityScore: product.analysis?.feasibilityScore,
        
        // Financial highlights
        estimatedRevenue: product.analysis?.financialAnalysis.estimatedRevenue,
        profitMargin: product.analysis?.financialAnalysis.profitMargin,
        roi: product.analysis?.financialAnalysis.roi,
        
        // Market insights
        marketSize: product.analysis?.marketAnalysis.marketSize,
        growthRate: product.analysis?.marketAnalysis.growthRate,
        trends: product.analysis?.marketAnalysis.trends,
        
        lastUpdated: product.lastUpdated
      })),
      
      metadata: {
        total: trendingProducts.length,
        filters: {
          category,
          minScore,
          limit
        },
        fetchTime: new Date().toISOString(),
        disclaimer: 'Rankings based on opportunity scores, BSR data, and market analysis'
      },
      
      summary: {
        avgOpportunityScore: trendingProducts.reduce((sum, p) => 
          sum + (p.analysis?.opportunityScore || 0), 0) / trendingProducts.length,
        avgProfitMargin: trendingProducts.reduce((sum, p) => 
          sum + (p.analysis?.financialAnalysis.profitMargin || 0), 0) / trendingProducts.length,
        categories: [...new Set(trendingProducts.map(p => p.category))],
        priceRange: {
          min: Math.min(...trendingProducts.map(p => p.price)),
          max: Math.max(...trendingProducts.map(p => p.price))
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Amazon trending API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get daily featured product
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    const dailyFeature = await productDataService.getDailyFeature()

    if (!dailyFeature) {
      return NextResponse.json(
        { error: 'No daily feature available' },
        { status: 404 }
      )
    }

    const product = dailyFeature.product

    const response = {
      dailyFeature: {
        id: dailyFeature.id,
        date: dailyFeature.date,
        reason: dailyFeature.reason,
        
        product: {
          asin: product.asin,
          title: product.title,
          brand: product.brand,
          category: product.category,
          price: product.price,
          currency: product.currency,
          imageUrl: product.imageUrls[0],
          description: product.description,
          features: product.features,
          
          // Performance metrics
          bsr: product.bsrData?.rank,
          bsrCategory: product.bsrData?.category,
          estimatedMonthlySales: product.bsrData?.estimatedMonthlySales,
          
          // Reviews
          rating: product.rating || product.reviewData?.averageRating,
          reviewCount: product.reviewCount || product.reviewData?.totalReviews,
          sentimentScore: product.reviewData?.sentimentAnalysis.positive,
          
          // Analysis scores
          opportunityScore: product.analysis?.opportunityScore,
          demandScore: product.analysis?.demandScore,
          competitionScore: product.analysis?.competitionScore,
          feasibilityScore: product.analysis?.feasibilityScore,
          
          // Financial highlights
          estimatedRevenue: product.analysis?.financialAnalysis.estimatedRevenue,
          profitMargin: product.analysis?.financialAnalysis.profitMargin,
          breakEvenUnits: product.analysis?.financialAnalysis.breakEvenUnits,
          roi: product.analysis?.financialAnalysis.roi,
          
          // Market insights
          marketSize: product.analysis?.marketAnalysis.marketSize,
          growthRate: product.analysis?.marketAnalysis.growthRate,
          seasonality: product.analysis?.marketAnalysis.seasonality,
          trends: product.analysis?.marketAnalysis.trends,
          
          // Keywords
          primaryKeywords: product.analysis?.keywordAnalysis.primaryKeywords,
          searchVolume: product.analysis?.keywordAnalysis.searchVolume,
          difficulty: product.analysis?.keywordAnalysis.difficulty,
          
          lastUpdated: product.lastUpdated
        },
        
        // Include deep analysis if available
        deepInsights: product.deepAnalysis ? {
          marketSize: product.deepAnalysis.marketSize,
          competitionLevel: product.deepAnalysis.competitionLevel,
          demandTrends: product.deepAnalysis.demandTrends,
          keywordOpportunities: product.deepAnalysis.keywordOpportunities.slice(0, 5),
          riskAssessment: product.deepAnalysis.riskAssessment
        } : null
      },
      
      metadata: {
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        source: 'Amazon SP-API with CommerceCrafted analysis'
      }
    }

    return NextResponse.json(response)

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