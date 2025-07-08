import { NextRequest, NextResponse } from 'next/server'
import { getTrendingKeywordsService } from '@/lib/trending-keywords-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const marketplaceId = searchParams.get('marketplaceId') || 'ATVPDKIKX0DER'
    const maxRank = parseInt(searchParams.get('maxRank') || '1000')
    const limit = parseInt(searchParams.get('limit') || '50')

    const trendingService = getTrendingKeywordsService()
    
    try {
      const keywords = await trendingService.getNewTrendingKeywords(
        marketplaceId,
        maxRank,
        limit
      )
      
      return NextResponse.json({ keywords })
    } catch (error) {
      console.error('New keywords query failed:', error)
      
      // Return empty array if insufficient data
      return NextResponse.json({ 
        keywords: [],
        message: 'Insufficient historical data for new keywords analysis'
      })
    }
  } catch (error) {
    console.error('Error in new keywords API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch new keywords' },
      { status: 500 }
    )
  }
}