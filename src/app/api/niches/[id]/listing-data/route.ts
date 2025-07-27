import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Fetching listing data for niche ID:', id)
    
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
    
    // Get products from ASINs
    let products = []
    if (niche.asins) {
      const asinList = niche.asins.split(',').map((a: string) => a.trim())
    
      const { data: asinProducts, error: productsError } = await supabase
        .from('product')
        .select('asin, title, bullet_points, a_plus_content, video_urls, category, subcategory, brand, image_urls')
        .in('asin', asinList)
      
      if (productsError) {
        console.error('Error fetching products by ASIN:', productsError)
      } else {
        products = asinProducts || []
      }
    }
    
    // Transform the data for easier consumption
    const transformedProducts = products.map((product: any) => {
      // Parse bullet points
      let bulletPoints = []
      if (product.bullet_points) {
        try {
          bulletPoints = typeof product.bullet_points === 'string' 
            ? JSON.parse(product.bullet_points) 
            : product.bullet_points
        } catch (e) {
          // If not JSON, split by common delimiters
          bulletPoints = product.bullet_points.split(/[•\n]/).filter((bp: string) => bp.trim())
        }
      }
      
      // Parse A+ content
      let aplusContent = null
      if (product.a_plus_content) {
        try {
          aplusContent = typeof product.a_plus_content === 'string'
            ? JSON.parse(product.a_plus_content)
            : product.a_plus_content
        } catch (e) {
          aplusContent = { modules: [] }
        }
      }
      
      // Parse video URLs
      let videos = []
      if (product.video_urls) {
        try {
          videos = typeof product.video_urls === 'string'
            ? JSON.parse(product.video_urls)
            : product.video_urls
        } catch (e) {
          // If not JSON, split by comma
          videos = product.video_urls.split(',').map((url: string) => ({
            url: url.trim(),
            title: 'Product Video',
            type: 'product'
          }))
        }
      }
      
      // Parse image URLs
      let images = []
      if (product.image_urls) {
        if (typeof product.image_urls === 'string') {
          images = product.image_urls.split(',').map((img: string) => img.trim()).filter(Boolean)
        } else if (Array.isArray(product.image_urls)) {
          images = product.image_urls
        }
      }
      
      return {
        asin: product.asin,
        title: product.title || '',
        bulletPoints: bulletPoints,
        aplusContent: aplusContent,
        videos: videos,
        category: product.category || '',
        subcategory: product.subcategory || '',
        productType: product.subcategory || product.category || 'General Product',
        brand: product.brand || '',
        images: images.map((img: string) => 
          img.startsWith('http') ? img : `https://m.media-amazon.com/images/I/${img}`
        )
      }
    })
    
    // Analyze common features across all products
    const analysis = analyzeListingData(transformedProducts)
    
    return NextResponse.json({
      success: true,
      niche: {
        id: niche.id,
        name: niche.niche_name || niche.name,
        totalProducts: transformedProducts.length
      },
      products: transformedProducts,
      analysis: analysis
    })
    
  } catch (error) {
    console.error('Error fetching listing data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing data' },
      { status: 500 }
    )
  }
}

function analyzeListingData(products: any[]) {
  // Analyze bullet points
  const allBulletPoints = products.flatMap(p => p.bulletPoints)
  const bulletPointAnalysis = {
    totalProducts: products.length,
    averageBulletPoints: products.reduce((sum, p) => sum + p.bulletPoints.length, 0) / products.length,
    commonFeatures: extractCommonFeatures(allBulletPoints),
    recommendations: generateBulletPointRecommendations(allBulletPoints)
  }
  
  // Analyze A+ content
  const productsWithAplus = products.filter(p => p.aplusContent && p.aplusContent.modules && p.aplusContent.modules.length > 0)
  const aplusAnalysis = {
    productsWithAplus: productsWithAplus.length,
    percentageWithAplus: (productsWithAplus.length / products.length) * 100,
    commonModules: analyzeAplusModules(productsWithAplus)
  }
  
  // Analyze videos
  const productsWithVideos = products.filter(p => p.videos && p.videos.length > 0)
  const videoAnalysis = {
    productsWithVideos: productsWithVideos.length,
    percentageWithVideos: (productsWithVideos.length / products.length) * 100,
    totalVideos: products.reduce((sum, p) => sum + (p.videos?.length || 0), 0),
    videoTypes: categorizeVideos(products)
  }
  
  // Analyze product types
  const productTypeAnalysis = {
    categories: [...new Set(products.map(p => p.category).filter(Boolean))],
    subcategories: [...new Set(products.map(p => p.subcategory).filter(Boolean))],
    brands: [...new Set(products.map(p => p.brand).filter(Boolean))],
    commonAttributes: extractCommonAttributes(products)
  }
  
  return {
    bulletPoints: bulletPointAnalysis,
    aplusContent: aplusAnalysis,
    videos: videoAnalysis,
    productTypes: productTypeAnalysis
  }
}

