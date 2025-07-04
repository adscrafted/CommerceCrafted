'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Package,
  Zap,
  Edit3,
  Eye,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Database,
  FileText,
  Activity
} from 'lucide-react'

interface Product {
  id: string
  asin: string
  title: string
  category: string
  subcategory: string
  brand: string
  price: number
  bsr: number
  rating: number
  reviewCount: number
  imageUrl: string
  status: 'active' | 'inactive' | 'pending_review' | 'removed'
  opportunityScore: number
  competitionLevel: 'low' | 'medium' | 'high'
  demandTrend: 'rising' | 'stable' | 'declining'
  lastUpdated: Date
  analysisStatus: 'complete' | 'partial' | 'pending' | 'failed'
  featuredCount: number
  estimatedRevenue: number
  tags: string[]
}

interface ProductAnalysisSchedule {
  id: string
  productId: string
  analysisType: 'daily_update' | 'weekly_deep' | 'monthly_review' | 'custom'
  frequency: string
  lastRun: Date
  nextRun: Date
  status: 'active' | 'paused' | 'failed'
  priority: 'low' | 'medium' | 'high'
}

interface BulkAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  action: (productIds: string[]) => void
}

interface ProductManagementProps {
  className?: string
  userRole?: 'admin' | 'analyst' | 'user'
}

