'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Target,
  Zap,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Info,
  TrendingUp,
  Hash,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  Users
} from 'lucide-react'

interface KeywordNode {
  id: string
  label: string
  type: 'root' | 'subroot' | 'keyword' | 'longtail'
  searchVolume: number
  competition: number
  cpc: number
  difficulty: number
  intent: 'commercial' | 'informational' | 'navigational' | 'transactional'
  seasonality: number
  trendDirection: 'rising' | 'stable' | 'declining'
  connections: string[]
  position?: { x: number; y: number }
  color?: string
  size?: number
  relevanceScore?: number
}

interface KeywordEdge {
  id: string
  source: string
  target: string
  weight: number
  type: 'semantic' | 'search_related' | 'category' | 'intent'
  strength: number
}

interface KeywordGraphData {
  nodes: KeywordNode[]
  edges: KeywordEdge[]
  metadata: {
    rootKeyword: string
    totalNodes: number
    totalVolume: number
    avgCompetition: number
    categoryDistribution: Record<string, number>
  }
}

interface KeywordGraphVisualizationProps {
  keyword: string
  category?: string
  className?: string
  onNodeSelect?: (node: KeywordNode) => void
  onNodeAnalyze?: (nodeId: string) => void
}

export default function KeywordGraphVisualization({
  keyword,
  category = 'Electronics',
  className,
  onNodeSelect,
  onNodeAnalyze
}: KeywordGraphVisualizationProps) {
  const [graphData, setGraphData] = useState<KeywordGraphData | null>(null)
  const [selectedNode, setSelectedNode] = useState<KeywordNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<KeywordNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('graph')
  const [showLabels, setShowLabels] = useState(true)
  const [showEdges, setShowEdges] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [isAnimating, setIsAnimating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    generateKeywordGraph()
  }, [keyword, category])

  const generateKeywordGraph = async () => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate comprehensive keyword graph data
      const mockGraphData: KeywordGraphData = {
        nodes: [
          // Root keyword
          {
            id: 'root_1',
            label: keyword,
            type: 'root',
            searchVolume: 45000,
            competition: 75,
            cpc: 1.25,
            difficulty: 65,
            intent: 'commercial',
            seasonality: 1.3,
            trendDirection: 'rising',
            connections: ['sub_1', 'sub_2', 'sub_3'],
            position: { x: 400, y: 300 },
            color: '#3B82F6',
            size: 40,
            relevanceScore: 100
          },
          
          // Sub-root keywords
          {
            id: 'sub_1',
            label: `${keyword} wireless`,
            type: 'subroot',
            searchVolume: 28000,
            competition: 68,
            cpc: 1.15,
            difficulty: 58,
            intent: 'commercial',
            seasonality: 1.2,
            trendDirection: 'rising',
            connections: ['kw_1', 'kw_2', 'kw_3'],
            position: { x: 200, y: 150 },
            color: '#10B981',
            size: 30,
            relevanceScore: 85
          },
          {
            id: 'sub_2',
            label: `best ${keyword}`,
            type: 'subroot',
            searchVolume: 32000,
            competition: 72,
            cpc: 1.35,
            difficulty: 62,
            intent: 'commercial',
            seasonality: 1.4,
            trendDirection: 'stable',
            connections: ['kw_4', 'kw_5', 'kw_6'],
            position: { x: 600, y: 150 },
            color: '#10B981',
            size: 32,
            relevanceScore: 90
          },
          {
            id: 'sub_3',
            label: `${keyword} review`,
            type: 'subroot',
            searchVolume: 18000,
            competition: 45,
            cpc: 0.85,
            difficulty: 42,
            intent: 'informational',
            seasonality: 1.1,
            trendDirection: 'rising',
            connections: ['kw_7', 'kw_8'],
            position: { x: 400, y: 500 },
            color: '#10B981',
            size: 25,
            relevanceScore: 75
          },
          
          // Main keywords
          {
            id: 'kw_1',
            label: `${keyword} bluetooth`,
            type: 'keyword',
            searchVolume: 15000,
            competition: 55,
            cpc: 0.95,
            difficulty: 48,
            intent: 'commercial',
            seasonality: 1.1,
            trendDirection: 'rising',
            connections: ['lt_1', 'lt_2'],
            position: { x: 100, y: 80 },
            color: '#8B5CF6',
            size: 20,
            relevanceScore: 80
          },
          {
            id: 'kw_2',
            label: `${keyword} noise cancelling`,
            type: 'keyword',
            searchVolume: 22000,
            competition: 65,
            cpc: 1.45,
            difficulty: 55,
            intent: 'commercial',
            seasonality: 1.2,
            trendDirection: 'rising',
            connections: ['lt_3', 'lt_4'],
            position: { x: 150, y: 220 },
            color: '#8B5CF6',
            size: 22,
            relevanceScore: 85
          },
          {
            id: 'kw_3',
            label: `${keyword} gaming`,
            type: 'keyword',
            searchVolume: 12000,
            competition: 58,
            cpc: 1.05,
            difficulty: 52,
            intent: 'commercial',
            seasonality: 1.3,
            trendDirection: 'stable',
            connections: ['lt_5'],
            position: { x: 300, y: 80 },
            color: '#8B5CF6',
            size: 18,
            relevanceScore: 70
          },
          {
            id: 'kw_4',
            label: `${keyword} under 100`,
            type: 'keyword',
            searchVolume: 19000,
            competition: 62,
            cpc: 1.25,
            difficulty: 58,
            intent: 'commercial',
            seasonality: 1.5,
            trendDirection: 'rising',
            connections: ['lt_6', 'lt_7'],
            position: { x: 700, y: 80 },
            color: '#8B5CF6',
            size: 21,
            relevanceScore: 88
          },
          {
            id: 'kw_5',
            label: `${keyword} 2024`,
            type: 'keyword',
            searchVolume: 25000,
            competition: 68,
            cpc: 1.55,
            difficulty: 65,
            intent: 'commercial',
            seasonality: 1.8,
            trendDirection: 'rising',
            connections: ['lt_8', 'lt_9'],
            position: { x: 650, y: 220 },
            color: '#8B5CF6',
            size: 24,
            relevanceScore: 92
          },
          {
            id: 'kw_6',
            label: `top ${keyword}`,
            type: 'keyword',
            searchVolume: 14000,
            competition: 58,
            cpc: 1.15,
            difficulty: 55,
            intent: 'informational',
            seasonality: 1.2,
            trendDirection: 'stable',
            connections: ['lt_10'],
            position: { x: 750, y: 150 },
            color: '#8B5CF6',
            size: 19,
            relevanceScore: 75
          },
          {
            id: 'kw_7',
            label: `${keyword} comparison`,
            type: 'keyword',
            searchVolume: 8500,
            competition: 42,
            cpc: 0.75,
            difficulty: 38,
            intent: 'informational',
            seasonality: 1.0,
            trendDirection: 'stable',
            connections: ['lt_11'],
            position: { x: 350, y: 580 },
            color: '#8B5CF6',
            size: 16,
            relevanceScore: 65
          },
          {
            id: 'kw_8',
            label: `${keyword} vs`,
            type: 'keyword',
            searchVolume: 11000,
            competition: 48,
            cpc: 0.85,
            difficulty: 45,
            intent: 'informational',
            seasonality: 1.1,
            trendDirection: 'rising',
            connections: ['lt_12'],
            position: { x: 450, y: 580 },
            color: '#8B5CF6',
            size: 17,
            relevanceScore: 70
          },
          
          // Long-tail keywords
          {
            id: 'lt_1',
            label: `cheap ${keyword} bluetooth`,
            type: 'longtail',
            searchVolume: 3200,
            competition: 35,
            cpc: 0.65,
            difficulty: 28,
            intent: 'commercial',
            seasonality: 1.2,
            trendDirection: 'rising',
            connections: [],
            position: { x: 50, y: 30 },
            color: '#F59E0B',
            size: 12,
            relevanceScore: 60
          },
          {
            id: 'lt_2',
            label: `${keyword} bluetooth under 50`,
            type: 'longtail',
            searchVolume: 2800,
            competition: 32,
            cpc: 0.55,
            difficulty: 25,
            intent: 'commercial',
            seasonality: 1.3,
            trendDirection: 'rising',
            connections: [],
            position: { x: 120, y: 20 },
            color: '#F59E0B',
            size: 11,
            relevanceScore: 58
          },
          {
            id: 'lt_3',
            label: `${keyword} active noise cancellation`,
            type: 'longtail',
            searchVolume: 4500,
            competition: 45,
            cpc: 1.15,
            difficulty: 38,
            intent: 'commercial',
            seasonality: 1.1,
            trendDirection: 'stable',
            connections: [],
            position: { x: 80, y: 280 },
            color: '#F59E0B',
            size: 14,
            relevanceScore: 68
          },
          {
            id: 'lt_4',
            label: `${keyword} noise cancelling review`,
            type: 'longtail',
            searchVolume: 3800,
            competition: 38,
            cpc: 0.95,
            difficulty: 32,
            intent: 'informational',
            seasonality: 1.0,
            trendDirection: 'stable',
            connections: [],
            position: { x: 180, y: 320 },
            color: '#F59E0B',
            size: 13,
            relevanceScore: 62
          },
          {
            id: 'lt_5',
            label: `${keyword} gaming rgb`,
            type: 'longtail',
            searchVolume: 2400,
            competition: 42,
            cpc: 0.85,
            difficulty: 35,
            intent: 'commercial',
            seasonality: 1.4,
            trendDirection: 'rising',
            connections: [],
            position: { x: 350, y: 20 },
            color: '#F59E0B',
            size: 10,
            relevanceScore: 55
          },
          {
            id: 'lt_6',
            label: `best budget ${keyword} under 100`,
            type: 'longtail',
            searchVolume: 5200,
            competition: 48,
            cpc: 1.05,
            difficulty: 42,
            intent: 'commercial',
            seasonality: 1.6,
            trendDirection: 'rising',
            connections: [],
            position: { x: 780, y: 30 },
            color: '#F59E0B',
            size: 15,
            relevanceScore: 72
          },
          {
            id: 'lt_7',
            label: `${keyword} under 100 dollars best`,
            type: 'longtail',
            searchVolume: 4800,
            competition: 45,
            cpc: 0.95,
            difficulty: 38,
            intent: 'commercial',
            seasonality: 1.5,
            trendDirection: 'rising',
            connections: [],
            position: { x: 750, y: 120 },
            color: '#F59E0B',
            size: 14,
            relevanceScore: 70
          },
          {
            id: 'lt_8',
            label: `best ${keyword} 2024 review`,
            type: 'longtail',
            searchVolume: 6200,
            competition: 52,
            cpc: 1.25,
            difficulty: 48,
            intent: 'informational',
            seasonality: 2.0,
            trendDirection: 'rising',
            connections: [],
            position: { x: 720, y: 280 },
            color: '#F59E0B',
            size: 16,
            relevanceScore: 78
          },
          {
            id: 'lt_9',
            label: `${keyword} 2024 buying guide`,
            type: 'longtail',
            searchVolume: 3600,
            competition: 38,
            cpc: 0.85,
            difficulty: 32,
            intent: 'informational',
            seasonality: 1.8,
            trendDirection: 'rising',
            connections: [],
            position: { x: 620, y: 320 },
            color: '#F59E0B',
            size: 13,
            relevanceScore: 65
          },
          {
            id: 'lt_10',
            label: `top 10 ${keyword} list`,
            type: 'longtail',
            searchVolume: 2800,
            competition: 42,
            cpc: 0.75,
            difficulty: 35,
            intent: 'informational',
            seasonality: 1.1,
            trendDirection: 'stable',
            connections: [],
            position: { x: 820, y: 180 },
            color: '#F59E0B',
            size: 11,
            relevanceScore: 58
          },
          {
            id: 'lt_11',
            label: `${keyword} comparison chart`,
            type: 'longtail',
            searchVolume: 1800,
            competition: 28,
            cpc: 0.45,
            difficulty: 22,
            intent: 'informational',
            seasonality: 0.9,
            trendDirection: 'stable',
            connections: [],
            position: { x: 280, y: 640 },
            color: '#F59E0B',
            size: 9,
            relevanceScore: 48
          },
          {
            id: 'lt_12',
            label: `${keyword} vs airpods comparison`,
            type: 'longtail',
            searchVolume: 3400,
            competition: 45,
            cpc: 0.95,
            difficulty: 38,
            intent: 'informational',
            seasonality: 1.2,
            trendDirection: 'rising',
            connections: [],
            position: { x: 520, y: 640 },
            color: '#F59E0B',
            size: 12,
            relevanceScore: 62
          }
        ],
        edges: [
          // Root to subroots
          { id: 'e1', source: 'root_1', target: 'sub_1', weight: 0.9, type: 'semantic', strength: 90 },
          { id: 'e2', source: 'root_1', target: 'sub_2', weight: 0.85, type: 'semantic', strength: 85 },
          { id: 'e3', source: 'root_1', target: 'sub_3', weight: 0.7, type: 'intent', strength: 70 },
          
          // Subroots to keywords
          { id: 'e4', source: 'sub_1', target: 'kw_1', weight: 0.8, type: 'semantic', strength: 80 },
          { id: 'e5', source: 'sub_1', target: 'kw_2', weight: 0.85, type: 'semantic', strength: 85 },
          { id: 'e6', source: 'sub_1', target: 'kw_3', weight: 0.7, type: 'category', strength: 70 },
          { id: 'e7', source: 'sub_2', target: 'kw_4', weight: 0.9, type: 'intent', strength: 90 },
          { id: 'e8', source: 'sub_2', target: 'kw_5', weight: 0.85, type: 'semantic', strength: 85 },
          { id: 'e9', source: 'sub_2', target: 'kw_6', weight: 0.75, type: 'intent', strength: 75 },
          { id: 'e10', source: 'sub_3', target: 'kw_7', weight: 0.8, type: 'intent', strength: 80 },
          { id: 'e11', source: 'sub_3', target: 'kw_8', weight: 0.75, type: 'intent', strength: 75 },
          
          // Keywords to long-tail
          { id: 'e12', source: 'kw_1', target: 'lt_1', weight: 0.7, type: 'semantic', strength: 70 },
          { id: 'e13', source: 'kw_1', target: 'lt_2', weight: 0.65, type: 'semantic', strength: 65 },
          { id: 'e14', source: 'kw_2', target: 'lt_3', weight: 0.8, type: 'semantic', strength: 80 },
          { id: 'e15', source: 'kw_2', target: 'lt_4', weight: 0.6, type: 'intent', strength: 60 },
          { id: 'e16', source: 'kw_3', target: 'lt_5', weight: 0.75, type: 'category', strength: 75 },
          { id: 'e17', source: 'kw_4', target: 'lt_6', weight: 0.85, type: 'semantic', strength: 85 },
          { id: 'e18', source: 'kw_4', target: 'lt_7', weight: 0.8, type: 'semantic', strength: 80 },
          { id: 'e19', source: 'kw_5', target: 'lt_8', weight: 0.9, type: 'semantic', strength: 90 },
          { id: 'e20', source: 'kw_5', target: 'lt_9', weight: 0.7, type: 'intent', strength: 70 },
          { id: 'e21', source: 'kw_6', target: 'lt_10', weight: 0.8, type: 'intent', strength: 80 },
          { id: 'e22', source: 'kw_7', target: 'lt_11', weight: 0.75, type: 'intent', strength: 75 },
          { id: 'e23', source: 'kw_8', target: 'lt_12', weight: 0.85, type: 'semantic', strength: 85 },
          
          // Cross-connections (related keywords)
          { id: 'e24', source: 'kw_1', target: 'kw_2', weight: 0.6, type: 'semantic', strength: 60 },
          { id: 'e25', source: 'kw_4', target: 'kw_5', weight: 0.7, type: 'intent', strength: 70 },
          { id: 'e26', source: 'kw_7', target: 'kw_8', weight: 0.8, type: 'intent', strength: 80 }
        ],
        metadata: {
          rootKeyword: keyword,
          totalNodes: 22,
          totalVolume: 285800,
          avgCompetition: 52.3,
          categoryDistribution: {
            commercial: 16,
            informational: 6
          }
        }
      }

      setGraphData(mockGraphData)
    } catch (error) {
      console.error('Failed to generate keyword graph:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNodeClick = (node: KeywordNode) => {
    setSelectedNode(node)
    onNodeSelect?.(node)
  }

  const handleNodeDoubleClick = (nodeId: string) => {
    onNodeAnalyze?.(nodeId)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'root': return <Circle className="h-4 w-4" />
      case 'subroot': return <Hexagon className="h-4 w-4" />
      case 'keyword': return <Square className="h-4 w-4" />
      case 'longtail': return <Triangle className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'commercial': return 'bg-green-100 text-green-800'
      case 'informational': return 'bg-blue-100 text-blue-800'
      case 'navigational': return 'bg-purple-100 text-purple-800'
      case 'transactional': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  const filteredNodes = graphData?.nodes.filter(node => {
    if (filterType === 'all') return true
    return node.type === filterType
  })

  const filteredEdges = graphData?.edges.filter(edge => {
    if (!filteredNodes) return false
    const sourceExists = filteredNodes.some(node => node.id === edge.source)
    const targetExists = filteredNodes.some(node => node.id === edge.target)
    return sourceExists && targetExists
  })

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!graphData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Failed to load keyword graph data</p>
            <Button className="mt-2" onClick={generateKeywordGraph}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Target className="h-6 w-6 mr-2 text-blue-600" />
                Keyword Graph Visualization
              </CardTitle>
              <CardDescription>
                Interactive keyword relationship mapping for "{keyword}" - roots, subroots, and semantic connections
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={generateKeywordGraph}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="graph">Interactive Graph</TabsTrigger>
          <TabsTrigger value="analysis">Network Analysis</TabsTrigger>
          <TabsTrigger value="insights">Keyword Insights</TabsTrigger>
          <TabsTrigger value="export">Export & Tools</TabsTrigger>
        </TabsList>

        {/* Interactive Graph Tab */}
        <TabsContent value="graph" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All Nodes</option>
                      <option value="root">Root Keywords</option>
                      <option value="subroot">Sub-Root Keywords</option>
                      <option value="keyword">Main Keywords</option>
                      <option value="longtail">Long-tail Keywords</option>
                    </select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLabels(!showLabels)}
                  >
                    {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Labels
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEdges(!showEdges)}
                  >
                    {showEdges ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Connections
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAnimating(!isAnimating)}
                  >
                    {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    Animation
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {filteredNodes?.length || 0} nodes, {filteredEdges?.length || 0} connections
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Graph Visualization */}
          <Card className={isFullscreen ? 'fixed inset-0 z-50' : ''}>
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className={`relative bg-gray-50 border rounded-lg overflow-hidden ${
                  isFullscreen ? 'h-screen' : 'h-96 lg:h-[600px]'
                }`}
              >
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  className="w-full h-full"
                >
                  {/* Background grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Edges */}
                  {showEdges && filteredEdges?.map(edge => {
                    const sourceNode = filteredNodes?.find(n => n.id === edge.source)
                    const targetNode = filteredNodes?.find(n => n.id === edge.target)
                    if (!sourceNode || !targetNode || !sourceNode.position || !targetNode.position) return null

                    return (
                      <line
                        key={edge.id}
                        x1={sourceNode.position.x}
                        y1={sourceNode.position.y}
                        x2={targetNode.position.x}
                        y2={targetNode.position.y}
                        stroke={
                          edge.type === 'semantic' ? '#3B82F6' :
                          edge.type === 'intent' ? '#10B981' :
                          edge.type === 'category' ? '#8B5CF6' :
                          '#6B7280'
                        }
                        strokeWidth={edge.strength / 20}
                        strokeOpacity={0.6}
                        className={isAnimating ? 'animate-pulse' : ''}
                      />
                    )
                  })}

                  {/* Nodes */}
                  {filteredNodes?.map(node => {
                    if (!node.position) return null

                    return (
                      <g key={node.id}>
                        <circle
                          cx={node.position.x}
                          cy={node.position.y}
                          r={node.size || 15}
                          fill={node.color || '#3B82F6'}
                          stroke={selectedNode?.id === node.id ? '#1F2937' : '#FFFFFF'}
                          strokeWidth={selectedNode?.id === node.id ? 3 : 2}
                          className="cursor-pointer hover:stroke-gray-700 transition-all duration-200"
                          onClick={() => handleNodeClick(node)}
                          onDoubleClick={() => handleNodeDoubleClick(node.id)}
                          onMouseEnter={() => setHoveredNode(node)}
                          onMouseLeave={() => setHoveredNode(null)}
                        />
                        
                        {showLabels && (
                          <text
                            x={node.position.x}
                            y={node.position.y + (node.size || 15) + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#374151"
                            className="pointer-events-none select-none"
                          >
                            {node.label.length > 20 ? `${node.label.substring(0, 20)}...` : node.label}
                          </text>
                        )}
                        
                        {(hoveredNode?.id === node.id || selectedNode?.id === node.id) && (
                          <g>
                            <rect
                              x={node.position.x - 60}
                              y={node.position.y - (node.size || 15) - 45}
                              width="120"
                              height="35"
                              fill="rgba(0,0,0,0.8)"
                              rx="4"
                              className="pointer-events-none"
                            />
                            <text
                              x={node.position.x}
                              y={node.position.y - (node.size || 15) - 30}
                              textAnchor="middle"
                              fontSize="10"
                              fill="white"
                              className="pointer-events-none"
                            >
                              {formatNumber(node.searchVolume)} searches
                            </text>
                            <text
                              x={node.position.x}
                              y={node.position.y - (node.size || 15) - 18}
                              textAnchor="middle"
                              fontSize="10"
                              fill="white"
                              className="pointer-events-none"
                            >
                              {node.competition}% competition
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}
                </svg>

                {/* Legend */}
                <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm border">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span>Root Keywords</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>Sub-Root Keywords</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                      <span>Main Keywords</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span>Long-tail Keywords</span>
                    </div>
                  </div>
                </div>

                {/* Node Info Panel */}
                {selectedNode && (
                  <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        {getNodeIcon(selectedNode.type)}
                        <span className="ml-2 capitalize">{selectedNode.type}</span>
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                        ×
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">{selectedNode.label}</h5>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Volume:</span>
                          <span className="ml-1 font-medium">{formatNumber(selectedNode.searchVolume)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">CPC:</span>
                          <span className="ml-1 font-medium">${selectedNode.cpc}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Competition:</span>
                          <span className="ml-1 font-medium">{selectedNode.competition}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Difficulty:</span>
                          <span className="ml-1 font-medium">{selectedNode.difficulty}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getIntentColor(selectedNode.intent)} variant="secondary">
                          {selectedNode.intent}
                        </Badge>
                        <div className="flex items-center">
                          {getTrendIcon(selectedNode.trendDirection)}
                          <span className="text-xs ml-1 capitalize">{selectedNode.trendDirection}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" onClick={() => handleNodeDoubleClick(selectedNode.id)}>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analyze
                        </Button>
                        <Button size="sm" variant="outline">
                          <Search className="h-3 w-3 mr-1" />
                          Research
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{graphData.metadata.totalNodes}</div>
                <div className="text-sm text-gray-600">Total Keywords</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{formatNumber(graphData.metadata.totalVolume)}</div>
                <div className="text-sm text-gray-600">Total Search Volume</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{graphData.metadata.avgCompetition.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Avg Competition</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{graphData.edges.length}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </CardContent>
            </Card>
          </div>

          {/* Network Structure Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keyword Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries({
                    root: graphData.nodes.filter(n => n.type === 'root').length,
                    subroot: graphData.nodes.filter(n => n.type === 'subroot').length,
                    keyword: graphData.nodes.filter(n => n.type === 'keyword').length,
                    longtail: graphData.nodes.filter(n => n.type === 'longtail').length
                  }).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getNodeIcon(type)}
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${(count / graphData.metadata.totalNodes) * 100}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intent Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(graphData.metadata.categoryDistribution).map(([intent, count]) => (
                    <div key={intent} className="flex justify-between items-center">
                      <span className="capitalize">{intent}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{width: `${(count / graphData.metadata.totalNodes) * 100}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Keywords by Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="volume" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="volume">By Volume</TabsTrigger>
                  <TabsTrigger value="competition">By Competition</TabsTrigger>
                  <TabsTrigger value="cpc">By CPC</TabsTrigger>
                  <TabsTrigger value="relevance">By Relevance</TabsTrigger>
                </TabsList>
                
                <TabsContent value="volume">
                  <div className="space-y-2">
                    {graphData.nodes
                      .sort((a, b) => b.searchVolume - a.searchVolume)
                      .slice(0, 5)
                      .map((node, index) => (
                        <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            {getNodeIcon(node.type)}
                            <span className="text-sm">{node.label}</span>
                          </div>
                          <span className="text-sm font-medium">{formatNumber(node.searchVolume)}</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="competition">
                  <div className="space-y-2">
                    {graphData.nodes
                      .sort((a, b) => a.competition - b.competition)
                      .slice(0, 5)
                      .map((node, index) => (
                        <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            {getNodeIcon(node.type)}
                            <span className="text-sm">{node.label}</span>
                          </div>
                          <span className="text-sm font-medium">{node.competition}%</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="cpc">
                  <div className="space-y-2">
                    {graphData.nodes
                      .sort((a, b) => b.cpc - a.cpc)
                      .slice(0, 5)
                      .map((node, index) => (
                        <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            {getNodeIcon(node.type)}
                            <span className="text-sm">{node.label}</span>
                          </div>
                          <span className="text-sm font-medium">${node.cpc}</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="relevance">
                  <div className="space-y-2">
                    {graphData.nodes
                      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
                      .slice(0, 5)
                      .map((node, index) => (
                        <div key={node.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            {getNodeIcon(node.type)}
                            <span className="text-sm">{node.label}</span>
                          </div>
                          <span className="text-sm font-medium">{node.relevanceScore || 0}%</span>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyword Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  Rising Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {graphData.nodes
                    .filter(node => node.trendDirection === 'rising')
                    .sort((a, b) => b.searchVolume - a.searchVolume)
                    .slice(0, 5)
                    .map((node, index) => (
                      <div key={node.id} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-900">{node.label}</h4>
                          <Badge className="bg-green-100 text-green-800">Rising</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-green-600">Volume:</span>
                            <span className="ml-1 font-medium">{formatNumber(node.searchVolume)}</span>
                          </div>
                          <div>
                            <span className="text-green-600">Competition:</span>
                            <span className="ml-1 font-medium">{node.competition}%</span>
                          </div>
                          <div>
                            <span className="text-green-600">CPC:</span>
                            <span className="ml-1 font-medium">${node.cpc}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Low Competition Gems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {graphData.nodes
                    .filter(node => node.competition < 40)
                    .sort((a, b) => b.searchVolume - a.searchVolume)
                    .slice(0, 5)
                    .map((node, index) => (
                      <div key={node.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-900">{node.label}</h4>
                          <Badge className="bg-blue-100 text-blue-800">Low Comp</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-blue-600">Volume:</span>
                            <span className="ml-1 font-medium">{formatNumber(node.searchVolume)}</span>
                          </div>
                          <div>
                            <span className="text-blue-600">Competition:</span>
                            <span className="ml-1 font-medium">{node.competition}%</span>
                          </div>
                          <div>
                            <span className="text-blue-600">Difficulty:</span>
                            <span className="ml-1 font-medium">{node.difficulty}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Long-tail Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Hash className="h-5 w-5 text-purple-600 mr-2" />
                Long-tail Keyword Opportunities
              </CardTitle>
              <CardDescription>
                High-potential long-tail keywords with lower competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {graphData.nodes
                  .filter(node => node.type === 'longtail')
                  .sort((a, b) => b.searchVolume - a.searchVolume)
                  .map((node, index) => (
                    <div key={node.id} className="p-4 border rounded-lg bg-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-purple-900">{node.label}</h4>
                        <Badge className={getIntentColor(node.intent)}>
                          {node.intent}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-purple-600">Volume:</span>
                          <span className="ml-1 font-medium">{formatNumber(node.searchVolume)}</span>
                        </div>
                        <div>
                          <span className="text-purple-600">CPC:</span>
                          <span className="ml-1 font-medium">${node.cpc}</span>
                        </div>
                        <div>
                          <span className="text-purple-600">Competition:</span>
                          <span className="ml-1 font-medium">{node.competition}%</span>
                        </div>
                        <div>
                          <span className="text-purple-600">Difficulty:</span>
                          <span className="ml-1 font-medium">{node.difficulty}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                          {getTrendIcon(node.trendDirection)}
                          <span className="text-xs ml-1 capitalize">{node.trendDirection}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Search className="h-3 w-3 mr-1" />
                          Research
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export & Tools Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Download className="h-5 w-5 text-blue-600 mr-2" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Graph Image (SVG)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Graph Image (PNG)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report (PDF)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 text-gray-600 mr-2" />
                  Graph Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Layout Algorithm</label>
                  <select className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Force-directed</option>
                    <option>Hierarchical</option>
                    <option>Circular</option>
                    <option>Grid</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Edge Weight Threshold</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Node Size Factor</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    defaultValue="1"
                    className="w-full mt-1"
                  />
                </div>
                
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Graph Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Graph Statistics & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Network Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Graph Density</span>
                      <span className="font-medium">0.42</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Clustering</span>
                      <span className="font-medium">0.67</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Path Length</span>
                      <span className="font-medium">4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Central Node</span>
                      <span className="font-medium">{keyword}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Keyword Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Volume</span>
                      <span className="font-medium">{formatNumber(graphData.metadata.totalVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg CPC</span>
                      <span className="font-medium">$1.02</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Difficulty</span>
                      <span className="font-medium">43.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commercial Intent</span>
                      <span className="font-medium">73%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Opportunities</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rising Keywords</span>
                      <span className="font-medium text-green-600">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Competition</span>
                      <span className="font-medium text-blue-600">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Volume</span>
                      <span className="font-medium text-purple-600">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quick Wins</span>
                      <span className="font-medium text-orange-600">6</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}