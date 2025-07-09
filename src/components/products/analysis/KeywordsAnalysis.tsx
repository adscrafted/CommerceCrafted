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
  Sparkles,
  Eye,
  List,
  Network,
  Activity
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
  const [activeTab, setActiveTab] = useState('overview')
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'hierarchy', label: 'Keyword Hierarchy', icon: List },
          { id: 'opportunities', label: 'Opportunities', icon: Lightbulb },
          { id: 'trending', label: 'Trending Keywords', icon: TrendingUp },
          { id: 'network', label: 'Keyword Network', icon: Network }
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

          {/* Top Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>Top Performing Keywords</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.demandData?.keywordMetrics?.topKeywords?.slice(0, 6).map((keyword: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="font-medium text-gray-900 mb-2">{keyword.keyword}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-medium">{keyword.searchVolume?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-medium">{keyword.orders?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">${keyword.revenue?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Growth:</span>
                        <Badge variant="secondary" className="text-xs">
                          {keyword.growth || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Keyword Hierarchy Pivot Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="h-5 w-5 text-blue-600" />
                <span>Keyword Hierarchy & Revenue Analysis</span>
              </CardTitle>
              <CardDescription>
                Hierarchical view of keyword groups and their revenue potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeywordPivotTable keywordHierarchy={data.keywordsData.keywordHierarchy} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          {/* Keyword Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>High Opportunity Keywords</span>
              </CardTitle>
              <CardDescription>
                Keywords with the best balance of search volume, competition, and ROI potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.keywordsData?.opportunityMatrix?.slice(0, 5).map((keyword: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-900">{keyword.keyword}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Volume: {keyword.searchVolume?.toLocaleString() || 'N/A'}</span>
                          <span>Competition: {keyword.competition || 'N/A'}</span>
                          <span>CPC: ${keyword.cpc || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{keyword.opportunityScore}</div>
                        <div className="text-xs text-gray-600">Opportunity Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-semibold text-blue-600">{keyword.trendMomentum || 'N/A'}%</div>
                        <div className="text-xs text-gray-600">Trend Momentum</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-semibold text-green-600">{keyword.conversionPotential || 'N/A'}%</div>
                        <div className="text-xs text-gray-600">Conv. Potential</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-lg font-semibold text-purple-600">{keyword.actionPriority || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Priority</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">Opportunity Score:</span>
                        <Progress value={keyword.opportunityScore || 0} className="w-24 h-2" />
                        <span className="text-sm font-medium">{keyword.opportunityScore || 0}%</span>
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

          {/* Long-tail Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span>Long-tail Keyword Opportunities</span>
              </CardTitle>
              <CardDescription>
                Lower competition keywords with specific buyer intent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {data.keywordsData?.longTailKeywords?.map((keyword: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="font-medium text-gray-900 mb-2">{keyword.keyword}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Volume: </span>
                        <span className="font-medium">{keyword.volume?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Competition: </span>
                        <span className="font-medium text-green-600">Low</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CPC: </span>
                        <span className="font-medium">${keyword.cpc || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Intent: </span>
                        <Badge variant="secondary" className="text-xs">{keyword.intent || 'N/A'}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trending Tab */}
      {activeTab === 'trending' && (
        <div className="space-y-6">
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

          {/* Seasonal Keywords */}
          {data.keywordsData.seasonalKeywords && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Seasonal Keyword Trends</span>
                </CardTitle>
                <CardDescription>
                  Keywords with strong seasonal patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.keywordsData.seasonalKeywords.map((keyword: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{keyword.keyword}</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold">{keyword.peak.month}</div>
                          <div className="text-xs text-gray-600">{keyword.peak.volume.toLocaleString()}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">Off-peak</div>
                          <div className="text-xs text-gray-600">{keyword.offPeak.volume.toLocaleString()}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold">{keyword.multiplier}x</div>
                          <div className="text-xs text-gray-600">Peak Multiplier</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-semibold">{keyword.nextPeak}</div>
                          <div className="text-xs text-gray-600">Next Peak</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          {/* Keyword Network Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-purple-600" />
                <span>Keyword Relationship Network</span>
              </CardTitle>
              <CardDescription>
                Visual representation of keyword relationships and clusters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full">
                <KeywordNetwork data={data.keywordsData.networkData} />
              </div>
            </CardContent>
          </Card>

          {/* Keyword Clusters */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Clusters</CardTitle>
              <CardDescription>
                Groups of related keywords that can be targeted together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {data.keywordsData?.keywordTierStrategy && Object.entries(data.keywordsData.keywordTierStrategy).map(([tier, data]: [string, any], index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {tier === 'tier1HighValue' ? 'Tier 1: High Value' : 
                       tier === 'tier2Moderate' ? 'Tier 2: Moderate' : 
                       'Tier 3: Discovery'}
                    </h4>
                    <div className="text-sm text-gray-600 mb-3">
                      {data.keywords?.length || 0} keywords • Avg CPC: ${data.averageCpc || 'N/A'} • ROI: {data.expectedRoi || 'N/A'}%
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{data.strategy}</p>
                    <div className="flex flex-wrap gap-2">
                      {data.keywords?.slice(0, 5).map((keyword: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {data.keywords?.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{data.keywords.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Amazon Search Data - Always show if available */}
      {searchTermsData && searchTermsData.length > 0 && (
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