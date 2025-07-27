import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Sample market intelligence data for saffron supplements niche
    const sampleData = {
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
              'Feel more balanced and positive throughout the day'
            ]
          },
          {
            theme: 'Quality Concerns',
            sentiment: 'negative',
            examples: [
              'Rice flour filler not mentioned in product description',
              'Capsules are too large for easy swallowing'
            ]
          }
        ],
        customerLanguage: {
          positiveTerms: ['mood boost', 'natural', 'effective', 'quality', 'energy'],
          negativeTerms: ['filler', 'large capsules', 'expensive', 'slow shipping'],
          functionalTerms: ['saffron extract', 'mood support', 'supplement', 'daily dose']
        },
        unmetNeeds: [
          'Smaller capsule size option for easier swallowing',
          'Clear information about extract standardization',
          'Bundle deals for long-term users',
          'Morning/evening formulation options'
        ]
      },
      emotional_triggers: [
        {
          trigger: 'Fear of Dependency',
          description: 'Customers want natural alternatives to avoid pharmaceutical dependencies',
          examples: [
            'Looking for natural options instead of antidepressants',
            'Don\'t want to rely on prescription medications'
          ],
          marketingOpportunity: 'Emphasize non-habit forming, natural properties'
        },
        {
          trigger: 'Hope for Better Days',
          description: 'Customers seeking improvement in mood and overall well-being',
          examples: [
            'Hoping this helps with my seasonal depression',
            'Want to feel like myself again'
          ],
          marketingOpportunity: 'Use testimonials showing life transformation'
        }
      ],
      total_reviews_analyzed: 89,
      analysis_date: new Date().toISOString()
    }
    
    // Insert the sample data
    const { data, error } = await supabase
      .from('market_intelligence')
      .insert(sampleData)
      .select()
      .single()
    
    if (error) {
      console.error('Error inserting market intelligence:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Market intelligence data populated successfully',
      data: data
    })
  } catch (error) {
    console.error('Error populating market intelligence:', error)
    return NextResponse.json({ 
      error: 'Failed to populate market intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}