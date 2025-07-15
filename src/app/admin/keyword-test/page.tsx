'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, DollarSign, Target, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Marketplace configurations
const marketplaces = {
  'US': { name: 'United States', spApiId: 'ATVPDKIKX0DER', adsApiId: 1 },
  'CA': { name: 'Canada', spApiId: 'A2EUQ1WTGCTBG2', adsApiId: 2 },
  'MX': { name: 'Mexico', spApiId: 'A1AM78C64UM0Y8', adsApiId: 3 },
  'UK': { name: 'United Kingdom', spApiId: 'A1F83G8C2ARO7P', adsApiId: 4 },
  'DE': { name: 'Germany', spApiId: 'A1PA6795UKMFR9', adsApiId: 5 },
  'FR': { name: 'France', spApiId: 'A13V1IB3VIYZZH', adsApiId: 6 },
  'IT': { name: 'Italy', spApiId: 'APJ6JRA9NG5V4', adsApiId: 7 },
  'ES': { name: 'Spain', spApiId: 'A1RKKUPIHCS9HS', adsApiId: 8 },
  'JP': { name: 'Japan', spApiId: 'A1VC38T7YXB528', adsApiId: 9 },
  'AU': { name: 'Australia', spApiId: 'A39IBJ37TRP1C6', adsApiId: 10 }
}

