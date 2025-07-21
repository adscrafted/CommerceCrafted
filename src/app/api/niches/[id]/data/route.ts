import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params
    // Use service client for full access to all tables
    const supabase = createServiceSupabaseClient()
    
    // First, try to find the niche by slug
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('slug', slug)
      .single()

    let nicheData = niche

    if (nicheError || !niche) {
      // If not found by slug, try to find by ID (in case slug is actually an ID)
      const { data: nicheById, error: nicheByIdError } = await supabase
        .from('niches')
        .select('*')
        .eq('id', slug)
        .single()

      if (nicheByIdError || !nicheById) {
        return NextResponse.json(
          { error: 'Niche not found' },
          { status: 404 }
        )
      }

      nicheData = nicheById
    }

    // Extract ASINs from the niche data
    const asins = nicheData.asins ? nicheData.asins.split(',').map((asin: string) => asin.trim()) : []
    
    
    if (asins.length === 0) {
      return NextResponse.json({
        niche: nicheData,
        products: []
      })
    }

    // Now fetch products by ASINs
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('asin', asins)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({
        niche: nicheData,
        products: [],
        keywords: []
      })
    }
    
    // Fetch keywords for all products in the niche
    // Note: Supabase has a default limit of 1000 rows, we need to explicitly set a higher limit
    const { data: keywords, error: keywordsError } = await supabase
      .from('product_keywords')
      .select('*')
      .in('product_id', asins)
      .limit(10000) // Set a high limit to get all keywords
    
    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError)
    }
    
    
    // Process keywords to build hierarchy
    const keywordHierarchy: any = {}
    
    if (keywords && keywords.length > 0) {
      // Group keywords by root words and subroots
      keywords.forEach((kw: any) => {
        const keyword = kw.keyword.toLowerCase()
        const words = keyword.split(' ')
        const rootWord = words[0] // First word as root
        const subroot = words.slice(0, 2).join(' ') // First two words as subroot
        
        // Initialize root if doesn't exist
        if (!keywordHierarchy[rootWord]) {
          keywordHierarchy[rootWord] = {
            totalRevenue: 0,
            totalOrders: 0,
            totalClicks: 0,
            keywordCount: 0,
            totalCPC: 0,
            avgConversionRate: 0,
            avgCPC: 0,
            avgSellingPrice: 29.99, // Default price, could be calculated from products
            subroots: {}
          }
        }
        
        // Initialize subroot if doesn't exist
        if (!keywordHierarchy[rootWord].subroots[subroot]) {
          keywordHierarchy[rootWord].subroots[subroot] = {
            totalRevenue: 0,
            totalOrders: 0,
            totalClicks: 0,
            keywordCount: 0,
            totalCPC: 0,
            avgConversionRate: 0,
            avgCPC: 0,
            avgSellingPrice: 29.99,
            keywords: []
          }
        }
        
        // Calculate metrics based on estimated data
        // Use suggested_bid as a proxy for value if no click/order data
        const estimatedOrders = kw.estimated_orders || Math.max(1, Math.round((kw.suggested_bid || 100) / 50))
        const estimatedClicks = kw.estimated_clicks || estimatedOrders * 8 // Assume 12.5% conversion rate
        const estimatedMonthlyRevenue = estimatedOrders * 29.99
        const estimatedConversionRate = estimatedClicks > 0 ? (estimatedOrders / estimatedClicks) * 100 : 12.5
        
        // Add keyword data
        const keywordData = {
          keyword: kw.keyword,
          monthlyRevenue: estimatedMonthlyRevenue,
          monthlyOrders: estimatedOrders,
          monthlyClicks: estimatedClicks,
          conversionRate: estimatedConversionRate,
          cpc: (kw.suggested_bid || 125) / 100, // Convert cents to dollars
          sellingPrice: 29.99,
          asin: kw.product_id
        }
        
        // Update root totals
        keywordHierarchy[rootWord].totalRevenue += estimatedMonthlyRevenue
        keywordHierarchy[rootWord].totalOrders += keywordData.monthlyOrders
        keywordHierarchy[rootWord].totalClicks += keywordData.monthlyClicks
        keywordHierarchy[rootWord].totalCPC += (kw.suggested_bid || 1.25) / 100 // Convert cents to dollars
        keywordHierarchy[rootWord].keywordCount += 1
        
        // Update subroot totals
        keywordHierarchy[rootWord].subroots[subroot].totalRevenue += estimatedMonthlyRevenue
        keywordHierarchy[rootWord].subroots[subroot].totalOrders += keywordData.monthlyOrders
        keywordHierarchy[rootWord].subroots[subroot].totalClicks += keywordData.monthlyClicks
        keywordHierarchy[rootWord].subroots[subroot].totalCPC += (kw.suggested_bid || 1.25) / 100 // Convert cents to dollars
        keywordHierarchy[rootWord].subroots[subroot].keywordCount += 1
        keywordHierarchy[rootWord].subroots[subroot].keywords.push(keywordData)
      })
      
      // Calculate averages for each root and subroot
      Object.keys(keywordHierarchy).forEach(root => {
        const rootData = keywordHierarchy[root]
        rootData.avgCPC = rootData.keywordCount > 0 ? (rootData.totalCPC / rootData.keywordCount).toFixed(2) : '1.25'
        rootData.avgConversionRate = rootData.totalClicks > 0 ? ((rootData.totalOrders / rootData.totalClicks) * 100).toFixed(1) : '12.5'
        
        Object.keys(rootData.subroots).forEach(subroot => {
          const subrootData = rootData.subroots[subroot]
          subrootData.avgCPC = subrootData.keywordCount > 0 ? (subrootData.totalCPC / subrootData.keywordCount).toFixed(2) : '1.25'
          subrootData.avgConversionRate = subrootData.totalClicks > 0 ? ((subrootData.totalOrders / subrootData.totalClicks) * 100).toFixed(1) : '12.5'
        })
      })
    }
    
    return NextResponse.json({
      niche: nicheData,
      products: products || [],
      keywords: keywords || [],
      keywordHierarchy,
      totalKeywords: keywords?.length || 0
    })
  } catch (error) {
    console.error('Error fetching niche data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch niche data' },
      { status: 500 }
    )
  }
}