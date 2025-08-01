import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Fetching secondary images for niche ID:', id)
    
    const supabase = await createServerSupabaseClient()
    
    // First try to get niche by ID
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', id)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get products using ASINs
    let productsWithImages = []
    if (niche.asins) {
      const asinList = niche.asins.split(',').map((a: string) => a.trim())
    
      const { data: products, error: productsError } = await supabase
        .from('product')
        .select('id, asin, title, image_urls')
        .in('asin', asinList)
      
      if (productsError) {
        console.error('Error fetching products:', productsError)
      } else if (products) {
        // Transform products to include all images
        productsWithImages = products.map((p: any) => {
          let allImages = []
          
          if (p.image_urls) {
            // Handle comma-separated string format (how Keepa data is stored)
            if (typeof p.image_urls === 'string') {
              // Split comma-separated images
              allImages = p.image_urls.split(',').map((img: string) => img.trim()).filter(Boolean)
            } else if (Array.isArray(p.image_urls)) {
              allImages = p.image_urls
            }
          }
          
          // Transform to full URLs
          const transformedImages = allImages.map((img: string) => 
            img.startsWith('http') ? img : `https://m.media-amazon.com/images/I/${img}`
          )
          
          return {
            id: p.id,
            asin: p.asin,
            title: p.title,
            mainImage: transformedImages[0] || 'https://via.placeholder.com/300x300?text=No+Image',
            secondaryImages: transformedImages.slice(1) || [],
            totalImages: transformedImages.length
          }
        })
      }
    }
    
    console.log(`Found ${productsWithImages.length} products with images for niche ${id}`)
    
    return NextResponse.json({
      niche: {
        id: niche.id,
        name: niche.niche_name || niche.name,
        asins: niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
      },
      products: productsWithImages
    })
    
  } catch (error) {
    console.error('Error fetching secondary images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch secondary images' },
      { status: 500 }
    )
  }
}