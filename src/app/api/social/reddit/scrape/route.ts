import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { apifyIntegration } from '@/lib/integrations/apify'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Skip auth checks in development mode
    if (process.env.NODE_ENV !== 'development') {
      // In production, add auth checks here
      console.log('Production mode: Auth checks would be performed here')
    }

    const { 
      asin, 
      keywords, 
      productTitle,
      brand,
      maxItems = 100,
      searchType = 'both',
      sort = 'relevance',
      time = 'month' 
    } = await request.json()

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      )
    }

    console.log('Starting Reddit scraping for keywords:', keywords)

    // Build search queries
    const searchQueries = [
      ...keywords.slice(0, 5), // Top 5 keywords
      productTitle ? productTitle.split(' ').slice(0, 3).join(' ') : null, // First 3 words of title
      brand
    ].filter(Boolean)

    // Check cache first
    const cacheKey = `reddit_${asin || keywords.join('_')}`
    const { data: cachedData, error: cacheError } = await supabase
      .from('amazon_api_cache')
      .select('*')
      .eq('asin', asin || cacheKey)
      .eq('data_type', 'reddit_insights')
      .gt('cache_expires_at', new Date().toISOString())
      .single()

    if (cachedData && !cacheError) {
      console.log('Returning cached Reddit data')
      return NextResponse.json({
        success: true,
        source: 'cache',
        data: cachedData.processed_data
      })
    }

    // Scrape Reddit posts
    const posts = await apifyIntegration.scrapeReddit({
      searchQueries,
      searchType,
      maxItems,
      sort,
      time,
      subreddits: [
        'amazonreviews',
        'BuyItForLife',
        'productreviews',
        'amazon',
        'deals'
      ]
    })

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No Reddit posts found for these keywords',
          analysis: null
        }
      })
    }

    console.log(`Scraped ${posts.length} Reddit posts`)

    // Analyze the posts
    const analysis = apifyIntegration.analyzeRedditPosts(posts, searchQueries)

    // Store social insights
    if (asin) {
      const { error: insightsError } = await supabase
        .from('social_insights')
        .upsert({
          asin: asin,
          platform: 'reddit',
          search_queries: searchQueries,
          total_posts: analysis.totalPosts,
          total_comments: analysis.totalComments,
          engagement_score: analysis.engagementScore,
          sentiment_distribution: analysis.sentimentDistribution,
          top_subreddits: analysis.topSubreddits,
          temporal_trends: analysis.temporalTrends,
          top_mentions: analysis.topMentions,
          competitor_mentions: analysis.competitorMentions,
          raw_sample: posts.slice(0, 5), // Store sample of posts
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'asin,platform'
        })

      if (insightsError) {
        console.error('Error storing social insights:', insightsError)
      }
    }

    // Cache the results
    const cacheExpiresAt = new Date()
    cacheExpiresAt.setDate(cacheExpiresAt.getDate() + 3) // Cache for 3 days

    const { error: cacheInsertError } = await supabase
      .from('amazon_api_cache')
      .upsert({
        asin: asin || cacheKey,
        data_type: 'reddit_insights',
        raw_data: { posts: posts.slice(0, 10) }, // Store sample
        processed_data: {
          analysis,
          totalScraped: posts.length,
          scrapedAt: new Date().toISOString(),
          searchQueries
        },
        cache_expires_at: cacheExpiresAt.toISOString(),
        api_source: 'apify_reddit'
      }, {
        onConflict: 'asin,data_type'
      })

    if (cacheInsertError) {
      console.error('Error caching Reddit data:', cacheInsertError)
    }

    return NextResponse.json({
      success: true,
      source: 'fresh',
      data: {
        analysis,
        totalPosts: posts.length,
        samplePosts: posts.slice(0, 5).map(post => ({
          title: post.title,
          subreddit: post.subreddit,
          score: post.score,
          url: post.url,
          text: post.text?.substring(0, 200) + '...'
        }))
      }
    })

  } catch (error) {
    console.error('Error scraping Reddit:', error)
    return NextResponse.json(
      { 
        error: 'Failed to scrape Reddit', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const asin = searchParams.get('asin')
    
    if (!asin) {
      return NextResponse.json(
        { error: 'ASIN parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get social insights
    const { data: insights, error } = await supabase
      .from('social_insights')
      .select('*')
      .eq('asin', asin)
      .eq('platform', 'reddit')
      .single()

    if (error || !insights) {
      return NextResponse.json(
        { error: 'No Reddit insights found. Please scrape first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        searchQueries: insights.search_queries,
        totalPosts: insights.total_posts,
        totalComments: insights.total_comments,
        engagementScore: insights.engagement_score,
        sentimentDistribution: insights.sentiment_distribution,
        topSubreddits: insights.top_subreddits,
        temporalTrends: insights.temporal_trends,
        topMentions: insights.top_mentions,
        competitorMentions: insights.competitor_mentions,
        lastUpdated: insights.updated_at
      }
    })

  } catch (error) {
    console.error('Error fetching Reddit insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Reddit insights' },
      { status: 500 }
    )
  }
}