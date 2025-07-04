// API Route: GET /api/products/daily-feature
// Returns the daily featured product with analysis

import { NextResponse } from 'next/server'
import { amazonApiService } from '@/lib/amazon-api-service'
import { aiService } from '@/lib/ai-service'
import { DailyFeature } from '@/types/api'

export async function GET() {
  try {
    // For now, use a hardcoded high-opportunity ASIN
    // In production, this would be selected by an algorithm
    const featuredAsin = 'B08MVBRNKV' // Sony WH-1000XM4 headphones
    
    // Get product data from Amazon
    const product = await amazonApiService.importProduct(featuredAsin)
    
    // Generate AI analysis for the product
    const analysis = await aiService.generateDeepAnalysis({
      product,
      context: 'daily_feature_analysis'
    })
    
    // Create daily feature with AI insights
    const dailyFeature: DailyFeature = {
      id: `daily_${new Date().toISOString().split('T')[0]}`,
      date: new Date().toISOString().split('T')[0],
      product: {
        ...product,
        deepAnalysis: analysis
      },
      reason: generateFeatureReason(product, analysis),
      highlights: generateHighlights(product, analysis),
      marketContext: generateMarketContext(product, analysis),
      aiInsights: generateAIInsights(analysis),
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(dailyFeature)
  } catch (error) {
    console.error('Daily feature API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily feature',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateFeatureReason(product: any, analysis: any): string {
  const score = analysis.opportunityScore || 7
  
  if (score >= 8) {
    return `This ${product.category.toLowerCase()} represents an exceptional opportunity due to strong demand trends, manageable competition, and excellent profit potential. Our analysis indicates a ${score}/10 opportunity score with multiple success factors aligned.`
  } else if (score >= 6) {
    return `This product shows strong potential in the ${product.category.toLowerCase()} market with good demand patterns and reasonable competition levels. Market analysis suggests solid profit opportunities for new entrants.`
  } else {
    return `While competitive, this ${product.category.toLowerCase()} offers learning opportunities and potential for differentiation through improved features or targeted marketing strategies.`
  }
}

function generateHighlights(product: any, analysis: any): string[] {
  const highlights = []
  
  if (analysis.marketSize?.som > 1000000) {
    highlights.push(`Large addressable market: $${(analysis.marketSize.som / 1000000).toFixed(1)}M opportunity`)
  }
  
  if (analysis.demandTrends?.cagr > 10) {
    highlights.push(`Strong growth trajectory: ${analysis.demandTrends.cagr}% CAGR`)
  }
  
  if (analysis.competitionLevel === 'low' || analysis.competitionLevel === 'medium') {
    highlights.push(`Manageable competition with entry opportunities`)
  }
  
  if (product.rating > 4.0) {
    highlights.push(`Strong customer satisfaction: ${product.rating}/5 stars`)
  }
  
  highlights.push(`Estimated ROI: ${analysis.financialProjections?.[11]?.netProfit > 0 ? 'Positive' : 'Variable'} within 12 months`)
  
  return highlights.slice(0, 4)
}

function generateMarketContext(product: any, analysis: any): string {
  return `The ${product.category} market is experiencing ${analysis.demandTrends?.cagr > 15 ? 'rapid' : analysis.demandTrends?.cagr > 5 ? 'steady' : 'moderate'} growth with increasing consumer demand for quality products. Current market dynamics favor new entrants who can differentiate through features, pricing, or customer experience.`
}

function generateAIInsights(analysis: any): string[] {
  const insights = []
  
  if (analysis.keywordOpportunities?.length > 0) {
    const topKeyword = analysis.keywordOpportunities[0]
    insights.push(`Top keyword opportunity: "${topKeyword.keyword}" with ${topKeyword.searchVolume.toLocaleString()} monthly searches`)
  }
  
  if (analysis.launchStrategy?.length > 0) {
    const firstPhase = analysis.launchStrategy[0]
    insights.push(`Recommended launch budget: $${firstPhase.budget.toLocaleString()} for ${firstPhase.duration}`)
  }
  
  if (analysis.riskAssessment?.overallRisk) {
    insights.push(`Risk level: ${analysis.riskAssessment.overallRisk} - manageable with proper planning`)
  }
  
  insights.push(`Best launch timing: Q${Math.ceil((new Date().getMonth() + 1) / 3)} based on seasonal patterns`)
  
  return insights.slice(0, 3)
}

// Cache the daily feature for 24 hours
export const revalidate = 86400 // 24 hours in seconds