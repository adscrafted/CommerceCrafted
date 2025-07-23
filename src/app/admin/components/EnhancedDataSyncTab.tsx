'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  RefreshCw, 
  Database, 
  TrendingUp, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  PlayCircle,
  BarChart3,
  ExternalLink,
  MessageSquare,
  Users
} from 'lucide-react'

interface EnhancedSyncResult {
  asin: string
  success: boolean
  results: {
    keepa: { success: boolean; error: string | null; data: any }
    spApi: { success: boolean; error: string | null; data: any }
    adsApi: { success: boolean; error: string | null; data: any }
    openai: { success: boolean; error: string | null; data: any }
    reviews: { success: boolean; error: string | null; data: any }
    reddit: { success: boolean; error: string | null; data: any }
    startTime: string
    endTime: string
    duration: number
  }
  summary: {
    successCount: number
    totalCount: number
    successRate: number
    duration: number
  }
}

export default function EnhancedDataSyncTab() {
  const [asin, setAsin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<EnhancedSyncResult | null>(null)
  const [syncHistory, setSyncHistory] = useState<EnhancedSyncResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [includeReviews, setIncludeReviews] = useState(true)
  const [includeReddit, setIncludeReddit] = useState(true)

  // Load sync history on component mount
  useEffect(() => {
    const loadSyncHistory = () => {
      const stored = localStorage.getItem('enhancedDataSyncHistory')
      if (stored) {
        try {
          setSyncHistory(JSON.parse(stored))
        } catch (e) {
          console.error('Error parsing sync history:', e)
        }
      }
    }
    loadSyncHistory()
  }, [])

  // Save sync history to localStorage
  const saveSyncHistory = (result: EnhancedSyncResult) => {
    const updated = [result, ...syncHistory.slice(0, 9)] // Keep last 10 results
    setSyncHistory(updated)
    localStorage.setItem('enhancedDataSyncHistory', JSON.stringify(updated))
  }

  const handleSync = async () => {
    if (!asin.trim()) {
      setError('Please enter an ASIN')
      return
    }

    setIsLoading(true)
    setError(null)
    setSyncResult(null)

    try {
      console.log('Starting enhanced comprehensive sync for ASIN:', asin)
      
      // Use enhanced endpoint if reviews or reddit are enabled
      const endpoint = (includeReviews || includeReddit) 
        ? `/api/sync-all-enhanced/${asin}`
        : `/api/sync-all/${asin}`
      
      const response = await fetch(endpoint, {
        method: 'POST'
      })

      const result = await response.json()

      if (response.ok || response.status === 207) { // 207 = partial success
        setSyncResult(result)
        saveSyncHistory(result)
        console.log('Sync completed:', result.summary)
      } else {
        setError(result.error || 'Sync failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      console.error('Sync error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSync = (historicalAsin: string) => {
    setAsin(historicalAsin)
    setError(null)
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600'
  }

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Data Pipeline</h2>
          <p className="text-gray-600 mt-1">Sync product data from all APIs including reviews and social insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* API Overview Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Keepa</span>
            </CardTitle>
            <CardDescription className="text-xs">Price & BSR history</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>SP-API</span>
            </CardTitle>
            <CardDescription className="text-xs">Catalog data</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Ads API</span>
            </CardTitle>
            <CardDescription className="text-xs">Keywords & PPC</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>OpenAI</span>
            </CardTitle>
            <CardDescription className="text-xs">AI insights</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Reviews</span>
            </CardTitle>
            <CardDescription className="text-xs">Customer sentiment</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Reddit</span>
            </CardTitle>
            <CardDescription className="text-xs">Social insights</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5" />
            <span>Start Enhanced Data Sync</span>
          </CardTitle>
          <CardDescription>
            Comprehensive sync from all data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Product ASIN
                </label>
                <Input
                  placeholder="Enter ASIN (e.g., B08MVBRNKV)"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value.toUpperCase())}
                  className="uppercase"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSync}
                disabled={isLoading || !asin.trim()}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Syncing...' : 'Sync All Data'}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="reviews" 
                  checked={includeReviews}
                  onCheckedChange={setIncludeReviews}
                  disabled={isLoading}
                />
                <Label htmlFor="reviews" className="text-sm">Include Amazon Reviews</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="reddit" 
                  checked={includeReddit}
                  onCheckedChange={setIncludeReddit}
                  disabled={isLoading}
                />
                <Label htmlFor="reddit" className="text-sm">Include Reddit Insights</Label>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Results */}
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Sync Results for {syncResult.asin}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={syncResult.success ? "default" : "destructive"}>
                  {syncResult.summary.successRate}% Success
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/products/${syncResult.asin}`, '_blank')}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View Product</span>
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Completed in {formatDuration(syncResult.summary.duration)} • 
              {syncResult.summary.successCount}/{syncResult.summary.totalCount} APIs successful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={syncResult.summary.successRate} className="h-2" />
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Row 1: Core APIs */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">Keepa API</span>
                      </div>
                      {getStatusIcon(syncResult.results.keepa.success)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm ${getStatusColor(syncResult.results.keepa.success)}`}>
                      {syncResult.results.keepa.success ? (
                        <div>
                          <div>✓ Price history synced</div>
                          <div>✓ BSR data updated</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.keepa.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">SP-API</span>
                      </div>
                      {getStatusIcon(syncResult.results.spApi.success)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm ${getStatusColor(syncResult.results.spApi.success)}`}>
                      {syncResult.results.spApi.success ? (
                        <div>
                          <div>✓ Catalog data synced</div>
                          <div>✓ Product details updated</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.spApi.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span className="font-medium">Ads API</span>
                      </div>
                      {getStatusIcon(syncResult.results.adsApi.success)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm ${getStatusColor(syncResult.results.adsApi.success)}`}>
                      {syncResult.results.adsApi.success ? (
                        <div>
                          <div>✓ Keywords discovered</div>
                          <div>✓ Bid recommendations</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.adsApi.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Row 2: Enhanced APIs */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Reviews</span>
                      </div>
                      {getStatusIcon(syncResult.results.reviews.success)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm ${getStatusColor(syncResult.results.reviews.success)}`}>
                      {syncResult.results.reviews.success ? (
                        <div>
                          <div>✓ Reviews scraped</div>
                          <div>✓ Sentiment analyzed</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.reviews.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Reddit</span>
                      </div>
                      {getStatusIcon(syncResult.results.reddit.success)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm ${getStatusColor(syncResult.results.reddit.success)}`}>
                      {syncResult.results.reddit.success ? (
                        <div>
                          <div>✓ Posts scraped</div>
                          <div>✓ Trends analyzed</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.reddit.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">OpenAI</span>
                      </div>
                      {getStatusIcon(syncResult.results.openai.success)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-sm ${getStatusColor(syncResult.results.openai.success)}`}>
                      {syncResult.results.openai.success ? (
                        <div>
                          <div>✓ AI analysis complete</div>
                          <div>✓ Insights generated</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.openai.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Sync History</span>
            </CardTitle>
            <CardDescription>
              Last {syncHistory.length} sync attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncHistory.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSync(result.asin)}
                      className="text-xs"
                    >
                      {result.asin}
                    </Button>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.summary.successRate}%
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatDuration(result.summary.duration)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(result.results.keepa.success)}
                    {getStatusIcon(result.results.spApi.success)}
                    {getStatusIcon(result.results.adsApi.success)}
                    {getStatusIcon(result.results.reviews.success)}
                    {getStatusIcon(result.results.reddit.success)}
                    {getStatusIcon(result.results.openai.success)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}