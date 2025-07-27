import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Niche } from '@/types/product'

type NicheRow = Database['public']['Tables']['niches']['Row']
type ProductRow = Database['public']['Tables']['product']['Row']
type ProductAnalysisRow = Database['public']['Tables']['niches_overall_analysis']['Row']

export interface NicheWithAnalysis extends Niche {
  products?: Array<{
    id: string
    asin: string
    title: string
    price?: number
    rating?: number
    reviewCount?: number
    imageUrls?: string
    analysis?: {
      opportunityScore: number
      demandScore: number
      competitionScore: number
      feasibilityScore: number
      timingScore: number
      financialAnalysis: any
      marketAnalysis: any
      competitionAnalysis: any
      keywordAnalysis: any
      reviewAnalysis: any
      supplyChainAnalysis: any
    }
  }>
}

export async function getNicheBySlug(slug: string): Promise<NicheWithAnalysis | null> {
  try {
    // For now, we'll use the niche name as the slug
    // In a real app, you'd have a proper slug field
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select(`
        *,
        creator:users!created_by(*)
      `)
      .or(`niche_name.ilike.%${slug}%,id.eq.${slug}`)
      .single()

    if (nicheError || !niche) {
      return null
    }

    // Parse ASINs and fetch product data
    const asins = niche.asins.split(',').map(asin => asin.trim())
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select(`
        *,
        analysis:niches_overall_analysis(*)
      `)
      .in('asin', asins)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return { ...niche, products: [] }
    }

    return {
      ...niche,
      products: products?.map(product => ({
        id: product.id,
        asin: product.asin,
        title: product.title,
        price: product.price,
        rating: product.rating,
        reviewCount: product.review_count,
        imageUrls: product.image_urls,
        analysis: product.analysis ? {
          opportunityScore: product.analysis.opportunity_score,
          demandScore: product.analysis.demand_score,
          competitionScore: product.analysis.competition_score,
          feasibilityScore: product.analysis.feasibility_score,
          timingScore: product.analysis.timing_score,
          financialAnalysis: product.analysis.financial_analysis,
          marketAnalysis: product.analysis.market_analysis,
          competitionAnalysis: product.analysis.competition_analysis,
          keywordAnalysis: product.analysis.keyword_analysis,
          reviewAnalysis: product.analysis.review_analysis,
          supplyChainAnalysis: product.analysis.supply_chain_analysis
        } : undefined
      })) || []
    }
  } catch (error) {
    console.error('Error fetching niche:', error)
    return null
  }
}

export async function getAllNiches(): Promise<Niche[]> {
  try {
    const { data: niches, error } = await supabase
      .from('niches')
      .select(`
        *,
        creator:users!created_by(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching niches:', error)
      return []
    }

    return niches || []
  } catch (error) {
    console.error('Error fetching niches:', error)
    return []
  }
}

export async function getNicheAnalysisData(nicheId: string) {
  try {
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select(`
        *,
        creator:users!created_by(*)
      `)
      .eq('id', nicheId)
      .single()

    if (nicheError || !niche) {
      return null
    }

    // Parse ASINs and fetch product data with analysis
    const asins = niche.asins.split(',').map(asin => asin.trim())
    const { data: products, error: productsError } = await supabase
      .from('product')
      .select(`
        *,
        analysis:niches_overall_analysis(*),
        keywords:product_keywords(
          *,
          keyword:keywords(*)
        )
      `)
      .in('asin', asins)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return null
    }

    // Calculate aggregate metrics
    const totalRevenue = products?.reduce((sum, product) => {
      const revenue = product.analysis?.financial_analysis?.projectedMonthlyRevenue || 0
      return sum + revenue
    }, 0) || 0

    const avgOpportunityScore = products?.reduce((sum, product) => {
      return sum + (product.analysis?.opportunity_score || 0)
    }, 0) / (products?.length || 1)

    const avgDemandScore = products?.reduce((sum, product) => {
      return sum + (product.analysis?.demand_score || 0)
    }, 0) / (products?.length || 1)

    const avgCompetitionScore = products?.reduce((sum, product) => {
      return sum + (product.analysis?.competition_score || 0)
    }, 0) / (products?.length || 1)

    const avgFeasibilityScore = products?.reduce((sum, product) => {
      return sum + (product.analysis?.feasibility_score || 0)
    }, 0) / (products?.length || 1)

    const avgTimingScore = products?.reduce((sum, product) => {
      return sum + (product.analysis?.timing_score || 0)
    }, 0) / (products?.length || 1)

    // Generate analysis insights
    const insights = {
      marketOverview: {
        totalProducts: products?.length || 0,
        totalRevenue: totalRevenue
      },
      opportunityScores: {
        overall: Math.round(avgOpportunityScore / 10),
        demand: Math.round(avgDemandScore / 10),
        competition: Math.round(avgCompetitionScore / 10),
        feasibility: Math.round(avgFeasibilityScore / 10),
        timing: Math.round(avgTimingScore / 10)
      },
      topProducts: products
        ?.sort((a, b) => (b.analysis?.opportunity_score || 0) - (a.analysis?.opportunity_score || 0))
        .slice(0, 5)
        .map(product => ({
          asin: product.asin,
          title: product.title,
          price: product.price,
          rating: product.rating,
          reviewCount: product.review_count,
          imageUrls: product.image_urls,
          opportunityScore: product.analysis?.opportunity_score || 0
        })) || [],
      keywords: products?.flatMap(product => 
        product.keywords?.map(pk => ({
          keyword: pk.keyword?.keyword,
          searchVolume: pk.keyword?.search_volume,
          competitionScore: pk.keyword?.competition_score,
          relevanceScore: pk.relevance_score
        })) || []
      ).slice(0, 20) || []
    }

    return {
      niche,
      products,
      insights
    }
  } catch (error) {
    console.error('Error fetching niche analysis data:', error)
    return null
  }
}