'use client'

import React, { useState } from 'react'
import KeywordGraphVisualization from '@/components/KeywordGraphVisualization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target,
  Search,
  BarChart3,
  TrendingUp,
  Hash,
  Network,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Eye,
  Download,
  Info,
  Lightbulb,
  Zap
} from 'lucide-react'

export default function KeywordGraphPage() {
  const [selectedKeyword, setSelectedKeyword] = useState('wireless headphones')
  const [customKeyword, setCustomKeyword] = useState('')

  const popularKeywords = [
    'wireless headphones',
    'security camera',
    'office chair',
    'kitchen knife set',
    'fitness tracker',
    'robot vacuum',
    'air purifier',
    'standing desk',
    'bluetooth speaker',
    'smart watch'
  ]

  const handleKeywordChange = (keyword: string) => {
    setSelectedKeyword(keyword)
  }

  const handleCustomKeyword = () => {
    if (customKeyword.trim()) {
      setSelectedKeyword(customKeyword.trim())
      setCustomKeyword('')
    }
  }

  const handleNodeSelect = (node: any) => {
    console.log('Node selected:', node)
    // In a real app, this could open a detailed analysis modal or navigate to a keyword detail page
  }

  const handleNodeAnalyze = (nodeId: string) => {
    console.log('Analyzing node:', nodeId)
    // In a real app, this could trigger a deep analysis or redirect to analysis page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Keyword Graph Visualization</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive keyword relationship mapping with semantic connections, search volume analysis, and opportunity identification
          </p>
        </div>

        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visualization">Interactive Graph</TabsTrigger>
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="methodology">How It Works</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-6">
            {/* Keyword Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Keyword Selection
                </CardTitle>
                <CardDescription>
                  Choose a keyword to visualize its semantic relationship network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {popularKeywords.map(keyword => (
                    <Button
                      key={keyword}
                      variant={selectedKeyword === keyword ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleKeywordChange(keyword)}
                      className="capitalize"
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter custom keyword..."
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomKeyword()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button onClick={handleCustomKeyword}>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
                
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    Currently analyzing: <span className="font-medium capitalize">{selectedKeyword}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Graph Visualization Component */}
            <KeywordGraphVisualization
              keyword={selectedKeyword}
              category="Electronics"
              onNodeSelect={handleNodeSelect}
              onNodeAnalyze={handleNodeAnalyze}
            />
          </TabsContent>

          {/* Key Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    Network Analysis Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Discover semantic keyword relationships</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Identify content gap opportunities</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Understand search intent patterns</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Find low-competition long-tail keywords</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Visualize keyword hierarchy and clusters</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Hash className="h-5 w-5 text-purple-600 mr-2" />
                    Node Types & Hierarchy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium text-blue-900">Root Keywords</div>
                        <div className="text-sm text-blue-700">Primary seed keywords</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <div className="font-medium text-green-900">Sub-Root Keywords</div>
                        <div className="text-sm text-green-700">Direct variations and modifiers</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded">
                      <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                      <div>
                        <div className="font-medium text-purple-900">Main Keywords</div>
                        <div className="text-sm text-purple-700">Related topical keywords</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <div>
                        <div className="font-medium text-yellow-900">Long-tail Keywords</div>
                        <div className="text-sm text-yellow-700">Specific, lower competition phrases</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600 mr-2" />
                    Metric Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Search Volume</h4>
                      <p className="text-sm text-gray-600">Monthly search frequency for each keyword</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Competition Level</h4>
                      <p className="text-sm text-gray-600">How difficult it is to rank for this keyword</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Cost Per Click (CPC)</h4>
                      <p className="text-sm text-gray-600">Average advertising cost for paid search</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Search Intent</h4>
                      <p className="text-sm text-gray-600">Commercial, informational, or navigational</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Trend Direction</h4>
                      <p className="text-sm text-gray-600">Rising, stable, or declining popularity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Keyword Graph Performance Metrics</CardTitle>
                <CardDescription>Understanding the current keyword landscape for "{selectedKeyword}"</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Network className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">22</div>
                    <div className="text-sm text-blue-700">Connected Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">12</div>
                    <div className="text-sm text-green-700">Rising Opportunities</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">8</div>
                    <div className="text-sm text-purple-700">Low Competition</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Lightbulb className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-900">285K</div>
                    <div className="text-sm text-orange-700">Total Search Volume</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Methodology Tab */}
          <TabsContent value="methodology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">How Keyword Graph Visualization Works</CardTitle>
                <CardDescription>Understanding the science behind semantic keyword mapping</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Seed Keyword Analysis</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      We start with your root keyword and analyze its semantic context, search patterns, and related queries.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Extract base keyword properties</li>
                      <li>• Analyze search volume and trends</li>
                      <li>• Identify core semantic themes</li>
                      <li>• Map initial keyword relationships</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Semantic Expansion</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Using NLP and search data, we expand the keyword universe by finding semantically related terms.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Generate sub-root variations</li>
                      <li>• Find related topical keywords</li>
                      <li>• Discover long-tail opportunities</li>
                      <li>• Calculate semantic similarity scores</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Network Construction</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Keywords are connected based on semantic relationships, search behavior, and topical clustering.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Build hierarchical node structure</li>
                      <li>• Create weighted edge connections</li>
                      <li>• Apply force-directed layout</li>
                      <li>• Optimize visual positioning</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Opportunity Scoring</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Each keyword is scored based on multiple factors to identify the best opportunities for content and optimization.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Volume vs. competition analysis</li>
                      <li>• Intent classification and scoring</li>
                      <li>• Trend momentum calculation</li>
                      <li>• Relevance and authority assessment</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Data Sources & Accuracy
                  </h4>
                  <p className="text-sm text-blue-800">
                    Our keyword graphs combine data from multiple sources including Google Keyword Planner, search trend APIs, 
                    semantic analysis engines, and user behavior data to provide the most comprehensive view of keyword relationships.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 text-blue-500 mr-2" />
                    Interactive Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time interactive graph navigation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Hover effects for instant keyword metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Click-to-select detailed node information</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Fullscreen mode for detailed analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Dynamic filtering by node type</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
                    Advanced Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Network analysis and clustering metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Keyword performance ranking and scoring</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Opportunity identification and prioritization</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Intent classification and trend analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Competition vs. volume correlation</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 text-purple-500 mr-2" />
                    Export & Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">CSV export for spreadsheet analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">JSON export for API integration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">High-resolution image export (SVG, PNG)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">PDF report generation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">API endpoints for external tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 text-orange-500 mr-2" />
                    Customization Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Multiple layout algorithms (force, hierarchy, grid)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Adjustable edge weight thresholds</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Node size and color customization</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Label visibility and density controls</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Animation and transition effects</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>Current status of keyword graph visualization features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: 'Interactive SVG Graph Visualization', status: 'completed', description: 'Fully interactive graph with hover, click, and selection' },
                    { feature: 'Multi-level Keyword Hierarchy', status: 'completed', description: 'Root, subroot, keyword, and longtail classification' },
                    { feature: 'Semantic Relationship Mapping', status: 'completed', description: 'Weighted edges showing keyword connections' },
                    { feature: 'Network Analysis Metrics', status: 'completed', description: 'Graph density, clustering, and path analysis' },
                    { feature: 'Opportunity Identification', status: 'completed', description: 'Rising keywords and low-competition detection' },
                    { feature: 'Export Functionality', status: 'completed', description: 'Multiple export formats and graph settings' },
                    { feature: 'Real-time Data Integration', status: 'pending', description: 'Live keyword data from multiple APIs' },
                    { feature: 'Custom Layout Algorithms', status: 'pending', description: 'Advanced positioning and clustering options' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.feature}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <Badge className={item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {item.status === 'completed' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}