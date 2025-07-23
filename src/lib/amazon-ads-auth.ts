// Amazon Ads API Authentication
// Based on JungleAce implementation pattern

import { NextRequest } from 'next/server'

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

interface CachedToken {
  accessToken: string
  expiresAt: number
}

export class AmazonAdsAuth {
  private static instance: AmazonAdsAuth | null = null
  private cachedToken: CachedToken | null = null
  
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly refreshToken: string
  private readonly profileId: string
  
  private readonly endpoints = {
    NA: 'https://advertising-api.amazon.com',
    EU: 'https://advertising-api-eu.amazon.com',
    FE: 'https://advertising-api-fe.amazon.com'
  }
  
  private readonly tokenEndpoint = 'https://api.amazon.com/auth/o2/token'
  
  private constructor() {
    // Get environment variables with defaults for build time
    this.clientId = process.env.ADS_API_CLIENT_ID || ''
    this.clientSecret = process.env.ADS_API_CLIENT_SECRET || ''
    this.refreshToken = process.env.ADS_API_REFRESH_TOKEN || ''
    this.profileId = process.env.ADS_API_PROFILE_ID || ''
  }
  
  public static getInstance(): AmazonAdsAuth {
    if (!AmazonAdsAuth.instance) {
      AmazonAdsAuth.instance = new AmazonAdsAuth()
    }
    return AmazonAdsAuth.instance
  }
  
  public isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.refreshToken)
  }
  
  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`)
      }
      
      const data: TokenResponse = await response.json()
      
      // Cache the token with expiration
      this.cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 300) * 1000 // Subtract 5 minutes for safety
      }
      
      return data.access_token
    } catch (error) {
      console.error('Error refreshing Amazon Ads API token:', error)
      throw error
    }
  }
  
  public async getAccessToken(): Promise<string> {
    // Check if we have a cached token that's still valid
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.accessToken
    }
    
    // Otherwise, refresh the token
    return await this.refreshAccessToken()
  }
  
  public async createHeaders(customProfileId?: string): Promise<Record<string, string>> {
    const accessToken = await this.getAccessToken()
    
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Amazon-Advertising-API-ClientId': this.clientId,
      'Amazon-Advertising-API-Scope': customProfileId || this.profileId,
      'Content-Type': 'application/json',
      'User-Agent': 'CommerceCrafted/1.0 (Language=TypeScript)'
    }
  }
  
  public async getUSProfile(): Promise<string | null> {
    try {
      const headers = {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Amazon-Advertising-API-ClientId': this.clientId,
        'Amazon-Advertising-API-Scope': this.profileId,
        'Content-Type': 'application/json'
      }
      
      const response = await fetch(`${this.endpoints.NA}/v2/profiles`, {
        method: 'GET',
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get profiles: ${response.status}`)
      }
      
      const profiles = await response.json()
      
      // Find US marketplace profile
      const usProfile = profiles.find((profile: any) => 
        profile.countryCode === 'US' && 
        profile.accountInfo?.marketplaceStringId === 'ATVPDKIKX0DER'
      )
      
      return usProfile?.profileId?.toString() || null
    } catch (error) {
      console.error('Failed to get US profile:', error)
      return null
    }
  }
  
  public async makeRequest(
    method: string,
    endpoint: string,
    queryParams: Record<string, string> = {},
    body: any = null
  ): Promise<any> {
    const baseUrl = this.endpoints.NA // Default to NA like JungleAce
    const queryString = new URLSearchParams(queryParams).toString()
    const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`
    
    const headers = await this.createHeaders()

    const requestOptions: RequestInit = {
      method,
      headers,
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body)
    }

    const response = await fetch(url, requestOptions)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Amazon Ads API request failed: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  public async makeRequestWithCustomHeaders(
    method: string,
    endpoint: string,
    queryParams: Record<string, string> = {},
    body: any = null,
    customHeaders: Record<string, string> = {}
  ): Promise<any> {
    const baseUrl = this.endpoints.NA
    const queryString = new URLSearchParams(queryParams).toString()
    const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`
    
    const baseHeaders = await this.createHeaders()
    const headers = { ...baseHeaders, ...customHeaders }

    const requestOptions: RequestInit = {
      method,
      headers,
    }

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body)
    }

    const response = await fetch(url, requestOptions)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Amazon Ads API request failed: ${response.status} - ${errorText}`)
    }

    return response.json()
  }
}

// Export function to get singleton instance
export function getAdsApiAuth() {
  return AmazonAdsAuth.getInstance()
}

// For backward compatibility
export const adsApiAuth = {
  makeRequest: async (
    method: string,
    endpoint: string,
    queryParams: Record<string, string> = {},
    body: any = null
  ) => {
    const instance = getAdsApiAuth()
    if (!instance.isConfigured()) {
      throw new Error('Amazon Ads API credentials not configured')
    }
    return instance.makeRequest(method, endpoint, queryParams, body)
  },
  makeRequestWithCustomHeaders: async (
    method: string,
    endpoint: string,
    queryParams: Record<string, string> = {},
    body: any = null,
    customHeaders: Record<string, string> = {}
  ) => {
    const instance = getAdsApiAuth()
    if (!instance.isConfigured()) {
      throw new Error('Amazon Ads API credentials not configured')
    }
    return instance.makeRequestWithCustomHeaders(method, endpoint, queryParams, body, customHeaders)
  },
  getAccessToken: async () => {
    const instance = getAdsApiAuth()
    if (!instance.isConfigured()) {
      throw new Error('Amazon Ads API credentials not configured')
    }
    return instance.getAccessToken()
  },
  isConfigured: () => {
    const instance = getAdsApiAuth()
    return instance.isConfigured()
  }
}

// Middleware helper for API routes
export async function requireAdsApiAuth(request: NextRequest) {
  try {
    const auth = getAdsApiAuth()
    if (!auth.isConfigured()) {
      return {
        success: false,
        error: 'Amazon Ads API credentials not configured'
      }
    }
    await auth.getAccessToken() // Verify we can get a token
    return { success: true, auth }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}