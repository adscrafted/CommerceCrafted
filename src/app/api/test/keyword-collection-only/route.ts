import { NextRequest, NextResponse } from 'next/server'

// Fresh ASINs for testing
const TEST_ASINS = [
  'B07WYT9MZB', // Food storage containers
  'B08PF3BF8W', // Kitchen organizer
  'B099K47B3H'  // Food labels
]

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Keyword Collection Test - Real Amazon Ads API')
    console.log('📦 Test ASINs:', TEST_ASINS)
    
    // Collect keywords from Amazon Ads API
    console.log('\n📋 Collecting keywords from Amazon Ads API...')
    const keywordResponse = await fetch(`http://localhost:3001/api/amazon/ads-api/keywords-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asins: TEST_ASINS,
        marketplace: 'US'
      })
    })
    
    if (!keywordResponse.ok) {
      throw new Error(`Keyword collection failed: ${await keywordResponse.text()}`)
    }
    
    const keywordData = await keywordResponse.json()
    
    // Analyze the results
    const totalKeywords = keywordData.keywords?.length || 0
    const keywordsWithBids = keywordData.keywords?.filter(kw => kw.suggestedBid > 0).length || 0
    const keywordsWithClicks = keywordData.keywords?.filter(kw => kw.estimatedClicks > 0).length || 0
    const keywordsWithOrders = keywordData.keywords?.filter(kw => kw.estimatedOrders > 0).length || 0
    
    // Group by source
    const bySource = keywordData.keywords?.reduce((acc, kw) => {
      acc[kw.source] = (acc[kw.source] || 0) + 1
      return acc
    }, {}) || {}
    
    // Get bid range
    const bids = keywordData.keywords?.map(kw => kw.suggestedBid).filter(bid => bid > 0) || []
    const bidRange = bids.length > 0 ? {
      min: Math.min(...bids),
      max: Math.max(...bids),
      avg: bids.reduce((sum, bid) => sum + bid, 0) / bids.length
    } : null
    
    // Sample keywords for each ASIN
    const samplesByAsin = {}
    for (const asin of TEST_ASINS) {
      const asinKeywords = keywordData.keywords?.filter(kw => kw.asin === asin) || []
      samplesByAsin[asin] = {
        total: asinKeywords.length,
        withBids: asinKeywords.filter(kw => kw.suggestedBid > 0).length,
        withClicks: asinKeywords.filter(kw => kw.estimatedClicks > 0).length,
        samples: asinKeywords.slice(0, 5).map(kw => ({
          keyword: kw.keyword,
          matchType: kw.matchType,
          source: kw.source,
          bid: `$${(kw.suggestedBid || 0).toFixed(2)}`,
          clicks: kw.estimatedClicks || 0,
          orders: kw.estimatedOrders || 0
        }))
      }
    }
    
    const report = {
      success: true,
      summary: {
        totalKeywords,
        keywordsWithBids,
        keywordsWithClicks,
        keywordsWithOrders,
        bySource,
        bidRange: bidRange ? {
          min: `$${bidRange.min.toFixed(2)}`,
          max: `$${bidRange.max.toFixed(2)}`,
          avg: `$${bidRange.avg.toFixed(2)}`
        } : null
      },
      byAsin: samplesByAsin,
      apiResponse: keywordData.summary,
      verification: {
        hasRealData: totalKeywords > 0,
        hasBidData: keywordsWithBids > 0,
        hasClickEstimates: keywordsWithClicks > 0,
        hasOrderEstimates: keywordsWithOrders > 0,
        dataQuality: {
          bidCoverage: `${Math.round((keywordsWithBids / totalKeywords) * 100)}%`,
          clickCoverage: `${Math.round((keywordsWithClicks / totalKeywords) * 100)}%`,
          orderCoverage: `${Math.round((keywordsWithOrders / totalKeywords) * 100)}%`
        }
      }
    }
    
    console.log('\n✅ Keyword Collection Complete!')
    console.log(`📊 Total keywords: ${totalKeywords}`)
    console.log(`💰 Keywords with bids: ${keywordsWithBids}`)
    console.log(`📈 Keywords with clicks: ${keywordsWithClicks}`)
    console.log(`🛒 Keywords with orders: ${keywordsWithOrders}`)
    
    return NextResponse.json(report)
    
  } catch (error) {
    console.error('💥 Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Keyword Collection Test',
    description: 'Tests keyword collection from Amazon Ads API without database operations',
    usage: 'POST /api/test/keyword-collection-only',
    testAsins: TEST_ASINS
  })
}