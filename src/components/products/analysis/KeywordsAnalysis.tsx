'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  ChevronDown,
  ArrowRight,
  BarChart3,
  Lightbulb
} from 'lucide-react'
import KeywordNetwork from '@/components/KeywordNetwork'

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
            <CardTitle className="text-sm">Competition Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-yellow-600 mb-1">
              {data.keywordsData.competition}
            </div>
            <div className="text-sm text-gray-600">
              PPC Competition
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
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600 mb-1">
              {Object.values(data.keywordsData.keywordHierarchy).reduce((sum: number, root: any) => sum + root.totalOrders, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Monthly Potential
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Keyword Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Keyword Network & Opportunities</span>
          </CardTitle>
          <CardDescription>
            Interactive visualization of keyword relationships and market opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <KeywordNetwork />
          </div>
        </CardContent>
      </Card>

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