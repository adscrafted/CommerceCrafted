'use client'

import React from 'react'
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
  ArrowDownRight
} from 'lucide-react'

interface FinancialAnalysisProps {
  data: any
}

export default function FinancialAnalysis({ data }: FinancialAnalysisProps) {
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
      {/* Profitability Overview */}
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
            
            {/* Cost Breakdown Pie Chart Visualization */}
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

      {/* Monthly Projections */}
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
            {/* Scenario Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Conservative</h4>
                  <Badge variant="secondary">Low Risk</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-medium">{formatCurrency(financialData.monthlyProjections.conservative.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Profit</span>
                    <span className="font-medium text-green-600">{formatCurrency(financialData.monthlyProjections.conservative.profit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Units/Month</span>
                    <span className="font-medium">{financialData.monthlyProjections.conservative.units}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Realistic</h4>
                  <Badge className="bg-blue-500 text-white">Recommended</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-medium">{formatCurrency(financialData.monthlyProjections.realistic.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Profit</span>
                    <span className="font-medium text-green-600">{formatCurrency(financialData.monthlyProjections.realistic.profit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Units/Month</span>
                    <span className="font-medium">{financialData.monthlyProjections.realistic.units}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Optimistic</h4>
                  <Badge className="bg-green-100 text-green-700">High Growth</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-medium">{formatCurrency(financialData.monthlyProjections.optimistic.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Profit</span>
                    <span className="font-medium text-green-600">{formatCurrency(financialData.monthlyProjections.optimistic.profit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Units/Month</span>
                    <span className="font-medium">{financialData.monthlyProjections.optimistic.units}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 12-Month Trend Chart (Simplified) */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Revenue Growth Trajectory</h4>
              <div className="grid grid-cols-12 gap-1 h-32">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex flex-col justify-end">
                    <div 
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${20 + (i * 6)}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 text-center mt-1">{i + 1}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">Months</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment & ROI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            <span>Investment & ROI Analysis</span>
          </CardTitle>
          <CardDescription>
            Initial investment requirements and return on investment timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Initial Investment Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Initial Inventory</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(financialData.investmentRequired.initialInventory)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Marketing & PPC</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(financialData.investmentRequired.marketing)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Operating Capital</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(financialData.investmentRequired.operatingCapital)}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                  <span className="text-sm font-semibold text-gray-900">Total Investment</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(financialData.investmentRequired.total)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">ROI Timeline</h4>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Break-even Point</span>
                    <span className="text-lg font-semibold text-orange-600">{financialData.roi.breakEvenMonths} months</span>
                  </div>
                  <Progress value={(3 / financialData.roi.breakEvenMonths) * 100} className="h-2" />
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Year 1 ROI</span>
                    <span className="text-lg font-semibold text-green-600">{formatPercent(financialData.roi.year1ROI)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Projected return: {formatCurrency(financialData.investmentRequired.total * (1 + financialData.roi.year1ROI / 100))}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">3-Year ROI</span>
                    <span className="text-lg font-semibold text-green-600">{formatPercent(financialData.roi.year3ROI)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Projected return: {formatCurrency(financialData.investmentRequired.total * (1 + financialData.roi.year3ROI / 100))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Risk Analysis & Mitigation</span>
          </CardTitle>
          <CardDescription>
            Key financial risks and recommended mitigation strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {financialData.riskFactors.map((risk: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    risk.level === 'High' ? 'bg-red-100 text-red-600' :
                    risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{risk.type}</h4>
                      <Badge variant={
                        risk.level === 'High' ? 'destructive' :
                        risk.level === 'Medium' ? 'secondary' :
                        'secondary'
                      }>
                        {risk.level} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                    <div className="bg-blue-50 rounded p-3">
                      <div className="text-xs font-medium text-blue-700 mb-1">Mitigation Strategy:</div>
                      <p className="text-xs text-blue-600">{risk.mitigation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span>Key Financial Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(financialData.unitEconomics.netProfit)}
              </div>
              <div className="text-sm text-gray-600">Profit per Unit</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPercent(financialData.unitEconomics.profitMargin)}
              </div>
              <div className="text-sm text-gray-600">Net Margin</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {financialData.roi.breakEvenMonths} mo
              </div>
              <div className="text-sm text-gray-600">Break-even</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatCurrency(financialData.investmentRequired.total)}
              </div>
              <div className="text-sm text-gray-600">Total Investment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}