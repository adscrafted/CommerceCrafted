import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { slug } = await params
    
    // For now, we're using a simple mapping. In production, you'd query by slug
    const slugToNicheMap: { [key: string]: string } = {
      'smart-bluetooth-sleep-mask-with-built-in-speakers': 'niche_sleep_tech_001'
    }
    
    const nicheId = slugToNicheMap[slug]
    
    if (!nicheId) {
      // Try to find niche by name (slug format)
      const nicheName = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
      
      const { data: niche } = await supabase
        .from('niches')
        .select('*')
        .ilike('niche_name', `%${nicheName}%`)
        .single()
        
      if (!niche) {
        return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
      }
    }
    
    // Get niche data
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId || '')
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get all products in this niche
    const asins = niche.asins.split(',').filter((asin: string) => asin.trim())
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_analyses (*)
      `)
      .in('asin', asins)
    
    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
    
    // Get the first product with images to use as the main image
    const productWithImage = products?.find(p => p.image_urls) || products?.[0]
    const mainImage = productWithImage?.image_urls?.split(',')[0] || 
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop'
    
    // Get price history for all products
    const { data: priceHistory } = await supabase
      .from('keepa_price_history')
      .select('*')
      .in('product_id', products?.map(p => p.id) || [])
      .order('timestamp', { ascending: true })
    
    // Get sales rank history for all products
    const { data: salesRankHistory } = await supabase
      .from('keepa_sales_rank_history')
      .select('*')
      .in('product_id', products?.map(p => p.id) || [])
      .order('timestamp', { ascending: true })
    
    // Calculate aggregate scores
    const avgOpportunityScore = products?.reduce((acc, p) => {
      const score = p.product_analyses?.[0]?.opportunity_score || 0
      return acc + score
    }, 0) / (products?.length || 1)
    
    // Format response
    return NextResponse.json({
      niche: {
        id: niche.id,
        name: niche.niche_name,
        slug: slug,
        mainImage: mainImage,
        totalProducts: niche.total_products,
        avgOpportunityScore: avgOpportunityScore || niche.avg_opportunity_score,
        avgPrice: niche.avg_price,
        totalRevenue: niche.total_monthly_revenue,
        status: niche.status
      },
      products: products?.map(p => ({
        id: p.id,
        asin: p.asin,
        title: p.title,
        price: p.price,
        rating: p.rating,
        reviewCount: p.review_count,
        bsr: p.bsr,
        imageUrl: p.image_urls?.split(',')[0],
        analysis: p.product_analyses?.[0]
      })),
      priceHistory: priceHistory || [],
      salesRankHistory: salesRankHistory || [],
      lastUpdated: niche.updated_at
    })
    
  } catch (error) {
    console.error('Error fetching niche data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}