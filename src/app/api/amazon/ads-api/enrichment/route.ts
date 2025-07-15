import { NextRequest, NextResponse } from 'next/server'
import { adsApiAuth } from '@/lib/amazon-ads-auth'

export async function POST(request: NextRequest) {
  try {
    const { asin, marketplace } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ 
        error: 'ASIN is required' 
      }, { status: 400 })
    }
    
    // Fetch keyword recommendations for the ASIN
    const keywordRequest = {
      recommendationType: 'KEYWORDS_FOR_ASINS',
      asins: [asin],
      maxRecommendations: 50,
      sortDimension: 'CLICKS',
      sortDirection: 'DESC',
      includeMetrics: true
    }
    
    let keywords: any[] = []
    
    try {
      const keywordResponse = await adsApiAuth.makeRequest(
        'POST',
        '/sp/targets/keywords/recommendations',
        'NA',
        keywordRequest,
        {
          'Content-Type': 'application/vnd.spkeywordsrecommendation.v4+json',
          'Accept': 'application/vnd.spkeywordsrecommendation.v4+json'
        }
      )
      
      keywords = keywordResponse.recommendations || []
    } catch (error) {
      console.log('Failed to get keyword recommendations, trying alternate method')
      // Try simpler endpoint if v4 fails
      const simpleResponse = await adsApiAuth.makeRequest(
        'GET',
        `/v2/sp/asins/${asin}/suggested/keywords`,
        'NA'
      )
      keywords = simpleResponse.suggestedKeywords || []
    }
    
    // Get bid recommendations for top keywords
    const topKeywords = keywords.slice(0, 10).map((k: any) => k.keyword || k)
    let bidData: any = {}
    
    if (topKeywords.length > 0) {
      try {
        const bidResponse = await adsApiAuth.makeRequest(
          'POST',
          '/v2/sp/keywords/bidRecommendations',
          'NA',
          {
            adGroupId: '1',
            keywords: topKeywords.map((k: string) => ({ keyword: k, matchType: 'EXACT' }))
          }
        )
        
        bidData = bidResponse.recommendations?.reduce((acc: any, rec: any) => {
          acc[rec.keyword] = rec.suggestedBid
          return acc
        }, {}) || {}
      } catch (error) {
        console.log('Failed to get bid recommendations')
      }
    }
    
    // Transform and enrich the keyword data
    const enrichedKeywords = keywords.map((kw: any) => {
      const keyword = kw.keyword || kw
      const metrics = kw.metrics || {}
      const bidInfo = bidData[keyword] || {}
      
      return {
        keyword,
        matchType: kw.matchType || 'BROAD',
        searchVolume: metrics.searches || metrics.searchVolume || 0,
        competitionLevel: metrics.competition || 'MEDIUM',
        suggestedBid: kw.suggestedBid?.rangeMedian || bidInfo.suggested || 0,
        estimatedClicks: metrics.clicks || 0,
        estimatedOrders: metrics.purchases || metrics.conversions || 0,
        impressionShare: metrics.impressionShare || 0,
        relevanceScore: kw.relevanceScore || metrics.relevance || 0.5
      }
    })
    
    // Calculate aggregates
    const totalKeywords = enrichedKeywords.length
    const avgSearchVolume = totalKeywords > 0 
      ? Math.floor(enrichedKeywords.reduce((sum, kw) => sum + kw.searchVolume, 0) / totalKeywords)
      : 0
    const avgCPC = totalKeywords > 0
      ? enrichedKeywords.reduce((sum, kw) => sum + kw.suggestedBid, 0) / totalKeywords
      : 0
    const totalClicks = enrichedKeywords.reduce((sum, kw) => sum + kw.estimatedClicks, 0)
    const totalOrders = enrichedKeywords.reduce((sum, kw) => sum + kw.estimatedOrders, 0)
    
    return NextResponse.json({
      enrichment: {
        asin,
        primaryKeywords: enrichedKeywords.slice(0, 5).map(k => k.keyword),
        totalKeywords,
        avgSearchVolume,
        avgCompetition: 'MEDIUM',
        avgCPC: parseFloat(avgCPC.toFixed(2)),
        marketOpportunity: avgSearchVolume > 50000 ? 'HIGH' : avgSearchVolume > 20000 ? 'MEDIUM' : 'LOW',
        estimatedMonthlyClicks: totalClicks,
        estimatedMonthlyOrders: totalOrders,
        estimatedMonthlyCost: parseFloat((totalClicks * avgCPC).toFixed(2))
      },
      keywords: enrichedKeywords,
      summary: {
        api: 'Amazon Ads API',
        endpoint: 'Keyword Enrichment',
        status: 'success',
        dataPoints: enrichedKeywords.length,
        responseTime: Date.now()
      }
    })
    
  } catch (error) {
    console.error('Amazon Ads API enrichment error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch enrichment data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}