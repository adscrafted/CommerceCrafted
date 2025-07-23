import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Fetching products for niche ID:', id)
    
    const supabase = await createServerSupabaseClient()
    
    // First try to get niche by ID
    let { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', id)
      .single()
    
    // If not found by ID, try by slug
    if (nicheError || !niche) {
      console.log('Not found by ID, trying by slug:', id)
      const slugResult = await supabase
        .from('niches')
        .select('*')
        .eq('slug', id)
        .single()
      
      if (slugResult.error) {
        console.error('Error fetching niche by slug:', slugResult.error)
        return NextResponse.json({ error: 'Niche not found', details: slugResult.error }, { status: 404 })
      }
      
      niche = slugResult.data
    }
    
    if (!niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Since there's no niche_products relation, get products directly from ASINs
    let finalProducts = []
    if (niche.asins) {
      console.log('No products in relation, trying asins field:', niche.asins)
      const asinList = niche.asins.split(',').map((a: string) => a.trim())
    
      const { data: asinProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('asin', asinList)
      
      if (productsError) {
        console.error('Error fetching products by ASIN:', productsError)
      } else {
        finalProducts = asinProducts || []
      }
    }
    
    // Transform image URLs if needed
    const transformedProducts = (finalProducts || []).map((p: any) => {
      let imageUrl = 'https://via.placeholder.com/300x300?text=No+Image'
      
      if (p.image_urls) {
        let firstImage = ''
        
        // Handle comma-separated string format (how Keepa data is stored)
        if (typeof p.image_urls === 'string') {
          const images = p.image_urls.split(',').map((img: string) => img.trim()).filter(Boolean)
          firstImage = images[0] || ''
        } else if (Array.isArray(p.image_urls)) {
          firstImage = p.image_urls[0] || ''
        }
        
        if (firstImage) {
          imageUrl = firstImage.startsWith('http') 
            ? firstImage 
            : `https://m.media-amazon.com/images/I/${firstImage}`
        }
      }
      
      return {
        ...p,
        image_url: imageUrl
      }
    })
    
    console.log(`Found ${transformedProducts.length} products for niche ${id}`)
    
    return NextResponse.json({
      niche: {
        id: niche.id,
        name: niche.niche_name || niche.name,
        asins: niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
      },
      products: transformedProducts
    })
    
  } catch (error) {
    console.error('Error fetching niche products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}