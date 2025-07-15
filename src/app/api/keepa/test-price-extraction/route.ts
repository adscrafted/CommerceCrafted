import { NextRequest, NextResponse } from 'next/server'
import { keepaAPI } from '@/lib/integrations/keepa'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    console.log('Testing price extraction for ASIN:', asin)
    
    // Fetch raw Keepa data
    const keepaProduct = await keepaAPI.getProduct(asin)
    
    if (!keepaProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Extract price data from different sources
    const priceAnalysis = {
      asin: keepaProduct.asin,
      title: keepaProduct.title,
      
      // Stats current prices
      statsCurrentPrices: keepaProduct.stats?.current ? {
        amazonPrice: keepaProduct.stats.current[0] !== -1 ? keepaProduct.stats.current[0] / 100 : null,
        newPrice: keepaProduct.stats.current[1] !== -1 ? keepaProduct.stats.current[1] / 100 : null,
        lightningDeal: keepaProduct.stats.current[8] !== -1 ? keepaProduct.stats.current[8] / 100 : null,
        warehouse: keepaProduct.stats.current[9] !== -1 ? keepaProduct.stats.current[9] / 100 : null,
        newFBA: keepaProduct.stats.current[10] !== -1 ? keepaProduct.stats.current[10] / 100 : null,
        buyBoxShipping: keepaProduct.stats.current[18] !== -1 ? keepaProduct.stats.current[18] / 100 : null
      } : null,
      
      // CSV latest prices
      csvLatestPrices: {}
    }
    
    // Check CSV data for latest prices
    if (keepaProduct.csv) {
      const priceIndices = [
        { idx: 0, name: 'AMAZON' },
        { idx: 1, name: 'NEW' },
        { idx: 8, name: 'LIGHTNING_DEAL' },
        { idx: 9, name: 'WAREHOUSE' },
        { idx: 10, name: 'NEW_FBA' },
        { idx: 18, name: 'BUY_BOX_SHIPPING' }
      ]
      
      for (const { idx, name } of priceIndices) {
        if (keepaProduct.csv[idx] && Array.isArray(keepaProduct.csv[idx]) && keepaProduct.csv[idx].length >= 2) {
          const csvData = keepaProduct.csv[idx]
          const lastValueIndex = csvData.length - 1
          const lastValue = csvData[lastValueIndex]
          const lastTimestamp = csvData[lastValueIndex - 1]
          
          // Convert Keepa time to date using official formula
          const timestampMs = (lastTimestamp + 21564000) * 60000
          const date = new Date(timestampMs)
          
          priceAnalysis.csvLatestPrices[name] = {
            value: lastValue !== -1 ? lastValue / 100 : null,
            rawValue: lastValue,
            timestamp: date.toISOString(),
            dataPoints: csvData.length / 2,
            
            // For Lightning Deal, check if it's active or announced
            ...(idx === 8 && lastValue === -1 && csvData.length >= 4 ? {
              isAnnounced: true,
              activeDealPrice: csvData[csvData.length - 3] !== -1 ? csvData[csvData.length - 3] / 100 : null,
              dealStartTime: new Date((csvData[csvData.length - 2] + 21564000) * 60000).toISOString()
            } : {})
          }
        }
      }
    }
    
    // Get transformed data to see final price
    const transformed = keepaAPI.transformForDatabase(keepaProduct)
    
    return NextResponse.json({
      priceAnalysis,
      transformedPrice: transformed.currentPrice,
      salesRank: {
        current: transformed.currentBsr,
        historyPoints: transformed.bsrHistory.length
      },
      message: 'Price extraction analysis complete'
    })
    
  } catch (error) {
    console.error('Price extraction test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}