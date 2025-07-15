'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Plus,
  X,
  Package,
  TrendingUp,
  Search,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface Niche {
  id: string
  niche_name: string
  asins: string
  total_products: number
  marketplace: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_progress?: any
  avg_opportunity_score?: number
  avg_competition_score?: number
  avg_demand_score?: number
  avg_feasibility_score?: number
  avg_timing_score?: number
  avg_price?: number
  avg_bsr?: number
  total_monthly_revenue?: number
  market_size?: number
  total_reviews?: number
  total_keywords?: number
  niche_keywords?: string
  competition_level?: string
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export default function EditProductGroupPage() {
  const params = useParams()
  const router = useRouter()
  const [niche, setNiche] = useState<Niche | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    niche_name: '',
    asins: [] as string[],
    marketplace: 'US',
    notes: '',
    tags: [] as string[],
    niche_keywords: [] as string[],
    competition_level: '',
    // Manual overrides for scores
    avg_opportunity_score: '',
    avg_competition_score: '',
    avg_demand_score: '',
    avg_feasibility_score: '',
    avg_timing_score: ''
  })

  // New inputs
  const [newAsin, setNewAsin] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    loadNiche()
  }, [params.id])

  const loadNiche = async () => {
    try {
      const { data, error } = await supabase
        .from('niches')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error) throw error
      
      if (data) {
        setNiche(data)
        setFormData({
          niche_name: data.niche_name || '',
          asins: data.asins ? data.asins.split(',').map((a: string) => a.trim()) : [],
          marketplace: data.marketplace || 'US',
          notes: data.notes || '',
          tags: data.tags || [],
          niche_keywords: data.niche_keywords ? data.niche_keywords.split(',').map((k: string) => k.trim()) : [],
          competition_level: data.competition_level || '',
          avg_opportunity_score: data.avg_opportunity_score?.toString() || '',
          avg_competition_score: data.avg_competition_score?.toString() || '',
          avg_demand_score: data.avg_demand_score?.toString() || '',
          avg_feasibility_score: data.avg_feasibility_score?.toString() || '',
          avg_timing_score: data.avg_timing_score?.toString() || ''
        })
      }
    } catch (error) {
      console.error('Error loading niche:', error)
      alert('Failed to load product group')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!niche) return
    
    setIsSaving(true)
    try {
      const updateData: any = {
        niche_name: formData.niche_name,
        asins: formData.asins.join(','),
        total_products: formData.asins.length,
        marketplace: formData.marketplace,
        notes: formData.notes,
        tags: formData.tags,
        niche_keywords: formData.niche_keywords.join(','),
        total_keywords: formData.niche_keywords.length,
        competition_level: formData.competition_level,
        updated_at: new Date().toISOString()
      }

      // Add score overrides if provided
      if (formData.avg_opportunity_score) updateData.avg_opportunity_score = parseFloat(formData.avg_opportunity_score)
      if (formData.avg_competition_score) updateData.avg_competition_score = parseFloat(formData.avg_competition_score)
      if (formData.avg_demand_score) updateData.avg_demand_score = parseFloat(formData.avg_demand_score)
      if (formData.avg_feasibility_score) updateData.avg_feasibility_score = parseFloat(formData.avg_feasibility_score)
      if (formData.avg_timing_score) updateData.avg_timing_score = parseFloat(formData.avg_timing_score)

      const { error } = await supabase
        .from('niches')
        .update(updateData)
        .eq('id', niche.id)
      
      if (error) throw error
      
      setHasChanges(false)
      alert('Product group updated successfully')
      
      // If ASINs changed and status is completed, suggest reprocessing
      if (niche.status === 'completed' && formData.asins.join(',') !== niche.asins) {
        if (confirm('ASINs have changed. Would you like to reprocess this product group?')) {
          await reprocessNiche()
        }
      }
    } catch (error) {
      console.error('Error saving niche:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const reprocessNiche = async () => {
    if (!niche) return
    
    try {
      const response = await fetch('/api/niches/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicheId: niche.id,
          nicheName: formData.niche_name,
          asins: formData.asins,
          marketplace: formData.marketplace
        })
      })

      if (!response.ok) throw new Error('Failed to reprocess')
      
      alert('Reprocessing started. You can monitor progress in the Product Queue.')
      router.push('/admin?tab=products')
    } catch (error) {
      console.error('Error reprocessing:', error)
      alert('Failed to start reprocessing')
    }
  }

  const handleAddAsin = () => {
    if (newAsin && !formData.asins.includes(newAsin)) {
      setFormData({
        ...formData,
        asins: [...formData.asins, newAsin.toUpperCase()]
      })
      setNewAsin('')
      setHasChanges(true)
    }
  }

  const handleRemoveAsin = (asin: string) => {
    setFormData({
      ...formData,
      asins: formData.asins.filter(a => a !== asin)
    })
    setHasChanges(true)
  }

  const handleAddKeyword = () => {
    if (newKeyword && !formData.niche_keywords.includes(newKeyword)) {
      setFormData({
        ...formData,
        niche_keywords: [...formData.niche_keywords, newKeyword.toLowerCase()]
      })
      setNewKeyword('')
      setHasChanges(true)
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      niche_keywords: formData.niche_keywords.filter(k => k !== keyword)
    })
    setHasChanges(true)
  }

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      })
      setNewTag('')
      setHasChanges(true)
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
    setHasChanges(true)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!niche) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Product Group Not Found</h2>
            <Button onClick={() => router.push('/admin?tab=products')}>
              Back to Product Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin?tab=products')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product Queue
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Product Group</h1>
            <p className="text-gray-600">ID: {niche.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {niche.status === 'completed' && (
            <Button
              variant="outline"
              onClick={reprocessNiche}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reprocess
            </Button>
          )}
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Processing status and analytics summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="mt-1">
                {niche.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-xl font-semibold">{niche.total_products}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-xl font-semibold">{formatCurrency(niche.total_monthly_revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Market Size</p>
              <p className="text-xl font-semibold">{formatCurrency(niche.market_size)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-xl font-semibold">{formatCurrency(niche.avg_price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-xl font-semibold">{formatNumber(niche.total_reviews)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Tabs */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="products">Products (ASINs)</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="scores">Analytics Scores</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Edit the product group name and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.niche_name}
                  onChange={(e) => {
                    setFormData({ ...formData, niche_name: e.target.value })
                    setHasChanges(true)
                  }}
                />
              </div>

              <div>
                <Label htmlFor="marketplace">Marketplace</Label>
                <Select 
                  value={formData.marketplace} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, marketplace: value })
                    setHasChanges(true)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>

              <div>
                <Label htmlFor="competition">Competition Level</Label>
                <Select 
                  value={formData.competition_level} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, competition_level: value })
                    setHasChanges(true)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select competition level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="VERY_HIGH">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => {
                    setFormData({ ...formData, notes: e.target.value })
                    setHasChanges(true)
                  }}
                  placeholder="Add any internal notes about this product group..."
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products (ASINs)</CardTitle>
              <CardDescription>Manage the ASINs in this product group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add ASIN (e.g., B08MVBRNKV)"
                  value={newAsin}
                  onChange={(e) => setNewAsin(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAsin()}
                />
                <Button onClick={handleAddAsin}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add ASIN
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {formData.asins.length} products in this group
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {formData.asins.map((asin) => (
                    <div
                      key={asin}
                      className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                    >
                      <code className="text-sm">{asin}</code>
                      <X
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                        onClick={() => handleRemoveAsin(asin)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {niche.processing_progress?.failedAsins?.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <p className="text-sm font-medium text-red-700 mb-2">
                    Failed ASINs from last processing:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {niche.processing_progress.failedAsins.map((asin: string) => (
                      <code key={asin} className="text-sm bg-white px-2 py-1 rounded border border-red-300">
                        {asin}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Keywords</CardTitle>
              <CardDescription>Manage keywords for this product group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                />
                <Button onClick={handleAddKeyword}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {formData.niche_keywords.length} keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.niche_keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{keyword}</span>
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Keywords are automatically collected during processing. 
                  You can add custom keywords here to supplement the automated collection.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scores Tab */}
        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Scores</CardTitle>
              <CardDescription>
                Override calculated scores (leave blank to use auto-calculated values)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opportunity">Opportunity Score (0-100)</Label>
                  <Input
                    id="opportunity"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avg_opportunity_score}
                    onChange={(e) => {
                      setFormData({ ...formData, avg_opportunity_score: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder={niche.avg_opportunity_score?.toString() || 'Auto-calculated'}
                  />
                </div>

                <div>
                  <Label htmlFor="competition">Competition Score (0-100)</Label>
                  <Input
                    id="competition"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avg_competition_score}
                    onChange={(e) => {
                      setFormData({ ...formData, avg_competition_score: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder={niche.avg_competition_score?.toString() || 'Auto-calculated'}
                  />
                </div>

                <div>
                  <Label htmlFor="demand">Demand Score (0-100)</Label>
                  <Input
                    id="demand"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avg_demand_score}
                    onChange={(e) => {
                      setFormData({ ...formData, avg_demand_score: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder={niche.avg_demand_score?.toString() || 'Auto-calculated'}
                  />
                </div>

                <div>
                  <Label htmlFor="feasibility">Feasibility Score (0-100)</Label>
                  <Input
                    id="feasibility"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avg_feasibility_score}
                    onChange={(e) => {
                      setFormData({ ...formData, avg_feasibility_score: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder={niche.avg_feasibility_score?.toString() || 'Auto-calculated'}
                  />
                </div>

                <div>
                  <Label htmlFor="timing">Timing Score (0-100)</Label>
                  <Input
                    id="timing"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.avg_timing_score}
                    onChange={(e) => {
                      setFormData({ ...formData, avg_timing_score: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder={niche.avg_timing_score?.toString() || 'Auto-calculated'}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> Manual score overrides will replace the auto-calculated values. 
                  These scores will be displayed to customers on product pages and in the Product of the Day feature.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}