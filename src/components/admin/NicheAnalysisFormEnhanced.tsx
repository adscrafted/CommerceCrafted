'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Save, 
  RotateCcw, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Users,
  FileText
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

export function NicheAnalysisFormEnhanced({ 
  initialData, 
  onSave, 
  onReprocess, 
  isNew = false 
}: NicheAnalysisFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  
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

  const updateField = (field: keyof NicheAnalysisFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateAIAnalysisField = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      aiAnalysis: {
        ...prev.aiAnalysis,
        [field]: value
      }
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.nicheName.trim()) {
      setError('Niche name is required')
      return false
    }
    if (!formData.category.trim()) {
      setError('Category is required')
      return false
    }
    if (formData.asins.length === 0) {
      setError('At least one ASIN is required for analysis')
      return false
    }
    return true
  }

  const simulateProgress = () => {
    // Simulate progress stages
    const stages = [
      { progress: 10, message: 'Creating niche...' },
      { progress: 25, message: 'Adding products to niche...' },
      { progress: 40, message: 'Initializing AI analysis...' },
      { progress: 55, message: 'Analyzing market demand...' },
      { progress: 70, message: 'Evaluating competition...' },
      { progress: 85, message: 'Generating insights...' },
      { progress: 95, message: 'Finalizing analysis...' },
    ]

    let currentStage = 0
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress)
        setProgressMessage(stages[currentStage].message)
        currentStage++
      } else {
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }

  const handleSubmit = async () => {
    setError(null)
    
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    const cleanup = simulateProgress()

    startTransition(async () => {
      try {
        await onSave(formData)
        
        // Show success message
        toast.success('Niche created successfully!', {
          description: 'AI analysis has been initiated. You will be redirected to the niche detail page.',
        })
        
        // Note: The server action will handle the redirect
      } catch (error) {
        console.error('Error creating niche:', error)
        setError(error instanceof Error ? error.message : 'Failed to create niche')
        toast.error('Failed to create niche', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
        })
      } finally {
        cleanup()
        setIsProcessing(false)
        setProgress(0)
        setProgressMessage('')
      }
    })
  }

  const handleReprocess = async () => {
    if (!onReprocess) return
    
    setIsProcessing(true)
    const cleanup = simulateProgress()
    
    try {
      await onReprocess()
      toast.success('Reprocessing initiated', {
        description: 'The AI analysis will be updated shortly.',
      })
    } catch (error) {
      console.error('Error reprocessing:', error)
      toast.error('Failed to reprocess', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      cleanup()
      setIsProcessing(false)
      setProgress(0)
      setProgressMessage('')
    }
  }

  const isLoading = isPending || isProcessing

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
              onClick={handleReprocess}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reprocess
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isProcessing ? 'Processing...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNew ? 'Create & Analyze' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              {progressMessage || 'Processing...'}
            </span>
            <span className="text-sm text-blue-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-blue-600 mt-2">
            This may take a few minutes while our AI analyzes the market opportunity.
          </p>
        </div>
      )}

      {/* Success Message for New Niches */}
      {isNew && !error && !isProcessing && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">AI-Powered Analysis</AlertTitle>
          <AlertDescription className="text-blue-700">
            Once you create this niche, our AI will automatically analyze market demand, 
            competition, keywords, and generate optimized listing suggestions.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm">
            Products
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 mr-1 inline" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="demand" className="text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 mr-1 inline" />
            Demand
          </TabsTrigger>
          <TabsTrigger value="competition" className="text-xs sm:text-sm">
            <Users className="h-3 w-3 mr-1 inline" />
            Competition
          </TabsTrigger>
          <TabsTrigger value="listing" className="text-xs sm:text-sm">
            <FileText className="h-3 w-3 mr-1 inline" />
            Listing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="niche-name">Niche Name*</Label>
              <Input
                id="niche-name"
                value={formData.nicheName}
                onChange={(e) => updateField('nicheName', e.target.value)}
                placeholder="e.g., Eco-Friendly Kitchen Products"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g., Home & Kitchen"
                required
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
            <p className="text-sm text-gray-500">
              These keywords will help our AI better understand and analyze your niche
            </p>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6 mt-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Required for Analysis</AlertTitle>
            <AlertDescription className="text-amber-700">
              Add at least one Amazon ASIN to enable AI analysis. The more products you add, 
              the more comprehensive the analysis will be.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="asins">Amazon ASINs* (comma-separated)</Label>
            <Textarea
              id="asins"
              value={formData.asins.join(', ')}
              onChange={(e) => updateField('asins', e.target.value.split(',').map(a => a.trim()).filter(a => a.length > 0))}
              className="font-mono min-h-[100px]"
              placeholder="B08MVBRNKV, B07SHBQY7Z, B07KC5DWCC"
              required
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
          {isNew ? (
            <Alert className="border-blue-200 bg-blue-50">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">AI Analysis Coming Soon</AlertTitle>
              <AlertDescription className="text-blue-700">
                After you create this niche, our AI will analyze the market opportunity and 
                provide detailed insights about why this niche is worth pursuing.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="why-product">Why This Product/Niche?</Label>
                <Textarea
                  id="why-product"
                  value={formData.aiAnalysis?.whyThisProduct || ''}
                  onChange={(e) => updateAIAnalysisField('whyThisProduct', e.target.value)}
                  className="min-h-[120px]"
                  placeholder="AI analysis will appear here..."
                  disabled={isNew}
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
                  disabled={isNew}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="demand" className="space-y-6 mt-6">
          {isNew ? (
            <Alert className="border-green-200 bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Demand Analysis Pending</AlertTitle>
              <AlertDescription className="text-green-700">
                Our AI will analyze search trends, seasonality, and market demand patterns 
                to help you understand the growth potential of this niche.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="demand-analysis">Demand Analysis</Label>
              <Textarea
                id="demand-analysis"
                value={formData.aiAnalysis?.demandAnalysis || ''}
                onChange={(e) => updateAIAnalysisField('demandAnalysis', e.target.value)}
                className="min-h-[150px]"
                placeholder="AI demand analysis will appear here..."
                disabled={isNew}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="competition" className="space-y-6 mt-6">
          {isNew ? (
            <Alert className="border-orange-200 bg-orange-50">
              <Users className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900">Competition Analysis Pending</AlertTitle>
              <AlertDescription className="text-orange-700">
                Our AI will evaluate the competitive landscape, identify key players, and 
                find differentiation opportunities for your products.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="competition-analysis">Competition Analysis</Label>
                <Textarea
                  id="competition-analysis"
                  value={formData.aiAnalysis?.competitionAnalysis || ''}
                  onChange={(e) => updateAIAnalysisField('competitionAnalysis', e.target.value)}
                  className="min-h-[150px]"
                  placeholder="AI competition analysis will appear here..."
                  disabled={isNew}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyword-analysis">Keyword Analysis</Label>
                <Textarea
                  id="keyword-analysis"
                  value={formData.aiAnalysis?.keywordAnalysis || ''}
                  onChange={(e) => updateAIAnalysisField('keywordAnalysis', e.target.value)}
                  className="min-h-[150px]"
                  placeholder="AI keyword analysis will appear here..."
                  disabled={isNew}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="listing" className="space-y-6 mt-6">
          {isNew ? (
            <Alert className="border-purple-200 bg-purple-50">
              <FileText className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-900">Listing Optimization Pending</AlertTitle>
              <AlertDescription className="text-purple-700">
                Our AI will generate optimized product titles, bullet points, and descriptions 
                tailored for Amazon's algorithm and your target customers.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="listing-title">Optimized Product Title</Label>
                <Textarea
                  id="listing-title"
                  value={formData.aiAnalysis?.listingOptimization?.title || ''}
                  onChange={(e) => updateAIAnalysisField('listingOptimization', { ...formData.aiAnalysis?.listingOptimization, title: e.target.value })}
                  className="min-h-[80px]"
                  placeholder="AI-generated title will appear here..."
                  disabled={isNew}
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
                  disabled={isNew}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  value={formData.aiAnalysis?.listingOptimization?.description || ''}
                  onChange={(e) => updateAIAnalysisField('listingOptimization', { ...formData.aiAnalysis?.listingOptimization, description: e.target.value })}
                  className="min-h-[120px]"
                  placeholder="AI-generated description will appear here..."
                  disabled={isNew}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}