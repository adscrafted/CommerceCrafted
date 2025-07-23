import { NextRequest, NextResponse } from 'next/server'
import { adsApiAuth, getAdsApiAuth } from '@/lib/amazon-ads-auth'

// ========================================
// RATE LIMITER (JungleAce-style)
// ========================================

class RateLimiter {
  private requests: number[] = []
  private readonly maxRequestsPerSecond: number
  private readonly maxRequestsPerMinute: number
  private readonly windowSize: number = 1000 // 1 second
  
  constructor(maxPerSecond: number = 10, maxPerMinute: number = 200) {
    this.maxRequestsPerSecond = maxPerSecond
    this.maxRequestsPerMinute = maxPerMinute
  }

  async waitForSlot(): Promise<number> {
    const now = Date.now()
    
    // Clean old requests (older than 1 minute)
    this.requests = this.requests.filter(timestamp => now - timestamp < 60000)
    
    // Check minute limit
    if (this.requests.length >= this.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = 60000 - (now - oldestRequest) + 100
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return waitTime
    }
    
    // Check second limit
    const recentRequests = this.requests.filter(timestamp => now - timestamp < this.windowSize)
    if (recentRequests.length >= this.maxRequestsPerSecond) {
      const oldestRecent = Math.min(...recentRequests)
      const waitTime = this.windowSize - (now - oldestRecent) + 50
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return waitTime
    }
    
    // Record this request
    this.requests.push(Date.now())
    return 0
  }
}

const rateLimiter = new RateLimiter(10, 200)

// ========================================
// RETRY MANAGER (JungleAce-style)
// ========================================

class RetryManager {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation',
    maxAttempts: number = 3
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        const errorMessage = lastError.message.toLowerCase()
        
        // Check if we should retry
        const shouldRetry = this.shouldRetry(errorMessage, attempt, maxAttempts)
        
        if (!shouldRetry) {
          throw lastError
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError || new Error(`${context} failed after ${maxAttempts} attempts`)
  }

  private shouldRetry(errorMessage: string, attempt: number, maxAttempts: number): boolean {
    if (attempt >= maxAttempts) return false
    
    // Don't retry auth failures (4xx)
    if (errorMessage.includes('4') && errorMessage.includes('0')) {
      return false
    }
    
    // Retry server errors (5xx)
    if (errorMessage.includes('5') && errorMessage.includes('0')) {
      return true
    }
    
    // Retry network errors, timeouts, etc.
    return errorMessage.includes('timeout') ||
           errorMessage.includes('network') ||
           errorMessage.includes('connection') ||
           errorMessage.includes('econnreset') ||
           errorMessage.includes('fetch')
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = 500
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 0.3 * exponentialDelay
    const totalDelay = exponentialDelay + jitter
    
    return Math.min(totalDelay, 15000) // Max 15 seconds
  }
}

const retryManager = new RetryManager()

// ========================================
// CONSOLIDATED KEYWORD ENDPOINT
// ========================================

