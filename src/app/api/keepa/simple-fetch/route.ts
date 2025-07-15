import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    console.log('Fetching from Keepa for ASIN:', asin)
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Just return the raw Keepa data
    return NextResponse.json({
      success: true,
      asin: asin,
      keepaData: keepaProduct
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}