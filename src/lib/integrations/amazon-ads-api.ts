// Amazon Ads API Integration
// Docs: https://advertising.amazon.com/API/docs/

interface AdsApiConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  marketplaceId: string
  profileId: string
}

interface AdsApiTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

interface KeywordSuggestion {
  keywordText: string
  matchType: 'BROAD' | 'PHRASE' | 'EXACT'
  bid: {
    currency: string
    amount: number
  }
  state: 'ENABLED' | 'PAUSED' | 'ARCHIVED'
}

interface TargetingClause {
  targetId: number
  adGroupId: number
  campaignId: number
  keywordText: string
  matchType: string
  state: string
  bid: number
  bidCurrency: string
}

interface KeywordMetrics {
  keywordId: string
  keyword: string
  matchType: string
  impressions: number
  clicks: number
  cost: number
  sales: number
  orders: number
  ctr: number
  cpc: number
  acos: number
  roas: number
  conversions: number
  conversionRate: number
}

interface SearchTermReport {
  date: string
  campaignName: string
  adGroupName: string
  keyword: string
  matchType: string
  searchTerm: string
  impressions: number
  clicks: number
  cost: number
  sales: number
  orders: number
  ctr: number
  cpc: number
  acos: number
  conversionRate: number
}

interface BidRecommendation {
  keyword: string
  matchType: string
  suggestedBid: {
    rangeStart: number
    rangeEnd: number
    suggested: number
  }
  adGroupId?: number
  campaignId?: number
}

