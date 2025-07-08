'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Rocket,
  Calendar,
  Target,
  TrendingUp,
  Star,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  BarChart3,
  ShoppingCart,
  Download,
  Eye,
  Settings,
  Zap,
  LineChart,
  FileText,
  Shield,
  Activity,
  TrendingDown,
  Clock,
  Search,
  MousePointer,
  Gauge,
  Bell,
  ExternalLink,
  Play,
  Pause,
  Edit
} from 'lucide-react'

interface LaunchStrategyProps {
  data: any
}

export default function LaunchStrategy({ data }: LaunchStrategyProps) {
  const launchData = data.launchStrategyData
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'ppc', label: 'PPC Campaigns', icon: Target },
          { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'bulk', label: 'Bulk Operations', icon: Download }
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
          {/* Launch Analytics Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>Launch Performance Dashboard</span>
              </CardTitle>
              <CardDescription>
                Real-time metrics and performance predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current Sales</span>
                      <Badge variant={launchData.launchAnalytics.realTimeMetrics.salesVelocity === 'Above target' ? 'default' : 'secondary'}>
                        {launchData.launchAnalytics.realTimeMetrics.salesVelocity}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {launchData.launchAnalytics.realTimeMetrics.currentSales}
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {launchData.launchAnalytics.realTimeMetrics.targetSales}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Review Velocity</span>
                      <Badge variant={launchData.launchAnalytics.realTimeMetrics.reviewVelocity === 'Above target' ? 'default' : 'secondary'}>
                        {launchData.launchAnalytics.realTimeMetrics.reviewVelocity}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {launchData.launchAnalytics.realTimeMetrics.currentReviews}
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {launchData.launchAnalytics.realTimeMetrics.targetReviews}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Current Rating</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {launchData.launchAnalytics.realTimeMetrics.currentRating}
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(launchData.launchAnalytics.realTimeMetrics.currentRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {launchData.launchAnalytics.realTimeMetrics.targetRating}★
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Organic Rank</div>
                    <div className="text-2xl font-bold text-gray-900">
                      #{launchData.launchAnalytics.realTimeMetrics.organicRank}
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: #{launchData.launchAnalytics.realTimeMetrics.targetRank}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-4">90-Day Forecast</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {['day30Forecast', 'day60Forecast', 'day90Forecast'].map((period, index) => (
                      <div key={period} className="p-4 border rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">
                          {period === 'day30Forecast' ? '30 Days' : period === 'day60Forecast' ? '60 Days' : '90 Days'}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sales:</span>
                            <span className="font-medium">{launchData.launchAnalytics.performancePrediction[period].sales}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Reviews:</span>
                            <span className="font-medium">{launchData.launchAnalytics.performancePrediction[period].reviews}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Revenue:</span>
                            <span className="font-medium">${launchData.launchAnalytics.performancePrediction[period].revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Launch Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>90-Day Launch Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {launchData.timeline.map((phase: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        phase.week <= 4 ? 'bg-red-100 text-red-600' :
                        phase.week <= 8 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <span className="font-semibold text-sm">W{phase.week}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{phase.phase}</h4>
                        <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Key Activities:</div>
                            <ul className="space-y-1">
                              {phase.activities.map((activity: string, actIndex: number) => (
                                <li key={actIndex} className="text-sm text-gray-600 flex items-start">
                                  <ArrowRight className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Target Sales</span>
                                <span className="font-medium">{phase.metrics.sales} units/day</span>
                              </div>
                              <Progress value={phase.metrics.salesProgress} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Target Reviews</span>
                                <span className="font-medium">{phase.metrics.reviews} total</span>
                              </div>
                              <Progress value={phase.metrics.reviewProgress} className="h-2" />
                            </div>
                            
                            {phase.checkpoints && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm font-medium text-blue-900 mb-1">Success Checkpoints:</div>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  {phase.checkpoints.map((checkpoint: string, cpIndex: number) => (
                                    <li key={cpIndex} className="flex items-start">
                                      <CheckCircle className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                      <span>{checkpoint}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {index < launchData.timeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>Risk Assessment & Crisis Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Current Risks</h4>
                  <div className="space-y-3">
                    {launchData.launchAnalytics.riskAssessment.currentRisks.map((risk: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{risk.risk}</span>
                          <Badge variant={risk.severity === 'High' ? 'destructive' : 'secondary'}>
                            {risk.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">{risk.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Crisis Scenarios</h4>
                  <div className="space-y-3">
                    {launchData.crisisManagement.scenarios.map((scenario: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{scenario.crisis}</span>
                          <Badge variant={scenario.severity === 'High' ? 'destructive' : 'secondary'}>
                            {scenario.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Actions:</span> {scenario.actions.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PPC Campaigns Tab */}
      {activeTab === 'ppc' && (
        <div className="space-y-6">
          {/* PPC Phase Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span>PPC Phase Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {launchData.enhancedPPCStrategy.phases.map((phase: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                    <h4 className="font-semibold text-gray-900 mb-2">{phase.phase}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{phase.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">${phase.totalBudget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Budget:</span>
                        <span className="font-medium">${phase.dailyBudget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target ACoS:</span>
                        <span className="font-medium">{phase.targetAcos}%</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium text-gray-700 mb-2">Objectives:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {phase.objectives.map((objective: string, objIndex: number) => (
                          <li key={objIndex} className="flex items-start">
                            <ArrowRight className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>Detailed Campaign Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {launchData.enhancedPPCStrategy.detailedCampaigns.map((campaign: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                        <div className="text-sm text-gray-600">
                          {campaign.type} • {campaign.matchType} • ${campaign.dailyBudget}/day
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={campaign.priority === 'High' ? 'destructive' : 'secondary'}>
                          {campaign.priority}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCampaign(selectedCampaign === index ? null : index)}
                        >
                          {selectedCampaign === index ? 'Hide' : 'View'} Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Target ACoS</div>
                        <div className="font-medium">{campaign.targetAcos}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Bid Strategy</div>
                        <div className="font-medium">{campaign.bidStrategy}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Keywords</div>
                        <div className="font-medium">{campaign.keywords?.length || campaign.targets?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Placement</div>
                        <div className="font-medium">{campaign.targetingOptions?.placement || 'Standard'}</div>
                      </div>
                    </div>
                    
                    {selectedCampaign === index && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Keywords & Bids</h5>
                            <div className="space-y-2">
                              {campaign.keywords?.map((keyword: any, kIndex: number) => (
                                <div key={kIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <span className="text-sm font-medium">{keyword.keyword}</span>
                                  <div className="flex items-center space-x-3 text-sm">
                                    <span className="text-gray-600">Bid: ${keyword.bid}</span>
                                    <span className="text-gray-600">Vol: {keyword.volume?.toLocaleString()}</span>
                                    <Badge variant="outline" className="text-xs">
                                      ROI: {keyword.roi}%
                                    </Badge>
                                  </div>
                                </div>
                              )) || campaign.targets?.map((target: any, tIndex: number) => (
                                <div key={tIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <span className="text-sm font-medium">{target.asin}</span>
                                  <div className="flex items-center space-x-3 text-sm">
                                    <span className="text-gray-600">Bid: ${target.bid}</span>
                                    <span className="text-gray-600">Share: {target.competitorShare}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-3">Negative Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                              {campaign.negativeKeywords?.map((negative: string, nIndex: number) => (
                                <Badge key={nIndex} variant="outline" className="text-xs">
                                  -{negative}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Tier Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gauge className="h-5 w-5 text-purple-600" />
                <span>Keyword Tier Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(launchData.enhancedPPCStrategy.keywordTierStrategy).map(([tier, data]: [string, any]) => (
                  <div key={tier} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                      {tier.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg CPC:</span>
                        <span className="font-medium">${data.averageCpc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected ROI:</span>
                        <span className="font-medium">{data.expectedRoi}%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{data.strategy}</div>
                    <div className="flex flex-wrap gap-1">
                      {data.keywords.map((keyword: string, kIndex: number) => (
                        <Badge key={kIndex} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Strategy Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Dynamic Pricing Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Dynamic Pricing Strategy</span>
              </CardTitle>
              <CardDescription>
                Pricing tiers based on review milestones and competitive positioning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {launchData.dynamicPricing.pricingTiers.map((tier: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{tier.reviewRange} Reviews</h4>
                        <div className="text-sm text-gray-600">{tier.rationale}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${tier.price}</div>
                        <div className="text-sm text-gray-600">{tier.discount}% off</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rating Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Rating Requirements & Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {launchData.ratingRequirements.ratingMilestones.map((milestone: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{milestone.reviews} Reviews</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(milestone.targetRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{milestone.targetRating}★ Target</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Actions:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {milestone.actions.map((action: string, aIndex: number) => (
                            <Badge key={aIndex} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Benchmarking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Competitor Price Benchmarking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {launchData.dynamicPricing.competitorBenchmarking.map((comp: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{comp.competitor}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{comp.reviews.toLocaleString()} reviews</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < Math.floor(comp.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span>{comp.rating}★</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${comp.price}</div>
                        <div className="text-sm text-gray-600">Current Price</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Competitor Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Competitor Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {launchData.launchAnalytics.competitorTracking.keyCompetitors.map((competitor: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                        <div className="text-sm text-gray-600">{competitor.asin}</div>
                      </div>
                      <Badge variant={competitor.threat === 'High' ? 'destructive' : 'secondary'}>
                        {competitor.threat} Threat
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Price</div>
                        <div className="font-medium">${competitor.currentPrice}</div>
                        <div className="text-xs text-gray-500">{competitor.priceChange}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Ranking</div>
                        <div className="font-medium">#{competitor.ranking}</div>
                        <div className="text-xs text-gray-500">{competitor.rankingChange}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">PPC Spend</div>
                        <div className="font-medium">${competitor.ppcSpend.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Organic Share</div>
                        <div className="font-medium">{competitor.organicShare}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                <span>Market Intelligence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Average Market Price</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${launchData.launchAnalytics.competitorTracking.marketIntelligence.averageMarketPrice}
                    </div>
                    <div className="text-sm text-gray-500">
                      {launchData.launchAnalytics.competitorTracking.marketIntelligence.priceInflation} inflation
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Competition Level</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {launchData.launchAnalytics.competitorTracking.marketIntelligence.overallCompetition}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">New Entrants</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {launchData.launchAnalytics.competitorTracking.marketIntelligence.newEntrants}
                    </div>
                    <div className="text-sm text-gray-500">This month</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Exiting Brands</div>
                    <div className="text-2xl font-bold text-red-600">
                      {launchData.launchAnalytics.competitorTracking.marketIntelligence.exitingBrands}
                    </div>
                    <div className="text-sm text-gray-500">This month</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Operations Tab */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          {/* Campaign Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-green-600" />
                <span>Bulk Operation Files</span>
              </CardTitle>
              <CardDescription>
                Ready-to-use templates for Amazon PPC campaign setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {launchData.bulkOperationFiles.campaignTemplates.map((template: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {template.type.toUpperCase()}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    {template.sampleData && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Sample Data Preview:</div>
                        <div className="text-xs text-gray-600 font-mono">
                          {template.columns.join(' | ')}<br />
                          {template.sampleData.map((row: any[], rowIndex: number) => (
                            <div key={rowIndex}>{row.join(' | ')}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {template.totalKeywords && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Total Keywords:</span> {template.totalKeywords} | 
                        <span className="font-medium ml-2">Setup Time:</span> {template.estimatedSetupTime}
                      </div>
                    )}
                    
                    {template.features && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
                        <div className="flex flex-wrap gap-2">
                          {template.features.map((feature: string, fIndex: number) => (
                            <Badge key={fIndex} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Launch Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Launch Checklist</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {launchData.launchChecklist.map((category: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">{category.category}</h4>
                    <div className="space-y-2">
                      {category.items.map((item: string, itemIndex: number) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}