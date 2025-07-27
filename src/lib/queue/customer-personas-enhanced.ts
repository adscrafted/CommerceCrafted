/**
 * Enhanced Customer Persona Generator with Review Matching
 */

export interface PersonaReviewExample {
  text: string
  rating: number
  date: string
  verified: boolean
  helpfulVotes: number
  reviewerId?: string
}

export interface EnhancedCustomerPersona {
  name: string
  demographics: string
  motivations: string[]
  painPoints: string[]
  buyingBehavior: string
  keyPhrases: string[]
  reviewExamples: PersonaReviewExample[]
  percentage?: number
  reviewIndicators?: string[]
}

/**
 * Generate enhanced customer personas with matched reviews
 */
export async function generateEnhancedCustomerPersonas(
  reviewData: any,
  openaiApiKey: string
): Promise<EnhancedCustomerPersona[]> {
  try {
    // First, generate the personas with review indicators
    const personasPrompt = `Analyze these Amazon reviews to create customer personas with specific review indicators.

Product: ${reviewData.asin}
Total Reviews: ${reviewData.totalReviews}
Average Rating: ${reviewData.averageRating.toFixed(1)}

REVIEW METRICS:
Top Keywords: ${reviewData.metrics.topWords.slice(0, 20).map(w => `"${w.word}" (${w.count}x)`).join(', ')}
Top Phrases: ${reviewData.metrics.topPhrases.slice(0, 15).map(p => `"${p.phrase}" (${p.count}x)`).join(', ')}

SAMPLE REVIEWS (with metadata):
${reviewData.reviews.slice(0, 30).map((r, i) => {
  const reviewText = r.content || r.text || r.reviewText || '';
  const isVerified = r.verified_purchase !== undefined ? r.verified_purchase : r.verifiedPurchase || false;
  return `
Review ${i + 1} [ID: ${r.reviewerId || r.reviewer_id || i}]:
Rating: ${r.rating}/5, Verified: ${isVerified ? 'Yes' : 'No'}
"${reviewText}"
`;
}).join('\n')}

Create 3-4 distinct customer personas based on language patterns, concerns, and use cases in the reviews.

For each persona, identify:
1. Specific keywords/phrases they commonly use
2. Review IDs that best represent this persona
3. What percentage of reviews likely come from this persona type

Return JSON array:
[
  {
    "name": "Descriptive persona name",
    "demographics": "Age range, lifestyle, occupation details",
    "motivations": ["Why they buy this product"],
    "painPoints": ["Problems they're trying to solve"],
    "buyingBehavior": "How they shop and make decisions",
    "keyPhrases": ["Exact phrases from reviews that identify this persona"],
    "reviewIndicators": ["Unique language patterns or concerns that identify this persona"],
    "representativeReviewIds": [0, 5, 12], // Review indices from the samples above
    "percentage": 30 // Estimated % of reviews from this persona
  }
]`

    const personaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: personasPrompt }],
        max_tokens: 2000,
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })
    })

    if (!personaResponse.ok) {
      throw new Error('Failed to generate personas')
    }

    const personaData = await personaResponse.json()
    const rawPersonas = JSON.parse(personaData.choices[0].message.content)
    const personas = Array.isArray(rawPersonas) ? rawPersonas : (rawPersonas.personas || [])

    // Now match reviews to each persona
    const enhancedPersonas: EnhancedCustomerPersona[] = personas.map(persona => {
      const reviewExamples: PersonaReviewExample[] = []
      
      // Get the representative reviews for this persona
      if (persona.representativeReviewIds && Array.isArray(persona.representativeReviewIds)) {
        persona.representativeReviewIds.forEach(reviewId => {
          const review = reviewData.reviews[reviewId]
          if (review) {
            reviewExamples.push({
              text: review.content || review.text || review.reviewText,
              rating: review.rating,
              date: review.review_date || review.reviewDate || new Date().toISOString(),
              verified: review.verified_purchase !== undefined ? review.verified_purchase : review.verifiedPurchase || false,
              helpfulVotes: review.helpful_votes || review.helpfulVotes || 0,
              reviewerId: review.reviewerId || review.reviewer_id
            })
          }
        })
      }

      // If no reviews matched, try to find reviews based on key phrases
      if (reviewExamples.length === 0 && persona.keyPhrases) {
        const matchedReviews = findReviewsByKeyPhrases(
          reviewData.reviews,
          persona.keyPhrases,
          3 // Max 3 reviews per persona
        )
        
        matchedReviews.forEach(review => {
          reviewExamples.push({
            text: review.content || review.text || review.reviewText,
            rating: review.rating,
            date: review.review_date || review.reviewDate || new Date().toISOString(),
            verified: review.verified_purchase !== undefined ? review.verified_purchase : review.verifiedPurchase || false,
            helpfulVotes: review.helpful_votes || review.helpfulVotes || 0,
            reviewerId: review.reviewerId || review.reviewer_id
          })
        })
      }

      return {
        name: persona.name,
        demographics: persona.demographics,
        motivations: persona.motivations || [],
        painPoints: persona.painPoints || [],
        buyingBehavior: persona.buyingBehavior || '',
        keyPhrases: persona.keyPhrases || [],
        reviewExamples,
        percentage: persona.percentage,
        reviewIndicators: persona.reviewIndicators || []
      }
    })

    return enhancedPersonas

  } catch (error) {
    console.error('Error generating enhanced customer personas:', error)
    return []
  }
}

/**
 * Find reviews that match key phrases
 */
function findReviewsByKeyPhrases(reviews: any[], keyPhrases: string[], maxReviews: number): any[] {
  const matchedReviews: any[] = []
  const usedReviewIds = new Set<string>()

  for (const review of reviews) {
    if (matchedReviews.length >= maxReviews) break
    
    const reviewText = (review.content || review.text || review.reviewText || '').toLowerCase()
    const reviewId = review.reviewerId || review.reviewer_id || review.id
    
    // Skip if already used
    if (usedReviewIds.has(reviewId)) continue
    
    // Check if review contains any key phrases
    const hasKeyPhrase = keyPhrases.some(phrase => 
      reviewText.includes(phrase.toLowerCase())
    )
    
    if (hasKeyPhrase) {
      matchedReviews.push(review)
      usedReviewIds.add(reviewId)
    }
  }

  // If not enough matches, add high-quality reviews
  if (matchedReviews.length < maxReviews) {
    const highQualityReviews = reviews
      .filter(r => {
        const id = r.reviewerId || r.reviewer_id || r.id
        return !usedReviewIds.has(id) && 
               r.verified_purchase && 
               (r.helpful_votes || 0) > 5
      })
      .sort((a, b) => (b.helpful_votes || 0) - (a.helpful_votes || 0))
      .slice(0, maxReviews - matchedReviews.length)
    
    matchedReviews.push(...highQualityReviews)
  }

  return matchedReviews
}

/**
 * Match reviews to personas based on language analysis
 */
export async function matchReviewsToPersonas(
  personas: EnhancedCustomerPersona[],
  reviews: any[],
  openaiApiKey: string
): Promise<Map<string, string>> {
  // This function can be used for more sophisticated matching if needed
  const reviewToPersonaMap = new Map<string, string>()
  
  try {
    // For now, use the simpler key phrase matching
    // Could enhance this with AI-based matching for better accuracy
    
    personas.forEach(persona => {
      persona.reviewExamples.forEach(example => {
        if (example.reviewerId) {
          reviewToPersonaMap.set(example.reviewerId, persona.name)
        }
      })
    })
    
  } catch (error) {
    console.error('Error matching reviews to personas:', error)
  }
  
  return reviewToPersonaMap
}