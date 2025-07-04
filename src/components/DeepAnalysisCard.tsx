'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Search,
  BarChart3,
  PieChart,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Zap,
  Brain,
  Star
} from 'lucide-react'

import { DeepAnalysis, KeywordAnalysis, PPCStrategy, InventoryAnalysis, DemandAnalysis, CompetitorAnalysis, FinancialModel } from '@/types/deep-research'

interface DeepAnalysisCardProps {
  productId: string
  productTitle: string
  productPrice: number
  onRequestAnalysis?: (type: string) => void
  isLoading?: boolean
}

export default function DeepAnalysisCard({ 
  productId, 
  productTitle, 
  productPrice, 
  onRequestAnalysis,
  isLoading = false 
}: DeepAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [analysisData, setAnalysisData] = useState<{
    deep?: DeepAnalysis
    keywords?: KeywordAnalysis
    ppc?: PPCStrategy
    inventory?: InventoryAnalysis
    demand?: DemandAnalysis
    competitors?: CompetitorAnalysis
    financial?: FinancialModel
  }>({})

  const handleAnalysisRequest = async (type: string) => {
    if (onRequestAnalysis) {
      onRequestAnalysis(type)
      // In real implementation, this would trigger the API call
      // and update analysisData with the response
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800'
    if (score >= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              Deep Research Analysis
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              IdeaBrowser-style comprehensive Amazon product research
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Pro Feature
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
            <TabsTrigger value="ppc" className="text-xs">PPC</TabsTrigger>
            <TabsTrigger value="demand" className="text-xs">Demand</TabsTrigger>
            <TabsTrigger value="competition" className="text-xs">Competition</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Opportunity Score</p>
                    <p className="text-2xl font-bold text-blue-900">8.5/10</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <Badge className="mt-2 bg-green-100 text-green-800">Excellent</Badge>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Est. Revenue</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(15750)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-1">Monthly projection</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Market Size</p>
                    <p className="text-2xl font-bold text-purple-900">$12M</p>
                  </div>
                  <PieChart className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-xs text-purple-600 mt-1">Serviceable market</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Competition</p>
                    <p className="text-2xl font-bold text-orange-900">Medium</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-orange-600 mt-1">12 main competitors</p>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Strong Market Demand</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Growing search trends with 23% YoY increase in related keywords
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Moderate Competition</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        15-20 established players but clear differentiation opportunities
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Healthy Margins</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Estimated 60-70% gross margins achievable with proper positioning
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800">Optimal Timing</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Market conditions favorable for new product launch
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAnalysisRequest('keywords')}
                  className="flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Keywords</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAnalysisRequest('ppc')}
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>PPC Strategy</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAnalysisRequest('inventory')}
                  className="flex items-center space-x-2"
                >
                  <Package className="h-4 w-4" />
                  <span>Inventory</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAnalysisRequest('financial')}
                  className="flex items-center space-x-2"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Financials</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Keyword Research Analysis</h3>
              <Button 
                size="sm" 
                onClick={() => handleAnalysisRequest('keywords')}
                disabled={isLoading}
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Analysis
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-4 col-span-2">
                <h4 className="font-medium mb-3">Primary Keywords</h4>
                <div className="space-y-3">
                  {[
                    { keyword: "wireless bluetooth headphones", volume: "45K", difficulty: 65, cpc: "$1.25" },
                    { keyword: "noise cancelling earbuds", volume: "32K", difficulty: 58, cpc: "$1.15" },
                    { keyword: "sports headphones", volume: "28K", difficulty: 52, cpc: "$0.95" }
                  ].map((kw, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{kw.keyword}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Volume: {kw.volume}</span>
                          <span className="text-xs text-gray-500">CPC: {kw.cpc}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${kw.difficulty > 60 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {kw.difficulty}% difficulty
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3">Long-tail Opportunities</h4>
                <div className="space-y-2">
                  {[
                    "best wireless earbuds under $50",
                    "waterproof bluetooth headphones",
                    "gaming headset with mic"
                  ].map((keyword, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded text-sm">
                      <span className="text-green-800">{keyword}</span>
                      <p className="text-xs text-green-600 mt-1">Lower competition</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Seasonal Trends</h4>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Seasonal trend chart would go here</p>
              </div>
            </Card>
          </TabsContent>

          {/* PPC Tab */}
          <TabsContent value="ppc" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">PPC Launch Strategy</h3>
              <Button 
                size="sm" 
                onClick={() => handleAnalysisRequest('ppc')}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Strategy
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-3">Budget Allocation</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Launch Phase</span>
                    <span className="font-medium">{formatCurrency(1500)}</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Scale Phase</span>
                    <span className="font-medium">{formatCurrency(3000)}</span>
                  </div>
                  <Progress value={40} className="h-2" />
                  
                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Budget</span>
                    <span>{formatCurrency(4500)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3">Expected Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">35%</p>
                    <p className="text-sm text-blue-700">Target ACoS</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">2.8x</p>
                    <p className="text-sm text-green-700">ROAS</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">$1.15</p>
                    <p className="text-sm text-purple-700">Avg CPC</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-900">12%</p>
                    <p className="text-sm text-orange-700">CVR</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Campaign Structure</h4>
              <div className="space-y-4">
                {[
                  { name: "Exact Match Campaign", keywords: 10, budget: "$50/day", type: "exact" },
                  { name: "Phrase Match Campaign", keywords: 20, budget: "$35/day", type: "phrase" },
                  { name: "Auto Campaign", keywords: "Auto", budget: "$25/day", type: "auto" }
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-gray-600">{campaign.keywords} keywords</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{campaign.budget}</p>
                      <Badge variant="secondary" className="text-xs">{campaign.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Demand Analysis Tab */}
          <TabsContent value="demand" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Market Demand Analysis</h3>
              <Button 
                size="sm" 
                onClick={() => handleAnalysisRequest('demand')}
                disabled={isLoading}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>

            {/* Market Size Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700">TAM</p>
                  <p className="text-2xl font-bold text-blue-900">$45M</p>
                  <p className="text-xs text-blue-600">Total Addressable Market</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">SAM</p>
                  <p className="text-2xl font-bold text-green-900">$12M</p>
                  <p className="text-xs text-green-600">Serviceable Addressable</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-purple-700">SOM</p>
                  <p className="text-2xl font-bold text-purple-900">$2.1M</p>
                  <p className="text-xs text-purple-600">Serviceable Obtainable</p>
                </div>
              </Card>
            </div>

            {/* Growth Trends */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Growth Trends & Projections</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Historical Growth</h5>
                  <div className="space-y-2">
                    {[
                      { year: "2021", growth: 12 },
                      { year: "2022", growth: 15 },
                      { year: "2023", growth: 18 }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.year}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${(item.growth / 20) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.growth}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Projected Growth (CAGR: 16.8%)</h5>
                  <div className="space-y-2">
                    {[
                      { year: "2024", growth: 22 },
                      { year: "2025", growth: 20 },
                      { year: "2026", growth: 18 }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.year}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{width: `${(item.growth / 25) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.growth}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Geographic Demand */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Geographic Demand Distribution</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { region: "North America", share: 45, competition: "High" },
                  { region: "Europe", share: 30, competition: "Medium" },
                  { region: "Asia Pacific", share: 20, competition: "Low" },
                  { region: "Other", share: 5, competition: "Low" }
                ].map((region, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{region.share}%</p>
                    <p className="text-sm text-gray-600">{region.region}</p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs mt-1 ${
                        region.competition === 'High' ? 'bg-red-100 text-red-800' :
                        region.competition === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {region.competition} Competition
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customer Behavior */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Customer Behavior & Demographics</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h5>
                  <div className="space-y-2">
                    {[
                      { range: "18-24", percentage: 15 },
                      { range: "25-34", percentage: 35 },
                      { range: "35-44", percentage: 30 },
                      { range: "45+", percentage: 20 }
                    ].map((age, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{age.range}</span>
                        <span className="text-sm font-medium">{age.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Purchase Patterns</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Order Value</span>
                      <span className="text-sm font-medium">{formatCurrency(420)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Purchase Frequency</span>
                      <span className="text-sm font-medium">2.3x/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Peak Season</span>
                      <span className="text-sm font-medium">Q4 (+40%)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Demand Drivers</h5>
                  <div className="space-y-2">
                    {[
                      { driver: "Tech adoption", impact: "High" },
                      { driver: "Price sensitivity", impact: "Medium" },
                      { driver: "Brand awareness", impact: "Medium" }
                    ].map((driver, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{driver.driver}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            driver.impact === 'High' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {driver.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Competition Analysis Tab */}
          <TabsContent value="competition" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Competitive Intelligence</h3>
              <Button 
                size="sm" 
                onClick={() => handleAnalysisRequest('competition')}
                disabled={isLoading}
              >
                <Users className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>

            {/* Competition Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-red-700">Threat Level</p>
                  <p className="text-2xl font-bold text-red-900">Medium</p>
                  <p className="text-xs text-red-600">15-20 competitors</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700">Avg Price</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(385)}</p>
                  <p className="text-xs text-blue-600">Market average</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">Entry Barrier</p>
                  <p className="text-2xl font-bold text-green-900">Low</p>
                  <p className="text-xs text-green-600">Accessible market</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-purple-700">Market Share</p>
                  <p className="text-2xl font-bold text-purple-900">3.2%</p>
                  <p className="text-xs text-purple-600">Available opportunity</p>
                </div>
              </Card>
            </div>

            {/* Top Competitors */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Top 5 Competitors Analysis</h4>
              <div className="space-y-4">
                {[
                  { 
                    name: "Market Leader", 
                    asin: "B08EXAMPLE1", 
                    marketShare: 25, 
                    rating: 4.3, 
                    reviews: 1250, 
                    price: 399.99,
                    strengths: ["Brand recognition", "Customer loyalty"],
                    weaknesses: ["Higher price", "Limited features"]
                  },
                  { 
                    name: "Value Brand", 
                    asin: "B07EXAMPLE2", 
                    marketShare: 18, 
                    rating: 4.1, 
                    reviews: 890, 
                    price: 299.99,
                    strengths: ["Competitive pricing", "Fast shipping"],
                    weaknesses: ["Quality concerns", "Limited support"]
                  },
                  { 
                    name: "Innovation Leader", 
                    asin: "B09EXAMPLE3", 
                    marketShare: 15, 
                    rating: 4.5, 
                    reviews: 650, 
                    price: 449.99,
                    strengths: ["Latest features", "Premium build"],
                    weaknesses: ["Premium pricing", "Complex setup"]
                  }
                ].map((competitor, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">{competitor.name}</h5>
                        <p className="text-sm text-gray-600">ASIN: {competitor.asin}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(competitor.price)}</p>
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${star <= competitor.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({competitor.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Market Share</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${(competitor.marketShare / 30) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{competitor.marketShare}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {competitor.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Weaknesses</p>
                        <div className="flex flex-wrap gap-1">
                          {competitor.weaknesses.map((weakness, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-red-100 text-red-800">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Price Analysis */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Price Analysis & Positioning</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Price Distribution</h5>
                  <div className="space-y-3">
                    {[
                      { range: "$200-300", count: 12, percentage: 25 },
                      { range: "$300-400", count: 28, percentage: 58 },
                      { range: "$400-500", count: 8, percentage: 17 }
                    ].map((price, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{price.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${price.percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{price.count} products</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Recommended Strategy</h5>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Optimal Price Point</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(329)}</p>
                      <p className="text-xs text-blue-600">15% below market leader</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Key Advantages:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Mid-market positioning opportunity</li>
                        <li>• Superior value proposition</li>
                        <li>• Customer service differentiation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* SWOT Analysis */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">SWOT Analysis vs Competition</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Cost advantage potential</li>
                      <li>• Quick market entry capability</li>
                      <li>• Fresh brand positioning</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Opportunities</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Market growth (18% CAGR)</li>
                      <li>• Feature innovation gaps</li>
                      <li>• Customer service gaps</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-2">Weaknesses</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• No brand recognition</li>
                      <li>• Zero customer reviews</li>
                      <li>• No market presence</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h5 className="font-medium text-red-800 mb-2">Threats</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Price competition</li>
                      <li>• Established customer loyalty</li>
                      <li>• Market saturation risk</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Inventory Analysis Tab */}
          <TabsContent value="inventory" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Inventory Planning & Management</h3>
              <Button 
                size="sm" 
                onClick={() => handleAnalysisRequest('inventory')}
                disabled={isLoading}
              >
                <Package className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>

            {/* Order Quantity & Investment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700">Optimal Order Qty</p>
                  <p className="text-2xl font-bold text-blue-900">150 units</p>
                  <p className="text-xs text-blue-600">3-month supply</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">Initial Investment</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(5400)}</p>
                  <p className="text-xs text-green-600">Including shipping & duties</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-purple-700">Lead Time</p>
                  <p className="text-2xl font-bold text-purple-900">40 days</p>
                  <p className="text-xs text-purple-600">Manufacturing + shipping</p>
                </div>
              </Card>
            </div>

            {/* Supplier Analysis */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Supplier Comparison & Analysis</h4>
              <div className="space-y-4">
                {[
                  {
                    name: "Supplier A (Recommended)",
                    unitCost: 18,
                    moq: 100,
                    rating: 4.5,
                    leadTime: 25,
                    qualityScore: 8.5,
                    riskFactors: ["Currency fluctuation", "Quality variance"],
                    recommended: true
                  },
                  {
                    name: "Supplier B",
                    unitCost: 16,
                    moq: 200,
                    rating: 4.2,
                    leadTime: 35,
                    qualityScore: 7.8,
                    riskFactors: ["Higher MOQ", "Longer lead time"],
                    recommended: false
                  },
                  {
                    name: "Supplier C",
                    unitCost: 20,
                    moq: 50,
                    rating: 4.7,
                    leadTime: 20,
                    qualityScore: 9.2,
                    riskFactors: ["Higher cost", "Small scale"],
                    recommended: false
                  }
                ].map((supplier, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${
                    supplier.recommended ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900 flex items-center">
                          {supplier.name}
                          {supplier.recommended && (
                            <Badge className="ml-2 text-xs bg-green-100 text-green-800">Recommended</Badge>
                          )}
                        </h5>
                        <p className="text-sm text-gray-600">MOQ: {supplier.moq} units • Lead Time: {supplier.leadTime} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(supplier.unitCost)}</p>
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${star <= supplier.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({supplier.rating})</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Quality Score</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                supplier.qualityScore >= 8 ? 'bg-green-600' : 
                                supplier.qualityScore >= 7 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{width: `${(supplier.qualityScore / 10) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{supplier.qualityScore}/10</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Risk Factors</p>
                        <div className="flex flex-wrap gap-1">
                          {supplier.riskFactors.map((risk, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Cost (150 units)</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(supplier.unitCost * 150)}</p>
                        <p className="text-xs text-gray-600">+ shipping & duties</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Seasonal Demand & Inventory Planning */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Seasonal Demand & Inventory Strategy</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Monthly Demand Forecast</h5>
                  <div className="space-y-2">
                    {[
                      { month: "Jan", demand: 45, stockoutRisk: "Low" },
                      { month: "Feb", demand: 38, stockoutRisk: "Low" },
                      { month: "Mar", demand: 52, stockoutRisk: "Medium" },
                      { month: "Apr", demand: 48, stockoutRisk: "Medium" },
                      { month: "May", demand: 55, stockoutRisk: "Medium" },
                      { month: "Jun", demand: 62, stockoutRisk: "High" },
                      { month: "Jul", demand: 58, stockoutRisk: "High" },
                      { month: "Aug", demand: 50, stockoutRisk: "Medium" },
                      { month: "Sep", demand: 47, stockoutRisk: "Medium" },
                      { month: "Oct", demand: 65, stockoutRisk: "High" },
                      { month: "Nov", demand: 85, stockoutRisk: "High" },
                      { month: "Dec", demand: 78, stockoutRisk: "High" }
                    ].slice(0, 6).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{item.month}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${(item.demand / 85) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{item.demand}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              item.stockoutRisk === 'High' ? 'bg-red-100 text-red-800' :
                              item.stockoutRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.stockoutRisk}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Inventory Recommendations</h5>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Q1 Strategy</p>
                      <p className="text-xs text-blue-600 mt-1">Maintain 150 units, moderate demand period</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-800">Q2 Strategy</p>
                      <p className="text-xs text-orange-600 mt-1">Increase to 200 units for summer surge</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Q4 Strategy</p>
                      <p className="text-xs text-red-600 mt-1">Stock 300+ units for holiday season (+40% demand)</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cash Flow & Risk Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-4">Cash Flow Projections (6 months)</h4>
                <div className="space-y-3">
                  {[
                    { month: "Month 1", cashOutflow: -5400, cashInflow: 0, netFlow: -5400 },
                    { month: "Month 2", cashOutflow: -800, cashInflow: 2250, netFlow: 1450 },
                    { month: "Month 3", cashOutflow: -900, cashInflow: 2475, netFlow: 1575 },
                    { month: "Month 4", cashOutflow: -1000, cashInflow: 2700, netFlow: 1700 },
                    { month: "Month 5", cashOutflow: -3200, cashInflow: 2925, netFlow: -275 },
                    { month: "Month 6", cashOutflow: -1100, cashInflow: 3150, netFlow: 2050 }
                  ].map((cash, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{cash.month}</span>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          cash.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(cash.netFlow)}
                        </p>
                        <p className="text-xs text-gray-500">
                          In: {formatCurrency(cash.cashInflow)} • Out: {formatCurrency(Math.abs(cash.cashOutflow))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-4">Risk Assessment & Mitigation</h4>
                <div className="space-y-3">
                  {[
                    { risk: "Supplier Risk", level: "Medium", mitigation: "Multiple supplier backup" },
                    { risk: "Demand Risk", level: "Low", mitigation: "Conservative forecasting" },
                    { risk: "Seasonality Risk", level: "Medium", mitigation: "Pre-season stocking" },
                    { risk: "Competition Risk", level: "Medium", mitigation: "Price monitoring" },
                    { risk: "Cash Flow Risk", level: "Low", mitigation: "Staged ordering" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.risk}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.mitigation}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          item.level === 'High' ? 'bg-red-100 text-red-800' :
                          item.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quality & Compliance Requirements */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Quality Requirements & Compliance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Standards</h5>
                  <div className="space-y-1">
                    {["ISO 9001", "CE Marking", "FCC"].map((standard, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 block w-fit">
                        {standard}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Certifications</h5>
                  <div className="space-y-1">
                    {["RoHS", "UL Listed"].map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800 block w-fit">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Testing</h5>
                  <div className="space-y-1">
                    {["Safety testing", "Performance"].map((test, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800 block w-fit">
                        {test}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Compliance</h5>
                  <div className="space-y-1">
                    {["Amazon reqs", "US regulations"].map((comp, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800 block w-fit">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Financial Analysis Tab */}
          <TabsContent value="financial" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Financial Analysis & Projections</h3>
              <Button 
                size="sm" 
                onClick={() => handleAnalysisRequest('financial')}
                disabled={isLoading}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">ROI</p>
                  <p className="text-2xl font-bold text-green-900">38.2%</p>
                  <p className="text-xs text-green-600">Annual return</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700">Payback Period</p>
                  <p className="text-2xl font-bold text-blue-900">8 months</p>
                  <p className="text-xs text-blue-600">Break-even timeline</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-purple-700">Monthly Profit</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(3822/12)}</p>
                  <p className="text-xs text-purple-600">Average net profit</p>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-orange-700">Gross Margin</p>
                  <p className="text-2xl font-bold text-orange-900">70%</p>
                  <p className="text-xs text-orange-600">Before Amazon fees</p>
                </div>
              </Card>
            </div>

            {/* Revenue Projections & Cost Structure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-4">12-Month Revenue Projection</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Monthly Sales</p>
                      <p className="text-lg font-bold text-blue-900">50 units</p>
                      <p className="text-xs text-blue-600">Average</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Unit Price</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(35)}</p>
                      <p className="text-xs text-green-600">Selling price</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">Annual Revenue</p>
                      <p className="text-lg font-bold text-purple-900">{formatCurrency(21000)}</p>
                      <p className="text-xs text-purple-600">Total projected</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Monthly Revenue Breakdown</h5>
                    {[
                      { month: "Q1 Avg", revenue: 1575, growth: "+12%" },
                      { month: "Q2 Avg", revenue: 1750, growth: "+18%" },
                      { month: "Q3 Avg", revenue: 1925, growth: "+22%" },
                      { month: "Q4 Avg", revenue: 2450, growth: "+55%" }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{item.month}</span>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatCurrency(item.revenue)}</p>
                          <p className="text-xs text-green-600">{item.growth}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-4">Cost Structure Analysis</h4>
                <div className="space-y-3">
                  {[
                    { category: "COGS (Unit Cost)", amount: 18, percentage: 51.4, color: "bg-red-500" },
                    { category: "Amazon Fees", amount: 5.25, percentage: 15, color: "bg-orange-500" },
                    { category: "PPC/Marketing", amount: 3.50, percentage: 10, color: "bg-yellow-500" },
                    { category: "Storage & Misc", amount: 1.00, percentage: 3, color: "bg-purple-500" },
                    { category: "Net Profit", amount: 7.25, percentage: 20.6, color: "bg-green-500" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-gray-500">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total per Unit</span>
                    <span className="font-bold">{formatCurrency(35)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Break-even Analysis */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Break-even Analysis & Profitability</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Break-even Metrics</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Fixed Costs</span>
                      <span className="text-sm font-medium">{formatCurrency(2000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Contribution Margin</span>
                      <span className="text-sm font-medium">{formatCurrency(17)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Break-even Units</span>
                      <span className="text-sm font-medium">118 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Break-even Revenue</span>
                      <span className="text-sm font-medium">{formatCurrency(4130)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span className="text-sm">Months to Break-even</span>
                      <span className="text-sm">2.4 months</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Profitability Margins</h5>
                  <div className="space-y-3">
                    {[
                      { metric: "Gross Margin", value: 70, target: ">60%" },
                      { metric: "Net Margin", value: 20, target: ">15%" },
                      { metric: "Contribution Margin", value: 65, target: ">50%" },
                      { metric: "Operating Margin", value: 25, target: ">20%" },
                      { metric: "EBITDA Margin", value: 30, target: ">25%" }
                    ].map((margin, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{margin.metric}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">{margin.value}%</span>
                          <p className="text-xs text-green-600">{margin.target}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Risk Metrics</h5>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm font-medium text-blue-800">Volatility</p>
                      <p className="text-lg font-bold text-blue-900">15.5%</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-sm font-medium text-green-800">Sharpe Ratio</p>
                      <p className="text-lg font-bold text-green-900">1.85</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center">
                      <p className="text-sm font-medium text-yellow-800">Probability of Loss</p>
                      <p className="text-lg font-bold text-yellow-900">15%</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Scenario Analysis */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Scenario Analysis & Projections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    scenario: "Best Case",
                    description: "+50% sales performance",
                    revenue: 31500,
                    profit: 7200,
                    roi: 45,
                    probability: "25%",
                    color: "bg-green-50 border-green-200",
                    textColor: "text-green-800"
                  },
                  {
                    scenario: "Most Likely",
                    description: "Expected performance",
                    revenue: 21000,
                    profit: 3822,
                    roi: 25,
                    probability: "50%",
                    color: "bg-blue-50 border-blue-200",
                    textColor: "text-blue-800"
                  },
                  {
                    scenario: "Worst Case",
                    description: "-30% sales performance",
                    revenue: 14700,
                    profit: 1200,
                    roi: 5,
                    probability: "25%",
                    color: "bg-red-50 border-red-200",
                    textColor: "text-red-800"
                  }
                ].map((scenario, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${scenario.color}`}>
                    <div className="text-center mb-3">
                      <h5 className={`font-medium ${scenario.textColor}`}>{scenario.scenario}</h5>
                      <p className={`text-xs ${scenario.textColor} opacity-80`}>{scenario.description}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {scenario.probability} probability
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Revenue</span>
                        <span className="text-sm font-medium">{formatCurrency(scenario.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Profit</span>
                        <span className="text-sm font-medium">{formatCurrency(scenario.profit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">ROI</span>
                        <span className={`text-sm font-bold ${scenario.textColor}`}>{scenario.roi}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Investment Requirements & FBA Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-4">Investment Requirements</h4>
                <div className="space-y-3">
                  {[
                    { category: "Initial Inventory", amount: 6000, description: "150 units @ $40 landed cost" },
                    { category: "Marketing/PPC", amount: 2000, description: "Launch campaign budget" },
                    { category: "Operations", amount: 1500, description: "Setup, logistics, misc" },
                    { category: "Contingency", amount: 500, description: "Risk buffer (5%)" }
                  ].map((investment, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{investment.category}</p>
                        <p className="text-xs text-gray-600 mt-1">{investment.description}</p>
                      </div>
                      <p className="text-sm font-bold">{formatCurrency(investment.amount)}</p>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Investment Required</span>
                      <span className="text-lg font-bold text-blue-900">{formatCurrency(10000)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-4">Amazon FBA Fee Analysis</h4>
                <div className="space-y-3">
                  {[
                    { fee: "Referral Fee (15%)", amount: 5.25, description: "Category commission" },
                    { fee: "Fulfillment Fee", amount: 3.50, description: "Pick, pack, ship" },
                    { fee: "Storage Fee", amount: 0.30, description: "Monthly per unit" },
                    { fee: "Long-term Storage", amount: 0, description: "Avoided with turnover" }
                  ].map((fee, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{fee.fee}</p>
                        <p className="text-xs text-gray-600">{fee.description}</p>
                      </div>
                      <p className="text-sm font-medium">{formatCurrency(fee.amount)}</p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total FBA Fees per Unit</span>
                      <span className="font-bold">{formatCurrency(9.05)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fee Percentage of Sale Price</span>
                      <span className="text-sm font-medium">25.9%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Tax Implications</p>
                    <div className="text-xs text-blue-600 mt-1 space-y-1">
                      <p>• Sales Tax: ~8% on revenue</p>
                      <p>• Income Tax: ~25% on profit</p>
                      <p>• Effective Tax Rate: ~28%</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}