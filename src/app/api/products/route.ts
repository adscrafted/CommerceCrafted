import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        product_analyses!inner (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          keyword_analysis,
          financial_analysis
        )
      `)
      .eq('status', 'ACTIVE')

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`)
    }

    // Get total count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .or(search ? `title.ilike.%${search}%,category.ilike.%${search}%` : 'id.neq.00000000-0000-0000-0000-000000000000')

    // Get paginated results
    const { data: products, error } = await query
      .order('product_analyses.opportunity_score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedProducts = products?.map(product => ({
      id: product.id,
      slug: product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: product.title,
      mainImage: product.image_urls ? JSON.parse(product.image_urls)[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
      opportunityScore: product.product_analyses[0]?.opportunity_score || 0,
      scores: {
        demand: product.product_analyses[0]?.demand_score || 0,
        competition: product.product_analyses[0]?.competition_score || 0,
        keywords: product.product_analyses[0]?.keyword_analysis?.overallScore || 0,
        listing: product.product_analyses[0]?.feasibility_score || 0,
        intelligence: product.product_analyses[0]?.timing_score || 0,
        launch: product.product_analyses[0]?.keyword_analysis?.launchScore || 0,
        financial: product.product_analyses[0]?.financial_analysis?.overallScore || 0
      },
      category: product.category || 'Uncategorized',
      price: product.price ? `$${product.price.toFixed(2)}` : 'N/A',
      reviews: product.review_count ? 
        (product.review_count >= 1000 ? `${(product.review_count / 1000).toFixed(1)}K` : product.review_count.toString()) 
        : '0'
    })) || []

    return NextResponse.json({
      products: transformedProducts,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}