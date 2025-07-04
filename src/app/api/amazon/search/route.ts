// Amazon Product Search API Endpoint
// Provides real-time product search using Amazon SP-API

import { NextRequest, NextResponse } from 'next/server'
import { productDataService } from '@/lib/product-data-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || undefined
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const sortBy = searchParams.get('sortBy') as 'opportunity' | 'demand' | 'recent' | 'price' | 'bsr' | undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results = await productDataService.searchProducts(query, {
      category: category !== 'all' ? category : undefined,
      minOpportunityScore: minScore,
      priceMax: maxPrice,
      sortBy,
      limit
    })

    // Transform results for API response
    const response = {
      query,
      results: results.products.map(product => ({
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: product.price,
        currency: product.currency,
        rating: product.rating || product.reviewData?.averageRating,
        reviewCount: product.reviewCount || product.reviewData?.totalReviews,
        imageUrl: product.imageUrls[0],
        availability: product.availability,
        bsr: product.bsrData?.rank,
        bsrCategory: product.bsrData?.category,
        estimatedMonthlySales: product.bsrData?.estimatedMonthlySales,
        opportunityScore: product.analysis?.opportunityScore,
        demandScore: product.analysis?.demandScore,
        competitionScore: product.analysis?.competitionScore,
        feasibilityScore: product.analysis?.feasibilityScore,
        lastUpdated: product.lastUpdated
      })),
      pagination: {
        total: results.total,
        count: results.products.length,
        hasNextPage: results.hasNextPage,
        nextPageToken: results.nextPageToken
      },
      metadata: {
        searchTime: new Date().toISOString(),
        filters: {
          category,
          minScore,
          maxPrice,
          sortBy
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Amazon search API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to search products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { asins } = body

    if (!Array.isArray(asins) || asins.length === 0) {
      return NextResponse.json(
        { error: 'ASINs array is required' },
        { status: 400 }
      )
    }

    if (asins.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 ASINs allowed per request' },
        { status: 400 }
      )
    }

    // Fetch multiple products by ASIN
    const products = await Promise.all(
      asins.map(async (asin: string) => {
        try {
          return await productDataService.getProductByASIN(asin, true)
        } catch (error) {
          console.warn(`Failed to fetch product ${asin}:`, error)
          return null
        }
      })
    )

    const validProducts = products.filter(Boolean)

    const response = {
      results: validProducts.map(product => ({
        asin: product!.asin,
        title: product!.title,
        brand: product!.brand,
        category: product!.category,
        price: product!.price,
        currency: product!.currency,
        rating: product!.rating || product!.reviewData?.averageRating,
        reviewCount: product!.reviewCount || product!.reviewData?.totalReviews,
        imageUrl: product!.imageUrls[0],
        availability: product!.availability,
        bsr: product!.bsrData?.rank,
        bsrCategory: product!.bsrData?.category,
        estimatedMonthlySales: product!.bsrData?.estimatedMonthlySales,
        opportunityScore: product!.analysis?.opportunityScore,
        demandScore: product!.analysis?.demandScore,
        competitionScore: product!.analysis?.competitionScore,
        feasibilityScore: product!.analysis?.feasibilityScore,
        lastUpdated: product!.lastUpdated,
        // Include deep analysis if available
        deepAnalysis: product!.deepAnalysis ? {
          opportunityScore: product!.deepAnalysis.opportunityScore,
          marketSize: product!.deepAnalysis.marketSize,
          competitionLevel: product!.deepAnalysis.competitionLevel,
          demandTrends: product!.deepAnalysis.demandTrends
        } : undefined
      })),
      metadata: {
        requested: asins.length,
        found: validProducts.length,
        fetchTime: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Amazon bulk fetch API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}