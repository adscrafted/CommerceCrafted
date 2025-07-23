import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('\n🌐 Running connectivity tests...')
  
  const tests = []
  
  // Test 1: Can we reach Google?
  try {
    const googleStart = Date.now()
    const googleResponse = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    tests.push({
      name: 'Google',
      success: googleResponse.ok,
      status: googleResponse.status,
      time: Date.now() - googleStart
    })
  } catch (error) {
    tests.push({
      name: 'Google',
      success: false,
      error: error.message
    })
  }
  
  // Test 2: Can we reach Amazon?
  try {
    const amazonStart = Date.now()
    const amazonResponse = await fetch('https://www.amazon.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    tests.push({
      name: 'Amazon',
      success: amazonResponse.ok,
      status: amazonResponse.status,
      time: Date.now() - amazonStart
    })
  } catch (error) {
    tests.push({
      name: 'Amazon',
      success: false,
      error: error.message
    })
  }
  
  // Test 3: Can we reach Keepa?
  try {
    const keepaStart = Date.now()
    const keepaResponse = await fetch('https://keepa.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    tests.push({
      name: 'Keepa',
      success: keepaResponse.ok,
      status: keepaResponse.status,
      time: Date.now() - keepaStart
    })
  } catch (error) {
    tests.push({
      name: 'Keepa',
      success: false,
      error: error.message
    })
  }
  
  // Test 4: Local API endpoint
  try {
    const localStart = Date.now()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const localResponse = await fetch(`${baseUrl}/api/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    tests.push({
      name: 'Local API',
      success: localResponse.ok,
      status: localResponse.status,
      time: Date.now() - localStart,
      baseUrl
    })
  } catch (error) {
    tests.push({
      name: 'Local API',
      success: false,
      error: error.message,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    })
  }
  
  const allSuccess = tests.every(t => t.success)
  
  console.log('🌐 Connectivity test results:', tests)
  
  return NextResponse.json({
    success: allSuccess,
    tests,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasKeepaKey: !!process.env.KEEPA_API_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set'
    }
  })
}