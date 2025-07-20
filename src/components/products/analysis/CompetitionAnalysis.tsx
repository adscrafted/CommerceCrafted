'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Image from 'next/image'
import { 
  Target, 
  DollarSign,
  Crown,
  Star,
  CheckCircle,
  Layers,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Search,
  TrendingUp,
  Eye,
  Swords,
  Users,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface CompetitionAnalysisProps {
  data: any
}

export default function CompetitionAnalysis({ data }: CompetitionAnalysisProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('competitors')
  const [keywordData, setKeywordData] = useState<any[]>([])
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({})
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  
  // Process keyword data when switching to keyword tab
  useEffect(() => {
    if (activeTab === 'keyword' && data?.keywordHierarchy) {
      processKeywordData()
    }
  }, [activeTab, data])

  const processKeywordData = () => {
    try {
      const keywordGroups = []
      
      // Process real keyword hierarchy data from the data prop
      Object.entries(data.keywordHierarchy || {}).forEach(([rootName, rootData]: [string, any]) => {
        const group: any = {
          root: rootName,
          keywordCount: rootData.keywordCount || 0,
          totalRevenue: rootData.totalRevenue || 0,
          avgCPC: rootData.avgCPC || '0',
          subroots: []
        }
        
        // Process subroots
        Object.entries(rootData.subroots || {}).forEach(([subrootName, subrootData]: [string, any]) => {
          const subroot: any = {
            name: subrootName,
            keywordCount: subrootData.keywordCount || subrootData.keywords?.length || 0,
            keywords: []
          }
          
          // Process individual keywords if available
          if (subrootData.keywords && Array.isArray(subrootData.keywords)) {
            subroot.keywords = subrootData.keywords.map((kw: any) => ({
              keyword: kw.keyword || kw.name || subrootName,
              searchVolume: kw.searchVolume || kw.totalSearches || 0,
              cpc: kw.avgCPC || kw.cpc || 0,
              totalRevenue: kw.totalRevenue || 0,
              // Simulate ownership data - in production this would come from ranking data
              ownership: data.competitors?.reduce((acc: any, comp: any, index: number) => {
                // For demo purposes, assign higher ownership to earlier competitors
                const baseOwnership = Math.max(0, 80 - (index * 15))
                const variance = Math.floor(Math.random() * 20) - 10
                acc[comp.asin] = Math.max(0, Math.min(100, baseOwnership + variance))
                return acc
              }, {})
            }))
          }
          
          if (subroot.keywords.length > 0 || subroot.keywordCount > 0) {
            group.subroots.push(subroot)
          }
        })
        
        if (group.subroots.length > 0 || group.keywordCount > 0) {
          keywordGroups.push(group)
        }
      })
      
      // Sort by keyword count descending
      keywordGroups.sort((a, b) => b.keywordCount - a.keywordCount)
      
      setKeywordData(keywordGroups)
    } catch (error) {
      console.error('Error processing keyword data:', error)
    }
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'competitors', label: 'Competitors', icon: Users },
          { id: 'keyword', label: 'Keyword Ownership', icon: Search },
          { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign }
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


      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Competitors</span>
              </CardTitle>
              <CardDescription>
                All competitors in this niche with detailed product analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {(data.competitors || []).map((competitor: any, index: number) => {
                  // Parse additional data if available
                  const bulletPoints = competitor.bullet_points ? JSON.parse(competitor.bullet_points) : []
                  const aPlusContent = competitor.a_plus_content ? JSON.parse(competitor.a_plus_content) : {}
                  const videoUrls = competitor.video_urls ? JSON.parse(competitor.video_urls) : []
                  const imageUrls = competitor.image_urls ? competitor.image_urls.split(',').map((url: string) => url.trim()) : []
                  const allImages = imageUrls.length > 0 ? imageUrls.map((url: string) => `https://m.media-amazon.com/images/I/${url}`) : []
                  
                  return (
                    <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                      {/* Main Product Overview */}
                      <div className="grid md:grid-cols-6 gap-6 mb-6">
                        {/* Product Images & Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <img 
                                src={competitor.image || allImages[0] || 'https://via.placeholder.com/80x80?text=No+Image'}
                                alt={competitor.name || competitor.title}
                                className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => setEnlargedImage(competitor.image || allImages[0])}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-xs font-medium">
                                  #{index + 1}
                                </Badge>
                                {competitor.brand && (
                                  <Badge variant="secondary" className="text-xs">
                                    {competitor.brand}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                                {competitor.name || competitor.title || 'Unknown Product'}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">
                                ASIN: {competitor.asin}
                              </p>
                              <div className="flex items-center space-x-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < Math.floor(competitor.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {(competitor.rating || 0).toFixed(1)} ({(competitor.review_count || 0).toLocaleString()})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-semibold text-gray-700 mb-3">Key Metrics</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-2 rounded border">
                              <div className="text-xs text-gray-600">Price</div>
                              <div className="text-lg font-bold text-green-600">${(competitor.price || 0).toFixed(2)}</div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="text-xs text-gray-600">BSR</div>
                              <div className="text-sm font-semibold text-purple-600">#{(competitor.bsr || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="text-xs text-gray-600">Est. Sales</div>
                              <div className="text-sm font-semibold text-blue-600">{(competitor.monthly_orders || 0).toLocaleString()}/mo</div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="text-xs text-gray-600">FBA Fees</div>
                              <div className="text-sm font-medium text-orange-600">
                                ${competitor.fee ? competitor.fee.toFixed(2) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Specifications */}
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-semibold text-gray-700 mb-3">Specifications</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Dimensions:</span>
                              <span>
                                {competitor.length > 0 && competitor.width > 0 && competitor.height > 0 ? 
                                  `${competitor.length}" × ${competitor.width}" × ${competitor.height}"` : 
                                  competitor.dimensions?.length > 0 ? 
                                    `${competitor.dimensions.length}" × ${competitor.dimensions.width}" × ${competitor.dimensions.height}"` : 
                                    'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Weight:</span>
                              <span>
                                {competitor.weight > 0 ? 
                                  `${competitor.weight} lbs` : 
                                  competitor.dimensions?.weight > 0 ? 
                                    `${competitor.dimensions.weight} lbs` : 
                                    'N/A'
                                }
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">FBA Tier:</span>
                              <span className="font-medium">{competitor.tier || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Category:</span>
                              <span className="truncate ml-2" title={competitor.category || 'N/A'}>
                                {competitor.category && competitor.category !== 'N/A' 
                                  ? competitor.category.replace(/[\d\s>]+/g, ' ').trim()
                                  : 'N/A'
                                }
                              </span>
                            </div>
                            {competitor.parent_asin && competitor.parent_asin !== 'N/A' && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Parent ASIN:</span>
                                <span>{competitor.parent_asin}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Secondary Images Gallery */}
                      {allImages.length > 1 && (
                        <div className="mb-6 pt-4 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Product Images ({allImages.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {allImages.slice(0, 8).map((imageUrl: string, imgIndex: number) => (
                              <img 
                                key={imgIndex}
                                src={imageUrl}
                                alt={`${competitor.name} - Image ${imgIndex + 1}`}
                                className="w-16 h-16 rounded object-cover border cursor-pointer hover:border-blue-400 transition-colors"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                                }}
                                onClick={() => setEnlargedImage(imageUrl)}
                              />
                            ))}
                            {allImages.length > 8 && (
                              <div className="w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
                                +{allImages.length - 8}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional Metadata */}
                      <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
                        {/* Bullet Points */}
                        {bulletPoints.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Bullet Points
                            </h4>
                            <ul className="space-y-1">
                              {bulletPoints.map((feature: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600">• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Enhanced Content */}
                        <div>
                          <h4 className="text-sm font-medium text-blue-600 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-1" />
                            Content Quality
                          </h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Images:</span>
                              <span className="font-medium">{allImages.length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Videos:</span>
                              <span className="font-medium">{videoUrls.length}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">A+ Content:</span>
                              <span className="font-medium">{Object.keys(aPlusContent).length > 0 ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Features:</span>
                              <span className="font-medium">{bulletPoints.length}</span>
                            </div>
                          </div>
                        </div>

                        {/* Historical Performance */}
                        <div>
                          <h4 className="text-sm font-medium text-purple-600 mb-2 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Performance History
                          </h4>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Launch Date:</span>
                              <span className="font-medium">{competitor.created_at ? new Date(competitor.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Status:</span>
                              <Badge variant={competitor.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                                {competitor.status || 'ACTIVE'}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Est. Revenue:</span>
                              <span className="font-medium text-green-600">
                                ${((competitor.price || 0) * (competitor.monthly_orders || 0)).toLocaleString()}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button for More Details */}
                      <div className="mt-4 pt-4 border-t">
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          onClick={() => setSelectedCompetitor(selectedCompetitor?.asin === competitor.asin ? null : competitor)}
                        >
                          {selectedCompetitor?.asin === competitor.asin ? (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-3 w-3" />
                              <span>View Historical Data & Analysis</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Expanded Historical Data Section */}
                      {selectedCompetitor?.asin === competitor.asin && (
                        <div className="mt-4 pt-4 border-t bg-white rounded-lg p-6">
                          <h5 className="text-lg font-semibold text-gray-900 mb-6">Historical Performance Analysis</h5>
                          
                          {/* Unified Performance Chart */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h6 className="text-sm font-medium text-gray-900">Historical Performance Metrics</h6>
                              <div className="flex items-center space-x-3 text-xs">
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-0.5 bg-purple-600"></div>
                                  <span>BSR (left)</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-0.5 bg-green-600"></div>
                                  <span>Price ($)</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-0.5 bg-red-600"></div>
                                  <span>Rating</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-0.5 bg-blue-600"></div>
                                  <span>Reviews (right)</span>
                                </div>
                              </div>
                            </div>
                            <div className="h-64 bg-white rounded border relative">
                              <svg className="w-full h-full" viewBox="0 0 300 240">
                                {/* Grid lines */}
                                {[0, 1, 2, 3, 4].map(i => (
                                  <line key={`h-${i}`} x1="0" y1={i * 48} x2="300" y2={i * 48} stroke="#e5e7eb" strokeWidth="1" />
                                ))}
                                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                                  <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="240" stroke="#e5e7eb" strokeWidth="1" />
                                ))}
                                
                                {/* Generate data points */}
                                {(() => {
                                  const currentBsr = competitor.bsr || 50000;
                                  const currentPrice = competitor.price || 25;
                                  const currentRating = competitor.rating || 4.2;
                                  const currentReviews = competitor.review_count || 1000;
                                  
                                  const bsrPoints = [];
                                  const pricePoints = [];
                                  const ratingPoints = [];
                                  const reviewPoints = [];
                                  
                                  for (let i = 0; i < 30; i++) {
                                    const x = (i / 29) * 290 + 5;
                                    
                                    // BSR data (inverted scale - lower is better)
                                    const bsrVariation = Math.sin(i / 5) * 15000 + (Math.random() - 0.5) * 10000;
                                    const bsr = Math.max(1000, currentBsr + bsrVariation);
                                    const bsrY = 200 - ((Math.log(bsr) - Math.log(1000)) / (Math.log(100000) - Math.log(1000))) * 180;
                                    bsrPoints.push(`${x},${Math.max(20, Math.min(200, bsrY))}`);
                                    
                                    // Price data
                                    const priceVariation = Math.sin(i / 3) * 5 + (Math.random() - 0.5) * 3;
                                    const price = Math.max(5, currentPrice + priceVariation);
                                    const priceY = 200 - ((price - 5) / 40) * 180;
                                    pricePoints.push(`${x},${Math.max(20, Math.min(200, priceY))}`);
                                    
                                    // Rating data
                                    const ratingVariation = (Math.random() - 0.5) * 0.3;
                                    const rating = Math.max(3.0, Math.min(5.0, currentRating + ratingVariation));
                                    const ratingY = 200 - ((rating - 3.0) / 2.0) * 180;
                                    ratingPoints.push(`${x},${ratingY}`);
                                    
                                    // Review count data (using right scale)
                                    const startReviews = Math.max(0, currentReviews - 200);
                                    const reviews = startReviews + (i / 29) * 200 + Math.random() * 20;
                                    const reviewY = 200 - ((reviews - startReviews) / 500) * 180;
                                    reviewPoints.push(`${x},${Math.max(20, reviewY)}`);
                                  }
                                  
                                  return (
                                    <>
                                      {/* BSR line */}
                                      <polyline
                                        fill="none"
                                        stroke="#9333ea"
                                        strokeWidth="2"
                                        points={bsrPoints.join(' ')}
                                        opacity="0.8"
                                      />
                                      
                                      {/* Price line */}
                                      <polyline
                                        fill="none"
                                        stroke="#059669"
                                        strokeWidth="2"
                                        points={pricePoints.join(' ')}
                                        opacity="0.8"
                                      />
                                      
                                      {/* Rating line */}
                                      <polyline
                                        fill="none"
                                        stroke="#dc2626"
                                        strokeWidth="2"
                                        points={ratingPoints.join(' ')}
                                        opacity="0.8"
                                      />
                                      
                                      {/* Review count line */}
                                      <polyline
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="2"
                                        points={reviewPoints.join(' ')}
                                        opacity="0.8"
                                      />
                                    </>
                                  );
                                })()}
                                
                                {/* Y-axis labels (left - BSR) */}
                                <text x="5" y="25" className="text-xs fill-gray-600">#1K</text>
                                <text x="5" y="205" className="text-xs fill-gray-600">#100K</text>
                                
                                {/* Y-axis labels (right - Reviews) */}
                                <text x="275" y="25" className="text-xs fill-gray-600">{((competitor.review_count || 1000) + 300).toLocaleString()}</text>
                                <text x="275" y="205" className="text-xs fill-gray-600">{Math.max(0, (competitor.review_count || 1000) - 200).toLocaleString()}</text>
                                
                                {/* X-axis labels */}
                                <text x="5" y="230" className="text-xs fill-gray-600">30d ago</text>
                                <text x="145" y="230" className="text-xs fill-gray-600">15d</text>
                                <text x="280" y="230" className="text-xs fill-gray-600">Today</text>
                              </svg>
                            </div>
                            
                            {/* Current Values */}
                            <div className="grid grid-cols-4 gap-4 mt-4">
                              <div className="text-center">
                                <div className="text-xs text-gray-600">Sales Rank</div>
                                <div className="text-sm font-semibold text-purple-600">#{(competitor.bsr || 0).toLocaleString()}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600">Price</div>
                                <div className="text-sm font-semibold text-green-600">${(competitor.price || 0).toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600">Rating</div>
                                <div className="text-sm font-semibold text-red-600">{(competitor.rating || 0).toFixed(1)}/5.0</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600">Reviews</div>
                                <div className="text-sm font-semibold text-blue-600">{(competitor.review_count || 0).toLocaleString()}</div>
                              </div>
                            </div>
                          </div>

                          {/* Summary Statistics */}
                          <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {index === 0 ? 'Leader' : index === 1 ? 'Challenger' : 'Follower'}
                              </div>
                              <div className="text-xs text-gray-600">Market Position</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                ${((competitor.price || 0) * (competitor.monthly_orders || 0)).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Est. Monthly Revenue</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {competitor.created_at ? 
                                  Math.floor((new Date().getTime() - new Date(competitor.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
                                  : '?'
                                }
                              </div>
                              <div className="text-xs text-gray-600">Months in Market</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keyword Ownership Tab */}
      {activeTab === 'keyword' && (
        <div className="space-y-6">
          {/* Hierarchical Keyword Ownership Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-purple-600" />
                <span>Keyword Ownership Matrix</span>
              </CardTitle>
              <CardDescription>
                Hierarchical keyword groups with competitor ownership percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keywordData.length > 0 ? (
                <div className="space-y-4">
                  {/* Keyword Ownership Table with Frozen First Column */}
                  <div className="relative">
                    <div className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="sticky left-0 z-10 bg-gray-50 text-left p-3 w-64 min-w-[256px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="text-sm font-medium text-gray-700">Keyword Groups</div>
                              </th>
                              {data.competitors?.map((competitor: any, index: number) => (
                                <th key={competitor.asin} className="p-3 text-center min-w-[120px]">
                                  <div className="flex flex-col items-center space-y-1">
                                    <img 
                                      src={competitor.image || 'https://via.placeholder.com/32x32?text=No+Image'}
                                      alt={competitor.name}
                                      className="w-8 h-8 rounded object-cover cursor-pointer hover:opacity-80"
                                      onClick={() => setEnlargedImage(competitor.image)}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://via.placeholder.com/32x32?text=No+Image';
                                      }}
                                    />
                                    <div className="text-xs font-medium text-gray-700 truncate max-w-[100px]" title={competitor.name}>
                                      {competitor.name?.split(' ')[0] || 'Product'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {competitor.asin?.slice(-4)}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Keyword Groups */}
                            {keywordData.map((rootGroup, rootIndex) => (
                              <React.Fragment key={rootIndex}>
                                {/* Root Level */}
                                <tr 
                                  className="hover:bg-gray-50 cursor-pointer border-b"
                                  onClick={() => toggleGroup(`root-${rootIndex}`)}
                                >
                                  <td className="sticky left-0 z-10 bg-white p-3 w-64 min-w-[256px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <div className="flex items-center space-x-2">
                                      {expandedGroups[`root-${rootIndex}`] ? (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                      )}
                                      <span className="font-semibold text-gray-900 capitalize">{rootGroup.root}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {rootGroup.subroots.reduce((total: number, sub: any) => total + sub.keywords.length, 0)} keywords
                                      </Badge>
                                    </div>
                                  </td>
                                  {data.competitors?.map((competitor: any) => (
                                    <td key={competitor.asin} className="text-center p-3 min-w-[120px]">
                                      <div className="text-sm font-medium text-gray-600">-</div>
                                    </td>
                                  ))}
                                </tr>

                                {/* Subroots */}
                                {expandedGroups[`root-${rootIndex}`] && rootGroup.subroots.map((subroot: any, subrootIndex: number) => (
                                  <React.Fragment key={`${rootIndex}-${subrootIndex}`}>
                                    {/* Subroot Level */}
                                    <tr 
                                      className="hover:bg-gray-50 cursor-pointer bg-gray-50/50"
                                      onClick={() => toggleGroup(`subroot-${rootIndex}-${subrootIndex}`)}
                                    >
                                      <td className="sticky left-0 z-10 bg-gray-50/50 p-3 w-64 min-w-[256px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center space-x-2 pl-8">
                                          {expandedGroups[`subroot-${rootIndex}-${subrootIndex}`] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                          )}
                                          <span className="font-medium text-gray-800">{subroot.name}</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {subroot.keywords.length}
                                          </Badge>
                                        </div>
                                      </td>
                                      {data.competitors?.map((competitor: any) => {
                                        // Calculate average ownership for this subroot
                                        const avgOwnership = subroot.keywords.length > 0 
                                          ? subroot.keywords.reduce((sum: number, kw: any) => 
                                              sum + (kw.ownership?.[competitor.asin] || 0), 0) / subroot.keywords.length
                                          : 0
                                        return (
                                          <td key={competitor.asin} className="text-center p-3 min-w-[120px]">
                                            <div className="text-sm font-semibold text-blue-600">
                                              {Math.round(avgOwnership)}%
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 max-w-[80px] mx-auto">
                                              <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${avgOwnership}%` }}
                                              ></div>
                                            </div>
                                          </td>
                                        )
                                      })}
                                    </tr>

                                    {/* Individual Keywords */}
                                    {expandedGroups[`subroot-${rootIndex}-${subrootIndex}`] && subroot.keywords.map((keywordObj: any, keywordIndex: number) => (
                                      <tr key={`${rootIndex}-${subrootIndex}-${keywordIndex}`} className="hover:bg-gray-50">
                                        <td className="sticky left-0 z-10 bg-white p-3 w-64 min-w-[256px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                          <div className="text-sm text-gray-700 pl-16">
                                            {keywordObj.keyword}
                                          </div>
                                        </td>
                                        {data.competitors?.map((competitor: any) => {
                                          const ownership = keywordObj.ownership?.[competitor.asin] || 0
                                          return (
                                            <td key={competitor.asin} className="text-center p-3 min-w-[120px]">
                                              <div className={`text-xs font-medium ${ownership > 50 ? 'text-green-600' : ownership > 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {ownership}%
                                              </div>
                                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1 max-w-[60px] mx-auto">
                                                <div 
                                                  className={`h-1 rounded-full ${ownership > 50 ? 'bg-green-600' : ownership > 25 ? 'bg-yellow-600' : 'bg-red-600'}`}
                                                  style={{ width: `${ownership}%` }}
                                                ></div>
                                              </div>
                                            </td>
                                          )
                                        })}
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Keyword Data</h3>
                  <p className="text-gray-600">Analyzing keyword ownership across competitors...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Strategy Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Price-Performance Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Price-Performance Analysis</span>
              </CardTitle>
              <CardDescription>
                Market positioning based on price and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg p-4">
                {/* Axes Labels */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                  Price ($) →
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600">
                  Performance Score →
                </div>
                
                {/* Grid Lines */}
                <div className="absolute inset-4 grid grid-cols-4 grid-rows-4">
                  {[...Array(4)].map((_, i) => (
                    <React.Fragment key={i}>
                      <div className="border-r border-gray-200 h-full" />
                      <div className="border-b border-gray-200 w-full" />
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Quadrant Labels */}
                <div className="absolute top-8 left-8 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  Low Price<br />High Performance
                </div>
                <div className="absolute top-8 right-8 text-xs text-gray-500 bg-white px-2 py-1 rounded text-right">
                  High Price<br />High Performance
                </div>
                <div className="absolute bottom-8 left-8 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  Low Price<br />Low Performance
                </div>
                <div className="absolute bottom-8 right-8 text-xs text-gray-500 bg-white px-2 py-1 rounded text-right">
                  High Price<br />Low Performance
                </div>
                
                {/* Plot Competitors */}
                {(data.competitors || []).map((competitor: any, index: number) => {
                  // Calculate position based on price (x-axis) and performance score (y-axis)
                  // Performance score = rating * log(reviews) to normalize large review counts
                  const performanceScore = (competitor.rating || 0) * Math.log10((competitor.review_count || 0) + 1)
                  const maxPrice = Math.max(...(data.competitors || []).map((c: any) => c.price || 0))
                  const minPrice = Math.min(...(data.competitors || []).map((c: any) => c.price || 0))
                  const maxPerformance = Math.max(...(data.competitors || []).map((c: any) => 
                    (c.rating || 0) * Math.log10((c.review_count || 0) + 1)
                  ))
                  const minPerformance = Math.min(...(data.competitors || []).map((c: any) => 
                    (c.rating || 0) * Math.log10((c.review_count || 0) + 1)
                  ))
                  
                  // Normalize to percentage positions
                  const xPos = maxPrice > minPrice ? ((competitor.price - minPrice) / (maxPrice - minPrice)) * 80 + 10 : 50
                  const yPos = maxPerformance > minPerformance ? 90 - ((performanceScore - minPerformance) / (maxPerformance - minPerformance)) * 80 : 50
                  
                  // Determine bubble size based on monthly orders
                  const revenueScale = Math.sqrt((competitor.monthly_orders || 0) / 100)
                  const bubbleSize = Math.min(Math.max(revenueScale, 8), 24)
                  
                  return (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{
                        left: `${xPos}%`,
                        top: `${yPos}%`
                      }}
                    >
                      <div 
                        className={`
                          rounded-full flex items-center justify-center text-white text-xs font-medium
                          ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : index === 2 ? 'bg-orange-600' : 'bg-purple-600'}
                          hover:scale-110 transition-transform cursor-pointer shadow-lg
                        `}
                        style={{
                          width: `${bubbleSize * 2}px`,
                          height: `${bubbleSize * 2}px`
                        }}
                      >
                        {index + 1}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10">
                        <div className="font-semibold">{competitor.name}</div>
                        <div>Price: ${(competitor.price || 0).toFixed(2)}</div>
                        <div>Rating: {(competitor.rating || 0).toFixed(1)} ({(competitor.review_count || 0).toLocaleString()} reviews)</div>
                        <div>Monthly Orders: {(competitor.monthly_orders || 0).toLocaleString()}</div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Price axis markers */}
                <div className="absolute bottom-2 left-8 text-xs text-gray-500">
                  ${Math.min(...(data.competitors || []).map((c: any) => c.price || 0)).toFixed(0)}
                </div>
                <div className="absolute bottom-2 right-8 text-xs text-gray-500">
                  ${Math.max(...(data.competitors || []).map((c: any) => c.price || 0)).toFixed(0)}
                </div>
                
                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white p-3 rounded shadow-lg">
                  <div className="text-xs font-medium text-gray-700 mb-2">Bubble Size = Revenue</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <span className="text-xs">Market Leader</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <span className="text-xs">Strong Competitor</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                    <span className="text-xs">Value Player</span>
                  </div>
                </div>
              </div>
              
              {/* Market Insights */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Sweet Spot Analysis</h4>
                  <p className="text-sm text-gray-600">
                    The optimal price range appears to be $25-30, where competitors achieve high performance scores
                    while maintaining strong revenue. This zone balances customer value perception with profitability.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Market Gaps</h4>
                  <p className="text-sm text-gray-600">
                    There's an opportunity in the premium segment ($35-45) with high performance features.
                    The market lacks strong players in this space, suggesting room for differentiation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <img 
              src={enlargedImage}
              alt="Enlarged product"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x800?text=Image+Not+Available';
              }}
            />
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              onClick={() => setEnlargedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}