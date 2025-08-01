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
    
    // Get niche overall analysis for the summary
    const { data: overallAnalysis } = await supabase
      .from('niches_overall_analysis')
      .select('niche_summary, category, subcategory, market_analysis')
      .eq('niche_id', id)
      .single()
    
    // Get products for this niche
    const asinList = niche.asins.split(',').map((a: string) => a.trim())
    
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select('*')
      .in('asin', asinList)
    
    // Format the response similar to a product page
    const showcaseData = {
      id: niche.id,
      title: niche.niche_name,
      subtitle: niche.category,
      category: overallAnalysis?.category || niche.category,
      nicheSummary: overallAnalysis?.niche_summary || '',
      asin: asinList[0], // Use first ASIN as primary
      asins: asinList,
      products: (products || []).map((p: any) => ({
        ...p,
        image_url: p.image_url && !p.image_url.startsWith('http') 
          ? `https://m.media-amazon.com/images/I/${p.image_url}`
          : p.image_url
      })),
      
      // Scores
      scores: {
        opportunity: niche.avg_opportunity_score || 0,
        competition: niche.avg_competition_score || 0,
        demand: niche.avg_demand_score || 0,
        feasibility: niche.avg_feasibility_score || 0,
        timing: niche.avg_timing_score || 0
      },
      
      // Metrics
      metrics: {
        price: {
          min: niche.min_price || 0,
          max: niche.max_price || 0,
          avg: niche.avg_price || 0
        },
        bsr: {
          avg: niche.avg_bsr || 0,
          range: niche.bsr_range || '0-0'
        },
        reviews: {
          total: niche.total_reviews || 0,
          avg: niche.avg_reviews || 0
        },
        rating: {
          avg: niche.avg_rating || 0
        },
        revenue: {
          monthly: niche.total_monthly_revenue || 0,
          perProduct: (niche.total_monthly_revenue || 0) / (niche.total_products || 1)
        }
      },
      
      // Market data
      market: {
        size: niche.market_size || 0,
        growth: niche.growth_rate || 0,
        seasonality: niche.seasonality || 'stable',
        competitionLevel: niche.competition_level || 'MEDIUM'
      },
      
      // Keywords
      keywords: niche.niche_keywords ? niche.niche_keywords.split(',').map((k: string) => k.trim()) : [],
      totalKeywords: niche.total_keywords || 0,
      
      // Analysis insights (default values for now - could be enhanced with demand analysis data later)
      insights: {
        whyThisNiche: 'This niche shows strong potential based on market demand and competition analysis.',
        keyHighlights: [
          'Growing market demand',
          'Moderate competition',
          'Good profit margins',
          'Multiple product opportunities'
        ],
        challenges: [
          'Requires initial investment',
          'Brand differentiation needed',
          'Quality control important'
        ],
        opportunities: [
          'Untapped sub-niches',
          'Bundle opportunities',
          'Cross-selling potential'
        ]
      },
      
      // Status
      status: niche.status,
      lastAnalyzed: niche.updated_at,
      createdAt: niche.created_at
    }
    
    return NextResponse.json(showcaseData)
    
  } catch (error) {
    console.error('Error fetching niche showcase data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch niche data' },
      { status: 500 }
    )
  }
}