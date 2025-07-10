// Comprehensive mock data for niche analysis pages
export const mockNicheData = {
  id: 'smart-sleep-accessories',
  slug: 'smart-sleep-accessories',
  nicheName: 'Smart Sleep Accessories',
  category: 'Health & Personal Care',
  subcategory: 'Sleep & Relaxation',
  createdAt: '2025-01-15',
  updatedAt: '2025-01-15',
  
  // Overall scores and metrics
  opportunityScore: 89,
  scores: {
    demand: 92,
    competition: 78,
    keywords: 85,
    listing: 82,
    intelligence: 88,
    launch: 90,
    financial: 91,
    overall: 89
  },
  
  // Market Overview
  marketOverview: {
    totalMarketSize: 2400000000, // $2.4B
    nicheMarketSize: 180000000, // $180M
    marketGrowth: '+28%',
    avgSellingPrice: 34.99,
    totalProducts: 1247,
    topBrands: ['SleepWell', 'DreamTech', 'NightGuard', 'RestfulTech', 'SoundSleep'],
    totalMonthlyRevenue: 15000000,
    avgMonthlyUnitsSold: 428571
  },
  
  // Top Products in Niche
  topProducts: [
    {
      asin: 'B08MVBRNKV',
      title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
      price: 29.99,
      rating: 4.3,
      reviews: 12847,
      monthlyRevenue: 387000,
      bsr: 847,
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop'
    },
    {
      asin: 'B07XQVK9PL',
      title: 'White Noise Machine with Smart App Control',
      price: 49.99,
      rating: 4.5,
      reviews: 8932,
      monthlyRevenue: 446000,
      bsr: 623,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop'
    },
    {
      asin: 'B09KGPXM7N',
      title: 'Smart Sleep Tracking Pillow with Vibration Alarm',
      price: 89.99,
      rating: 4.1,
      reviews: 3421,
      monthlyRevenue: 307000,
      bsr: 1534,
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200&h=200&fit=crop'
    }
  ],
  
  // Intelligence Analysis Data
  intelligenceData: {
    sentimentScore: 4.2,
    totalReviews: 187543,
    reviewGrowth: '+45%',
    commonComplaints: [
      { issue: 'Battery life too short', frequency: 23, impact: 'High' },
      { issue: 'Bluetooth connectivity issues', frequency: 18, impact: 'Medium' },
      { issue: 'Not comfortable for side sleepers', frequency: 15, impact: 'High' },
      { issue: 'Sound quality could be better', frequency: 12, impact: 'Low' }
    ],
    opportunities: [
      {
        opportunity: 'Extended battery life (24+ hours)',
        potentialImpact: 'Capture 35% of negative reviews',
        implementation: 'Use high-capacity lithium polymer battery'
      },
      {
        opportunity: 'Side-sleeper specific design',
        potentialImpact: 'Target underserved 40% of market',
        implementation: 'Ergonomic cutouts and flexible speakers'
      },
      {
        opportunity: 'Premium materials for sensitive skin',
        potentialImpact: 'Justify 50% price premium',
        implementation: 'Hypoallergenic bamboo fabric'
      }
    ],
    customerAvatars: [
      {
        name: 'Night Shift Worker',
        percentage: 35,
        avgSpend: 42.99,
        keyNeeds: ['Complete darkness', 'Noise blocking', 'Comfortable for day sleep'],
        preferredFeatures: ['Bluetooth audio', 'Contoured design', 'Breathable fabric']
      },
      {
        name: 'Meditation Enthusiast',
        percentage: 25,
        avgSpend: 58.99,
        keyNeeds: ['Guided meditation audio', 'Comfortable for long sessions', 'App integration'],
        preferredFeatures: ['High-quality speakers', 'Timer function', 'Multiple connectivity options']
      },
      {
        name: 'Frequent Traveler',
        percentage: 20,
        avgSpend: 39.99,
        keyNeeds: ['Portable', 'Airplane compatible', 'Quick charging'],
        preferredFeatures: ['Compact case', 'USB-C charging', 'Noise cancellation']
      }
    ]
  },
  
  // Demand Analysis Data
  demandData: {
    monthlySearchVolume: 248000,
    searchTrend: '+28%',
    yearOverYearGrowth: '+45%',
    conversionRate: 14.2,
    clickShare: 38,
    seasonality: {
      jan: 100, feb: 95, mar: 85, apr: 80, may: 75, jun: 70,
      jul: 65, aug: 70, sep: 80, oct: 85, nov: 95, dec: 115
    },
    trendingKeywords: [
      { keyword: 'smart sleep mask', volume: 45000, trend: '+65%' },
      { keyword: 'bluetooth sleep headphones', volume: 38000, trend: '+42%' },
      { keyword: 'sleep mask with speakers', volume: 31000, trend: '+38%' },
      { keyword: 'meditation sleep mask', volume: 28000, trend: '+55%' }
    ],
    geographicDemand: [
      { region: 'California', percentage: 18, growth: '+32%' },
      { region: 'New York', percentage: 15, growth: '+28%' },
      { region: 'Texas', percentage: 12, growth: '+45%' },
      { region: 'Florida', percentage: 10, growth: '+38%' }
    ]
  },
  
  // Competition Analysis Data
  competitionData: {
    totalCompetitors: 127,
    newEntrantsMonthly: 8,
    averageRating: 4.2,
    averageReviews: 2847,
    averagePrice: 34.99,
    priceRange: { min: 15.99, max: 89.99 },
    topCompetitors: [
      {
        brand: 'SleepWell',
        marketShare: 22,
        avgPrice: 39.99,
        avgRating: 4.4,
        totalProducts: 12,
        strengths: ['Brand recognition', 'Premium quality'],
        weaknesses: ['Higher price point', 'Limited features']
      },
      {
        brand: 'DreamTech',
        marketShare: 18,
        avgPrice: 29.99,
        avgRating: 4.2,
        totalProducts: 8,
        strengths: ['Affordable pricing', 'Good battery life'],
        weaknesses: ['Build quality issues', 'Basic features']
      }
    ],
    competitiveAdvantages: [
      'First to market with 48-hour battery life',
      'Patented side-sleeper comfort technology',
      'Premium hypoallergenic materials',
      'Advanced app with sleep coaching'
    ]
  },
  
  // Keywords Analysis Data
  keywordsData: {
    totalKeywords: 248,
    primaryKeyword: {
      keyword: 'smart sleep mask',
      monthlyVolume: 45000,
      cpc: 1.23,
      competition: 'Medium',
      conversionRate: 15.8
    },
    longTailKeywords: [
      {
        keyword: 'bluetooth sleep mask for side sleepers',
        volume: 8500,
        cpc: 0.87,
        competition: 'Low',
        conversionRate: 18.2
      },
      {
        keyword: 'sleep mask with built in headphones',
        volume: 12000,
        cpc: 1.15,
        competition: 'Medium',
        conversionRate: 16.5
      },
      {
        keyword: 'smart sleep mask with app',
        volume: 6800,
        cpc: 1.45,
        competition: 'Low',
        conversionRate: 19.1
      }
    ],
    keywordRevenue: 687000,
    recommendedBudget: 125,
    estimatedACoS: 22
  },
  
  // Financial Analysis Data
  financialData: {
    avgSellingPrice: 39.99,
    costOfGoods: 8.50,
    amazonFees: 11.20,
    netProfit: 20.29,
    profitMargin: 50.7,
    monthlyProjections: {
      units: 2500,
      revenue: 99975,
      profit: 50725,
      roi: 238
    },
    investmentRequired: {
      initialInventory: 21250,
      photography: 2500,
      branding: 3500,
      ppcLaunch: 3750,
      total: 31000
    },
    breakEvenTimeline: 75, // days
    yearOneProjection: {
      revenue: 1199700,
      profit: 608700,
      units: 30000
    }
  },
  
  // Listing Optimization Data
  listingData: {
    recommendedTitle: 'Smart Bluetooth Sleep Mask with Ultra-Thin Speakers - 48Hr Battery, Side Sleeper Design, App Control, Meditation & White Noise, 100% Blackout Eye Mask for Sleeping',
    bulletPoints: [
      '48-HOUR BATTERY LIFE: Industry-leading battery lasts 2 full nights on single charge, with USB-C fast charging in just 2 hours',
      'SIDE SLEEPER COMFORT: Patented ultra-thin speakers (4mm) with ergonomic cutouts eliminate pressure points for all sleep positions',
      'PREMIUM SLEEP APP: Control volume, set sleep timers, access 100+ sleep sounds, guided meditations, and track sleep quality',
      '100% BLACKOUT DESIGN: Contoured 3D eye cups with adjustable nose bridge ensure zero light leakage for deeper REM sleep',
      'HYPOALLERGENIC LUXURY: Breathable bamboo fabric prevents overheating, machine washable, includes travel case & earplugs'
    ],
    backendKeywords: [
      'bluetooth sleep headphones',
      'sleep mask with speakers',
      'meditation eye mask',
      'travel sleep accessories',
      'night shift sleep mask'
    ],
    mainImageRecommendations: [
      'Hero shot showing mask on model in bed',
      'Lifestyle image highlighting thin speakers',
      'App interface showcasing features',
      'Size comparison with competitor products',
      'Included accessories spread'
    ]
  },
  
  // Launch Strategy Data
  launchData: {
    launchPrice: 24.99,
    regularPrice: 39.99,
    launchBudget: {
      inventory: 21250,
      photography: 2500,
      ppc: 3750,
      giveaways: 2500,
      influencers: 5000,
      total: 35000
    },
    week1Strategy: {
      price: 24.99,
      ppcBudget: 125,
      targetSales: 50,
      giveaways: 100,
      focus: 'Generate initial reviews and sales velocity'
    },
    week2to4Strategy: {
      price: 29.99,
      ppcBudget: 175,
      targetSales: 300,
      focus: 'Scale PPC, optimize campaigns, gather feedback'
    },
    week5to12Strategy: {
      price: 34.99,
      ppcBudget: 225,
      targetSales: 800,
      focus: 'Achieve page 1 ranking, expand keywords'
    },
    milestones: [
      { week: 1, target: '50 sales, 10 reviews' },
      { week: 4, target: '350 sales, 50 reviews, Page 2 ranking' },
      { week: 8, target: '1000 sales, 150 reviews, Page 1 ranking' },
      { week: 12, target: '2000 sales, 300 reviews, Top 10 BSR' }
    ]
  }
}

// Helper function to generate slug from niche name
export function generateNicheSlug(nicheName: string): string {
  return nicheName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to get niche data by slug
export function getNicheBySlug(slug: string) {
  // In a real app, this would fetch from database
  // For now, return mock data if slug matches
  if (slug === mockNicheData.slug) {
    return mockNicheData
  }
  
  // Return modified mock data for any other slug
  return {
    ...mockNicheData,
    slug,
    nicheName: slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
}