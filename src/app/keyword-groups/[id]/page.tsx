'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Tag,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'

interface GroupDetails {
  group: {
    id: string
    name: string
    marketplace: string
    status: string
    asins: string[]
    total_keywords_found: number
    total_keywords_processed: number
    created_at: string
    completed_at: string | null
    asinMetadata: any[]
  }
  keywords: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    totalKeywords: number
    uniqueKeywords: number
    cannibalizedCount: number
    avgSearchVolume: number
    avgCPC: number
    cannibalizationRisk: string
  }
  cannibalization: any[]
}

interface ProgressData {
  status: string
  overallProgress: number
  totalKeywordsFound: number
  totalKeywordsProcessed: number
  phases: any[]
  currentPhase: string
}

export default function KeywordGroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupData, setGroupData] = useState<GroupDetails | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch group data
  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/keyword-groups/${params.id}/results`)
      if (!response.ok) throw new Error('Failed to fetch group data')
      
      const data = await response.json()
      setGroupData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch progress data
  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/keyword-groups/${params.id}/progress`)
      if (!response.ok) throw new Error('Failed to fetch progress')
      
      const data = await response.json()
      setProgressData(data)
      
      // If still processing, poll for updates
      if (data.status === 'processing') {
        setTimeout(() => {
          setRefreshing(true)
          fetchProgressData().then(() => setRefreshing(false))
        }, 2000)
      }
    } catch (err) {
      console.error('Progress fetch error:', err)
    }
  }

  useEffect(() => {
    fetchGroupData()
    fetchProgressData()
  }, [params.id])

  // Export keywords to CSV
  const exportToCSV = () => {
    if (!groupData) return

    const headers = ['Keyword', 'ASIN', 'Search Volume', 'Competition', 'Suggested Bid', 'Est. Clicks', 'Est. Orders']
    const rows = groupData.keywords.map(kw => [
      kw.keyword,
      kw.asin,
      kw.search_volume || 0,
      kw.competition_level || '',
      kw.suggested_bid || 0,
      kw.estimated_clicks || 0,
      kw.estimated_orders || 0
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${groupData.group.name.replace(/\s+/g, '_')}_keywords.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading keyword group...</p>
        </div>
      </div>
    )
  }

  if (!groupData) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load keyword group data</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { group, summary, keywords, cannibalization } = groupData

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/keyword-groups')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <p className="text-muted-foreground">
              {group.asins.length} ASINs • {summary.totalKeywords.toLocaleString()} keywords • 
              Created {format(new Date(group.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Section (if processing) */}
      {group.status === 'processing' && progressData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progressData.overallProgress}%</span>
              </div>
              <Progress value={progressData.overallProgress} />
            </div>
            
            <div className="space-y-2">
              {progressData.phases.map((phase) => (
                <div key={phase.phase} className="flex items-center gap-2 text-sm">
                  {phase.percentage === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : phase.phase === progressData.currentPhase ? (
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="flex-1">{phase.message}</span>
                  <span className="text-muted-foreground">{phase.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalKeywords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.uniqueKeywords.toLocaleString()} unique
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Search Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgSearchVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">per keyword</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg CPC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.avgCPC.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">suggested bid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cannibalization Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={
                summary.cannibalizationRisk === 'HIGH' ? 'bg-red-100 text-red-700' :
                summary.cannibalizationRisk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }>
                {summary.cannibalizationRisk}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {summary.cannibalizedCount} overlaps
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="asins">ASINs</TabsTrigger>
          <TabsTrigger value="cannibalization">Cannibalization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Group Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={
                    group.status === 'completed' ? 'bg-green-100 text-green-700' :
                    group.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {group.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Marketplace</span>
                  <span>{group.marketplace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ASINs</span>
                  <span>{group.asins.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(group.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                {group.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{format(new Date(group.completed_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {keywords.slice(0, 10).map((kw, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{kw.keyword}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {kw.search_volume?.toLocaleString() || 0}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          ${kw.suggested_bid?.toFixed(2) || '0.00'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>All Keywords</CardTitle>
              <CardDescription>
                Showing {keywords.length} of {summary.totalKeywords} keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Keyword</th>
                      <th className="text-left py-2">ASIN</th>
                      <th className="text-right py-2">Search Volume</th>
                      <th className="text-left py-2">Competition</th>
                      <th className="text-right py-2">Suggested Bid</th>
                      <th className="text-right py-2">Est. Clicks</th>
                      <th className="text-right py-2">Est. Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.map((kw, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2 font-medium">{kw.keyword}</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">{kw.asin}</Badge>
                        </td>
                        <td className="py-2 text-right">{kw.search_volume?.toLocaleString() || '0'}</td>
                        <td className="py-2">
                          <Badge className={`text-xs ${
                            kw.competition_level === 'HIGH' ? 'bg-red-100 text-red-700' :
                            kw.competition_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {kw.competition_level || 'UNKNOWN'}
                          </Badge>
                        </td>
                        <td className="py-2 text-right">${kw.suggested_bid?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 text-right">{kw.estimated_clicks || '0'}</td>
                        <td className="py-2 text-right">{kw.estimated_orders || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASINs Tab */}
        <TabsContent value="asins">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.asinMetadata.map((asin) => (
              <Card key={asin.asin}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{asin.asin}</CardTitle>
                    <Badge variant="secondary">{asin.product_group || 'N/A'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <p className="font-medium line-clamp-2">{asin.title || 'No title'}</p>
                    <p className="text-muted-foreground">{asin.brand || 'No brand'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-1 font-medium">${asin.price || '0.00'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="ml-1 font-medium">{asin.rating || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reviews:</span>
                      <span className="ml-1 font-medium">{asin.review_count?.toLocaleString() || '0'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">BSR:</span>
                      <span className="ml-1 font-medium">{asin.sales_rank_value?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cannibalization Tab */}
        <TabsContent value="cannibalization">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Cannibalization Analysis</CardTitle>
              <CardDescription>
                Keywords that appear across multiple ASINs in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cannibalization.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No keyword cannibalization detected
                </div>
              ) : (
                <div className="space-y-4">
                  {cannibalization.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.keyword}</h4>
                        <Badge variant="destructive" className="text-xs">
                          {item.asinCount} ASINs
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.asins.map((asin: string) => (
                          <Badge key={asin} variant="outline" className="text-xs">
                            {asin}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}