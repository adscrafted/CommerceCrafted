// API Route: GET /api/products/trending
// Returns trending products with highest opportunity scores

import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types/api'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Force dynamic behavior since we use searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '6')
    const sortBy = searchParams.get('sortBy') || 'opportunity'

    const supabase = await createServerSupabaseClient()
    
    // First, get all ASINs from niches (same logic as products API)
    const { data: niches } = await supabase
      .from('niches')
      .select('asins')
      
    // Extract all ASINs from niches
    const allAsins: string[] = []
    niches?.forEach(niche => {
      if (niche.asins) {
        const asins = niche.asins.split(',').map((a: string) => a.trim())
        allAsins.push(...asins)
      }
    })

    // If no ASINs found in niches, return empty array
    if (allAsins.length === 0) {
      console.log('No products found in niches')
      return NextResponse.json([])
    }

    // Fetch products that are in niches with their analyses
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_analyses (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          keyword_analysis,
          financial_analysis,
          created_at,
          updated_at
        )
      `)
      .in('asin', allAsins)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch products',
          message: error.message
        },
        { status: 500 }
      )
    }

    if (!products || products.length === 0) {
      console.log('No products found in database')
      return NextResponse.json([])
    }

    // Transform database products to match Product interface
    const transformedProducts: Product[] = products.map(product => {
      // Parse image URLs
      let imageUrls = []
      if (product.image_urls) {
        try {
          if (product.image_urls.startsWith('[') || product.image_urls.startsWith('{')) {
            imageUrls = JSON.parse(product.image_urls)
          } else {
            const filenames = product.image_urls.split(',').map((f: string) => f.trim())
            imageUrls = filenames.map((filename: string) => 
              `https://m.media-amazon.com/images/I/${filename}`
            )
          }
        } catch {
          imageUrls = [`https://m.media-amazon.com/images/I/${product.image_urls}`]
        }
      }
      
      // Get the first analysis if it exists
      const analysis = product.product_analyses && product.product_analyses.length > 0 
        ? product.product_analyses[0] 
        : null
        
      return {
        id: product.id,
        asin: product.asin,
        title: product.title,
        brand: product.brand || 'Unknown Brand',
        category: product.category || 'Uncategorized',
        subcategory: product.subcategory || '',
        price: product.price || 0,
        currency: 'USD',
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        imageUrls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'],
        images: imageUrls, // Add images field for compatibility
        imageUrl: imageUrls[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', // Add imageUrl for compatibility
        description: product.description || '',
        features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
        availability: 'in_stock' as const,
        bsr: product.bsr || 0,
        monthlySales: product.monthly_sales || 0,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        analysis: analysis ? {
          id: `analysis-${product.id}`,
          productId: product.id,
          opportunityScore: analysis.opportunity_score || 0,
          demandScore: analysis.demand_score || 0,
          competitionScore: analysis.competition_score || 0,
          feasibilityScore: analysis.feasibility_score || 0,
          financialAnalysis: analysis.financial_analysis || {
            estimatedMonthlySales: 0,
            estimatedRevenue: 0,
            profitMargin: 0,
            breakEvenUnits: 0,
            roi: 0,
            costOfGoodsSold: 0,
            fbaFees: 0,
            marketingCosts: 0
          },
          competitionAnalysis: {
            competitorCount: 0,
            averageRating: 0,
            priceRange: { min: 0, max: 0 },
            marketShare: 'Unknown',
            competitionLevel: 'medium' as const,
            barrierToEntry: 'medium' as const,
            topCompetitors: []
          },
          createdAt: analysis.created_at || new Date().toISOString(),
          updatedAt: analysis.updated_at || new Date().toISOString(),
          analysisVersion: '1.0'
        } : undefined
      }
    })

    // Apply sorting
    if (sortBy === 'opportunity' || sortBy === 'demand') {
      transformedProducts.sort((a, b) => (b.analysis?.opportunityScore || 0) - (a.analysis?.opportunityScore || 0))
    } else if (sortBy === 'recent') {
      transformedProducts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (sortBy === 'price') {
      transformedProducts.sort((a, b) => a.price - b.price)
    }

    console.log(`Returning ${transformedProducts.length} products from database`)
    return NextResponse.json(transformedProducts)
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