import { NextRequest, NextResponse } from 'next/server'
import { amazonAdsApi } from '@/lib/integrations/amazon-ads-api'
import { createClient } from '@supabase/supabase-js'

/**
 * Fetch comprehensive keywords using JungleAce's proven multi-endpoint strategy
 * This matches the exact approach that gets 3000-8000+ keywords per ASIN
 */
async function fetchComprehensiveKeywords(asin: string) {
  try {
    const clientId = process.env.ADS_API_CLIENT_ID!;
    const clientSecret = process.env.ADS_API_CLIENT_SECRET!;
    const refreshToken = process.env.ADS_API_REFRESH_TOKEN!;
    const profileId = process.env.ADS_API_PROFILE_ID!;
    
    // Get access token
    const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Debug access token
    console.log('Access token length:', accessToken?.length);
    console.log('Access token first 20 chars:', accessToken?.substring(0, 20));
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Amazon-Advertising-API-ClientId': clientId,
      'Amazon-Advertising-API-Scope': profileId,
      'Content-Type': 'application/json',
      'User-Agent': 'CommerceCrafted/1.0 (Language=TypeScript)'
    };
    
    console.log('Headers being sent:', JSON.stringify(headers, null, 2));
    
    const allKeywords = [];
    
    // PHASE 1: Suggested Keywords (up to 1000) - Same as JungleAce
    console.log(`  📝 Fetching suggested keywords for ${asin}...`);
    let suggestedKeywords = [];
    try {
      const requestBody = {
        asins: [asin],
        maxNumSuggestions: 1000
      };

      const suggestedResponse = await fetch(
        `https://advertising-api.amazon.com/v2/asins/suggested/keywords`,
        { 
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        }
      );
      
      if (suggestedResponse.ok) {
        const suggestedData = await suggestedResponse.json();
        suggestedKeywords = (Array.isArray(suggestedData) ? suggestedData : [])
          .filter((item: any) => {
            // Only include items that have a valid keyword string
            const keyword = item.keywordText || item.keyword;
            return keyword && typeof keyword === 'string' && keyword.trim().length > 0;
          })
          .map((item: any) => ({
            keyword: (item.keywordText || item.keyword).trim(),
            matchType: item.matchType || 'BROAD',
            // Use rangeMedian as primary bid source (like JungleAce)
            suggestedBid: item.suggestedBid?.rangeMedian ? Math.round(item.suggestedBid.rangeMedian * 100) :
                       item.bid?.suggested ? Math.round(item.bid.suggested * 100) : 
                       item.suggestedBid ? Math.round(item.suggestedBid * 100) : 
                       100,
          bidRangeStart: item.suggestedBid?.rangeStart ? Math.round(item.suggestedBid.rangeStart * 100) : null,
          bidRangeEnd: item.suggestedBid?.rangeEnd ? Math.round(item.suggestedBid.rangeEnd * 100) : null,
          source: 'suggested',
          state: item.state || 'ENABLED',
          isPrimary: allKeywords.length < 50
        }));
        
        allKeywords.push(...suggestedKeywords);
        console.log(`    ✅ Found ${suggestedKeywords.length} suggested keywords`);
      }
    } catch (error) {
      console.log(`    ⚠️ Suggested keywords failed: ${error.message}`);
    }
    
    // PHASE 2: Keyword Recommendations (up to 2000) - JungleAce's main source
    console.log(`  🔍 Fetching keyword recommendations for ${asin}...`);
    let recommendedKeywords = [];
    try {
      const targetKeywords = suggestedKeywords.slice(0, 50).map(k => k.keyword);
      
      const recommendationResponse = await fetch(
        `https://advertising-api.amazon.com/v2/sp/keywords/recommendations`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            asins: [asin],
            targetKeywords: targetKeywords,
            maxRecommendations: 2000,
            strategy: 'MULTI_STRATEGY',
            locale: 'en_US',
            sortDimension: 'CONVERSIONS',
            biddingStrategy: 'AUTO_FOR_SALES',
            matchTypes: ['EXACT', 'PHRASE', 'BROAD']
          })
        }
      );
      
      if (recommendationResponse.ok) {
        const recommendationData = await recommendationResponse.json();
        const recommendations = recommendationData.recommendations || [];
        recommendedKeywords = recommendations
          .filter((item: any) => {
            // Only include items that have a valid keyword string
            const keyword = item.keyword || item.keywordText;
            return keyword && typeof keyword === 'string' && keyword.trim().length > 0;
          })
          .map((item: any) => ({
            keyword: (item.keyword || item.keywordText).trim(),
            matchType: item.matchType || 'BROAD',
          // Use rangeMedian as primary bid source (like JungleAce)
          suggestedBid: item.suggestedBid?.rangeMedian ? Math.round(item.suggestedBid.rangeMedian * 100) :
                       item.bid?.suggested ? Math.round(item.bid.suggested * 100) : 
                       item.suggestedBid ? Math.round(item.suggestedBid * 100) : 
                       100,
          bidRangeStart: item.suggestedBid?.rangeStart ? Math.round(item.suggestedBid.rangeStart * 100) : null,
          bidRangeEnd: item.suggestedBid?.rangeEnd ? Math.round(item.suggestedBid.rangeEnd * 100) : null,
          estimatedClicks: item.clicks || item.estimatedClicks || 0,
          estimatedOrders: item.orders || item.estimatedOrders || 0,
          source: 'recommendations',
          state: item.state || 'ENABLED',
          isPrimary: false
        }));
        
        allKeywords.push(...recommendedKeywords);
        console.log(`    ✅ Found ${recommendedKeywords.length} keyword recommendations`);
      }
    } catch (error) {
      console.log(`    ⚠️ Keyword recommendations failed: ${error.message}`);
    }

    // PHASE 3: Advanced Bid Enrichment with Match Type Fallback Strategy
    await enrichKeywordsWithMatchTypeFallback(allKeywords, asin, headers);

    // PHASE 4: Match Type Expansion (JungleAce's deduplication strategy)
    console.log(`  🔄 Expanding keywords with match type variations...`);
    const expandedKeywords = [];
    const baseKeywords = allKeywords
      .filter(k => k && k.source === 'suggested' && k.keyword && typeof k.keyword === 'string')
      .slice(0, 200);
    
    baseKeywords.forEach(baseKeyword => {
      const keyword = baseKeyword.keyword;
      
      // Create all match type variations
      ['EXACT', 'PHRASE', 'BROAD'].forEach(matchType => {
        if (matchType !== baseKeyword.matchType) {
          expandedKeywords.push({
            keyword: keyword,
            matchType: matchType,
            suggestedBid: Math.round(baseKeyword.suggestedBid * 0.9),
            source: 'match_type_expansion',
            state: 'ENABLED',
            isPrimary: false
          });
        }
      });
    });
    
    // Merge and deduplicate (JungleAce approach)
    const keywordMap = new Map();
    [...allKeywords, ...expandedKeywords].forEach(keyword => {
      // Skip invalid keywords
      if (!keyword || !keyword.keyword || typeof keyword.keyword !== 'string') {
        return;
      }
      
      const key = `${keyword.keyword.toLowerCase()}|${keyword.matchType}`;
      if (!keywordMap.has(key)) {
        keywordMap.set(key, keyword);
      }
    });
    
    const finalKeywords = Array.from(keywordMap.values());
    console.log(`    ✅ Added ${expandedKeywords.length} match type variations, final count: ${finalKeywords.length}`)
    
    // PHASE 5: Additional keyword generation based on product data (simplified)
    console.log(`  🧠 Adding product-based keyword variations...`);
    const productKeywords = [];
    
    // Use top keywords as seeds for variations
    const seedKeywords = finalKeywords.filter(k => k.source === 'suggested').slice(0, 100);
    
    seedKeywords.forEach(seed => {
      const baseKeyword = seed.keyword;
      
      // Add common purchase intent modifiers
      const modifiers = ['best', 'cheap', 'buy', 'sale', 'discount', 'deal', 'review'];
      modifiers.forEach(modifier => {
        productKeywords.push({
          keyword: `${modifier} ${baseKeyword}`,
          matchType: 'BROAD',
          suggestedBid: Math.round(seed.suggestedBid * 0.8),
          source: 'product_intent',
          state: 'ENABLED',
          isPrimary: false
        });
      });
      
      // Add brand-style variations if keyword has multiple words
      if (baseKeyword.includes(' ')) {
        const words = baseKeyword.split(' ');
        if (words.length >= 2) {
          // Create shorter phrases
          for (let i = 0; i < words.length - 1; i++) {
            const shortPhrase = words.slice(i, i + 2).join(' ');
            productKeywords.push({
              keyword: shortPhrase,
              matchType: 'PHRASE',
              suggestedBid: Math.round(seed.suggestedBid * 0.7),
              source: 'product_phrase',
              state: 'ENABLED',
              isPrimary: false
            });
          }
        }
      }
    });
    
    // Final deduplication including product keywords
    const allCombinedKeywords = [...finalKeywords, ...productKeywords];
    const finalKeywordMap = new Map();
    
    allCombinedKeywords.forEach(keyword => {
      const key = `${keyword.keyword.toLowerCase()}|${keyword.matchType}`;
      if (!finalKeywordMap.has(key) && keyword.keyword.length <= 80) {
        finalKeywordMap.set(key, keyword);
      }
    });
    
    const completedKeywords = Array.from(finalKeywordMap.values());
    console.log(`    ✅ Added ${productKeywords.length} product variations`)
    
    console.log(`  📊 FINAL RESULTS: ${completedKeywords.length} total unique keywords collected`);
    console.log(`  🎯 Target achieved: ${completedKeywords.length >= 3000 ? '✅ YES (3000+)' : completedKeywords.length >= 1000 ? '⚠️ GOOD (1000+)' : '❌ NEEDS IMPROVEMENT'}`);
    
    return completedKeywords;
    
  } catch (error) {
    console.error(`Error fetching comprehensive keywords for ${asin}:`, error);
    return [];
  }
}

