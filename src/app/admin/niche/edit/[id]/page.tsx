'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Save,
  Package,
  Search,
  Star,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Plus,
  X,
  ChevronDown
} from 'lucide-react'

interface NicheData {
  id: string
  niche_name: string
  asins: string
  total_products: number
  status: string
  category: string
  description?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface ProductData {
  id: string
  asin: string
  title: string
  price?: number
  bsr?: number
  rating?: number
  review_count?: number
  image_urls?: string
  category?: string
  brand?: string
  status?: string
  monthly_orders?: number
  fba_fees?: any
}

interface KeywordData {
  id?: string
  product_id: string
  keyword: string
  match_type: string
  suggested_bid?: number
  estimated_clicks?: number
  estimated_orders?: number
}

export default function NicheEditPage() {
  const params = useParams()
  const router = useRouter()
  const [niche, setNiche] = useState<NicheData | null>(null)
  const [products, setProducts] = useState<ProductData[]>([])
  const [keywords, setKeywords] = useState<KeywordData[]>([])
  const [totalKeywordCount, setTotalKeywordCount] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [totalReviewCount, setTotalReviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [keywordPage, setKeywordPage] = useState(1)
  const [keywordFilter, setKeywordFilter] = useState('')
  const [asinFilter, setAsinFilter] = useState<string[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [keywordSearch, setKeywordSearch] = useState('')
  const [productSort, setProductSort] = useState<{field: string, order: 'asc' | 'desc'} | null>(null)
  const [keywordSort, setKeywordSort] = useState<{field: string, order: 'asc' | 'desc'} | null>(null)
  
  // Product filters
  const [brandFilter, setBrandFilter] = useState('')
  
  // Keyword filters
  const [matchTypeFilter, setMatchTypeFilter] = useState('')
  const [bidFilter, setBidFilter] = useState<{min?: number, max?: number}>({})
  const [clicksFilter, setClicksFilter] = useState<{min?: number, max?: number}>({})
  const [ordersFilter, setOrdersFilter] = useState<{min?: number, max?: number}>({})
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  
  const keywordsPerPage = 100

  useEffect(() => {
    loadNicheData()
  }, [params.id])
  
  // Load reviews when the reviews tab is selected
  useEffect(() => {
    if (activeTab === 'reviews' && !reviewsLoaded && niche) {
      loadReviews()
    }
  }, [activeTab, reviewsLoaded, niche])
  
  // Reset pagination when filters change
  useEffect(() => {
    setKeywordPage(1)
  }, [
    keywordSearch, 
    asinFilter, 
    matchTypeFilter, 
    bidFilter.min, 
    bidFilter.max, 
    clicksFilter.min, 
    clicksFilter.max, 
    ordersFilter.min, 
    ordersFilter.max
  ])

  const loadReviews = async () => {
    if (!niche) return
    
    const asinList = niche.asins.split(',').map(a => a.trim())
    const { data: reviewData, error: reviewError } = await supabase
      .from('product_customer_reviews')
      .select('*')
      .in('product_id', asinList)
      .order('review_date', { ascending: false })
      .limit(500) // Load more reviews
    
    if (!reviewError && reviewData) {
      setReviews(reviewData)
      setReviewsLoaded(true)
    }
  }

  const loadNicheData = async () => {
    try {
      setIsLoading(true)
      
      // Load niche data
      const { data: nicheData, error: nicheError } = await supabase
        .from('niches')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (nicheError) throw nicheError
      setNiche(nicheData)
      
      // Load products for this niche
      const asinList = nicheData.asins.split(',').map((a: string) => a.trim())
      
      const { data: productData, error: productError } = await supabase
        .from('product')
        .select('*')
        .in('asin', asinList)
        .order('asin')
      
      if (!productError && productData) {
        setProducts(productData)
        
        // Get total keyword count first
        const { count: keywordCount } = await supabase
          .from('product_keywords')
          .select('*', { count: 'exact', head: true })
          .in('product_id', asinList)
        
        setTotalKeywordCount(keywordCount || 0)
        
        // Get total review count
        const { count: reviewCount } = await supabase
          .from('product_customer_reviews')
          .select('*', { count: 'exact', head: true })
          .in('product_id', asinList)
        
        setTotalReviewCount(reviewCount || 0)
        
        // Load keywords with new increased limit
        const { data: keywordData, error: keywordError } = await supabase
          .from('product_keywords')
          .select('*')
          .in('product_id', asinList)
          .order('suggested_bid', { ascending: false })
          .limit(100000) // Use new 100k limit to get all keywords
        
        if (!keywordError && keywordData) {
          setKeywords(keywordData)
        }
      }
      
    } catch (error) {
      console.error('Error loading niche data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!niche) return
    
    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from('niches')
        .update({
          niche_name: niche.niche_name,
          description: niche.description,
          notes: niche.notes,
          category: niche.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', niche.id)
      
      if (error) throw error
      
      alert('Niche updated successfully!')
      
    } catch (error) {
      console.error('Error saving niche:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (num: number | null | undefined) => {
    if (!num || num < 0) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num || num < 0) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  // Group keywords by product for display
  const getKeywordsByProduct = (asin: string) => {
    return keywords.filter(k => k.product_id === asin)
  }
  
  // Process keywords to get unique keywords with ASIN counts
  const getUniqueKeywords = () => {
    const keywordMap = new Map<string, {
      keyword: string,
      asins: string[],
      maxBid: number,
      maxClicks: number,
      maxOrders: number,
      matchTypes: Set<string>
    }>()
    
    keywords.forEach(k => {
      const key = k.keyword.toLowerCase()
      if (!keywordMap.has(key)) {
        keywordMap.set(key, {
          keyword: k.keyword,
          asins: [],
          maxBid: 0,
          maxClicks: 0,
          maxOrders: 0,
          matchTypes: new Set()
        })
      }
      
      const entry = keywordMap.get(key)!
      if (!entry.asins.includes(k.product_id)) {
        entry.asins.push(k.product_id)
      }
      entry.maxBid = Math.max(entry.maxBid, k.suggested_bid || 0)
      entry.maxClicks = Math.max(entry.maxClicks, k.estimated_clicks || 0)
      entry.maxOrders = Math.max(entry.maxOrders, k.estimated_orders || 0)
      entry.matchTypes.add(k.match_type?.toUpperCase() || 'BROAD')
    })
    
    return Array.from(keywordMap.values())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!niche) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <p className="text-gray-500">Niche not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push(`/admin`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Niche</h1>
            <p className="text-gray-600 mt-1">
              Manage products, keywords, and reviews for this niche
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (confirm('This will refresh all product data and keywords. This may take a few minutes. Continue?')) {
                  try {
                    // First, update the niche status to pending
                    const { error: updateError } = await supabase
                      .from('niches')
                      .update({ 
                        status: 'pending',
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', niche.id)
                    
                    if (updateError) {
                      console.error('Error updating niche status:', updateError)
                      alert('Failed to update niche status. Please try again.')
                      return
                    }
                    
                    // Call the working admin API with a refresh action
                    try {
                      const response = await fetch('/api/admin/niches', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: 'refresh',
                          nicheId: niche.id,
                          nicheName: niche.niche_name,
                          asins: niche.asins.split(',').map(a => a.trim()).filter(Boolean)
                        })
                      })
                      
                      const responseData = await response.json()
                      
                      if (response.ok) {
                        alert('Niche refresh started! Please refresh the page in a few minutes to see updated data.')
                        // Refresh the page data
                        loadNicheData()
                      } else {
                        console.error('API Response:', response.status, responseData)
                        alert(`Failed to start refresh: ${responseData.error || 'Unknown error'}`)
                      }
                    } catch (fetchError) {
                      console.error('Fetch error:', fetchError)
                      // If API fails, at least we updated the status
                      alert('Note: The niche status was updated to pending, but the full refresh may not have started. The system will process it in the background.')
                      loadNicheData()
                    }
                  } catch (error) {
                    console.error('Error in refresh:', error)
                    alert('Error starting refresh: ' + (error instanceof Error ? error.message : 'Unknown error'))
                  }
                }
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Niche Information</CardTitle>
            <CardDescription>
              Basic information about this niche
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="niche-name">Niche Name</Label>
                <Input
                  id="niche-name"
                  value={niche.niche_name}
                  onChange={(e) => setNiche({ ...niche, niche_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={niche.category || ''}
                  onChange={(e) => setNiche({ ...niche, category: e.target.value })}
                />
              </div>
            </div>
            
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={niche.description || ''}
                onChange={(e) => setNiche({ ...niche, description: e.target.value })}
                placeholder="Add a description for this niche..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={niche.notes || ''}
                onChange={(e) => setNiche({ ...niche, notes: e.target.value })}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Created: {new Date(niche.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last Updated: {new Date(niche.updated_at).toLocaleDateString()}</span>
              <span>•</span>
              <Badge className={niche.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                {niche.status}
              </Badge>
            </div>
          </CardContent>
        </Card>


        {/* Main Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b h-12">
                <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger value="keywords" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  Keywords ({formatNumber(totalKeywordCount)})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
                  Reviews ({formatNumber(totalReviewCount)})
                </TabsTrigger>
              </TabsList>
              
              {/* Products Tab */}
              <TabsContent value="products" className="p-6 mt-0">
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">All Products</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newAsin = prompt('Enter new ASIN to add:')
                          if (newAsin && /^B[A-Z0-9]{9}$/.test(newAsin.toUpperCase())) {
                            const updatedAsins = niche.asins + ',' + newAsin.toUpperCase()
                            setNiche({ ...niche, asins: updatedAsins })
                            alert('ASIN added. Save changes to persist.')
                          } else if (newAsin) {
                            alert('Invalid ASIN format. ASINs must start with B and be 10 characters long.')
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add ASIN
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Products
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products by title, ASIN, or brand..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px] text-center">Image</TableHead>
                        <TableHead className="min-w-[300px] max-w-[400px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium"
                            onClick={() => setProductSort(productSort?.field === 'title' && productSort.order === 'asc' 
                              ? {field: 'title', order: 'desc'} 
                              : {field: 'title', order: 'asc'})}
                          >
                            Title
                            {productSort?.field === 'title' && (
                              productSort.order === 'asc' ? ' ↑' : ' ↓'
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-medium"
                            onClick={() => setProductSort(productSort?.field === 'asin' && productSort.order === 'asc' 
                              ? {field: 'asin', order: 'desc'} 
                              : {field: 'asin', order: 'asc'})}
                          >
                            ASIN
                            {productSort?.field === 'asin' && (
                              productSort.order === 'asc' ? ' ↑' : ' ↓'
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-0 font-medium">
                                Brand
                                {brandFilter && <span className="ml-1 text-xs">({brandFilter})</span>}
                                {productSort?.field === 'brand' && (
                                  productSort.order === 'asc' ? ' ↑' : ' ↓'
                                )}
                                <ChevronDown className="ml-1 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuLabel>Sort</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setProductSort({field: 'brand', order: 'asc'})}>
                                A to Z
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setProductSort({field: 'brand', order: 'desc'})}>
                                Z to A
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Filter by Brand</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setBrandFilter('')}>
                                All Brands
                              </DropdownMenuItem>
                              {[...new Set(products.map(p => p.brand).filter(Boolean))].sort().map(brand => (
                                <DropdownMenuItem key={brand} onClick={() => setBrandFilter(brand || '')}>
                                  {brand}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead className="text-center">Keywords</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Filter products
                        let filteredProducts = products.filter(p => {
                          // Search filter
                          if (productSearch) {
                            const search = productSearch.toLowerCase()
                            const matchesSearch = p.title.toLowerCase().includes(search) ||
                                                 p.asin.toLowerCase().includes(search) ||
                                                 (p.brand && p.brand.toLowerCase().includes(search))
                            if (!matchesSearch) return false
                          }
                          
                          // Brand filter
                          if (brandFilter && p.brand !== brandFilter) return false
                          
                          return true
                        })
                        
                        // Sort products
                        if (productSort) {
                          filteredProducts = [...filteredProducts].sort((a, b) => {
                            let aVal = a[productSort.field as keyof ProductData]
                            let bVal = b[productSort.field as keyof ProductData]
                            
                            // Handle null/undefined values
                            if (aVal === null || aVal === undefined) aVal = ''
                            if (bVal === null || bVal === undefined) bVal = ''
                            
                            // Compare values
                            if (typeof aVal === 'string' && typeof bVal === 'string') {
                              return productSort.order === 'asc' 
                                ? aVal.localeCompare(bVal)
                                : bVal.localeCompare(aVal)
                            } else {
                              return productSort.order === 'asc'
                                ? (aVal as number) - (bVal as number)
                                : (bVal as number) - (aVal as number)
                            }
                          })
                        }
                        
                        return filteredProducts.map((product) => {
                          const productKeywords = getKeywordsByProduct(product.asin)
                          return (
                            <TableRow key={product.id}>
                            <TableCell className="text-center p-2">
                              <div className="w-20 h-20 mx-auto relative overflow-hidden rounded-lg bg-gray-50">
                                {product.image_urls ? (
                                  <img 
                                    src={product.image_urls.includes('http') ? product.image_urls : `https://images-na.ssl-images-amazon.com/images/I/${product.image_urls}`} 
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = ''
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Package className="h-10 w-10 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[300px] max-w-[400px]">
                              <p className="font-medium break-words whitespace-normal">{product.title}</p>
                            </TableCell>
                            <TableCell className="text-center">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{product.asin}</code>
                            </TableCell>
                            <TableCell className="text-center">{product.brand || '-'}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{productKeywords.length}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`https://www.amazon.com/dp/${product.asin}`, '_blank')}
                                  title="View on Amazon"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Remove ${product.asin} from this niche?`)) {
                                      const asins = niche.asins.split(',').map(a => a.trim()).filter(a => a !== product.asin)
                                      setNiche({ ...niche, asins: asins.join(',') })
                                      setProducts(products.filter(p => p.asin !== product.asin))
                                      alert('ASIN removed. Save changes to persist.')
                                    }
                                  }}
                                  title="Remove from niche"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              {/* Keywords Tab */}
              <TabsContent value="keywords" className="p-6 mt-0">
                {/* Keyword Metrics Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2 text-center">
                      <CardDescription>Unique Keywords</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold">{formatNumber(getUniqueKeywords().length)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2 text-center">
                      <CardDescription>Total Entries</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold">{formatNumber(keywords.length)}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2 text-center">
                      <CardDescription>Keywords with Click Data</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold">
                        {formatNumber(keywords.filter(k => k.estimated_clicks && k.estimated_clicks > 0).length)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {keywords.length > 0 
                          ? `${((keywords.filter(k => k.estimated_clicks && k.estimated_clicks > 0).length / keywords.length) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2 text-center">
                      <CardDescription>Keywords with Order Data</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold">
                        {formatNumber(keywords.filter(k => k.estimated_orders && k.estimated_orders > 0).length)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {keywords.length > 0 
                          ? `${((keywords.filter(k => k.estimated_orders && k.estimated_orders > 0).length / keywords.length) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2 text-center">
                      <CardDescription>Avg Bid Price</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-2xl font-bold">
                        {keywords.length > 0 
                          ? formatCurrency(keywords.reduce((sum, k) => sum + (k.suggested_bid || 0), 0) / keywords.length / 100)
                          : '$0.00'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">All Keywords</h3>
                      <p className="text-sm text-gray-600">
                        {keywords.length < totalKeywordCount 
                          ? `Showing ${formatNumber(keywords.length)} of ${formatNumber(totalKeywordCount)} keywords`
                          : `Total ${formatNumber(keywords.length)} keywords`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Keywords
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search keywords..."
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 bg-white text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 font-medium w-full"
                            onClick={() => setKeywordSort(keywordSort?.field === 'keyword' && keywordSort.order === 'asc' 
                              ? {field: 'keyword', order: 'desc'} 
                              : {field: 'keyword', order: 'asc'})}
                          >
                            Keyword
                            {keywordSort?.field === 'keyword' && (
                              keywordSort.order === 'asc' ? ' ↑' : ' ↓'
                            )}
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1 font-medium text-xs w-full">
                                <span className="block">ASIN</span>
                                <span className="block">Count</span>
                                {asinFilter.length > 0 && <span className="ml-1 text-xs">({asinFilter.length} selected)</span>}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuLabel>Filter by ASIN</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setAsinFilter([])}>
                                All ASINs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {[...new Set(keywords.map(k => k.product_id))].sort().map(asin => (
                                <DropdownMenuCheckboxItem 
                                  key={asin} 
                                  checked={asinFilter.includes(asin)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setAsinFilter([...asinFilter, asin])
                                    } else {
                                      setAsinFilter(asinFilter.filter(a => a !== asin))
                                    }
                                  }}
                                >
                                  {asin}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1 font-medium text-xs w-full whitespace-normal">
                                <span className="block">Match</span>
                                <span className="block">Type</span>
                                {matchTypeFilter && <span className="ml-1 text-xs">({matchTypeFilter})</span>}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuLabel>Filter by Match Type</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setMatchTypeFilter('')}>
                                All Types
                              </DropdownMenuItem>
                              {[...new Set(keywords.map(k => k.match_type?.toUpperCase() || 'BROAD'))].sort().map(type => (
                                <DropdownMenuItem key={type} onClick={() => setMatchTypeFilter(type)}>
                                  {type}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1 font-medium text-xs w-full whitespace-normal">
                                <span className="block">Suggested</span>
                                <span className="block">Bid</span>
                                {(bidFilter.min || bidFilter.max) && <span className="ml-1 text-xs">(filtered)</span>}
                                {keywordSort?.field === 'suggested_bid' && (
                                  keywordSort.order === 'asc' ? ' ↑' : ' ↓'
                                )}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuLabel>Sort</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setKeywordSort({field: 'suggested_bid', order: 'asc'})}>
                                Low to High
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setKeywordSort({field: 'suggested_bid', order: 'desc'})}>
                                High to Low
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Filter by Bid</DropdownMenuLabel>
                              <div className="px-2 py-2 space-y-2">
                                <Input
                                  type="number"
                                  placeholder="Min bid ($)"
                                  value={bidFilter.min || ''}
                                  onChange={(e) => setBidFilter({...bidFilter, min: e.target.value ? Number(e.target.value) : undefined})}
                                  className="h-8"
                                />
                                <Input
                                  type="number"
                                  placeholder="Max bid ($)"
                                  value={bidFilter.max || ''}
                                  onChange={(e) => setBidFilter({...bidFilter, max: e.target.value ? Number(e.target.value) : undefined})}
                                  className="h-8"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setBidFilter({})}
                                >
                                  Clear
                                </Button>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1 font-medium text-xs w-full whitespace-normal">
                                <span className="block">Est.</span>
                                <span className="block">Clicks</span>
                                {(clicksFilter.min || clicksFilter.max) && <span className="ml-1 text-xs">(filtered)</span>}
                                {keywordSort?.field === 'estimated_clicks' && (
                                  keywordSort.order === 'asc' ? ' ↑' : ' ↓'
                                )}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuLabel>Sort</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setKeywordSort({field: 'estimated_clicks', order: 'asc'})}>
                                Low to High
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setKeywordSort({field: 'estimated_clicks', order: 'desc'})}>
                                High to Low
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Filter by Clicks</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setClicksFilter({min: 1})}>
                                Has Click Data
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setClicksFilter({})}>
                                All Keywords
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-1 font-medium text-xs w-full whitespace-normal">
                                <span className="block">Est.</span>
                                <span className="block">Orders</span>
                                {(ordersFilter.min || ordersFilter.max) && <span className="ml-1 text-xs">(filtered)</span>}
                                {keywordSort?.field === 'estimated_orders' && (
                                  keywordSort.order === 'asc' ? ' ↑' : ' ↓'
                                )}
                                <ChevronDown className="ml-1 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuLabel>Sort</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setKeywordSort({field: 'estimated_orders', order: 'asc'})}>
                                Low to High
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setKeywordSort({field: 'estimated_orders', order: 'desc'})}>
                                High to Low
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Filter by Orders</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setOrdersFilter({min: 1})}>
                                Has Order Data
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setOrdersFilter({})}>
                                All Keywords
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="text-xs font-medium">
                            <span className="block">Conversion</span>
                            <span className="block">Rate</span>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Get unique keywords
                        let uniqueKeywords = getUniqueKeywords()
                        
                        // Filter unique keywords
                        let filteredKeywords = uniqueKeywords.filter(k => {
                          // Search filter
                          if (keywordSearch && !k.keyword.toLowerCase().includes(keywordSearch.toLowerCase())) return false
                          
                          // ASIN filter - show if keyword appears in ANY of the selected ASINs
                          if (asinFilter.length > 0) {
                            const hasSelectedAsin = k.asins.some(asin => asinFilter.includes(asin))
                            if (!hasSelectedAsin) return false
                          }
                          
                          // Match type filter
                          if (matchTypeFilter && !k.matchTypes.has(matchTypeFilter)) return false
                          
                          // Bid filter (using max bid)
                          const bidInDollars = k.maxBid / 100
                          if (bidFilter.min !== undefined && bidInDollars < bidFilter.min) return false
                          if (bidFilter.max !== undefined && bidInDollars > bidFilter.max) return false
                          
                          // Clicks filter (using max clicks)
                          if (clicksFilter.min !== undefined && k.maxClicks < clicksFilter.min) return false
                          if (clicksFilter.max !== undefined && k.maxClicks > clicksFilter.max) return false
                          
                          // Orders filter (using max orders)
                          if (ordersFilter.min !== undefined && k.maxOrders < ordersFilter.min) return false
                          if (ordersFilter.max !== undefined && k.maxOrders > ordersFilter.max) return false
                          
                          return true
                        })
                        
                        // Sort keywords
                        if (keywordSort) {
                          filteredKeywords = [...filteredKeywords].sort((a, b) => {
                            let aVal, bVal
                            
                            switch(keywordSort.field) {
                              case 'keyword':
                                aVal = a.keyword
                                bVal = b.keyword
                                break
                              case 'suggested_bid':
                                aVal = a.maxBid
                                bVal = b.maxBid
                                break
                              case 'estimated_clicks':
                                aVal = a.maxClicks
                                bVal = b.maxClicks
                                break
                              case 'estimated_orders':
                                aVal = a.maxOrders
                                bVal = b.maxOrders
                                break
                              default:
                                aVal = a.asins.length
                                bVal = b.asins.length
                            }
                            
                            if (typeof aVal === 'string' && typeof bVal === 'string') {
                              return keywordSort.order === 'asc' 
                                ? aVal.localeCompare(bVal)
                                : bVal.localeCompare(aVal)
                            } else {
                              return keywordSort.order === 'asc'
                                ? (aVal as number) - (bVal as number)
                                : (bVal as number) - (aVal as number)
                            }
                          })
                        }
                        
                        // Paginate
                        const startIndex = (keywordPage - 1) * keywordsPerPage
                        const paginatedKeywords = filteredKeywords.slice(startIndex, startIndex + keywordsPerPage)
                        
                        return paginatedKeywords.map((keyword, index) => {
                          const conversionRate = keyword.maxClicks && keyword.maxOrders 
                            ? ((keyword.maxOrders / keyword.maxClicks) * 100).toFixed(1)
                            : '0'
                          return (
                            <TableRow key={startIndex + index}>
                              <TableCell className="font-medium sticky left-0 z-10 bg-white text-center">{keyword.keyword}</TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={keyword.asins.length > 5 ? "default" : "outline"} 
                                className="text-xs cursor-help"
                                title={`ASINs: ${keyword.asins.join(', ')}`}
                              >
                                {keyword.asins.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-xs">
                                {Array.from(keyword.matchTypes).join(', ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {keyword.maxBid ? formatCurrency(keyword.maxBid / 100) : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {keyword.maxClicks > 0 ? formatNumber(keyword.maxClicks) : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {keyword.maxOrders > 0 ? formatNumber(keyword.maxOrders) : '-'}
                            </TableCell>
                            <TableCell className="text-center">{conversionRate}%</TableCell>
                          </TableRow>
                        )
                      })
                      })()}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                {(() => {
                  const uniqueKeywords = getUniqueKeywords()
                  const filteredKeywords = uniqueKeywords.filter(k => {
                    if (keywordSearch && !k.keyword.toLowerCase().includes(keywordSearch.toLowerCase())) return false
                    if (asinFilter.length > 0 && !k.asins.some(asin => asinFilter.includes(asin))) return false
                    if (matchTypeFilter && !k.matchTypes.has(matchTypeFilter)) return false
                    const bidInDollars = k.maxBid / 100
                    if (bidFilter.min !== undefined && bidInDollars < bidFilter.min) return false
                    if (bidFilter.max !== undefined && bidInDollars > bidFilter.max) return false
                    if (clicksFilter.min !== undefined && k.maxClicks < clicksFilter.min) return false
                    if (clicksFilter.max !== undefined && k.maxClicks > clicksFilter.max) return false
                    if (ordersFilter.min !== undefined && k.maxOrders < ordersFilter.min) return false
                    if (ordersFilter.max !== undefined && k.maxOrders > ordersFilter.max) return false
                    return true
                  })
                  const totalPages = Math.ceil(filteredKeywords.length / keywordsPerPage)
                  
                  return filteredKeywords.length > keywordsPerPage && (
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-600">
                        Showing {((keywordPage - 1) * keywordsPerPage) + 1} to {Math.min(keywordPage * keywordsPerPage, filteredKeywords.length)} of {filteredKeywords.length} filtered keywords
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setKeywordPage(Math.max(1, keywordPage - 1))}
                          disabled={keywordPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm">
                          Page {keywordPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setKeywordPage(Math.min(totalPages, keywordPage + 1))}
                          disabled={keywordPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Customer Reviews Analysis</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadReviews()}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Review Summary Stats */}
                  {reviews.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Review Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Reviews</p>
                            <p className="text-2xl font-bold">{reviews.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Rating</p>
                            <p className="text-2xl font-bold">
                              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Verified Purchases</p>
                            <p className="text-2xl font-bold">
                              {((reviews.filter(r => r.verified_purchase).length / reviews.length) * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Unique Products</p>
                            <p className="text-2xl font-bold">
                              {new Set(reviews.map(r => r.product_id)).size}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {reviews.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Rating</TableHead>
                            <TableHead className="w-[120px]">ASIN</TableHead>
                            <TableHead>Review Title</TableHead>
                            <TableHead className="w-[150px]">Reviewer</TableHead>
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead className="w-[100px] text-center">Verified</TableHead>
                            <TableHead className="w-[80px] text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reviews.map((review) => (
                            <TableRow key={review.id}>
                              <TableCell>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {review.product_id}
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xl">
                                  <p className="font-medium">{review.title || 'No title'}</p>
                                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{review.content}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm">{review.reviewer_name}</p>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(review.review_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-center">
                                {review.verified_purchase ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Review Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        // Show full review in a modal or alert
                                        alert(`Full Review:\n\nTitle: ${review.title}\n\nContent: ${review.content}\n\nRating: ${review.rating}/5\nDate: ${new Date(review.review_date).toLocaleDateString()}\nVerified: ${review.verified_purchase ? 'Yes' : 'No'}`)
                                      }}
                                    >
                                      View Full Review
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        window.open(`https://www.amazon.com/dp/${review.product_id}`, '_blank')
                                      }}
                                    >
                                      View Product on Amazon
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {totalReviewCount > 0 
                          ? "Loading reviews..."
                          : "No reviews found for this niche"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin`)}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}