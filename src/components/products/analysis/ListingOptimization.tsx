'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import NextImage from 'next/image'
import { 
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Activity,
  Image,
  Edit3,
  Target,
  Play,
  Gauge,
  Shield,
  Eye,
  Users,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Camera,
  Type,
  MessageSquare,
  Video,
  Settings,
  Award,
  Search,
  Clock,
  Zap
} from 'lucide-react'

interface ListingOptimizationProps {
  data: any
}

export default function ListingOptimization({ data }: ListingOptimizationProps) {
  const [activeTab, setActiveTab] = useState('images')
  const listingData = data.listingOptimizationData

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'main-image', label: 'Main Image', icon: Image },
          { id: 'secondary-images', label: 'Secondary Images', icon: Camera },
          { id: 'title', label: 'Title', icon: Type },
          { id: 'bullets', label: 'Bullet Points', icon: Edit3 },
          { id: 'aplus', label: 'A+ Content', icon: Sparkles },
          { id: 'video', label: 'Video', icon: Video },
          { id: 'qa', label: 'Quality Assurance', icon: Shield }
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

      {/* Main Image Tab */}
      {activeTab === 'main-image' && (
        <div className="space-y-6">
          {/* Complete Image Gallery & Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-purple-600" />
                <span>Main Image Analysis</span>
              </CardTitle>
              <CardDescription>
                Analysis of your main product image and competitive comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Image Performance Overview */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {listingData.completeImageAnalysis.imagePerformanceMetrics.overallScore}
                      </div>
                      <div className="text-sm text-gray-600">Overall Image Score</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {listingData.completeImageAnalysis.imagePerformanceMetrics.improvementPotential.currentCVR}%
                      </div>
                      <div className="text-sm text-gray-600">Current CVR</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {listingData.completeImageAnalysis.imagePerformanceMetrics.improvementPotential.projectedCVR}%
                      </div>
                      <div className="text-sm text-gray-600">Projected CVR</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        +{listingData.completeImageAnalysis.imagePerformanceMetrics.improvementPotential.revenueUplift}%
                      </div>
                      <div className="text-sm text-gray-600">Revenue Uplift</div>
                    </div>
                  </div>
                </div>

                {/* Main Product Image */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Main Product Image</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {listingData.completeImageAnalysis.imageGallery.ourProduct.images.filter((img: any) => img.type === 'main').map((image: any, index: number) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden">
                        <NextImage src={image.url} alt={image.caption} width={400} height={400} className="w-full h-96 object-cover" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {image.score}
                          </Badge>
                        </div>
                        <div className="p-3">
                          <div className="text-sm font-medium text-gray-700 capitalize">{image.type}</div>
                          <div className="text-sm text-gray-500">{image.caption}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitor Main Images Comparison */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Competitor Main Images</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {listingData.completeImageAnalysis.imageGallery.competitors.map((competitor: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm">{competitor.name}</h4>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {competitor.totalScore}
                          </Badge>
                        </div>
                        {competitor.images.filter((img: any) => img.type === 'main').map((image: any, imgIndex: number) => (
                          <div key={imgIndex} className="relative border rounded-lg overflow-hidden">
                            <NextImage src={image.url} alt={`${competitor.name} ${image.type}`} width={300} height={300} className="w-full h-48 object-cover" />
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="text-xs">
                                {image.score}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      )}

      {/* Secondary Images Tab */}
      {activeTab === 'secondary-images' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-purple-600" />
                <span>Secondary Images Analysis</span>
              </CardTitle>
              <CardDescription>
                Analysis of your secondary product images and lifestyle shots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Secondary Product Images */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Secondary Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {listingData.completeImageAnalysis.imageGallery.ourProduct.images.filter((img: any) => img.type !== 'main').map((image: any, index: number) => (
                      <div key={index} className="relative border rounded-lg overflow-hidden">
                        <NextImage src={image.url} alt={image.caption} width={200} height={128} className="w-full h-32 object-cover" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {image.score}
                          </Badge>
                        </div>
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-700 capitalize">{image.type}</div>
                          <div className="text-xs text-gray-500">{image.caption}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitor Secondary Images */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Competitor Secondary Images</h3>
                  {listingData.completeImageAnalysis.imageGallery.competitors.map((competitor: any, index: number) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                        <Badge className="bg-green-100 text-green-700">
                          Score: {competitor.totalScore}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {competitor.images.filter((img: any) => img.type !== 'main').map((image: any, imgIndex: number) => (
                          <div key={imgIndex} className="relative border rounded-lg overflow-hidden">
                            <NextImage src={image.url} alt={`${competitor.name} ${image.type}`} width={120} height={96} className="w-full h-24 object-cover" />
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary" className="text-xs">
                                {image.score}
                              </Badge>
                            </div>
                            <div className="p-1">
                              <div className="text-xs font-medium text-gray-700 capitalize">{image.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Title Tab */}
      {activeTab === 'title' && (
        <div className="space-y-6">
          {/* Advanced Title Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="h-5 w-5 text-blue-600" />
                <span>Advanced Title Optimization</span>
              </CardTitle>
              <CardDescription>
                Character tracking, keyword density analysis, and A/B testing variations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Character Analysis */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {listingData.advancedTitleOptimization.characterAnalysis.currentLength}
                      </div>
                      <div className="text-sm text-gray-600">Current Length</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {listingData.advancedTitleOptimization.characterAnalysis.mobileLimit}
                      </div>
                      <div className="text-sm text-gray-600">Mobile Limit</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {listingData.advancedTitleOptimization.characterAnalysis.desktopLimit}
                      </div>
                      <div className="text-sm text-gray-600">Desktop Limit</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {listingData.advancedTitleOptimization.characterAnalysis.utilizationRate}%
                      </div>
                      <div className="text-sm text-gray-600">Utilization Rate</div>
                    </div>
                  </div>
                </div>

                {/* Title Variations */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Optimized Title Variations</h3>
                  <div className="space-y-4">
                    {listingData.advancedTitleOptimization.titleVariations.map((variation: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-2">{variation.title}</div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Score: <span className="font-medium text-blue-600">{variation.score}</span></span>
                              <span>Length: <span className="font-medium">{variation.length} chars</span></span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            Rank #{index + 1}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-600">Pros:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1">
                              {variation.pros.map((pro: string, i: number) => (
                                <li key={i}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-red-600">Areas for improvement:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1">
                              {variation.cons.map((con: string, i: number) => (
                                <li key={i}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitor Title Analysis */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Competitor Title Analysis</h3>
                  <div className="space-y-3">
                    {listingData.advancedTitleOptimization.competitorTitleAnalysis.map((comp: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{comp.competitor}</h4>
                          <Badge variant="secondary">Score: {comp.score}</Badge>
                        </div>
                        <div className="text-sm text-gray-700 mb-3 italic">"{comp.title}"</div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-600">Strengths:</span>
                            <div className="text-gray-600 mt-1">{comp.strengths.join(', ')}</div>
                          </div>
                          <div>
                            <span className="font-medium text-red-600">Weaknesses:</span>
                            <div className="text-gray-600 mt-1">{comp.weaknesses.join(', ')}</div>
                          </div>
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

      {/* Bullet Points Tab */}
      {activeTab === 'bullets' && (
        <div className="space-y-6">
          {/* Enhanced Bullet Point Workshop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-green-600" />
                <span>Enhanced Bullet Point Workshop</span>
              </CardTitle>
              <CardDescription>
                Interactive optimization with real-time scoring and emoji integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bullet Analytics */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {listingData.enhancedBulletPoints.bulletAnalytics.averageScore}
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {listingData.enhancedBulletPoints.bulletAnalytics.emotionalTriggers}
                      </div>
                      <div className="text-sm text-gray-600">Emotional Triggers</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {listingData.enhancedBulletPoints.bulletAnalytics.benefitToFeatureRatio}:1
                      </div>
                      <div className="text-sm text-gray-600">Benefit:Feature</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {listingData.enhancedBulletPoints.bulletAnalytics.mobileOptimization}%
                      </div>
                      <div className="text-sm text-gray-600">Mobile Optimized</div>
                    </div>
                  </div>
                </div>

                {/* Optimized Bullets */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Optimized Bullet Points</h3>
                  <div className="space-y-4">
                    {listingData.enhancedBulletPoints.optimizedBullets.map((bullet: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-2">{bullet.bullet}</div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Score: <span className="font-medium text-green-600">{bullet.score}</span></span>
                              <span>Characters: <span className="font-medium">{bullet.characterCount}</span></span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {bullet.improvements.map((improvement: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {improvement}
                            </Badge>
                          ))}
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

      {/* A+ Content Tab */}
      {activeTab === 'aplus' && (
        <div className="space-y-6">
          {/* Comprehensive A+ Content Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <span>Comprehensive A+ Content Builder</span>
              </CardTitle>
              <CardDescription>
                AI-powered content modules with performance prediction and mobile optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Prediction */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {listingData.comprehensiveAPlusContent.performancePrediction.currentConversionRate}%
                      </div>
                      <div className="text-sm text-gray-600">Current CVR</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        +{listingData.comprehensiveAPlusContent.performancePrediction.projectedUplift}%
                      </div>
                      <div className="text-sm text-gray-600">Projected Uplift</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {listingData.comprehensiveAPlusContent.performancePrediction.confidenceLevel}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence Level</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {listingData.comprehensiveAPlusContent.performancePrediction.timeToImplement}
                      </div>
                      <div className="text-sm text-gray-600">Implementation</div>
                    </div>
                  </div>
                </div>

                {/* Module Recommendations */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Module Recommendations</h3>
                  <div className="space-y-4">
                    {listingData.comprehensiveAPlusContent.moduleRecommendations.map((module: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{module.type}</h4>
                            <div className="text-sm text-gray-600 mb-2">Template: {module.template}</div>
                            {module.content.headline && (
                              <div className="text-sm">
                                <span className="font-medium">Headline:</span> {module.content.headline}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className="bg-orange-100 text-orange-700 mb-2">
                              Score: {module.score}
                            </Badge>
                            <div className="text-sm text-gray-600">
                              Impact: <span className="font-medium">{module.conversionImpact}</span>
                            </div>
                          </div>
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

      {/* Video Tab */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          {/* Advanced Video Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-red-600" />
                <span>Video Content Strategy</span>
              </CardTitle>
              <CardDescription>
                Detailed production plans with ROI projections and shot lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Benchmarks */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {listingData.advancedVideoStrategy.performanceBenchmarks.projected.viewRate}%
                      </div>
                      <div className="text-sm text-gray-600">Projected View Rate</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        +{listingData.advancedVideoStrategy.performanceBenchmarks.projected.conversionLift}%
                      </div>
                      <div className="text-sm text-gray-600">Conversion Lift</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {listingData.advancedVideoStrategy.performanceBenchmarks.projected.totalViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Projected Views</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {listingData.advancedVideoStrategy.performanceBenchmarks.projected.projectedSales.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Projected Sales</div>
                    </div>
                  </div>
                </div>

                {/* Storyboards */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Video Storyboards</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {listingData.advancedVideoStrategy.storyboards.map((storyboard: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">{storyboard.type}</h4>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">ROI: <span className="font-medium text-green-600">{storyboard.expectedROI}%</span></div>
                            <div className="text-sm text-gray-600">Cost: <span className="font-medium">${storyboard.productionCost.toLocaleString()}</span></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Script:</span>
                            <div className="text-sm text-gray-600 mt-1">
                              <div>Opening: "{storyboard.script.opening}"</div>
                              <div>Demo: "{storyboard.script.demonstration}"</div>
                              <div>CTA: "{storyboard.script.cta}"</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Key Shots:</span>
                            <div className="text-sm text-gray-600 mt-1">
                              {storyboard.shotList.slice(0, 3).map((shot: any, i: number) => (
                                <div key={i}>• {shot.shot} ({shot.duration}s)</div>
                              ))}
                            </div>
                          </div>
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

      {/* Quality Assurance Tab */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          {/* Quality Assurance & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Quality Assurance & Compliance</span>
              </CardTitle>
              <CardDescription>
                Amazon guidelines compliance and brand risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Amazon Compliance */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Amazon Compliance</h3>
                    <Badge className="bg-green-100 text-green-700">
                      Overall Score: {listingData.qualityAssurance.amazonCompliance.overallScore}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {listingData.qualityAssurance.amazonCompliance.checks.map((check: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{check.category}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={check.status === 'Pass' ? 'default' : 'secondary'}>
                              {check.status}
                            </Badge>
                            <span className="text-sm text-gray-600">Score: {check.score}</span>
                          </div>
                        </div>
                        {check.issues.length > 0 && (
                          <div className="text-sm text-orange-600">
                            Issues: {check.issues.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Quality Analysis */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Technical Image Quality</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        {listingData.qualityAssurance.imageQualityAnalysis.checks.map((check: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-medium text-gray-900">{check.criteria}</span>
                            <div className="text-right">
                              <Badge variant={check.status === 'Pass' ? 'default' : check.status === 'Excellent' ? 'default' : 'secondary'}>
                                {check.status}
                              </Badge>
                              <div className="text-xs text-gray-600 mt-1">{check.details}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {listingData.qualityAssurance.imageQualityAnalysis.technicalScore}
                        </div>
                        <div className="text-sm text-gray-600">Technical Quality Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Risk Assessment */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Brand Risk Assessment</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {listingData.qualityAssurance.brandRiskAssessment.riskFactors.map((risk: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{risk.type}</span>
                            <Badge variant={risk.risk === 'Low' ? 'default' : 'secondary'}>
                              {risk.risk} Risk
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">{risk.description}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {listingData.qualityAssurance.brandRiskAssessment.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}