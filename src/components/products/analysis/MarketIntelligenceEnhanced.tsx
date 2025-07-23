'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign,
  Calendar,
  Users,
  Package,
  BarChart3,
  Brain,
  Shield,
  Zap,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface MarketIntelligenceEnhancedProps {
  marketData: {
    assessment: string
    opportunities: Array<{
      title: string
      description: string
      impact?: 'high' | 'medium' | 'low'
      dataSource?: string
    }>
    risks: Array<{
      title: string
      description: string
      severity?: 'high' | 'medium' | 'low'
      dataSource?: string
    }>
    marketMetrics?: {
      growthRate?: number
      marketSize?: string
      competitionLevel?: number
      entryDifficulty?: number
      profitPotential?: number
    }
    dataInsights?: {
      totalReviewsAnalyzed: number
      keywordsAnalyzed: number
      productsAnalyzed: number
      lastUpdated: string
    }
  }
}

export default function MarketIntelligenceEnhanced({ marketData }: MarketIntelligenceEnhancedProps) {
  const getImpactColor = (impact?: string) => {
    switch(impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch(severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI-Powered Market Assessment
              </CardTitle>
              <CardDescription>
                Machine learning analysis of market conditions and opportunities
              </CardDescription>
            </div>
            {marketData.dataInsights && (
              <div className="text-right text-sm text-gray-500">
                <div>Updated: {new Date(marketData.dataInsights.lastUpdated).toLocaleDateString()}</div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {marketData.dataInsights.totalReviewsAnalyzed} reviews
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {marketData.dataInsights.productsAnalyzed} products
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <p className="text-gray-700 leading-relaxed">{marketData.assessment}</p>
          </div>
        </CardContent>
      </Card>

      {/* Market Metrics Grid */}
      {marketData.marketMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {marketData.marketMetrics.growthRate}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Growth Rate</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-lg font-bold text-blue-600">
                  {marketData.marketMetrics.marketSize}
                </span>
              </div>
              <p className="text-xs text-gray-600">Market Size</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Competition</span>
                  <span>{marketData.marketMetrics.competitionLevel}%</span>
                </div>
                <Progress value={marketData.marketMetrics.competitionLevel} className="h-2" />
              </div>
              <p className="text-xs text-gray-600">Competition Level</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Entry Barrier</span>
                  <span>{marketData.marketMetrics.entryDifficulty}%</span>
                </div>
                <Progress value={marketData.marketMetrics.entryDifficulty} className="h-2" />
              </div>
              <p className="text-xs text-gray-600">Entry Difficulty</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Profit</span>
                  <span>{marketData.marketMetrics.profitPotential}%</span>
                </div>
                <Progress value={marketData.marketMetrics.profitPotential} className="h-2" />
              </div>
              <p className="text-xs text-gray-600">Profit Potential</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Opportunities Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Market Opportunities
          </CardTitle>
          <CardDescription>
            AI-identified growth opportunities based on review analysis and market gaps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {marketData.opportunities.map((opportunity, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getImpactColor(opportunity.impact)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <h4 className="font-semibold">{opportunity.title}</h4>
                    {opportunity.impact && (
                      <Badge variant="outline" className="text-xs">
                        {opportunity.impact} impact
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{opportunity.description}</p>
                  {opportunity.dataSource && (
                    <p className="text-xs mt-2 opacity-70">
                      Source: {opportunity.dataSource}
                    </p>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 flex-shrink-0 ml-3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk Factors
          </CardTitle>
          <CardDescription>
            Potential challenges and risks identified from market analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {marketData.risks.map((risk, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getSeverityColor(risk.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <h4 className="font-semibold">{risk.title}</h4>
                    {risk.severity && (
                      <Badge variant="outline" className="text-xs">
                        {risk.severity} severity
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{risk.description}</p>
                  {risk.dataSource && (
                    <p className="text-xs mt-2 opacity-70">
                      Source: {risk.dataSource}
                    </p>
                  )}
                </div>
                <ArrowDownRight className="h-5 w-5 flex-shrink-0 ml-3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Sources Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong>AI Analysis Methodology:</strong> This market intelligence is generated by analyzing {marketData.dataInsights?.totalReviewsAnalyzed || 'multiple'} customer reviews, 
          {' '}{marketData.dataInsights?.keywordsAnalyzed || 'thousands of'} search keywords, and {marketData.dataInsights?.productsAnalyzed || 'several'} competitor products 
          using advanced machine learning algorithms. The AI identifies patterns in customer language, unmet needs, and market gaps to provide actionable insights.
        </AlertDescription>
      </Alert>
    </div>
  )
}