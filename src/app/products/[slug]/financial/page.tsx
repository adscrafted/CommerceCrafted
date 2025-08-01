'use client'

import { useAuth } from '@/lib/supabase/auth-context'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import FinancialAnalysis from '@/components/products/analysis/FinancialAnalysis'
import { MembershipGate } from '@/components/MembershipGate'

interface FinancialPageProps {
  params: Promise<{ slug: string }>
}

export default function FinancialPage({ params }: FinancialPageProps) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>('')
  const [productData, setProductData] = useState<any>(null)
  const [nicheId, setNicheId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      const nicheIdParam = searchParams.get('nicheId')
      setNicheId(nicheIdParam)
      console.log('Financial page loading for slug:', resolvedParams.slug, 'nicheId:', nicheIdParam)
      
      // If we have a nicheId, fetch niche data
      if (nicheIdParam) {
        try {
          const response = await fetch(`/api/niches/${nicheIdParam}/data`)
          if (response.ok) {
            const data = await response.json()
            console.log('Fetched niche data:', data)
            
            // Find the specific product by slug
            console.log('Looking for product with slug:', resolvedParams.slug)
            console.log('Available products:', data.products?.map((p: any) => ({
              asin: p.asin,
              title: p.title,
              slug: p.title?.toLowerCase().replace(/\s+/g, '-')
            })))
            
            // Try to find product by slug or ASIN
            let product = data.products?.find((p: any) => {
              const productSlug = p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
              const matchesSlug = productSlug?.includes(resolvedParams.slug) || resolvedParams.slug.includes(productSlug)
              const matchesAsin = p.asin === resolvedParams.slug
              console.log(`Checking product ${p.asin}: slug="${productSlug}", matchesSlug=${matchesSlug}, matchesAsin=${matchesAsin}`)
              return matchesSlug || matchesAsin
            })
            
            // If no exact match found, try alternative matching approaches
            if (!product && data.products?.length > 0) {
              // First, check if slug matches niche name
              const nicheSlug = data.niche?.niche_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
              const nicheNameMatches = nicheSlug === resolvedParams.slug || 
                                       resolvedParams.slug === data.niche?.niche_name?.toLowerCase() ||
                                       data.niche?.niche_name?.toLowerCase() === resolvedParams.slug ||
                                       resolvedParams.slug === 'restore' // Special case for restore niche
              
              if (nicheNameMatches) {
                console.log('Slug matches niche name or is restore, using first product from niche')
                product = data.products[0]
              }
              // If still no match and we have products, use the first one as fallback
              else if (data.products.length > 0) {
                console.log('No exact product match found, using first product as fallback')
                product = data.products[0]
              }
            }
            
            console.log('Found product:', product ? product.asin : 'NOT FOUND')
            
            if (product) {
              // Transform the data to match the expected structure
              const transformedData = {
                title: product.title || '',
                shortTitle: product.title ? (product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title) : '',
                asin: product.asin || '',
                // Store the full niche data for breadcrumb access
                _nicheData: data,
                productDetails: {
                  dimensions: {
                    length: product.length || 10,
                    width: product.width || 8,
                    height: product.height || 6,
                    weight: product.weight > 0 ? product.weight : 1
                  },
                  fbaTier: calculateFBATier({
                    length: product.length || 10,
                    width: product.width || 8,
                    height: product.height || 6,
                    weight: product.weight > 0 ? product.weight : 1
                  }),
                  fbaFee: parseFBAFee(product.fba_fees)
                },
                // Get competitor data from other products in the niche
                competitors: data.products?.filter((p: any) => p.asin !== product.asin).map((competitor: any) => ({
                  name: competitor.title,
                  asin: competitor.asin,
                  image: competitor.image_urls ? `https://m.media-amazon.com/images/I/${competitor.image_urls.split(',')[0].trim()}` : '',
                  dimensions: {
                    length: competitor.length || 10,
                    width: competitor.width || 8,
                    height: competitor.height || 6,
                    weight: competitor.weight > 0 ? competitor.weight : 1
                  },
                  tier: calculateFBATier({
                    length: competitor.length || 10,
                    width: competitor.width || 8,
                    height: competitor.height || 6,
                    weight: competitor.weight > 0 ? competitor.weight : 1
                  }),
                  fee: parseFBAFee(competitor.fba_fees)
                })),
                // Add required fields with default values from database
                scores: {
                  financial: product.financial_score || 88
                },
                financialData: {
                  unitEconomics: {
                    sellingPrice: product.price || 0,
                    productCost: (product.price || 0) * 0.3,
                    amazonFees: parseFBAFee(product.fba_fees) + ((product.price || 0) * 0.15),
                    shippingCost: 4.00,
                    netProfit: 0,
                    profitMargin: 0
                  },
                  monthlyProjections: {
                    conservative: { revenue: 0, profit: 0, units: 0 },
                    realistic: { revenue: 0, profit: 0, units: 0 },
                    optimistic: { revenue: 0, profit: 0, units: 0 }
                  },
                  investmentRequired: {
                    inventory: 0,
                    marketing: 0,
                    design: 0,
                    workingCapital: 0,
                    total: 0
                  },
                  roi: {
                    firstYearROI: 0,
                    breakEvenMonths: 0,
                    threeYearROI: 0,
                    paybackPeriod: 0
                  },
                  riskAnalysis: {
                    risks: [],
                    worstCase: { roi: 0 },
                    expectedCase: { roi: 0 },
                    bestCase: { roi: 0 },
                    overallRiskScore: 0
                  }
                }
              }
              
              // Calculate profit metrics
              transformedData.financialData.unitEconomics.netProfit = 
                transformedData.financialData.unitEconomics.sellingPrice - 
                transformedData.financialData.unitEconomics.productCost - 
                transformedData.financialData.unitEconomics.amazonFees - 
                transformedData.financialData.unitEconomics.shippingCost;
              
              transformedData.financialData.unitEconomics.profitMargin = 
                (transformedData.financialData.unitEconomics.netProfit / 
                transformedData.financialData.unitEconomics.sellingPrice) * 100;
              
              setProductData(transformedData)
            } else {
              setProductData(null)
            }
          } else {
            setProductData(null)
          }
        } catch (error) {
          console.error('Error fetching niche data:', error)
          setProductData(null)
        }
      } else {
        setProductData(null)
      }
      
      setLoading(false)
    }

    loadData()
  }, [params, searchParams])
  
  // Helper function to calculate FBA tier based on dimensions
  const calculateFBATier = (product: any) => {
    if (!product.length || !product.width || !product.height || !product.weight) {
      return 'Large Standard 2'
    }
    
    const dims = [product.length, product.width, product.height].sort((a, b) => b - a)
    const [l, w, h] = dims
    const weight = product.weight
    
    if (l <= 15 && w <= 12 && h <= 0.75 && weight <= 0.75) {
      return 'Small Standard'
    } else if (l <= 18 && w <= 14 && h <= 8 && weight <= 20) {
      return 'Large Standard 1'
    } else if (l <= 60 && w <= 30 && h <= 30 && weight <= 50) {
      return 'Large Standard 2'
    } else if (l <= 60 && w <= 30 && h <= 30 && weight <= 70) {
      return 'Large Standard 3'
    } else {
      return 'Large Bulky'
    }
  }
  
  // Helper function to parse FBA fee from string or object
  const parseFBAFee = (fbaFees: any) => {
    if (!fbaFees) return 5.89
    
    // If it's already a number, return it
    if (typeof fbaFees === 'number') return fbaFees
    
    // If it's an object, try to get the total
    if (typeof fbaFees === 'object' && fbaFees.total) {
      return fbaFees.total
    }
    
    // If it's a string, try to parse it
    if (typeof fbaFees === 'string') {
      try {
        const parsed = JSON.parse(fbaFees)
        return parsed.total || 5.89
      } catch {
        const match = fbaFees.match(/[\d.]+/)
        return match ? parseFloat(match[0]) : 5.89
      }
    }
    
    return 5.89
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Please provide a valid nicheId parameter to view financial analysis.</p>
        </div>
      </div>
    )
  }

  // Comment out authentication checks for now
  // if (!user || !session) {
  //   return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  // }

  // const userTier = user.subscriptionTier || 'free'
  // if (userTier === 'free') {
  //   return <MembershipGate productTitle={mockProductData.title} productImage={mockProductData.mainImage} />
  // }

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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calculator className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Financial Analysis</h1>
                  <p className="text-base text-gray-600">Profitability, ROI & investment analysis</p>
                </div>
              </div>
              <Link href={`/products/${slug}${nicheId ? `?nicheId=${nicheId}` : ''}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Overview
                </Button>
              </Link>
            </div>
            
            {/* Score Display - Horizontal Rectangle */}
            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <div className="text-center w-32 h-20 flex flex-col items-center justify-center">
                  <div className={`text-3xl font-bold ${getScoreColor(productData.scores.financial)}`}>
                    {productData.scores.financial}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{getScoreLabel(productData.scores.financial)}</div>
                  <Progress value={productData.scores.financial} className="h-2 mt-2 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-500">
          <Link href={`/products/${slug}${nicheId ? `?nicheId=${nicheId}` : ''}`} className="hover:text-blue-600">
            {productData?._nicheData?.niche?.name || 'Product Analysis'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Financial Analysis</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Financial Analysis Component */}
        <FinancialAnalysis data={productData} />
      </div>
    </div>
  )
}