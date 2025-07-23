/**
 * API Configuration Service
 * Centralized configuration for all external API integrations
 */

export const apiConfig = {
  // AI Services (Already configured)
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.7,
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-3-opus-20240229',
    maxTokens: 4000,
  },
  
  // Amazon SP-API Configuration
  amazonSP: {
    endpoint: process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-na.amazon.com',
    credentials: {
      clientId: process.env.AMAZON_SP_CLIENT_ID!,
      clientSecret: process.env.AMAZON_SP_CLIENT_SECRET!,
      refreshToken: process.env.AMAZON_SP_REFRESH_TOKEN!,
      marketplace: process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER', // US marketplace
    },
    rateLimit: {
      tokensPerSecond: 1,
      burst: 5,
      maxRetries: 3,
    },
  },
  
  // Amazon Advertising API
  amazonAds: {
    endpoint: process.env.AMAZON_ADS_API_ENDPOINT || 'https://advertising-api.amazon.com',
    credentials: {
      clientId: process.env.ADS_API_CLIENT_ID!,
      clientSecret: process.env.ADS_API_CLIENT_SECRET!,
      refreshToken: process.env.ADS_API_REFRESH_TOKEN!,
      profileId: process.env.ADS_API_PROFILE_ID!,
    },
  },
  
  // Keepa API Configuration
  keepa: {
    apiKey: process.env.KEEPA_API_KEY!,
    endpoint: 'https://api.keepa.com/v1',
    domain: 1, // US Amazon (1 = .com)
    updateInterval: 300, // 5 minutes minimum between updates
    tokensPerMinute: 60,
    costPerToken: 0.001, // $0.001 per token
  },
  
  // Apify Configuration
  apify: {
    apiKey: process.env.APIFY_API_KEY!,
    actors: {
      amazonReviews: process.env.APIFY_AMAZON_REVIEWS_ACTOR || 'junglee/amazon-reviews-scraper',
      amazonSearch: process.env.APIFY_AMAZON_SEARCH_ACTOR || 'junglee/amazon-product-search-scraper',
      socialMedia: process.env.APIFY_SOCIAL_MEDIA_ACTOR || 'apify/social-media-scraper',
    },
    defaultSettings: {
      memory: 2048,
      timeout: 300, // 5 minutes
      maxItems: 100,
    },
  },
  
  // Google Trends Configuration
  googleTrends: {
    // Note: Google Trends doesn't require API key but has rate limits
    endpoint: 'https://trends.google.com/trends/api',
    geo: 'US',
    timezone: 360, // CST
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
    },
  },
  
  // Redis Configuration (for caching and queues)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production',
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  
  // Rate Limiting Configuration
  rateLimits: {
    global: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // requests per window
    },
    analysis: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // analyses per hour
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 60, // API calls per minute
    },
  },
  
  // Feature Flags
  features: {
    enableRealAPICalls: process.env.ENABLE_REAL_API_CALLS === 'true',
    enableCaching: process.env.ENABLE_CACHING !== 'false', // Default true
    enableQueueProcessing: process.env.ENABLE_QUEUE_PROCESSING !== 'false',
    enableWebhooks: process.env.ENABLE_WEBHOOKS === 'true',
    debugMode: process.env.DEBUG_MODE === 'true',
  },
  
  // Cost Tracking
  costs: {
    keepa: {
      perProduct: 0.01,
      perBulkRequest: 0.001,
    },
    apify: {
      perRun: 0.10,
      perThousandResults: 0.05,
    },
    openai: {
      gpt4: {
        input: 0.01, // per 1K tokens
        output: 0.03, // per 1K tokens
      },
    },
    amazonSP: {
      perRequest: 0.0001,
    },
  },
};

// Validation function to ensure all required env vars are set
export function validateApiConfig(): { valid: boolean; missing: string[] } {
  const required = [
    'OPENAI_API_KEY',
    'AMAZON_SP_CLIENT_ID',
    'AMAZON_SP_CLIENT_SECRET',
    'AMAZON_SP_REFRESH_TOKEN',
    'KEEPA_API_KEY',
    'APIFY_API_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Helper to get API endpoint with environment override
export function getApiEndpoint(service: keyof typeof apiConfig): string {
  const config = apiConfig[service];
  if ('endpoint' in config) {
    return config.endpoint;
  }
  return '';
}

// Export type for use in other services
export type ApiConfig = typeof apiConfig;