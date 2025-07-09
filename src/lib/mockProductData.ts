// Mock data for the daily product - shared across all analysis pages
export const mockProductData = {
  id: 'daily_product_1',
  title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
  subtitle: 'Revolutionary sleep technology combining comfort with audio entertainment',
  category: 'Health & Personal Care',
  asin: 'B08MVBRNKV',
  date: 'July 4, 2025',
  mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
  
  // Overall scores
  opportunityScore: 87,
  scores: {
    demand: 92,
    competition: 78,
    keywords: 85,
    listing: 82,
    intelligence: 88,
    launch: 90,
    financial: 88,
    overall: 87
  },
  
  // Demand Analysis Data
  demandData: {
    monthlySearchVolume: 45000,
    searchTrend: '+23%',
    marketSize: 1200000000,
    marketGrowth: '+15%',
    conversionRate: 12.5,
    clickShare: 32,
    seasonality: {
      jan: 85, feb: 82, mar: 78, apr: 75, may: 70, jun: 68,
      jul: 65, aug: 70, sep: 75, oct: 80, nov: 90, dec: 100
    },
    googleTrends: [
      { month: 'Jan', value: 85 },
      { month: 'Feb', value: 82 },
      { month: 'Mar', value: 78 },
      { month: 'Apr', value: 75 },
      { month: 'May', value: 70 },
      { month: 'Jun', value: 68 },
      { month: 'Jul', value: 65 },
      { month: 'Aug', value: 70 },
      { month: 'Sep', value: 75 },
      { month: 'Oct', value: 80 },
      { month: 'Nov', value: 90 },
      { month: 'Dec', value: 100 }
    ],
    customerAvatars: [
      {
        name: 'Night Shift Worker',
        age: '25-40',
        gender: '60% Male, 40% Female',
        income: '$45,000-$75,000',
        location: 'Urban/Suburban areas',
        occupation: 'Healthcare, Security, Manufacturing, Emergency Services',
        lifestyle: 'Works 10pm-6am shifts, struggles with daytime sleep, health-conscious due to irregular schedule',
        pain: 'Difficulty sleeping during the day',
        deepPainPoints: [
          'Light penetration through regular eye masks disrupts REM sleep',
          'Partner activities and household noise during sleep hours',
          'Difficulty maintaining consistent sleep schedule on days off',
          'Headaches from poor quality sleep affecting work performance'
        ],
        motivation: 'Block out light and noise while sleeping',
        goals: [
          'Achieve 7-8 hours of uninterrupted daytime sleep',
          'Maintain energy levels throughout night shifts',
          'Improve overall health and reduce shift work disorder symptoms',
          'Find portable solution for sleeping between double shifts'
        ],
        shoppingBehavior: {
          researchStyle: 'Reads detailed reviews from other shift workers',
          decisionFactors: ['Comfort for side sleepers', 'Complete light blocking', 'Durability for daily use'],
          pricePoint: 'Willing to pay premium ($30-50) for quality',
          purchaseTime: 'Shops online during night shift breaks',
          brandLoyalty: 'Medium - will switch for better features'
        },
        psychographics: {
          values: ['Health', 'Work-life balance', 'Practical solutions'],
          interests: ['Sleep optimization', 'Fitness', 'Meal prep'],
          personality: 'Pragmatic, health-conscious, routine-oriented',
          mediaConsumption: ['Health podcasts', 'Shift work forums', 'YouTube sleep tips']
        },
        buyingJourney: {
          awareness: 'Searches "sleep masks for day sleepers" after colleague recommendation',
          consideration: 'Compares 5-10 products over 2 weeks',
          decision: 'Buys after finding reviews from verified shift workers',
          retention: 'Likely to buy extras for travel and recommend to coworkers'
        }
      },
      {
        name: 'Meditation Enthusiast',
        age: '30-55',
        gender: '70% Female, 30% Male',
        income: '$60,000-$120,000',
        location: 'Suburban/Urban, West Coast and Northeast concentration',
        occupation: 'Professional services, Tech, Education, Entrepreneurs',
        lifestyle: 'Practices daily meditation, yoga practitioner, mindfulness advocate, wellness-focused',
        pain: 'Distractions during meditation',
        deepPainPoints: [
          'Ambient noise breaks concentration during deep meditation',
          'Difficulty finding quiet time in busy household',
          'Eye strain from trying to meditate with eyes closed in bright rooms',
          'Wireless earbuds fall out during lying meditation poses'
        ],
        motivation: 'Enhanced focus with guided audio',
        goals: [
          'Deepen meditation practice to 45-60 minute sessions',
          'Create portable meditation sanctuary anywhere',
          'Integrate more sound healing and binaural beats',
          'Achieve consistent daily practice regardless of environment'
        ],
        shoppingBehavior: {
          researchStyle: 'Seeks recommendations from meditation teachers and communities',
          decisionFactors: ['Audio quality for meditation music', 'Comfort for extended wear', 'Eco-friendly materials'],
          pricePoint: 'Premium buyer ($40-80) for mindfulness tools',
          purchaseTime: 'Deliberate purchase after research',
          brandLoyalty: 'High - values brands aligned with wellness values'
        },
        psychographics: {
          values: ['Mindfulness', 'Personal growth', 'Sustainability', 'Holistic health'],
          interests: ['Yoga', 'Breathwork', 'Sound healing', 'Retreats'],
          personality: 'Introspective, growth-oriented, environmentally conscious',
          mediaConsumption: ['Meditation apps', 'Wellness podcasts', 'Mindfulness blogs']
        },
        buyingJourney: {
          awareness: 'Discovers through meditation app partnership or yoga studio',
          consideration: 'Researches materials, reads spiritual community reviews',
          decision: 'Purchases after confirming audio quality meets standards',
          retention: 'Becomes brand advocate, gifts to meditation circle'
        }
      },
      {
        name: 'Frequent Traveler',
        age: '28-45',
        gender: '55% Male, 45% Female',
        income: '$75,000-$150,000+',
        location: 'Major metropolitan areas, travel hubs',
        occupation: 'Sales, Consulting, Executive, Digital Nomad',
        lifestyle: 'Travels 15+ days/month, elite status on airlines, minimalist packer, productivity-focused',
        pain: 'Poor sleep on planes and in hotels',
        deepPainPoints: [
          'Jet lag compounded by poor sleep quality during flights',
          'Hotel room noise and unfamiliar environments disrupt sleep',
          'Bulky noise-canceling headphones take up precious luggage space',
          'Need entertainment during long flights without disturbing others'
        ],
        motivation: 'Portable comfort and entertainment',
        goals: [
          'Arrive at destination well-rested and productive',
          'Maintain sleep schedule across time zones',
          'Maximize productivity during travel downtime',
          'Pack light while having all comfort essentials'
        ],
        shoppingBehavior: {
          researchStyle: 'Quick decision maker, values peer recommendations',
          decisionFactors: ['Portability', 'Battery life', 'Multi-functionality'],
          pricePoint: 'Value-conscious but pays for convenience ($30-60)',
          purchaseTime: 'Impulse buy at airport or quick online order',
          brandLoyalty: 'Low - constantly seeking better travel solutions'
        },
        psychographics: {
          values: ['Efficiency', 'Experiences', 'Professional success', 'Convenience'],
          interests: ['Travel hacking', 'Productivity', 'Technology', 'Global cuisine'],
          personality: 'Ambitious, adaptable, tech-savvy, time-conscious',
          mediaConsumption: ['Travel blogs', 'Business podcasts', 'Productivity apps']
        },
        buyingJourney: {
          awareness: 'Sees fellow traveler using it or travel blogger review',
          consideration: 'Quick research on battery life and packability',
          decision: 'Orders for next trip or buys at airport',
          retention: 'Replaces every 6-12 months due to heavy use'
        }
      }
    ],
    socialSignals: {
      tiktok: { posts: 2341, views: 4500000, engagement: '8.2%' },
      instagram: { posts: 5678, engagement: '6.5%' },
      youtube: { videos: 892, avgViews: 45000 },
      reddit: { discussions: 234, sentiment: 'positive' }
    },
    keywordMetrics: {
      totalKeywords: 1250,
      totalMarketRevenue: 8500000, // Monthly revenue across all keywords
      topKeywords: [
        { 
          keyword: 'bluetooth sleep mask', 
          orders: 12500, 
          revenue: 374875, 
          growth: '+45%',
          searchVolume: 18500,
          clickShare: 42,
          conversionRate: 14.2
        },
        { 
          keyword: 'sleep headphones bluetooth', 
          orders: 8900, 
          revenue: 266811, 
          growth: '+38%',
          searchVolume: 14200,
          clickShare: 38,
          conversionRate: 12.8
        },
        { 
          keyword: 'wireless sleep mask', 
          orders: 6200, 
          revenue: 185938, 
          growth: '+52%',
          searchVolume: 9800,
          clickShare: 35,
          conversionRate: 11.5
        },
        { 
          keyword: 'sleep mask with speakers', 
          orders: 5100, 
          revenue: 152949, 
          growth: '+28%',
          searchVolume: 8200,
          clickShare: 31,
          conversionRate: 13.1
        },
        { 
          keyword: 'bluetooth eye mask for sleeping', 
          orders: 3800, 
          revenue: 113962, 
          growth: '+67%',
          searchVolume: 6500,
          clickShare: 28,
          conversionRate: 10.9
        }
      ],
      keywordDepth: {
        top10: 65, // percentage of revenue
        top50: 85,
        longTail: 15
      },
      concentrationIndex: 0.72, // 0-1 scale, higher = more concentrated
      averageOrderValue: 29.99
    },
    salesRankHistory: [
      { date: '2025-07', rank: 1234, categoryRank: 89, subcategory: 'Sleep Masks' },
      { date: '2025-06', rank: 1456, categoryRank: 102, subcategory: 'Sleep Masks' },
      { date: '2025-05', rank: 1678, categoryRank: 118, subcategory: 'Sleep Masks' },
      { date: '2025-04', rank: 1890, categoryRank: 134, subcategory: 'Sleep Masks' },
      { date: '2025-03', rank: 2123, categoryRank: 152, subcategory: 'Sleep Masks' },
      { date: '2025-02', rank: 2456, categoryRank: 178, subcategory: 'Sleep Masks' },
      { date: '2025-01', rank: 2789, categoryRank: 198, subcategory: 'Sleep Masks' }
    ],
    trendingKeywords: [
      { keyword: 'asmr sleep mask', growth: '+145%', newRank: 156, oldRank: 389 },
      { keyword: 'sleep mask with bluetooth headphones', growth: '+89%', newRank: 223, oldRank: 421 },
      { keyword: 'travel sleep mask bluetooth', growth: '+76%', newRank: 312, oldRank: 548 },
      { keyword: 'meditation sleep mask', growth: '+62%', newRank: 445, oldRank: 721 }
    ],
    demandVelocity: {
      monthOverMonth: '+12%',
      quarterOverQuarter: '+38%',
      yearOverYear: '+125%',
      acceleration: 'increasing',
      momentumScore: 85,
      signals: [
        'Holiday season approaching - expect 40% surge',
        'TikTok viral trend driving youth adoption',
        'New competitor (SleepPhones) gaining market share'
      ]
    },
    categoryPenetration: {
      nicheSize: 0.082, // 8.2% of category
      categoryGrowth: '+10%',
      nicheGrowth: '+23%',
      saturationLevel: 'moderate',
      marketMaturity: 'growth phase',
      whiteSpaceOpportunity: 68 // score out of 100
    },
    priceElasticity: {
      coefficient: -1.2,
      optimalPrice: 29.99,
      sensitivityScore: 'moderate',
      segmentDemand: {
        budget: { range: '$10-20', percentage: 25 },
        mid: { range: '$20-35', percentage: 60 },
        premium: { range: '$35+', percentage: 15 }
      },
      priceVsVolume: [
        { price: 19.99, estimatedVolume: 18500 },
        { price: 24.99, estimatedVolume: 16200 },
        { price: 29.99, estimatedVolume: 14100 },
        { price: 34.99, estimatedVolume: 10800 },
        { price: 39.99, estimatedVolume: 7200 }
      ]
    }
  },

  // Competition Analysis Data
  competitionData: {
    totalCompetitors: 127,
    averageRating: 4.2,
    averagePrice: 27.99,
    averageReviews: 3421,
    priceDistribution: [
      { range: '$0-20', count: 34, percentage: 26.8 },
      { range: '$20-30', count: 52, percentage: 40.9 },
      { range: '$30-40', count: 28, percentage: 22.0 },
      { range: '$40+', count: 13, percentage: 10.2 }
    ],
    marketShareData: [
      { name: 'MUSICOZY', share: 23.5, revenue: 456000, color: '#3B82F6' },
      { name: 'Perytong', share: 18.2, revenue: 324000, color: '#10B981' },
      { name: 'CozyPhones', share: 12.8, revenue: 178000, color: '#F59E0B' },
      { name: 'LC-dolida', share: 8.9, revenue: 125000, color: '#8B5CF6' },
      { name: 'Fulext', share: 6.2, revenue: 89000, color: '#EF4444' },
      { name: 'Others', share: 30.4, revenue: 428000, color: '#6B7280' }
    ],
    keywordOwnership: [
      { keyword: 'bluetooth sleep mask', top3ASINs: ['B07SHBQY7Z', 'B07Q34GWQT', 'B08MVBRNKV'], dominantASIN: 'B07SHBQY7Z', dominanceScore: 42 },
      { keyword: 'sleep headphones bluetooth', top3ASINs: ['B07SHBQY7Z', 'B07Q34GWQT', 'B00MFQJK1G'], dominantASIN: 'B07SHBQY7Z', dominanceScore: 38 },
      { keyword: 'wireless sleep mask', top3ASINs: ['B07Q34GWQT', 'B07SHBQY7Z', 'B08K4F3G2K'], dominantASIN: 'B07Q34GWQT', dominanceScore: 35 },
      { keyword: 'sleep mask with speakers', top3ASINs: ['B00MFQJK1G', 'B07SHBQY7Z', 'B07Q34GWQT'], dominantASIN: 'B00MFQJK1G', dominanceScore: 31 },
      { keyword: 'bluetooth headband sleep', top3ASINs: ['B07SHBQY7Z', 'B08K4F3G2K', 'B07Q34GWQT'], dominantASIN: 'B07SHBQY7Z', dominanceScore: 45 },
      { keyword: 'side sleeper headphones', top3ASINs: ['B00MFQJK1G', 'B08GC7JJH3', 'B07SHBQY7Z'], dominantASIN: 'B00MFQJK1G', dominanceScore: 48 },
      { keyword: 'sleep music headphones', top3ASINs: ['B07Q34GWQT', 'B07SHBQY7Z', 'B08K4F3G2K'], dominantASIN: 'B07Q34GWQT', dominanceScore: 29 },
      { keyword: 'night mask bluetooth', top3ASINs: ['B08K4F3G2K', 'B07SHBQY7Z', 'B07Q34GWQT'], dominantASIN: 'B08K4F3G2K', dominanceScore: 33 }
    ],
    topCompetitors: [
      {
        rank: 1,
        name: 'MUSICOZY Sleep Headphones',
        asin: 'B07SHBQY7Z',
        price: 29.99,
        rating: 4.3,
        reviews: 15234,
        monthlyRevenue: 456000,
        monthlyClicks: 45600,
        monthlyOrders: 15234,
        conversionRate: 12.5,
        aov: 29.99,
        keywordStrength: 23.5,
        mainImage: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=200&h=200&fit=crop',
        images: [
          { url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop', type: 'main', caption: 'Product front view' },
          { url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'In use while sleeping' },
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop', type: 'detail', caption: 'Bluetooth controls close-up' },
          { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'Travel use case' },
          { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'comparison', caption: 'Size comparison' },
          { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop', type: 'packaging', caption: 'Premium packaging' },
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', type: 'infographic', caption: 'Features overview' },
          { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', type: 'detail', caption: 'Material texture' }
        ],
        imageQualityScore: 92,
        keywordRankings: [
          { keyword: 'bluetooth sleep mask', rank: 1, clickShare: 42, conversionShare: 38 },
          { keyword: 'sleep headphones bluetooth', rank: 1, clickShare: 38, conversionShare: 35 },
          { keyword: 'wireless sleep mask', rank: 2, clickShare: 28, conversionShare: 25 },
          { keyword: 'bluetooth headband sleep', rank: 1, clickShare: 45, conversionShare: 42 },
          { keyword: 'side sleeper headphones', rank: 3, clickShare: 22, conversionShare: 18 },
          { keyword: 'sleep music headphones', rank: 2, clickShare: 31, conversionShare: 28 },
          { keyword: 'comfortable sleep headphones', rank: 1, clickShare: 35, conversionShare: 32 },
          { keyword: 'workout headband bluetooth', rank: 4, clickShare: 18, conversionShare: 15 },
          { keyword: 'yoga headband speakers', rank: 5, clickShare: 15, conversionShare: 12 },
          { keyword: 'travel sleep mask bluetooth', rank: 2, clickShare: 33, conversionShare: 30 }
        ],
        salesTrend: [
          { month: 'Jan', revenue: 412000, orders: 13700 },
          { month: 'Feb', revenue: 428000, orders: 14300 },
          { month: 'Mar', revenue: 445000, orders: 14800 },
          { month: 'Apr', revenue: 438000, orders: 14600 },
          { month: 'May', revenue: 452000, orders: 15100 },
          { month: 'Jun', revenue: 456000, orders: 15234 }
        ],
        listingQualityScore: {
          overall: 88,
          title: 92,
          bullets: 85,
          images: 92,
          keywords: 86,
          aPlus: true,
          video: true
        },
        estimatedPPCSpend: 45600,
        launchDate: '2019-03-15',
        brandRegistered: true,
        variations: 3,
        dominance: 23.5,
        listing: {
          title: 'MUSICOZY Sleep Headphones Bluetooth Headband, Soft Sleeping Wireless Music Sport Headbands, Long Time Play Sleeping Headphones for Side Sleepers',
          bulletPoints: [
            'Premium Sound Quality - Advanced Bluetooth 5.0 technology ensures crystal clear audio',
            'Ultra-Comfortable Design - Made with breathable, moisture-wicking fabric',
            'Long Battery Life - Up to 10 hours of continuous playback',
            'Perfect for Side Sleepers - Thin speakers won\'t cause discomfort',
            'Washable & Durable - Machine washable design for easy maintenance'
          ],
          keywords: ['sleep headphones', 'bluetooth headband', 'wireless music', 'side sleepers'],
          description: 'Experience the ultimate in sleep comfort with our premium Bluetooth sleep headphones...'
        }
      },
      {
        rank: 2,
        name: 'Perytong Sleep Headphones',
        asin: 'B07Q34GWQT',
        price: 25.99,
        rating: 4.1,
        reviews: 12456,
        monthlyRevenue: 324000,
        monthlyClicks: 32400,
        monthlyOrders: 12456,
        conversionRate: 11.8,
        aov: 25.99,
        keywordStrength: 18.2,
        mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop',
        images: [
          { url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop', type: 'main', caption: 'Product view' },
          { url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'Sleeping comfort' },
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'Sports use' },
          { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'detail', caption: 'Speaker detail' },
          { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop', type: 'comparison', caption: 'Size guide' },
          { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', type: 'infographic', caption: 'How to use' },
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', type: 'packaging', caption: 'Gift box' }
        ],
        imageQualityScore: 85,
        keywordRankings: [
          { keyword: 'bluetooth sleep mask', rank: 2, clickShare: 28, conversionShare: 25 },
          { keyword: 'sleep headphones bluetooth', rank: 2, clickShare: 31, conversionShare: 28 },
          { keyword: 'wireless sleep mask', rank: 1, clickShare: 35, conversionShare: 32 },
          { keyword: 'sports headband bluetooth', rank: 1, clickShare: 42, conversionShare: 38 },
          { keyword: 'workout sleep headphones', rank: 1, clickShare: 38, conversionShare: 35 },
          { keyword: 'yoga headband speakers', rank: 2, clickShare: 32, conversionShare: 29 }
        ],
        salesTrend: [
          { month: 'Jan', revenue: 298000, orders: 11500 },
          { month: 'Feb', revenue: 305000, orders: 11700 },
          { month: 'Mar', revenue: 312000, orders: 12000 },
          { month: 'Apr', revenue: 318000, orders: 12200 },
          { month: 'May', revenue: 322000, orders: 12400 },
          { month: 'Jun', revenue: 324000, orders: 12456 }
        ],
        listingQualityScore: {
          overall: 82,
          title: 85,
          bullets: 80,
          images: 85,
          keywords: 78,
          aPlus: true,
          video: false
        },
        estimatedPPCSpend: 32400,
        launchDate: '2019-08-22',
        brandRegistered: true,
        variations: 5,
        dominance: 18.2,
        listing: {
          title: 'Perytong Sleep Headphones Bluetooth Sports Headband Thin Speakers Perfect for Workout, Jogging, Yoga, Insomnia, Side Sleepers',
          bulletPoints: [
            'Thin Speakers Design - Ultra-thin speakers for maximum comfort during sleep',
            'Bluetooth 5.0 Technology - Stable connection with all Bluetooth devices',
            'Sports & Sleep Dual Use - Perfect for both workouts and sleep',
            'Soft Elastic Headband - One size fits all comfortable design',
            'Easy Controls - Simple button controls for music and calls'
          ],
          keywords: ['sleep headphones', 'sports headband', 'bluetooth speakers', 'workout headphones'],
          description: 'Discover the perfect combination of comfort and functionality with our versatile sleep headphones...'
        }
      },
      {
        rank: 3,
        name: 'CozyPhones Sleep Headphones',
        asin: 'B00MFQJK1G',
        price: 19.95,
        rating: 4.0,
        reviews: 8934,
        monthlyRevenue: 178000,
        monthlyClicks: 23400,
        monthlyOrders: 8934,
        conversionRate: 10.2,
        aov: 19.95,
        keywordStrength: 12.8,
        mainImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop',
        images: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop', type: 'main', caption: 'Classic design' },
          { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'Travel ready' },
          { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'detail', caption: 'Flat speakers' },
          { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop', type: 'infographic', caption: 'Features list' },
          { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', type: 'packaging', caption: 'Travel bag included' },
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', type: 'comparison', caption: 'vs Regular headphones' }
        ],
        imageQualityScore: 78,
        keywordRankings: [
          { keyword: 'bluetooth sleep mask', rank: 5, clickShare: 12, conversionShare: 10 },
          { keyword: 'side sleeper headphones', rank: 1, clickShare: 48, conversionShare: 45 },
          { keyword: 'sleep mask with speakers', rank: 1, clickShare: 31, conversionShare: 28 },
          { keyword: 'travel sleep headphones', rank: 2, clickShare: 28, conversionShare: 25 },
          { keyword: 'noise isolation sleep mask', rank: 1, clickShare: 35, conversionShare: 32 }
        ],
        salesTrend: [
          { month: 'Jan', revenue: 165000, orders: 8300 },
          { month: 'Feb', revenue: 168000, orders: 8400 },
          { month: 'Mar', revenue: 172000, orders: 8600 },
          { month: 'Apr', revenue: 175000, orders: 8800 },
          { month: 'May', revenue: 177000, orders: 8900 },
          { month: 'Jun', revenue: 178000, orders: 8934 }
        ],
        listingQualityScore: {
          overall: 75,
          title: 78,
          bullets: 72,
          images: 78,
          keywords: 70,
          aPlus: false,
          video: false
        },
        estimatedPPCSpend: 17800,
        launchDate: '2018-11-05',
        brandRegistered: true,
        variations: 2,
        dominance: 12.8,
        listing: {
          title: 'CozyPhones Sleep Headphones & Travel Bag - Soft Braided Cord - Noise Isolating Earbuds Ideal for Side Sleepers',
          bulletPoints: [
            'Patented Design - Unique flat speaker design for side sleepers',
            'Noise Isolation - Block out ambient noise for better sleep',
            'Durable Braided Cord - Tangle-free braided cord construction',
            'Travel Ready - Includes premium travel bag',
            'Hypoallergenic Materials - Safe for sensitive skin'
          ],
          keywords: ['sleep headphones', 'side sleepers', 'noise isolation', 'travel headphones'],
          description: 'Transform your sleep experience with our patented flat speaker design headphones...'
        }
      },
      // Additional competitors
      {
        rank: 4,
        name: 'LC-dolida Sleep Headphones',
        asin: 'B08K4F3G2K',
        price: 23.99,
        rating: 4.2,
        reviews: 7823,
        monthlyRevenue: 125000,
        monthlyClicks: 15600,
        monthlyOrders: 5210,
        conversionRate: 10.8,
        aov: 23.99,
        keywordStrength: 15.3,
        mainImage: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=200&h=200&fit=crop',
        images: [
          { url: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=400&h=400&fit=crop', type: 'main', caption: 'Modern design' },
          { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'Comfort wear' },
          { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop', type: 'detail', caption: 'Control buttons' },
          { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop', type: 'infographic', caption: 'Tech specs' },
          { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'comparison', caption: 'Color options' }
        ],
        imageQualityScore: 82,
        dominance: 8.9,
        listing: {
          title: 'LC-dolida Sleep Headphones Bluetooth Headband Wireless Music Sport Headbands Long Play Time Sleeping Headphones',
          bulletPoints: [
            '【Latest Version】Bluetooth 5.2 for stable connection',
            '【10 Hours Play Time】Built-in 200mAh battery',
            '【HD Stereo Sound】Premium audio drivers',
            '【Washable Material】Remove speakers to wash',
            '【Perfect Gift】Comes in beautiful gift box'
          ],
          keywords: ['sleep headphones', 'bluetooth 5.2', 'long battery', 'gift idea'],
          description: 'Upgrade your sleep experience with the latest Bluetooth 5.2 technology...'
        },
        keywordRankings: [
          { keyword: 'bluetooth sleep mask', rank: 4, clickShare: 15, conversionShare: 12 },
          { keyword: 'wireless sleep mask', rank: 3, clickShare: 22, conversionShare: 19 },
          { keyword: 'night mask bluetooth', rank: 1, clickShare: 33, conversionShare: 30 },
          { keyword: 'gift sleep headphones', rank: 1, clickShare: 42, conversionShare: 38 }
        ],
        salesTrend: [
          { month: 'Jan', revenue: 115000, orders: 4800 },
          { month: 'Feb', revenue: 118000, orders: 4900 },
          { month: 'Mar', revenue: 120000, orders: 5000 },
          { month: 'Apr', revenue: 122000, orders: 5100 },
          { month: 'May', revenue: 124000, orders: 5150 },
          { month: 'Jun', revenue: 125000, orders: 5210 }
        ],
        listingQualityScore: {
          overall: 80,
          title: 82,
          bullets: 78,
          images: 82,
          keywords: 76,
          aPlus: false,
          video: true
        },
        estimatedPPCSpend: 12500,
        launchDate: '2020-06-18',
        brandRegistered: true,
        variations: 4
      },
      {
        rank: 5,
        name: 'Fulext Sleep Headphones',
        asin: 'B08GC7JJH3',
        price: 19.99,
        rating: 4.0,
        reviews: 4456,
        monthlyRevenue: 89000,
        monthlyClicks: 11200,
        monthlyOrders: 4450,
        conversionRate: 9.8,
        aov: 19.99,
        keywordStrength: 10.2,
        mainImage: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=200&h=200&fit=crop',
        images: [
          { url: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop', type: 'main', caption: 'Budget option' },
          { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop', type: 'lifestyle', caption: 'Daily use' },
          { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop', type: 'detail', caption: 'Simple controls' },
          { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'packaging', caption: 'Basic package' }
        ],
        imageQualityScore: 70,
        dominance: 6.2,
        listing: {
          title: 'Fulext Sleep Headphones Bluetooth Headband Sleeping Headphones Sports Headband',
          bulletPoints: [
            'Bluetooth 5.0 wireless technology',
            'Ultra-thin flat speakers',
            'Breathable fabric material',
            'One size fits most',
            'Great value for money'
          ],
          keywords: ['sleep headphones', 'bluetooth headband', 'budget', 'value'],
          description: 'Affordable sleep headphones solution for everyone...'
        },
        keywordRankings: [
          { keyword: 'cheap sleep headphones', rank: 1, clickShare: 45, conversionShare: 42 },
          { keyword: 'budget bluetooth sleep mask', rank: 1, clickShare: 38, conversionShare: 35 },
          { keyword: 'affordable sleep headphones', rank: 2, clickShare: 32, conversionShare: 28 }
        ],
        salesTrend: [
          { month: 'Jan', revenue: 82000, orders: 4100 },
          { month: 'Feb', revenue: 84000, orders: 4200 },
          { month: 'Mar', revenue: 86000, orders: 4300 },
          { month: 'Apr', revenue: 87000, orders: 4350 },
          { month: 'May', revenue: 88000, orders: 4400 },
          { month: 'Jun', revenue: 89000, orders: 4450 }
        ],
        listingQualityScore: {
          overall: 68,
          title: 70,
          bullets: 65,
          images: 70,
          keywords: 65,
          aPlus: false,
          video: false
        },
        estimatedPPCSpend: 8900,
        launchDate: '2020-09-12',
        brandRegistered: false,
        variations: 1
      }
    ]
  },
  
  // Keywords Analysis Data
  keywordsData: {
    primaryKeyword: 'bluetooth sleep mask',
    cpc: 1.23,
    competition: 'Medium',
    totalKeywords: 245,
    monthlySearchVolume: 185000,
    averageROI: 235,
    // Trending keywords data
    trendingKeywords: [
      { 
        keyword: 'sleep mask with bluetooth speakers',
        trend: '+145%',
        currentVolume: 8500,
        previousVolume: 3450,
        velocity: 'skyrocketing',
        seasonality: 'winter peak',
        cpc: 0.98,
        opportunity: 92
      },
      { 
        keyword: 'wireless sleep headband',
        trend: '+89%',
        currentVolume: 6200,
        previousVolume: 3280,
        velocity: 'rapid growth',
        seasonality: 'stable',
        cpc: 1.15,
        opportunity: 85
      },
      { 
        keyword: 'bluetooth eye mask for sleeping',
        trend: '+67%',
        currentVolume: 4800,
        previousVolume: 2880,
        velocity: 'growing',
        seasonality: 'holiday spike',
        cpc: 1.32,
        opportunity: 78
      },
      { 
        keyword: 'sleep headphones side sleepers',
        trend: '+52%',
        currentVolume: 5200,
        previousVolume: 3421,
        velocity: 'steady growth',
        seasonality: 'stable',
        cpc: 0.92,
        opportunity: 82
      }
    ],
    // Competitor keyword analysis
    competitorKeywords: [
      {
        keyword: 'bluetooth sleep mask',
        ourRank: null,
        competitors: [
          { asin: 'B07SHBQY7Z', brand: 'MUSICOZY', rank: 1, ppcSpend: 4500, organicShare: 42 },
          { asin: 'B07Q34GWQT', brand: 'Perytong', rank: 2, ppcSpend: 3200, organicShare: 28 },
          { asin: 'B00MFQJK1G', brand: 'CozyPhones', rank: 4, ppcSpend: 2100, organicShare: 15 }
        ],
        keywordGap: true,
        difficulty: 'high',
        recommendedBid: 1.45
      },
      {
        keyword: 'wireless sleep mask',
        ourRank: null,
        competitors: [
          { asin: 'B07Q34GWQT', brand: 'Perytong', rank: 1, ppcSpend: 2800, organicShare: 35 },
          { asin: 'B07SHBQY7Z', brand: 'MUSICOZY', rank: 2, ppcSpend: 2400, organicShare: 28 },
          { asin: 'B08K4F3G2K', brand: 'LC-dolida', rank: 3, ppcSpend: 1800, organicShare: 18 }
        ],
        keywordGap: true,
        difficulty: 'medium',
        recommendedBid: 1.25
      },
      {
        keyword: 'sleep headphones bluetooth',
        ourRank: null,
        competitors: [
          { asin: 'B07SHBQY7Z', brand: 'MUSICOZY', rank: 1, ppcSpend: 3800, organicShare: 38 },
          { asin: 'B07Q34GWQT', brand: 'Perytong', rank: 3, ppcSpend: 2200, organicShare: 22 },
          { asin: 'B00MFQJK1G', brand: 'CozyPhones', rank: 5, ppcSpend: 1500, organicShare: 12 }
        ],
        keywordGap: true,
        difficulty: 'high',
        recommendedBid: 1.38
      }
    ],
    // CPC and profitability analysis
    cpcAnalysis: {
      matchTypes: [
        { type: 'Exact', avgCPC: 1.45, conversionRate: 14.2, roi: 285, volume: 45000 },
        { type: 'Phrase', avgCPC: 1.23, conversionRate: 11.8, roi: 235, volume: 85000 },
        { type: 'Broad', avgCPC: 0.98, conversionRate: 8.5, roi: 165, volume: 125000 }
      ],
      bidRecommendations: [
        { keyword: 'bluetooth sleep mask', currentCPC: 1.23, recommendedBid: 1.45, reason: 'High conversion rate', expectedROI: 285 },
        { keyword: 'wireless sleep mask', currentCPC: 1.15, recommendedBid: 1.28, reason: 'Moderate competition', expectedROI: 245 },
        { keyword: 'sleep mask speakers', currentCPC: 0.98, recommendedBid: 1.15, reason: 'Growing search volume', expectedROI: 265 }
      ],
      budgetSimulator: [
        { budget: 1000, expectedClicks: 813, expectedOrders: 96, expectedRevenue: 2879, profit: 1879 },
        { budget: 2500, expectedClicks: 2032, expectedOrders: 240, expectedRevenue: 7197, profit: 4697 },
        { budget: 5000, expectedClicks: 4065, expectedOrders: 480, expectedRevenue: 14394, profit: 9394 },
        { budget: 10000, expectedClicks: 8130, expectedOrders: 960, expectedRevenue: 28788, profit: 18788 }
      ]
    },
    // Keyword opportunity scoring
    opportunityMatrix: [
      {
        keyword: 'sleep mask bluetooth speakers',
        searchVolume: 12500,
        competition: 'low',
        cpc: 0.85,
        conversionPotential: 13.5,
        trendMomentum: 145,
        opportunityScore: 92,
        actionPriority: 'immediate'
      },
      {
        keyword: 'wireless sleep headband music',
        searchVolume: 8900,
        competition: 'low',
        cpc: 0.92,
        conversionPotential: 12.8,
        trendMomentum: 89,
        opportunityScore: 87,
        actionPriority: 'high'
      },
      {
        keyword: 'bluetooth headband for sleeping',
        searchVolume: 15600,
        competition: 'medium',
        cpc: 1.15,
        conversionPotential: 11.5,
        trendMomentum: 45,
        opportunityScore: 72,
        actionPriority: 'medium'
      }
    ],
    // Long-tail keyword discovery
    longTailKeywords: [
      { keyword: 'how to connect bluetooth sleep mask to iphone', volume: 890, cpc: 0.45, intent: 'informational' },
      { keyword: 'best bluetooth sleep mask for side sleepers 2024', volume: 1200, cpc: 0.78, intent: 'transactional' },
      { keyword: 'can you wash bluetooth sleep headphones', volume: 650, cpc: 0.32, intent: 'informational' },
      { keyword: 'bluetooth sleep mask vs regular sleep mask', volume: 780, cpc: 0.52, intent: 'comparison' },
      { keyword: 'where to buy wireless sleep headphones near me', volume: 420, cpc: 0.98, intent: 'local' }
    ],
    // Keyword cannibalization analysis
    cannibalizationRisks: [
      {
        keywordGroup: ['bluetooth sleep mask', 'bluetooth sleeping mask', 'sleep mask bluetooth'],
        risk: 'high',
        affectedASINs: 3,
        recommendation: 'Assign primary keyword to hero ASIN, use variations for different products'
      },
      {
        keywordGroup: ['wireless sleep headphones', 'wireless sleeping headphones', 'sleep headphones wireless'],
        risk: 'medium',
        affectedASINs: 2,
        recommendation: 'Differentiate by use case (travel vs home)'
      }
    ],
    keywordHierarchy: {
      'Sleep Technology': {
        totalRevenue: 298000,
        totalOrders: 1420,
        avgConversionRate: 12.1,
        avgCPC: 1.12,
        subroots: {
          'Bluetooth Keywords': {
            totalRevenue: 145000,
            totalOrders: 600,
            avgConversionRate: 12.5,
            avgCPC: 1.23,
            keywords: [
              { 
                keyword: 'bluetooth sleep mask', 
                monthlyRevenue: 89000, 
                monthlyOrders: 380, 
                conversionRate: 12.5, 
                aov: 29.99, 
                cpc: 1.23, 
                difficulty: 68,
                searchVolume: 18500,
                trend: '+23%',
                competitors: ['MUSICOZY', 'Perytong'],
                rankingDifficulty: 'hard',
                estimatedPPCBudget: 2200
              },
              { 
                keyword: 'bluetooth sleep headphones', 
                monthlyRevenue: 34000, 
                monthlyOrders: 140, 
                conversionRate: 11.8, 
                aov: 28.50, 
                cpc: 1.15, 
                difficulty: 65,
                searchVolume: 12400,
                trend: '+18%',
                competitors: ['MUSICOZY', 'CozyPhones'],
                rankingDifficulty: 'medium',
                estimatedPPCBudget: 1800
              },
              { 
                keyword: 'bluetooth headband sleep', 
                monthlyRevenue: 22000, 
                monthlyOrders: 80, 
                conversionRate: 13.2, 
                aov: 27.50, 
                cpc: 1.35, 
                difficulty: 72,
                searchVolume: 8900,
                trend: '+45%',
                competitors: ['Perytong'],
                rankingDifficulty: 'medium',
                estimatedPPCBudget: 1200
              }
            ]
          },
          'Wireless Keywords': {
            totalRevenue: 89000,
            totalOrders: 380,
            avgConversionRate: 11.9,
            avgCPC: 1.08,
            keywords: [
              { 
                keyword: 'wireless sleep mask', 
                monthlyRevenue: 45000, 
                monthlyOrders: 200, 
                conversionRate: 11.9, 
                aov: 28.50, 
                cpc: 1.15, 
                difficulty: 62,
                searchVolume: 14500,
                trend: '+38%',
                competitors: ['Perytong', 'MUSICOZY'],
                rankingDifficulty: 'medium',
                estimatedPPCBudget: 1600
              },
              { 
                keyword: 'wireless sleep headphones', 
                monthlyRevenue: 28000, 
                monthlyOrders: 120, 
                conversionRate: 12.1, 
                aov: 26.99, 
                cpc: 1.05, 
                difficulty: 58,
                searchVolume: 9800,
                trend: '+25%',
                competitors: ['CozyPhones'],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 1100
              },
              { 
                keyword: 'wireless headband sleep', 
                monthlyRevenue: 16000, 
                monthlyOrders: 60, 
                conversionRate: 11.5, 
                aov: 25.99, 
                cpc: 1.02, 
                difficulty: 55,
                searchVolume: 6200,
                trend: '+89%',
                competitors: [],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 800
              }
            ]
          },
          'Smart Keywords': {
            totalRevenue: 64000,
            totalOrders: 290,
            avgConversionRate: 11.8,
            avgCPC: 0.98,
            keywords: [
              { 
                keyword: 'smart sleep mask', 
                monthlyRevenue: 32000, 
                monthlyOrders: 140, 
                conversionRate: 11.8, 
                aov: 24.99, 
                cpc: 0.98, 
                difficulty: 60,
                searchVolume: 8900,
                trend: '+67%',
                competitors: ['Tempur', 'Philips'],
                rankingDifficulty: 'medium',
                estimatedPPCBudget: 950
              },
              { 
                keyword: 'smart sleep headphones', 
                monthlyRevenue: 19000, 
                monthlyOrders: 85, 
                conversionRate: 12.0, 
                aov: 23.99, 
                cpc: 0.95, 
                difficulty: 58,
                searchVolume: 6200,
                trend: '+52%',
                competitors: [],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 750
              },
              { 
                keyword: 'smart headband sleep', 
                monthlyRevenue: 13000, 
                monthlyOrders: 65, 
                conversionRate: 11.5, 
                aov: 22.99, 
                cpc: 1.02, 
                difficulty: 52,
                searchVolume: 4100,
                trend: '+145%',
                competitors: [],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 500
              }
            ]
          }
        }
      },
      'Sleep Comfort': {
        totalRevenue: 156000,
        totalOrders: 720,
        avgConversionRate: 10.8,
        avgCPC: 0.89,
        subroots: {
          'Side Sleeper Keywords': {
            totalRevenue: 89000,
            totalOrders: 420,
            avgConversionRate: 11.2,
            avgCPC: 0.92,
            keywords: [
              { 
                keyword: 'sleep mask side sleepers', 
                monthlyRevenue: 45000, 
                monthlyOrders: 220, 
                conversionRate: 11.5, 
                aov: 24.99, 
                cpc: 0.95, 
                difficulty: 48,
                searchVolume: 11200,
                trend: '+32%',
                competitors: ['CozyPhones', 'MUSICOZY'],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 1100
              },
              { 
                keyword: 'headphones side sleepers', 
                monthlyRevenue: 28000, 
                monthlyOrders: 130, 
                conversionRate: 11.0, 
                aov: 23.99, 
                cpc: 0.88, 
                difficulty: 45,
                searchVolume: 8900,
                trend: '+28%',
                competitors: ['CozyPhones'],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 850
              },
              { 
                keyword: 'sleep headband side sleepers', 
                monthlyRevenue: 16000, 
                monthlyOrders: 70, 
                conversionRate: 10.8, 
                aov: 22.99, 
                cpc: 0.92, 
                difficulty: 42,
                searchVolume: 5200,
                trend: '+52%',
                competitors: [],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 600
              }
            ]
          },
          'Comfort Keywords': {
            totalRevenue: 67000,
            totalOrders: 300,
            avgConversionRate: 10.4,
            avgCPC: 0.85,
            keywords: [
              { 
                keyword: 'comfortable sleep mask', 
                monthlyRevenue: 34000, 
                monthlyOrders: 160, 
                conversionRate: 10.8, 
                aov: 21.99, 
                cpc: 0.88, 
                difficulty: 40,
                searchVolume: 9800,
                trend: '+15%',
                competitors: ['Tempur', 'Mavogel'],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 900
              },
              { 
                keyword: 'soft sleep headphones', 
                monthlyRevenue: 21000, 
                monthlyOrders: 95, 
                conversionRate: 10.2, 
                aov: 20.99, 
                cpc: 0.82, 
                difficulty: 38,
                searchVolume: 6700,
                trend: '+22%',
                competitors: [],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 600
              },
              { 
                keyword: 'comfortable sleep headband', 
                monthlyRevenue: 12000, 
                monthlyOrders: 45, 
                conversionRate: 9.8, 
                aov: 19.99, 
                cpc: 0.85, 
                difficulty: 35,
                searchVolume: 3900,
                trend: '+18%',
                competitors: [],
                rankingDifficulty: 'easy',
                estimatedPPCBudget: 350
              }
            ]
          }
        }
      }
    }
  },

  // Review Analysis Data
  reviewAnalysisData: {
    overallSentiment: 'positive',
    sentimentScore: 4.2,
    totalReviews: 36624,
    emotionalTriggers: {
      positive: [
        {
          trigger: 'Peace of Mind',
          frequency: 892,
          examples: ['finally sleep through the night', 'no more tossing and turning', 'wake up refreshed'],
          impact: 'high'
        },
        {
          trigger: 'Freedom',
          frequency: 734,
          examples: ['move without tangled wires', 'sleep in any position', 'travel anywhere'],
          impact: 'high'
        },
        {
          trigger: 'Belonging',
          frequency: 456,
          examples: ['my partner loves it too', 'whole family uses them', 'gift for loved ones'],
          impact: 'medium'
        },
        {
          trigger: 'Achievement',
          frequency: 312,
          examples: ['finally found the solution', 'best purchase this year', 'problem solved'],
          impact: 'medium'
        }
      ],
      negative: [
        {
          trigger: 'Frustration',
          frequency: 234,
          examples: ['controls are confusing', 'keeps disconnecting', 'battery dies too fast'],
          impact: 'high'
        },
        {
          trigger: 'Disappointment',
          frequency: 189,
          examples: ['not as advertised', 'quality issues', 'stopped working after 3 months'],
          impact: 'high'
        },
        {
          trigger: 'Anxiety',
          frequency: 123,
          examples: ['worried about durability', 'concerned about warranty', 'unsure about size'],
          impact: 'medium'
        }
      ]
    },
    voiceOfCustomer: {
      featureRequests: [
        {
          feature: 'Adjustable Volume Controls',
          mentions: 456,
          sentiment: 'highly requested',
          examples: ['wish I could control volume easier', 'need better button placement', 'volume buttons hard to find in dark']
        },
        {
          feature: 'Multiple Size Options',
          mentions: 389,
          sentiment: 'critical need',
          examples: ['too tight for my head', 'one size doesn\'t fit all', 'needs XL option']
        },
        {
          feature: 'Longer Battery Life',
          mentions: 267,
          sentiment: 'moderate request',
          examples: ['dies after one night', 'want 12+ hours', 'need week-long battery']
        },
        {
          feature: 'Better App Integration',
          mentions: 198,
          sentiment: 'nice to have',
          examples: ['want sleep tracking', 'integrate with meditation apps', 'custom sound profiles']
        }
      ],
      useCases: [
        {
          scenario: 'Night Shift Workers',
          percentage: 28,
          description: 'Blocking out daylight and noise during daytime sleep',
          keywords: ['day sleeping', 'light blocking', 'shift work']
        },
        {
          scenario: 'Meditation & Relaxation',
          percentage: 24,
          description: 'Using guided meditations and calming sounds',
          keywords: ['meditation', 'mindfulness', 'relaxation', 'ASMR']
        },
        {
          scenario: 'Travel & Commute',
          percentage: 22,
          description: 'Sleeping on planes, trains, and in hotels',
          keywords: ['travel', 'airplane', 'hotel', 'portable']
        },
        {
          scenario: 'Partner Compatibility',
          percentage: 18,
          description: 'One partner needs audio while other needs silence',
          keywords: ['snoring partner', 'different schedules', 'white noise']
        },
        {
          scenario: 'Tinnitus Relief',
          percentage: 8,
          description: 'Managing tinnitus symptoms with background sounds',
          keywords: ['tinnitus', 'ear ringing', 'masking sounds']
        }
      ],
      purchaseMotivations: [
        {
          motivation: 'Better Sleep Quality',
          percentage: 42,
          description: 'Primary goal is improving sleep depth and duration'
        },
        {
          motivation: 'Convenience',
          percentage: 28,
          description: 'Wireless design and all-in-one solution'
        },
        {
          motivation: 'Partner Harmony',
          percentage: 18,
          description: 'Solving sleep conflicts with partners'
        },
        {
          motivation: 'Health & Wellness',
          percentage: 12,
          description: 'Part of broader wellness routine'
        }
      ]
    },
    competitiveIntelligence: {
      marketPosition: {
        topPerformers: [
          { x: 85, y: 70, label: 'MUSICOZY', size: 'large', type: 'leader' },
          { x: 75, y: 80, label: 'Premium Segment', size: 'medium', type: 'opportunity' },
          { x: 70, y: 65, label: 'Perytong', size: 'medium', type: 'established' },
          { x: 60, y: 60, label: 'CozyPhones', size: 'medium', type: 'established' },
          { x: 50, y: 55, label: 'LC-dolida', size: 'small', type: 'emerging' },
          { x: 45, y: 50, label: 'TOPOINT', size: 'small', type: 'emerging' }
        ],
        axes: { x: 'Quality Score', y: 'Value Perception' }
      },
      featureComparison: {
        features: [
          {
            name: 'Battery Life',
            ourScore: 8,
            competitors: { MUSICOZY: 9, Perytong: 7, CozyPhones: 6 }
          },
          {
            name: 'Sound Quality',
            ourScore: 9,
            competitors: { MUSICOZY: 8, Perytong: 7, CozyPhones: 6 }
          },
          {
            name: 'Comfort',
            ourScore: 9,
            competitors: { MUSICOZY: 8, Perytong: 8, CozyPhones: 7 }
          },
          {
            name: 'Durability',
            ourScore: 7,
            competitors: { MUSICOZY: 8, Perytong: 6, CozyPhones: 7 }
          },
          {
            name: 'Price Value',
            ourScore: 8,
            competitors: { MUSICOZY: 7, Perytong: 9, CozyPhones: 9 }
          }
        ]
      },
      reviewShareOfVoice: {
        total: 45678,
        breakdown: [
          { brand: 'MUSICOZY', percentage: 35, reviews: 15989 },
          { brand: 'Perytong', percentage: 18, reviews: 8222 },
          { brand: 'CozyPhones', percentage: 15, reviews: 6852 },
          { brand: 'LC-dolida', percentage: 12, reviews: 5481 },
          { brand: 'TOPOINT', percentage: 10, reviews: 4568 },
          { brand: 'Others', percentage: 10, reviews: 4566 }
        ]
      }
    },
    socialMediaInsights: {
      platforms: [
        {
          name: 'TikTok',
          sentiment: 'very positive',
          reach: 4500000,
          engagement: 8.2,
          trending: true,
          topContent: [
            { type: 'Sleep routine videos', views: 1200000 },
            { type: 'ASMR sleep content', views: 890000 },
            { type: 'Travel sleep hacks', views: 670000 }
          ],
          hashtags: ['#sleepmaskhack', '#bluetoothsleepphone', '#sleepbetter']
        },
        {
          name: 'Reddit',
          sentiment: 'positive',
          discussions: 234,
          topSubreddits: ['/r/sleep', '/r/BuyItForLife', '/r/insomnia'],
          commonTopics: ['durability questions', 'vs regular headphones', 'meditation uses']
        },
        {
          name: 'YouTube',
          sentiment: 'positive',
          videos: 892,
          avgViews: 45000,
          topCategories: ['Review Videos', 'Sleep Music Channels', 'Unboxing']
        },
        {
          name: 'Instagram',
          sentiment: 'positive',
          posts: 5678,
          engagement: 6.5,
          influencerReach: 'medium',
          contentTypes: ['Lifestyle posts', 'Travel photos', 'Wellness content']
        }
      ],
      emergingTrends: [
        {
          trend: 'Sleep Tourism',
          growth: '+145%',
          description: 'Hotels and resorts offering sleep-focused packages',
          opportunity: 'Partner with luxury hotels for branded amenities'
        },
        {
          trend: 'Biohacking Sleep',
          growth: '+89%',
          description: 'Optimizing sleep with technology and data',
          opportunity: 'Add sleep tracking features and app integration'
        },
        {
          trend: 'Mindful Mornings',
          growth: '+67%',
          description: 'Morning meditation and gratitude practices',
          opportunity: 'Create morning meditation content library'
        }
      ]
    },
    marketOpportunities: {
      untappedSegments: [
        {
          segment: 'Senior Market',
          size: 'Large',
          fit: 'High',
          strategy: 'Focus on ease of use, larger controls, hearing aid compatibility'
        },
        {
          segment: 'Children/Teens',
          size: 'Medium',
          fit: 'Medium',
          strategy: 'Fun designs, parental controls, educational content'
        },
        {
          segment: 'Corporate Wellness',
          size: 'Large',
          fit: 'High',
          strategy: 'Bulk sales, branded options, employee wellness programs'
        }
      ],
      productExtensions: [
        {
          idea: 'Smart Sleep System',
          description: 'Integrate with smart home, track sleep patterns, AI recommendations',
          marketSize: '$2.3B',
          difficulty: 'High'
        },
        {
          idea: 'Subscription Audio Content',
          description: 'Exclusive sleep stories, meditations, and soundscapes',
          marketSize: '$450M',
          difficulty: 'Medium'
        },
        {
          idea: 'Premium Materials Line',
          description: 'Silk, bamboo, and cooling fabric options',
          marketSize: '$180M',
          difficulty: 'Low'
        }
      ]
    },
    competitorReviews: [
      {
        competitor: 'MUSICOZY Sleep Headphones',
        sentiment: 'positive',
        score: 4.3,
        totalReviews: 15234,
        themes: {
          positive: ['comfortable', 'great sound quality', 'perfect for sleeping', 'good battery life'],
          negative: ['volume controls difficult', 'sizing issues for larger heads', 'connectivity problems']
        },
        keyInsights: [
          'Users love the comfort for side sleeping',
          'Sound quality consistently praised',
          'Battery life exceeds expectations',
          'Control placement could be improved'
        ]
      },
      {
        competitor: 'Perytong Sleep Headphones',
        sentiment: 'positive',
        score: 4.1,
        totalReviews: 12456,
        themes: {
          positive: ['versatile for sports and sleep', 'thin speakers', 'easy controls', 'good value'],
          negative: ['durability concerns', 'speaker positioning', 'fabric quality']
        },
        keyInsights: [
          'Dual-use appeal for sports and sleep',
          'Thin speaker design highly valued',
          'Price point considered excellent value',
          'Long-term durability questioned'
        ]
      },
      {
        competitor: 'CozyPhones Sleep Headphones',
        sentiment: 'neutral',
        score: 4.0,
        totalReviews: 8934,
        themes: {
          positive: ['unique flat design', 'travel-friendly', 'noise isolation', 'hypoallergenic'],
          negative: ['sound quality limitations', 'cord tangling', 'comfort for some users']
        },
        keyInsights: [
          'Flat speaker design differentiator',
          'Strong travel use case',
          'Noise isolation effective',
          'Sound quality trade-offs noted'
        ]
      }
    ],
    commonThemes: {
      positive: ['comfort', 'sleep quality improvement', 'sound quality', 'battery life', 'side sleeping'],
      negative: ['durability', 'sizing', 'controls', 'connectivity', 'comfort variations'],
      opportunities: ['improved controls', 'better sizing options', 'enhanced durability', 'premium materials']
    }
  },

  // Listing Optimization Data
  listingOptimizationData: {
    imageAnalysis: {
      position1: {
        commonThemes: ['product on white background', 'clean minimal style', 'headband clearly visible'],
        creativeBrief: 'Main hero shot should showcase the sleep mask on a clean white background with the Bluetooth speakers clearly visible. Focus on the comfortable headband design and premium materials. Use natural lighting to highlight texture and quality.',
        competitorImages: [
          'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop'
        ],
        optimizationTips: [
          'Ensure product takes up 85% of image space',
          'Use high contrast to highlight key features',
          'Show unique design elements clearly'
        ]
      },
      position2: {
        commonThemes: ['lifestyle usage', 'person sleeping', 'comfort demonstration'],
        creativeBrief: 'Lifestyle shot featuring a person peacefully sleeping while wearing the mask. Show side sleeping position to emphasize comfort. Use warm, cozy bedroom lighting to convey relaxation and quality sleep.',
        competitorImages: [
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop'
        ],
        optimizationTips: [
          'Show actual usage scenario',
          'Emphasize comfort and peaceful sleep',
          'Use diverse models to appeal to broader audience'
        ]
      },
      position3: {
        commonThemes: ['feature callouts', 'technical details', 'specifications'],
        creativeBrief: 'Detailed feature breakdown image highlighting key selling points: Bluetooth connectivity, battery life, speaker positioning, and material quality. Use infographic style with clean icons and easy-to-read text.',
        competitorImages: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        ],
        optimizationTips: [
          'Keep text large and readable on mobile',
          'Highlight unique features prominently',
          'Use visual icons for quick understanding'
        ]
      },
      position4: {
        commonThemes: ['comparison charts', 'what\'s included', 'package contents'],
        creativeBrief: 'Package contents and comparison image showing what customers receive and how the product compares to alternatives. Include charging cable, instruction manual, and any accessories. Use organized grid layout.',
        competitorImages: [],
        optimizationTips: [
          'Show complete package contents',
          'Include size comparisons',
          'Highlight value proposition'
        ]
      }
    },
    titleOptimization: {
      currentPattern: 'Brand + Product Type + Key Features + Use Case',
      recommendations: [
        'Include "Bluetooth" early in title for algorithm relevance',
        'Mention "Side Sleepers" as key differentiator',
        'Add "Wireless" for additional keyword coverage',
        'Keep under 200 characters for mobile display'
      ],
      suggestedTitle: 'Premium Bluetooth Sleep Mask with Built-in Speakers - Wireless Audio Headband for Side Sleepers, Meditation & Travel'
    },
    bulletPointOptimization: {
      structure: 'Benefit + Feature + Proof Point',
      recommendations: [
        'Lead with primary customer benefit',
        'Include technical specifications',
        'Address common pain points from reviews',
        'Use power words and emotional triggers'
      ]
    },
    // Advanced Listing Features
    completeImageAnalysis: {
      imageGallery: {
        ourProduct: {
          mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
          images: [
            { url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop', type: 'main', score: 88, caption: 'Hero shot - clean white background' },
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop', type: 'lifestyle', score: 85, caption: 'Side sleeping demonstration' },
            { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', type: 'detail', score: 82, caption: 'Feature callouts and specs' },
            { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'comparison', score: 78, caption: 'Package contents overview' }
          ]
        },
        competitors: [
          {
            name: 'MUSICOZY',
            asin: 'B08MVBRNKV',
            totalScore: 92,
            images: [
              { url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop', type: 'main', score: 95, improvements: ['Better product positioning', 'Improved lighting'] },
              { url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop', type: 'lifestyle', score: 90, improvements: ['More diverse models', 'Better bedroom setting'] },
              { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop', type: 'detail', score: 88, improvements: ['Clearer text', 'Better icon design'] },
              { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', type: 'infographic', score: 92, improvements: ['More technical details'] },
              { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'packaging', score: 89, improvements: ['Show warranty info'] },
              { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop', type: 'comparison', score: 91, improvements: ['Add size guide'] }
            ]
          },
          {
            name: 'Perytong',
            asin: 'B07SHBQY7Z',
            totalScore: 85,
            images: [
              { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop', type: 'main', score: 87, improvements: ['Sharper resolution', 'Better color balance'] },
              { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', type: 'lifestyle', score: 83, improvements: ['More realistic scenarios'] },
              { url: 'https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?w=400&h=400&fit=crop', type: 'detail', score: 85, improvements: ['Better close-ups'] },
              { url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=400&fit=crop', type: 'comparison', score: 82, improvements: ['Clearer comparisons'] },
              { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop', type: 'infographic', score: 86, improvements: ['More benefit-focused'] },
              { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', type: 'packaging', score: 84, improvements: ['Better layout'] }
            ]
          }
        ]
      },
      imagePerformanceMetrics: {
        overallScore: 83,
        breakdown: {
          position1: { score: 88, conversionImpact: 'High', optimizationPriority: 'Medium' },
          position2: { score: 85, conversionImpact: 'High', optimizationPriority: 'High' },
          position3: { score: 82, conversionImpact: 'Medium', optimizationPriority: 'Medium' },
          position4: { score: 78, conversionImpact: 'Low', optimizationPriority: 'Low' }
        },
        improvementPotential: {
          currentCVR: 12.5,
          projectedCVR: 15.8,
          revenueUplift: 26.4
        }
      }
    },
    advancedTitleOptimization: {
      characterAnalysis: {
        currentTitle: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
        currentLength: 48,
        mobileLimit: 80,
        desktopLimit: 200,
        utilizationRate: 24
      },
      keywordDensity: {
        primary: { keyword: 'sleep mask', density: 2.1, optimal: 2.5 },
        secondary: { keyword: 'bluetooth', density: 2.1, optimal: 2.0 },
        tertiary: { keyword: 'speakers', density: 2.1, optimal: 1.5 }
      },
      titleVariations: [
        {
          title: 'Bluetooth Sleep Mask with Built-in Speakers - Wireless Audio Headband for Side Sleepers, Meditation & Travel',
          score: 94,
          pros: ['Keyword rich', 'Under 200 chars', 'Clear benefits'],
          cons: ['Could be more emotional'],
          length: 112
        },
        {
          title: 'Premium Sleep Mask Bluetooth Headphones - Ultra-Soft Wireless Audio Eye Mask for Deep Sleep & Relaxation',
          score: 91,
          pros: ['Emotional appeal', 'Clear differentiation'],
          cons: ['Missing travel keyword', 'Longer length'],
          length: 118
        },
        {
          title: 'Sleep Mask with Bluetooth Speakers - Comfortable Wireless Headband for Side Sleepers, Travel & Meditation',
          score: 89,
          pros: ['Natural flow', 'Key benefits clear'],
          cons: ['Generic opening', 'Missing premium positioning'],
          length: 115
        }
      ],
      competitorTitleAnalysis: [
        {
          competitor: 'MUSICOZY',
          title: 'Sleep Headphones Bluetooth Headband - Soft Elastic Comfortable Headband Headphones for Sleeping',
          score: 87,
          strengths: ['Clear product type', 'Comfort emphasis'],
          weaknesses: ['Repetitive', 'Missing use cases']
        },
        {
          competitor: 'Perytong',
          title: 'Sleep Headphones Bluetooth Sports Headband Thin Speakers Perfect for Workout, Jogging, Yoga',
          score: 85,
          strengths: ['Multiple use cases', 'Feature highlight'],
          weaknesses: ['Too focused on sports', 'Missing sleep emphasis']
        }
      ]
    },
    enhancedBulletPoints: {
      currentBullets: [
        'PREMIUM COMFORT - Ultra-soft, breathable fabric designed specifically for side sleepers',
        'WIRELESS BLUETOOTH - Latest 5.0 technology for stable connection up to 30 feet',
        'LONG BATTERY LIFE - Up to 10 hours of continuous playback on single charge',
        'PERFECT FOR TRAVEL - Compact design fits easily in carry-on luggage',
        'SATISFACTION GUARANTEE - 30-day money-back guarantee with 1-year warranty'
      ],
      optimizedBullets: [
        {
          bullet: '🌙 SLEEP DEEPER TONIGHT - Ultra-soft hypoallergenic fabric with flat speakers designed for side sleepers eliminates pressure points while delivering crystal-clear audio for meditation, sleep stories, or music',
          score: 95,
          improvements: ['Emotional hook', 'Specific benefits', 'Clear audience'],
          characterCount: 198
        },
        {
          bullet: '📱 SEAMLESS WIRELESS CONNECTION - Advanced Bluetooth 5.0 technology connects instantly to any device within 30 feet, with automatic reconnection and hands-free calling capability',
          score: 92,
          improvements: ['Technical credibility', 'Range specification', 'Added functionality'],
          characterCount: 178
        },
        {
          bullet: '🔋 ALL-NIGHT BATTERY POWER - Industry-leading 10+ hour battery life means uninterrupted sleep audio, plus quick 2-hour charging via included USB cable',
          score: 90,
          improvements: ['Superlative positioning', 'Practical benefit', 'Charging info'],
          characterCount: 156
        },
        {
          bullet: '✈️ TRAVEL-READY COMFORT - Lightweight, foldable design perfect for flights, hotels, or camping with included travel pouch for protection',
          score: 88,
          improvements: ['Use case specific', 'Portability emphasis', 'Protection value'],
          characterCount: 142
        },
        {
          bullet: '💯 RISK-FREE GUARANTEE - 30-day money-back promise plus 12-month replacement warranty ensures your complete satisfaction',
          score: 86,
          improvements: ['Risk reversal', 'Extended warranty', 'Confidence building'],
          characterCount: 128
        }
      ],
      bulletAnalytics: {
        averageScore: 90.2,
        emotionalTriggers: 8,
        benefitToFeatureRatio: 3.2,
        readabilityScore: 87,
        mobileOptimization: 94
      }
    },
    comprehensiveAPlusContent: {
      moduleRecommendations: [
        {
          type: 'Hero Banner',
          template: 'Standard Company Logo',
          score: 95,
          content: {
            headline: 'Experience Perfect Sleep Audio',
            subheadline: 'Premium Bluetooth technology meets ultimate comfort',
            cta: 'Discover the Difference',
            backgroundType: 'Lifestyle bedroom scene'
          },
          mobileOptimization: 92,
          conversionImpact: 'High'
        },
        {
          type: 'Feature Comparison',
          template: 'Comparison Chart',
          score: 93,
          content: {
            features: [
              { feature: 'Speaker Technology', us: 'Ultra-thin HD speakers', competitor1: 'Standard speakers', competitor2: 'Thick speakers' },
              { feature: 'Battery Life', us: '10+ hours', competitor1: '8 hours', competitor2: '6 hours' },
              { feature: 'Comfort Rating', us: '5/5 stars', competitor1: '4/5 stars', competitor2: '3/5 stars' },
              { feature: 'Bluetooth Range', us: '30 feet', competitor1: '20 feet', competitor2: '15 feet' }
            ]
          },
          mobileOptimization: 89,
          conversionImpact: 'High'
        },
        {
          type: 'Product Description',
          template: 'Standard Single Image & Text',
          score: 88,
          content: {
            headline: 'Engineered for Side Sleepers',
            description: 'Our patented ultra-thin speaker design eliminates pressure points while delivering rich, immersive audio...',
            imageType: 'Cross-section technical diagram'
          },
          mobileOptimization: 94,
          conversionImpact: 'Medium'
        }
      ],
      brandStoryElements: {
        mission: 'Transforming sleep through innovative audio technology',
        values: ['Quality', 'Comfort', 'Innovation', 'Customer satisfaction'],
        differentiators: ['Patented speaker design', 'Sleep-focused engineering', 'Premium materials'],
        socialProof: ['50,000+ satisfied customers', '4.5-star average rating', 'Featured in Sleep Magazine']
      },
      performancePrediction: {
        currentConversionRate: 12.5,
        projectedUplift: 18.5,
        confidenceLevel: 87,
        timeToImplement: '2-3 weeks'
      }
    },
    advancedVideoStrategy: {
      storyboards: [
        {
          type: 'Product Demo',
          duration: 60,
          script: {
            opening: 'Tired of uncomfortable earbuds ruining your sleep?',
            demonstration: 'Watch how our ultra-thin speakers provide crystal-clear audio...',
            closing: 'Experience perfect sleep audio tonight',
            cta: 'Order now with free shipping'
          },
          shotList: [
            { shot: 'Problem setup - person struggling with earbuds', duration: 8 },
            { shot: 'Product introduction - clean white background', duration: 6 },
            { shot: 'Unboxing and setup process', duration: 12 },
            { shot: 'Bluetooth pairing demonstration', duration: 8 },
            { shot: 'Comfort demonstration - side sleeping', duration: 15 },
            { shot: 'Feature callouts with graphics', duration: 8 },
            { shot: 'Call to action with product shot', duration: 3 }
          ],
          productionCost: 2500,
          expectedROI: 340
        },
        {
          type: 'Lifestyle',
          duration: 45,
          script: {
            opening: 'Transform your nightly routine',
            demonstration: 'From meditation to sleep stories to music...',
            closing: 'Sleep better, wake up refreshed',
            cta: 'Join thousands of better sleepers'
          },
          shotList: [
            { shot: 'Evening routine montage', duration: 10 },
            { shot: 'Putting on sleep mask - comfortable fit', duration: 8 },
            { shot: 'Peaceful sleep scenes - various positions', duration: 15 },
            { shot: 'Morning wake-up - refreshed feeling', duration: 8 },
            { shot: 'Product beauty shot with branding', duration: 4 }
          ],
          productionCost: 3200,
          expectedROI: 280
        }
      ],
      performanceBenchmarks: {
        industry: {
          averageViewRate: 65,
          averageConversionLift: 12.5,
          averageCostPerView: 0.08
        },
        projected: {
          viewRate: 78,
          conversionLift: 18.5,
          costPerView: 0.06,
          totalViews: 125000,
          projectedSales: 2850
        }
      }
    },
    listingPerformanceSimulator: {
      currentMetrics: {
        conversionRate: 12.5,
        clickThroughRate: 0.42,
        sessionDuration: 145,
        bounceRate: 23.8,
        addToCartRate: 8.9
      },
      optimizationImpact: {
        title: { conversionLift: 2.3, effort: 'Low', timeframe: '1 day' },
        images: { conversionLift: 8.5, effort: 'Medium', timeframe: '1 week' },
        bullets: { conversionLift: 4.2, effort: 'Low', timeframe: '1 day' },
        aplus: { conversionLift: 12.8, effort: 'High', timeframe: '2-3 weeks' },
        video: { conversionLift: 15.2, effort: 'High', timeframe: '3-4 weeks' }
      },
      competitorGapAnalysis: [
        { area: 'Image Quality', gap: 12, competitorAverage: 87, ourScore: 75 },
        { area: 'Title Optimization', gap: 8, competitorAverage: 85, ourScore: 77 },
        { area: 'Bullet Effectiveness', gap: 6, competitorAverage: 82, ourScore: 76 },
        { area: 'A+ Content', gap: 15, competitorAverage: 90, ourScore: 75 },
        { area: 'Video Content', gap: 20, competitorAverage: 85, ourScore: 65 }
      ],
      priorityMatrix: [
        { optimization: 'Add product video', impact: 'High', effort: 'High', priority: 1, roi: 340 },
        { optimization: 'Enhance A+ content', impact: 'High', effort: 'Medium', priority: 2, roi: 280 },
        { optimization: 'Improve main image', impact: 'Medium', effort: 'Medium', priority: 3, roi: 220 },
        { optimization: 'Optimize bullets', impact: 'Medium', effort: 'Low', priority: 4, roi: 180 },
        { optimization: 'Refine title', impact: 'Low', effort: 'Low', priority: 5, roi: 120 }
      ]
    },
    qualityAssurance: {
      amazonCompliance: {
        overallScore: 92,
        checks: [
          { category: 'Image Guidelines', status: 'Pass', score: 95, issues: [] },
          { category: 'Text Requirements', status: 'Pass', score: 90, issues: ['Minor: Title could be more keyword-rich'] },
          { category: 'Prohibited Content', status: 'Pass', score: 100, issues: [] },
          { category: 'Brand Guidelines', status: 'Warning', score: 85, issues: ['Missing brand logo on secondary images'] },
          { category: 'Technical Specs', status: 'Pass', score: 88, issues: ['Consider adding more detailed specifications'] }
        ]
      },
      imageQualityAnalysis: {
        technicalScore: 87,
        checks: [
          { criteria: 'Resolution', status: 'Pass', details: 'All images 1000x1000px minimum' },
          { criteria: 'File Format', status: 'Pass', details: 'JPEG format with RGB color space' },
          { criteria: 'Background', status: 'Pass', details: 'White background RGB 255,255,255' },
          { criteria: 'Product Fill', status: 'Good', details: '85% product fill rate achieved' },
          { criteria: 'Lighting', status: 'Excellent', details: 'Professional even lighting' }
        ]
      },
      brandRiskAssessment: {
        trademarkRisk: 'Low',
        copyrightRisk: 'Low',
        riskFactors: [
          { type: 'Trademark', description: 'Generic product category terms used', risk: 'Low' },
          { type: 'Copyright', description: 'Original imagery and text content', risk: 'Low' },
          { type: 'Claims', description: 'All claims substantiated or qualified', risk: 'Medium' }
        ],
        recommendations: [
          'Register product images with Amazon Brand Registry',
          'Consider trademark protection for unique product names',
          'Document all product testing for claims substantiation'
        ]
      }
    }
  },

  // Financial Data
  financialData: {
    avgSellingPrice: 29.99,
    totalFees: 8.50,
    monthlyOrders: 1735,
    monthlyClicks: 13880,
    avgConversionRate: 12.5,
    keywordDepthGrade: 'A-',
    annualizedRevenue: 624000,
    annualizedProfit: 218400,
    unitEconomics: {
      sellingPrice: 29.99,
      productCost: 8.50,
      amazonFees: 8.99,
      shippingCost: 4.00,
      netProfit: 8.50,
      profitMargin: 28.3
    },
    monthlyProjections: {
      conservative: {
        revenue: 35000,
        profit: 9900,
        units: 1167
      },
      realistic: {
        revenue: 52000,
        profit: 14700,
        units: 1735
      },
      optimistic: {
        revenue: 75000,
        profit: 21200,
        units: 2502
      }
    },
    investmentRequired: {
      initialInventory: 8500,
      marketing: 3500,
      operatingCapital: 3000,
      total: 15000
    },
    roi: {
      breakEvenMonths: 4,
      year1ROI: 124,
      year3ROI: 385
    },
    riskFactors: [
      {
        type: 'Inventory Risk',
        level: 'Medium',
        description: 'Seasonal demand fluctuations may affect inventory turnover',
        mitigation: 'Start with smaller order quantities and use JIT inventory management'
      },
      {
        type: 'Competition Risk',
        level: 'High',
        description: 'Low barrier to entry may attract new competitors',
        mitigation: 'Build brand loyalty through superior customer service and product quality'
      },
      {
        type: 'Price Pressure',
        level: 'Medium',
        description: 'Competitors may engage in price wars',
        mitigation: 'Focus on value-added features and premium positioning'
      },
      {
        type: 'Supply Chain',
        level: 'Low',
        description: 'Dependence on overseas suppliers',
        mitigation: 'Maintain relationships with multiple suppliers and buffer stock'
      }
    ],
    priceAnalysis: {
      currentPosition: {
        price: 29.99,
        salesRank: 12340,
        percentile: 65
      },
      pricePoints: [
        { price: 15.99, salesRank: 89000, monthlyUnits: 450, revenue: 7195, percentile: 15 },
        { price: 19.99, salesRank: 45000, monthlyUnits: 820, revenue: 16392, percentile: 30 },
        { price: 24.99, salesRank: 23000, monthlyUnits: 1240, revenue: 30988, percentile: 50 },
        { price: 29.99, salesRank: 12340, monthlyUnits: 1735, revenue: 52038, percentile: 65 },
        { price: 34.99, salesRank: 7800, monthlyUnits: 1980, revenue: 69242, percentile: 75 },
        { price: 39.99, salesRank: 5200, monthlyUnits: 2100, revenue: 83979, percentile: 85 },
        { price: 44.99, salesRank: 3500, monthlyUnits: 1890, revenue: 85011, percentile: 90 },
        { price: 49.99, salesRank: 2800, monthlyUnits: 1620, revenue: 80988, percentile: 95 }
      ],
      optimalRange: {
        min: 34.99,
        max: 39.99,
        reason: 'Sweet spot for maximum revenue with strong sales rank'
      },
      competitorPricing: [
        { name: 'MUSICOZY', price: 29.99, salesRank: 12340, position: 'competitive' },
        { name: 'Perytong', price: 25.99, salesRank: 18500, position: 'value' },
        { name: 'CozyPhones', price: 19.95, salesRank: 35600, position: 'budget' }
      ]
    },
    // Advanced Financial Modeling
    cashFlowProjections: {
      monthly: [
        { month: 1, revenue: 35000, costs: 25100, cashFlow: 9900, cumulativeCashFlow: -5100, workingCapital: 8500 },
        { month: 2, revenue: 42000, costs: 30240, cashFlow: 11760, cumulativeCashFlow: 6660, workingCapital: 10200 },
        { month: 3, revenue: 48000, costs: 34560, cashFlow: 13440, cumulativeCashFlow: 20100, workingCapital: 11680 },
        { month: 4, revenue: 52000, costs: 37440, cashFlow: 14560, cumulativeCashFlow: 34660, workingCapital: 12840 },
        { month: 5, revenue: 56000, costs: 40320, cashFlow: 15680, cumulativeCashFlow: 50340, workingCapital: 13800 },
        { month: 6, revenue: 58000, costs: 41760, cashFlow: 16240, cumulativeCashFlow: 66580, workingCapital: 14280 },
        { month: 7, revenue: 62000, costs: 44640, cashFlow: 17360, cumulativeCashFlow: 83940, workingCapital: 15240 },
        { month: 8, revenue: 65000, costs: 46800, cashFlow: 18200, cumulativeCashFlow: 102140, workingCapital: 16000 },
        { month: 9, revenue: 68000, costs: 48960, cashFlow: 19040, cumulativeCashFlow: 121180, workingCapital: 16720 },
        { month: 10, revenue: 72000, costs: 51840, cashFlow: 20160, cumulativeCashFlow: 141340, workingCapital: 17680 },
        { month: 11, revenue: 78000, costs: 56160, cashFlow: 21840, cumulativeCashFlow: 163180, workingCapital: 19200 },
        { month: 12, revenue: 85000, costs: 61200, cashFlow: 23800, cumulativeCashFlow: 186980, workingCapital: 20900 }
      ],
      seasonalAdjustments: {
        q1: 0.85, // 15% lower demand
        q2: 0.95, // 5% lower demand
        q3: 1.05, // 5% higher demand
        q4: 1.25  // 25% higher demand (holiday season)
      },
      cashConversionCycle: {
        daysInventoryOutstanding: 45,
        daysReceivablesOutstanding: 14, // Amazon payment cycle
        daysPayablesOutstanding: 30,
        cycleDays: 29
      }
    },
    enhancedMetrics: {
      npv: {
        discountRate: 0.12,
        year1: 186980,
        year2: 298500,
        year3: 425600,
        totalNPV: 689420
      },
      irr: 285.4, // Internal Rate of Return percentage
      paybackPeriod: {
        simple: 3.2, // months
        discounted: 4.1 // months
      },
      sensitivityAnalysis: {
        priceElasticity: [
          { priceChange: -10, volumeChange: 25, revenueImpact: 12.5, profitImpact: 8.2 },
          { priceChange: -5, volumeChange: 12, revenueImpact: 6.4, profitImpact: 4.1 },
          { priceChange: 0, volumeChange: 0, revenueImpact: 0, profitImpact: 0 },
          { priceChange: 5, volumeChange: -8, revenueImpact: -3.4, profitImpact: -2.1 },
          { priceChange: 10, volumeChange: -18, revenueImpact: -8.0, profitImpact: -5.2 }
        ],
        costSensitivity: [
          { costChange: -10, profitImpact: 12.8 },
          { costChange: -5, profitImpact: 6.4 },
          { costChange: 0, profitImpact: 0 },
          { costChange: 5, profitImpact: -6.4 },
          { costChange: 10, profitImpact: -12.8 }
        ]
      },
      financialRatios: {
        grossMargin: 71.7,
        netMargin: 28.3,
        inventoryTurnover: 8.1,
        returnOnInvestment: 124.5,
        assetTurnover: 3.6
      }
    },
    inventoryFinancials: {
      carryingCosts: {
        storageFeePerUnit: 0.45,
        insurancePerUnit: 0.12,
        obsolescenceRisk: 2.5, // percentage
        totalCarryingCostPercentage: 18.2
      },
      deadStockRisk: {
        riskLevel: 'Medium',
        potentialLossValue: 8500,
        mitigationCost: 1200,
        riskScore: 6.5
      },
      turnoverOptimization: {
        currentTurnover: 8.1,
        targetTurnover: 12.0,
        improvementPotential: 3200, // annual savings
        reorderPoints: {
          conservative: 850,
          aggressive: 450
        }
      },
      seasonalPlanning: {
        q1: { unitsNeeded: 1200, investmentRequired: 10200 },
        q2: { unitsNeeded: 1400, investmentRequired: 11900 },
        q3: { unitsNeeded: 1600, investmentRequired: 13600 },
        q4: { unitsNeeded: 2200, investmentRequired: 18700 }
      }
    },
    scalingAnalysis: {
      portfolioModeling: {
        singleProduct: { monthlyProfit: 14700, investmentRequired: 15000 },
        threeProducts: { monthlyProfit: 41200, investmentRequired: 42000, synergies: 8.5 },
        fiveProducts: { monthlyProfit: 68500, investmentRequired: 68000, synergies: 12.2 },
        tenProducts: { monthlyProfit: 125000, investmentRequired: 125000, synergies: 15.8 }
      },
      economiesOfScale: {
        volume: [
          { orderSize: 1000, unitCost: 8.50, savingsPercentage: 0 },
          { orderSize: 2500, unitCost: 7.95, savingsPercentage: 6.5 },
          { orderSize: 5000, unitCost: 7.35, savingsPercentage: 13.5 },
          { orderSize: 10000, unitCost: 6.80, savingsPercentage: 20.0 }
        ],
        shippingOptimization: {
          currentCostPerUnit: 4.00,
          optimizedCostPerUnit: 3.20,
          annualSavings: 16640
        }
      },
      internationalExpansion: {
        markets: [
          { country: 'Canada', marketSize: '15%', investmentRequired: 8500, expectedROI: 95 },
          { country: 'UK', marketSize: '25%', investmentRequired: 12000, expectedROI: 112 },
          { country: 'Germany', marketSize: '30%', investmentRequired: 15000, expectedROI: 128 }
        ],
        totalExpansionPotential: {
          additionalRevenue: 187200,
          additionalInvestment: 35500,
          combinedROI: 156
        }
      },
      brandBuilding: {
        investmentAreas: [
          { area: 'Brand Registry & IP', cost: 2500, expectedReturn: 8500 },
          { area: 'Content Marketing', cost: 4200, expectedReturn: 12800 },
          { area: 'Influencer Partnerships', cost: 6000, expectedReturn: 18500 },
          { area: 'Premium Packaging', cost: 3500, expectedReturn: 9200 }
        ],
        totalBrandInvestment: 16200,
        expectedBrandPremium: 15.5 // percentage price premium
      }
    },
    riskAdjustedReturns: {
      riskScore: 6.2, // out of 10
      adjustedROI: 98.4, // risk-adjusted from 124%
      confidenceIntervals: {
        conservative: { low: 85, high: 125 },
        realistic: { low: 110, high: 185 },
        optimistic: { low: 155, high: 285 }
      },
      scenarioAnalysis: [
        { scenario: 'Economic Downturn', probability: 15, impactOnROI: -35, mitigationCost: 2200 },
        { scenario: 'New Competitor Entry', probability: 25, impactOnROI: -22, mitigationCost: 3500 },
        { scenario: 'Supply Chain Disruption', probability: 10, impactOnROI: -18, mitigationCost: 1800 },
        { scenario: 'Amazon Policy Change', probability: 12, impactOnROI: -28, mitigationCost: 4200 }
      ],
      monteCarloSimulation: {
        iterations: 10000,
        meanROI: 124.5,
        standardDeviation: 28.6,
        percentiles: {
          p10: 78.2,
          p25: 98.4,
          p50: 124.5,
          p75: 148.7,
          p90: 172.8
        }
      }
    }
  },

  // Launch Strategy Data
  launchStrategyData: {
    // Dynamic pricing strategy based on review count
    dynamicPricing: {
      currentPrice: 19.97,
      targetPrice: 29.99,
      pricingTiers: [
        { reviewRange: '0-25', price: 19.97, discount: 33, rationale: 'Aggressive launch pricing to build velocity' },
        { reviewRange: '26-100', price: 22.99, discount: 23, rationale: 'Moderate discount to maintain momentum' },
        { reviewRange: '101-300', price: 25.99, discount: 13, rationale: 'Reduced discount as credibility builds' },
        { reviewRange: '301+', price: 29.99, discount: 0, rationale: 'Full price with established social proof' }
      ],
      competitorBenchmarking: [
        { competitor: 'MUSICOZY', price: 26.99, reviews: 4250, rating: 4.3 },
        { competitor: 'Perytong', price: 24.99, reviews: 2890, rating: 4.2 },
        { competitor: 'CozyPhones', price: 22.99, reviews: 1560, rating: 4.1 }
      ],
      seasonalAdjustments: {
        holiday: { multiplier: 1.15, duration: 'Nov-Dec' },
        newYear: { multiplier: 0.95, duration: 'Jan-Feb' },
        summer: { multiplier: 1.05, duration: 'Jun-Aug' }
      }
    },
    
    // Minimum rating requirements and thresholds
    ratingRequirements: {
      minimumRating: 4.0,
      targetRating: 4.3,
      ratingMilestones: [
        { reviews: 25, targetRating: 4.2, actions: ['Follow-up sequence', 'Quality check'] },
        { reviews: 100, targetRating: 4.3, actions: ['Price increase', 'Expand keywords'] },
        { reviews: 300, targetRating: 4.4, actions: ['Full price', 'International expansion'] },
        { reviews: 500, targetRating: 4.5, actions: ['Premium positioning', 'Variations launch'] }
      ],
      reviewQualityMetrics: {
        averageLength: 120,
        photoPercentage: 35,
        verifiedPurchaseRate: 85,
        sentimentScore: 82
      },
      competitorRatingBenchmarks: [
        { competitor: 'MUSICOZY', rating: 4.3, reviews: 4250, velocity: 8.5 },
        { competitor: 'Perytong', rating: 4.2, reviews: 2890, velocity: 6.2 },
        { competitor: 'CozyPhones', rating: 4.1, reviews: 1560, velocity: 4.1 }
      ]
    },

    // Enhanced PPC campaign strategy
    enhancedPPCStrategy: {
      totalBudget: 6500,
      phases: [
        {
          phase: 'Launch Aggressive',
          duration: 'Week 1-4',
          totalBudget: 3000,
          dailyBudget: 107,
          targetAcos: 80,
          objectives: ['Build sales velocity', 'Collect performance data', 'Establish keyword rankings']
        },
        {
          phase: 'Optimization',
          duration: 'Week 5-8',
          totalBudget: 2500,
          dailyBudget: 89,
          targetAcos: 65,
          objectives: ['Optimize profitable keywords', 'Expand winning campaigns', 'Negative keyword harvest']
        },
        {
          phase: 'Scaling',
          duration: 'Week 9-12',
          totalBudget: 2000,
          dailyBudget: 71,
          targetAcos: 50,
          objectives: ['Scale profitable campaigns', 'Maintain organic rankings', 'Profit optimization']
        }
      ],
      detailedCampaigns: [
        {
          name: 'Launch - Exact Match High Intent',
          type: 'Sponsored Products Manual',
          matchType: 'Exact',
          dailyBudget: 45,
          targetAcos: 70,
          bidStrategy: 'Fixed Bids',
          priority: 'High',
          keywords: [
            { keyword: 'bluetooth sleep mask', bid: 1.45, volume: 45000, cpc: 1.23, roi: 285 },
            { keyword: 'wireless sleep mask', bid: 1.28, volume: 28000, cpc: 1.15, roi: 245 },
            { keyword: 'sleep mask with speakers', bid: 1.15, volume: 22000, cpc: 0.98, roi: 265 },
            { keyword: 'bluetooth eye mask', bid: 1.32, volume: 18000, cpc: 1.08, roi: 220 }
          ],
          negativeKeywords: ['cheap', 'free', 'kids', 'children'],
          targetingOptions: {
            placement: 'Top of Search',
            bidAdjustment: 25
          }
        },
        {
          name: 'Launch - Phrase Match Discovery',
          type: 'Sponsored Products Manual',
          matchType: 'Phrase',
          dailyBudget: 35,
          targetAcos: 75,
          bidStrategy: 'Dynamic Down Only',
          priority: 'High',
          keywords: [
            { keyword: 'bluetooth sleep mask', bid: 1.25, volume: 85000, cpc: 1.08, roi: 235 },
            { keyword: 'wireless sleep headphones', bid: 1.18, volume: 62000, cpc: 0.95, roi: 210 },
            { keyword: 'sleep mask speakers', bid: 1.05, volume: 45000, cpc: 0.88, roi: 195 },
            { keyword: 'bluetooth eye mask sleeping', bid: 1.15, volume: 38000, cpc: 0.92, roi: 225 }
          ],
          negativeKeywords: ['wired', 'corded', 'disposable'],
          targetingOptions: {
            placement: 'Rest of Search',
            bidAdjustment: 0
          }
        },
        {
          name: 'Competitor Targeting - MUSICOZY',
          type: 'Sponsored Products Auto',
          matchType: 'Auto',
          dailyBudget: 25,
          targetAcos: 60,
          bidStrategy: 'Dynamic Up and Down',
          priority: 'Medium',
          targets: [
            { asin: 'B07SHBQY7Z', bid: 1.85, estimatedCpc: 1.65, competitorShare: 42 },
            { asin: 'B07Q34GWQT', bid: 1.75, estimatedCpc: 1.55, competitorShare: 28 }
          ],
          negativeKeywords: ['musicozy', 'perytong', 'brand'],
          targetingOptions: {
            placement: 'Product Pages',
            bidAdjustment: 50
          }
        },
        {
          name: 'Brand Defense',
          type: 'Sponsored Brands',
          matchType: 'Exact',
          dailyBudget: 20,
          targetAcos: 40,
          bidStrategy: 'Fixed Bids',
          priority: 'Medium',
          keywords: [
            { keyword: 'sleep mask bluetooth', bid: 1.65, volume: 35000, cpc: 1.42, roi: 180 },
            { keyword: 'bluetooth sleep headphones', bid: 1.55, volume: 28000, cpc: 1.38, roi: 165 }
          ],
          creativeTesting: {
            headlines: ['Premium Sleep Audio Technology', 'Better Sleep Starts Here'],
            images: ['lifestyle', 'product-focus', 'benefit-callout']
          }
        }
      ],
      keywordTierStrategy: {
        tier1HighValue: {
          keywords: ['bluetooth sleep mask', 'wireless sleep mask', 'sleep mask with speakers'],
          strategy: 'Aggressive bidding, exact match priority',
          averageCpc: 1.35,
          expectedRoi: 250
        },
        tier2Moderate: {
          keywords: ['sleep headphones bluetooth', 'bluetooth eye mask', 'wireless sleep headphones'],
          strategy: 'Moderate bidding, phrase match focus',
          averageCpc: 1.15,
          expectedRoi: 215
        },
        tier3Discovery: {
          keywords: ['sleep mask audio', 'bluetooth sleep aid', 'wireless sleep device'],
          strategy: 'Conservative bidding, broad match testing',
          averageCpc: 0.95,
          expectedRoi: 185
        }
      }
    },

    // Bulk operation files and templates
    bulkOperationFiles: {
      campaignTemplates: [
        {
          name: 'Amazon Ads Campaign Builder',
          type: 'excel',
          description: 'Complete campaign setup with keywords, bids, and targeting',
          columns: ['Campaign Name', 'Ad Group', 'Keyword', 'Match Type', 'Bid', 'Daily Budget', 'Target ACoS'],
          sampleData: [
            ['Launch-Exact-High-Intent', 'Bluetooth Sleep Mask', 'bluetooth sleep mask', 'Exact', 1.45, 45, 70],
            ['Launch-Phrase-Discovery', 'Wireless Sleep', 'wireless sleep mask', 'Phrase', 1.25, 35, 75]
          ]
        },
        {
          name: 'Keyword List Generator',
          type: 'csv',
          description: 'Pre-researched keywords with recommended bids and match types',
          totalKeywords: 245,
          keywordCategories: ['Primary', 'Secondary', 'Long-tail', 'Competitor'],
          estimatedSetupTime: '30 minutes'
        },
        {
          name: 'Negative Keyword Lists',
          type: 'txt',
          description: 'Comprehensive negative keyword lists for each campaign type',
          lists: [
            { name: 'Generic Negatives', keywords: ['cheap', 'free', 'kids', 'children', 'toy'] },
            { name: 'Competitor Negatives', keywords: ['musicozy', 'perytong', 'cozyphones', 'brand'] },
            { name: 'Irrelevant Negatives', keywords: ['wired', 'corded', 'disposable', 'paper'] }
          ]
        },
        {
          name: 'Bid Management Tracker',
          type: 'excel',
          description: 'Track performance and optimize bids across all campaigns',
          features: ['Performance tracking', 'Bid calculations', 'ROI analysis', 'Automated recommendations']
        }
      ],
      exportFormats: ['Excel (.xlsx)', 'CSV (.csv)', 'Amazon Ads Bulk Upload (.xlsx)', 'Google Sheets'],
      scheduledUpdates: 'Weekly optimization recommendations'
    },

    // Advanced launch analytics
    launchAnalytics: {
      realTimeMetrics: {
        currentSales: 28,
        targetSales: 35,
        salesVelocity: 'Above target',
        currentReviews: 18,
        targetReviews: 25,
        reviewVelocity: 'Below target',
        currentRating: 4.1,
        targetRating: 4.3,
        organicRank: 145,
        targetRank: 50
      },
      performancePrediction: {
        day30Forecast: {
          sales: 890,
          reviews: 75,
          rating: 4.2,
          organicRank: 85,
          revenue: 19840,
          profitability: 35
        },
        day60Forecast: {
          sales: 1650,
          reviews: 185,
          rating: 4.3,
          organicRank: 45,
          revenue: 41250,
          profitability: 42
        },
        day90Forecast: {
          sales: 2200,
          reviews: 325,
          rating: 4.4,
          organicRank: 25,
          revenue: 65890,
          profitability: 48
        }
      },
      competitorTracking: {
        keyCompetitors: [
          {
            name: 'MUSICOZY',
            asin: 'B07SHBQY7Z',
            currentPrice: 26.99,
            priceChange: '+5.2%',
            ranking: 8,
            rankingChange: '+2',
            ppcSpend: 4500,
            organicShare: 42,
            threat: 'High'
          },
          {
            name: 'Perytong',
            asin: 'B07Q34GWQT',
            currentPrice: 24.99,
            priceChange: '-2.1%',
            ranking: 12,
            rankingChange: '-1',
            ppcSpend: 3200,
            organicShare: 28,
            threat: 'Medium'
          }
        ],
        marketIntelligence: {
          averageMarketPrice: 25.45,
          priceInflation: '+3.2%',
          newEntrants: 2,
          exitingBrands: 1,
          overallCompetition: 'Increasing'
        }
      },
      riskAssessment: {
        currentRisks: [
          { risk: 'Review velocity below target', severity: 'Medium', action: 'Increase follow-up campaigns' },
          { risk: 'Competitor price reduction', severity: 'Low', action: 'Monitor pricing strategy' },
          { risk: 'Inventory stockout risk', severity: 'Low', action: 'Prepare reorder schedule' }
        ],
        mitigationStrategies: [
          'Diversify traffic sources beyond PPC',
          'Implement review velocity acceleration',
          'Prepare competitive response plans'
        ]
      }
    },

    // Launch timeline with enhanced milestones
    timeline: [
      {
        week: 1,
        phase: 'Pre-Launch Preparation',
        description: 'Finalize listing, prepare inventory, set up campaigns',
        activities: [
          'Optimize listing with all images and A+ content',
          'Create detailed PPC campaigns with keyword research',
          'Set up review automation and follow-up sequences',
          'Prepare launch discount codes and promotions',
          'Configure analytics tracking and competitor monitoring'
        ],
        metrics: {
          sales: 0,
          reviews: 0,
          salesProgress: 0,
          reviewProgress: 0,
          organicRank: 0,
          ppcSpend: 0
        },
        checkpoints: ['Listing optimization score > 90%', 'PPC campaigns approved', 'Inventory confirmed']
      },
      {
        week: 4,
        phase: 'Launch & Momentum',
        description: 'Heavy promotions and PPC to drive initial velocity',
        activities: [
          'Activate 50% launch discount and lightning deals',
          'Run aggressive PPC campaigns across all match types',
          'Engage with early customers and collect reviews',
          'Monitor and adjust pricing based on performance',
          'Track competitor responses and adjust strategy'
        ],
        metrics: {
          sales: 35,
          reviews: 25,
          salesProgress: 35,
          reviewProgress: 17,
          organicRank: 145,
          ppcSpend: 3000
        },
        checkpoints: ['Sales velocity > 30 units/day', 'Review rating > 4.0', 'Organic rank improving']
      },
      {
        week: 8,
        phase: 'Optimization & Stabilization',
        description: 'Optimize campaigns and reduce dependence on discounts',
        activities: [
          'Gradually increase price towards target',
          'Optimize PPC for profitability (target ACoS < 65%)',
          'Focus on organic ranking improvements',
          'Implement upsell and cross-sell strategies',
          'Analyze and expand winning keyword campaigns'
        ],
        metrics: {
          sales: 30,
          reviews: 85,
          salesProgress: 60,
          reviewProgress: 57,
          organicRank: 85,
          ppcSpend: 2500
        },
        checkpoints: ['ACoS < 65%', 'Organic rank < 100', 'Review velocity stable']
      },
      {
        week: 12,
        phase: 'Growth & Scale',
        description: 'Achieve sustainable growth and profitability',
        activities: [
          'Reach target pricing with full profit margins',
          'Launch product variations and bundles',
          'Expand to international markets',
          'Build brand presence and customer loyalty',
          'Optimize for long-term profitability and growth'
        ],
        metrics: {
          sales: 25,
          reviews: 185,
          salesProgress: 100,
          reviewProgress: 100,
          organicRank: 45,
          ppcSpend: 2000
        },
        checkpoints: ['Target ACoS < 50%', 'Organic rank < 50', 'Profitability > 40%']
      }
    ],

    // Investment and ROI calculations
    investment: {
      initialInventory: 12000,
      marketingBudget: 6500,
      operationalCosts: 2500,
      totalLaunchCost: 21000,
      unitsOrdered: 1200,
      unitCost: 10.0,
      breakEvenAnalysis: {
        fixedCosts: 8500,
        variableCosts: 10.0,
        breakEvenUnits: 850,
        breakEvenDays: 75,
        paybackPeriod: 4.2
      },
      roiProjections: {
        month1: { revenue: 19840, profit: 3960, roi: 19 },
        month2: { revenue: 41250, profit: 12375, roi: 59 },
        month3: { revenue: 65890, profit: 23270, roi: 111 }
      }
    },

    // Promotions and incentives
    promotions: [
      {
        type: 'Launch Lightning Deal',
        discount: '50% OFF',
        duration: 'Week 1-2',
        target: 'All customers',
        goal: 'Build initial velocity',
        budget: 1500,
        expectedUnits: 300,
        expectedRevenue: 5991
      },
      {
        type: 'Early Bird Coupon',
        discount: '30% OFF',
        duration: 'Week 3-4',
        target: 'First-time buyers',
        goal: 'Maintain momentum',
        budget: 1200,
        expectedUnits: 200,
        expectedRevenue: 4598
      },
      {
        type: 'Review Incentive',
        discount: '15% OFF',
        duration: 'Week 5-8',
        target: 'Verified purchasers',
        goal: 'Accelerate reviews',
        budget: 800,
        expectedUnits: 150,
        expectedRevenue: 3297
      },
      {
        type: 'Subscribe & Save',
        discount: '20% OFF',
        duration: 'Ongoing',
        target: 'Repeat customers',
        goal: 'Build recurring revenue',
        budget: 500,
        expectedUnits: 100,
        expectedRevenue: 2399
      }
    ],

    // Launch checklist and crisis management
    launchChecklist: [
      { category: 'Listing', items: ['Title optimized', 'Images approved', 'A+ content live', 'Inventory confirmed'] },
      { category: 'PPC', items: ['Campaigns created', 'Keywords researched', 'Bids set', 'Budgets allocated'] },
      { category: 'Analytics', items: ['Tracking setup', 'Competitor monitoring', 'Review automation', 'Alerts configured'] },
      { category: 'Support', items: ['Customer service ready', 'FAQ prepared', 'Return policy set', 'Quality control verified'] }
    ],

    crisisManagement: {
      scenarios: [
        {
          crisis: 'Stockout during launch',
          indicators: ['Sales velocity > 40 units/day', 'Inventory < 30 days'],
          actions: ['Expedite reorder', 'Reduce PPC spend', 'Pause promotions', 'Communicate with customers'],
          severity: 'High'
        },
        {
          crisis: 'Negative review spike',
          indicators: ['Rating drops below 4.0', '> 20% negative reviews'],
          actions: ['Investigate product quality', 'Increase customer service', 'Respond to reviews', 'Adjust messaging'],
          severity: 'Medium'
        },
        {
          crisis: 'Competitor price war',
          indicators: ['Competitor prices drop > 20%', 'Sales velocity decreases'],
          actions: ['Analyze competitor strategy', 'Adjust pricing', 'Emphasize differentiation', 'Increase value perception'],
          severity: 'Medium'
        }
      ]
    }
  }
}