/**
 * Generate fallback keywords based on product data when Amazon Ads API fails
 */
async function generateFallbackKeywords(asin: string, supabase: any) {
  try {
    // Get product data from database
    const { data: product, error } = await supabase
      .from('product')
      .select('title, brand, category, bullet_points')
      .eq('id', asin)
      .single();
      
    if (error || !product) {
      console.log(`No product data found for ${asin}`);
      return [];
    }
    
    const keywords = [];
    const title = product.title || '';
    const brand = product.brand || '';
    const category = product.category || '';
    
    // Extract keywords from title
    const titleWords = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);
    
    // Brand keyword
    if (brand && brand.length > 1) {
      keywords.push({
        keyword: brand.toLowerCase(),
        matchType: 'EXACT',
        suggestedBid: 150,
        source: 'fallback_brand',
        isPrimary: true
      });
    }
    
    // Category keyword
    if (category && category.length > 1) {
      keywords.push({
        keyword: category.toLowerCase(),
        matchType: 'BROAD',
        suggestedBid: 80,
        source: 'fallback_category',
        isPrimary: false
      });
    }
    
    // Title-based keywords with match type variations
    titleWords.forEach((word, index) => {
      if (word && word.length > 2) {
        // Add all match types for top words
        const matchTypes = index < 3 ? ['EXACT', 'PHRASE', 'BROAD'] : ['BROAD'];
        matchTypes.forEach(matchType => {
          keywords.push({
            keyword: word,
            matchType: matchType,
            suggestedBid: index < 3 ? 120 : 60,
            source: 'fallback_title',
            isPrimary: index < 3
          });
        });
      }
    });
    
    // Two-word combinations from title
    for (let i = 0; i < titleWords.length - 1; i++) {
      const twoWordPhrase = `${titleWords[i]} ${titleWords[i + 1]}`;
      keywords.push({
        keyword: twoWordPhrase,
        matchType: 'PHRASE',
        suggestedBid: 100,
        source: 'fallback_phrase',
        isPrimary: i < 2
      });
    }
    
    // Brand + category combination
    if (brand && category) {
      keywords.push({
        keyword: `${brand.toLowerCase()} ${category.toLowerCase()}`,
        matchType: 'PHRASE',
        suggestedBid: 180,
        source: 'fallback_brand_category',
        isPrimary: true
      });
    }
    
    // Remove duplicates
    const uniqueKeywords = keywords.filter((keyword, index, self) => 
      index === self.findIndex(k => k.keyword === keyword.keyword && k.matchType === keyword.matchType)
    );
    
    console.log(`Generated ${uniqueKeywords.length} fallback keywords for ${asin}`);
    return uniqueKeywords;
    
  } catch (error) {
    console.error(`Error generating fallback keywords for ${asin}:`, error);
    return [];
  }
}

