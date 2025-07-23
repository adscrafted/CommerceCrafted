'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  TrendingUp,
  ArrowRight,
  BarChart3,
  Globe,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Activity,
  MessageSquare,
  Target,
  Search,
  DollarSign,
  FileText,
  Rocket
} from 'lucide-react'
import { APIService } from '@/lib/api-service'
import { Product, DailyFeature } from '@/types/api'
import Link from 'next/link'
import Image from 'next/image'
import { generateProductSlug } from '@/lib/utils/slug'



interface Niche {
  id: string
  slug: string
  title: string
  mainImage: string
  productCount: number
  opportunityScore: number
  scores: {
    demand: number
    competition: number
    keywords: number
    listing: number
    intelligence: number
    launch: number
    financial: number
  }
  category: string
  avgPrice: string
  totalReviews: number
  monthlyRevenue: number
  competitionLevel: string
}

interface TrendData {
  id: string
  keyword: string
  searchFrequencyRank: number
  topClickShare: number
  top3ConversionShare: number
  top3ASINs: Array<{
    asin: string
    clickShare: number
    conversionShare: number
  }>
  weeklyData?: Array<{
    week_start_date: string
    week_end_date: string
    search_frequency_rank: number
    total_click_share: number
    total_conversion_share: number
  }>
  marketplaceId?: string
}

