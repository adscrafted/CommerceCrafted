# How AI Market Intelligence Works in CommerceCrafted

## Data Flow Overview

### 1. **Data Collection Phase**
When you process a niche with ASINs, the system collects:

#### Product Data (from Keepa API)
- Product titles, brands, categories
- Prices and price history
- BSR (Best Sellers Rank)
- Review counts and ratings
- Product features and descriptions

#### Keyword Data (from Amazon Ads API)
- Search terms customers use
- Search volumes
- Competition levels
- Suggested bid prices
- Relevance scores

#### Review Data (from Review Scraper)
- 100 reviews with full text
- Star ratings distribution
- Verified purchase status
- Review dates (for seasonality)
- Common words and phrases

### 2. **Pre-Processing & Analysis**
The system calculates real metrics:

```javascript
// Example metrics calculated from reviews
{
  ratingDistribution: [
    { rating: 5, count: 45, percentage: 45 },
    { rating: 4, count: 25, percentage: 25 },
    // etc.
  ],
  topWords: [
    { word: "quality", count: 23 },
    { word: "supplement", count: 19 },
    { word: "energy", count: 15 }
  ],
  topPhrases: [
    { phrase: "great quality", count: 8 },
    { phrase: "helps with energy", count: 6 }
  ],
  verifiedPurchaseRate: 87
}
```

### 3. **AI Analysis with OpenAI GPT-4**
The system sends this real data to OpenAI with specific prompts:

#### For Market Assessment:
- Analyzes price gaps (e.g., "Only 19% of products target $30+ range")
- Identifies seasonal patterns from review dates
- Detects feature gaps from negative reviews
- Assesses competition based on review counts and ratings

#### For Opportunities:
- Finds unmet needs in 1-2 star reviews
- Identifies underserved customer segments
- Detects pricing opportunities
- Discovers feature requests

#### For Risks:
- Analyzes competitor strengths
- Identifies market saturation signals
- Detects quality issues trends
- Assesses regulatory concerns mentioned

### 4. **Example: How "Premium Segment Underserved" is Identified**

1. **Price Analysis**: System checks all product prices
   ```
   Products under $20: 65%
   Products $20-30: 16%
   Products over $30: 19%  <-- Gap identified
   ```

2. **Review Analysis**: AI reads reviews mentioning price
   ```
   "Would pay more for better quality"
   "Cheap but you get what you pay for"
   "Looking for a premium option"
   ```

3. **Keyword Analysis**: Checks search terms
   ```
   "premium saffron supplement" - 450 searches/month
   "high quality saffron" - 380 searches/month
   "best saffron supplement" - 920 searches/month
   ```

4. **AI Conclusion**: Combines all signals to identify opportunity

## Real vs Mock Data

**What's Real:**
- All product data from Amazon
- Actual customer reviews
- Real keyword search volumes
- Calculated metrics (ratings, percentages)
- Review text analysis

**What's AI-Generated:**
- Interpretation of patterns
- Market opportunity identification
- Risk assessment
- Strategic recommendations
- Persona creation from review language

## How to Verify the Data

1. Check the review counts in your database
2. Look at the keyword data collected
3. Verify product prices match Amazon
4. Cross-reference insights with actual reviews

The AI is essentially acting as a senior market analyst who reads all the reviews and data, then provides strategic insights - but it's based on real data, not made up.