class AmazonAdsApi {
  private config: AdsApiConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      clientId: process.env.ADS_API_CLIENT_ID || '',
      clientSecret: process.env.ADS_API_CLIENT_SECRET || '',
      refreshToken: process.env.ADS_API_REFRESH_TOKEN || '',
      marketplaceId: process.env.ADS_API_MARKETPLACE_ID || '',
      profileId: process.env.ADS_API_PROFILE_ID || ''
    }

    if (!this.config.clientId || !this.config.clientSecret || !this.config.refreshToken) {
      console.warn('Amazon Ads API credentials not fully configured')
    }
  }

  /**
   * Get access token using refresh token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const tokenUrl = 'https://api.amazon.com/auth/o2/token'
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        })
      })

      if (!response.ok) {
        throw new Error(`Ads API token request failed: ${response.status} ${response.statusText}`)
      }

      const tokenData: AdsApiTokenResponse = await response.json()
      
      this.accessToken = tokenData.access_token
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 60) * 1000)
      
      console.log('Ads API access token refreshed successfully')
      return this.accessToken

    } catch (error) {
      console.error('Error getting Ads API access token:', error)
      throw error
    }
  }

  /**
   * Make authenticated request to Ads API
   */
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const accessToken = await this.getAccessToken()
    const baseUrl = 'https://advertising-api.amazon.com'
    const url = `${baseUrl}${endpoint}`

    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Amazon-Advertising-API-ClientId': this.config.clientId,
      'Amazon-Advertising-API-Scope': this.config.profileId
    }

    const requestOptions: RequestInit = {
      method,
      headers
    }

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body)
    }

    console.log(`Making Ads API request to: ${endpoint}`)

    try {
      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ads API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Ads API request error:', error)
      throw error
    }
  }

  /**
   * Get keyword suggestions for a product
   */
  async getKeywordSuggestions(asin: string, maxResults: number = 100): Promise<KeywordSuggestion[]> {
    try {
      const endpoint = '/v2/asins/suggested/keywords'
      const body = {
        asins: [asin],
        maxNumTargets: maxResults,
        sortDimension: 'CLICKS'
      }

      const response = await this.makeRequest(endpoint, 'POST', body)
      
      if (response && response[asin]) {
        return response[asin].suggestedKeywords || []
      }

      return []
    } catch (error) {
      console.error('Error fetching keyword suggestions:', error)
      return []
    }
  }

  /**
   * Get bid recommendations for keywords
   */
  async getBidRecommendations(keywords: string[], matchType: string = 'BROAD'): Promise<BidRecommendation[]> {
    try {
      const endpoint = '/v2/keywords/bidRecommendations'
      const body = {
        keywords: keywords.map(keyword => ({
          keyword,
          matchType
        }))
      }

      const response = await this.makeRequest(endpoint, 'POST', body)
      
      if (response && response.recommendations) {
        return response.recommendations
      }

      return []
    } catch (error) {
      console.error('Error fetching bid recommendations:', error)
      return []
    }
  }

  /**
   * Get search term report data
   */
  async getSearchTermReport(
    startDate: string, 
    endDate: string, 
    campaignType: string = 'sponsoredProducts'
  ): Promise<SearchTermReport[]> {
    try {
      const endpoint = '/reporting/reports'
      const body = {
        reportDate: startDate,
        metrics: [
          'impressions',
          'clicks',
          'cost',
          'sales',
          'orders',
          'ctr',
          'cpc',
          'acos',
          'conversionRate'
        ],
        campaignType,
        segment: 'query',
        format: 'JSON'
      }

      const response = await this.makeRequest(endpoint, 'POST', body)
      
      if (response && response.reportId) {
        // Poll for report completion
        const reportData = await this.downloadReport(response.reportId)
        return this.parseSearchTermReport(reportData)
      }

      return []
    } catch (error) {
      console.error('Error fetching search term report:', error)
      return []
    }
  }

  /**
   * Download completed report
   */
  private async downloadReport(reportId: string): Promise<any> {
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      try {
        const statusResponse = await this.makeRequest(`/reporting/reports/${reportId}`)
        
        if (statusResponse.status === 'SUCCESS') {
          const downloadResponse = await fetch(statusResponse.location)
          return await downloadResponse.json()
        } else if (statusResponse.status === 'FAILURE') {
          throw new Error('Report generation failed')
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        console.error('Error downloading report:', error)
        attempts++
      }
    }
    
    throw new Error('Report download timed out')
  }

  /**
   * Parse search term report data
   */
  private parseSearchTermReport(reportData: any): SearchTermReport[] {
    if (!Array.isArray(reportData)) {
      return []
    }

    return reportData.map((row: any) => ({
      date: row.date,
      campaignName: row.campaignName,
      adGroupName: row.adGroupName,
      keyword: row.keyword,
      matchType: row.matchType,
      searchTerm: row.searchTerm,
      impressions: parseInt(row.impressions) || 0,
      clicks: parseInt(row.clicks) || 0,
      cost: parseFloat(row.cost) || 0,
      sales: parseFloat(row.sales) || 0,
      orders: parseInt(row.orders) || 0,
      ctr: parseFloat(row.ctr) || 0,
      cpc: parseFloat(row.cpc) || 0,
      acos: parseFloat(row.acos) || 0,
      conversionRate: parseFloat(row.conversionRate) || 0
    }))
  }

  /**
   * Transform keyword data for database storage
   */
  transformKeywordsForDatabase(asin: string, suggestions: KeywordSuggestion[], bidRecommendations: BidRecommendation[] = []) {
    const keywordAnalysis = suggestions.map(suggestion => {
      const bidRec = bidRecommendations.find(rec => 
        rec.keyword.toLowerCase() === suggestion.keywordText.toLowerCase() &&
        rec.matchType === suggestion.matchType
      )

      return {
        keyword: suggestion.keywordText,
        matchType: suggestion.matchType,
        suggestedBid: suggestion.bid.amount,
        bidCurrency: suggestion.bid.currency,
        bidRecommendation: bidRec ? {
          rangeStart: bidRec.suggestedBid.rangeStart,
          rangeEnd: bidRec.suggestedBid.rangeEnd,
          suggested: bidRec.suggestedBid.suggested
        } : null,
        state: suggestion.state,
        searchVolume: null, // Would need additional API calls to get this
        competition: 'UNKNOWN', // Would need additional analysis
        relevanceScore: null // Could be calculated based on various factors
      }
    })

    return {
      asin,
      primaryKeywords: keywordAnalysis.slice(0, 20), // Top 20 keywords
      longtailKeywords: keywordAnalysis.slice(20, 100), // Long-tail opportunities
      totalKeywords: keywordAnalysis.length,
      avgCpc: keywordAnalysis.reduce((sum, k) => sum + k.suggestedBid, 0) / keywordAnalysis.length,
      keywordOpportunities: keywordAnalysis.filter(k => k.suggestedBid < 1.0).length, // Low competition
      lastUpdated: new Date(),
      rawData: {
        suggestions,
        bidRecommendations
      }
    }
  }

  /**
   * Get comprehensive keyword data for ASIN
   */
  async getCompleteKeywordData(asin: string) {
    try {
      console.log('Fetching complete Ads API keyword data for ASIN:', asin)
      
      // Fetch keyword suggestions
      const suggestions = await this.getKeywordSuggestions(asin, 100)
      
      if (suggestions.length === 0) {
        console.log('No keyword suggestions found for ASIN:', asin)
        return null
      }

      // Get bid recommendations for top keywords
      const topKeywords = suggestions.slice(0, 20).map(s => s.keywordText)
      const bidRecommendations = await this.getBidRecommendations(topKeywords)

      return this.transformKeywordsForDatabase(asin, suggestions, bidRecommendations)
    } catch (error) {
      console.error('Error fetching complete keyword data:', error)
      return null
    }
  }
}

export const amazonAdsApi = new AmazonAdsApi()
export type { KeywordSuggestion, BidRecommendation, SearchTermReport, KeywordMetrics }