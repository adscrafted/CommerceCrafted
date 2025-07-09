'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Scale
} from 'lucide-react'

interface FinancialAnalysisProps {
  data: any
}

export default function FinancialAnalysis({ data }: FinancialAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const financialData = data.financialData

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value}%`
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'profitability', label: 'Profitability', icon: DollarSign },
          { id: 'projections', label: 'Projections', icon: TrendingUp },
          { id: 'investment', label: 'Investment & ROI', icon: Wallet },
          { id: 'risk', label: 'Risk Analysis', icon: Shield }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialData.unitEconomics.netProfit)}
                  </div>
                  <div className="text-sm text-gray-600">Profit per Unit</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPercent(financialData.unitEconomics.profitMargin)} margin
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(financialData.monthlyProjections?.realistic?.revenue || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Revenue (Realistic)</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {financialData.monthlyProjections?.realistic?.units || 0} units
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercent(financialData.roi.firstYearROI)}
                  </div>
                  <div className="text-sm text-gray-600">First Year ROI</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {financialData.roi.breakEvenMonths} mo break-even
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(financialData.investmentRequired.total)}
                  </div>
                  <div className="text-sm text-gray-600">Total Investment</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Initial capital
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Financial Health Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Financial Health Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="text-3xl font-bold text-green-600">87</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-8 border-green-500 opacity-20"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">Overall Score</div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Profitability</span>
                      <span className="text-sm font-medium">Excellent</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Cash Flow</span>
                      <span className="text-sm font-medium">Good</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">ROI Potential</span>
                      <span className="text-sm font-medium">Excellent</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <span className="text-sm font-medium">Low</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profitability Tab */}
      {activeTab === 'profitability' && (
        <div className="space-y-6">
          {/* Profitability Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Profitability Analysis</span>
              </CardTitle>
              <CardDescription>
                Comprehensive breakdown of revenue, costs, and profit margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue & Profit Chart */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Revenue & Profit Breakdown</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Selling Price</span>
                        <span className="text-lg font-semibold text-gray-900">{formatCurrency(financialData.unitEconomics.sellingPrice)}</span>
                      </div>
                      <Progress value={100} className="h-3 bg-blue-100" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Product Cost</span>
                        <span className="text-lg font-semibold text-red-600">-{formatCurrency(financialData.unitEconomics.productCost)}</span>
                      </div>
                      <Progress value={(financialData.unitEconomics.productCost / financialData.unitEconomics.sellingPrice) * 100} className="h-3 bg-red-100" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Amazon Fees</span>
                        <span className="text-lg font-semibold text-orange-600">-{formatCurrency(financialData.unitEconomics.amazonFees)}</span>
                      </div>
                      <Progress value={(financialData.unitEconomics.amazonFees / financialData.unitEconomics.sellingPrice) * 100} className="h-3 bg-orange-100" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Shipping & Fulfillment</span>
                        <span className="text-lg font-semibold text-purple-600">-{formatCurrency(financialData.unitEconomics.shippingCost)}</span>
                      </div>
                      <Progress value={(financialData.unitEconomics.shippingCost / financialData.unitEconomics.sellingPrice) * 100} className="h-3 bg-purple-100" />
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Net Profit per Unit</span>
                        <span className="text-xl font-bold text-green-600">{formatCurrency(financialData.unitEconomics.netProfit)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Profit Margin</span>
                        <span className="text-sm font-semibold text-green-600">{formatPercent(financialData.unitEconomics.profitMargin)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cost Structure Visualization */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Cost Structure Visualization</h4>
                  <div className="relative h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatPercent(financialData.unitEconomics.profitMargin)}
                      </div>
                      <div className="text-sm text-gray-600">Net Margin</div>
                    </div>
                    {/* Simplified pie chart representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border-8 border-green-500 opacity-20"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-xs text-gray-600">Product Cost ({Math.round((financialData.unitEconomics.productCost / financialData.unitEconomics.sellingPrice) * 100)}%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-xs text-gray-600">Amazon Fees ({Math.round((financialData.unitEconomics.amazonFees / financialData.unitEconomics.sellingPrice) * 100)}%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-xs text-gray-600">Shipping ({Math.round((financialData.unitEconomics.shippingCost / financialData.unitEconomics.sellingPrice) * 100)}%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs text-gray-600">Net Profit ({Math.round(financialData.unitEconomics.profitMargin)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FBA Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span>Amazon FBA Fee Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600 mb-1">
                    {formatCurrency(financialData.unitEconomics.amazonFees * 0.5)}
                  </div>
                  <div className="text-sm text-gray-700">Referral Fee</div>
                  <div className="text-xs text-gray-500">15% of selling price</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600 mb-1">
                    {formatCurrency(financialData.unitEconomics.amazonFees * 0.4)}
                  </div>
                  <div className="text-sm text-gray-700">FBA Fulfillment</div>
                  <div className="text-xs text-gray-500">Pick, pack & ship</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600 mb-1">
                    {formatCurrency(financialData.unitEconomics.amazonFees * 0.1)}
                  </div>
                  <div className="text-sm text-gray-700">Storage Fees</div>
                  <div className="text-xs text-gray-500">Monthly storage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && (
        <div className="space-y-6">
          {/* 12-Month Financial Projections */}
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
                {/* Scenario Comparison */}
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
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
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
                    </div>
                  </div>
                </div>

                {/* Monthly Progression */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Revenue Projections</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-t from-yellow-50 to-white rounded-lg border">
                      <div className="text-sm text-gray-600 mb-2">Conservative</div>
                      <div className="text-xl font-semibold text-yellow-600">
                        {formatCurrency(financialData.monthlyProjections?.conservative?.revenue || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{financialData.monthlyProjections?.conservative?.units || 0} units/mo</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-t from-blue-50 to-white rounded-lg border-2 border-blue-200">
                      <div className="text-sm text-gray-600 mb-2">Realistic</div>
                      <div className="text-xl font-semibold text-blue-600">
                        {formatCurrency(financialData.monthlyProjections?.realistic?.revenue || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{financialData.monthlyProjections?.realistic?.units || 0} units/mo</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-t from-green-50 to-white rounded-lg border">
                      <div className="text-sm text-gray-600 mb-2">Optimistic</div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatCurrency(financialData.monthlyProjections?.optimistic?.revenue || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{financialData.monthlyProjections?.optimistic?.units || 0} units/mo</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Monthly Cash Flow Projections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Scenario</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Monthly Revenue</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Monthly Costs</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Monthly Profit</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Annual Profit</th>
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
                      const annualRevenue = revenue * 12
                      const annualProfit = profit * 12
                      
                      return (
                        <tr key={scenario} className={`border-b ${scenario === 'Realistic' ? 'bg-blue-50' : ''}`}>
                          <td className="py-2 px-3 text-sm font-medium">{scenario}</td>
                          <td className="py-2 px-3 text-sm text-right">{formatCurrency(revenue)}</td>
                          <td className="py-2 px-3 text-sm text-right text-red-600">{formatCurrency(costs)}</td>
                          <td className="py-2 px-3 text-sm text-right font-medium text-green-600">{formatCurrency(profit)}</td>
                          <td className="py-2 px-3 text-sm text-right font-bold">{formatCurrency(annualProfit)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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

      {/* Risk Analysis Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>Risk Analysis & Mitigation</span>
              </CardTitle>
              <CardDescription>
                Comprehensive risk assessment and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.riskAnalysis.risks.map((risk: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{risk.type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                      </div>
                      <Badge 
                        variant={risk.severity === 'high' ? 'destructive' : risk.severity === 'medium' ? 'default' : 'secondary'}
                      >
                        {risk.severity} risk
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Mitigation Strategy:</span>
                      <p className="text-sm text-gray-600 mt-1">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gauge className="h-5 w-5 text-orange-600" />
                <span>Risk-Adjusted Returns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatPercent(financialData.riskAnalysis.worstCase.roi)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Worst Case ROI</div>
                  <div className="text-xs text-gray-600 mt-1">25% probability</div>
                </div>
                
                <div className="text-center p-6 border rounded-lg bg-blue-50">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatPercent(financialData.riskAnalysis.expectedCase.roi)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Expected ROI</div>
                  <div className="text-xs text-gray-600 mt-1">50% probability</div>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPercent(financialData.riskAnalysis.bestCase.roi)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">Best Case ROI</div>
                  <div className="text-xs text-gray-600 mt-1">25% probability</div>
                </div>
              </div>

              {/* Risk Score */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Risk Score</span>
                  <span className="text-2xl font-bold text-orange-600">{financialData.riskAnalysis.overallRiskScore}/10</span>
                </div>
                <Progress value={financialData.riskAnalysis.overallRiskScore * 10} className="h-3" />
                <p className="text-xs text-gray-600 mt-2">
                  This product has a {financialData.riskAnalysis.overallRiskScore <= 3 ? 'low' : financialData.riskAnalysis.overallRiskScore <= 6 ? 'medium' : 'high'} risk profile
                  based on market competition, investment requirements, and demand volatility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}