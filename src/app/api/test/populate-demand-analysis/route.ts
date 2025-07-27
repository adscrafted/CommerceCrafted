import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create a direct Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Sample demand analysis data for saffron supplements niche
    const sampleData = {
      niche_id: 'saffron_supplements_1753403777466',
      market_insights: {
        marketPhase: 'growth',
        marketMaturity: 'emerging',
        growthIndicators: [
          'Increasing search volume for natural mood supplements',
          'Growing consumer awareness of saffron benefits',
          'Rising demand for non-pharmaceutical alternatives',
          'Expansion of premium supplement market segment'
        ],
        industryInsights: [
          {
            title: 'Natural Wellness Trend',
            description: 'Consumer shift towards natural and plant-based supplements continues to accelerate, with saffron gaining recognition as a premium mood support ingredient.',
            impact: 'high',
            timeframe: '2-3 years'
          },
          {
            title: 'Mental Health Awareness',
            description: 'Increased focus on mental health and wellness driving demand for mood support supplements, particularly among millennials and Gen Z.',
            impact: 'high',
            timeframe: '1-2 years'
          },
          {
            title: 'Quality Differentiation',
            description: 'Third-party testing and standardization becoming key differentiators as consumers become more educated about supplement quality.',
            impact: 'medium',
            timeframe: '6-12 months'
          }
        ],
        demandPatterns: {
          searchTrend: 'Increasing +23% YoY',
          conversionRate: '12.5% average',
          customerRetention: '65% repeat purchase rate',
          marketSize: '$45M annual revenue'
        }
      },
      pricing_trends: {
        optimalPriceRange: {
          min: 24.99,
          max: 39.99,
          sweetSpot: 29.99
        },
        priceStrategies: [
          {
            name: 'Premium Positioning',
            description: 'Position as a premium, high-quality saffron supplement with third-party testing. Price at $34.99-$39.99 to signal quality.',
            effectiveness: 'High for quality-conscious buyers'
          },
          {
            name: 'Competitive Pricing',
            description: 'Match market average at $29.99 with subscription discounts. Focus on value proposition and customer reviews.',
            effectiveness: 'Moderate - balances volume and margin'
          },
          {
            name: 'Penetration Pricing',
            description: 'Launch at $24.99 to gain market share quickly. Use aggressive PPC and promotional strategies.',
            effectiveness: 'High for new brands, low margin initially'
          }
        ],
        competitorInsights: 'Top competitors price between $25-$45. Products under $25 often contain fillers or lower standardization. Premium brands above $40 focus on patented extracts and clinical dosing.',
        priceElasticity: {
          score: 'Medium',
          analysis: 'Customers show moderate price sensitivity. Quality claims and third-party testing can justify 20-30% premium.'
        }
      },
      seasonality_insights: {
        seasonalPatterns: true,
        peakSeasons: [
          {
            period: 'January-February',
            strength: 'High',
            reason: 'New Year wellness resolutions'
          },
          {
            period: 'September-November',
            strength: 'High',
            reason: 'Seasonal affective disorder preparation'
          },
          {
            period: 'March-April',
            strength: 'Medium',
            reason: 'Spring wellness renewal'
          }
        ],
        seasonalOpportunities: [
          {
            opportunity: 'New Year Wellness Campaigns',
            timing: 'Launch December 26 - January 15',
            strategy: 'Bundle with other mood support supplements'
          },
          {
            opportunity: 'Back-to-School Stress Relief',
            timing: 'August 15 - September 30',
            strategy: 'Target parents and students with stress-relief messaging'
          },
          {
            opportunity: 'Holiday Gift Sets',
            timing: 'November 1 - December 20',
            strategy: 'Create gift bundles with elegant packaging'
          }
        ],
        inventoryRecommendations: 'Stock 40% more inventory for Q1 and Q4. Maintain baseline inventory during summer months (June-August) when demand is lowest. Plan promotional campaigns for slow periods.'
      },
      social_signals: {
        viralPotential: {
          score: 75,
          level: 'High Potential',
          factors: [
            'Mental health awareness trending',
            'Natural alternatives gaining traction',
            'Influencer interest in wellness products',
            'Visual appeal for unboxing content'
          ]
        },
        platformInsights: {
          tiktok: {
            trending: true,
            description: 'Saffron supplements gaining traction through wellness and mental health content creators. #NaturalMoodBoost has 2.3M views.',
            contentTypes: ['Wellness routines', 'Supplement stacks', 'Mental health tips'],
            engagement: 'High - 4.2% average'
          },
          instagram: {
            trending: false,
            description: 'Steady presence in wellness community. Strong performance in Stories and Reels featuring daily supplement routines.',
            contentTypes: ['Flat lays', 'Morning routines', 'Wellness tips'],
            engagement: 'Medium - 2.8% average'
          },
          youtube: {
            trending: false,
            description: 'Long-form content reviewing saffron benefits performing well. Science-based content creators showing interest.',
            contentTypes: ['Supplement reviews', 'Scientific explanations', 'Results videos'],
            engagement: 'Medium - 3.1% average'
          }
        },
        influencerOpportunities: 'Partner with micro-influencers (10K-100K followers) in mental health and wellness niches. Focus on authentic, long-term partnerships rather than one-off posts. Provide educational content about saffron benefits for creators to share.',
        contentStrategy: {
          ugc: 'Encourage before/after mood tracking testimonials',
          educational: 'Create infographics about saffron research',
          lifestyle: 'Show saffron as part of daily wellness routine'
        }
      }
    }
    
    // Check if a record already exists for this niche
    const { data: existing, error: checkError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .eq('niche_id', 'saffron_supplements_1753403777466')
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing data:', checkError)
      return NextResponse.json({ 
        error: 'Error checking existing data',
        details: checkError 
      }, { status: 500 })
    }
    
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('niches_demand_analysis')
        .update(sampleData)
        .eq('niche_id', 'saffron_supplements_1753403777466')
        .select()
        .single()
      
      if (error) {
        console.error('Error updating demand analysis:', error)
        return NextResponse.json({ 
          error: 'Failed to update',
          details: error 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Demand analysis data updated successfully',
        data: data
      })
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('niches_demand_analysis')
        .insert(sampleData)
        .select()
        .single()
      
      if (error) {
        console.error('Error inserting demand analysis:', error)
        return NextResponse.json({ 
          error: 'Failed to insert',
          details: error,
          attempted_data: sampleData
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Demand analysis data inserted successfully',
        data: data
      })
    }
  } catch (error) {
    console.error('Error populating demand analysis:', error)
    return NextResponse.json({ 
      error: 'Failed to populate demand analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}