export async function POST(request: NextRequest) {
  try {
    const { asins, marketplace = 'US' } = await request.json()
    
    if (!asins || asins.length === 0) {
      return NextResponse.json({ 
        error: 'ASINs are required' 
      }, { status: 400 })
    }
    
    // JungleAce-style batch size limit
    if (asins.length > 8) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 8 ASINs allowed per request',
        suggestion: 'Break large ASIN lists into smaller batches'
      }, { status: 400 })
    }
    
    console.log('🚀 JungleAce-Style Keyword Collection Started')
    console.log(`📊 Processing ${asins.length} ASINs`)
    
    // Get US marketplace profile
    const auth = getAdsApiAuth()
    const usProfileId = await auth.getUSProfile()
    
    console.log('🇺🇸 US Profile ID:', usProfileId)
    
    // Collect keywords with timeout protection (JungleAce pattern)
    const [suggestedResults, recommendationResults] = await Promise.allSettled([
      Promise.race([
        collectSuggestedKeywords(asins, usProfileId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Suggested keywords timeout')), 30000)
        )
      ]).catch(error => {
        console.warn(`⚠️ Suggested keywords failed: ${error.message}`)
        return { keywords: [], totalCount: 0 }
      }),
      Promise.race([
        collectRecommendations(asins, usProfileId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Recommendations timeout')), 30000)
        )
      ]).catch(error => {
        console.warn(`⚠️ Recommendations failed: ${error.message}`)
        return { keywords: [], totalCount: 0 }
      })
    ])
    
    // Process results with graceful degradation
    const suggestedData = suggestedResults.status === 'fulfilled' ? suggestedResults.value : { keywords: [], totalCount: 0 }
    const recommendationData = recommendationResults.status === 'fulfilled' ? recommendationResults.value : { keywords: [], totalCount: 0 }
    
    // Merge and deduplicate
    console.log('🔄 Merging keyword sources...')
    const mergedKeywords = mergeKeywords(suggestedData, recommendationData)
    
    // Get bid recommendations with timeout protection
    console.log('💰 Getting bid recommendations and estimates...')
    let enrichedKeywords = mergedKeywords
    
    try {
      enrichedKeywords = await Promise.race([
        getBidRecommendations(mergedKeywords, usProfileId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bid recommendations timeout')), 45000)
        )
      ])
    } catch (error) {
      console.warn(`⚠️ Bid recommendations failed, using keywords without bid data: ${error.message}`)
      enrichedKeywords = mergedKeywords
    }
    
    console.log(`✅ Total keywords collected: ${enrichedKeywords.length}`)
    
    return NextResponse.json({
      success: true,
      keywords: enrichedKeywords,
      summary: {
        totalKeywords: enrichedKeywords.length,
        asinsProcessed: asins.length,
        suggestedKeywords: suggestedData.totalCount,
        recommendations: recommendationData.totalCount,
        withEstimates: enrichedKeywords.filter(k => k.estimatedClicks > 0).length
      }
    })
    
  } catch (error) {
    console.error('💥 JungleAce-style keyword collection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to collect keywords',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ========================================
// KEYWORD COLLECTION FUNCTIONS
// ========================================

// Collect suggested keywords (JungleAce exact pattern)
async function collectSuggestedKeywords(asins: string[], profileId: string | null) {
  const allKeywords = []
  let totalCount = 0
  
  for (const asin of asins) {
    try {
      console.log(`📋 Fetching suggested keywords for ${asin}...`)
      
      // Apply rate limiting first
      await rateLimiter.waitForSlot()
      
      const keywords = await retryManager.executeWithRetry(
        async () => {
          // JungleAce exact request structure
          const requestBody = {
            asins: [asin], // Array with single ASIN
            maxNumSuggestions: 1000
          }
          
          console.log(`🔍 API Request for ASIN ${asin} to /v2/asins/suggested/keywords`)
          
          const response = await adsApiAuth.makeRequest(
            'POST',
            '/v2/asins/suggested/keywords',
            {},
            requestBody
          )
          
          // Handle multiple response formats
          let suggestedKeywords = []
          
          if (Array.isArray(response)) {
            suggestedKeywords = response || []
          } else if (response?.suggestedKeywords) {
            suggestedKeywords = response.suggestedKeywords
          } else if (response?.data) {
            suggestedKeywords = response.data
          }
          
          console.log(`✅ ASIN ${asin}: ${suggestedKeywords.length} keywords found`)
          
          return suggestedKeywords.map(item => ({
            asin,
            keyword: item.keywordText || item.keyword || item,
            matchType: item.matchType || 'BROAD',
            source: 'suggested'
          }))
        },
        `suggested-keywords-${asin}`,
        2 // max attempts
      )
      
      totalCount += keywords.length
      allKeywords.push(...keywords)
      console.log(`  ✅ Found ${keywords.length} suggested keywords`)
      
      // Progressive delay between ASINs
      if (asins.indexOf(asin) < asins.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
    } catch (error) {
      console.error(`  ❌ Failed for ${asin}: ${error.message}`)
    }
  }
  
  console.log(`✅ Total suggested keywords: ${totalCount}`)
  return { keywords: allKeywords, totalCount }
}

// Collect recommendations (JungleAce exact pattern)
async function collectRecommendations(asins: string[], profileId: string | null) {
  const allKeywords = []
  let totalCount = 0
  
  for (const asin of asins) {
    try {
      console.log(`📋 Fetching recommendations for ${asin}...`)
      
      // Apply rate limiting first
      await rateLimiter.waitForSlot()
      
      const keywords = await retryManager.executeWithRetry(
        async () => {
          // JungleAce exact request structure
          const requestBody = {
            recommendationType: 'KEYWORDS_FOR_ASINS',
            asins: [asin],
            maxRecommendations: 200,
            sortDimension: 'CONVERSIONS',
            locale: 'en_US'
          }
          
          console.log(`🔍 API Request for ASIN ${asin} to /sp/targets/keywords/recommendations`)
          
          const response = await adsApiAuth.makeRequestWithCustomHeaders(
            'POST',
            '/sp/targets/keywords/recommendations',
            {},
            requestBody,
            {
              'Content-Type': 'application/vnd.spkeywordsrecommendation.v4+json',
              'Accept': 'application/vnd.spkeywordsrecommendation.v4+json'
            }
          )
          
          // Handle multiple response formats
          let recommendationKeywords = []
          
          if (response?.keywordTargetList) {
            recommendationKeywords = response.keywordTargetList
          } else if (response?.recommendations) {
            recommendationKeywords = response.recommendations
          } else if (Array.isArray(response)) {
            recommendationKeywords = response
          }
          
          console.log(`✅ ASIN ${asin}: ${recommendationKeywords.length} recommendations found`)
          
          return recommendationKeywords.map(rec => ({
            asin,
            keyword: rec.keyword,
            matchType: rec.matchType || 'BROAD',
            source: 'recommendations',
            bidInfo: rec.bidInfo
          }))
        },
        `keyword-recommendations-${asin}`,
        2 // max attempts
      )
      
      totalCount += keywords.length
      allKeywords.push(...keywords)
      console.log(`  ✅ Found ${keywords.length} recommendations`)
      
      // Progressive delay between ASINs
      if (asins.indexOf(asin) < asins.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
    } catch (error) {
      console.error(`  ❌ Failed for ${asin}: ${error.message}`)
    }
  }
  
  console.log(`✅ Total recommendations: ${totalCount}`)
  return { keywords: allKeywords, totalCount }
}

// ========================================
// KEYWORD PROCESSING FUNCTIONS
// ========================================

// Merge keywords from both sources
function mergeKeywords(suggested: any, recommendations: any) {
  const keywordMap = new Map()
  
  // Add suggested keywords
  suggested.keywords.forEach(item => {
    const key = `${item.asin}|${item.keyword.toLowerCase()}`
    keywordMap.set(key, {
      ...item,
      suggestedBid: 0,
      estimatedClicks: 0,
      estimatedOrders: 0
    })
  })
  
  // Merge recommendations (may have bid info)
  recommendations.keywords.forEach(item => {
    const key = `${item.asin}|${item.keyword.toLowerCase()}`
    const existing = keywordMap.get(key)
    
    // Extract bid info if available
    let suggestedBid = 0
    if (item.bidInfo && item.bidInfo.length > 0) {
      const broadBid = item.bidInfo.find(b => b.matchType === 'BROAD')
      suggestedBid = broadBid?.suggestedBid?.rangeMedian || broadBid?.bid || 0
    }
    
    if (existing) {
      keywordMap.set(key, {
        ...existing,
        source: 'both',
        suggestedBid: suggestedBid || existing.suggestedBid
      })
    } else {
      keywordMap.set(key, {
        ...item,
        suggestedBid,
        estimatedClicks: 0,
        estimatedOrders: 0
      })
    }
  })
  
  return Array.from(keywordMap.values())
}

// Get bid recommendations with clicks/orders estimates (JungleAce pattern)
async function getBidRecommendations(keywords: any[], profileId: string | null) {
  const batchSize = 15 // JungleAce uses smaller batches
  const enrichedKeywords = [...keywords]
  
  // Step 1: Get owned ASINs from advertiser's product ads
  console.log(`🔍 Getting advertiser-owned ASINs for bid recommendations...`)
  let ownedAsins = []
  
  try {
    const productAdsResponse = await adsApiAuth.makeRequestWithCustomHeaders(
      'POST', 
      '/sp/productAds/list',
      {},
      {
        maxResults: 100,
        stateFilter: {
          include: ['ENABLED']
        }
      },
      {
        'Content-Type': 'application/vnd.spproductAd.v3+json',
        'Accept': 'application/vnd.spproductAd.v3+json'
      }
    )
    
    if (productAdsResponse?.productAds && productAdsResponse.productAds.length > 0) {
      ownedAsins = [...new Set(productAdsResponse.productAds.map(ad => ad.asin))]
      console.log(`✅ Found ${ownedAsins.length} owned ASINs:`, ownedAsins.slice(0, 5))
    } else {
      console.warn(`⚠️ No owned ASINs found - impact metrics may not be available`)
    }
  } catch (error) {
    console.warn(`⚠️ Could not fetch owned ASINs:`, error.message)
  }
  
  // Group by ASIN
  const asinGroups = keywords.reduce((acc, kw) => {
    if (!acc[kw.asin]) acc[kw.asin] = []
    acc[kw.asin].push(kw)
    return acc
  }, {})
  
  for (const [targetAsin, asinKeywords] of Object.entries(asinGroups)) {
    // Use owned ASIN if available, otherwise use target ASIN
    const asinToUse = ownedAsins.length > 0 ? ownedAsins[0] : targetAsin
    
    console.log(`💰 Getting bid recommendations for ${targetAsin} (${asinKeywords.length} keywords)...`)
    
    // Process in batches with JungleAce pattern
    for (let i = 0; i < asinKeywords.length; i += batchSize) {
      const batch = asinKeywords.slice(i, i + batchSize)
      
      try {
        // Apply rate limiting
        await rateLimiter.waitForSlot()
        
        // Create targeting expressions with match types
        const targetingExpressions = []
        for (const kw of batch) {
          targetingExpressions.push(
            { type: 'KEYWORD_BROAD_MATCH', value: kw.keyword },
            { type: 'KEYWORD_PHRASE_MATCH', value: kw.keyword },
            { type: 'KEYWORD_EXACT_MATCH', value: kw.keyword }
          )
        }
        
        const requestBody = {
          asins: [asinToUse],
          targetingExpressions,
          recommendationType: 'BIDS_FOR_NEW_AD_GROUP',
          bidding: {
            strategy: 'AUTO_FOR_SALES'
          }
        }
        
        const response = await adsApiAuth.makeRequest(
          'POST',
          '/sp/targets/bid/recommendations',
          {},
          requestBody
        )
        
        // Process bid response
        if (response?.bidRecommendations) {
          for (const themeRec of response.bidRecommendations) {
            const impactMetrics = themeRec.impactMetrics || {}
            
            if (themeRec.bidRecommendationsForTargetingExpressions) {
              for (const targetRec of themeRec.bidRecommendationsForTargetingExpressions) {
                const keyword = targetRec.targetingExpression?.value
                
                if (keyword && targetRec.bidValues?.length > 0) {
                  // Find the keyword in our list
                  const keywordIndex = enrichedKeywords.findIndex(
                    k => k.keyword === keyword && k.asin === targetAsin
                  )
                  
                  if (keywordIndex !== -1) {
                    // Get bid values
                    const bidValues = targetRec.bidValues || []
                    const aggressiveBid = bidValues[bidValues.length - 1]
                    
                    // Extract clicks and orders from impact metrics
                    const clicksData = impactMetrics.clicks?.values?.[bidValues.length - 1]
                    const ordersData = impactMetrics.orders?.values?.[bidValues.length - 1]
                    
                    // Update keyword with enrichment data
                    enrichedKeywords[keywordIndex] = {
                      ...enrichedKeywords[keywordIndex],
                      suggestedBid: aggressiveBid?.suggestedBid || aggressiveBid?.bid || 0,
                      estimatedClicks: clicksData?.upper || 0,
                      estimatedOrders: ordersData?.upper || 0
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`  ⚠ Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`)
      }
      
      // Add delay between batches
      if (i + batchSize < asinKeywords.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  
  console.log(`✅ Bid enrichment complete`)
  return enrichedKeywords
}