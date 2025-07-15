'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  BarChart3
} from 'lucide-react'

interface SyncResult {
  asin: string
  success: boolean
  results: {
    keepa: { success: boolean; error: string | null; data: any }
    spApi: { success: boolean; error: string | null; data: any }
    adsApi: { success: boolean; error: string | null; data: any }
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

export default function DataSyncPage() {
  const [asin, setAsin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncResult[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load sync history on component mount
  useEffect(() => {
    const loadSyncHistory = () => {
      const stored = localStorage.getItem('dataSyncHistory')
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
  const saveSyncHistory = (result: SyncResult) => {
    const updated = [result, ...syncHistory.slice(0, 9)] // Keep last 10 results
    setSyncHistory(updated)
    localStorage.setItem('dataSyncHistory', JSON.stringify(updated))
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
      console.log('Starting comprehensive sync for ASIN:', asin)
      
      const response = await fetch(`/api/sync-all/${asin}`, {
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Pipeline Management</h1>
          <p className="text-gray-600 mt-2">Sync product data from Amazon APIs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5" />
            <span>Start Data Sync</span>
          </CardTitle>
          <CardDescription>
            Sync product data from Keepa, Amazon SP-API, and Ads API
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <span>{isLoading ? 'Syncing...' : 'Sync Data'}</span>
            </Button>
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
              <Badge variant={syncResult.success ? "default" : "destructive"}>
                {syncResult.summary.successRate}% Success
              </Badge>
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
                {/* Keepa Results */}
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
                          <div>✓ Rating trends captured</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.keepa.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* SP-API Results */}
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
                          <div>✓ Pricing information captured</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.spApi.error}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Ads API Results */}
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
                          <div>✓ Competition analysis</div>
                        </div>
                      ) : (
                        <div>✗ {syncResult.results.adsApi.error}</div>
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
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.results.keepa.success)}
                    {getStatusIcon(result.results.spApi.success)}
                    {getStatusIcon(result.results.adsApi.success)}
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