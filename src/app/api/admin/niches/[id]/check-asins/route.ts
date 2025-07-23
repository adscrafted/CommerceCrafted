import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { asins } = await request.json()
    
    if (!asins || !Array.isArray(asins)) {
      return NextResponse.json({ error: 'ASINs array required' }, { status: 400 })
    }
    
    console.log(`🔍 Checking ${asins.length} ASINs for validity`)
    
    const results = []
    
    for (const asin of asins) {
      // Basic ASIN validation
      const isValid = /^B[A-Z0-9]{9}$/.test(asin)
      
      results.push({
        asin,
        valid: isValid,
        reason: isValid ? 'Valid ASIN format' : 'Invalid ASIN format (should be B followed by 9 alphanumeric characters)'
      })
    }
    
    const invalid = results.filter(r => !r.valid)
    
    return NextResponse.json({
      total: asins.length,
      valid: results.filter(r => r.valid).length,
      invalid: invalid.length,
      results,
      problematic_asins: invalid.map(r => r.asin)
    })
    
  } catch (error) {
    console.error('Error checking ASINs:', error)
    return NextResponse.json({
      error: 'Failed to check ASINs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}