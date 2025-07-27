import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create a direct Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // First, get a product from the saffron niche
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('asins')
      .eq('id', 'saffron_supplements_1753403777466')
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ 
        error: 'Niche not found',
        details: nicheError 
      }, { status: 404 })
    }
    
    // Get the first ASIN from the niche
    const asins = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
    if (asins.length === 0) {
      return NextResponse.json({ 
        error: 'No products in niche'
      }, { status: 400 })
    }
    
    const productId = asins[0] // Use the first product
    
    // Sample market intelligence data for saffron supplements
    const sampleData = {
      product_id: productId,
      niche_id: 'saffron_supplements_1753403777466',
      customer_personas: [
        {
          name: 'Health-Conscious Millennials',
          demographics: 'Age 25-40, College-educated, Income $40K-$80K',
          motivations: [
            'Natural alternatives to prescription medications',
            'Mental health and mood support',
            'Preventive health measures',
            'Science-backed supplements'
          ],
          painPoints: [
            'Skeptical of supplement quality and purity',
            'Concerned about side effects',
            'Difficulty finding trustworthy brands',
            'Price sensitivity for premium products'
          ],
          buyingBehavior: 'Research extensively online, read multiple reviews, prefer brands with third-party testing. Often purchase during sales or with subscription discounts.',
          reviewExamples: [
            {
              rating: 5,
              verified: true,
              date: '2025-07-15',
              text: "I've been taking these for 2 months now and noticed a significant improvement in my mood and energy levels. Love that it's third-party tested!",
              helpfulVotes: 45
            }
          ]
        },
        {
          name: 'Wellness-Focused Seniors',
          demographics: 'Age 55+, Retired or nearing retirement, Fixed income',
          motivations: [
            'Maintaining cognitive function',
            'Supporting eye health',
            'Natural mood enhancement',
            'Doctor-recommended supplements'
          ],
          painPoints: [
            'Difficulty swallowing large capsules',
            'Interactions with medications',
            'Limited budget for supplements',
            'Confusion about dosage and timing'
          ],
          buyingBehavior: 'Value consistency and routine, loyal to brands that work, influenced by healthcare provider recommendations.',
          reviewExamples: [
            {
              rating: 4,
              verified: true,
              date: '2025-07-13',
              text: "My doctor recommended saffron for mood support. These capsules are a bit large but the results have been good. I wish they offered a smaller capsule option.",
              helpfulVotes: 23
            }
          ]
        },
        {
          name: 'Anxious Professionals',
          demographics: 'Age 30-50, High-stress careers, Urban/suburban',
          motivations: [
            'Natural anxiety management',
            'Better sleep quality',
            'Increased focus and productivity',
            'Avoiding pharmaceutical dependencies'
          ],
          painPoints: [
            'Need fast-acting results',
            'Concerns about drowsiness during work',
            'Finding time for consistent supplementation',
            'Balancing multiple supplements'
          ],
          buyingBehavior: 'Purchase premium products, value convenience and quality, often buy in bulk to ensure consistent supply.',
          reviewExamples: [
            {
              rating: 5,
              verified: true,
              date: '2025-07-20',
              text: "Game changer for my anxiety! I take one in the morning and feel calm but focused throughout my workday. No jittery feeling like with other supplements.",
              helpfulVotes: 67
            }
          ]
        }
      ],
      voice_of_customer: {
        keyThemes: [
          {
            theme: 'Mood Improvement',
            sentiment: 'positive',
            examples: [
              'Significantly improved my mood within 2 weeks',
              'Feel more balanced and positive throughout the day',
              'Helps with seasonal depression',
              'Better emotional regulation'
            ]
          },
          {
            theme: 'Quality Concerns',
            sentiment: 'negative',
            examples: [
              'Rice flour filler not mentioned in product description',
              'Capsules are too large for easy swallowing',
              'Concerned about actual saffron content',
              'Wish they disclosed standardization percentage'
            ]
          },
          {
            theme: 'Natural Alternative',
            sentiment: 'positive',
            examples: [
              'Great natural alternative to prescription meds',
              'No side effects like pharmaceuticals',
              'Love that it\'s a natural solution',
              'Finally found something natural that works'
            ]
          }
        ],
        customerLanguage: {
          positiveTerms: ['mood boost', 'natural', 'effective', 'quality', 'energy', 'calm', 'balanced', 'improved'],
          negativeTerms: ['filler', 'large capsules', 'expensive', 'slow shipping', 'no effect', 'stomach upset'],
          functionalTerms: ['saffron extract', 'mood support', 'supplement', 'daily dose', 'third-party tested', '88.5mg']
        },
        unmetNeeds: [
          'Smaller capsule size option for easier swallowing',
          'Clear information about extract standardization',
          'Bundle deals for long-term users',
          'Morning/evening formulation options',
          'More information about sourcing and purity',
          'Subscription discounts for regular users'
        ],
        purchaseDrivers: [
          'Doctor recommendations',
          'Positive reviews about mood improvement',
          'Natural alternative to antidepressants',
          'Third-party testing claims',
          'Clinical study references'
        ]
      },
      emotional_triggers: [
        {
          trigger: 'Fear of Dependency',
          description: 'Customers want natural alternatives to avoid pharmaceutical dependencies',
          examples: [
            'Looking for natural options instead of antidepressants',
            'Don\'t want to rely on prescription medications',
            'Worried about getting hooked on pharmaceuticals',
            'Want something I can stop taking anytime'
          ],
          sentiment: 'negative',
          marketingOpportunity: 'Emphasize non-habit forming, natural properties. Use messaging like "Support your mood naturally" and "No dependency concerns"'
        },
        {
          trigger: 'Hope for Better Days',
          description: 'Customers seeking improvement in mood and overall well-being',
          examples: [
            'Hoping this helps with my seasonal depression',
            'Want to feel like myself again',
            'Looking for something to lift the brain fog',
            'Need help getting through tough times'
          ],
          sentiment: 'positive',
          marketingOpportunity: 'Use testimonials showing life transformation. Focus on "rediscover joy" and "reclaim your life" messaging'
        },
        {
          trigger: 'Trust in Nature',
          description: 'Belief that natural solutions are safer and more effective long-term',
          examples: [
            'Trust natural supplements more than synthetic drugs',
            'Nature knows best',
            'Prefer plant-based solutions',
            'Believe in holistic health approaches'
          ],
          sentiment: 'positive',
          marketingOpportunity: 'Highlight natural sourcing, purity, and traditional use. Use "Ancient wisdom meets modern science" positioning'
        },
        {
          trigger: 'Skepticism and Caution',
          description: 'Concerns about supplement industry practices and product authenticity',
          examples: [
            'So many fake supplements out there',
            'How do I know this has real saffron?',
            'Worried about fillers and additives',
            'Need proof it actually works'
          ],
          sentiment: 'negative',
          marketingOpportunity: 'Provide transparency through third-party testing results, certificates of analysis, and clinical study references'
        }
      ],
      raw_reviews: [], // This would be populated from actual review data
      total_reviews_analyzed: 89,
      analysis_date: new Date().toISOString()
    }
    
    // Check if record already exists for this product
    const { data: existing, error: checkError } = await supabase
      .from('niches_market_intelligence')
      .select('*')
      .eq('product_id', productId)
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
        .from('niches_market_intelligence')
        .update(sampleData)
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating market intelligence:', error)
        return NextResponse.json({ 
          error: 'Failed to update',
          details: error 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Market intelligence data updated successfully',
        data: data,
        product_id: productId
      })
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('niches_market_intelligence')
        .insert(sampleData)
        .select()
        .single()
      
      if (error) {
        console.error('Error inserting market intelligence:', error)
        return NextResponse.json({ 
          error: 'Failed to insert',
          details: error,
          attempted_data: sampleData
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Market intelligence data inserted successfully',
        data: data,
        product_id: productId
      })
    }
  } catch (error) {
    console.error('Error populating market intelligence:', error)
    return NextResponse.json({ 
      error: 'Failed to populate market intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}