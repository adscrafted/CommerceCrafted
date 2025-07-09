'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'

interface NicheQueueItem {
  id: string
  nicheName: string
  asins: string[]
  status: 'pending' | 'analyzing' | 'completed' | 'scheduled'
  addedDate: string
  scheduledDate: string
  category: string
  totalProducts: number
  avgBsr: number
  avgPrice: number
  avgRating: number
  totalReviews: number
  totalMonthlyRevenue: number
  opportunityScore?: number
  competitionLevel: string
  processTime?: string
  analystAssigned?: string
  nicheKeywords: string[]
  marketSize: number
  // Extended data for editing
  aiAnalysis?: {
    whyThisProduct?: string
    keyHighlights?: string[]
    demandAnalysis?: string
    competitionAnalysis?: string
    keywordAnalysis?: string
    financialAnalysis?: string
    listingOptimization?: {
      title?: string
      bulletPoints?: string[]
      description?: string
    }
  }
}

export default function AdminNicheQueue() {
  const [searchTerm, setSearchTerm] = useState('')
  const [newNicheName, setNewNicheName] = useState('')
  const [newAsins, setNewAsins] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  // Mock niche queue data
  const [nicheQueue, setNicheQueue] = useState<NicheQueueItem[]>([
    {
      id: '1',
      nicheName: 'Bluetooth Sleep Masks',
      asins: ['B08MVBRNKV', 'B07SHBQY7Z', 'B07KC5DWCC', 'B08GC7ML5B', 'B08R6QZ2XJ'],
      status: 'completed',
      addedDate: '2025-07-03',
      scheduledDate: '2025-07-04',
      category: 'Health & Personal Care',
      totalProducts: 5,
      avgBsr: 2341,
      avgPrice: 29.99,
      avgRating: 4.3,
      totalReviews: 35678,
      totalMonthlyRevenue: 520000,
      opportunityScore: 87,
      competitionLevel: 'Medium',
      processTime: '2h 15min',
      analystAssigned: 'AI Agent',
      nicheKeywords: ['bluetooth sleep mask', 'sleep headphones', 'wireless sleep mask'],
      marketSize: 15000000,
      aiAnalysis: {
        whyThisProduct: 'The Bluetooth Sleep Mask niche represents an exceptional opportunity due to the convergence of three growing trends: the $15B sleep wellness market, the $50B wearable technology sector, and the increasing demand for multi-functional products. This niche addresses a clear pain point for millions of people who struggle with sleep quality while wanting to maintain connectivity to audio content.',
        keyHighlights: [
          'Growing sleep wellness market valued at $15B with 8% annual growth',
          'Convergence of audio technology and sleep aid markets',
          'High customer satisfaction rates (4.3+ average rating)',
          'Multiple use cases: travel, meditation, shift work, insomnia',
          'Premium pricing tolerance in health & wellness category'
        ],
        demandAnalysis: 'Strong and growing demand driven by increased awareness of sleep health, remote work trends, and travel recovery. Search volume shows consistent 15% YoY growth with peak seasonality during Q4 (holiday travel) and Q1 (wellness resolutions).',
        competitionAnalysis: 'Moderate competition with 127 active competitors, but significant differentiation opportunities exist. Top 5 players control only 60% market share, leaving room for innovation in areas like battery life, comfort materials, and smart features.',
        keywordAnalysis: 'Primary keyword "bluetooth sleep mask" has 45K monthly searches with moderate competition. Long-tail opportunities in "sleep headphones for side sleepers" and "travel sleep mask bluetooth" show strong conversion potential.',
        financialAnalysis: 'Strong unit economics with average selling prices of $29.99 and healthy 45-55% gross margins. Customer lifetime value estimated at $85 with repeat purchase rates of 23% within 12 months.',
        listingOptimization: {
          title: 'Bluetooth Sleep Mask with Ultra-Thin Speakers - Wireless Sleep Headphones for Side Sleepers, 3D Contoured Eye Mask for Sleeping, Travel, Meditation',
          bulletPoints: [
            'ULTRA-THIN SPEAKERS FOR SIDE SLEEPERS: Revolutionary 0.25-inch speakers provide crystal-clear audio without pressure points',
            '100% BLACKOUT & 3D CONTOURED DESIGN: Advanced ergonomic shape blocks all light while allowing natural eye movement',
            'PREMIUM BLUETOOTH 5.2 TECHNOLOGY: 10-hour battery life with stable 45-foot range connection',
            'ADJUSTABLE & WASHABLE: One-size-fits-all design with removable speakers for easy machine washing',
            'PERFECT FOR: Side sleepers, travelers, meditation, shift workers, and anyone seeking better sleep quality'
          ],
          description: 'Transform your sleep experience with our revolutionary Bluetooth Sleep Mask that combines the best of sleep science and audio technology...'
        }
      }
    },
    {
      id: '2',
      nicheName: 'Laptop Cooling Stands',
      asins: ['B09XYZABC1', 'B08N5WL7ZD', 'B07PJV3JPR', 'B08NWDMTVD'],
      status: 'analyzing',
      addedDate: '2025-07-04',
      scheduledDate: '2025-07-05',
      category: 'Office Products',
      totalProducts: 4,
      avgBsr: 892,
      avgPrice: 45.99,
      avgRating: 4.5,
      totalReviews: 22456,
      totalMonthlyRevenue: 890000,
      opportunityScore: 0,
      competitionLevel: 'High',
      processTime: '0',
      analystAssigned: 'AI Agent',
      nicheKeywords: ['laptop stand', 'laptop cooling', 'ergonomic laptop stand'],
      marketSize: 28000000
    },
    {
      id: '3',
      nicheName: 'Waterproof Fitness Trackers',
      asins: ['B07QRST123', 'B08P5T6VJD', 'B09HGZ3YWB', 'B08VDR5TZH', 'B09BVLXFZB'],
      status: 'scheduled',
      addedDate: '2025-07-04',
      scheduledDate: '2025-07-06',
      category: 'Sports & Outdoors',
      totalProducts: 5,
      avgBsr: 5432,
      avgPrice: 39.99,
      avgRating: 4.1,
      totalReviews: 18900,
      totalMonthlyRevenue: 350000,
      opportunityScore: 0,
      competitionLevel: 'Low',
      processTime: '0',
      analystAssigned: 'AI Agent',
      nicheKeywords: ['fitness tracker', 'waterproof watch', 'heart rate monitor'],
      marketSize: 45000000
    },
    {
      id: '4',
      nicheName: 'Smart Security Cameras',
      asins: ['B08DEFG456', 'B086DKVGCW', 'B08R59YH7W', 'B07X6C9RMF'],
      status: 'pending',
      addedDate: '2025-07-02',
      scheduledDate: '2025-07-07',
      category: 'Electronics',
      totalProducts: 4,
      avgBsr: 1567,
      avgPrice: 129.99,
      avgRating: 4.4,
      totalReviews: 42000,
      totalMonthlyRevenue: 2800000,
      opportunityScore: 0,
      competitionLevel: 'Very High',
      processTime: '0',
      analystAssigned: 'AI Agent',
      nicheKeywords: ['security camera', 'smart home security', 'wireless camera'],
      marketSize: 120000000
    }
  ])

  const handleAddNiche = () => {
    if (!newNicheName || !newAsins || !selectedDate) return

    const asinList = newAsins.split(',').map(asin => asin.trim()).filter(asin => asin.length > 0)
    if (asinList.length === 0) return

    const newNiche: NicheQueueItem = {
      id: Date.now().toString(),
      nicheName: newNicheName,
      asins: asinList,
      status: 'pending',
      addedDate: new Date().toISOString().split('T')[0],
      scheduledDate: selectedDate,
      category: 'Pending',
      totalProducts: asinList.length,
      avgBsr: 0,
      avgPrice: 0,
      avgRating: 0,
      totalReviews: 0,
      totalMonthlyRevenue: 0,
      competitionLevel: 'Unknown',
      analystAssigned: 'AI Agent',
      nicheKeywords: [],
      marketSize: 0
    }

    setNicheQueue([...nicheQueue, newNiche])
    setNewNicheName('')
    setNewAsins('')
    setSelectedDate('')
  }


  const handleDelete = (id: string) => {
    setNicheQueue(nicheQueue.filter(item => item.id !== id))
  }

  const handleAnalyzeNow = (id: string) => {
    setNicheQueue(nicheQueue.map(item => 
      item.id === id ? { ...item, status: 'analyzing' } : item
    ))
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'analyzing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'analyzing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const filteredQueue = nicheQueue.filter(item =>
    item.nicheName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.asins.some(asin => asin.toLowerCase().includes(searchTerm.toLowerCase()))
  )


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Niche Queue Management</h1>
          <p className="text-gray-600">
            Manage and schedule product niches for deep research analysis
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/niche/new">
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Link>
        </Button>
      </div>


      {/* Add New Niche */}
      <Card>
        <CardHeader>
          <CardTitle>Add Niche to Queue</CardTitle>
          <CardDescription>Schedule a collection of related products for deep research analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nicheName" className="text-sm font-medium text-gray-700">Niche Name</Label>
                <Input
                  id="nicheName"
                  placeholder="e.g., Bluetooth Sleep Masks"
                  value={newNicheName}
                  onChange={(e) => setNewNicheName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">Scheduled Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="asins" className="text-sm font-medium text-gray-700">Amazon ASINs (comma-separated)</Label>
              <Input
                id="asins"
                placeholder="e.g., B08MVBRNKV, B07SHBQY7Z, B07KC5DWCC"
                value={newAsins}
                onChange={(e) => setNewAsins(e.target.value)}
                className="font-mono mt-1"
              />
              <p className="text-sm text-gray-500 mt-2">Enter 3-10 related ASINs separated by commas</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleAddNiche} disabled={!newNicheName || !newAsins || !selectedDate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Niche to Queue
              </Button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Deep Research Analysis:</strong> Each niche will undergo comprehensive analysis including market trends, competition mapping, keyword clustering, demand forecasting, and opportunity scoring across all provided ASINs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Niche Queue */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Niche Queue</CardTitle>
              <CardDescription>Manage scheduled niche analyses</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search niches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASINs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg BSR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reviews</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQueue.map((niche) => (
                  <tr key={niche.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{niche.nicheName}</div>
                      {niche.nicheKeywords.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {niche.nicheKeywords.slice(0, 2).join(', ')}
                          {niche.nicheKeywords.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600 font-mono">
                        {niche.asins.slice(0, 2).join(', ')}
                        {niche.asins.length > 2 && ` +${niche.asins.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{niche.category}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{niche.totalProducts}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{niche.avgBsr.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${niche.avgPrice}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{niche.totalReviews.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${(niche.marketSize / 1000000).toFixed(1)}M</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={
                        niche.competitionLevel === 'Low' ? 'border-green-200 text-green-800' :
                        niche.competitionLevel === 'Medium' ? 'border-yellow-200 text-yellow-800' :
                        niche.competitionLevel === 'High' ? 'border-orange-200 text-orange-800' :
                        'border-red-200 text-red-800'
                      }>
                        {niche.competitionLevel}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(niche.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(niche.status)}
                          {niche.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(niche.scheduledDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {niche.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyzeNow(niche.id)}
                          >
                            Process
                          </Button>
                        )}
                        {niche.status === 'completed' && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/products/${niche.asins[0]}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/admin/niche/${niche.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(niche.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Removed Edit Modal - Now using full page routes */}

    </div>
  )
}