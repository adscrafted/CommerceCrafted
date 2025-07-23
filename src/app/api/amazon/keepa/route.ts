import { NextRequest, NextResponse } from 'next/server'

const KEEPA_API_KEY = process.env.KEEPA_API_KEY || '6bn3gia2gt7avkubb95fqquhnv20b2n81m387kfvkt9t583fteqte4pf1jtdh57b'
const KEEPA_API_URL = 'https://api.keepa.com/product'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    console.log(`📦 Fetching Keepa data for ASIN: ${asin}`)
    
    // Fetch data from Keepa API
    const params = new URLSearchParams({
      key: KEEPA_API_KEY,
      domain: '1', // Amazon.com
      asin: asin,
      stats: '1', // Include statistics
      history: '1', // Include price history
      offers: '20', // Include current offers
      rental: '0',
      rating: '1', // Include rating history
      update: '0' // Don't force update
    })
    
    const response = await fetch(`${KEEPA_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Keepa API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 200)
      })
      
      // Check for specific error types
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded - please wait a moment',
          retryAfter: response.headers.get('Retry-After') || '60'
        }, { status: 429 })
      }
      
      if (response.status === 401) {
        return NextResponse.json({ 
          error: 'Invalid Keepa API key' 
        }, { status: 401 })
      }
      
      throw new Error(`Keepa API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log(`📦 Keepa response:`, {
      hasProducts: !!data.products,
      productCount: data.products?.length || 0,
      tokensConsumed: data.tokensConsumed
    })
    
    if (!data.products || data.products.length === 0) {
      console.warn(`⚠️ No products found for ASIN: ${asin}`)
      return NextResponse.json({ 
        error: 'Product not found on Amazon',
        asin: asin,
        message: 'This ASIN may not exist or may be unavailable'
      }, { status: 404 })
    }
    
    const product = data.products[0]
    
    // Parse Keepa data into a more usable format
    const parsedData = {
      asin: product.asin,
      title: product.title,
      brand: product.brand,
      manufacturer: product.manufacturer,
      model: product.model,
      color: product.color,
      size: product.size,
      
      // Current data
      currentPrice: product.stats?.current?.[0] ? product.stats.current[0] / 100 : null,
      amazonPrice: product.stats?.current?.[1] ? product.stats.current[1] / 100 : null,
      salesRank: product.salesRanks?.current?.[0] || null,
      
      // Statistics
      rating: product.stats?.rating ? product.stats.rating / 10 : null,
      reviewCount: product.stats?.reviewCount || 0,
      
      // Historical data
      avg30: product.stats?.avg30?.[0] ? product.stats.avg30[0] / 100 : null,
      avg90: product.stats?.avg90?.[0] ? product.stats.avg90[0] / 100 : null,
      avg180: product.stats?.avg180?.[0] ? product.stats.avg180[0] / 100 : null,
      
      // Sales estimates (if available from Keepa stats)
      monthlySales: estimateMonthlySales(product.salesRanks?.current?.[0], product.rootCategory),
      
      // Product details
      packageDimensions: product.packageDimensions,
      itemWeight: product.itemWeight,
      images: product.imagesCSV ? product.imagesCSV.split(',') : [],
      categories: product.categories,
      rootCategory: product.rootCategory,
      parentAsin: product.parentAsin,
      variationCount: product.variationCount,
      
      // Features and description
      features: product.features || [],
      description: product.description,
      
      // FBA fees (simplified calculation)
      fbaFees: calculateFBAFees(product),
      
      // Price history (last 90 days)
      priceHistory: parsePriceHistory(product.csv?.[0], product.csv?.[18]),
      salesRankHistory: parseSalesRankHistory(product.csv?.[3], product.csv?.[18]),
      
      // Keepa metadata and product age
      lastUpdate: product.lastUpdate,
      lastPriceChange: product.lastPriceChange,
      // Product first seen date (when it was first tracked by Keepa)
      firstSeenTimestamp: product.csv?.[18] || null, // Keepa timebase
      productAge: product.csv?.[18] ? calculateProductAge(product.csv[18]) : null,
      releaseDate: product.releaseDate || null,
      tokensConsumed: data.tokensConsumed
    }
    
    console.log(`✅ Keepa data fetched successfully for ${asin}`)
    
    return NextResponse.json(parsedData)
    
  } catch (error) {
    console.error('Keepa API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch Keepa data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to estimate monthly sales based on BSR
function estimateMonthlySales(bsr: number | null, category: string): number | null {
  if (!bsr) return null
  
  // Simplified sales estimation based on BSR
  // In reality, this varies significantly by category
  if (bsr < 100) return Math.round(5000 / (bsr / 10))
  if (bsr < 1000) return Math.round(2000 / (bsr / 100))
  if (bsr < 5000) return Math.round(1000 / (bsr / 500))
  if (bsr < 10000) return Math.round(500 / (bsr / 1000))
  if (bsr < 50000) return Math.round(200 / (bsr / 5000))
  if (bsr < 100000) return Math.round(100 / (bsr / 10000))
  
  return Math.max(1, Math.round(50 / (bsr / 50000)))
}

// Helper function to calculate FBA fees (simplified)
function calculateFBAFees(product: any): number {
  const price = product.stats?.current?.[0] ? product.stats.current[0] / 100 : 0
  const weight = product.itemWeight || 1 // Default 1 lb
  
  // Simplified FBA fee calculation
  const referralFee = price * 0.15 // 15% referral fee
  const fulfillmentFee = weight < 1 ? 3.22 : weight < 2 ? 4.08 : 5.40 // Simplified tiers
  const storageFee = 0.75 // Average monthly storage
  
  return Math.round((referralFee + fulfillmentFee + storageFee) * 100) / 100
}

// Parse Keepa CSV price history
function parsePriceHistory(csv: number[] | undefined, timebase: number | undefined): any[] {
  if (!csv || !timebase || csv.length < 2) return []
  
  const history = []
  const now = Date.now()
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000)
  
  for (let i = 0; i < csv.length; i += 2) {
    const time = (timebase + csv[i]) * 60000 // Convert Keepa time to milliseconds
    const price = csv[i + 1]
    
    if (time >= ninetyDaysAgo && price > 0) {
      history.push({
        date: new Date(time).toISOString(),
        price: price / 100
      })
    }
  }
  
  return history
}

// Parse sales rank history
function parseSalesRankHistory(csv: number[] | undefined, timebase: number | undefined): any[] {
  if (!csv || !timebase || csv.length < 2) return []
  
  const history = []
  const now = Date.now()
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000)
  
  for (let i = 0; i < csv.length; i += 2) {
    const time = (timebase + csv[i]) * 60000
    const rank = csv[i + 1]
    
    if (time >= ninetyDaysAgo && rank > 0) {
      history.push({
        date: new Date(time).toISOString(),
        rank: rank
      })
    }
  }
  
  return history
}

// Calculate product age in months from Keepa timebase
function calculateProductAge(keepaTimebase: number): { months: number, years: number, category: string } {
  // Convert Keepa time to milliseconds (Keepa time is in minutes since Jan 1, 2011)
  const keepaEpoch = new Date('2011-01-01').getTime()
  const firstSeenDate = new Date(keepaEpoch + (keepaTimebase * 60000))
  const now = new Date()
  
  const monthsDiff = (now.getTime() - firstSeenDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  const yearsDiff = monthsDiff / 12
  
  let category = '3+ years'
  if (monthsDiff < 6) category = '0-6 months'
  else if (monthsDiff < 12) category = '6-12 months'
  else if (monthsDiff < 24) category = '1-2 years'
  else if (monthsDiff < 36) category = '2-3 years'
  
  return {
    months: Math.round(monthsDiff),
    years: parseFloat(yearsDiff.toFixed(1)),
    category
  }
}