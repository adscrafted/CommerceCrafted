'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Activity
} from 'lucide-react'

interface ListingOptimizationProps {
  data: any
}

export default function ListingOptimization({ data }: ListingOptimizationProps) {
  return (
    <div className="space-y-6">
      {/* Title Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Title Optimization</span>
          </CardTitle>
          <CardDescription>
            Recommendations for optimizing your Amazon product title
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Current Pattern:</div>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {data.listingOptimizationData.titleOptimization.currentPattern}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Suggested Title:</div>
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded font-medium">
              {data.listingOptimizationData.titleOptimization.suggestedTitle}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Key Recommendations:</div>
            <ul className="space-y-1">
              {data.listingOptimizationData.titleOptimization.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Image Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-purple-600" />
            <span>Image Optimization Strategy</span>
          </CardTitle>
          <CardDescription>
            Position-by-position image recommendations based on competitor analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(data.listingOptimizationData.imageAnalysis).map(([position, imageData]: [string, any]) => (
              <div key={position} className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                      Image {position.replace('position', 'Position ')}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Creative Brief:</div>
                      <p className="text-sm text-gray-600">{imageData.creativeBrief}</p>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Common Themes:</div>
                      <div className="flex flex-wrap gap-1">
                        {imageData.commonThemes.map((theme: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Optimization Tips:</div>
                      <ul className="space-y-1">
                        {imageData.optimizationTips.map((tip: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <Lightbulb className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-1" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Competitor Examples:</div>
                    {imageData.competitorImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {imageData.competitorImages.map((image: string, index: number) => (
                          <img 
                            key={index}
                            src={image}
                            alt={`Competitor example ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No competitor examples available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bullet Point Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Bullet Point Optimization</span>
          </CardTitle>
          <CardDescription>
            Structure and recommendations for compelling bullet points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Recommended Structure:</div>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {data.listingOptimizationData.bulletPointOptimization.structure}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Key Recommendations:</div>
            <ul className="space-y-2">
              {data.listingOptimizationData.bulletPointOptimization.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* A+ Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            <span>A+ Content Strategy</span>
          </CardTitle>
          <CardDescription>
            Recommendations for creating high-converting Amazon A+ content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Module Recommendations</h3>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="font-medium text-gray-900 mb-2">Hero Banner Module</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Showcase product in use with lifestyle imagery showing peaceful sleep
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• 970x600px minimum resolution</li>
                    <li>• Include benefit callouts</li>
                    <li>• Show product in context</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="font-medium text-gray-900 mb-2">Comparison Chart Module</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Compare your product features against generic alternatives
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Highlight unique features</li>
                    <li>• Use checkmarks for advantages</li>
                    <li>• Include 3-4 competitors</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="font-medium text-gray-900 mb-2">Technical Details Module</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Detailed specifications with infographic style presentation
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Battery life visualization</li>
                    <li>• Bluetooth range diagram</li>
                    <li>• Material breakdown</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Content Best Practices</h3>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-gray-900">Storytelling Flow</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Start with problem identification → solution presentation → benefits → social proof
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-gray-900">Mobile Optimization</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    70% of Amazon shoppers use mobile - ensure text is readable at small sizes
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-gray-900">Brand Consistency</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Maintain consistent color scheme, fonts, and messaging throughout all modules
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Content Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-600" />
            <span>Video Content Analysis</span>
          </CardTitle>
          <CardDescription>
            Video strategy recommendations based on top performer analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">🎥</div>
                <h4 className="font-semibold text-gray-900">Product Demo Video</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimal Length:</span>
                  <span className="font-medium">45-60 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Elements:</span>
                  <span className="font-medium">Unboxing, Setup</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Show Bluetooth pairing process and comfort features
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">🌙</div>
                <h4 className="font-semibold text-gray-900">Lifestyle Video</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimal Length:</span>
                  <span className="font-medium">30-45 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Elements:</span>
                  <span className="font-medium">Use Cases</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Show different sleep positions and travel scenarios
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-orange-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-900">Comparison Video</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimal Length:</span>
                  <span className="font-medium">60-90 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Elements:</span>
                  <span className="font-medium">Side-by-side</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Compare with traditional eye masks and earbuds
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Video Production Checklist</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Professional lighting setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Multiple angle shots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Clear audio narration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Captions for mobile viewing</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Show product scale/size</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Include lifestyle B-roll</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Feature diverse models</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">End with clear CTA</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}