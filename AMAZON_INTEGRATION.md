# Amazon SP-API Integration Documentation

## Overview

CommerceCrafted now includes a robust Amazon SP-API integration that provides real-time product data, pricing information, BSR tracking, and advanced analysis capabilities. This integration replaces mock data with live Amazon marketplace data.

## 🚀 Features

### Real-Time Data Access
- **Product Information**: Title, brand, category, images, descriptions, specifications
- **Live Pricing**: Current prices, list prices, savings, price history
- **BSR Tracking**: Best Seller Rank data with sales estimates
- **Review Analysis**: Review counts, ratings, sentiment analysis
- **Inventory Data**: Stock levels, availability status

### Advanced Analysis
- **Opportunity Scoring**: AI-powered opportunity assessment (1-10 scale)
- **Market Analysis**: Market size, growth trends, seasonality patterns
- **Competition Analysis**: Competitor count, price ranges, market share
- **Financial Modeling**: Revenue estimates, profit margins, ROI calculations
- **Keyword Research**: Search volume, competition, PPC recommendations

### Performance Features
- **Smart Caching**: Automatic caching with configurable TTL
- **Rate Limiting**: Respects Amazon API rate limits
- **Error Handling**: Graceful fallbacks and retry mechanisms
- **Bulk Operations**: Efficient batch processing for multiple products

## 📁 File Structure

```
src/lib/
├── amazon-api.ts              # Core Amazon SP-API client
├── product-data-service.ts    # Enhanced product service with analysis
└── mockData.ts               # Updated service with real API integration

src/app/api/amazon/
├── search/route.ts           # Product search endpoint
├── product/[asin]/route.ts   # Product details endpoint
└── trending/route.ts         # Trending products endpoint

scripts/
└── test-amazon-api.ts        # Integration test script

docs/
├── AMAZON_SETUP.md          # Setup and configuration guide
└── AMAZON_INTEGRATION.md    # This documentation file
```

## 🔧 API Endpoints

### 1. Product Search
```bash
GET /api/amazon/search?q=headphones&category=Electronics&limit=10
```

**Parameters:**
- `q` (required): Search query
- `category` (optional): Product category filter
- `minScore` (optional): Minimum opportunity score
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort by opportunity, demand, recent, price, bsr
- `limit` (optional): Results limit (default: 10, max: 50)

**Response:**
```json
{
  "query": "headphones",
  "results": [
    {
      "asin": "B08MVBRNKV",
      "title": "Sony WH-1000XM4 Wireless Headphones",
      "brand": "Sony",
      "category": "Electronics",
      "price": 349.99,
      "currency": "USD",
      "rating": 4.4,
      "reviewCount": 85432,
      "imageUrl": "https://...",
      "bsr": 1250,
      "bsrCategory": "Headphones",
      "estimatedMonthlySales": 850,
      "opportunityScore": 8,
      "demandScore": 9,
      "competitionScore": 7,
      "feasibilityScore": 6,
      "lastUpdated": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "count": 10,
    "hasNextPage": true,
    "nextPageToken": "abc123"
  }
}
```

### 2. Product Details
```bash
GET /api/amazon/product/B08MVBRNKV?deep=true
```

**Parameters:**
- `asin` (required): Amazon product ASIN
- `deep` (optional): Include deep analysis (default: false)

**Response:**
```json
{
  "product": {
    "asin": "B08MVBRNKV",
    "title": "Sony WH-1000XM4 Wireless Headphones",
    "brand": "Sony",
    "price": 349.99,
    "bsr": {
      "rank": 1250,
      "category": "Headphones",
      "estimatedMonthlySales": 850
    },
    "reviews": {
      "totalReviews": 85432,
      "averageRating": 4.4,
      "sentimentAnalysis": {
        "positive": 78,
        "negative": 12,
        "neutral": 10
      }
    },
    "analysis": {
      "opportunityScore": 8,
      "demandScore": 9,
      "financialAnalysis": {
        "estimatedRevenue": 125000,
        "profitMargin": 25,
        "roi": 180
      }
    }
  },
  "deepAnalysis": {
    "opportunityScore": 8,
    "marketSize": {
      "tam": 500000000,
      "sam": 50000000,
      "som": 5000000
    },
    "competitionLevel": "medium",
    "demandTrends": {
      "cagr": 12.5
    }
  }
}
```

### 3. Trending Products
```bash
GET /api/amazon/trending?limit=10&category=Electronics
```

**Response:**
```json
{
  "trending": [
    {
      "rank": 1,
      "asin": "B08MVBRNKV",
      "title": "Sony WH-1000XM4",
      "opportunityScore": 9,
      "estimatedRevenue": 125000,
      "profitMargin": 25
    }
  ],
  "summary": {
    "avgOpportunityScore": 8.2,
    "avgProfitMargin": 28.5,
    "categories": ["Electronics", "Audio"],
    "priceRange": {
      "min": 25.99,
      "max": 499.99
    }
  }
}
```

### 4. Daily Featured Product
```bash
POST /api/amazon/trending
```

**Response:**
```json
{
  "dailyFeature": {
    "id": "daily-2024-01-20",
    "date": "2024-01-20",
    "reason": "High opportunity wireless audio product with strong market demand...",
    "product": {
      "asin": "B08MVBRNKV",
      "title": "Sony WH-1000XM4",
      "opportunityScore": 8,
      "marketSize": "$8.2B",
      "growthRate": 12
    }
  }
}
```

