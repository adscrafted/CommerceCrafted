import { NextRequest, NextResponse } from 'next/server'
import { adsApiAuth } from '@/lib/amazon-ads-auth'

export async function POST(request: NextRequest) {
  try {
    const { keywords, marketplace } = await request.json()
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ 
        error: 'Keywords array is required' 
      }, { status: 400 })
    }
    
    // Create bid recommendation request
    const requestBody = {
      keywords: keywords.map(keyword => ({
        keyword,
        matchType: 'EXACT' // Can be EXACT, PHRASE, or BROAD
      })),
      targetingExpressions: keywords.map(keyword => ({
        type: 'KEYWORD_EXACT',
        value: keyword
      }))
    }
    
    try {
      // Try v3 bid recommendations endpoint first
      const response = await adsApiAuth.makeRequest(
        'POST',
        '/v3/sp/targets/bid/recommendations',
        'NA',
        requestBody,
        {
          'Content-Type': 'application/vnd.spbidrecommendation.v3+json',
          'Accept': 'application/vnd.spbidrecommendation.v3+json'
        }
      )
      
      // Transform response
      const bidRecommendations = response.bidRecommendations?.map((rec: any) => ({
        keyword: rec.keyword || keywords[0],
        matchType: rec.matchType || 'EXACT',
        suggestedBid: rec.suggestedBid?.rangeMedian || rec.suggestedBid || 0,
        bidRange: {
          min: rec.suggestedBid?.rangeStart || 0,
          max: rec.suggestedBid?.rangeEnd || 0
        },
        estimatedImpressions: rec.metrics?.impressions || 0,
        estimatedClicks: rec.metrics?.clicks || 0,
        estimatedCost: rec.metrics?.cost || 0,
        estimatedConversions: rec.metrics?.purchases || 0,
        clickThroughRate: rec.metrics?.ctr || 0,
        conversionRate: rec.metrics?.cvr || 0
      })) || []
      
      return NextResponse.json({
        bidRecommendations,
        summary: {
          api: 'Amazon Ads API',
          endpoint: 'Bid Recommendations',
          status: 'success',
          dataPoints: bidRecommendations.length,
          responseTime: Date.now()
        }
      })
    } catch (v3Error) {
      // If v3 fails, try v2 endpoint
      console.log('V3 bid recommendations failed, trying V2:', v3Error)
      
      const v2Response = await adsApiAuth.makeRequest(
        'POST',
        '/v2/sp/keywords/bidRecommendations',
        'NA',
        {
          adGroupId: '1', // Dummy value for API requirement
          keywords: keywords.map(k => ({ keyword: k, matchType: 'EXACT' }))
        }
      )
      
      const bidRecommendations = v2Response.recommendations?.map((rec: any) => ({
        keyword: rec.keyword,
        matchType: rec.matchType,
        suggestedBid: rec.suggestedBid?.suggested || 0,
        bidRange: {
          min: rec.suggestedBid?.rangeStart || 0,
          max: rec.suggestedBid?.rangeEnd || 0
        },
        estimatedImpressions: 0, // V2 doesn't provide these metrics
        estimatedClicks: 0,
        estimatedCost: 0,
        estimatedConversions: 0,
        clickThroughRate: 0,
        conversionRate: 0
      })) || []
      
      return NextResponse.json({
        bidRecommendations,
        summary: {
          api: 'Amazon Ads API',
          endpoint: 'Bid Recommendations (V2)',
          status: 'success',
          dataPoints: bidRecommendations.length,
          responseTime: Date.now()
        }
      })
    }
    
  } catch (error) {
    console.error('Amazon Ads API bids error:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch bid recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}