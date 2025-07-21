import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const openaiKey = process.env.OPENAI_API_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateEmotionalTriggers(reviewData: any): Promise<any[]> {
  try {
    const prompt = `Identify emotional triggers and psychological drivers in these Amazon reviews.

Product: ${reviewData.asin}
Average Rating: ${reviewData.averageRating.toFixed(1)}/5

EMOTIONAL LANGUAGE IN REVIEWS:
Top Keywords: ${reviewData.metrics.topWords.slice(0, 15).map((w: any) => w.word).join(', ')}
Key Phrases: ${reviewData.metrics.topPhrases.slice(0, 10).map((p: any) => p.phrase).join(', ')}

SAMPLE REVIEWS SHOWING EMOTIONS:
Happy customers (5-star): ${reviewData.metrics.reviewsByRating[5].slice(0, 3).join(' | ')}
Frustrated customers (1-2 star): ${[...reviewData.metrics.reviewsByRating[1], ...reviewData.metrics.reviewsByRating[2]].slice(0, 3).join(' | ')}

Look for emotional language, urgency indicators, social proof mentions, fear/desire expressions, and other psychological patterns in the reviews.

Return a JSON array of emotional triggers:
[
  {
    "trigger": "Name of the emotional trigger",
    "description": "How this emotion influences purchasing",
    "examples": ["Actual quotes from reviews showing this trigger"],
    "sentiment": "positive/negative",
    "marketingOpportunity": "How to ethically leverage this insight"
  }
]`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)
      // Handle both array response and object with array property
      return Array.isArray(result) ? result : (result.triggers || result.emotionalTriggers || [])
    }
  } catch (error) {
    console.error('Error generating emotional triggers:', error)
  }
  return []
}

function calculateReviewMetrics(reviews: any[]) {
  console.log(`📊 Calculating keyword and phrase analysis from ${reviews.length} reviews`)
  
  const wordFrequency: Record<string, number> = {}
  const phraseFrequency: Record<string, number> = {}
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
    'with', 'by', 'from', 'is', 'it', 'this', 'that', 'was', 'are', 'were', 'been', 'have', 'has', 
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 
    'shall', 'can', 'be', 'am', 'so', 'if', 'then', 'than', 'when', 'where', 'what', 'which', 
    'who', 'whom', 'whose', 'why', 'how', 'not', 'no', 'nor', 'as', 'just', 'i', 'me', 'my', 
    'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their'])
  
  reviews.forEach(review => {
    // Count ratings
    ratingCounts[review.rating as 1|2|3|4|5]++
    
    // Clean and tokenize text
    const text = review.content.toLowerCase()
    const words = text.match(/\b[a-z]+\b/g) || []
    
    // Single word frequency
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      }
    })
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      if (i < words.length - 1) {
        const word1 = words[i]
        const word2 = words[i + 1]
        if (!commonWords.has(word1) || !commonWords.has(word2)) {
          const twoWord = `${word1} ${word2}`
          phraseFrequency[twoWord] = (phraseFrequency[twoWord] || 0) + 1
        }
      }
      
      if (i < words.length - 2) {
        const word1 = words[i]
        const word2 = words[i + 1]
        const word3 = words[i + 2]
        if (!commonWords.has(word1) || !commonWords.has(word2) || !commonWords.has(word3)) {
          const threeWord = `${word1} ${word2} ${word3}`
          phraseFrequency[threeWord] = (phraseFrequency[threeWord] || 0) + 1
        }
      }
    }
  })
  
  const totalReviews = reviews.length
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }))
  
  const topPhrases = Object.entries(phraseFrequency)
    .filter(([_, count]) => count > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([phrase, count]) => ({ phrase, count }))
  
  const reviewsByRating: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  reviews.forEach(review => {
    reviewsByRating[review.rating].push(review.content)
  })
  
  return {
    totalReviews,
    ratingDistribution: Object.entries(ratingCounts).map(([rating, count]) => ({
      rating: parseInt(rating),
      count,
      percentage: (count / totalReviews * 100).toFixed(1)
    })),
    topWords,
    topPhrases,
    reviewsByRating,
    verifiedPurchaseRate: (reviews.filter(r => r.verified_purchase).length / totalReviews * 100).toFixed(1),
    averageRating: reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  }
}

async function regenerateEmotionalTriggers() {
  console.log('🔄 Regenerating emotional triggers for existing market intelligence data...')
  
  try {
    // Get market intelligence records with empty emotional triggers
    const { data: marketIntelligence, error } = await supabase
      .from('market_intelligence')
      .select('*')
      .eq('niche_id', 'real-asins-1752788248926-5j2aoif')
    
    if (error) {
      console.error('Error fetching market intelligence:', error)
      return
    }
    
    console.log(`Found ${marketIntelligence?.length || 0} market intelligence records`)
    
    for (const mi of marketIntelligence || []) {
      console.log(`\n📊 Processing market intelligence for product: ${mi.product_id}`)
      
      // Get reviews for this product
      const { data: reviews, error: reviewError } = await supabase
        .from('customer_reviews')
        .select('*')
        .eq('product_id', mi.product_id)
        .limit(100)
      
      if (reviewError || !reviews || reviews.length === 0) {
        console.error('Error fetching reviews:', reviewError)
        continue
      }
      
      console.log(`Found ${reviews.length} reviews`)
      
      // Calculate review metrics
      const reviewMetrics = calculateReviewMetrics(reviews)
      
      // Prepare review data for analysis
      const reviewData = {
        asin: mi.product_id,
        reviews: reviews.map(r => r.content),
        averageRating: reviewMetrics.averageRating,
        totalReviews: reviews.length,
        metrics: reviewMetrics
      }
      
      // Generate emotional triggers
      console.log('🤖 Generating emotional triggers with AI...')
      const emotionalTriggers = await generateEmotionalTriggers(reviewData)
      
      console.log(`Generated ${emotionalTriggers.length} emotional triggers`)
      
      if (emotionalTriggers.length > 0) {
        // Update the market intelligence record
        const { error: updateError } = await supabase
          .from('market_intelligence')
          .update({ 
            emotional_triggers: emotionalTriggers,
            updated_at: new Date().toISOString()
          })
          .eq('id', mi.id)
        
        if (updateError) {
          console.error('Error updating market intelligence:', updateError)
        } else {
          console.log('✅ Successfully updated emotional triggers')
          console.log('Sample triggers:', emotionalTriggers.slice(0, 2))
        }
      }
    }
    
    console.log('\n✅ Emotional triggers regeneration complete!')
    
  } catch (error) {
    console.error('Error regenerating emotional triggers:', error)
  }
}

// Run the regeneration
regenerateEmotionalTriggers()