export default function HomePage() {
  const [dailyFeature, setDailyFeature] = useState<DailyFeature | null>(null)
  const [niches, setNiches] = useState<Niche[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mainImageSrc, setMainImageSrc] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        const [daily, nichesResponse, trendsResponse] = await Promise.all([
          APIService.getDailyFeature(),
          fetch('/api/niches/public?limit=6'),
          fetch('/api/trends?limit=6')
        ])
        
        setDailyFeature(daily)
        
        // Initialize main image source
        if (daily) {
          const defaultImage = daily.nicheProducts?.[0]?.mainImage || 
                              daily.product.imageUrls?.[0] || 
                              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
          setMainImageSrc(defaultImage)
        }
        
        if (nichesResponse.ok) {
          const nichesData = await nichesResponse.json()
          setNiches(nichesData.niches || [])
        }
        
        if (trendsResponse.ok) {
          const trendsData = await trendsResponse.json()
          if (trendsData.success && trendsData.data) {
            // Transform the trends data to match our interface
            const transformedTrends: TrendData[] = trendsData.data.map((term: any, index: number) => ({
              id: `trend-${index}`,
              keyword: term.searchTerm,
              searchFrequencyRank: term.searchFrequencyRank,
              topClickShare: (term.totalClickShare || 0) * 100,
              top3ConversionShare: (term.totalConversionShare || 0) * 100,
              top3ASINs: (term.topAsins || []).map((asin: any) => ({
                asin: asin.clicked_asin || 'N/A',
                clickShare: (asin.click_share || 0) * 100,
                conversionShare: (asin.conversion_share || 0) * 100
              })),
              weeklyData: term.weeklyData || [],
              marketplaceId: term.marketplaceId || 'US'
            }))
            setTrends(transformedTrends)
          }
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }


  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Poor'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded-lg mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Failed to Load Data
            </div>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product of the Day Section */}
        {dailyFeature && (
          <section className="mb-16">
            {/* Header with Navigation */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">Product of the Day</h2>
              <div className="flex items-center justify-center gap-6 mb-2">
                <Link href="/products">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Products
                  </Button>
                </Link>
                
                <div className="text-gray-600 font-medium">
                  {new Date(dailyFeature.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                
                <Link href="/next-product">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                  >
                    Next Product
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-4">
                        {dailyFeature.product.category || dailyFeature.nicheName || 'Health & Wellness'}
                      </Badge>
                      <h1 className="text-3xl font-bold mb-3">{dailyFeature.nicheName || dailyFeature.product.title}</h1>
                      <p className="text-xl mb-6 text-blue-100">
                        {dailyFeature.reason}
                      </p>
                      
                    </div>
                    
                    {/* Niche Image Gallery - Same format as Product of the Day page */}
                    <div className="flex gap-4">
                      {/* Main Image */}
                      <div className="w-72 h-72 relative bg-white rounded-lg shadow-xl overflow-hidden">
                        <Image 
                          src={mainImageSrc}
                          alt={dailyFeature.nicheName || dailyFeature.product.title}
                          width={288}
                          height={288}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop'
                          }}
                        />
                      </div>
                      
                      {/* Thumbnails - Match Product of the Day layout */}
                      {dailyFeature.nicheProducts && dailyFeature.nicheProducts.length > 1 && (
                        <div className="h-72">
                          <div className={`grid gap-2 h-full ${
                            dailyFeature.nicheProducts.slice(0, 12).length <= 4 ? 'grid-cols-1' :
                            dailyFeature.nicheProducts.slice(0, 12).length <= 8 ? 'grid-cols-2' :
                            'grid-cols-3'
                          }`}>
                            {dailyFeature.nicheProducts.slice(0, 12).map((product, index) => (
                              <button
                                key={index}
                                onClick={() => setMainImageSrc(product.mainImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop')}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                  mainImageSrc === product.mainImage 
                                    ? 'border-blue-500 shadow-md' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                                style={{ height: '66px' }}
                              >
                                <Image
                                  src={product.mainImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop'}
                                  alt={`Product ${index + 1}`}
                                  width={66}
                                  height={66}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop'
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-8 py-6">
                  <div className="grid grid-cols-3 gap-8 text-center">
                    {/* Row 1 */}
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {dailyFeature.product.analysis?.financialAnalysis.estimatedRevenue ? 
                          `$${(dailyFeature.product.analysis.financialAnalysis.estimatedRevenue / 1000).toFixed(0)}K` : 
                          'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Est. Monthly Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {dailyFeature.product.monthlySales?.toLocaleString() || dailyFeature.product.analysis?.financialAnalysis?.estimatedMonthlySales?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Monthly Sales</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {dailyFeature.product.analysis?.competitionAnalysis?.competitorCount || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Competitors</div>
                    </div>
                    
                    {/* Row 2 */}
                    <div>
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        {dailyFeature.product.rating ? dailyFeature.product.rating.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        ({dailyFeature.product.reviewCount ? dailyFeature.product.reviewCount.toLocaleString() : '0'} reviews)
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {dailyFeature.product.price ? `$${dailyFeature.product.price.toFixed(2)}` : 'TBD'}
                      </div>
                      <div className="text-sm text-gray-600">Price</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {dailyFeature.product.bsr ? `#${(dailyFeature.product.bsr / 1000).toFixed(0)}K` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">BSR</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <CardContent className="py-6">
                <div className="text-center">
                  <Link href="/product-of-the-day">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                      View Complete Analysis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 mt-2">
                    Get detailed insights, competitor analysis, and launch strategies
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* The Product Database Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">The Product Database</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Over 150+ products researched and analyzed on 150+ business ideas
            </p>
          </div>

          {niches.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {niches.map((niche) => (
                <Link key={niche.id} href={`/products/${niche.slug}?nicheId=${niche.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 h-full">
                    <div className="p-8">
                      {/* Header with niche info */}
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={niche.mainImage}
                            alt={niche.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {niche.category}
                              </Badge>
                              <span className="text-sm text-gray-500">{niche.productCount} products</span>
                              <span className="text-sm text-gray-500">• Avg: {niche.avgPrice}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{niche.title}</h2>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">
                              {niche.opportunityScore}
                            </div>
                            <div className="text-xs text-gray-600">Opportunity</div>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Progress Bars */}
                      <div className="mt-6 pt-6 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs font-medium text-gray-700">Market Intelligence</span>
                            </div>
                            <Progress value={niche.scores.intelligence} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-gray-700">Demand Analysis</span>
                            </div>
                            <Progress value={niche.scores.demand} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Target className="h-3 w-3 text-red-600" />
                              <span className="text-xs font-medium text-gray-700">Competition</span>
                            </div>
                            <Progress value={niche.scores.competition} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Search className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-gray-700">Keywords</span>
                            </div>
                            <Progress value={niche.scores.keywords} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-3 w-3 text-emerald-600" />
                              <span className="text-xs font-medium text-gray-700">Financial</span>
                            </div>
                            <Progress value={niche.scores.financial} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3 text-purple-600" />
                              <span className="text-xs font-medium text-gray-700">Listing</span>
                            </div>
                            <Progress value={niche.scores.listing} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Rocket className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-medium text-gray-700">Launch Strategy</span>
                            </div>
                            <Progress value={niche.scores.launch} className="h-2 [&>div]:bg-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-gray-400 mb-4">
                <Package className="w-24 h-24" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No niches available</h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                The product database is currently empty. Create niches to see them here.
              </p>
            </div>
          )}

          {niches.length > 0 && (
            <div className="text-center">
              <Link href="/database">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                  View Product Database
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-600 mt-2">
                Explore all researched products and analysis insights
              </p>
            </div>
          )}
        </section>

        {/* Trends Section - Amazon Top Search Terms */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Amazon Top Search Terms</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Trending keywords on Amazon with search volume and conversion data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {trends.length > 0 ? (
              trends.map((trend) => (
              <Link key={trend.id} href={`/trends/${trend.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-sm h-full">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {trend.keyword}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              #{trend.searchFrequencyRank}
                            </span>
                            <div className="text-xs text-gray-500">Rank</div>
                          </div>
                          <div>
                            <span className="text-xl font-bold text-gray-900">
                              {trend.topClickShare.toFixed(1)}%
                            </span>
                            <div className="text-xs text-gray-500">Click Share</div>
                          </div>
                          <div>
                            <span className="text-xl font-bold text-blue-600">
                              {trend.top3ConversionShare.toFixed(1)}%
                            </span>
                            <div className="text-xs text-gray-500">Conv. Share</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trend Preview */}
                    <div className="h-32 w-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-2">Top ASIN</div>
                        {trend.top3ASINs && trend.top3ASINs.length > 0 ? (
                          <div className="text-xs font-mono text-gray-700">{trend.top3ASINs[0].asin}</div>
                        ) : (
                          <div className="text-xs text-gray-400">No ASIN data</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-20">
                <div className="text-gray-400 mb-4">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trends available</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Trends data requires BigQuery configuration. Check your environment settings.
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link href="/trends">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                View All Trends
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-600 mt-2">
              Get detailed search volume and conversion data
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
