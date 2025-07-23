'use client'

import React, { useState, useEffect, useCallback } from 'react'
import NicheProgressDialog from './NicheProgressDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import {
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Trash2,
  Eye,
  Edit,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  PlayCircle,
  RotateCcw,
  Bug,
  RefreshCcw,
  Activity
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Niche {
  id: string
  niche_name: string
  asins: string
  total_products: number
  marketplace: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress?: {
    current: number
    total: number
    percentage: number
    currentAsin?: string
    completedAsins: string[]
    failedAsins: string[]
  }
  avg_opportunity_score?: number
  avg_competition_score?: number
  avg_price?: number
  avg_bsr?: number
  total_monthly_revenue?: number
  total_keywords?: number
  niche_keywords?: string
  competition_level?: string
  created_at: string
  updated_at: string
  process_started_at?: string
  process_completed_at?: string
  error_message?: string
  market_size?: number
  total_reviews?: number
}

type SortField = 'niche_name' | 'total_products' | 'status' | 'avg_opportunity_score' | 'avg_competition_score' | 'total_monthly_revenue' | 'created_at'
type SortOrder = 'asc' | 'desc'

export default function ProductQueueTab() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [processingCount, setProcessingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [progressDialogNiche, setProgressDialogNiche] = useState<{id: string, name: string} | null>(null)
  
  // New niche form state
  const [newNiche, setNewNiche] = useState({
    name: '',
    asins: '',
    marketplace: 'US'
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25) // Reduced from 50 for faster loading
  
  // Debounce timer for search
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Load niches with pagination and filters
  const loadNiches = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Build query
      let query = supabase
        .from('niches')
        .select('*', { count: 'exact' })
      
      // Apply filters
      if (searchTerm) {
        query = query.or(`niche_name.ilike.%${searchTerm}%,asins.ilike.%${searchTerm}%`)
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (marketplaceFilter !== 'all') {
        query = query.eq('marketplace', marketplaceFilter)
      }
      
      // Apply sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' })
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      setNiches(data || [])
      setTotalCount(count || 0)
      
      // Get processing count separately for header
      const { count: procCount } = await supabase
        .from('niches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing')
      
      setProcessingCount(procCount || 0)
      
    } catch (error) {
      console.error('Error loading niches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, marketplaceFilter, sortField, sortOrder, currentPage, itemsPerPage])

  // Load initial data
  useEffect(() => {
    loadNiches()
  }, [loadNiches])

  // Debounced search
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on search
      loadNiches()
    }, 300) // 300ms debounce
    
    setSearchDebounceTimer(timer)
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [searchTerm])

  // Polling for processing niches
  useEffect(() => {
    if (processingCount > 0 && !pollingInterval) {
      const interval = setInterval(() => {
        loadNiches()
      }, 10000) // Poll every 10 seconds (increased from 5)
      setPollingInterval(interval)
    } else if (processingCount === 0 && pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [processingCount, pollingInterval, loadNiches])

  const createNiche = async () => {
    if (!newNiche.name.trim() || !newNiche.asins.trim()) {
      alert('Please provide a niche name and at least one ASIN')
      return
    }

    setIsCreating(true)
    try {
      const asins = newNiche.asins
        .split(/[,\s\n]+/)
        .map(a => a.trim())
        .filter(a => a.length > 0)
      
      const requestBody = {
        nicheName: newNiche.name,
        asins: asins.join(','),
        scheduledDate: new Date().toISOString()
      }
      
      console.log('Creating niche with data:', requestBody)
      
      const response = await fetch('/api/admin/niches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()
      console.log('Response status:', response.status)
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to create niche')
      }
      
      // Reset form and close dialog
      setNewNiche({ name: '', asins: '', marketplace: 'US' })
      setDialogOpen(false)
      
      // Reload niches
      await loadNiches()
    } catch (error) {
      console.error('Error creating niche:', error)
      alert(error instanceof Error ? error.message : 'Failed to create niche')
    } finally {
      setIsCreating(false)
    }
  }

  const deleteNiche = async (nicheId: string, e: React.MouseEvent, status: string) => {
    e.stopPropagation() // Prevent row click
    
    const confirmMessage = status === 'processing' 
      ? 'This niche is currently processing. Are you sure you want to delete it? This action cannot be undone.'
      : 'Are you sure you want to delete this niche group?'
    
    if (!confirm(confirmMessage)) return
    
    try {
      // If processing, we might need to clean up any active jobs
      if (status === 'processing') {
        console.log(`⚠️ Deleting niche in processing status: ${nicheId}`)
      }
      
      const { error } = await supabase
        .from('niches')
        .delete()
        .eq('id', nicheId)
      
      if (error) throw error
      
      console.log(`✅ Successfully deleted niche: ${nicheId}`)
      await loadNiches()
    } catch (error) {
      console.error('Error deleting niche:', error)
      alert('Failed to delete niche group')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        variant: 'secondary' as const, 
        color: 'bg-gray-100 text-gray-700',
        icon: <Clock className="h-3 w-3" />
      },
      processing: { 
        variant: 'default' as const, 
        color: 'bg-blue-100 text-blue-700',
        icon: <RefreshCw className="h-3 w-3 animate-spin" />
      },
      completed: { 
        variant: 'default' as const, 
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="h-3 w-3" />
      },
      failed: { 
        variant: 'destructive' as const, 
        color: 'bg-red-100 text-red-700',
        icon: <AlertCircle className="h-3 w-3" />
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge variant={config.variant} className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    )
  }

  const formatCurrency = (num: number | null | undefined) => {
    if (!num) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page on sort
  }

  const handleFilterChange = (filterType: 'status' | 'marketplace', value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value)
    } else {
      setMarketplaceFilter(value)
    }
    setCurrentPage(1) // Reset to first page on filter change
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Niche Queue Management</CardTitle>
              <CardDescription>
                {formatNumber(totalCount)} total niche groups • {formatNumber(processingCount)} processing
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Niche
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-xl font-semibold">Create Niche Group</DialogTitle>
                  <DialogDescription className="text-gray-600 mt-2">
                    Analyze multiple related products together by adding their ASINs
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Group Name */}
                  <div className="space-y-3">
                    <Label htmlFor="niche-name" className="text-sm font-medium text-gray-700">
                      Group Name
                    </Label>
                    <Input
                      id="niche-name"
                      placeholder="e.g., Smart Sleep Products"
                      value={newNiche.name}
                      onChange={(e) => setNewNiche({ ...newNiche, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* ASINs */}
                  <div className="space-y-3">
                    <Label htmlFor="asins" className="text-sm font-medium text-gray-700">
                      ASINs
                    </Label>
                    <Textarea
                      id="asins"
                      placeholder="B08MVBRNKV, B07ZPKBL9V, B08N5WRWNW"
                      rows={6}
                      value={newNiche.asins}
                      onChange={(e) => setNewNiche({ ...newNiche, asins: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm resize-none"
                    />
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                      💡 Enter ASINs separated by commas, spaces, or new lines
                    </p>
                  </div>

                  {/* Marketplace */}
                  <div className="space-y-3">
                    <Label htmlFor="marketplace" className="text-sm font-medium text-gray-700">
                      Marketplace
                    </Label>
                    <select
                      id="marketplace"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                      value={newNiche.marketplace}
                      onChange={(e) => setNewNiche({ ...newNiche, marketplace: e.target.value })}
                    >
                      <option value="US">🇺🇸 United States</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="UK">🇬🇧 United Kingdom</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="ES">🇪🇸 Spain</option>
                      <option value="IT">🇮🇹 Italy</option>
                      <option value="JP">🇯🇵 Japan</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={createNiche}
                      disabled={isCreating}
                      className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                          Creating Niche Group...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-3" />
                          Create and Start Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or ASINs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Marketplace Filter */}
            <Select value={marketplaceFilter} onValueChange={(value) => handleFilterChange('marketplace', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="ES">Spain</SelectItem>
                <SelectItem value="IT">Italy</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              variant="outline"
              onClick={loadNiches}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('niche_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <SortIcon field="niche_name" />
                </div>
              </TableHead>
              <TableHead className="text-center">
                Status
              </TableHead>
              <TableHead className="text-center">
                # of ASINs
              </TableHead>
              <TableHead className="text-center">
                # of Keywords
              </TableHead>
              <TableHead className="text-center">
                # of Reviews
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  <SortIcon field="created_at" />
                </div>
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : niches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <p className="text-gray-500">No niche groups found</p>
                </TableCell>
              </TableRow>
            ) : (
              niches.map((niche) => (
                <TableRow key={niche.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{niche.niche_name}</TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(niche.status)}
                  </TableCell>
                  <TableCell className="text-center">{niche.total_products || 0}</TableCell>
                  <TableCell className="text-center">
                    {niche.total_keywords || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(niche.total_reviews)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(niche.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {niche.status === 'processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (confirm('Reset this niche to pending status? This will allow you to restart processing.')) {
                              try {
                                const response = await fetch(`/api/admin/niches/${niche.id}/reset`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  credentials: 'include'
                                })
                                
                                if (response.ok) {
                                  alert('Niche reset successfully! You can now start processing again.')
                                  await loadNiches()
                                } else {
                                  const error = await response.json()
                                  alert(`Failed to reset: ${error.error || 'Unknown error'}`)
                                }
                              } catch (error) {
                                alert(`Error: ${error instanceof Error ? error.message : 'Failed to reset'}`)
                              }
                            }
                          }}
                          title="Reset Processing"
                        >
                          <RotateCcw className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                      {(niche.status === 'processing' || niche.status === 'pending') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            // First fetch and log the current progress
                            try {
                              console.log(`🔍 Checking progress for niche: ${niche.niche_name} (${niche.id})`)
                              const response = await fetch(`/api/admin/niches/${niche.id}/progress`)
                              const data = await response.json()
                              
                              console.log('📊 Current Progress:', {
                                status: data.niche.status,
                                currentStep: data.progress.currentStep,
                                completed: `${data.progress.completedAsins}/${data.progress.totalAsins}`,
                                percentage: `${data.progress.percentComplete}%`,
                                currentAsin: data.progress.currentAsin || 'None',
                                errors: data.progress.errors
                              })
                              
                              // Store error info for retry button
                              if (data.progress.errors && data.progress.errors.length > 0) {
                                niche.processing_errors = data.progress.errors
                              }
                              
                              // Show alert with quick status
                              if (data.niche.status === 'pending') {
                                alert(`⏳ Status: PENDING\n\nThis niche hasn't started processing yet.\nClick the Play button to start processing.`)
                              } else if (data.niche.status === 'processing') {
                                alert(`🔄 Status: PROCESSING\n\nProgress: ${data.progress.completedAsins}/${data.progress.totalAsins} ASINs (${data.progress.percentComplete}%)\nCurrent: ${data.progress.currentStep}\n\nOpening detailed progress view...`)
                              } else if (data.niche.status === 'completed') {
                                alert(`✅ Status: COMPLETED\n\nProcessed: ${data.progress.completedAsins} ASINs\nKeywords Found: ${data.summary.totalKeywords}\nTotal Reviews: ${data.summary.totalReviews}`)
                              } else if (data.niche.status === 'failed') {
                                alert(`❌ Status: FAILED\n\nError: ${data.niche.errorMessage || 'Unknown error'}\nCompleted: ${data.progress.completedAsins}/${data.progress.totalAsins} ASINs`)
                              }
                            } catch (error) {
                              console.error('Failed to fetch progress:', error)
                            }
                            
                            // Open the progress dialog
                            setProgressDialogNiche({ id: niche.id, name: niche.niche_name })
                          }}
                          title="Check Progress"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                      )}
                      {niche.status === 'processing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              console.log(`🔍 Debugging niche: ${niche.niche_name} (${niche.id})`)
                              const response = await fetch(`/api/admin/niches/${niche.id}/debug`)
                              const data = await response.json()
                              
                              console.log('🐛 Debug Info:', data.debug_info)
                              console.log('⚠️ Recommendations:', data.recommendations)
                              
                              alert(`Debug Info:\n\n${JSON.stringify(data.debug_info, null, 2)}\n\nRecommendations:\n${data.recommendations.join('\n')}`)
                            } catch (error) {
                              console.error('Failed to debug:', error)
                            }
                          }}
                          title="Debug Processing"
                        >
                          <Bug className="h-4 w-4 text-purple-600" />
                        </Button>
                      )}
                      {niche.status === 'processing' && niche.processing_errors?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (confirm(`Retry ${niche.processing_errors.length} failed ASINs?\n\n${niche.processing_errors.join('\n')}`)) {
                              try {
                                console.log(`🔄 Retrying failed ASINs for niche: ${niche.niche_name}`)
                                const response = await fetch(`/api/admin/niches/${niche.id}/retry-failed`, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  credentials: 'include'
                                })
                                
                                const data = await response.json()
                                console.log('📊 Retry results:', data)
                                
                                if (response.ok) {
                                  alert(`Retry Results:\n\nSucceeded: ${data.results.success_count}\nFailed: ${data.results.failed_count}\n\n${data.message}`)
                                  await loadNiches()
                                } else {
                                  alert(`Failed to retry: ${data.error || 'Unknown error'}`)
                                }
                              } catch (error) {
                                console.error('Retry error:', error)
                                alert(`Error: ${error instanceof Error ? error.message : 'Failed to retry'}`)
                              }
                            }
                          }}
                          title="Retry Failed ASINs"
                        >
                          <RefreshCcw className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                      {niche.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/admin/niches/${niche.id}/analyze`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                credentials: 'include'
                              })
                              
                              if (response.ok) {
                                const data = await response.json()
                                alert(`Analysis started! Run ID: ${data.analysisRunId}`)
                                await loadNiches() // Reload to see updated status
                              } else {
                                const error = await response.json()
                                alert(`Failed to start analysis: ${error.error || 'Unknown error'}`)
                              }
                            } catch (error) {
                              alert(`Error: ${error instanceof Error ? error.message : 'Failed to start analysis'}`)
                            }
                          }}
                          title="Start Analysis"
                        >
                          <PlayCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Convert niche name to slug format
                          const slug = niche.niche_name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '');
                          window.location.href = `/products/${slug}?nicheId=${niche.id}`
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/admin/niche/edit/${niche.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteNiche(niche.id, e, niche.status)}
                        className={niche.status === 'processing' ? 'hover:bg-red-50' : ''}
                        title={niche.status === 'processing' ? 'Delete (Processing)' : 'Delete'}
                      >
                        <Trash2 className={`h-4 w-4 ${niche.status === 'processing' ? 'text-red-600' : 'text-red-500'}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Dialog */}
      {selectedNiche && (
        <Dialog open={!!selectedNiche} onOpenChange={() => setSelectedNiche(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedNiche.niche_name}</DialogTitle>
              <DialogDescription>
                Detailed analysis for this niche group
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Opportunity Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {selectedNiche.avg_opportunity_score?.toFixed(1) || '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Competition Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {selectedNiche.avg_competition_score?.toFixed(1) || '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Monthly Revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedNiche.total_monthly_revenue)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Market Size</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedNiche.market_size)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* ASINs List */}
              <div>
                <h3 className="font-medium mb-2">Products ({selectedNiche.asins.split(',').length})</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-2">
                    {selectedNiche.asins.split(',').map((asin) => (
                      <code key={asin} className="text-sm bg-white px-2 py-1 rounded border">
                        {asin.trim()}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              {/* Processing Details */}
              {selectedNiche.processing_progress && selectedNiche.processing_progress.failedAsins?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Failed ASINs</h3>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="grid grid-cols-4 gap-2">
                      {selectedNiche.processing_progress.failedAsins.map((asin) => (
                        <code key={asin} className="text-sm bg-white px-2 py-1 rounded border border-red-300">
                          {asin}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {selectedNiche.niche_keywords && (
                <div>
                  <h3 className="font-medium mb-2">Top Keywords</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedNiche.niche_keywords.split(',').slice(0, 30).map((keyword) => (
                        <Badge key={keyword} variant="secondary">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Average Price:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedNiche.avg_price)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Average BSR:</span>
                  <span className="ml-2 font-medium">{formatNumber(selectedNiche.avg_bsr)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Reviews:</span>
                  <span className="ml-2 font-medium">{formatNumber(selectedNiche.total_reviews)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Competition Level:</span>
                  <span className="ml-2 font-medium">{selectedNiche.competition_level || '-'}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Progress Dialog */}
      {progressDialogNiche && (
        <NicheProgressDialog
          nicheId={progressDialogNiche.id}
          nicheName={progressDialogNiche.name}
          open={!!progressDialogNiche}
          onOpenChange={(open) => !open && setProgressDialogNiche(null)}
        />
      )}
    </div>
  )
}