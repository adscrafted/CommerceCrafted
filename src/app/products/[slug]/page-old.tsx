'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  TrendingUp, 
  DollarSign, 
  Target,
  Users,
  BarChart3,
  Heart,
  Share2,
  Activity,
  MessageSquare,
  Search,
  UserCheck,
  FileText,
  Globe,
  Sparkles,
  ArrowUp,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Crown,
  CheckCircle,
  Download,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import KeywordNetwork from '@/components/KeywordNetwork'
import Link from 'next/link'
import { useAmazonSearchTerms } from '@/hooks/useAmazonSearchTerms'
import { MembershipGate } from '@/components/MembershipGate'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// Mock data for the daily product
const dailyProductData = {
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
    },
    keywordClusters: {
      technology: {
        root: 'bluetooth sleep mask',
        subroots: ['bluetooth', 'wireless', 'smart'],
        keywords: ['bluetooth sleep mask', 'wireless sleep mask', 'smart sleep mask']
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
    monthlyProjections: {
      revenue: 52000,
      profit: 18200,
      units: 1735
    },
    monthlyOrders: 1735,
    monthlyClicks: 13880,
    avgConversionRate: 12.5,
    keywordDepthGrade: 'A-',
    annualizedRevenue: 624000,
    annualizedProfit: 218400,
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
  }
}

// Generate sample keyword metrics for demonstration
const generateKeywordMetrics = (baseVolume: number) => {
  const monthlyClicks = Math.round(baseVolume * 0.8)
  const conversionRate = (2.5 + Math.random() * 5).toFixed(1)
  const monthlyOrders = Math.round(monthlyClicks * (parseFloat(conversionRate) / 100))
  const avgOrderValue = 28.99
  const monthlyRevenue = monthlyOrders * avgOrderValue
  return { monthlyClicks, conversionRate, monthlyOrders, monthlyRevenue }
}

