'use client'

import React, { useState, useEffect } from 'react'
import KeywordNetwork from './KeywordNetwork'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Network, GitBranch, Share2, Target, MousePointer, TrendingUp, DollarSign } from 'lucide-react'

interface KeywordNetworkVisualizationProps {
  keywordHierarchy: any
  primaryKeyword: string
  minKeywordsPerRoot?: number
  minKeywordsPerSubRoot?: number
  onMinKeywordsPerRootChange?: (value: number) => void
  onMinKeywordsPerSubRootChange?: (value: number) => void
}

export default function KeywordNetworkVisualization({ 
  keywordHierarchy, 
  primaryKeyword,
  minKeywordsPerRoot = 5,
  minKeywordsPerSubRoot = 5,
  onMinKeywordsPerRootChange,
  onMinKeywordsPerSubRootChange
}: KeywordNetworkVisualizationProps) {
  const [activeLevel, setActiveLevel] = useState<'root' | 'subroot' | 'level2'>('root')
  const [networkData, setNetworkData] = useState<any>({})
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null)

  // Calculate overall market metrics from all keyword data
  const calculateOverallMetrics = () => {
    let totalRevenue = 0
    let totalClicks = 0
    let totalOrders = 0
    let totalKeywords = 0
    let cpcSum = 0
    let cpcCount = 0
    let conversionRateSum = 0
    let conversionRateCount = 0

    Object.values(keywordHierarchy || {}).forEach((rootData: any) => {
      totalRevenue += rootData.totalRevenue || 0
      totalClicks += rootData.totalClicks || 0
      totalOrders += rootData.totalOrders || 0
      totalKeywords += rootData.keywordCount || 0
      
      const cpc = parseFloat(rootData.avgCPC || '0')
      if (cpc > 0) {
        cpcSum += cpc
        cpcCount++
      }
      
      const conversionRate = parseFloat(rootData.avgConversionRate || '0')
      if (conversionRate > 0) {
        conversionRateSum += conversionRate
        conversionRateCount++
      }
    })

    return {
      name: 'Entire Market',
      totalRevenue,
      avgCPC: cpcCount > 0 ? (cpcSum / cpcCount).toFixed(2) : '0.00',
      avgConversionRate: conversionRateCount > 0 ? (conversionRateSum / conversionRateCount).toFixed(0) : '0',
      keywordCount: totalKeywords,
      type: 'market'
    }
  }

  // Calculate relevancy score based on keyword metrics
  const calculateRelevancy = (nodeData: any) => {
    if (!nodeData) return 0
    
    const keywordCount = nodeData.keywordCount || 0
    const revenue = nodeData.totalRevenue || 0
    const cpc = parseFloat(nodeData.avgCPC || '0')
    const conversionRate = parseFloat(nodeData.avgConversionRate || '0')
    
    // Simple relevancy calculation - can be made more sophisticated
    let relevancyScore = 50 // Base score
    
    // Higher keyword count increases relevancy
    relevancyScore += Math.min(keywordCount * 0.5, 25)
    
    // Higher revenue increases relevancy  
    if (revenue > 10000) relevancyScore += 15
    else if (revenue > 5000) relevancyScore += 10
    else if (revenue > 1000) relevancyScore += 5
    
    // Reasonable CPC range increases relevancy
    if (cpc > 0.1 && cpc < 2.0) relevancyScore += 10
    
    // Higher conversion rate increases relevancy
    if (conversionRate > 10) relevancyScore += 10
    else if (conversionRate > 5) relevancyScore += 5
    
    return Math.min(Math.max(Math.round(relevancyScore), 0), 100)
  }

  // Handle node selection from KeywordNetwork
  const handleNodeClick = (nodeLabel: string) => {
    // Find the node data in keywordHierarchy
    let foundNodeData = null
    
    // Search in root level
    if (keywordHierarchy[nodeLabel]) {
      foundNodeData = {
        name: nodeLabel,
        type: 'root',
        ...keywordHierarchy[nodeLabel]
      }
    } else {
      // Search in subroots
      Object.entries(keywordHierarchy).forEach(([rootName, rootData]: [string, any]) => {
        if (rootData.subroots && rootData.subroots[nodeLabel]) {
          foundNodeData = {
            name: nodeLabel,
            type: 'subroot',
            ...rootData.subroots[nodeLabel]
          }
        }
      })
    }
    
    if (foundNodeData) {
      setSelectedNodeData(foundNodeData)
    }
  }

  useEffect(() => {
    // Transform the keyword hierarchy data based on the active level
    const transformedData: any = {}

    if (activeLevel === 'root') {
      // Show only top root keywords by total revenue/value
      const rootsWithMetrics = Object.entries(keywordHierarchy)
        .filter(([, rootData]: [string, any]) => (rootData.keywordCount || 0) >= minKeywordsPerRoot)
        .map(([rootName, rootData]: [string, any]) => ({
          name: rootName,
          data: rootData,
          totalKeywords: rootData.keywordCount || 0,
          totalRevenue: rootData.totalRevenue || 0,
          subrootCount: Object.keys(rootData.subroots || {}).length
        }))
      
      // Sort by total keywords and take top 15
      const topRoots = rootsWithMetrics
        .sort((a, b) => b.totalKeywords - a.totalKeywords)
        .slice(0, 15)
      
      topRoots.forEach(({ name, data }) => {
        transformedData[name] = {
          root: name,
          subroots: [], // No subroots shown
          keywords: []  // No keywords shown
        }
      })
    } else if (activeLevel === 'subroot') {
      // Show top root keywords connected to their subroots (no leaf keywords)
      const rootsWithMetrics = Object.entries(keywordHierarchy)
        .filter(([, rootData]: [string, any]) => (rootData.keywordCount || 0) >= minKeywordsPerRoot)
        .map(([rootName, rootData]: [string, any]) => ({
          name: rootName,
          data: rootData,
          totalKeywords: rootData.keywordCount || 0,
          subrootCount: Object.keys(rootData.subroots || {}).filter(
            subrootName => (rootData.subroots[subrootName].keywordCount || rootData.subroots[subrootName].keywords?.length || 0) >= minKeywordsPerSubRoot
          ).length
        }))
      
      // Sort by total keywords and take top 6 roots
      const topRoots = rootsWithMetrics
        .sort((a, b) => b.totalKeywords - a.totalKeywords)
        .slice(0, 6)
      
      topRoots.forEach(({ name, data }) => {
        // Filter and limit subroots
        const subroots = Object.keys(data.subroots || {})
          .filter(subrootName => (data.subroots[subrootName].keywordCount || data.subroots[subrootName].keywords?.length || 0) >= minKeywordsPerSubRoot)
          .slice(0, 8)
        
        transformedData[name] = {
          root: name,
          subroots: subroots,
          keywords: [] // No leaf keywords shown
        }
      })
    } else if (activeLevel === 'level2') {
      // Show subroots connected to level 2 subroots (3+ word phrases)
      const level2BySubroot: any = {}
      
      Object.entries(keywordHierarchy).forEach(([rootName, rootData]: [string, any]) => {
        Object.entries(rootData.subroots || {}).forEach(([subrootName, subrootData]: [string, any]) => {
          const level2Set = new Set<string>()
          
          subrootData.keywords?.forEach((kw: any) => {
            const words = kw.keyword.split(' ')
            if (words.length >= 3) {
              const level2Key = words.slice(0, 3).join(' ')
              level2Set.add(level2Key)
            }
          })
          
          if (level2Set.size > 0) {
            level2BySubroot[subrootName] = {
              root: subrootName,
              subroots: Array.from(level2Set).slice(0, 5), // Limit to 5 level 2 subroots per subroot
              keywords: []
            }
          }
        })
      })

      // Take top subroots by number of level 2 connections
      Object.entries(level2BySubroot)
        .sort(([, a]: any, [, b]: any) => b.subroots.length - a.subroots.length)
        .slice(0, 8)
        .forEach(([key, data]) => {
          transformedData[key] = data
        })
    }

    setNetworkData(transformedData)
  }, [keywordHierarchy, activeLevel, minKeywordsPerRoot, minKeywordsPerSubRoot])

  return (
    <div className="space-y-4">
      {/* Tab Navigation with Filters */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'root', label: 'Root Keywords', icon: Network },
            { id: 'subroot', label: 'Subroots', icon: GitBranch },
            { id: 'level2', label: 'Level 2 Subroots', icon: Share2 }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeLevel === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveLevel(tab.id as any)}
              className={`flex items-center space-x-2 ${
                activeLevel === tab.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Filter Controls */}
        {(onMinKeywordsPerRootChange || onMinKeywordsPerSubRootChange) && (
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              <span>Min Keywords Per Root:</span>
              <input
                type="number"
                min="1"
                value={minKeywordsPerRoot}
                onChange={(e) => onMinKeywordsPerRootChange?.(parseInt(e.target.value) || 1)}
                className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              <span>Min Keywords Per Sub Root:</span>
              <input
                type="number"
                min="1"
                value={minKeywordsPerSubRoot}
                onChange={(e) => onMinKeywordsPerSubRootChange?.(parseInt(e.target.value) || 1)}
                className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {(() => {
          const displayData = selectedNodeData || calculateOverallMetrics()
          return (
            <>
              {/* Monthly Revenue */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${displayData.totalRevenue >= 1000000 
                      ? (displayData.totalRevenue / 1000000).toFixed(2) + 'M'
                      : displayData.totalRevenue >= 1000
                      ? (displayData.totalRevenue / 1000).toFixed(0) + 'K'
                      : displayData.totalRevenue?.toFixed(0) || '0'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedNodeData ? `For ${displayData.name}` : 'Across all keyword groups'}
                  </p>
                </CardContent>
              </Card>

              {/* Average CPC */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MousePointer className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-medium text-gray-600">Average CPC</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${displayData.avgCPC || '0.00'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cost per click</p>
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {displayData.avgConversionRate 
                      ? parseFloat(displayData.avgConversionRate).toFixed(0) + '%'
                      : '0%'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click to order conversion</p>
                </CardContent>
              </Card>

              {/* Relevancy */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <h3 className="text-sm font-medium text-gray-600">
                      {selectedNodeData ? 'Relevancy' : 'Total Keywords'}
                    </h3>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedNodeData 
                      ? `${displayData.relevancy || calculateRelevancy(displayData)}%`
                      : displayData.keywordCount?.toLocaleString() || '0'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedNodeData ? 'Keyword relevance' : 'Unique keywords tracked'}
                  </p>
                </CardContent>
              </Card>
            </>
          )
        })()}
      </div>

      {/* Network Visualization */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {Object.keys(networkData).length > 0 ? (
          <KeywordNetwork
            keywordClusters={networkData}
            primaryKeyword={
              activeLevel === 'root' ? primaryKeyword :
              activeLevel === 'subroot' ? 'Keyword Subroots' :
              'Level 2 Keywords'
            }
            className="h-[700px]"
            nodeColorScheme={{
              center: '#1F2937',    // gray-800
              root: '#3B82F6',      // blue-500
              subroot: '#10B981',   // green-500
              level2: '#8B5CF6'     // purple-500
            }}
            revenueData={keywordHierarchy}
            currentLevel={activeLevel}
            onNodeClick={handleNodeClick}
          />
        ) : (
          <div className="h-[700px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Network className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No keyword data available for this level</p>
              <p className="text-sm mt-1">Try switching to a different level</p>
            </div>
          </div>
        )}
      </div>

      {/* Level Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">
          {activeLevel === 'root' && 'Root Keywords View'}
          {activeLevel === 'subroot' && 'Subroots View'}
          {activeLevel === 'level2' && 'Level 2 Subroots View'}
        </h4>
        <p className="text-sm text-blue-700">
          {activeLevel === 'root' && 'Shows only the root keywords connected to the center. Each node represents a high-level keyword category.'}
          {activeLevel === 'subroot' && 'Shows root keywords connected to their subroots (two-word combinations). No individual keywords are displayed.'}
          {activeLevel === 'level2' && 'Shows subroots connected to level 2 subroots (three-word phrases). Only the hierarchical structure is shown.'}
        </p>
      </div>
    </div>
  )
}