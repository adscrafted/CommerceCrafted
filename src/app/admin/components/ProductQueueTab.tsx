'use client'

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { cache } from '@/lib/cache'
// Lazy load heavy components that aren't immediately needed
const NicheProgressDialog = lazy(() => import('./NicheProgressDialog'))
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
  marketplace?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress?: {
    current: number
    total: number
    percentage: number
    currentAsin?: string
    completedAsins: string[]
    failedAsins: string[]
  }
  total_reviews?: number
  keyword_count?: number
  created_at: string
  updated_at: string
  process_started_at?: string
  process_completed_at?: string
  error_message?: string
  processing_errors?: string[]
}

type SortField = 'niche_name' | 'total_products' | 'status' | 'created_at'
type SortOrder = 'asc' | 'desc'

function ProductQueueTab() {
  const { markApiStart, markApiEnd, markRender } = usePerformanceMonitor('AdminNichePage')
  const [niches, setNiches] = useState<Niche[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [processingCount, setProcessingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
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

  // Optimized API call using new endpoint with caching
  const loadNiches = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      markApiStart()
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortField,
        sortOrder,
      })
      
      // Add optional filters
      if (debouncedSearchTerm) params.set('search', debouncedSearchTerm)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (marketplaceFilter !== 'all') params.set('marketplace', marketplaceFilter)
      
      const cacheKey = `niches-${params.toString()}`
      
      // Check cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedResult = cache.get(cacheKey)
        if (cachedResult) {
          console.log('[Cache] Using cached niches data')
          setNiches(cachedResult.data || [])
          setTotalCount(cachedResult.pagination.total)
          setProcessingCount(cachedResult.processing_count)
          markApiEnd()
          return
        }
      } else {
        console.log('[Cache] Force refresh requested - bypassing cache')
      }
      
      const response = await fetch(`/api/admin/niches?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load niches')
      }
      
      const result = await response.json()
      
      // Cache the result for 30 seconds
      cache.set(cacheKey, result, 30000)
      
      // Update state with optimized data
      setNiches(result.data || [])
      setTotalCount(result.pagination.total)
      setProcessingCount(result.processing_count)
      markApiEnd()
      
    } catch (error) {
      console.error('Error loading niches:', error)
      setError(error instanceof Error ? error.message : 'Failed to load niches')
      
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please refresh the page and log in again.')
      }
    } finally {
      setIsLoading(false)
      markRender('load-complete')
    }
  }, [debouncedSearchTerm, statusFilter, marketplaceFilter, sortField, sortOrder, currentPage, itemsPerPage])
  
  // Clear cache when data is modified
  const clearNichesCache = useCallback(() => {
    // Clear all cache entries starting with 'niches-'
    cache.clear() // Simple approach - clear all cache
    console.log('🗑️ Cache cleared - forcing fresh data fetch')
  }, [])

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Load data when component mounts or dependencies change
  useEffect(() => {
    loadNiches()
  }, [loadNiches])

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
      
      // Show success message
      console.log('✅ Niche created successfully, analysis started in background')
      
      // Clear cache and reload niches to show the new processing status
      clearNichesCache()
      
      // Add a small delay to ensure the backend has completed the creation
      setTimeout(async () => {
        console.log('🔄 Reloading niches after creation...')
        clearNichesCache() // Clear cache again to be sure
        await loadNiches(true) // Force refresh to bypass cache
        console.log('✅ Niches reloaded after creation')
      }, 1000) // 1 second delay
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
      
      console.log('[Client] Attempting to delete niche:', nicheId)
      console.log('[Client] Making DELETE request to:', `/api/niches/by-id?id=${nicheId}`)
      console.log('[Client] Document cookies:', document.cookie)
      
      // Use the API endpoint to properly cascade delete
      const response = await fetch(`/api/niches/by-id?id=${nicheId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'  // Include cookies for authentication
      })
      
      console.log('[Client] Response status:', response.status)
      console.log('[Client] Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete niche'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          
          // Handle authentication errors specifically
          if (response.status === 401) {
            errorMessage = 'Your session has expired. Please refresh the page and log in again.'
          } else if (response.status === 404) {
            errorMessage = 'Niche not found or has already been deleted.'
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to delete this niche.'
          }
          
          console.error('[Client] Delete error details:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            nicheId
          })
        } catch (jsonError) {
          // If response is not JSON, use status text
          errorMessage = `Failed to delete niche: ${response.statusText}`
          console.error('[Client] Failed to parse error response:', jsonError)
        }
        throw new Error(errorMessage)
      }
      
      console.log(`✅ Successfully deleted niche: ${nicheId}`)
      clearNichesCache()
      
      // Force reload with a small delay to ensure delete completed
      setTimeout(async () => {
        await loadNiches(true) // Force refresh to bypass cache
      }, 500)
    } catch (error) {
      console.error('Error deleting niche:', error)
      
      // Show more specific error messages to the user
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete niche group'
      alert(errorMessage)
      
      // If it's an auth error, suggest refresh
      if (errorMessage.includes('session has expired') || errorMessage.includes('Authentication required')) {
        alert('Please refresh the page and log in again to continue using the admin panel.')
      }
    }
  }

  // Memoized formatting functions
  const formatCurrency = useMemo(() => (num: number | null | undefined) => {
    if (!num) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }, [])

  const formatNumber = useMemo(() => (num: number | null | undefined) => {
    if (!num) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }, [])

  const formatDate = useMemo(() => (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])


  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page on sort
  }, [sortField, sortOrder])

  const handleFilterChange = useCallback((filterType: 'status' | 'marketplace', value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value)
    } else {
      setMarketplaceFilter(value)
    }
    setCurrentPage(1) // Reset to first page on filter change
  }, [])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />
    return sortOrder === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  // Memoized calculations for performance
  const totalPages = useMemo(() => Math.ceil(totalCount / itemsPerPage), [totalCount, itemsPerPage])
  
  // Memoized status badge component to prevent re-renders
  const StatusBadge = useMemo(() => ({ status }: { status: string }) => {
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
  }, [])

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
              onClick={() => {
                setError(null)
                loadNiches()
              }}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setError(null)
                  loadNiches()
                }}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 text-center"
                onClick={() => handleSort('niche_name')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Name</span>
                  <SortIcon field="niche_name" />
                </div>
              </TableHead>
              <TableHead className="text-center">
                Status
              </TableHead>
              <TableHead className="text-center">
                Marketplace
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
                className="cursor-pointer hover:bg-gray-50 text-center"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Created Date</span>
                  <SortIcon field="created_at" />
                </div>
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton for better perceived performance
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="animate-pulse">
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : niches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <p className="text-gray-500">No niche groups found</p>
                  {debouncedSearchTerm && (
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              niches.map((niche) => (
                <TableRow key={niche.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-center">{niche.niche_name}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={niche.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {niche.marketplace || 'US'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{niche.asins ? niche.asins.split(',').length : 0}</TableCell>
                  <TableCell className="text-center">
                    {formatNumber(niche.keyword_count || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(niche.total_reviews || 0)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 text-center">
                    {formatDate(niche.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
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
        </div>
        
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
      
      {/* Progress Dialog with Lazy Loading */}
      {progressDialogNiche && (
        <Suspense fallback={<div className="flex items-center justify-center p-4"><RefreshCw className="h-6 w-6 animate-spin" /></div>}>
          <NicheProgressDialog
            nicheId={progressDialogNiche.id}
            nicheName={progressDialogNiche.name}
            open={!!progressDialogNiche}
            onOpenChange={(open) => !open && setProgressDialogNiche(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ProductQueueTab)