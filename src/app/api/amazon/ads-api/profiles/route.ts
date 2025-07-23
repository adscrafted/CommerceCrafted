import { NextRequest, NextResponse } from 'next/server'
import { adsApiAuth } from '@/lib/amazon-ads-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Amazon Ads API profiles')
    
    // JungleAce pattern: Get all profiles for this account
    const response = await adsApiAuth.makeRequest(
      'GET',
      '/v2/profiles',
      'NA'
    )
    
    console.log('📥 Profiles Response:', JSON.stringify(response, null, 2))
    
    // Transform profiles to include useful info
    const profiles = response.map((profile: any) => ({
      profileId: profile.profileId,
      countryCode: profile.countryCode,
      currencyCode: profile.currencyCode,
      timezone: profile.timezone,
      accountInfo: {
        marketplaceStringId: profile.accountInfo?.marketplaceStringId,
        sellerStringId: profile.accountInfo?.sellerStringId,
        type: profile.accountInfo?.type,
        subType: profile.accountInfo?.subType,
        validPaymentMethod: profile.accountInfo?.validPaymentMethod
      },
      dailyBudget: profile.dailyBudget,
      serving: profile.serving
    }))
    
    return NextResponse.json({
      success: true,
      profiles,
      summary: {
        api: 'Amazon Ads API',
        endpoint: 'Profiles',
        status: 'success',
        dataPoints: profiles.length,
        responseTime: Date.now()
      }
    })
    
  } catch (error) {
    console.error('💥 Amazon Ads API profiles error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profiles',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}