import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Test creating a niche via the admin API
    const testData = {
      nicheName: 'Test Niche ' + new Date().toISOString(),
      asins: 'B08N5WRWNW,B07ZPKN6YR',
      scheduledDate: new Date().toISOString()
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/niches`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify(testData)
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data,
      testData,
      env: {
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}