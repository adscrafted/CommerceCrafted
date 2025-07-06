'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import CompetitionAnalysis from '@/components/products/analysis/CompetitionAnalysis'
import { MembershipGate } from '@/components/MembershipGate'

interface CompetitionPageProps {
  params: Promise<{ slug: string }>
}

// Mock data - in production this would come from API
const productData = {
  id: 'daily_product_1',
  title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
  mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
  scores: {
    competition: 78
  },
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
  }
}

export default function CompetitionPage({ params }: CompetitionPageProps) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setTimeout(() => setLoading(false), 500)
    }

    loadData()
  }, [params])

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  }

  const userTier = session.user?.subscriptionTier || 'free'
  if (userTier === 'free') {
    return <MembershipGate productTitle={productData.title} productImage={productData.mainImage} />
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Competition Analysis</h1>
                  <p className="text-base text-gray-600">Competitor landscape & market positioning</p>
                </div>
              </div>
              <Link href={`/products/${slug}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
              </Link>
            </div>
            
            {/* Score Display - Horizontal Rectangle */}
            <Card className="border-2 border-red-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(productData.scores.competition)}`}>
                    {productData.scores.competition}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(productData.scores.competition)}</div>
                  <Progress value={productData.scores.competition} className="h-2 mt-2 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-500">
          <Link href={`/products/${slug}`} className="hover:text-blue-600">
            {productData.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Competition Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Key Insights */}
        <Card className="mb-6 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle>Key Competition Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">Moderate</div>
                <div className="text-sm text-gray-600">Competition Level</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">$20-30</div>
                <div className="text-sm text-gray-600">Sweet Spot</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">3,421</div>
                <div className="text-sm text-gray-600">Avg Reviews</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">40.9%</div>
                <div className="text-sm text-gray-600">In Price Range</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competition Analysis Component */}
        <CompetitionAnalysis data={productData} />
      </div>
    </div>
  )
}