/**
 * Advanced bid enrichment using match type fallback strategy
 * Fetches bid data for EXACT, PHRASE, and BROAD match types for each keyword
 * Uses fallback hierarchy: EXACT > BROAD > PHRASE for best available bid data
 */
async function enrichKeywordsWithMatchTypeFallback(allKeywords: any[], asin: string, headers: any) {
  // Filter to only include keywords with valid keyword strings
  const validKeywords = allKeywords.filter(k => 
    k && k.keyword && typeof k.keyword === 'string' && k.keyword.trim().length > 0
  );
  
  const uniqueKeywordTexts = [...new Set(validKeywords.map(k => k.keyword.toLowerCase()))];
  
  if (uniqueKeywordTexts.length === 0) {
    console.log(`    ⚠️ No valid keywords to enrich for ${asin}`);
    return;
  }

  console.log(`  💰 Enriching ${uniqueKeywordTexts.length} unique keywords with match type fallback strategy...`);
  
  try {
    // First, get advertiser-owned ASINs to use for bid recommendations
    console.log(`    🔍 Fetching advertiser-owned ASINs...`);
    let ownedAsin = asin; // Default to original ASIN
    
    try {
      const productAdsResponse = await fetch(
        'https://advertising-api.amazon.com/sp/productAds/list',
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.spproductAd.v3+json',
            'Accept': 'application/vnd.spproductAd.v3+json'
          },
          body: JSON.stringify({
            maxResults: 50,
            stateFilter: {
              include: ['ENABLED', 'PAUSED']
            }
          })
        }
      );
      
      if (productAdsResponse.ok) {
        const productAdsData = await productAdsResponse.json();
        if (productAdsData?.productAds && productAdsData.productAds.length > 0) {
          // Use the first owned ASIN we find
          ownedAsin = productAdsData.productAds[0].asin;
          console.log(`    ✅ Using advertiser-owned ASIN: ${ownedAsin} (original: ${asin})`);
        } else {
          console.log(`    ⚠️ No advertiser-owned ASINs found, using original ASIN: ${asin}`);
        }
      } else {
        console.log(`    ⚠️ Could not fetch product ads: ${productAdsResponse.status}`);
      }
    } catch (error) {
      console.log(`    ⚠️ Error fetching owned ASINs: ${error.message}`);
    }
    
    // Build enrichment map: keyword => { EXACT: data, BROAD: data, PHRASE: data }
    const enrichmentMap = new Map();
    
    // Batch keywords to avoid API limits (process 33 keywords per batch = 99 targeting expressions)
    const batchSize = 33;
    
    for (let i = 0; i < uniqueKeywordTexts.length; i += batchSize) {
      const keywordBatch = uniqueKeywordTexts.slice(i, i + batchSize);
      
      console.log(`    🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(uniqueKeywordTexts.length/batchSize)} (${keywordBatch.length} keywords)...`);
      
      // Build targeting expressions for all 3 match types per keyword
      const targetingExpressions: any[] = [];
      keywordBatch.forEach(keyword => {
        targetingExpressions.push(
          { type: 'KEYWORD_EXACT_MATCH', value: keyword },
          { type: 'KEYWORD_PHRASE_MATCH', value: keyword },
          { type: 'KEYWORD_BROAD_MATCH', value: keyword }
        );
      });
      
      const bidRequestPayload = {
        recommendationType: 'BIDS_FOR_NEW_AD_GROUP',
        asins: [ownedAsin], // Use owned ASIN instead of original ASIN
        targetingExpressions: targetingExpressions,
        bidding: { 
          strategy: 'AUTO_FOR_SALES', 
          adjustments: null 
        }
      };
      
      console.log(`      📝 Sending bid request for ${targetingExpressions.length} targeting expressions`);
      console.log(`      📝 Using owned ASIN: ${ownedAsin}, Profile: ${headers['Amazon-Advertising-API-Scope']}`);
      
      // Create fresh headers for this request to avoid any contamination
      const bidHeaders = {
        'Authorization': headers['Authorization'],
        'Amazon-Advertising-API-ClientId': headers['Amazon-Advertising-API-ClientId'],
        'Amazon-Advertising-API-Scope': headers['Amazon-Advertising-API-Scope'],
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': headers['User-Agent']
      };
      
      console.log(`      📝 Bid request headers:`, JSON.stringify(bidHeaders, null, 2));
      console.log(`      📝 Bid request URL: https://advertising-api.amazon.com/sp/targets/bid/recommendations`);
      console.log(`      📝 Bid request payload sample:`, JSON.stringify({
        ...bidRequestPayload,
        targetingExpressions: bidRequestPayload.targetingExpressions.slice(0, 3) // Show first 3 for brevity
      }, null, 2));
      
      const bidResponse = await fetch(
        `https://advertising-api.amazon.com/sp/targets/bid/recommendations`,
        {
          method: 'POST',
          headers: bidHeaders,
          body: JSON.stringify(bidRequestPayload)
        }
      );
      
      if (bidResponse.ok) {
        const bidData = await bidResponse.json();
        const bidRecommendations = bidData.bidRecommendations || [];
        
        console.log(`      ✅ Received ${bidRecommendations.length} bid recommendations`);
        
        // Process bid recommendations and build enrichment map
        bidRecommendations.forEach((rec: any) => {
          if (!rec.bidRecommendationsForTargetingExpressions) return;
          
          const impactMetrics = rec.impactMetrics || {};
          const clicksArr = impactMetrics.clicks?.values || [];
          const ordersArr = impactMetrics.orders?.values || [];
          
          // Extract "high" estimates (index 2 = high, 1 = medium, 0 = low)
          const estimatedHighClicks = clicksArr[2]?.upper || 0;
          const estimatedHighOrders = ordersArr[2]?.upper || 0;
          
          rec.bidRecommendationsForTargetingExpressions.forEach((expr: any) => {
            const matchType = expr.targetingExpression?.type || 'UNKNOWN';
            const keywordValue = expr.targetingExpression?.value?.toLowerCase() || 'unknown';
            const bidValues = expr.bidValues || [];
            
            // Initialize enrichment entry if it doesn't exist
            if (!enrichmentMap.has(keywordValue)) {
              enrichmentMap.set(keywordValue, {
                EXACT: null,
                BROAD: null,
                PHRASE: null
              });
            }
            
            const mapEntry = enrichmentMap.get(keywordValue);
            
            // Extract bid range from bidValues array
            const rangeStart = bidValues[0]?.suggestedBid;
            const rangeMedian = bidValues[1]?.suggestedBid;
            const rangeEnd = bidValues[2]?.suggestedBid;
            
            const enrichmentData = {
              bidValues: bidValues,
              rangeStart: rangeStart,
              rangeMedian: rangeMedian, 
              rangeEnd: rangeEnd,
              estimatedHighClicks: estimatedHighClicks,
              estimatedHighOrders: estimatedHighOrders,
              theme: rec.theme || 'N/A'
            };
            
            // Map Amazon API match types to our simplified types
            if (matchType === 'KEYWORD_EXACT_MATCH') {
              mapEntry.EXACT = enrichmentData;
            } else if (matchType === 'KEYWORD_BROAD_MATCH') {
              mapEntry.BROAD = enrichmentData;
            } else if (matchType === 'KEYWORD_PHRASE_MATCH') {
              mapEntry.PHRASE = enrichmentData;
            }
            
            enrichmentMap.set(keywordValue, mapEntry);
          });
        });
        
      } else {
        console.log(`      ⚠️ Bid recommendation request failed: ${bidResponse.status} ${bidResponse.statusText}`);
        // Log response details for debugging but continue processing
        try {
          const errorBody = await bidResponse.text();
          console.log(`      📝 Full error response: ${errorBody}`);
          
          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorBody);
            console.log(`      📝 Error JSON:`, JSON.stringify(errorJson, null, 2));
          } catch (e) {
            // Not JSON, that's fine
          }
        } catch (e) {
          console.log(`      📝 Could not read error response`);
        }
      }
      
      // Rate limiting between batches
      if (i + batchSize < uniqueKeywordTexts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`    📊 Built enrichment map for ${enrichmentMap.size} keywords`);
    
    // Apply enrichment to all keywords using fallback hierarchy
    let enrichedCount = 0;
    let skippedInvalidCount = 0;
    allKeywords.forEach(keyword => {
      // Skip invalid keywords
      if (!keyword || !keyword.keyword || typeof keyword.keyword !== 'string') {
        skippedInvalidCount++;
        return;
      }
      
      const keywordLower = keyword.keyword.toLowerCase();
      
      if (enrichmentMap.has(keywordLower)) {
        const { EXACT, BROAD, PHRASE } = enrichmentMap.get(keywordLower);
        
        // Fallback hierarchy: EXACT > BROAD > PHRASE
        const finalMatch = EXACT || BROAD || PHRASE;
        
        if (finalMatch) {
          // Determine which match type we ended up using
          const usedMatchType = EXACT ? 'EXACT' : BROAD ? 'BROAD' : 'PHRASE';
          
          // Apply enrichment data
          keyword.suggestedBid = finalMatch.rangeMedian ? Math.round(finalMatch.rangeMedian * 100) : keyword.suggestedBid;
          keyword.bidRangeStart = finalMatch.rangeStart ? Math.round(finalMatch.rangeStart * 100) : null;
          keyword.bidRangeEnd = finalMatch.rangeEnd ? Math.round(finalMatch.rangeEnd * 100) : null;
          keyword.estimatedClicks = finalMatch.estimatedHighClicks || 0;
          keyword.estimatedOrders = finalMatch.estimatedHighOrders || 0;
          keyword.bidValues = finalMatch.bidValues || [];
          keyword.enrichmentSource = usedMatchType; // Track which match type provided the data
          
          enrichedCount++;
          
          console.log(`      🎯 Enriched "${keyword.keyword}" using ${usedMatchType} match: $${(keyword.suggestedBid/100).toFixed(2)} bid`);
        }
      }
    });
    
    console.log(`    ✅ Successfully enriched ${enrichedCount}/${allKeywords.length} keywords using match type fallback strategy`);
    if (skippedInvalidCount > 0) {
      console.log(`    ⚠️ Skipped ${skippedInvalidCount} invalid keywords during enrichment`);
    }
    
  } catch (error) {
    console.log(`    ⚠️ Bid enrichment failed: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Keywords Working API called - temp solution');
    
    const { asins, marketplace = 'US' } = await request.json();
    
    // Check environment variables
    const hasCredentials = !!(
      process.env.ADS_API_CLIENT_ID && 
      process.env.ADS_API_CLIENT_SECRET && 
      process.env.ADS_API_REFRESH_TOKEN
    );
    
    console.log('Environment check:', {
      ADS_API_CLIENT_ID: process.env.ADS_API_CLIENT_ID ? 'SET' : 'NOT SET',
      ADS_API_CLIENT_SECRET: process.env.ADS_API_CLIENT_SECRET ? 'SET' : 'NOT SET', 
      ADS_API_REFRESH_TOKEN: process.env.ADS_API_REFRESH_TOKEN ? 'SET' : 'NOT SET'
    });
    
    if (!hasCredentials) {
      return NextResponse.json({
        success: false,
        error: 'Amazon Ads API credentials not configured',
        message: 'Please set ADS_API_CLIENT_ID, ADS_API_CLIENT_SECRET, and ADS_API_REFRESH_TOKEN environment variables',
        keywords: []
      });
    }
    
    // Process keywords for each ASIN
    console.log(`Processing ${asins.length} ASINs for keyword collection...`);
    const allKeywords = [];
    const processedAsins = [];
    const failedAsins = [];
    // Use service role key to bypass RLS policies for keyword storage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    for (const asin of asins) {
      try {
        console.log(`\n📊 Fetching keywords for ASIN: ${asin}`);
        
        // Fetch comprehensive keyword data from Amazon Ads API (1000+ keywords)
        const keywordData = await fetchComprehensiveKeywords(asin);
        
        if (keywordData && keywordData.length > 0) {
          console.log(`✅ Found ${keywordData.length} keywords for ${asin}`);
          
          // Store keywords in database using batch insert for performance
          console.log(`  💾 Preparing batch insert of ${keywordData.length} keywords...`);
          
          const keywordRecords = keywordData.map(keyword => ({
            product_id: asin,
            keyword: keyword.keyword,
            match_type: keyword.matchType,
            suggested_bid: keyword.suggestedBid || 0,
            bid_range_start: keyword.bidRangeStart || null,
            bid_range_end: keyword.bidRangeEnd || null,
            estimated_clicks: keyword.estimatedClicks || 0,
            estimated_orders: keyword.estimatedOrders || 0,
            source: keyword.enrichmentSource ? `${keyword.source}_enriched_${keyword.enrichmentSource.toLowerCase()}` : (keyword.source || 'api'),
            is_primary: keyword.isPrimary || false,
            created_at: new Date().toISOString()
          }));
          
          // Batch upsert in chunks of 100 to avoid database limits
          const batchSize = 100;
          let successfulInserts = 0;
          
          for (let i = 0; i < keywordRecords.length; i += batchSize) {
            const batch = keywordRecords.slice(i, i + batchSize);
            
            // Use upsert to handle duplicates based on the unique constraint (product_id, keyword, match_type)
            const { data, error } = await supabase
              .from('product_keywords')
              .upsert(batch, { 
                onConflict: 'product_id,keyword,match_type',
                ignoreDuplicates: false // Update existing records with new data
              });
              
            if (error) {
              console.error(`Failed to store batch ${Math.floor(i/batchSize) + 1} for ${asin}:`, error);
            } else {
              successfulInserts += batch.length;
              console.log(`    ✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} keywords upserted`);
            }
          }
          
          console.log(`  📊 Successfully stored ${successfulInserts}/${keywordData.length} keywords for ${asin}`);
          
          // Add to response
          keywordData.forEach(keyword => {
            allKeywords.push({
              asin,
              keyword: keyword.keyword,
              matchType: keyword.matchType,
              suggestedBid: keyword.suggestedBid,
              bidRangeStart: keyword.bidRangeStart || null,
              bidRangeEnd: keyword.bidRangeEnd || null,
              estimatedClicks: keyword.estimatedClicks || 0,
              estimatedOrders: keyword.estimatedOrders || 0,
              isPrimary: keyword.isPrimary || false,
              source: keyword.source || 'api',
              enrichmentSource: keyword.enrichmentSource || null
            });
          });
          
          processedAsins.push(asin);
        } else {
          console.warn(`⚠️ No keywords found for ${asin} via Amazon Ads API (may not be in advertiser's account)`);
          console.log(`🔄 Generating fallback keywords based on product data...`);
          
          // Fallback: Generate keywords based on product title, brand, and category
          const fallbackKeywords = await generateFallbackKeywords(asin, supabase);
          
          if (fallbackKeywords.length > 0) {
            console.log(`✅ Generated ${fallbackKeywords.length} fallback keywords for ${asin}`);
            
            // Store fallback keywords using batch insert
            const fallbackRecords = fallbackKeywords.map(keyword => ({
              product_id: asin,
              keyword: keyword.keyword,
              match_type: keyword.matchType,
              suggested_bid: keyword.suggestedBid,
              bid_range_start: null,
              bid_range_end: null,
              estimated_clicks: 0,
              estimated_orders: 0,
              source: 'fallback',
              is_primary: keyword.isPrimary || false,
              created_at: new Date().toISOString()
            }));
            
            const { error } = await supabase
              .from('product_keywords')
              .upsert(fallbackRecords, { 
                onConflict: 'product_id,keyword,match_type',
                ignoreDuplicates: false
              });
              
            if (error) {
              console.error(`Failed to store fallback keywords for ${asin}:`, error);
            } else {
              console.log(`  📊 Successfully stored ${fallbackRecords.length} fallback keywords for ${asin}`);
            }
            
            // Add to response
            fallbackKeywords.forEach(keyword => {
              allKeywords.push({
                asin,
                keyword: keyword.keyword,
                matchType: keyword.matchType,
                suggestedBid: keyword.suggestedBid,
                estimatedClicks: 0,
                estimatedOrders: 0,
                isPrimary: keyword.isPrimary || false,
                source: 'fallback'
              });
            });
            
            processedAsins.push(asin);
          } else {
            console.warn(`❌ Could not generate fallback keywords for ${asin}`);
            failedAsins.push(asin);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${asin}:`, error);
        failedAsins.push(asin);
      }
      
      // Rate limiting between ASINs
      if (asins.indexOf(asin) < asins.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Enhanced analytics matching JungleAce's comprehensive reporting
    const primaryKeywords = allKeywords.filter(k => k.isPrimary);
    const longtailKeywords = allKeywords.filter(k => !k.isPrimary);
    const suggestedKeywords = allKeywords.filter(k => k.source === 'suggested');
    const recommendationKeywords = allKeywords.filter(k => k.source === 'recommendations');
    const matchTypeExpansion = allKeywords.filter(k => k.source === 'match_type_expansion');
    const productIntent = allKeywords.filter(k => k.source === 'product_intent');
    const exactMatchKeywords = allKeywords.filter(k => k.matchType === 'EXACT');
    const phraseMatchKeywords = allKeywords.filter(k => k.matchType === 'PHRASE');
    const broadMatchKeywords = allKeywords.filter(k => k.matchType === 'BROAD');
    
    // Enrichment source analytics
    const enrichedKeywords = allKeywords.filter(k => k.enrichmentSource);
    const exactEnriched = enrichedKeywords.filter(k => k.enrichmentSource === 'EXACT');
    const broadEnriched = enrichedKeywords.filter(k => k.enrichmentSource === 'BROAD');
    const phraseEnriched = enrichedKeywords.filter(k => k.enrichmentSource === 'PHRASE');
    
    // Calculate enhanced metrics
    const totalEstimatedClicks = allKeywords.reduce((sum, k) => sum + (k.estimatedClicks || 0), 0);
    const totalEstimatedOrders = allKeywords.reduce((sum, k) => sum + (k.estimatedOrders || 0), 0);
    const avgCpc = allKeywords.length > 0 ? 
      (allKeywords.reduce((sum, k) => sum + (k.suggestedBid || 0), 0) / allKeywords.length / 100) : 0;
    const estimatedCtr = totalEstimatedClicks > 0 && totalEstimatedOrders > 0 ? 
      ((totalEstimatedOrders / totalEstimatedClicks) * 100) : 0;
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedAsins.length}/${asins.length} ASINs using advanced match type fallback strategy`,
      asins: asins,
      marketplace: marketplace,
      hasCredentials: true,
      keywords: allKeywords,
      summary: {
        // Core metrics
        totalKeywords: allKeywords.length,
        asinsProcessed: processedAsins.length,
        asinsFailed: failedAsins.length,
        
        // Keyword classification (JungleAce style)
        primaryKeywords: primaryKeywords.length,
        longtailKeywords: longtailKeywords.length,
        
        // Source breakdown
        suggestedKeywords: suggestedKeywords.length,
        recommendationKeywords: recommendationKeywords.length,
        matchTypeExpansions: matchTypeExpansion.length,
        productIntentKeywords: productIntent.length,
        
        // Match type distribution
        exactMatch: exactMatchKeywords.length,
        phraseMatch: phraseMatchKeywords.length,
        broadMatch: broadMatchKeywords.length,
        
        // Performance metrics
        avgCpc: avgCpc.toFixed(2),
        totalEstimatedClicks: totalEstimatedClicks,
        totalEstimatedOrders: totalEstimatedOrders,
        estimatedCtr: estimatedCtr.toFixed(2) + '%',
        
        // Bid enrichment analytics
        enrichmentStrategy: 'Match Type Fallback (EXACT > BROAD > PHRASE)',
        totalEnriched: enrichedKeywords.length,
        enrichmentRate: allKeywords.length > 0 ? Math.round((enrichedKeywords.length / allKeywords.length) * 100) + '%' : '0%',
        enrichmentSources: {
          exactMatch: exactEnriched.length,
          broadMatch: broadEnriched.length,
          phraseMatch: phraseEnriched.length
        },
        
        // Quality score
        keywordQualityScore: Math.min(100, Math.round((allKeywords.length / asins.length) / 30)), // 30 keywords per ASIN = 100%
        averageKeywordsPerAsin: Math.round(allKeywords.length / asins.length),
        
        // Processing results
        processedAsins,
        failedAsins,
        
        // Strategy performance
        multiEndpointStrategy: 'Advanced Match Type Fallback',
        dataEnrichment: enrichedKeywords.length > 0 ? `Enhanced ${enrichedKeywords.length} keywords with match type fallback` : 'Basic keyword data',
        
        note: failedAsins.length > 0 ? 
          `Processed ${processedAsins.length}/${asins.length} ASINs successfully. Failed ASINs may not be in your Amazon Ads account.` : 
          `Successfully collected ${allKeywords.length} keywords using advanced match type fallback strategy (${Math.round(allKeywords.length / asins.length)} keywords per ASIN, ${enrichedKeywords.length} enriched)`
      }
    });
    
  } catch (error) {
    console.error('Keywords working API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Keywords working API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}