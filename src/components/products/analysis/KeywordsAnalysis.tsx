'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Search,
  ChevronDown,
  ArrowRight,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Target,
  DollarSign,
  Zap,
  AlertCircle,
  ChevronUp,
  Users,
  Sparkles
} from 'lucide-react'
import KeywordNetwork from '@/components/KeywordNetwork'
import { Button } from '@/components/ui/button'

interface KeywordsAnalysisProps {
  data: any
  searchTermsData?: any[]
}

// Keyword Pivot Table Component
const KeywordPivotTable = ({ keywordHierarchy }: { keywordHierarchy: any }) => {
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set())
  const [expandedSubroots, setExpandedSubroots] = useState<Set<string>>(new Set())

  const toggleRoot = (rootName: string) => {
    const newExpanded = new Set(expandedRoots)
    if (newExpanded.has(rootName)) {
      newExpanded.delete(rootName)
      const newExpandedSubroots = new Set(expandedSubroots)
      Object.keys(keywordHierarchy[rootName].subroots).forEach(subroot => {
        newExpandedSubroots.delete(`${rootName}-${subroot}`)
      })
      setExpandedSubroots(newExpandedSubroots)
    } else {
      newExpanded.add(rootName)
    }
    setExpandedRoots(newExpanded)
  }

  const toggleSubroot = (rootName: string, subrootName: string) => {
    const key = `${rootName}-${subrootName}`
    const newExpanded = new Set(expandedSubroots)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSubroots(newExpanded)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-3 px-6 font-medium text-gray-900">Keyword Group</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Revenue</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Monthly Orders</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Conv. Rate</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Avg CPC</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(keywordHierarchy).map(([rootName, rootData]: [string, any]) => (
            <React.Fragment key={rootName}>
              {/* Root Level */}
              <tr className="border-b bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => toggleRoot(rootName)}>
                <td className="py-3 px-6">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {expandedRoots.has(rootName) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">{rootName}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-green-600">${rootData.totalRevenue.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">{rootData.totalOrders.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">{rootData.avgConversionRate}%</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">${rootData.avgCPC}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-gray-500">-</span>
                </td>
              </tr>

              {/* Subroot Level */}
              {expandedRoots.has(rootName) && Object.entries(rootData.subroots).map(([subrootName, subrootData]: [string, any]) => (
                <React.Fragment key={`${rootName}-${subrootName}`}>
                  <tr className="border-b bg-green-50 hover:bg-green-100 cursor-pointer" onClick={() => toggleSubroot(rootName, subrootName)}>
                    <td className="py-3 px-6">
                      <div className="flex items-center">
                        <div className="ml-6 mr-2">
                          {expandedSubroots.has(`${rootName}-${subrootName}`) ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{subrootName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">${subrootData.totalRevenue.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{subrootData.totalOrders.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{subrootData.avgConversionRate}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">${subrootData.avgCPC}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-500">-</span>
                    </td>
                  </tr>

                  {/* Leaf Keywords */}
                  {expandedSubroots.has(`${rootName}-${subrootName}`) && subrootData.keywords.map((keyword: any, index: number) => (
                    <tr key={`${rootName}-${subrootName}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <div className="ml-12">
                          <span className="text-gray-700">{keyword.keyword}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600">${keyword.monthlyRevenue.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{keyword.monthlyOrders.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">{keyword.conversionRate}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700">${keyword.cpc}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${keyword.difficulty >= 70 ? 'bg-red-500' : keyword.difficulty >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${keyword.difficulty}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{keyword.difficulty}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function KeywordsAnalysis({ data, searchTermsData }: KeywordsAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Keyword Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Primary Keyword</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600 mb-1">
              {data.keywordsData.primaryKeyword}
            </div>
            <div className="text-sm text-gray-600">
              ${data.keywordsData.cpc} CPC
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600 mb-1">
              {data.keywordsData.totalKeywords}
            </div>
            <div className="text-sm text-gray-600">
              {data.keywordsData.monthlySearchVolume.toLocaleString()} searches/mo
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 mb-1">
              {data.keywordsData.averageROI}%
            </div>
            <div className="text-sm text-gray-600">
              Expected Return
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 mb-1">
              ${Object.values(data.keywordsData.keywordHierarchy).reduce((sum: number, root: any) => sum + root.totalRevenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Monthly Potential
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Keywords */}
      {data.keywordsData.trendingKeywords && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Trending Keywords</span>
          </CardTitle>
          <CardDescription>
            Fast-growing keywords with high opportunity potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.keywordsData.trendingKeywords.map((keyword: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{keyword.keyword}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Volume: {keyword.currentVolume.toLocaleString()}</span>
                      <span>CPC: ${keyword.cpc}</span>
                      <span className="capitalize">Seasonality: {keyword.seasonality}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-green-600 font-semibold">
                      <ChevronUp className="h-4 w-4" />
                      <span>{keyword.trend}</span>
                    </div>
                    <Badge 
                      variant={keyword.velocity === 'skyrocketing' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {keyword.velocity}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Opportunity Score:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={keyword.opportunity} className="w-24 h-2" />
                      <span className="text-sm font-medium">{keyword.opportunity}/100</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Target className="h-3 w-3 mr-1" />
                    Target Keyword
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Keyword Hierarchy Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600" />
            <span>Keyword Analysis Hierarchy</span>
          </CardTitle>
          <CardDescription>
            Detailed breakdown of keyword opportunities by category and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeywordPivotTable keywordHierarchy={data.keywordsData.keywordHierarchy} />
        </CardContent>
      </Card>

      {/* Competitor Keyword Analysis */}
      {data.keywordsData.competitorKeywords && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-red-600" />
            <span>Competitor Keyword Analysis</span>
          </CardTitle>
          <CardDescription>
            Keywords your competitors are ranking for and their PPC investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.keywordsData.competitorKeywords.map((keyword: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{keyword.keyword}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      {keyword.keywordGap && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Keyword Gap
                        </Badge>
                      )}
                      <span className="text-sm text-gray-600">Difficulty: {keyword.difficulty}</span>
                      <span className="text-sm text-gray-600">Recommended Bid: ${keyword.recommendedBid}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Our Rank</div>
                    <div className="text-lg font-semibold">
                      {keyword.ourRank || <span className="text-gray-400">Not Ranking</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {keyword.competitors.map((comp: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {comp.rank}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{comp.brand}</div>
                          <div className="text-xs text-gray-600">ASIN: {comp.asin}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-600">PPC Spend:</span>
                          <span className="font-medium ml-1">${comp.ppcSpend.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Organic:</span>
                          <span className="font-medium ml-1">{comp.organicShare}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* CPC & Profitability Analysis */}
      {data.keywordsData.cpcAnalysis && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>CPC & Profitability Analysis</span>
          </CardTitle>
          <CardDescription>
            Cost-per-click breakdown and ROI projections by match type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Type Analysis */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Match Type Performance</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {data.keywordsData.cpcAnalysis.matchTypes.map((type: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{type.type}</h5>
                    <Badge variant={type.roi > 250 ? 'default' : 'secondary'}>
                      {type.roi}% ROI
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg CPC:</span>
                      <span className="font-medium">${type.avgCPC}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conv Rate:</span>
                      <span className="font-medium">{type.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume:</span>
                      <span className="font-medium">{type.volume.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Simulator */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">PPC Budget Simulator</h4>
            <div className="space-y-3">
              {data.keywordsData.cpcAnalysis.budgetSimulator.map((sim: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-24">
                    <div className="text-lg font-semibold">${sim.budget.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Monthly Budget</div>
                  </div>
                  <div className="flex-grow grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Clicks:</span>
                      <span className="font-medium ml-1">{sim.expectedClicks.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orders:</span>
                      <span className="font-medium ml-1">{sim.expectedOrders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium ml-1">${sim.expectedRevenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit:</span>
                      <span className="font-medium text-green-600 ml-1">${sim.profit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bid Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Bid Recommendations</h4>
            <div className="space-y-2">
              {data.keywordsData.cpcAnalysis.bidRecommendations.map((rec: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div>
                    <div className="font-medium text-gray-900">{rec.keyword}</div>
                    <div className="text-sm text-gray-600">{rec.reason}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Current</div>
                      <div className="font-medium">${rec.currentCPC}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Recommended</div>
                      <div className="font-medium text-blue-600">${rec.recommendedBid}</div>
                    </div>
                    <Badge variant="secondary">
                      {rec.expectedROI}% ROI
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Keyword Opportunity Scoring */}
      {data.keywordsData.opportunityMatrix && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Keyword Opportunity Matrix</span>
          </CardTitle>
          <CardDescription>
            Multi-factor opportunity scoring for keyword prioritization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.keywordsData.opportunityMatrix.map((opp: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{opp.keyword}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Volume: {opp.searchVolume.toLocaleString()}</span>
                      <span>Competition: {opp.competition}</span>
                      <span>CPC: ${opp.cpc}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{opp.opportunityScore}</div>
                    <Badge 
                      variant={opp.actionPriority === 'immediate' ? 'default' : opp.actionPriority === 'high' ? 'secondary' : 'outline'}
                    >
                      {opp.actionPriority} priority
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Conversion Potential</div>
                    <Progress value={opp.conversionPotential * 7} className="h-2 mt-1" />
                    <div className="font-medium mt-1">{opp.conversionPotential}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Trend Momentum</div>
                    <Progress value={Math.min(opp.trendMomentum, 100)} className="h-2 mt-1" />
                    <div className="font-medium mt-1">+{opp.trendMomentum}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Competition Level</div>
                    <Progress 
                      value={opp.competition === 'low' ? 25 : opp.competition === 'medium' ? 50 : 75} 
                      className="h-2 mt-1" 
                    />
                    <div className="font-medium mt-1 capitalize">{opp.competition}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Overall Score</div>
                    <Progress value={opp.opportunityScore} className="h-2 mt-1" />
                    <div className="font-medium mt-1">{opp.opportunityScore}/100</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Keyword Network Visualization */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Keyword Network & Opportunities</span>
          </CardTitle>
          <CardDescription>
            Interactive visualization of keyword relationships and market opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[800px] overflow-hidden">
            <KeywordNetwork 
              keywordClusters={{
                technology: {
                  root: 'Sleep Technology',
                  subroots: Object.keys(data.keywordsData.keywordHierarchy['Sleep Technology'].subroots),
                  keywords: Object.values(data.keywordsData.keywordHierarchy['Sleep Technology'].subroots)
                    .flatMap((subroot: any) => subroot.keywords.slice(0, 3))
                    .map((k: any) => k.keyword)
                },
                comfort: {
                  root: 'Sleep Comfort',
                  subroots: Object.keys(data.keywordsData.keywordHierarchy['Sleep Comfort'].subroots),
                  keywords: Object.values(data.keywordsData.keywordHierarchy['Sleep Comfort'].subroots)
                    .flatMap((subroot: any) => subroot.keywords.slice(0, 3))
                    .map((k: any) => k.keyword)
                },
                audio: {
                  root: 'Audio Keywords',
                  subroots: ['Bluetooth Audio', 'Wireless Audio'],
                  keywords: ['bluetooth headphones sleep', 'wireless sleep speakers', 'audio sleep mask']
                },
                travel: {
                  root: 'Travel Keywords',
                  subroots: ['Portable Sleep', 'Travel Comfort'],
                  keywords: ['travel sleep mask', 'portable sleep headphones', 'airline sleep mask']
                }
              }}
              primaryKeyword={data.keywordsData.primaryKeyword}
              className="h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Long-tail Keywords */}
      {data.keywordsData.longTailKeywords && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <span>Long-tail Keyword Discovery</span>
          </CardTitle>
          <CardDescription>
            High-converting, low-competition keyword variations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {data.keywordsData.longTailKeywords.map((keyword: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900 mb-1">{keyword.keyword}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>Volume: {keyword.volume}</span>
                      <span>CPC: ${keyword.cpc}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={keyword.intent === 'transactional' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {keyword.intent}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Keyword Cannibalization Analysis */}
      {data.keywordsData.cannibalizationRisks && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Keyword Cannibalization Risks</span>
          </CardTitle>
          <CardDescription>
            Overlapping keywords that may compete against each other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.keywordsData.cannibalizationRisks.map((risk: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant={risk.risk === 'high' ? 'destructive' : 'default'}
                      >
                        {risk.risk} risk
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Affects {risk.affectedASINs} ASINs
                      </span>
                    </div>
                    <div className="space-y-1">
                      {risk.keywordGroup.map((keyword: string, i: number) => (
                        <span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm mr-2">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded text-sm">
                  <strong>Recommendation:</strong> {risk.recommendation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Amazon Search Terms Integration */}
      {searchTermsData && Array.isArray(searchTermsData) && searchTermsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Real-Time Amazon Search Data</span>
            </CardTitle>
            <CardDescription>
              Live search term data from Amazon's API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchTermsData.slice(0, 6).map((term: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
                  <div className="font-medium text-gray-900 mb-2">{term.keyword}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Search Volume:</span>
                      <span className="font-medium">{term.searchVolume?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Competition:</span>
                      <span className="font-medium">{term.competition || 'Medium'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPC:</span>
                      <span className="font-medium">${term.cpc || '1.25'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}