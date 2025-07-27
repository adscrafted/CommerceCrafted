'use client'

import React, { useState, useEffect } from 'react'
import KeywordNetwork from './KeywordNetwork'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScoreCard } from '@/components/ui/score-card'
import { Network, GitBranch, Share2, Target, TrendingUp, DollarSign, Hash } from 'lucide-react'

interface KeywordNetworkVisualizationProps {
  keywordHierarchy: any
  primaryKeyword: string
  minKeywordsPerRoot?: number
  minKeywordsPerSubRoot?: number
  onMinKeywordsPerRootChange?: (value: number) => void
  onMinKeywordsPerSubRootChange?: (value: number) => void
  productImageUrl?: string
}

export default function KeywordNetworkVisualization({ 
  keywordHierarchy, 
  primaryKeyword,
  minKeywordsPerRoot = 5,
  minKeywordsPerSubRoot = 5,
  onMinKeywordsPerRootChange,
  onMinKeywordsPerSubRootChange,
  productImageUrl
}: KeywordNetworkVisualizationProps) {
  const [activeLevel, setActiveLevel] = useState<'root' | 'subroot' | 'level2'>('root')
  const [networkData, setNetworkData] = useState<any>({})
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null)

  // Calculate overall market metrics from all keyword data
  const calculateOverallMetrics = () => {
    let totalRevenue = 0
    let totalKeywords = 0
    let totalRootKeywords = 0

    Object.values(keywordHierarchy || {}).forEach((rootData: any) => {
      totalRevenue += rootData.totalRevenue || 0
      totalKeywords += rootData.keywordCount || 0
      totalRootKeywords += 1 // Count each root keyword
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
  }, [keywordHierarchy, activeLevel, minKeywordsPerRoot, minKeywordsPerSubRoot])

  return (
    <div className="space-y-4">
      {/* Tab Navigation with Filters */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'root', label: 'Root Keywords', icon: Network },
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

      {/* Network Visualization */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-6">
          {/* Scorecards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(() => {
              const displayData = selectedNodeData || calculateOverallMetrics()
              const revenueValue = displayData.totalRevenue >= 1000000 
                ? '$' + (displayData.totalRevenue / 1000000).toFixed(2) + 'M'
                : displayData.totalRevenue >= 1000
                ? '$' + (displayData.totalRevenue / 1000).toFixed(0) + 'K'
                : '$' + (displayData.totalRevenue?.toFixed(0) || '0')
              
              const rootKeywordsValue = selectedNodeData && selectedNodeData.type === 'root' 
                ? '1' 
                : displayData.totalRootKeywords?.toLocaleString() || Object.keys(keywordHierarchy || {}).length.toLocaleString()
              
              return (
                <>
                  <ScoreCard
                    value={revenueValue}
                    label="Monthly Revenue"
                    icon={DollarSign}
                    description={selectedNodeData ? `For ${displayData.name}` : 'Across all keyword groups'}
                    color="green"
                  />
                  
                  <ScoreCard
                    value={rootKeywordsValue}
                    label="Total Root Keywords"
                    icon={Hash}
                    description={selectedNodeData ? 'Selected root keyword' : 'Primary keyword categories'}
                    color="purple"
                  />
                  
                  <ScoreCard
                    value={displayData.keywordCount?.toLocaleString() || '0'}
                    label="Total Keywords"
                    icon={TrendingUp}
                    description={selectedNodeData ? `In ${displayData.name}` : 'Unique keywords tracked'}
                    color="blue"
                  />
                </>
              )
            })()}
          </div>
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
  )
}