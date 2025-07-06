'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RotateCcw } from 'lucide-react'

interface NicheAnalysisFormData {
  nicheName: string
  category: string
  opportunityScore: number
  competitionLevel: string
  marketSize: number
  nicheKeywords: string[]
  asins: string[]
  avgPrice: number
  totalMonthlyRevenue: number
  aiAnalysis?: {
    whyThisProduct?: string
    keyHighlights?: string[]
    demandAnalysis?: string
    competitionAnalysis?: string
    keywordAnalysis?: string
    listingOptimization?: {
      title?: string
      bulletPoints?: string[]
      description?: string
    }
  }
}

interface NicheAnalysisFormProps {
  initialData?: Partial<NicheAnalysisFormData>
  onSave: (data: NicheAnalysisFormData) => Promise<void>
  onReprocess?: () => Promise<void>
  isNew?: boolean
}

export function NicheAnalysisForm({ initialData, onSave, onReprocess, isNew = false }: NicheAnalysisFormProps) {
  const [formData, setFormData] = useState<NicheAnalysisFormData>({
    nicheName: initialData?.nicheName || '',
    category: initialData?.category || '',
    opportunityScore: initialData?.opportunityScore || 0,
    competitionLevel: initialData?.competitionLevel || 'Medium',
    marketSize: initialData?.marketSize || 0,
    nicheKeywords: initialData?.nicheKeywords || [],
    asins: initialData?.asins || [],
    avgPrice: initialData?.avgPrice || 0,
    totalMonthlyRevenue: initialData?.totalMonthlyRevenue || 0,
    aiAnalysis: initialData?.aiAnalysis || {}
  })

  const [isSaving, setIsSaving] = useState(false)

  const updateField = (field: keyof NicheAnalysisFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateAIAnalysisField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      aiAnalysis: {
        ...prev.aiAnalysis,
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Create New Niche Analysis' : 'Edit Niche Analysis'}
          </h1>
          {!isNew && formData.nicheName && (
            <p className="text-gray-600 mt-1">{formData.nicheName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && onReprocess && (
            <Button
              variant="outline"
              onClick={onReprocess}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reprocess
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="demand">Demand</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="listing">Listing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="niche-name">Niche Name</Label>
              <Input
                id="niche-name"
                value={formData.nicheName}
                onChange={(e) => updateField('nicheName', e.target.value)}
                placeholder="e.g., Eco-Friendly Kitchen Products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g., Home & Kitchen"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="opportunity-score">Opportunity Score</Label>
              <Input
                id="opportunity-score"
                type="number"
                min="0"
                max="100"
                value={formData.opportunityScore}
                onChange={(e) => updateField('opportunityScore', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competition-level">Competition Level</Label>
              <select
                id="competition-level"
                value={formData.competitionLevel}
                onChange={(e) => updateField('competitionLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="market-size">Market Size ($)</Label>
              <Input
                id="market-size"
                type="number"
                value={formData.marketSize}
                onChange={(e) => updateField('marketSize', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Niche Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.nicheKeywords.join(', ')}
              onChange={(e) => updateField('nicheKeywords', e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0))}
              className="font-mono"
              placeholder="sustainable, eco-friendly, reusable, kitchen"
            />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="asins">Amazon ASINs (comma-separated)</Label>
            <Textarea
              id="asins"
              value={formData.asins.join(', ')}
              onChange={(e) => updateField('asins', e.target.value.split(',').map(a => a.trim()).filter(a => a.length > 0))}
              className="font-mono min-h-[100px]"
              placeholder="B08MVBRNKV, B07SHBQY7Z, B07KC5DWCC"
            />
            <p className="text-sm text-gray-500">
              Current: {formData.asins.length} products
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="avg-price">Average Price ($)</Label>
              <Input
                id="avg-price"
                type="number"
                step="0.01"
                value={formData.avgPrice}
                onChange={(e) => updateField('avgPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-revenue">Total Monthly Revenue ($)</Label>
              <Input
                id="total-revenue"
                type="number"
                value={formData.totalMonthlyRevenue}
                onChange={(e) => updateField('totalMonthlyRevenue', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="why-product">Why This Product/Niche?</Label>
              <Textarea
                id="why-product"
                value={formData.aiAnalysis?.whyThisProduct || ''}
                onChange={(e) => updateAIAnalysisField('whyThisProduct', e.target.value)}
                className="min-h-[120px]"
                placeholder="Explain why this niche represents a good opportunity..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-highlights">Key Highlights (one per line)</Label>
              <Textarea
                id="key-highlights"
                value={formData.aiAnalysis?.keyHighlights?.join('\n') || ''}
                onChange={(e) => updateAIAnalysisField('keyHighlights', e.target.value.split('\n').filter(h => h.trim().length > 0))}
                className="min-h-[120px]"
                placeholder="• Growing market trend&#10;• High customer satisfaction&#10;• Multiple use cases"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="demand" className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="demand-analysis">Demand Analysis</Label>
            <Textarea
              id="demand-analysis"
              value={formData.aiAnalysis?.demandAnalysis || ''}
              onChange={(e) => updateAIAnalysisField('demandAnalysis', e.target.value)}
              className="min-h-[150px]"
              placeholder="Analyze the demand trends, search volume, seasonality, and market drivers..."
            />
          </div>
        </TabsContent>

        <TabsContent value="competition" className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="competition-analysis">Competition Analysis</Label>
            <Textarea
              id="competition-analysis"
              value={formData.aiAnalysis?.competitionAnalysis || ''}
              onChange={(e) => updateAIAnalysisField('competitionAnalysis', e.target.value)}
              className="min-h-[150px]"
              placeholder="Analyze the competitive landscape, key players, market share, and differentiation opportunities..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyword-analysis">Keyword Analysis</Label>
            <Textarea
              id="keyword-analysis"
              value={formData.aiAnalysis?.keywordAnalysis || ''}
              onChange={(e) => updateAIAnalysisField('keywordAnalysis', e.target.value)}
              className="min-h-[150px]"
              placeholder="Analyze primary keywords, search volumes, competition levels, and opportunities..."
            />
          </div>
        </TabsContent>

        <TabsContent value="listing" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listing-title">Optimized Product Title</Label>
              <Textarea
                id="listing-title"
                value={formData.aiAnalysis?.listingOptimization?.title || ''}
                onChange={(e) => updateAIAnalysisField('listingOptimization', { ...formData.aiAnalysis?.listingOptimization, title: e.target.value })}
                className="min-h-[80px]"
                placeholder="Optimized product title with primary keywords..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bullet-points">Bullet Points (one per line)</Label>
              <Textarea
                id="bullet-points"
                value={formData.aiAnalysis?.listingOptimization?.bulletPoints?.join('\n') || ''}
                onChange={(e) => updateAIAnalysisField('listingOptimization', { 
                  ...formData.aiAnalysis?.listingOptimization, 
                  bulletPoints: e.target.value.split('\n').filter(b => b.trim().length > 0) 
                })}
                className="min-h-[150px]"
                placeholder="• FEATURE 1: Benefit and description&#10;• FEATURE 2: Benefit and description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                value={formData.aiAnalysis?.listingOptimization?.description || ''}
                onChange={(e) => updateAIAnalysisField('listingOptimization', { ...formData.aiAnalysis?.listingOptimization, description: e.target.value })}
                className="min-h-[120px]"
                placeholder="Detailed product description for Amazon listing..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}