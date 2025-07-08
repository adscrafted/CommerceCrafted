import { NextRequest, NextResponse } from 'next/server'
import { getTrendingKeywordsService } from '@/lib/trending-keywords-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const marketplaceId = searchParams.get('marketplaceId') || 'ATVPDKIKX0DER'
    const minRankImprovement = parseInt(searchParams.get('minRankImprovement') || '100')
    const limit = parseInt(searchParams.get('limit') || '100')

    const trendingService = getTrendingKeywordsService()
    
    try {
      const keywords = await trendingService.getSkyrocketingKeywords(
        marketplaceId,
        minRankImprovement,
        limit
      )
      
      return NextResponse.json({ keywords })
    } catch (error) {
      console.error('Skyrocketing keywords query failed:', error)
      
      // Return empty array if insufficient data
      return NextResponse.json({ 
        keywords: [],
        message: 'Insufficient historical data for trending analysis'
      })
    }
  } catch (error) {
    console.error('Error in skyrocketing keywords API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending keywords' },
      { status: 500 }
    )
  }
}