function extractCommonFeatures(bulletPoints: string[]) {
  const features: Record<string, number> = {}
  const keywords = [
    'material', 'size', 'dimension', 'warranty', 'certified', 'organic',
    'natural', 'free', 'safe', 'quality', 'durable', 'easy', 'premium',
    'professional', 'portable', 'waterproof', 'eco-friendly'
  ]
  
  bulletPoints.forEach(bp => {
    const lower = bp.toLowerCase()
    keywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        features[keyword] = (features[keyword] || 0) + 1
      }
    })
  })
  
  return Object.entries(features)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([feature, count]) => ({ feature, count }))
}

function generateBulletPointRecommendations(bulletPoints: string[]) {
  const recommendations = []
  const avgLength = bulletPoints.reduce((sum, bp) => sum + bp.length, 0) / bulletPoints.length
  
  if (avgLength < 100) {
    recommendations.push('Consider making bullet points more detailed (100-150 characters)')
  }
  if (avgLength > 200) {
    recommendations.push('Consider making bullet points more concise (100-150 characters)')
  }
  
  const hasNumbers = bulletPoints.some(bp => /\d/.test(bp))
  if (!hasNumbers) {
    recommendations.push('Include specific numbers and measurements when possible')
  }
  
  const hasBenefits = bulletPoints.some(bp => 
    /benefit|improve|enhance|better|help/i.test(bp)
  )
  if (!hasBenefits) {
    recommendations.push('Focus more on customer benefits rather than just features')
  }
  
  return recommendations
}

function analyzeAplusModules(products: any[]) {
  const moduleCounts: Record<string, number> = {}
  
  products.forEach(product => {
    if (product.aplusContent?.modules) {
      product.aplusContent.modules.forEach((module: any) => {
        const type = module.type || 'UNKNOWN'
        moduleCounts[type] = (moduleCounts[type] || 0) + 1
      })
    }
  })
  
  return Object.entries(moduleCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ type, count }))
}

function categorizeVideos(products: any[]) {
  const typeCounts: Record<string, number> = {}
  
  products.forEach(product => {
    if (product.videos) {
      product.videos.forEach((video: any) => {
        const type = video.type || 'unknown'
        typeCounts[type] = (typeCounts[type] || 0) + 1
      })
    }
  })
  
  return typeCounts
}

function extractCommonAttributes(products: any[]) {
  const attributes: Record<string, Set<string>> = {}
  
  products.forEach(product => {
    // Extract from title and category
    const text = `${product.title} ${product.category} ${product.subcategory}`.toLowerCase()
    
    // Common attribute patterns
    const patterns = {
      size: /(\d+(?:\.\d+)?)\s*(oz|lb|kg|g|ml|l|inch|cm|mm)/gi,
      count: /(\d+)\s*(pack|count|piece|pcs)/gi,
      color: /(black|white|red|blue|green|yellow|silver|gold|gray|pink)/gi
    }
    
    Object.entries(patterns).forEach(([attr, pattern]) => {
      const matches = text.match(pattern)
      if (matches) {
        if (!attributes[attr]) attributes[attr] = new Set()
        matches.forEach(match => attributes[attr].add(match))
      }
    })
  })
  
  return Object.entries(attributes).map(([attr, values]) => ({
    attribute: attr,
    values: Array.from(values)
  }))
}