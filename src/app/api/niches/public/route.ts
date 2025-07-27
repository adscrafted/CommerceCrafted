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

    // Build query for niches
    let query = supabase
      .from('niches')
      .select('*')
      .eq('status', 'completed') // Only show completed niches

    // Add search filter if provided
    if (search) {
      query = query.or(`niche_name.ilike.%${search}%,category.ilike.%${search}%`)
    }

    // Get total count
    let countQuery = supabase
      .from('niches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      
    if (search) {
      countQuery = countQuery.or(`niche_name.ilike.%${search}%,category.ilike.%${search}%`)
    }
    
    const { count } = await countQuery

    // Get paginated results
    const { data: niches, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching niches:', error)
      return NextResponse.json({ error: 'Failed to fetch niches' }, { status: 500 })
    }
    
    console.log(`Found ${niches?.length || 0} niches, total count: ${count}`)

    // Get product images for niches
    const nichesWithImages = await Promise.all(
      niches?.map(async (niche) => {
        // Parse the first ASIN to get a representative image
        const asins = niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
        
        let mainImage = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=300&fit=crop'
        
        // Try to get the first product's image
        if (asins.length > 0) {
          const { data: product } = await supabase
            .from('product')
            .select('image_urls')
            .eq('asin', asins[0])
            .single()
            
          if (product?.image_urls) {
            // Parse image URLs
            const imageFiles = product.image_urls.split(',').map((f: string) => f.trim())
            if (imageFiles.length > 0) {
              mainImage = `https://m.media-amazon.com/images/I/${imageFiles[0]}`
            }
          }
        }
        
        return { ...niche, mainImage }
      }) || []
    )

    // Transform data to match frontend expectations
    const transformedNiches = nichesWithImages?.map(niche => {
      const asins = niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
      
      return {
        id: niche.id,
        slug: niche.niche_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: niche.niche_name,
        mainImage: niche.mainImage,
        productCount: niche.total_products || asins.length,
        category: niche.category || 'Mixed Categories',
        avgPrice: niche.avg_price ? `$${niche.avg_price.toFixed(2)}` : 'Varies',
        totalReviews: niche.total_reviews || 0,
        opportunityScore: niche.opportunity_score || niche.avg_opportunity_score || 85,
        scores: {
          demand: niche.avg_demand_score || 80,
          competition: niche.avg_competition_score || 75,
          keywords: niche.total_keywords ? Math.min(100, Math.round(niche.total_keywords / 50)) : 85,
          listing: niche.avg_feasibility_score || 82,
          intelligence: niche.avg_timing_score || 78,
          launch: 85,
          financial: 88
        },
        // Additional niche-specific data
        monthlyRevenue: niche.total_monthly_revenue || 0,
        competitionLevel: niche.competition_level || 'MEDIUM',
        processingProgress: niche.processing_progress
      }
    }) || []

    return NextResponse.json({
      niches: transformedNiches,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error in niches API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}