'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Search,
  FileText,
  Package,
  DollarSign,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react'
// Simple toast replacement
const toast = {
  success: (title: string, options?: { description?: string }) => {
    console.log('Success:', title, options?.description)
  },
  error: (title: string, options?: { description?: string }) => {
    console.error('Error:', title, options?.description)
  }
}

interface NicheDetailViewProps {
  nicheId: string
  initialData: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress?: number
    message?: string
    error?: string
    analysis?: any
  }
}

export function NicheDetailView({ nicheId, initialData }: NicheDetailViewProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [isPolling, setIsPolling] = useState(initialData.status === 'processing' || initialData.status === 'pending')

  // Poll for status updates while processing
  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/niches/${nicheId}/status`)
        if (!response.ok) {
          throw new Error('Failed to fetch status')
        }
        
        const result = await response.json()
        setData(result.data)
        
        // Stop polling if completed or failed
        if (result.data.status === 'completed' || result.data.status === 'failed') {
          setIsPolling(false)
          
          if (result.data.status === 'completed') {
            toast.success('Analysis completed!', {
              description: 'Your niche analysis is ready to view.',
            })
          } else {
            toast.error('Analysis failed', {
              description: result.data.error || 'An unexpected error occurred during analysis.',
            })
          }
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [nicheId, isPolling])

  const handleRefresh = () => {
    router.refresh()
  }

  const getStatusIcon = () => {
    switch (data.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = () => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'success',
      failed: 'destructive'
    } as const

    return (
      <Badge variant={variants[data.status] || 'secondary'} className="capitalize">
        {getStatusIcon()}
        <span className="ml-2">{data.status}</span>
      </Badge>
    )
  }

  // If still processing, show progress view
  if (data.status === 'pending' || data.status === 'processing') {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/niches')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Niches
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analyzing Niche</CardTitle>
                <CardDescription>
                  Our AI is analyzing the market opportunity for this niche
                </CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">AI Analysis in Progress</AlertTitle>
              <AlertDescription className="text-blue-700">
                {data.message || 'This typically takes 5-10 minutes. We\'ll notify you when it\'s complete.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{data.progress || 0}%</span>
              </div>
              <Progress value={data.progress || 0} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Analyzing</p>
                      <p className="font-medium">Market Demand</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Evaluating</p>
                      <p className="font-medium">Competition</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Search className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Researching</p>
                      <p className="font-medium">Keywords</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Generating</p>
                      <p className="font-medium">Listing Ideas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If failed, show error view
  if (data.status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/niches')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Niches
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analysis Failed</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {data.error || 'An unexpected error occurred during analysis. Please try again.'}
              </AlertDescription>
            </Alert>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => router.push(`/admin/niche/${nicheId}/edit`)}>
                Edit Niche
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show completed analysis
  const analysis = data.analysis
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/niches')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Niches
        </Button>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/niche/${nicheId}/edit`)}
          >
            Edit Niche
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {analysis?.nicheName || 'Niche Analysis'}
        </h1>
        <p className="text-gray-600">
          {analysis?.category || 'Category'} • Analyzed on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opportunity Score</p>
                <p className="text-2xl font-bold">{analysis?.opportunityScore || 0}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Competition</p>
                <p className="text-2xl font-bold">{analysis?.competitionLevel || 'Medium'}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Size</p>
                <p className="text-2xl font-bold">
                  ${(analysis?.marketSize || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold">{analysis?.asins?.length || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demand">Demand Analysis</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="listing">Listing Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why This Niche?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {analysis?.aiAnalysis?.whyThisProduct || 'Analysis pending...'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(analysis?.aiAnalysis?.keyHighlights || []).map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Demand Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis?.aiAnalysis?.demandAnalysis || 'No demand analysis available yet.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis?.aiAnalysis?.competitionAnalysis || 'No competition analysis available yet.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis?.aiAnalysis?.keywordAnalysis || 'No keyword analysis available yet.'}
              </p>
            </CardContent>
          </Card>

          {analysis?.nicheKeywords && analysis.nicheKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.nicheKeywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="listing" className="space-y-6">
          {analysis?.aiAnalysis?.listingOptimization?.title && (
            <Card>
              <CardHeader>
                <CardTitle>Optimized Product Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 font-medium">
                  {analysis.aiAnalysis.listingOptimization.title}
                </p>
              </CardContent>
            </Card>
          )}

          {analysis?.aiAnalysis?.listingOptimization?.bulletPoints && (
            <Card>
              <CardHeader>
                <CardTitle>Bullet Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.aiAnalysis.listingOptimization.bulletPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis?.aiAnalysis?.listingOptimization?.description && (
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {analysis.aiAnalysis.listingOptimization.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}