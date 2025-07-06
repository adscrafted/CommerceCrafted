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
    }
  },

  // Competition Analysis Data
  competitionData: {
    totalCompetitors: 127,
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
          'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        ],
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
          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop'
        ],
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
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        ],
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
      }
    ],
    priceDistribution: [
      { range: '$0-20', count: 34, percentage: 26.8 },
      { range: '$20-30', count: 52, percentage: 40.9 },
      { range: '$30-40', count: 28, percentage: 22.0 },
      { range: '$40+', count: 13, percentage: 10.2 }
    ],
    averageRating: 4.2,
    averageReviews: 3421,
    averagePrice: 27.99
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