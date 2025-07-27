import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    
    // Get niche data
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', id)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Get products for this niche
    const asinList = niche.asins.split(',').map((a: string) => a.trim())
    
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('*')
      .in('asin', asinList)
    
    if (!products || products.length === 0) {
      return NextResponse.json({ 
        salesRankHistory: [], 
        priceHistory: [],
        products: []
      })
    }
    
    // Get product IDs
    const productIds = products.map(p => p.id)
    
    // Fetch sales rank history
    const { data: salesRankHistory, error: salesRankError } = await supabase
      .from('product_sales_rank_history')
      .select('*')
      .in('product_id', productIds)
      .order('timestamp', { ascending: true })
    
    // Fetch price history
    const { data: priceHistory, error: priceError } = await supabase
      .from('product_price_history')
      .select('*')
      .in('product_id', productIds)
      .order('timestamp', { ascending: true })
    
    // Fetch keywords for all products in the niche
    console.log('Fetching keywords for ASINs:', asinList)
    const { data: keywords, error: keywordsError } = await supabase
      .from('product_keywords')
      .select('*')
      .in('product_id', asinList)
      .limit(10000) // Set a high limit to get all keywords
    
    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError)
    } else {
      console.log('Fetched keywords count:', keywords?.length || 0)
      if (keywords && keywords.length > 0) {
        console.log('Sample keyword:', keywords[0])
      }
    }
    
    // Process keywords to build hierarchy (same logic as in data route)
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
    
    // Transform the data for the frontend
    const response = {
      niche: {
        id: niche.id,
        name: niche.niche_name,
        category: niche.category,
        asins: asinList
      },
      products: products.map(p => ({
        id: p.id,
        asin: p.asin,
        title: p.title,
        price: p.price,
        bsr: p.bsr,
        rating: p.rating,
        reviewCount: p.review_count,
        image_url: p.image_url
      })),
      salesRankHistory: salesRankHistory || [],
      priceHistory: priceHistory || [],
      keywords: keywords || [],
      keywordHierarchy,
      totalKeywords: keywords?.length || 0
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error fetching history data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history data' },
      { status: 500 }
    )
  }
}