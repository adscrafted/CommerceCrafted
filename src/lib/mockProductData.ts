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
        pain: 'Difficulty sleeping during the day',
        motivation: 'Block out light and noise while sleeping'
      },
      {
        name: 'Meditation Enthusiast',
        age: '30-55',
        pain: 'Distractions during meditation',
        motivation: 'Enhanced focus with guided audio'
      },
      {
        name: 'Frequent Traveler',
        age: '28-45',
        pain: 'Poor sleep on planes and in hotels',
        motivation: 'Portable comfort and entertainment'
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
              { keyword: 'bluetooth sleep mask', monthlyRevenue: 89000, monthlyOrders: 380, conversionRate: 12.5, aov: 29.99, cpc: 1.23, difficulty: 68 },
              { keyword: 'bluetooth sleep headphones', monthlyRevenue: 34000, monthlyOrders: 140, conversionRate: 11.8, aov: 28.50, cpc: 1.15, difficulty: 65 },
              { keyword: 'bluetooth headband sleep', monthlyRevenue: 22000, monthlyOrders: 80, conversionRate: 13.2, aov: 27.50, cpc: 1.35, difficulty: 72 }
            ]
          },
          'Wireless Keywords': {
            totalRevenue: 89000,
            totalOrders: 380,
            avgConversionRate: 11.9,
            avgCPC: 1.08,
            keywords: [
              { keyword: 'wireless sleep mask', monthlyRevenue: 45000, monthlyOrders: 200, conversionRate: 11.9, aov: 28.50, cpc: 1.15, difficulty: 62 },
              { keyword: 'wireless sleep headphones', monthlyRevenue: 28000, monthlyOrders: 120, conversionRate: 12.1, aov: 26.99, cpc: 1.05, difficulty: 58 },
              { keyword: 'wireless headband sleep', monthlyRevenue: 16000, monthlyOrders: 60, conversionRate: 11.5, aov: 25.99, cpc: 1.02, difficulty: 55 }
            ]
          },
          'Smart Keywords': {
            totalRevenue: 64000,
            totalOrders: 290,
            avgConversionRate: 11.8,
            avgCPC: 0.98,
            keywords: [
              { keyword: 'smart sleep mask', monthlyRevenue: 32000, monthlyOrders: 140, conversionRate: 11.8, aov: 24.99, cpc: 0.98, difficulty: 60 },
              { keyword: 'smart sleep headphones', monthlyRevenue: 19000, monthlyOrders: 85, conversionRate: 12.0, aov: 23.99, cpc: 0.95, difficulty: 58 },
              { keyword: 'smart headband sleep', monthlyRevenue: 13000, monthlyOrders: 65, conversionRate: 11.5, aov: 22.99, cpc: 1.02, difficulty: 52 }
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
              { keyword: 'sleep mask side sleepers', monthlyRevenue: 45000, monthlyOrders: 220, conversionRate: 11.5, aov: 24.99, cpc: 0.95, difficulty: 48 },
              { keyword: 'headphones side sleepers', monthlyRevenue: 28000, monthlyOrders: 130, conversionRate: 11.0, aov: 23.99, cpc: 0.88, difficulty: 45 },
              { keyword: 'sleep headband side sleepers', monthlyRevenue: 16000, monthlyOrders: 70, conversionRate: 10.8, aov: 22.99, cpc: 0.92, difficulty: 42 }
            ]
          },
          'Comfort Keywords': {
            totalRevenue: 67000,
            totalOrders: 300,
            avgConversionRate: 10.4,
            avgCPC: 0.85,
            keywords: [
              { keyword: 'comfortable sleep mask', monthlyRevenue: 34000, monthlyOrders: 160, conversionRate: 10.8, aov: 21.99, cpc: 0.88, difficulty: 40 },
              { keyword: 'soft sleep headphones', monthlyRevenue: 21000, monthlyOrders: 95, conversionRate: 10.2, aov: 20.99, cpc: 0.82, difficulty: 38 },
              { keyword: 'comfortable sleep headband', monthlyRevenue: 12000, monthlyOrders: 45, conversionRate: 9.8, aov: 19.99, cpc: 0.85, difficulty: 35 }
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
    }
  },

  // Launch Strategy Data
  launchStrategyData: {
    pricing: {
      launchPrice: 19.97,
      regularPrice: 29.99,
      discount: 33
    },
    targetMetrics: {
      dailySalesVelocity: 30,
      reviewsNeeded: 150,
      targetRating: 4.3,
      conversionRate: 15,
      estimatedBSR: 8500
    },
    timeline: [
      {
        week: 1,
        phase: 'Pre-Launch Preparation',
        description: 'Finalize listing, prepare inventory, set up campaigns',
        activities: [
          'Optimize listing with all images and A+ content',
          'Create auto and manual PPC campaigns',
          'Set up review automation sequences',
          'Prepare launch discount codes'
        ],
        metrics: {
          sales: 0,
          reviews: 0,
          salesProgress: 0,
          reviewProgress: 0
        }
      },
      {
        week: 4,
        phase: 'Launch & Momentum',
        description: 'Heavy promotions and PPC to drive initial velocity',
        activities: [
          'Activate 50% launch discount',
          'Run aggressive PPC campaigns',
          'Engage with early customers',
          'Monitor and adjust pricing'
        ],
        metrics: {
          sales: 35,
          reviews: 25,
          salesProgress: 35,
          reviewProgress: 17
        }
      },
      {
        week: 8,
        phase: 'Stabilization',
        description: 'Reduce discounts, optimize for profitability',
        activities: [
          'Gradually increase price to target',
          'Optimize PPC for ACoS targets',
          'Focus on organic ranking',
          'Implement upsell strategies'
        ],
        metrics: {
          sales: 30,
          reviews: 75,
          salesProgress: 60,
          reviewProgress: 50
        }
      },
      {
        week: 12,
        phase: 'Growth & Scale',
        description: 'Achieve sustainable growth and profitability',
        activities: [
          'Launch variation products',
          'Expand to international markets',
          'Build brand presence',
          'Optimize for long-term profitability'
        ],
        metrics: {
          sales: 25,
          reviews: 150,
          salesProgress: 100,
          reviewProgress: 100
        }
      }
    ],
    investment: {
      initialInventory: 8500,
      marketingBudget: 4500,
      totalLaunchCost: 15000,
      unitsOrdered: 1000,
      breakEvenDays: 90
    },
    ppcStrategy: {
      totalBudget: 4500,
      campaigns: [
        {
          type: 'Sponsored Products Auto',
          dailyBudget: 25,
          targetAcos: 70,
          bidStrategy: 'Dynamic Down Only',
          priority: 'High',
          keywords: 85
        },
        {
          type: 'Sponsored Products Manual',
          dailyBudget: 35,
          targetAcos: 50,
          bidStrategy: 'Fixed Bids',
          priority: 'High',
          keywords: 120
        },
        {
          type: 'Sponsored Brands',
          dailyBudget: 15,
          targetAcos: 40,
          bidStrategy: 'Portfolio Bid+',
          priority: 'Medium',
          keywords: 25
        }
      ]
    },
    promotions: [
      {
        type: 'Lightning Deal',
        discount: '50% OFF',
        duration: 'Week 1-2',
        target: 'All customers',
        goal: 'Drive initial velocity'
      },
      {
        type: 'Coupon',
        discount: '30% OFF',
        duration: 'Week 3-4',
        target: 'New customers',
        goal: 'Maintain momentum'
      },
      {
        type: 'Subscribe & Save',
        discount: '15% OFF',
        duration: 'Ongoing',
        target: 'Repeat buyers',
        goal: 'Build recurring revenue'
      }
    ]
  }
}