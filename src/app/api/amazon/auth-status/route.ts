import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock authentication status
    // In a real implementation, this would check actual API credentials
    
    const spApiStatus = {
      status: process.env.AMAZON_SP_API_CLIENT_ID ? 'configured' : 'not_configured',
      hasClientId: !!process.env.AMAZON_SP_API_CLIENT_ID,
      hasClientSecret: !!process.env.AMAZON_SP_API_CLIENT_SECRET,
      hasRefreshToken: !!process.env.AMAZON_SP_API_REFRESH_TOKEN,
      sellerId: process.env.AMAZON_SELLER_ID || null,
      marketplaceIds: process.env.AMAZON_MARKETPLACE_IDS?.split(',') || [],
      region: process.env.AMAZON_SP_API_REGION || 'us-east-1',
      lastChecked: new Date().toISOString()
    }

    const adsApiStatus = {
      status: process.env.AMAZON_ADS_API_CLIENT_ID ? 'configured' : 'not_configured',
      hasClientId: !!process.env.AMAZON_ADS_API_CLIENT_ID,
      hasClientSecret: !!process.env.AMAZON_ADS_API_CLIENT_SECRET,
      hasRefreshToken: !!process.env.AMAZON_ADS_API_REFRESH_TOKEN,
      profileId: process.env.AMAZON_ADS_PROFILE_ID || null,
      advertiserId: process.env.AMAZON_ADVERTISER_ID || null,
      region: process.env.AMAZON_ADS_API_REGION || 'na',
      lastChecked: new Date().toISOString()
    }

    // Check if we can make test API calls
    const testResults = {
      spApi: {
        canConnect: spApiStatus.hasClientId && spApiStatus.hasClientSecret && spApiStatus.hasRefreshToken,
        lastTestResult: null,
        rateLimitStatus: {
          remaining: 95,
          reset: new Date(Date.now() + 3600000).toISOString()
        }
      },
      adsApi: {
        canConnect: adsApiStatus.hasClientId && adsApiStatus.hasClientSecret && adsApiStatus.hasRefreshToken,
        lastTestResult: null,
        rateLimitStatus: {
          remaining: 480,
          reset: new Date(Date.now() + 3600000).toISOString()
        }
      }
    }

    return NextResponse.json({
      success: true,
      auth: {
        spApi: {
          ...spApiStatus,
          status: testResults.spApi.canConnect ? 'ready' : 'not_configured',
          configurationSteps: !testResults.spApi.canConnect ? [
            'Set AMAZON_SP_API_CLIENT_ID in environment variables',
            'Set AMAZON_SP_API_CLIENT_SECRET in environment variables', 
            'Set AMAZON_SP_API_REFRESH_TOKEN in environment variables',
            'Set AMAZON_SELLER_ID in environment variables',
            'Set AMAZON_MARKETPLACE_IDS (comma-separated) in environment variables'
          ] : []
        },
        adsApi: {
          ...adsApiStatus,
          status: testResults.adsApi.canConnect ? 'ready' : 'not_configured',
          configurationSteps: !testResults.adsApi.canConnect ? [
            'Set AMAZON_ADS_API_CLIENT_ID in environment variables',
            'Set AMAZON_ADS_API_CLIENT_SECRET in environment variables',
            'Set AMAZON_ADS_API_REFRESH_TOKEN in environment variables',
            'Set AMAZON_ADS_PROFILE_ID in environment variables'
          ] : []
        }
      },
      testResults,
      documentation: {
        spApi: 'https://developer-docs.amazon.com/sp-api/',
        adsApi: 'https://advertising.amazon.com/API/docs/en-us/',
        authentication: 'https://developer-docs.amazon.com/sp-api/docs/authorization'
      }
    })
    
  } catch (error) {
    console.error('Auth status check error:', error)
    return NextResponse.json({
      error: 'Failed to check authentication status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}