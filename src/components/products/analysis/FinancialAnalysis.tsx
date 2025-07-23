'use client'

import React, { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  DollarSign,
  TrendingUp,
  Calculator,
  BarChart3,
  PieChart,
  Activity,
  Package,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Zap,
  Globe,
  ShoppingCart,
  Target,
  Layers,
  RotateCcw,
  Gauge,
  Eye,
  FileText,
  Shield,
  Wallet,
  Scale,
  Ruler,
  Download,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

interface FinancialAnalysisProps {
  data: any
}

// Calculate FBA Tier Helper Function
function calculateFBATier(dims: any) {
  const { length, width, height, weight } = dims
  
  // Sort dimensions to get longest side first
  const sortedDims = [length, width, height].sort((a, b) => b - a)
  const [l, w, h] = sortedDims

  // Check Small Standard
  if (l <= 15 && w <= 12 && h <= 0.75 && weight <= 0.75) {
    return { name: 'Small Standard', fee: 3.22 }
  }

  // Check Large Standard tiers
  if (l <= 18 && w <= 14 && h <= 8 && weight <= 20) {
    return { name: 'Large Standard 1', fee: 4.76 }
  }

  if (l <= 60 && w <= 30 && h <= 30 && weight <= 50) {
    return { name: 'Large Standard 2', fee: 5.89 }
  }

  if (l <= 60 && w <= 30 && h <= 30 && weight <= 70) {
    return { name: 'Large Standard 3', fee: 8.73 }
  }

  // Default to Large Bulky
  return { name: 'Large Bulky', fee: 19.05 }
}

export default function FinancialAnalysis({ data }: FinancialAnalysisProps) {
  const [activeTab, setActiveTab] = useState('profitability')
  const financialData = data.financialData
  
  // Packaging Optimizer state
  const [calcDimensions, setCalcDimensions] = useState({
    length: 10,
    width: 8,
    height: 6,
    weight: 1
  })

  // Enhanced Profitability state - get averages from database
  const averageSellingPrice = data.competitors?.length > 0 
    ? data.competitors.reduce((sum: number, comp: any) => sum + (comp.price || 0), 0) / data.competitors.length
    : financialData?.unitEconomics?.sellingPrice || 25.99

  const averageFbaFees = data.competitors?.length > 0
    ? data.competitors.reduce((sum: number, comp: any) => sum + (comp.fee || 0), 0) / data.competitors.length
    : data.productDetails?.fbaFee || 5.89

  const [profitVariables, setProfitVariables] = useState({
    sellingPrice: averageSellingPrice,
    cogsPercent: 30, // Default 30% as requested
    fbaFees: averageFbaFees,
    avgCpc: 1.25, // Will be updated from keywords if available
    ctr: 2.5, // Click through rate %
    cvr: 15, // Conversion rate %
    organicPercent: 70 // % of traffic that's organic
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value}%`
  }

  // Profitability calculations
  const grossProfit = profitVariables.sellingPrice - 
    (profitVariables.sellingPrice * (profitVariables.cogsPercent / 100)) - 
    profitVariables.fbaFees - 
    (profitVariables.sellingPrice * 0.15) // Amazon referral fee

  const grossMargin = (grossProfit / profitVariables.sellingPrice) * 100

  // ACOS calculations (based on AdsCrafted reference)
  const acosBreakeven = (grossProfit / profitVariables.sellingPrice) * 100
  const projectedAcos = (profitVariables.avgCpc / (profitVariables.ctr / 100) / (profitVariables.cvr / 100)) / profitVariables.sellingPrice * 100

  // Blended profitability (organic + PPC mix)
  const organicProfitPerUnit = grossProfit
  const ppcProfitPerUnit = grossProfit - (profitVariables.sellingPrice * (projectedAcos / 100))
  const blendedProfitPerUnit = (organicProfitPerUnit * (profitVariables.organicPercent / 100)) + 
    (ppcProfitPerUnit * ((100 - profitVariables.organicPercent) / 100))
  const blendedMargin = (blendedProfitPerUnit / profitVariables.sellingPrice) * 100

  // Scenario analysis
  const scenarioAnalysis = {
    worst: {
      acos: Math.min(projectedAcos * 1.5, 100), // 50% worse ACOS
      organicPercent: Math.max(profitVariables.organicPercent - 30, 0), // 30% less organic
      profitPerUnit: 0,
      margin: 0
    },
    conservative: {
      acos: Math.min(projectedAcos * 1.2, 100), // 20% worse ACOS
      organicPercent: Math.max(profitVariables.organicPercent - 15, 0), // 15% less organic
      profitPerUnit: 0,
      margin: 0
    },
    moderate: {
      acos: projectedAcos, // Current projected ACOS
      organicPercent: profitVariables.organicPercent, // Current organic %
      profitPerUnit: 0,
      margin: 0
    }
  }

  // Calculate scenario profits
  Object.keys(scenarioAnalysis).forEach(scenario => {
    const s = scenarioAnalysis[scenario as keyof typeof scenarioAnalysis]
    const scenarioOrganicProfit = organicProfitPerUnit * (s.organicPercent / 100)
    const scenarioPpcProfit = (grossProfit - (profitVariables.sellingPrice * (s.acos / 100))) * ((100 - s.organicPercent) / 100)
    s.profitPerUnit = scenarioOrganicProfit + scenarioPpcProfit
    s.margin = (s.profitPerUnit / profitVariables.sellingPrice) * 100
  })
  
  // Get packaging data from the product data - DATABASE ONLY
  const currentDimensions = data.productDetails?.dimensions || {}
  const currentFee = data.productDetails?.fbaFee || 0
  
  // Calculate optimized dimensions (10% reduction as example)
  const optimizedDimensions = {
    length: currentDimensions.length ? currentDimensions.length * 0.9 : 0,
    width: currentDimensions.width ? currentDimensions.width * 0.9 : 0,
    height: currentDimensions.height ? currentDimensions.height * 0.85 : 0,
    weight: currentDimensions.weight ? currentDimensions.weight * 0.95 : 0
  }
  
  const optimizedTier = calculateFBATier(optimizedDimensions)
  const optimizedFee = optimizedTier.fee
  const potentialSavings = currentFee > optimizedFee ? currentFee - optimizedFee : 0
  
  const packagingData = {
    currentDimensions,
    currentTier: data.productDetails?.fbaTier || '',
    currentFee,
    optimizedDimensions,
    optimizedTier: optimizedTier.name,
    optimizedFee,
    potentialSavings,
    annualSavings: potentialSavings * 12000, // Assuming 1000 units/month
    optimizationScore: potentialSavings > 0 ? Math.round((potentialSavings / currentFee) * 100) : 0,
    recommendations: potentialSavings > 0 ? [
      `Reduce packaging dimensions by optimizing box size`,
      `Current: ${currentDimensions.length}"L × ${currentDimensions.width}"W × ${currentDimensions.height}"H`,
      `Target: ${optimizedDimensions.length.toFixed(1)}"L × ${optimizedDimensions.width.toFixed(1)}"W × ${optimizedDimensions.height.toFixed(1)}"H`,
      `Potential savings of $${potentialSavings.toFixed(2)} per unit`
    ] : ['Product is already optimally packaged'],
    competitorAnalysis: data.competitors || []
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'profitability', label: 'Profitability', icon: DollarSign },
          { id: 'packaging', label: 'Package Optimiser', icon: Package },
          { id: 'forecast', label: 'Financial Forecast', icon: TrendingUp },
          { id: 'cashflow', label: 'Cash Flow Projections', icon: BarChart3 },
          { id: 'investment', label: 'Investment & ROI', icon: Wallet }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profitability Tab */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          {/* Profitability Analysis with Sliders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Dynamic Profitability Analysis</span>
              </CardTitle>
              <CardDescription>
                Adjust variables to see real-time profit calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Selling Price */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Average Selling Price</Label>
                    <span className="text-lg font-semibold">{formatCurrency(profitVariables.sellingPrice)}</span>
                  </div>
                  <Slider
                    value={[profitVariables.sellingPrice]}
                    onValueChange={(value) => setProfitVariables({...profitVariables, sellingPrice: value[0]})}
                    min={10}
                    max={200}
                    step={0.01}
                    className="mb-1"
                  />
                  <p className="text-xs text-gray-500">Based on average from all competitors</p>
                </div>

                {/* COGS */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Cost of Goods Sold (COGS)</Label>
                    <span className="text-lg font-semibold text-red-600">
                      {formatCurrency(profitVariables.sellingPrice * (profitVariables.cogsPercent / 100))} 
                      <span className="text-sm ml-1">({profitVariables.cogsPercent}%)</span>
                    </span>
                  </div>
                  <Slider
                    value={[profitVariables.cogsPercent]}
                    onValueChange={(value) => setProfitVariables({...profitVariables, cogsPercent: value[0]})}
                    min={10}
                    max={60}
                    step={0.1}
                    className="mb-1"
                  />
                  <p className="text-xs text-gray-500">Default 30% of selling price</p>
                </div>

                {/* FBA Fees */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>FBA Fees</Label>
                    <span className="text-lg font-semibold text-orange-600">{formatCurrency(profitVariables.fbaFees)}</span>
                  </div>
                  <Slider
                    value={[profitVariables.fbaFees]}
                    onValueChange={(value) => setProfitVariables({...profitVariables, fbaFees: value[0]})}
                    min={2}
                    max={20}
                    step={0.01}
                    className="mb-1"
                  />
                  <p className="text-xs text-gray-500">Average from product dimensions</p>
                </div>

                {/* PPC Cost */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Average CPC (Pay Per Click)</Label>
                    <span className="text-lg font-semibold text-purple-600">{formatCurrency(profitVariables.avgCpc)}</span>
                  </div>
                  <Slider
                    value={[profitVariables.avgCpc]}
                    onValueChange={(value) => setProfitVariables({...profitVariables, avgCpc: value[0]})}
                    min={0.5}
                    max={5}
                    step={0.01}
                    className="mb-1"
                  />
                  <p className="text-xs text-gray-500">Based on keyword competition</p>
                </div>

                {/* Referral Fee */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Amazon Referral Fee</Label>
                    <span className="text-lg font-semibold text-yellow-600">
                      {formatCurrency(profitVariables.sellingPrice * 0.15)} 
                      <span className="text-sm ml-1">(15%)</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Fixed 15% for most categories</p>
                </div>

                {/* Profit Calculation */}
                <div className="border-t pt-4 mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Per Unit Economics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Revenue</span>
                          <span className="font-medium">{formatCurrency(profitVariables.sellingPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">- COGS</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(profitVariables.sellingPrice * (profitVariables.cogsPercent / 100))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">- FBA Fees</span>
                          <span className="font-medium text-orange-600">{formatCurrency(profitVariables.fbaFees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">- Referral Fee</span>
                          <span className="font-medium text-yellow-600">
                            {formatCurrency(profitVariables.sellingPrice * 0.15)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-sm font-semibold">Gross Profit</span>
                          <span className="font-bold text-green-600">{formatCurrency(grossProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold">Gross Margin</span>
                          <span className="font-bold text-green-600">{formatPercent(grossMargin)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">ACOS Impact</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-center mb-2">
                          {formatPercent(acosBreakeven)}
                        </div>
                        <p className="text-sm text-gray-600 text-center">ACOS Breakeven Point</p>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          Above this ACOS, you lose money on PPC sales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ACOS Forecast & Traffic Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>ACOS Forecast & Traffic Analysis</span>
              </CardTitle>
              <CardDescription>
                Predict profitability based on PPC performance and organic traffic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* PPC Performance Inputs */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">PPC Performance Metrics</h4>
                    
                    {/* CTR */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Click-Through Rate (CTR)</Label>
                        <span className="font-medium">{profitVariables.ctr}%</span>
                      </div>
                      <Slider
                        value={[profitVariables.ctr]}
                        onValueChange={(value) => setProfitVariables({...profitVariables, ctr: value[0]})}
                        min={0.5}
                        max={10}
                        step={0.1}
                      />
                    </div>

                    {/* CVR */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Conversion Rate (CVR)</Label>
                        <span className="font-medium">{profitVariables.cvr}%</span>
                      </div>
                      <Slider
                        value={[profitVariables.cvr]}
                        onValueChange={(value) => setProfitVariables({...profitVariables, cvr: value[0]})}
                        min={1}
                        max={30}
                        step={0.1}
                      />
                    </div>

                    {/* Calculated ACOS */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatPercent(projectedAcos)}
                      </div>
                      <p className="text-sm text-gray-700">Projected ACOS</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {projectedAcos < acosBreakeven ? 
                          `✅ Profitable (${formatPercent(acosBreakeven - projectedAcos)} margin)` : 
                          `❌ Unprofitable (${formatPercent(projectedAcos - acosBreakeven)} over breakeven)`
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Traffic Mix</h4>
                    
                    {/* Organic vs PPC Split */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Organic Traffic %</Label>
                        <span className="font-medium">{profitVariables.organicPercent}%</span>
                      </div>
                      <Slider
                        value={[profitVariables.organicPercent]}
                        onValueChange={(value) => setProfitVariables({...profitVariables, organicPercent: value[0]})}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>PPC: {100 - profitVariables.organicPercent}%</span>
                        <span>Organic: {profitVariables.organicPercent}%</span>
                      </div>
                    </div>

                    {/* Blended Profitability */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatCurrency(blendedProfitPerUnit)}
                      </div>
                      <p className="text-sm text-gray-700">Blended Profit per Unit</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Margin: {formatPercent(blendedMargin)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scenario Analysis */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Profitability Scenarios</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <h5 className="font-medium text-red-900 mb-3">Worst Case</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">ACOS</span>
                          <span className="font-medium">{formatPercent(scenarioAnalysis.worst.acos)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Organic %</span>
                          <span className="font-medium">{scenarioAnalysis.worst.organicPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Profit/Unit</span>
                          <span className="font-bold text-red-600">{formatCurrency(scenarioAnalysis.worst.profitPerUnit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Margin</span>
                          <span className="font-bold text-red-600">{formatPercent(scenarioAnalysis.worst.margin)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                      <h5 className="font-medium text-yellow-900 mb-3">Conservative</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">ACOS</span>
                          <span className="font-medium">{formatPercent(scenarioAnalysis.conservative.acos)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Organic %</span>
                          <span className="font-medium">{scenarioAnalysis.conservative.organicPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Profit/Unit</span>
                          <span className="font-bold text-yellow-600">{formatCurrency(scenarioAnalysis.conservative.profitPerUnit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Margin</span>
                          <span className="font-bold text-yellow-600">{formatPercent(scenarioAnalysis.conservative.margin)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <h5 className="font-medium text-green-900 mb-3">Moderate</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">ACOS</span>
                          <span className="font-medium">{formatPercent(scenarioAnalysis.moderate.acos)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Organic %</span>
                          <span className="font-medium">{scenarioAnalysis.moderate.organicPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Profit/Unit</span>
                          <span className="font-bold text-green-600">{formatCurrency(scenarioAnalysis.moderate.profitPerUnit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Margin</span>
                          <span className="font-bold text-green-600">{formatPercent(scenarioAnalysis.moderate.margin)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Revenue & Profit Projections Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>12-Month Financial Projections</span>
              </CardTitle>
              <CardDescription>
                Conservative, realistic, and optimistic scenarios based on market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Bar Chart */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Monthly Revenue Scenarios</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        {
                          scenario: 'Conservative',
                          revenue: financialData.monthlyProjections?.conservative?.revenue || 0,
                          profit: financialData.monthlyProjections?.conservative?.profit || 0,
                          units: financialData.monthlyProjections?.conservative?.units || 0
                        },
                        {
                          scenario: 'Realistic',
                          revenue: financialData.monthlyProjections?.realistic?.revenue || 0,
                          profit: financialData.monthlyProjections?.realistic?.profit || 0,
                          units: financialData.monthlyProjections?.realistic?.units || 0
                        },
                        {
                          scenario: 'Optimistic',
                          revenue: financialData.monthlyProjections?.optimistic?.revenue || 0,
                          profit: financialData.monthlyProjections?.optimistic?.profit || 0,
                          units: financialData.monthlyProjections?.optimistic?.units || 0
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="scenario" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any, name: string) => {
                            if (name === 'revenue' || name === 'profit') {
                              return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Profit']
                            }
                            return [value, name === 'units' ? 'Units' : name]
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                        <Bar dataKey="profit" fill="#10b981" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scenario Comparison Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Conservative</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <span className="font-medium">{formatCurrency(financialData.monthlyProjections.conservative.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Profit</span>
                        <span className="font-medium text-green-600">{formatCurrency(financialData.monthlyProjections.conservative.profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Units/Month</span>
                        <span className="font-medium">{financialData.monthlyProjections.conservative.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profit Margin</span>
                        <span className="font-medium">{((financialData.monthlyProjections.conservative.profit / financialData.monthlyProjections.conservative.revenue) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-3">Realistic</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <span className="font-medium">{formatCurrency(financialData.monthlyProjections.realistic.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Profit</span>
                        <span className="font-medium text-green-600">{formatCurrency(financialData.monthlyProjections.realistic.profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Units/Month</span>
                        <span className="font-medium">{financialData.monthlyProjections.realistic.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profit Margin</span>
                        <span className="font-medium">{((financialData.monthlyProjections.realistic.profit / financialData.monthlyProjections.realistic.revenue) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <h4 className="font-semibold text-green-900 mb-3">Optimistic</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <span className="font-medium">{formatCurrency(financialData.monthlyProjections.optimistic.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Profit</span>
                        <span className="font-medium text-green-600">{formatCurrency(financialData.monthlyProjections.optimistic.profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Units/Month</span>
                        <span className="font-medium">{financialData.monthlyProjections.optimistic.units}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Profit Margin</span>
                        <span className="font-medium">{((financialData.monthlyProjections.optimistic.profit / financialData.monthlyProjections.optimistic.revenue) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Annual Projections */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Annual Revenue Projections</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        {
                          scenario: 'Conservative',
                          annual: (financialData.monthlyProjections?.conservative?.revenue || 0) * 12
                        },
                        {
                          scenario: 'Realistic',
                          annual: (financialData.monthlyProjections?.realistic?.revenue || 0) * 12
                        },
                        {
                          scenario: 'Optimistic',
                          annual: (financialData.monthlyProjections?.optimistic?.revenue || 0) * 12
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="scenario" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Annual Revenue']}
                        />
                        <Bar dataKey="annual" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Cash Flow Projections Tab */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          {/* Monthly Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Monthly Cash Flow Analysis</span>
              </CardTitle>
              <CardDescription>
                Revenue vs costs breakdown across scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cash Flow Bar Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      {
                        scenario: 'Conservative',
                        revenue: financialData.monthlyProjections?.conservative?.revenue || 0,
                        costs: (financialData.monthlyProjections?.conservative?.revenue || 0) - (financialData.monthlyProjections?.conservative?.profit || 0),
                        profit: financialData.monthlyProjections?.conservative?.profit || 0
                      },
                      {
                        scenario: 'Realistic',
                        revenue: financialData.monthlyProjections?.realistic?.revenue || 0,
                        costs: (financialData.monthlyProjections?.realistic?.revenue || 0) - (financialData.monthlyProjections?.realistic?.profit || 0),
                        profit: financialData.monthlyProjections?.realistic?.profit || 0
                      },
                      {
                        scenario: 'Optimistic',
                        revenue: financialData.monthlyProjections?.optimistic?.revenue || 0,
                        costs: (financialData.monthlyProjections?.optimistic?.revenue || 0) - (financialData.monthlyProjections?.optimistic?.profit || 0),
                        profit: financialData.monthlyProjections?.optimistic?.profit || 0
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="scenario" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          return [formatCurrency(value), name === 'revenue' ? 'Revenue' : name === 'costs' ? 'Total Costs' : 'Net Profit']
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                      <Bar dataKey="costs" fill="#ef4444" name="Total Costs" />
                      <Bar dataKey="profit" fill="#10b981" name="Net Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Cash Flow Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Scenario</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Monthly Revenue</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Monthly Costs</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Monthly Profit</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Annual Profit</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">ROI %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Conservative', 'Realistic', 'Optimistic'].map((scenario, index) => {
                        const projectionKey = scenario.toLowerCase() as 'conservative' | 'realistic' | 'optimistic'
                        const projection = financialData.monthlyProjections?.[projectionKey]
                        if (!projection) return null
                        
                        const revenue = projection.revenue || 0
                        const profit = projection.profit || 0
                        const costs = revenue - profit
                        const annualProfit = profit * 12
                        const roi = ((annualProfit / (financialData.investmentRequired?.total || 10000)) * 100)
                        
                        return (
                          <tr key={scenario} className={`border-b ${scenario === 'Realistic' ? 'bg-blue-50' : ''}`}>
                            <td className="py-2 px-3 text-sm font-medium">{scenario}</td>
                            <td className="py-2 px-3 text-sm text-right">{formatCurrency(revenue)}</td>
                            <td className="py-2 px-3 text-sm text-right text-red-600">{formatCurrency(costs)}</td>
                            <td className="py-2 px-3 text-sm text-right font-medium text-green-600">{formatCurrency(profit)}</td>
                            <td className="py-2 px-3 text-sm text-right font-bold">{formatCurrency(annualProfit)}</td>
                            <td className="py-2 px-3 text-sm text-right font-medium text-blue-600">{roi.toFixed(1)}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 12-Month Cumulative Cash Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>12-Month Cumulative Cash Flow</span>
              </CardTitle>
              <CardDescription>
                Track cumulative profits over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    return months.map((month, index) => ({
                      month,
                      conservative: (financialData.monthlyProjections?.conservative?.profit || 0) * (index + 1),
                      realistic: (financialData.monthlyProjections?.realistic?.profit || 0) * (index + 1),
                      optimistic: (financialData.monthlyProjections?.optimistic?.profit || 0) * (index + 1)
                    }))
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        const label = name === 'conservative' ? 'Conservative' : 
                                     name === 'realistic' ? 'Realistic' : 'Optimistic'
                        return [formatCurrency(value), label]
                      }}
                    />
                    <Legend />
                    <Bar dataKey="conservative" fill="#6b7280" name="Conservative" />
                    <Bar dataKey="realistic" fill="#3b82f6" name="Realistic" />
                    <Bar dataKey="optimistic" fill="#10b981" name="Optimistic" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Break-Even Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span>Break-Even Analysis</span>
              </CardTitle>
              <CardDescription>
                Time to recover initial investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {['conservative', 'realistic', 'optimistic'].map((scenario) => {
                  const projectionKey = scenario as 'conservative' | 'realistic' | 'optimistic'
                  const monthlyProfit = financialData.monthlyProjections?.[projectionKey]?.profit || 0
                  const totalInvestment = financialData.investmentRequired?.total || 10000
                  const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : 0
                  
                  return (
                    <div key={scenario} className="p-4 border rounded-lg text-center">
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">{scenario}</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {breakEvenMonths}
                      </div>
                      <p className="text-sm text-gray-600">Months to Break Even</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(monthlyProfit)}/month profit
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investment & ROI Tab */}
      {activeTab === 'investment' && (
        <div className="space-y-6">
          {/* Investment Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-purple-600" />
                <span>Investment Requirements</span>
              </CardTitle>
              <CardDescription>
                Initial capital needed to launch and scale this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Investment Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Initial Inventory</span>
                      <span className="font-semibold">{formatCurrency(financialData.investmentRequired.inventory)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Launch Marketing</span>
                      <span className="font-semibold">{formatCurrency(financialData.investmentRequired.marketing)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Photography & Design</span>
                      <span className="font-semibold">{formatCurrency(financialData.investmentRequired.design)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Working Capital</span>
                      <span className="font-semibold">{formatCurrency(financialData.investmentRequired.workingCapital)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-500">
                      <span className="font-medium text-gray-900">Total Investment</span>
                      <span className="font-bold text-lg">{formatCurrency(financialData.investmentRequired.total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">ROI Analysis</h4>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {formatPercent(financialData.roi.firstYearROI)}
                      </div>
                      <div className="text-sm text-gray-700">First Year ROI</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {financialData.roi.breakEvenMonths}
                        </div>
                        <div className="text-xs text-gray-600">Months to Break Even</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPercent(financialData.roi.threeYearROI)}
                        </div>
                        <div className="text-xs text-gray-600">3-Year ROI</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Payback Period</span>
                        <span className="font-semibold">{financialData.roi.paybackPeriod} months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment vs Return Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span>Investment vs Return Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Visual representation of cumulative investment vs cumulative returns over 24 months
                </div>
                
                {/* Simplified chart visualization */}
                <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                  <div className="absolute bottom-4 left-4 right-4 top-4 border-l-2 border-b-2 border-gray-300">
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                      Months
                    </div>
                    <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600">
                      Returns ($)
                    </div>
                  </div>
                  
                  <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between h-48">
                    {[3, 6, 9, 12, 18, 24].map((month, index) => (
                      <div key={month} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full max-w-[40px] bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                          style={{ height: `${(index + 1) * 30}px` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-2">{month}mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Packaging Optimizer Tab */}
      {activeTab === 'packaging' && (
        <div className="space-y-6">
          {/* Current vs Optimized Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <span>Current Packaging</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {packagingData.currentTier}
                    </div>
                    <div className="text-sm text-gray-600">FBA Size Tier</div>
                    <div className="text-2xl font-bold text-gray-900 mt-3">
                      {formatCurrency(packagingData.currentFee)}
                    </div>
                    <div className="text-sm text-gray-600">Per Unit FBA Fee</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Current Dimensions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600">Length</span>
                        <p className="font-medium">{packagingData.currentDimensions.length}"</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600">Width</span>
                        <p className="font-medium">{packagingData.currentDimensions.width}"</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600">Height</span>
                        <p className="font-medium">{packagingData.currentDimensions.height}"</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-600">Weight</span>
                        <p className="font-medium">{packagingData.currentDimensions.weight} lbs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <span>Optimized Packaging</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {packagingData.optimizedTier}
                    </div>
                    <div className="text-sm text-gray-600">Optimized FBA Tier</div>
                    <div className="text-2xl font-bold text-gray-900 mt-3">
                      {formatCurrency(packagingData.optimizedFee)}
                    </div>
                    <div className="text-sm text-gray-600">Per Unit FBA Fee</div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Optimized Dimensions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-green-50 rounded">
                        <span className="text-xs text-gray-600">Length</span>
                        <p className="font-medium text-green-700">{packagingData.optimizedDimensions.length}"</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="text-xs text-gray-600">Width</span>
                        <p className="font-medium text-green-700">{packagingData.optimizedDimensions.width}"</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="text-xs text-gray-600">Height</span>
                        <p className="font-medium text-green-700">{packagingData.optimizedDimensions.height}"</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <span className="text-xs text-gray-600">Weight</span>
                        <p className="font-medium text-green-700">{packagingData.optimizedDimensions.weight} lbs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Potential Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(packagingData.potentialSavings)}
                  </div>
                  <div className="text-sm text-gray-600">Per Unit Savings</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(packagingData.potentialSavings * 1000)}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Savings (1k units)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(packagingData.annualSavings)}
                  </div>
                  <div className="text-sm text-gray-600">Annual Savings</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {packagingData.optimizationScore}%
                  </div>
                  <div className="text-sm text-gray-600">Optimization Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimization Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Optimization Recommendations</span>
              </CardTitle>
              <CardDescription>
                Actionable steps to achieve the optimized packaging dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {packagingData.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Competitor Packaging Analysis</span>
              </CardTitle>
              <CardDescription>
                Detailed comparison of competitor packaging dimensions and FBA fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packagingData.competitorAnalysis.length > 0 ? packagingData.competitorAnalysis.map((competitor: any, idx: number) => {
                  console.log('Competitor image:', competitor.image || competitor.imageUrl)
                  return (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 md:grid-cols-[120px,1fr,auto] gap-4 items-center">
                      {/* Product Image */}
                      <div className="flex justify-center">
                        {competitor.imageUrl || competitor.image ? (
                          <img 
                            src={competitor.imageUrl || competitor.image} 
                            alt={competitor.name || competitor.title}
                            className="w-24 h-24 object-contain bg-gray-50 rounded-lg p-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="space-y-2 text-center md:text-left">
                        <div>
                          <h4 className="font-semibold text-gray-900">{competitor.name || competitor.title}</h4>
                          <p className="text-xs text-gray-500">ASIN: {competitor.asin}</p>
                        </div>
                        
                        {/* Dimensions Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="bg-gray-50 rounded p-2 text-center">
                            <p className="text-xs text-gray-600">Length</p>
                            <p className="font-medium text-sm">{competitor.dimensions?.length || 'N/A'}"</p>
                          </div>
                          <div className="bg-gray-50 rounded p-2 text-center">
                            <p className="text-xs text-gray-600">Width</p>
                            <p className="font-medium text-sm">{competitor.dimensions?.width || 'N/A'}"</p>
                          </div>
                          <div className="bg-gray-50 rounded p-2 text-center">
                            <p className="text-xs text-gray-600">Height</p>
                            <p className="font-medium text-sm">{competitor.dimensions?.height || 'N/A'}"</p>
                          </div>
                          <div className="bg-gray-50 rounded p-2 text-center">
                            <p className="text-xs text-gray-600">Weight</p>
                            <p className="font-medium text-sm">{competitor.dimensions?.weight || 'N/A'} lbs</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* FBA Info */}
                      <div className="text-center space-y-1">
                        <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          competitor.tier === 'Small Standard' ? 'bg-green-100 text-green-700' :
                          competitor.tier === 'Large Standard 1' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {competitor.tier || 'Unknown Tier'}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">${(competitor.fee || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-600">per unit</p>
                        </div>
                        {competitor.fee < packagingData.currentFee && (
                          <div className="text-xs text-green-600 font-medium">
                            ↓ ${(packagingData.currentFee - competitor.fee).toFixed(2)} less
                          </div>
                        )}
                        {competitor.fee > packagingData.currentFee && (
                          <div className="text-xs text-red-600 font-medium">
                            ↑ ${(competitor.fee - packagingData.currentFee).toFixed(2)} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                }) : (
                  <div className="text-center p-8 text-gray-500">
                    No competitor data available
                  </div>
                )}
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {packagingData.competitorAnalysis.filter((c: any) => c.fee < packagingData.currentFee).length}
                  </div>
                  <p className="text-sm text-gray-700">Competitors with lower fees</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      Math.min(...packagingData.competitorAnalysis.map((c: any) => c.fee))
                    )}
                  </div>
                  <p className="text-sm text-gray-700">Lowest competitor fee</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      packagingData.competitorAnalysis.reduce((sum: number, c: any) => sum + c.fee, 0) / 
                      packagingData.competitorAnalysis.length
                    )}
                  </div>
                  <p className="text-sm text-gray-700">Average competitor fee</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Key Insight:</strong> Your current packaging costs {formatCurrency(packagingData.currentFee)} per unit. 
                  {packagingData.competitorAnalysis.filter((c: any) => c.fee < packagingData.currentFee).length > 0 
                    ? ` ${packagingData.competitorAnalysis.filter((c: any) => c.fee < packagingData.currentFee).length} competitor${packagingData.competitorAnalysis.filter((c: any) => c.fee < packagingData.currentFee).length > 1 ? 's have' : ' has'} achieved lower FBA fees through optimized packaging.`
                    : ' You have one of the most competitive FBA fees in your category.'}
                  {packagingData.optimizedFee < packagingData.currentFee && 
                    ` By optimizing to ${packagingData.optimizedTier}, you could save ${formatCurrency(packagingData.potentialSavings)} per unit.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Dimension Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Dimension Impact Calculator</span>
              </CardTitle>
              <CardDescription>
                See how dimension changes affect your FBA fees in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="calc-length">Length: {calcDimensions.length}"</Label>
                      <Slider
                        id="calc-length"
                        min={1}
                        max={60}
                        step={0.1}
                        value={[calcDimensions.length]}
                        onValueChange={(value) => setCalcDimensions({...calcDimensions, length: value[0]})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calc-width">Width: {calcDimensions.width}"</Label>
                      <Slider
                        id="calc-width"
                        min={1}
                        max={30}
                        step={0.1}
                        value={[calcDimensions.width]}
                        onValueChange={(value) => setCalcDimensions({...calcDimensions, width: value[0]})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calc-height">Height: {calcDimensions.height}"</Label>
                      <Slider
                        id="calc-height"
                        min={0.1}
                        max={30}
                        step={0.1}
                        value={[calcDimensions.height]}
                        onValueChange={(value) => setCalcDimensions({...calcDimensions, height: value[0]})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="calc-weight">Weight: {calcDimensions.weight} lbs</Label>
                      <Slider
                        id="calc-weight"
                        min={0.1}
                        max={70}
                        step={0.1}
                        value={[calcDimensions.weight]}
                        onValueChange={(value) => setCalcDimensions({...calcDimensions, weight: value[0]})}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="p-6 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Current FBA Tier</h4>
                      <div className="text-2xl font-bold text-blue-700 mb-2">
                        {calculateFBATier(calcDimensions).name}
                      </div>
                      <div className="text-lg text-gray-600">
                        Fee: ${calculateFBATier(calcDimensions).fee.toFixed(2)} per unit
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="text-sm text-gray-600">Monthly cost (1,000 units)</div>
                        <div className="text-xl font-semibold text-gray-900">
                          ${(calculateFBATier(calcDimensions).fee * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-gray-700">
                      <p className="font-medium mb-2">💡 Pro Tip:</p>
                      <p>Small reductions in dimensions can lead to significant savings. Try adjusting the sliders to see if you can reach a lower FBA tier.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}