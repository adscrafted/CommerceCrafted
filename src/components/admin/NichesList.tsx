'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
// Helper function to format relative time
function formatDistanceToNow(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days`
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months`
  return `${Math.floor(seconds / 31536000)} years`
}

interface Niche {
  id: string
  name: string
  description?: string
  category: string
  status: 'active' | 'archived' | 'draft'
  created_at: string
  updated_at: string
  last_analyzed_at?: string
  analysis_status?: 'pending' | 'processing' | 'completed' | 'failed'
  product_count: number
  opportunity_score?: number
  competition_level?: string
  market_size?: number
}

export function NichesList() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNiches()
  }, [])

  const fetchNiches = async () => {
    try {
      const response = await fetch('/api/niches')
      if (!response.ok) {
        throw new Error('Failed to fetch niches')
      }
      
      const data = await response.json()
      setNiches(data.data || [])
    } catch (err) {
      console.error('Error fetching niches:', err)
      setError(err instanceof Error ? err.message : 'Failed to load niches')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (niche: Niche) => {
    if (niche.analysis_status === 'processing') {
      return (
        <Badge variant="default" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing
        </Badge>
      )
    }
    
    if (niche.analysis_status === 'failed') {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    }
    
    if (niche.analysis_status === 'completed') {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Analyzed
        </Badge>
      )
    }
    
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchNiches}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  if (niches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Niches Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first niche analysis to get started
          </p>
          <Link href="/admin/niche/new">
            <Button>Create Niche Analysis</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {niches.map((niche) => (
        <Card key={niche.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{niche.name}</CardTitle>
                <CardDescription className="mt-1">
                  {niche.category} • Created {formatDistanceToNow(new Date(niche.created_at))} ago
                </CardDescription>
              </div>
              {getStatusBadge(niche)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Opportunity</p>
                  <p className="font-semibold">
                    {niche.opportunity_score ? `${niche.opportunity_score}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Competition</p>
                  <p className="font-semibold">
                    {niche.competition_level || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Market Size</p>
                  <p className="font-semibold">
                    {niche.market_size ? `$${niche.market_size.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="font-semibold">{niche.product_count}</p>
                </div>
              </div>
            </div>

            {niche.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">{niche.description}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {niche.last_analyzed_at && (
                  <span>
                    Last analyzed {formatDistanceToNow(new Date(niche.last_analyzed_at))} ago
                  </span>
                )}
              </div>
              <Link href={`/admin/niches/${niche.id}`}>
                <Button variant="ghost" size="sm">
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}