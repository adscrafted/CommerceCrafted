'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, Clock, Activity, Package } from 'lucide-react'

interface NicheProgressDialogProps {
  nicheId: string
  nicheName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ProgressData {
  niche: {
    id: string
    name: string
    status: string
    totalAsins: number
    createdAt: string
    processStartedAt?: string
    processCompletedAt?: string
    errorMessage?: string
  }
  progress: {
    currentStep: string
    completedAsins: number
    totalAsins: number
    percentComplete: number
    currentAsin?: string
    apiCallsMade: number
    errors: string[]
    lastUpdate: string
  }
  summary: {
    totalProducts: number
    totalKeywords: number
    avgBsr: number
    avgPrice: number
    avgRating: number
    totalReviews: number
  }
}

export default function NicheProgressDialog({ nicheId, nicheName, open, onOpenChange }: NicheProgressDialogProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const fetchProgress = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/niches/${nicheId}/progress`)
      
      // Check if response is ok
      if (!response.ok) {
        console.error('Progress API error:', response.status, response.statusText)
        return
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType)
        return
      }
      
      const data = await response.json()
      
      if (!data || !data.progress) {
        console.error('Invalid progress data:', data)
        return
      }
      
      setProgressData(data)
      
      // Add log entry
      const logEntry = `[${new Date().toLocaleTimeString()}] ${data.progress.currentStep} - ${data.progress.completedAsins}/${data.progress.totalAsins} ASINs complete`
      setLogs(prev => [...prev.slice(-19), logEntry]) // Keep last 20 logs
      
    } catch (error) {
      console.error('Failed to fetch progress:', error)
      // Don't crash the dialog, just log the error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchProgress()
      
      if (autoRefresh) {
        const interval = setInterval(fetchProgress, 3000) // Refresh every 3 seconds
        return () => clearInterval(interval)
      }
    }
  }, [open, nicheId, autoRefresh])

  if (!progressData) return null

  const { niche, progress, summary } = progressData
  const isProcessing = niche.status === 'processing'
  const isCompleted = niche.status === 'completed'
  const isFailed = niche.status === 'failed'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Processing Progress: {nicheName}</span>
            <Badge 
              variant={isCompleted ? 'default' : isProcessing ? 'secondary' : 'destructive'}
              className={isProcessing ? 'animate-pulse' : ''}
            >
              {niche.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Real-time progress tracking for niche analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{progress.percentComplete}%</span>
            </div>
            <Progress value={progress.percentComplete} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress.completedAsins} of {progress.totalAsins} products</span>
              <span>{progress.apiCallsMade} API calls</span>
            </div>
          </div>

          {/* Current Activity */}
          {isProcessing && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 animate-pulse" />
                  Current Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    <span>{progress.currentStep}</span>
                  </div>
                  {progress.currentAsin && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Package className="h-3 w-3" />
                      <span>ASIN: {progress.currentAsin}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-gray-500">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.totalProducts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-gray-500">Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.totalKeywords}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-gray-500">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{summary.totalReviews?.toLocaleString() || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Activity Log</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  {autoRefresh ? 'Auto' : 'Manual'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-xs space-y-1">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No activity logged yet...</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="text-gray-700">{log}</div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {progress.errors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Errors ({progress.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs text-red-600 space-y-1">
                  {progress.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Processing Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  Successfully processed {progress.completedAsins} products with {summary.totalKeywords} keywords found.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timing Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Started: {niche.processStartedAt ? new Date(niche.processStartedAt).toLocaleString() : 'Not started'}</span>
            </div>
            {niche.processCompletedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Completed: {new Date(niche.processCompletedAt).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>Last Update: {new Date(progress.lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}