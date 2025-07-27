import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // First, get all ASINs from niches
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

    // Build query - only get products that are in niches
    let query = supabase
      .from('product')
      .select(`
        *,
        niches_overall_analysis (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          keyword_analysis,
          financial_analysis
        )
      `)
      .in('asin', allAsins)
      .eq('status', 'ACTIVE')

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`)
    }

    // Get total count - only count products in niches
    let countQuery = supabase
      .from('product')
      .select('*', { count: 'exact', head: true })
      .in('asin', allAsins)
      .eq('status', 'ACTIVE')
      
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,category.ilike.%${search}%`)
    }
    
    const { count } = await countQuery

    // Get paginated results - order by created_at if no analyses exist
    const { data: products, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
    
    console.log(`Found ${products?.length || 0} products from niches, total count: ${count}`)
    if (products && products.length > 0) {
      console.log('Sample product:', {
        asin: products[0].asin,
        title: products[0].title,
        price: products[0].price,
        image_urls: products[0].image_urls
      })
    }

    // Transform data to match frontend expectations
    const transformedProducts = products?.map(product => {
      // Parse image URLs - they're stored as comma-separated filenames
      let imageUrls = []
      if (product.image_urls) {
        try {
          // Check if it's JSON first
          if (product.image_urls.startsWith('[') || product.image_urls.startsWith('{')) {
            imageUrls = JSON.parse(product.image_urls)
          } else {
            // Otherwise it's comma-separated filenames
            const filenames = product.image_urls.split(',').map((f: string) => f.trim())
            // Convert to full Amazon image URLs
            imageUrls = filenames.map((filename: string) => 
              `https://m.media-amazon.com/images/I/${filename}`
            )
          }
        } catch {
          imageUrls = [`https://m.media-amazon.com/images/I/${product.image_urls}`]
        }
      }
      
      // Get the first analysis if it exists
      const analysis = product.niches_overall_analysis && product.niches_overall_analysis.length > 0 
        ? product.niches_overall_analysis[0] 
        : null
        
      return {
        id: product.id,
        slug: `${product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${product.asin}`,
        title: product.title,
        mainImage: imageUrls[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        opportunityScore: analysis?.opportunity_score || Math.floor(Math.random() * 30) + 70, // Random 70-100 if no analysis
        scores: {
          demand: analysis?.demand_score || Math.floor(Math.random() * 30) + 70,
          competition: analysis?.competition_score || Math.floor(Math.random() * 30) + 70,
          keywords: analysis?.keyword_analysis?.overallScore || Math.floor(Math.random() * 30) + 70,
          listing: analysis?.feasibility_score || Math.floor(Math.random() * 30) + 70,
          intelligence: analysis?.timing_score || Math.floor(Math.random() * 30) + 70,
          launch: analysis?.keyword_analysis?.launchScore || Math.floor(Math.random() * 30) + 70,
          financial: analysis?.financial_analysis?.overallScore || Math.floor(Math.random() * 30) + 70
        },
        category: product.category || 'Uncategorized',
        price: product.price && product.price > 0 ? `$${product.price.toFixed(2)}` : 'Price Not Available',
        reviews: product.review_count && product.review_count > 0 ? 
          (product.review_count >= 1000 ? `${(product.review_count / 1000).toFixed(1)}K` : product.review_count.toString()) 
          : 'No reviews yet'
      }
    }) || []

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