'use client'

import React, { useState, useEffect } from 'react'
import KeywordNetwork from './KeywordNetwork'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreCard } from '@/components/ui/score-card'
import { Network, GitBranch, Share2, Target, TrendingUp, DollarSign, Hash, Search } from 'lucide-react'

interface KeywordNetworkVisualizationProps {
  keywordHierarchy: any
  primaryKeyword: string
  minKeywordsPerRoot?: number
  minKeywordsPerSubRoot?: number
  onMinKeywordsPerRootChange?: (value: number) => void
  onMinKeywordsPerSubRootChange?: (value: number) => void
  productImageUrl?: string
  onMetricsCalculated?: (metrics: any) => void
}

export default function KeywordNetworkVisualization({ 
  keywordHierarchy, 
  primaryKeyword,
  minKeywordsPerRoot = 5,
  minKeywordsPerSubRoot = 5,
  onMinKeywordsPerRootChange,
  onMinKeywordsPerSubRootChange,
  productImageUrl,
  onMetricsCalculated
}: KeywordNetworkVisualizationProps) {
  const [activeLevel, setActiveLevel] = useState<'root' | 'subroot' | 'level2'>('root')
  const [networkData, setNetworkData] = useState<any>({})
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Calculate overall market metrics from all keyword data
  const calculateOverallMetrics = () => {
    let totalRevenue = 0
    let totalKeywords = 0
    let totalRootKeywords = 0

    // Only count roots that meet the minimum keyword threshold (same as visualization)
    Object.entries(keywordHierarchy || {}).forEach(([rootName, rootData]: [string, any]) => {
      if ((rootData.keywordCount || 0) >= minKeywordsPerRoot) {
        totalRevenue += rootData.totalRevenue || 0
        totalKeywords += rootData.keywordCount || 0
        totalRootKeywords += 1 // Count each root keyword that meets the threshold
      }
    })

    return {
      name: 'Entire Market',
      totalRevenue,
      keywordCount: totalKeywords,
      totalRootKeywords,
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
    // Check if this is the center/main node (primaryKeyword)
    if (nodeLabel === primaryKeyword) {
      // Reset to show overall market metrics
      setSelectedNodeData(null)
      return
    }
    
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
        .filter(([rootName, rootData]: [string, any]) => {
          // Filter by minimum keywords
          if ((rootData.keywordCount || 0) < minKeywordsPerRoot) return false
          // Filter by search term
          if (searchTerm && !rootName.toLowerCase().includes(searchTerm.toLowerCase())) return false
          return true
        })
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
        .filter(([rootName, rootData]: [string, any]) => {
          // Filter by minimum keywords
          if ((rootData.keywordCount || 0) < minKeywordsPerRoot) return false
          // Filter by search term (check both root and subroots)
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            const rootMatches = rootName.toLowerCase().includes(searchLower)
            const subrootMatches = Object.keys(rootData.subroots || {}).some(
              subrootName => subrootName.toLowerCase().includes(searchLower)
            )
            if (!rootMatches && !subrootMatches) return false
          }
          return true
        })
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
        // Filter and limit subroots - exclude subroots with same name as root
        const subroots = Object.keys(data.subroots || {})
          .filter(subrootName => 
            subrootName !== name && // Don't include subroots with same name as root
            (data.subroots[subrootName].keywordCount || data.subroots[subrootName].keywords?.length || 0) >= minKeywordsPerSubRoot
          )
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
  }, [keywordHierarchy, activeLevel, minKeywordsPerRoot, minKeywordsPerSubRoot, searchTerm])

  // Calculate and export metrics
  const overallMetrics = calculateOverallMetrics()
  const displayData = selectedNodeData || overallMetrics
  
  // Notify parent component of metrics
  useEffect(() => {
    if (onMetricsCalculated) {
      onMetricsCalculated({
        displayData,
        overallMetrics,
        selectedNodeData
      })
    }
  }, [selectedNodeData, keywordHierarchy])
  
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      {(onMinKeywordsPerRootChange || onMinKeywordsPerSubRootChange) && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            {/* Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              <span>Min Keywords Per Root:</span>
              <input
                type="number"
                min="0"
                value={minKeywordsPerRoot}
                onChange={(e) => onMinKeywordsPerRootChange?.(parseInt(e.target.value) || 0)}
                className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
              <span>Min Keywords Per Sub Root:</span>
              <input
                type="number"
                min="0"
                value={minKeywordsPerSubRoot}
                onChange={(e) => onMinKeywordsPerSubRootChange?.(parseInt(e.target.value) || 0)}
                className="w-12 text-sm font-medium text-gray-700 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Network Visualization */}
      <div className="bg-white rounded-lg border overflow-hidden">

        {/* Network Visualization Container */}
        <div className="relative">
          {/* Tab Navigation - Top Left of Chart */}
          <div className="absolute top-4 left-4 z-10 flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'root', label: 'Roots', icon: Network },
              { id: 'subroot', label: 'Subroots', icon: GitBranch },
              { id: 'level2', label: 'Sub Roots (Level 2)', icon: Share2 }
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

          {/* Network Visualization */}
          {Object.keys(networkData).length > 0 ? (
          <>
            {console.log('KeywordNetworkVisualization - Passing to KeywordNetwork:', {
              networkData,
              keywordHierarchy,
              activeLevel
            })}
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
              onLevelChange={setActiveLevel}
              selectedNodeData={selectedNodeData}
              overallMetrics={calculateOverallMetrics()}
              productImageUrl={productImageUrl}
              minKeywordsPerRoot={minKeywordsPerRoot}
              minKeywordsPerSubRoot={minKeywordsPerSubRoot}
              onMinKeywordsPerRootChange={onMinKeywordsPerRootChange}
              onMinKeywordsPerSubRootChange={onMinKeywordsPerSubRootChange}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          </>
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
      </div>

    </div>
  )
}