## 🧪 Testing

### Run Integration Tests
```bash
npm run test:amazon
```

### Manual Testing Examples

1. **Search Products:**
```bash
curl "http://localhost:3000/api/amazon/search?q=yoga%20mat&limit=5"
```

2. **Get Product Details:**
```bash
curl "http://localhost:3000/api/amazon/product/B08MVBRNKV?deep=true"
```

3. **Get Trending Products:**
```bash
curl "http://localhost:3000/api/amazon/trending?limit=10"
```

## 📊 Data Models

### EnhancedProduct
```typescript
interface EnhancedProduct extends AmazonProduct {
  analysis?: ProductAnalysis
  deepAnalysis?: DeepAnalysis
  keywordAnalysis?: KeywordAnalysis
  ppcStrategy?: PPCStrategy
  inventoryAnalysis?: InventoryAnalysis
  demandAnalysis?: DemandAnalysis
  competitorAnalysis?: CompetitorAnalysis
  financialModel?: FinancialModel
  pricing?: ProductPricing
  bsrData?: BSRData
  reviewData?: ReviewData
}
```

### ProductAnalysis
```typescript
interface ProductAnalysis {
  opportunityScore: number      // 1-10 scale
  demandScore: number          // 1-10 scale
  competitionScore: number     // 1-10 scale
  feasibilityScore: number     // 1-10 scale
  financialAnalysis: {
    estimatedRevenue: number
    profitMargin: number
    breakEvenUnits: number
    roi: number
  }
  marketAnalysis: {
    marketSize: string
    growthRate: number
    seasonality: string
    trends: string[]
  }
  // ... additional fields
}
```

## 🔄 Data Flow

1. **User Request** → API Endpoint
2. **API Endpoint** → ProductDataService
3. **ProductDataService** → AmazonAPIService
4. **AmazonAPIService** → Amazon SP-API
5. **Response** ← Enhanced with Analysis
6. **Cache** ← Store for future requests

## 🚦 Rate Limiting

### Amazon SP-API Limits
- **Catalog Items**: 10 requests/second
- **Pricing**: 10 requests/second
- **Reports**: Varies by report type

### Our Implementation
- Automatic throttling with queue management
- Exponential backoff for rate limit errors
- Smart caching to minimize API calls
- Bulk operations for efficiency

## 💾 Caching Strategy

### Cache TTL (Time To Live)
- **Product Information**: 30 minutes
- **Pricing Data**: 5 minutes
- **BSR Data**: 1 hour
- **Review Data**: 2 hours
- **Analysis Results**: 4 hours

### Cache Keys
```
product:{asin}
pricing:{asin}
bsr:{asin}
reviews:{asin}
search:{query}:{options_hash}
```

## 🔒 Security & Privacy

### Data Protection
- All API credentials stored in environment variables
- No sensitive data logged
- Automatic credential rotation support
- Rate limiting prevents abuse

### Compliance
- Follows Amazon's ToS and API guidelines
- Respects robots.txt and rate limits
- No unauthorized data scraping
- User consent for data processing

## 🐛 Error Handling

### Error Types
1. **Authentication Errors**: Invalid credentials
2. **Rate Limit Errors**: Too many requests
3. **Not Found Errors**: Product doesn't exist
4. **Network Errors**: Connection issues
5. **Validation Errors**: Invalid input

### Fallback Strategy
1. Try Amazon SP-API
2. If error, check cache
3. If no cache, use mock data
4. Log error for monitoring
5. Return graceful response

## 📈 Monitoring & Metrics

### Key Metrics
- API response times
- Error rates by endpoint
- Cache hit ratios
- Rate limit utilization
- Product analysis accuracy

### Logging
```typescript
// Successful requests
logger.info('Product fetched', { asin, responseTime })

// Errors
logger.error('API error', { asin, error, statusCode })

// Performance
logger.debug('Cache hit', { key, ttl })
```

## 🔮 Future Enhancements

### Planned Features
1. **Historical Data**: Price and BSR history tracking
2. **Competitor Monitoring**: Automated competitor analysis
3. **Market Alerts**: Real-time opportunity notifications
4. **Bulk Analysis**: Batch processing for large datasets
5. **Custom Reports**: User-defined analysis reports

### API Improvements
1. **GraphQL Support**: More flexible data fetching
2. **WebSocket Updates**: Real-time data streaming
3. **Webhook Integration**: Event-driven updates
4. **Advanced Filtering**: More search options
5. **Export Features**: CSV/Excel data export

## 🤝 Contributing

### Adding New Features
1. Follow existing patterns in `amazon-api.ts`
2. Add comprehensive error handling
3. Include caching where appropriate
4. Write tests for new functionality
5. Update documentation

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Handle edge cases gracefully

## 📚 Resources

- [Amazon SP-API Documentation](https://developer-docs.amazon.com/sp-api/)
- [SP-API GitHub Repository](https://github.com/amzn/selling-partner-api-models)
- [Rate Limiting Best Practices](https://developer-docs.amazon.com/sp-api/docs/usage-plans-and-rate-limits)
- [Authentication Guide](https://developer-docs.amazon.com/sp-api/docs/connecting-to-the-selling-partner-api)

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: CommerceCrafted Team