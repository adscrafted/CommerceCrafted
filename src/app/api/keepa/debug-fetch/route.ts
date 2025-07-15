import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    const apiKey = process.env.KEEPA_API_KEY
    const url = `https://api.keepa.com/product?key=${apiKey}&domain=1&asin=${asin}&stats=1&history=1&offers=20&fbafees=1&rating=1`
    
    console.log('Fetching from Keepa...')
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Keepa API error',
        status: response.status 
      }, { status: response.status })
    }
    
    const data = await response.json()
    
    // Save to file
    const logDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logDir, { recursive: true })
    
    const filename = path.join(logDir, `keepa-debug-${asin}-${Date.now()}.json`)
    await fs.writeFile(filename, JSON.stringify(data, null, 2))
    
    console.log(`Saved Keepa response to: ${filename}`)
    
    // Also save a summary
    const summaryFilename = path.join(logDir, `keepa-summary-${asin}-${Date.now()}.txt`)
    const product = data.products?.[0]
    
    if (product) {
      const summary = `
ASIN: ${asin}
Title: ${product.title || 'Not available'}
Brand: ${product.brand || 'Not available'}
CSV Length: ${product.csv?.length || 0}
Has Price History: ${!!product.csv}
Category: ${product.categoryTree?.join(' > ') || 'Not available'}
Images CSV: ${product.imagesCSV || 'Not available'}

Available Data Types:
${Object.entries(product).filter(([k, v]) => v !== null && v !== -1).map(([k, v]) => `- ${k}: ${typeof v} (${Array.isArray(v) ? `array[${v.length}]` : typeof v === 'object' ? 'object' : v})`).join('\n')}
`
      await fs.writeFile(summaryFilename, summary)
      console.log(`Saved summary to: ${summaryFilename}`)
    }
    
    return NextResponse.json({
      success: true,
      tokensConsumed: data.tokensConsumed,
      tokensLeft: data.tokensLeft,
      productFound: !!product,
      hasData: product ? Object.values(product).some(v => v !== null && v !== -1) : false,
      filename: filename
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}