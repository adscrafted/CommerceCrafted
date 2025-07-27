/**
 * Enhanced Voice of Customer Analysis Generator
 */

export interface EnhancedVoiceOfCustomerData {
  topPositives: Array<{
    theme: string
    mentions: number
    examples: string[]
  }>
  topIssues: Array<{
    issue: string
    mentions: number
    examples: string[]
  }>
  usageInsights: Array<{
    insight: string
    frequency: string
    examples: string[]
  }>
  buyingReasons: Array<{
    reason: string
    percentage: number
    examples: string[]
  }>
  metrics: {
    totalReviews: number
    averageRating: number
    verifiedPurchases: number
  }
  ratingDistribution: Array<{
    rating: number
    count: number
    percentage: number
  }>
  keyPatterns: Array<{
    pattern: string
    frequency: 'Very High' | 'High' | 'Medium' | 'Low'
    impact: 'Critical' | 'High' | 'Medium' | 'Low'
    description: string
  }>
  purchaseBarriers: Array<{
    barrier: string
    severity: 'High' | 'Medium' | 'Low'
    frequency: number
    solution: string
  }>
  customerQuestions: Array<{
    question: string
    frequency: number
    category: string
    suggestedAnswer: string
  }>
}

export async function generateEnhancedVoiceOfCustomer(
  reviewData: any,
  openaiApiKey: string
): Promise<EnhancedVoiceOfCustomerData> {
  try {
    const prompt = `Analyze these Amazon reviews to create a comprehensive Voice of Customer analysis.

Product: ${reviewData.asin}
Total Reviews: ${reviewData.totalReviews}
Average Rating: ${reviewData.averageRating.toFixed(1)}
Verified Purchases: ${reviewData.verifiedPurchases || 'N/A'}

REVIEW METRICS:
${JSON.stringify(reviewData.metrics.ratingDistribution, null, 2)}

TOP KEYWORDS (${reviewData.metrics.topWords.length}):
${reviewData.metrics.topWords.map(w => `"${w.word}" (${w.count}x)`).join(', ')}

TOP PHRASES (${reviewData.metrics.topPhrases.length}):
${reviewData.metrics.topPhrases.map(p => `"${p.phrase}" (${p.count}x)`).join(', ')}

SAMPLE REVIEWS BY RATING:
5-star reviews: ${reviewData.metrics.reviewsByRating[5]?.slice(0, 5).join(' || ')}
4-star reviews: ${reviewData.metrics.reviewsByRating[4]?.slice(0, 3).join(' || ')}
3-star reviews: ${reviewData.metrics.reviewsByRating[3]?.slice(0, 3).join(' || ')}
1-2 star reviews: ${[...reviewData.metrics.reviewsByRating[1] || [], ...reviewData.metrics.reviewsByRating[2] || []].slice(0, 5).join(' || ')}

Analyze this data to extract:
1. Top positive themes with specific examples from reviews
2. Top issues/complaints with specific examples
3. Usage insights (how customers use the product)
4. Buying reasons (why customers purchase)
5. Key patterns in customer behavior
6. Purchase barriers that prevent sales
7. Common questions customers have

Return a detailed JSON analysis:
{
  "topPositives": [
    {
      "theme": "Specific positive theme",
      "mentions": number,
      "examples": ["Direct quote from review", "Another quote"]
    }
  ],
  "topIssues": [
    {
      "issue": "Specific problem",
      "mentions": number,
      "examples": ["Direct quote showing issue", "Another example"]
    }
  ],
  "usageInsights": [
    {
      "insight": "How customers use product",
      "frequency": "Daily/Weekly/Occasionally",
      "examples": ["Quote about usage", "Another usage example"]
    }
  ],
  "buyingReasons": [
    {
      "reason": "Why customers buy",
      "percentage": number (estimate based on review patterns),
      "examples": ["Quote showing buying reason", "Another example"]
    }
  ],
  "metrics": {
    "totalReviews": ${reviewData.totalReviews},
    "averageRating": ${reviewData.averageRating},
    "verifiedPurchases": ${reviewData.verifiedPurchases || Math.round(reviewData.totalReviews * 0.85)}
  },
  "ratingDistribution": ${JSON.stringify(reviewData.metrics.ratingDistribution)},
  "keyPatterns": [
    {
      "pattern": "Observed pattern",
      "frequency": "Very High/High/Medium/Low",
      "impact": "Critical/High/Medium/Low",
      "description": "What this pattern means"
    }
  ],
  "purchaseBarriers": [
    {
      "barrier": "What prevents purchase",
      "severity": "High/Medium/Low",
      "frequency": number,
      "solution": "How to address this barrier"
    }
  ],
  "customerQuestions": [
    {
      "question": "Common question",
      "frequency": number,
      "category": "Usage/Quality/Shipping/etc",
      "suggestedAnswer": "Helpful answer based on reviews"
    }
  ]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)
      
      // Ensure all required fields exist with defaults
      return {
        topPositives: result.topPositives || [],
        topIssues: result.topIssues || [],
        usageInsights: result.usageInsights || [],
        buyingReasons: result.buyingReasons || [],
        metrics: result.metrics || {
          totalReviews: reviewData.totalReviews,
          averageRating: reviewData.averageRating,
          verifiedPurchases: Math.round(reviewData.totalReviews * 0.85)
        },
        ratingDistribution: result.ratingDistribution || reviewData.metrics.ratingDistribution,
        keyPatterns: result.keyPatterns || [],
        purchaseBarriers: result.purchaseBarriers || [],
        customerQuestions: result.customerQuestions || []
      }
    } else {
      console.error('OpenAI API error:', await response.text())
      throw new Error('Failed to generate enhanced Voice of Customer analysis')
    }
  } catch (error) {
    console.error('Error generating enhanced Voice of Customer:', error)
    
    // Return fallback data structure
    return {
      topPositives: [],
      topIssues: [],
      usageInsights: [],
      buyingReasons: [],
      metrics: {
        totalReviews: reviewData.totalReviews || 0,
        averageRating: reviewData.averageRating || 0,
        verifiedPurchases: Math.round((reviewData.totalReviews || 0) * 0.85)
      },
      ratingDistribution: reviewData.metrics?.ratingDistribution || [],
      keyPatterns: [],
      purchaseBarriers: [],
      customerQuestions: []
    }
  }
}