import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { openaiAnalysis } from '@/lib/integrations/openai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Skip auth checks in development mode
    if (process.env.NODE_ENV !== 'development') {
      // In production, add auth checks here
      console.log('Production mode: Auth checks would be performed here')
    }

    console.log('Generating AI analysis for ASIN:', asin)

    // First, get existing product data from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_analyses (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          financial_analysis,
          market_analysis,
          competition_analysis,
          keyword_analysis,
          review_analysis
        ),
        keyword_analyses (*)
      `)
      .eq('asin', asin)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found. Please sync SP-API data first.' },
        { status: 404 }
      )
    }

    // Prepare data for AI analysis
    const analysisPrompt = {
      asin: product.asin,
      productTitle: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      bsr: product.bsr,
      rating: product.rating,
      reviewCount: product.review_count,
      competitorData: product.product_analyses?.[0]?.competition_analysis || null,
      keywordData: product.keyword_analyses?.[0] || null,
      marketData: product.product_analyses?.[0]?.market_analysis || null,
      productAgeMonths: product.product_age_months,
      productAgeCategory: product.product_age_category,
      firstSeenDate: product.first_seen_date
    }

    // Generate AI analysis
    const aiAnalysis = await openaiAnalysis.analyzeProduct(analysisPrompt)
    
    if (!aiAnalysis) {
      return NextResponse.json(
        { error: 'Failed to generate AI analysis' },
        { status: 500 }
      )
    }

    console.log('AI analysis generated successfully')

    // Update product analysis with AI-generated data
    const { error: updateError } = await supabase
      .from('product_analyses')
      .upsert({
        asin: asin,
        opportunity_score: aiAnalysis.opportunityScore,
        competition_score: aiAnalysis.competitionScore,
        demand_score: aiAnalysis.demandScore,
        feasibility_score: aiAnalysis.feasibilityScore,
        timing_score: aiAnalysis.timingScore,
        ai_generated_content: aiAnalysis.reasoning,
        market_analysis: {
          ...product.product_analyses?.[0]?.market_analysis || {},
          aiInsights: aiAnalysis.insights,
          marketSize: aiAnalysis.marketAnalysis.size,
          marketTrend: aiAnalysis.marketAnalysis.trend,
          competitionLevel: aiAnalysis.marketAnalysis.competition,
          barriers: aiAnalysis.marketAnalysis.barriers
        },
        financial_analysis: {
          ...product.product_analyses?.[0]?.financial_analysis || {},
          aiRecommendations: aiAnalysis.recommendations,
          pricingStrategy: aiAnalysis.recommendations.pricing,
          marketingStrategy: aiAnalysis.recommendations.marketing
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'asin'
      })

    if (updateError) {
      console.error('Error updating product analysis:', updateError)
      return NextResponse.json(
        { error: 'Failed to save AI analysis' },
        { status: 500 }
      )
    }

    // Generate additional insights
    const [marketInsights, launchStrategy, keywordOpportunities] = await Promise.allSettled([
      openaiAnalysis.generateMarketInsights(product),
      openaiAnalysis.generateLaunchStrategy(product, product.product_analyses?.[0]?.competition_analysis),
      product.keyword_analyses?.[0] 
        ? openaiAnalysis.analyzeKeywordOpportunities(product.keyword_analyses[0], product.title)
        : Promise.resolve(null)
    ])

    // Cache the complete AI analysis
    const cacheExpiresAt = new Date()
    cacheExpiresAt.setDate(cacheExpiresAt.getDate() + 7) // Cache for 7 days

    const { error: cacheError } = await supabase
      .from('amazon_api_cache')
      .upsert({
        asin: asin,
        data_type: 'openai_analysis',
        raw_data: analysisPrompt,
        processed_data: {
          analysis: aiAnalysis,
          marketInsights: marketInsights.status === 'fulfilled' ? marketInsights.value : null,
          launchStrategy: launchStrategy.status === 'fulfilled' ? launchStrategy.value : null,
          keywordOpportunities: keywordOpportunities.status === 'fulfilled' ? keywordOpportunities.value : null
        },
        cache_expires_at: cacheExpiresAt.toISOString(),
        api_source: 'openai'
      }, {
        onConflict: 'asin,data_type'
      })

    if (cacheError) {
      console.error('Error caching AI analysis:', cacheError)
    }

    return NextResponse.json({
      success: true,
      asin: asin,
      data: {
        scores: {
          opportunity: aiAnalysis.opportunityScore,
          competition: aiAnalysis.competitionScore,
          demand: aiAnalysis.demandScore,
          feasibility: aiAnalysis.feasibilityScore,
          timing: aiAnalysis.timingScore,
          overall: aiAnalysis.overallScore
        },
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations,
        marketAnalysis: aiAnalysis.marketAnalysis,
        reasoning: aiAnalysis.reasoning,
        additionalInsights: {
          marketInsights: marketInsights.status === 'fulfilled' ? marketInsights.value : null,
          launchStrategy: launchStrategy.status === 'fulfilled' ? launchStrategy.value : null,
          keywordOpportunities: keywordOpportunities.status === 'fulfilled' ? keywordOpportunities.value : null
        }
      }
    })

  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate AI analysis', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
) {
  try {
    const { asin } = await params
    const supabase = await createServerSupabaseClient()

    // Get cached AI analysis
    const { data: cachedData, error } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin)
      .eq('data_type', 'openai_analysis')
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (error || !cachedData) {
      return NextResponse.json(
        { error: 'No cached AI analysis found. Try generating first.' },
        { status: 404 }
      )
    }

    // Also get the current product analysis
    const { data: productAnalysis, error: analysisError } = await supabase
      .from('product_analyses')
      .select('*')
      .eq('asin', asin)
      .single()

    return NextResponse.json({
      asin: asin,
      cachedAt: cachedData.created_at,
      expiresAt: cachedData.cache_expires_at,
      rawData: cachedData.raw_data,
      processedData: cachedData.processed_data,
      currentAnalysis: productAnalysis || null
    })

  } catch (error) {
    console.error('Error fetching AI analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI analysis' },
      { status: 500 }
    )
  }
}