export default function ProductManagement({ className, userRole = 'admin' }: ProductManagementProps) {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Product[]>([])
  const [schedules, setSchedules] = useState<ProductAnalysisSchedule[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('opportunity_score')
  const [isLoading, setIsLoading] = useState(true)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Mock data - in production, fetch from API
  useEffect(() => {
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: 'prod-001',
          asin: 'B08N5WRWNW',
          title: 'Wireless Noise Cancelling Bluetooth Headphones with 30H Playtime',
          category: 'Electronics',
          subcategory: 'Audio > Headphones',
          brand: 'TechSound Pro',
          price: 79.99,
          bsr: 8542,
          rating: 4.3,
          reviewCount: 2847,
          imageUrl: '/api/placeholder/80/80',
          status: 'active',
          opportunityScore: 8.5,
          competitionLevel: 'medium',
          demandTrend: 'rising',
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          analysisStatus: 'complete',
          featuredCount: 3,
          estimatedRevenue: 24500,
          tags: ['featured', 'high-opportunity', 'audio']
        },
        {
          id: 'prod-002',
          asin: 'B07X8K9PQR',
          title: 'Smart Home Security Camera System with Night Vision',
          category: 'Electronics',
          subcategory: 'Security > Cameras',
          brand: 'SecureVision',
          price: 149.99,
          bsr: 12456,
          rating: 4.1,
          reviewCount: 1523,
          imageUrl: '/api/placeholder/80/80',
          status: 'active',
          opportunityScore: 7.8,
          competitionLevel: 'high',
          demandTrend: 'stable',
          lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          analysisStatus: 'complete',
          featuredCount: 1,
          estimatedRevenue: 32000,
          tags: ['security', 'home-automation']
        },
        {
          id: 'prod-003',
          asin: 'B09M8N7K6L',
          title: 'Ergonomic Office Chair with Lumbar Support',
          category: 'Home & Office',
          subcategory: 'Furniture > Chairs',
          brand: 'ComfortDesk',
          price: 199.99,
          bsr: 3421,
          rating: 4.5,
          reviewCount: 3421,
          imageUrl: '/api/placeholder/80/80',
          status: 'inactive',
          opportunityScore: 9.2,
          competitionLevel: 'low',
          demandTrend: 'rising',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          analysisStatus: 'pending',
          featuredCount: 0,
          estimatedRevenue: 45000,
          tags: ['office', 'furniture', 'wfh']
        },
        {
          id: 'prod-004',
          asin: 'B08K7G4H2M',
          title: 'Stainless Steel Kitchen Knife Set with Block',
          category: 'Home & Kitchen',
          subcategory: 'Kitchen > Knives',
          brand: 'ChefMaster',
          price: 89.99,
          bsr: 6789,
          rating: 4.2,
          reviewCount: 2156,
          imageUrl: '/api/placeholder/80/80',
          status: 'pending_review',
          opportunityScore: 6.8,
          competitionLevel: 'medium',
          demandTrend: 'declining',
          lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          analysisStatus: 'failed',
          featuredCount: 2,
          estimatedRevenue: 18500,
          tags: ['kitchen', 'cooking']
        }
      ]

      const mockSchedules: ProductAnalysisSchedule[] = [
        {
          id: 'sched-001',
          productId: 'prod-001',
          analysisType: 'daily_update',
          frequency: 'Every day at 6:00 AM',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
          status: 'active',
          priority: 'high'
        },
        {
          id: 'sched-002',
          productId: 'prod-002',
          analysisType: 'weekly_deep',
          frequency: 'Every Monday at 8:00 AM',
          lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'active',
          priority: 'medium'
        },
        {
          id: 'sched-003',
          productId: 'prod-004',
          analysisType: 'custom',
          frequency: 'Every 3 days at 10:00 AM',
          lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'failed',
          priority: 'low'
        }
      ]

      setProducts(mockProducts)
      setSchedules(mockSchedules)
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'removed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAnalysisStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getTimeUntil = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Soon'
    if (diffInHours < 24) return `In ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `In ${diffInDays}d`
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.asin.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory
      const matchesStatus = filterStatus === 'all' || product.status === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'opportunity_score': return b.opportunityScore - a.opportunityScore
        case 'revenue': return b.estimatedRevenue - a.estimatedRevenue
        case 'last_updated': return b.lastUpdated.getTime() - a.lastUpdated.getTime()
        case 'rating': return b.rating - a.rating
        default: return 0
      }
    })

  const categories = [...new Set(products.map(p => p.category))]

  const bulkActions: BulkAction[] = [
    {
      id: 'analyze',
      name: 'Run Analysis',
      description: 'Run deep analysis on selected products',
      icon: <BarChart3 className="h-4 w-4" />,
      action: (productIds) => console.log('Analyzing products:', productIds)
    },
    {
      id: 'schedule',
      name: 'Schedule Analysis',
      description: 'Setup automated analysis schedule',
      icon: <Calendar className="h-4 w-4" />,
      action: (productIds) => console.log('Scheduling analysis for:', productIds)
    },
    {
      id: 'export',
      name: 'Export Data',
      description: 'Export selected products data',
      icon: <Download className="h-4 w-4" />,
      action: (productIds) => console.log('Exporting:', productIds)
    },
    {
      id: 'feature',
      name: 'Feature Deal',
      description: 'Add to featured deals',
      icon: <Star className="h-4 w-4" />,
      action: (productIds) => console.log('Featuring:', productIds)
    },
    {
      id: 'update_status',
      name: 'Update Status',
      description: 'Change product status',
      icon: <Settings className="h-4 w-4" />,
      action: (productIds) => console.log('Updating status:', productIds)
    }
  ]

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length 
        ? [] 
        : filteredProducts.map(p => p.id)
    )
  }

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Database className="h-6 w-6 mr-2 text-blue-600" />
                Product Management
              </CardTitle>
              <CardDescription>
                Manage product database, analysis scheduling, and bulk operations
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="schedules">Analysis Schedules ({schedules.length})</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="removed">Removed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="opportunity_score">Opportunity Score</option>
                  <option value="revenue">Revenue Potential</option>
                  <option value="last_updated">Last Updated</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedProducts.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducts([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bulkActions.slice(0, 3).map(action => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => action.action(selectedProducts)}
                        className="flex items-center space-x-1"
                      >
                        {action.icon}
                        <span>{action.name}</span>
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {showBulkActions && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4 pt-4 border-t border-blue-200">
                    {bulkActions.map(action => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => action.action(selectedProducts)}
                        className="flex items-center justify-center space-x-1"
                      >
                        {action.icon}
                        <span className="text-xs">{action.name}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Products Table Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredProducts.length})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={selectedProducts.includes(product.id) ? 'ring-2 ring-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelect(product.id)}
                      className="mt-1 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{product.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{product.brand}</Badge>
                            <Badge variant="secondary">{product.category}</Badge>
                            <Badge className={getStatusColor(product.status)}>
                              {product.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getAnalysisStatusColor(product.analysisStatus)}>
                              Analysis: {product.analysisStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {product.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <Target className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                          <div className={`font-bold ${getScoreColor(product.opportunityScore)}`}>
                            {product.opportunityScore}/10
                          </div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                          <div className="font-bold text-green-600">
                            {formatCurrency(product.estimatedRevenue)}
                          </div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <Users className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                          <Badge className={`text-xs ${getCompetitionColor(product.competitionLevel)}`}>
                            {product.competitionLevel}
                          </Badge>
                          <div className="text-xs text-gray-600">Competition</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          {getTrendIcon(product.demandTrend)}
                          <div className="font-bold text-purple-600 capitalize text-sm">
                            {product.demandTrend}
                          </div>
                          <div className="text-xs text-gray-600">Trend</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Star className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                          <div className="font-bold text-gray-900">
                            {product.rating}
                          </div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <Clock className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                          <div className="font-bold text-orange-600">
                            {getTimeAgo(product.lastUpdated)}
                          </div>
                          <div className="text-xs text-gray-600">Updated</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span>ASIN: {product.asin} • BSR: #{product.bsr.toLocaleString()} • Featured: {product.featuredCount}x</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analysis Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const product = products.find(p => p.id === schedule.productId)
              if (!product) return null

              return (
                <Card key={schedule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{product.title}</h3>
                          <Badge className={getStatusColor(schedule.status)}>
                            {schedule.status}
                          </Badge>
                          <Badge variant="outline" className={
                            schedule.priority === 'high' ? 'border-red-300 text-red-800' :
                            schedule.priority === 'medium' ? 'border-yellow-300 text-yellow-800' :
                            'border-green-300 text-green-800'
                          }>
                            {schedule.priority} priority
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Analysis Type</p>
                            <p className="text-sm text-gray-600 capitalize">{schedule.analysisType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Frequency</p>
                            <p className="text-sm text-gray-600">{schedule.frequency}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Last Run</p>
                            <p className="text-sm text-gray-600">{getTimeAgo(schedule.lastRun)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Next Run</p>
                            <p className="text-sm text-gray-600">{getTimeUntil(schedule.nextRun)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bulkActions.map(action => (
              <Card key={action.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-blue-600 mb-3">{action.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Button size="sm" onClick={() => action.action([])}>
                    Execute
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.analysisStatus === 'complete').length}
                </div>
                <div className="text-sm text-gray-600">Analyzed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{schedules.length}</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}