// Keyword Pivot Table Component
const KeywordPivotTable = ({ keywordHierarchy }: { keywordHierarchy: any }) => {
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set())
  const [expandedSubroots, setExpandedSubroots] = useState<Set<string>>(new Set())

  const toggleRoot = (rootName: string) => {
    const newExpanded = new Set(expandedRoots)
    if (newExpanded.has(rootName)) {
      newExpanded.delete(rootName)
      // Also collapse all subroots under this root
      const newExpandedSubroots = new Set(expandedSubroots)
      Object.keys(keywordHierarchy[rootName].subroots).forEach(subroot => {
        newExpandedSubroots.delete(`${rootName}-${subroot}`)
      })
      setExpandedSubroots(newExpandedSubroots)
    } else {
      newExpanded.add(rootName)
    }
    setExpandedRoots(newExpanded)
  }

  const toggleSubroot = (rootName: string, subrootName: string) => {
    const key = `${rootName}-${subrootName}`
    const newExpanded = new Set(expandedSubroots)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSubroots(newExpanded)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-6 font-medium text-gray-900">Keyword Group</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Revenue</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Orders</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Conv. Rate</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Avg CPC</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(keywordHierarchy).map(([rootName, rootData]: [string, any]) => (
            <React.Fragment key={rootName}>
              {/* Root Level */}
              <tr className="border-b bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => toggleRoot(rootName)}>
                <td className="py-3 px-6">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {expandedRoots.has(rootName) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">{rootName}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-green-600">${rootData.totalRevenue.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">{rootData.totalOrders.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">{rootData.avgConversionRate}%</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">${rootData.avgCPC}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-500">-</span>
                </td>
              </tr>

              {/* Subroot Level */}
              {expandedRoots.has(rootName) && Object.entries(rootData.subroots).map(([subrootName, subrootData]: [string, any]) => (
                <React.Fragment key={`${rootName}-${subrootName}`}>
                  <tr className="border-b bg-green-50 hover:bg-green-100 cursor-pointer" onClick={() => toggleSubroot(rootName, subrootName)}>
                    <td className="py-3 px-6">
                      <div className="flex items-center">
                        <div className="ml-6 mr-2">
                          {expandedSubroots.has(`${rootName}-${subrootName}`) ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{subrootName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">${subrootData.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{subrootData.totalOrders.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{subrootData.avgConversionRate}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">${subrootData.avgCPC}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-500">-</span>
                    </td>
                  </tr>

                  {/* Leaf Keywords */}
                  {expandedSubroots.has(`${rootName}-${subrootName}`) && subrootData.keywords.map((keyword: any, index: number) => (
                    <tr key={`${rootName}-${subrootName}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <div className="ml-12">
                          <span className="text-gray-700">{keyword.keyword}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600">${keyword.monthlyRevenue.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{keyword.monthlyOrders.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{keyword.conversionRate}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">${keyword.cpc}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${keyword.difficulty >= 70 ? 'bg-red-500' : keyword.difficulty >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${keyword.difficulty}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{keyword.difficulty}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ProductPage({ params }: ProductPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [cogsPercentage, setCogsPercentage] = useState(25)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isClaimHovered, setIsClaimHovered] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [activeTab, setActiveTab] = useState('demand')
  
  // Get main keywords for Google Trends
  const mainKeywords = [
    'bluetooth sleep mask',
    'sleep headphones',
    'sleep mask with speakers',
    'wireless sleep mask',
    'sleeping headphones'
  ]
  
  // Fetch Amazon Search Terms data
  const { data: searchTermsData, loading: searchTermsLoading, error: searchTermsError } = useAmazonSearchTerms(mainKeywords, 4, !loading)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      // Simulate loading delay
      setTimeout(() => setLoading(false), 500)
    }

    loadData()
  }, [params])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveAnalysis = async () => {
    if (isSaved) return
    
    try {
      // In a real app, this would save to user's account
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSaved(true)
      
      // Show success message
      setTimeout(() => {
        alert('Analysis saved to your account!')
      }, 100)
    } catch (error) {
      alert('Failed to save analysis. Please try again.')
    }
  }

  const handleShareReport = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: dailyProductData.title,
          text: `Check out this Amazon product opportunity with a ${dailyProductData.opportunityScore} opportunity score!`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = window.location.href
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Link copied to clipboard!')
    } finally {
      setIsSharing(false)
    }
  }


  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  // Calculate financial metrics based on COGS percentage
  const calculateFinancials = () => {
    const sellingPrice = dailyProductData.financialData.avgSellingPrice
    const cogs = sellingPrice * (cogsPercentage / 100)
    const amazonFees = dailyProductData.financialData.totalFees
    const ppcCost = 3.20 // avg per unit
    const netProfit = sellingPrice - cogs - amazonFees - ppcCost
    const profitMargin = (netProfit / sellingPrice) * 100
    
    return {
      cogs: cogs.toFixed(2),
      netProfit: netProfit.toFixed(2),
      profitMargin: profitMargin.toFixed(1)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user is authenticated
  if (status === 'unauthenticated' || !session) {
    return <MembershipGate productTitle={dailyProductData.title} productImage={dailyProductData.imageUrl} />
  }

  // Check if user has appropriate subscription tier
  const userTier = session.user?.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={dailyProductData.title} productImage={dailyProductData.imageUrl} />
  }

  // Calculate financial metrics - after all early returns
  const financials = calculateFinancials()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Daily Amazon Opportunity
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {dailyProductData.date}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{dailyProductData.title}</h1>
              <p className="text-xl mb-6 text-blue-100">{dailyProductData.subtitle}</p>
              
              {/* Overall Score */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-300 mb-2">
                    {dailyProductData.opportunityScore}
                  </div>
                  <div className="text-sm text-blue-100">Opportunity Score</div>
                </div>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{dailyProductData.scores.demand}</div>
                    <div className="text-xs text-blue-100">Demand</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300">{dailyProductData.scores.competition}</div>
                    <div className="text-xs text-blue-100">Competition</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">{dailyProductData.scores.keywords}</div>
                    <div className="text-xs text-blue-100">Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">{dailyProductData.scores.financial}</div>
                    <div className="text-xs text-blue-100">Financial</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleSaveAnalysis}
                  disabled={isSaved}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                  {isSaved ? 'Saved!' : 'Save Analysis'}
                </Button>
                <Button 
                  onClick={handleShareReport}
                  disabled={isSharing}
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {isSharing ? 'Sharing...' : 'Share Report'}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link href={`https://amazon.com/dp/${dailyProductData.asin}`} target="_blank">
                    <Globe className="h-4 w-4 mr-2" />
                    View on Amazon
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Product Image */}
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={dailyProductData.mainImage}
                  alt={dailyProductData.title}
                  className="rounded-lg shadow-2xl max-w-sm w-full"
                />
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black rounded-full p-3">
                  <Crown className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${dailyProductData.demandData.monthlySearchVolume.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Searches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                ${dailyProductData.financialData.monthlyProjections.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Est. Monthly Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ${dailyProductData.financialData.avgSellingPrice}
              </div>
              <div className="text-sm text-gray-600">Avg. Selling Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {dailyProductData.competitionData.totalCompetitors}
              </div>
              <div className="text-sm text-gray-600">Total Competitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="demand" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Demand</span>
            </TabsTrigger>
            <TabsTrigger value="competition" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Competition</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="listing" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Listing</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="launch" className="flex items-center space-x-2">
              <ArrowUp className="h-4 w-4" />
              <span className="hidden sm:inline">Launch</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
          </TabsList>

          {/* Demand Analysis Tab */}
          <TabsContent value="demand" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Market Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span>Market Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dailyProductData.demandData.monthlySearchVolume.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Searches</div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        {dailyProductData.demandData.searchTrend} YoY
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${(dailyProductData.demandData.marketSize / 1000000000).toFixed(1)}B
                      </div>
                      <div className="text-sm text-gray-600">Market Size</div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        {dailyProductData.demandData.marketGrowth} Growth
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {dailyProductData.demandData.conversionRate}%
                      </div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {dailyProductData.demandData.clickShare}%
                      </div>
                      <div className="text-sm text-gray-600">Click Share</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Search Trend (12 Months)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <div className="flex items-end justify-between h-full space-x-1">
                      {dailyProductData.demandData.googleTrends.map((point, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-full mb-2"
                            style={{ height: `${(point.value / 100) * 200}px` }}
                          ></div>
                          <div className="text-xs text-gray-600 transform -rotate-45">
                            {point.month}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Signals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                  <span>Social Media Signals</span>
                </CardTitle>
                <CardDescription>
                  Social media buzz and engagement around this product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-pink-50 to-red-50">
                    <div className="text-3xl mb-2">📱</div>
                    <div className="font-semibold text-gray-900">TikTok</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>{dailyProductData.demandData.socialSignals.tiktok.posts.toLocaleString()} posts</div>
                      <div>{(dailyProductData.demandData.socialSignals.tiktok.views / 1000000).toFixed(1)}M views</div>
                      <div className="text-xs text-green-600 font-medium">
                        {dailyProductData.demandData.socialSignals.tiktok.engagement} engagement
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="text-3xl mb-2">📸</div>
                    <div className="font-semibold text-gray-900">Instagram</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>{dailyProductData.demandData.socialSignals.instagram.posts.toLocaleString()} posts</div>
                      <div className="text-xs text-green-600 font-medium">
                        {dailyProductData.demandData.socialSignals.instagram.engagement} engagement
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-red-50 to-orange-50">
                    <div className="text-3xl mb-2">📺</div>
                    <div className="font-semibold text-gray-900">YouTube</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>{dailyProductData.demandData.socialSignals.youtube.videos} videos</div>
                      <div>{dailyProductData.demandData.socialSignals.youtube.avgViews.toLocaleString()} avg views</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50">
                    <div className="text-3xl mb-2">💬</div>
                    <div className="font-semibold text-gray-900">Reddit</div>
                    <div className="text-sm text-gray-600 mt-2">
                      <div>{dailyProductData.demandData.socialSignals.reddit.discussions} discussions</div>
                      <div className="text-xs text-green-600 font-medium capitalize">
                        {dailyProductData.demandData.socialSignals.reddit.sentiment} sentiment
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competition Analysis Tab */}
          <TabsContent value="competition" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Competition Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-red-600" />
                    <span>Competition Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {dailyProductData.competitionData.totalCompetitors}
                    </div>
                    <div className="text-sm text-gray-600">Total Competitors</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {dailyProductData.competitionData.averageRating}
                      </div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        ${dailyProductData.competitionData.averagePrice}
                      </div>
                      <div className="text-sm text-gray-600">Avg Price</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {dailyProductData.competitionData.averageReviews.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Avg Reviews</div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Distribution */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span>Price Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailyProductData.competitionData.priceDistribution.map((range, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium text-gray-600">
                          {range.range}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-6">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${range.percentage}%` }}
                              >
                                <span className="text-white text-xs font-medium">
                                  {range.percentage}%
                                </span>
                              </div>
                            </div>
                            <div className="w-16 text-sm text-gray-600">
                              {range.count} items
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Competitors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <span>Top 3 Competitors</span>
                </CardTitle>
                <CardDescription>
                  Leading products in this space and their performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dailyProductData.competitionData.topCompetitors.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                      <div className="grid md:grid-cols-4 gap-6">
                        {/* Product Info */}
                        <div className="md:col-span-1">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <img 
                                src={competitor.mainImage}
                                alt={competitor.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  #{competitor.rank}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                                {competitor.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">
                                ASIN: {competitor.asin}
                              </p>
                              <div className="flex items-center space-x-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < Math.floor(competitor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  ({competitor.reviews.toLocaleString()})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Financial Metrics */}
                        <div className="md:col-span-1">
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-gray-600">Price</div>
                              <div className="text-lg font-bold text-green-600">${competitor.price}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Monthly Revenue</div>
                              <div className="text-sm font-semibold text-blue-600">
                                ${competitor.monthlyRevenue.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Conversion Rate</div>
                              <div className="text-sm font-medium">{competitor.conversionRate}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="md:col-span-1">
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-gray-600">Monthly Orders</div>
                              <div className="text-sm font-semibold text-purple-600">
                                {competitor.monthlyOrders.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Monthly Clicks</div>
                              <div className="text-sm font-medium">
                                {competitor.monthlyClicks.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Keyword Strength</div>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{ width: `${(competitor.keywordStrength / 30) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{competitor.keywordStrength}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Images */}
                        <div className="md:col-span-1">
                          <div className="text-xs text-gray-600 mb-2">Product Images</div>
                          <div className="grid grid-cols-2 gap-1">
                            {competitor.images.slice(0, 4).map((image, imgIndex) => (
                              <img 
                                key={imgIndex}
                                src={image}
                                alt={`${competitor.name} ${imgIndex + 1}`}
                                className="w-full h-12 rounded object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Listing Details */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="mb-3">
                          <div className="text-xs text-gray-600 mb-1">Product Title</div>
                          <div className="text-sm text-gray-900 font-medium line-clamp-2">
                            {competitor.listing.title}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-600 mb-2">Key Features</div>
                            <ul className="space-y-1">
                              {competitor.listing.bulletPoints.slice(0, 3).map((point, pointIndex) => (
                                <li key={pointIndex} className="text-xs text-gray-700 flex items-start space-x-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-600 mb-2">Target Keywords</div>
                            <div className="flex flex-wrap gap-1">
                              {competitor.listing.keywords.map((keyword, keywordIndex) => (
                                <Badge key={keywordIndex} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Analysis Tab */}
          <TabsContent value="keywords" className="space-y-6">
            {/* Keyword Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Primary Keyword</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    {dailyProductData.keywordsData.primaryKeyword}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${dailyProductData.keywordsData.cpc} CPC
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Competition Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-yellow-600 mb-1">
                    {dailyProductData.keywordsData.competition}
                  </div>
                  <div className="text-sm text-gray-600">
                    PPC Competition
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-green-600 mb-1">
                    ${Object.values(dailyProductData.keywordsData.keywordHierarchy).reduce((sum: number, root: any) => sum + root.totalRevenue, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Monthly Potential
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {Object.values(dailyProductData.keywordsData.keywordHierarchy).reduce((sum: number, root: any) => sum + root.totalOrders, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Monthly Potential
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Keyword Hierarchy Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Keyword Analysis Hierarchy</span>
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of keyword opportunities by category and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordPivotTable keywordHierarchy={dailyProductData.keywordsData.keywordHierarchy} />
              </CardContent>
            </Card>

            {/* Keyword Network Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>Keyword Network & Opportunities</span>
                </CardTitle>
                <CardDescription>
                  Interactive visualization of keyword relationships and market opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <KeywordNetwork />
                </div>
              </CardContent>
            </Card>

            {/* Amazon Search Terms Integration */}
            {searchTermsData && Array.isArray(searchTermsData) && searchTermsData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Real-Time Amazon Search Data</span>
                  </CardTitle>
                  <CardDescription>
                    Live search term data from Amazon's API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchTermsData.slice(0, 6).map((term: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                        <div className="font-medium text-gray-900 mb-2">{term.keyword}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Search Volume:</span>
                            <span className="font-medium">{term.searchVolume?.toLocaleString() || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Competition:</span>
                            <span className="font-medium">{term.competition || 'Medium'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">CPC:</span>
                            <span className="font-medium">${term.cpc || '1.25'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Listing Optimization Tab */}
          <TabsContent value="listing" className="space-y-6">
            {/* Title Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Title Optimization</span>
                </CardTitle>
                <CardDescription>
                  Recommendations for optimizing your Amazon product title
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Current Pattern:</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {dailyProductData.listingOptimizationData.titleOptimization.currentPattern}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Suggested Title:</div>
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded font-medium">
                    {dailyProductData.listingOptimizationData.titleOptimization.suggestedTitle}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Key Recommendations:</div>
                  <ul className="space-y-1">
                    {dailyProductData.listingOptimizationData.titleOptimization.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Image Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-purple-600" />
                  <span>Image Optimization Strategy</span>
                </CardTitle>
                <CardDescription>
                  Position-by-position image recommendations based on competitor analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(dailyProductData.listingOptimizationData.imageAnalysis).map(([position, data]: [string, any]) => (
                    <div key={position} className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                            Image {position.replace('position', 'Position ')}
                          </h3>
                          
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Creative Brief:</div>
                            <p className="text-sm text-gray-600">{data.creativeBrief}</p>
                          </div>
                          
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Common Themes:</div>
                            <div className="flex flex-wrap gap-1">
                              {data.commonThemes.map((theme: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Optimization Tips:</div>
                            <ul className="space-y-1">
                              {data.optimizationTips.map((tip: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-1" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Competitor Examples:</div>
                          {data.competitorImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {data.competitorImages.map((image: string, index: number) => (
                                <img 
                                  key={index}
                                  src={image}
                                  alt={`Competitor example ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No competitor examples available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bullet Point Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Bullet Point Optimization</span>
                </CardTitle>
                <CardDescription>
                  Structure and recommendations for compelling bullet points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Recommended Structure:</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {dailyProductData.listingOptimizationData.bulletPointOptimization.structure}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Key Recommendations:</div>
                  <ul className="space-y-2">
                    {dailyProductData.listingOptimizationData.bulletPointOptimization.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* A+ Content Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  <span>A+ Content Strategy</span>
                </CardTitle>
                <CardDescription>
                  Recommendations for creating high-converting Amazon A+ content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Module Recommendations</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                        <div className="font-medium text-gray-900 mb-2">Hero Banner Module</div>
                        <p className="text-sm text-gray-600 mb-2">
                          Showcase product in use with lifestyle imagery showing peaceful sleep
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• 970x600px minimum resolution</li>
                          <li>• Include benefit callouts</li>
                          <li>• Show product in context</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="font-medium text-gray-900 mb-2">Comparison Chart Module</div>
                        <p className="text-sm text-gray-600 mb-2">
                          Compare your product features against generic alternatives
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Highlight unique features</li>
                          <li>• Use checkmarks for advantages</li>
                          <li>• Include 3-4 competitors</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="font-medium text-gray-900 mb-2">Technical Details Module</div>
                        <p className="text-sm text-gray-600 mb-2">
                          Detailed specifications with infographic style presentation
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Battery life visualization</li>
                          <li>• Bluetooth range diagram</li>
                          <li>• Material breakdown</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Content Best Practices</h3>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-900">Storytelling Flow</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Start with problem identification → solution presentation → benefits → social proof
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-900">Mobile Optimization</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          70% of Amazon shoppers use mobile - ensure text is readable at small sizes
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-900">Brand Consistency</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Maintain consistent color scheme, fonts, and messaging throughout all modules
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Content Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <span>Video Content Analysis</span>
                </CardTitle>
                <CardDescription>
                  Video strategy recommendations based on top performer analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">🎥</div>
                      <h4 className="font-semibold text-gray-900">Product Demo Video</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Optimal Length:</span>
                        <span className="font-medium">45-60 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Key Elements:</span>
                        <span className="font-medium">Unboxing, Setup</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Show Bluetooth pairing process and comfort features
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">🌙</div>
                      <h4 className="font-semibold text-gray-900">Lifestyle Video</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Optimal Length:</span>
                        <span className="font-medium">30-45 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Key Elements:</span>
                        <span className="font-medium">Use Cases</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Show different sleep positions and travel scenarios
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-orange-50">
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">📊</div>
                      <h4 className="font-semibold text-gray-900">Comparison Video</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Optimal Length:</span>
                        <span className="font-medium">60-90 seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Key Elements:</span>
                        <span className="font-medium">Side-by-side</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Compare with traditional eye masks and earbuds
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Video Production Checklist</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Professional lighting setup</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Multiple angle shots</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Clear audio narration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Captions for mobile viewing</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Show product scale/size</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Include lifestyle B-roll</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Feature diverse models</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">End with clear CTA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            {/* Overall Sentiment */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Overall Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {dailyProductData.reviewAnalysisData.sentimentScore}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {dailyProductData.reviewAnalysisData.overallSentiment}
                    </div>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(dailyProductData.reviewAnalysisData.sentimentScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Reviews Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {dailyProductData.reviewAnalysisData.totalReviews.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Across all competitors
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Market Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {dailyProductData.reviewAnalysisData.commonThemes.opportunities.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      Key opportunities identified
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Avatars */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Customer Avatars</span>
                </CardTitle>
                <CardDescription>
                  Key customer segments driving demand for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {dailyProductData.demandData.customerAvatars.map((avatar, index) => (
                    <div key={index} className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <UserCheck className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{avatar.name}</h3>
                        <p className="text-sm text-gray-600">{avatar.age}</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-red-600 mb-1">Pain Point:</div>
                          <div className="text-sm text-gray-700">{avatar.pain}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-600 mb-1">Motivation:</div>
                          <div className="text-sm text-gray-700">{avatar.motivation}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Review Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Competitor Review Analysis</span>
                </CardTitle>
                <CardDescription>
                  Deep dive into competitor reviews to identify opportunities and threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dailyProductData.reviewAnalysisData.competitorReviews.map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="text-lg font-semibold text-gray-900">
                              {competitor.competitor}
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < Math.floor(competitor.score) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                ({competitor.totalReviews.toLocaleString()})
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm font-medium text-green-600 mb-2 flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Positive Themes
                              </div>
                              <div className="space-y-1">
                                {competitor.themes.positive.map((theme, themeIndex) => (
                                  <Badge key={themeIndex} variant="secondary" className="text-xs mr-1 mb-1">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-red-600 mb-2 flex items-center">
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Negative Themes
                              </div>
                              <div className="space-y-1">
                                {competitor.themes.negative.map((theme, themeIndex) => (
                                  <Badge key={themeIndex} variant="destructive" className="text-xs mr-1 mb-1">
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Key Insights</div>
                          <ul className="space-y-2">
                            {competitor.keyInsights.map((insight, insightIndex) => (
                              <li key={insightIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-1" />
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Common Themes & Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  <span>Market Insights & Opportunities</span>
                </CardTitle>
                <CardDescription>
                  Cross-competitor analysis revealing market gaps and opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-3 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Common Positive Themes
                    </div>
                    <div className="space-y-2">
                      {dailyProductData.reviewAnalysisData.commonThemes.positive.map((theme, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-gray-700">{theme}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-3 flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Common Pain Points
                    </div>
                    <div className="space-y-2">
                      {dailyProductData.reviewAnalysisData.commonThemes.negative.map((theme, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <span className="text-sm text-gray-700">{theme}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-purple-600 mb-3 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Market Opportunities
                    </div>
                    <div className="space-y-2">
                      {dailyProductData.reviewAnalysisData.commonThemes.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <ArrowRight className="h-3 w-3 text-purple-500" />
                          <span className="text-sm text-gray-700">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Analysis Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Financial Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Average Selling Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${dailyProductData.financialData.avgSellingPrice}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ${dailyProductData.financialData.monthlyProjections.revenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Monthly Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    ${dailyProductData.financialData.monthlyProjections.profit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Monthly Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {dailyProductData.financialData.monthlyProjections.units.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Cost Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Profit Calculator</span>
                </CardTitle>
                <CardDescription>
                  Adjust COGS percentage to see how it affects profitability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Cost of Goods Sold (COGS)
                    </label>
                    <span className="text-sm text-gray-600">{cogsPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="40"
                    value={cogsPercentage}
                    onChange={(e) => setCogsPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15%</span>
                    <span>40%</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selling Price:</span>
                        <span className="font-medium">${dailyProductData.financialData.avgSellingPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">COGS ({cogsPercentage}%):</span>
                        <span className="font-medium text-red-600">-${financials.cogs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amazon Fees:</span>
                        <span className="font-medium text-red-600">-${dailyProductData.financialData.totalFees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PPC Cost:</span>
                        <span className="font-medium text-red-600">-$3.20</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Net Profit:</span>
                          <span className={`${parseFloat(financials.netProfit) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${financials.netProfit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profit Margin:</span>
                          <span className={`${parseFloat(financials.profitMargin) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {financials.profitMargin}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Monthly Projections</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Units Sold:</span>
                        <span className="font-medium">{dailyProductData.financialData.monthlyOrders.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium text-blue-600">
                          ${(dailyProductData.financialData.monthlyOrders * dailyProductData.financialData.avgSellingPrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Profit:</span>
                        <span className={`font-medium ${parseFloat(financials.netProfit) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(dailyProductData.financialData.monthlyOrders * parseFloat(financials.netProfit)).toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>ROI:</span>
                          <span className={`${parseFloat(financials.profitMargin) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {((parseFloat(financials.netProfit) / parseFloat(financials.cogs)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Price Point Analysis</span>
                </CardTitle>
                <CardDescription>
                  Revenue potential at different price points based on market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        ${dailyProductData.financialData.priceAnalysis.optimalRange.min} - ${dailyProductData.financialData.priceAnalysis.optimalRange.max}
                      </div>
                      <div className="text-sm text-gray-600">Optimal Price Range</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dailyProductData.financialData.priceAnalysis.optimalRange.reason}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        ${dailyProductData.financialData.priceAnalysis.currentPosition.price}
                      </div>
                      <div className="text-sm text-gray-600">Current Position</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dailyProductData.financialData.priceAnalysis.currentPosition.percentile}th percentile
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        #{dailyProductData.financialData.priceAnalysis.currentPosition.salesRank.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Sales Rank</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Price Point</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Sales Rank</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Units</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Revenue</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Percentile</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyProductData.financialData.priceAnalysis.pricePoints.map((point, index) => (
                          <tr key={index} className={`border-b hover:bg-gray-50 ${point.price === dailyProductData.financialData.priceAnalysis.currentPosition.price ? 'bg-blue-50' : ''}`}>
                            <td className="py-3 px-4">
                              <span className="font-medium">${point.price}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700">#{point.salesRank.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700">{point.monthlyUnits.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-green-600 font-medium">${point.revenue.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${point.percentile}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{point.percentile}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitor Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Competitive Pricing Landscape</span>
                </CardTitle>
                <CardDescription>
                  How your pricing compares to top competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {dailyProductData.financialData.priceAnalysis.competitorPricing.map((competitor, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 mb-2">{competitor.name}</div>
                        <div className="text-2xl font-bold text-green-600 mb-1">${competitor.price}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Rank #{competitor.salesRank.toLocaleString()}
                        </div>
                        <Badge 
                          variant={competitor.position === 'competitive' ? 'default' : competitor.position === 'value' ? 'secondary' : 'outline'}
                          className="text-xs capitalize"
                        >
                          {competitor.position}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Launch Strategy Tab */}
          <TabsContent value="launch" className="space-y-6">
            {/* Simulated Amazon Listing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span>Simulated Amazon Listing</span>
                </CardTitle>
                <CardDescription>
                  Preview how your optimized listing will appear on Amazon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                  {/* Amazon-style product layout */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Product Images */}
                    <div>
                      <div className="mb-4">
                        <img 
                          src={dailyProductData.mainImage}
                          alt="Product main image"
                          className="w-full rounded-lg border"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <img 
                            key={i}
                            src={dailyProductData.mainImage}
                            alt={`Product image ${i}`}
                            className="w-full rounded border cursor-pointer hover:border-orange-500 transition-colors"
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div>
                      <h1 className="text-xl font-medium text-gray-900 mb-2">
                        Premium Bluetooth Sleep Mask with Built-in Speakers - Wireless Audio Headband for Side Sleepers, Meditation & Travel
                      </h1>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-blue-600 hover:text-orange-500 cursor-pointer">
                          128 ratings
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm text-blue-600 hover:text-orange-500 cursor-pointer">
                          42 answered questions
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <Badge className="bg-orange-500 text-white">Amazon's Choice</Badge>
                        <span className="text-sm text-gray-600 ml-2">for "bluetooth sleep mask"</span>
                      </div>
                      
                      <div className="border-t border-b py-3 mb-4">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-light text-gray-900">$34.99</span>
                          <span className="text-sm text-gray-600 line-through">$49.99</span>
                          <Badge variant="destructive" className="ml-2">30% off</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">FREE delivery Friday, July 8</p>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Ultra-thin speakers perfect for side sleepers</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">10-hour battery life with USB-C charging</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Bluetooth 5.0 with 33ft wireless range</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Machine washable with removable speakers</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                          Add to Cart
                        </Button>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Launch Strategy Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>90-Day Launch Strategy</span>
                </CardTitle>
                <CardDescription>
                  Step-by-step roadmap to achieve target metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Phase 1 */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Days 1-30: Launch Phase</h3>
                        <p className="text-sm text-gray-600">Foundation & momentum building</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Target Price:</div>
                        <div className="text-2xl font-bold text-green-600">$19.99</div>
                        <div className="text-xs text-gray-500">50% off to drive initial sales</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Review Target:</div>
                        <div className="font-bold text-blue-600">15-25 reviews</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Daily PPC Spend:</div>
                        <div className="font-bold text-purple-600">$75-100</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Key Activities:</div>
                        <ul className="text-xs text-gray-600 space-y-1 mt-1">
                          <li>• Launch with friends & family</li>
                          <li>• Aggressive PPC campaigns</li>
                          <li>• Early reviewer program</li>
                          <li>• Social media push</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Days 31-60: Growth Phase</h3>
                        <p className="text-sm text-gray-600">Scale & optimize</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Target Price:</div>
                        <div className="text-2xl font-bold text-green-600">$27.99</div>
                        <div className="text-xs text-gray-500">Gradual price increase</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Review Target:</div>
                        <div className="font-bold text-blue-600">50-75 reviews</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Daily PPC Spend:</div>
                        <div className="font-bold text-purple-600">$50-75</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Key Activities:</div>
                        <ul className="text-xs text-gray-600 space-y-1 mt-1">
                          <li>• Optimize PPC campaigns</li>
                          <li>• Launch A+ content</li>
                          <li>• Implement review follow-up</li>
                          <li>• Test price points</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Days 61-90: Profit Phase</h3>
                        <p className="text-sm text-gray-600">Maximize profitability</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Target Price:</div>
                        <div className="text-2xl font-bold text-green-600">$34.99</div>
                        <div className="text-xs text-gray-500">Optimal price point</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Review Target:</div>
                        <div className="font-bold text-blue-600">100+ reviews</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Daily PPC Spend:</div>
                        <div className="font-bold text-purple-600">$40-60</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-1">Key Activities:</div>
                        <ul className="text-xs text-gray-600 space-y-1 mt-1">
                          <li>• Focus on organic ranking</li>
                          <li>• Launch video content</li>
                          <li>• Reduce PPC dependency</li>
                          <li>• Build brand presence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Launch Metrics Timeline */}
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-4">Expected Performance Timeline</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Metric</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-600">Month 1</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-600">Month 2</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-orange-600">Month 3</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center items-center">
                      <div className="text-sm text-left font-medium">Sales/Day</div>
                      <div className="text-lg font-bold">15-25</div>
                      <div className="text-lg font-bold">35-45</div>
                      <div className="text-lg font-bold">50-60</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center items-center">
                      <div className="text-sm text-left font-medium">BSR</div>
                      <div className="text-lg font-bold">#25,000</div>
                      <div className="text-lg font-bold">#12,000</div>
                      <div className="text-lg font-bold">#7,500</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center items-center">
                      <div className="text-sm text-left font-medium">Conv. Rate</div>
                      <div className="text-lg font-bold">8-10%</div>
                      <div className="text-lg font-bold">11-13%</div>
                      <div className="text-lg font-bold">14-16%</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center items-center">
                      <div className="text-sm text-left font-medium">Rating</div>
                      <div className="text-lg font-bold">4.3★</div>
                      <div className="text-lg font-bold">4.4★</div>
                      <div className="text-lg font-bold">4.5★</div>
                    </div>
                  </div>
                </div>

                {/* PPC Strategy */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">PPC Launch Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded bg-blue-50">
                          <div className="font-medium text-sm mb-1">Sponsored Products</div>
                          <div className="text-xs text-gray-600">70% of budget - Focus on exact match keywords</div>
                          <div className="text-xs text-gray-500 mt-1">Target ACoS: 40% (Month 1) → 25% (Month 3)</div>
                        </div>
                        <div className="p-3 border rounded bg-green-50">
                          <div className="font-medium text-sm mb-1">Sponsored Brands</div>
                          <div className="text-xs text-gray-600">20% of budget - Build brand awareness</div>
                          <div className="text-xs text-gray-500 mt-1">Focus on category keywords</div>
                        </div>
                        <div className="p-3 border rounded bg-purple-50">
                          <div className="font-medium text-sm mb-1">Sponsored Display</div>
                          <div className="text-xs text-gray-600">10% of budget - Retargeting campaigns</div>
                          <div className="text-xs text-gray-500 mt-1">Target competitor ASINs</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Review Generation Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border rounded bg-yellow-50">
                          <div className="font-medium text-sm mb-1">Amazon Vine</div>
                          <div className="text-xs text-gray-600">First 30 units - Get initial reviews fast</div>
                          <div className="text-xs text-gray-500 mt-1">Expected: 10-15 reviews</div>
                        </div>
                        <div className="p-3 border rounded bg-orange-50">
                          <div className="font-medium text-sm mb-1">Request a Review Button</div>
                          <div className="text-xs text-gray-600">Automated follow-up after 7 days</div>
                          <div className="text-xs text-gray-500 mt-1">3-5% conversion rate</div>
                        </div>
                        <div className="p-3 border rounded bg-red-50">
                          <div className="font-medium text-sm mb-1">Product Inserts</div>
                          <div className="text-xs text-gray-600">QR code for support & feedback</div>
                          <div className="text-xs text-gray-500 mt-1">Compliant with Amazon TOS</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
