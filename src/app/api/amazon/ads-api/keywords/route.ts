import { NextRequest, NextResponse } from 'next/server'
import { adsApiAuth } from '@/lib/amazon-ads-auth'

export async function POST(request: NextRequest) {
  try {
    const { keyword, asin, marketplace } = await request.json()
    
    if (!keyword && !asin) {
      return NextResponse.json({ 
        error: 'Either keyword or ASIN is required' 
      }, { status: 400 })
    }
    
    // For keyword-based suggestions, we'll use the suggested keywords endpoint
    if (keyword && !asin) {
      const response = await adsApiAuth.makeRequest(
        'GET',
        `/v2/sp/suggestedKeywords?keyword=${encodeURIComponent(keyword)}&maxNumSuggestions=100`,
        'NA'
      )
      
      return NextResponse.json({
        keywords: response.suggestedKeywords || [],
        summary: {
          api: 'Amazon Ads API',
          endpoint: 'Suggested Keywords',
          status: 'success',
          dataPoints: response.suggestedKeywords?.length || 0,
          responseTime: Date.now()
        }
      })
    }
    
    // For ASIN-based suggestions, we'll use the keyword recommendations endpoint
    if (asin) {
      // First, try the v4 recommendations endpoint
      try {
        const requestBody = {
          recommendationType: 'KEYWORDS_FOR_ASINS',
          asins: [asin],
          maxRecommendations: 100,
          sortDimension: 'CLICKS',
          sortDirection: 'DESC',
          includeExtendedDataFields: true
        }
        
        const response = await adsApiAuth.makeRequest(
          'POST',
          '/sp/targets/keywords/recommendations',
          'NA',
          requestBody,
          {
            'Content-Type': 'application/vnd.spkeywordsrecommendation.v4+json',
            'Accept': 'application/vnd.spkeywordsrecommendation.v4+json'
          }
        )
        
        console.log('V4 API Response:', JSON.stringify(response, null, 2))
        
        // Transform the response to a consistent format
        const keywords = response.recommendations?.map((rec: any) => ({
          keyword: rec.keyword,
          matchType: rec.matchType || 'BROAD',
          searchVolume: rec.metrics?.searches || 0,
          competitionLevel: rec.metrics?.competition || 'MEDIUM',
          suggestedBid: rec.suggestedBid?.rangeMedian || 0,
          estimatedClicks: rec.metrics?.clicks || 0,
          estimatedOrders: rec.metrics?.purchases || 0,
          impressionShare: rec.metrics?.impressionShare || 0,
          relevanceScore: rec.relevanceScore || 0
        })) || []
        
        // If v4 returns empty, try v3
        if (keywords.length === 0) {
          console.log('V4 returned no results, trying V3 endpoint')
          const v3Response = await adsApiAuth.makeRequest(
            'POST',
            '/v2/sp/keywords/recommended',
            'NA',
            {
              campaignId: '1',
              adGroupId: '1', 
              asins: [asin],
              maxNumSuggestions: 100
            }
          )
          
          console.log('V3 API Response:', JSON.stringify(v3Response, null, 2))
          
          // Map v3 response
          if (v3Response.keywords) {
            return NextResponse.json({
              keywords: v3Response.keywords.map((kw: any) => ({
                keyword: kw.keywordText || kw.keyword,
                matchType: kw.matchType || 'BROAD',
                searchVolume: 0,
                competitionLevel: 'UNKNOWN',
                suggestedBid: kw.suggestedBid || 0,
                estimatedClicks: 0,
                estimatedOrders: 0,
                impressionShare: 0,
                relevanceScore: 0
              })),
              summary: {
                api: 'Amazon Ads API',
                endpoint: 'Keyword Recommendations (V3)',
                status: 'success',
                dataPoints: v3Response.keywords?.length || 0,
                responseTime: Date.now()
              }
            })
          }
        }
      
        return NextResponse.json({
          keywords,
          summary: {
            api: 'Amazon Ads API',
            endpoint: 'Keyword Recommendations',
            status: 'success',
            dataPoints: keywords.length,
            responseTime: Date.now()
          }
        })
      } catch (v4Error) {
        console.error('V4 endpoint error:', v4Error)
        // Try simpler v2 endpoint
        try {
          const v2Response = await adsApiAuth.makeRequest(
            'GET',
            `/v2/sp/asins/${asin}/suggested/keywords`,
            'NA'
          )
          
          console.log('V2 API Response:', JSON.stringify(v2Response, null, 2))
          
          return NextResponse.json({
            keywords: (v2Response.suggestedKeywords || []).map((kw: string) => ({
              keyword: kw,
              matchType: 'BROAD',
              searchVolume: 0,
              competitionLevel: 'UNKNOWN',
              suggestedBid: 0,
              estimatedClicks: 0,
              estimatedOrders: 0,
              impressionShare: 0,
              relevanceScore: 0
            })),
            summary: {
              api: 'Amazon Ads API',
              endpoint: 'Suggested Keywords (V2)',
              status: 'success',
              dataPoints: v2Response.suggestedKeywords?.length || 0,
              responseTime: Date.now()
            }
          })
        } catch (v2Error) {
          console.error('V2 endpoint error:', v2Error)
          throw v2Error
        }
      }
    }
    
  } catch (error) {
    console.error('Amazon Ads API keywords error:', error)
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json({
        error: 'Authentication failed',
        details: 'Please check your Amazon Ads API credentials',
        message: error.message
      }, { status: 401 })
    }
    
    return NextResponse.json({
      error: 'Failed to fetch keyword data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}