export default function KeywordTestPage() {
  const [asins, setAsins] = useState('B014LDT0ZM')
  const [groupName, setGroupName] = useState('Test Group')
  const [marketplace, setMarketplace] = useState('US')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)

  // Fetch keyword targets and enrichment from ASINs
  const fetchKeywordTargets = async () => {
    if (!asins.trim()) {
      setError('Please enter at least one ASIN')
      return
    }

    // Parse ASINs (comma or space separated)
    const asinList = asins.trim()
      .split(/[,\s]+/)
      .map(a => a.trim())
      .filter(a => a.length > 0)

    if (asinList.length === 0) {
      setError('Please enter valid ASINs')
      return
    }

    setLoading(true)
    setError(null)
    setErrorDetails(null)
    setResult(null)

    // Process each ASIN and combine results
    const allKeywords: any[] = []
    const enrichmentData: any = {
      groupName,
      asins: asinList,
      totalKeywords: 0,
      avgSearchVolume: 0,
      avgCPC: 0,
      marketOpportunity: 'UNKNOWN',
      primaryKeywords: []
    }

    try {
      for (const asin of asinList) {
        const requestBody = {
          asin: asin.trim(),
          marketplace: marketplaces[marketplace].adsApiId
        }

        const response = await fetch('/api/amazon/ads-api/enrichment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error(`Failed to fetch data for ASIN ${asin}:`, data.error)
          continue // Skip this ASIN and continue with others
        }

        // Combine keywords from all ASINs
        if (data.keywords) {
          allKeywords.push(...data.keywords)
        }

        // Update enrichment data
        if (data.enrichment) {
          enrichmentData.primaryKeywords.push(...(data.enrichment.primaryKeywords || []))
        }
      }

      // Process combined results
      const keywordMap = new Map()
      
      // Deduplicate and analyze keywords
      allKeywords.forEach(kw => {
        const existing = keywordMap.get(kw.keyword)
        if (existing) {
          // Track which ASINs share this keyword (cannibalization risk)
          existing.asinCount = (existing.asinCount || 1) + 1
          existing.searchVolume = Math.max(existing.searchVolume || 0, kw.searchVolume || 0)
          existing.suggestedBid = Math.max(existing.suggestedBid || 0, kw.suggestedBid || 0)
        } else {
          keywordMap.set(kw.keyword, { ...kw, asinCount: 1 })
        }
      })

      const uniqueKeywords = Array.from(keywordMap.values())
      const cannibalizedKeywords = uniqueKeywords.filter(kw => kw.asinCount > 1)

      // Calculate group metrics
      enrichmentData.totalKeywords = uniqueKeywords.length
      enrichmentData.cannibalizedKeywords = cannibalizedKeywords.length
      enrichmentData.avgSearchVolume = uniqueKeywords.length > 0 
        ? Math.floor(uniqueKeywords.reduce((sum, kw) => sum + (kw.searchVolume || 0), 0) / uniqueKeywords.length)
        : 0
      enrichmentData.avgCPC = uniqueKeywords.length > 0
        ? uniqueKeywords.reduce((sum, kw) => sum + (kw.suggestedBid || 0), 0) / uniqueKeywords.length
        : 0
      enrichmentData.marketOpportunity = enrichmentData.avgSearchVolume > 50000 ? 'HIGH' : 
                                       enrichmentData.avgSearchVolume > 20000 ? 'MEDIUM' : 'LOW'
      enrichmentData.primaryKeywords = [...new Set(enrichmentData.primaryKeywords)].slice(0, 10)

      setResult({
        enrichment: enrichmentData,
        keywords: uniqueKeywords.sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0)),
        cannibalization: {
          affected: cannibalizedKeywords,
          risk: cannibalizedKeywords.length > uniqueKeywords.length * 0.3 ? 'HIGH' :
                cannibalizedKeywords.length > uniqueKeywords.length * 0.1 ? 'MEDIUM' : 'LOW',
          recommendation: cannibalizedKeywords.length > 0 
            ? 'Consider assigning primary keywords to hero ASINs to avoid internal competition'
            : 'No significant keyword overlap detected'
        },
        summary: {
          api: 'Amazon Ads API',
          endpoint: 'Keyword Group Enrichment',
          status: 'success',
          dataPoints: uniqueKeywords.length,
          asinsProcessed: asinList.length,
          responseTime: Date.now()
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setErrorDetails({
        endpoint: '/api/amazon/ads-api/enrichment',
        method: 'POST',
        requestBody: { asins: asinList, marketplace: marketplaces[marketplace].adsApiId },
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        status: 'failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Amazon Ads API Keyword Group Processor</CardTitle>
          <CardDescription>
            Process multiple ASINs as a keyword group to fetch comprehensive keyword targets and enrichment data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name (e.g., Wireless Headphones Group)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asins">ASINs (comma or space separated)</Label>
              <textarea
                id="asins"
                className="w-full min-h-[100px] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-input bg-background rounded-md"
                placeholder="Enter ASINs separated by commas or spaces&#10;e.g., B014LDT0ZM, B08N5WRWNW, B07FZ8S74R"
                value={asins}
                onChange={(e) => setAsins(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {asins.trim() && `${asins.trim().split(/[,\s]+/).filter(a => a.length > 0).length} ASIN(s) entered`}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace">Marketplace</Label>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger id="marketplace">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(marketplaces).map(([code, info]) => (
                    <SelectItem key={code} value={code}>
                      {info.name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* API Status Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Keyword Group Processor</AlertTitle>
            <AlertDescription>
              Process multiple ASINs as a group to discover all associated keyword targets, identify keyword cannibalization risks, and get comprehensive PPC strategy recommendations.
            </AlertDescription>
          </Alert>

          {/* Action Button */}
          <Button 
            onClick={fetchKeywordTargets}
            disabled={loading || !asins.trim()}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Keyword Group...
              </>
            ) : (
              <>
                <Target className="h-5 w-5" />
                Process Keyword Group
              </>
            )}
          </Button>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Amazon Ads API Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                From multiple ASINs in a group, this tool provides:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <strong>Keyword Targets:</strong> Comprehensive keyword mapping across all ASINs with overlap analysis
                  </div>
                </li>
                <li className="flex gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <strong>Cannibalization Analysis:</strong> Identify keyword conflicts and optimization opportunities across ASINs
                  </div>
                </li>
                <li className="flex gap-2">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <strong>Group Strategy:</strong> Optimized keyword distribution and bid recommendations for the entire group
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Current Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client ID:</span>
                <span className="font-mono">...{process.env.NEXT_PUBLIC_ADS_API_CLIENT_ID?.slice(-8) || 'Configured'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profile ID:</span>
                <span className="font-mono">{process.env.NEXT_PUBLIC_ADS_API_PROFILE_ID || 'Configured'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span>North America (NA)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Endpoints:</span>
                <span className="text-green-600">✓ Implemented</span>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Error Details for Debugging */}
          {errorDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Error Details (for debugging)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto p-2 bg-muted rounded">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Success Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary */}
              {result.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>API Response Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API:</span>
                      <span>{result.summary.api}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <span>{result.summary.endpoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-green-600">{result.summary.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Keywords Found:</span>
                      <span>{result.summary.dataPoints}</span>
                    </div>
                    {result.summary.asinsProcessed && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ASINs Processed:</span>
                        <span>{result.summary.asinsProcessed}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Enrichment Summary */}
              {result.enrichment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Product Context</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ASIN:</span>
                            <span className="font-mono">{result.enrichment.asin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Keywords:</span>
                            <span>{result.enrichment.totalKeywords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Market Opportunity:</span>
                            <span className="font-medium">{result.enrichment.marketOpportunity}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Market Metrics</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Search Volume:</span>
                            <span>{result.enrichment.avgSearchVolume?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg CPC:</span>
                            <span>${result.enrichment.avgCPC?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Monthly Cost:</span>
                            <span>${result.enrichment.estimatedMonthlyCost?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {result.enrichment.primaryKeywords && result.enrichment.primaryKeywords.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Top Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.enrichment.primaryKeywords.map((kw: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cannibalization Analysis */}
              {result.cannibalization && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Cannibalization Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Risk Level</h4>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          result.cannibalization.risk === 'HIGH' ? 'bg-red-100 text-red-700' :
                          result.cannibalization.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {result.cannibalization.risk} RISK
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Affected Keywords</h4>
                        <div className="text-2xl font-bold">{result.cannibalization.affected.length}</div>
                        <p className="text-sm text-muted-foreground">keywords shared between ASINs</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Overlap Percentage</h4>
                        <div className="text-2xl font-bold">
                          {result.keywords.length > 0 
                            ? ((result.cannibalization.affected.length / result.keywords.length) * 100).toFixed(1) 
                            : 0}%
                        </div>
                        <p className="text-sm text-muted-foreground">of total keywords</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Recommendation</h4>
                      <p className="text-sm">{result.cannibalization.recommendation}</p>
                    </div>
                    {result.cannibalization.affected.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Top Cannibalized Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.cannibalization.affected.slice(0, 10).map((kw: any, index: number) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm flex items-center gap-1"
                            >
                              {kw.keyword}
                              <span className="text-xs bg-yellow-200 px-1 rounded">×{kw.asinCount}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Keywords Table */}
              {result.keywords && result.keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Targets ({result.keywords.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Keyword</th>
                            <th className="text-left py-2">Match Type</th>
                            <th className="text-right py-2">Search Volume</th>
                            <th className="text-left py-2">Competition</th>
                            <th className="text-right py-2">Suggested Bid</th>
                            <th className="text-right py-2">Est. Clicks</th>
                            <th className="text-right py-2">Est. Orders</th>
                            <th className="text-right py-2">Relevance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.keywords.slice(0, 20).map((kw: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="py-2 font-medium">{kw.keyword}</td>
                              <td className="py-2">{kw.matchType || 'BROAD'}</td>
                              <td className="py-2 text-right">{kw.searchVolume?.toLocaleString() || '0'}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  kw.competitionLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                                  kw.competitionLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {kw.competitionLevel || 'UNKNOWN'}
                                </span>
                              </td>
                              <td className="py-2 text-right">${kw.suggestedBid?.toFixed(2) || '0.00'}</td>
                              <td className="py-2 text-right">{kw.estimatedClicks || '0'}</td>
                              <td className="py-2 text-right">{kw.estimatedOrders || '0'}</td>
                              <td className="py-2 text-right">{(kw.relevanceScore * 100).toFixed(0)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {result.keywords.length > 20 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Showing 20 of {result.keywords.length} keywords
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Raw Response */}
              <Card>
                <CardHeader>
                  <CardTitle>Raw API Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto p-2 bg-muted rounded max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}