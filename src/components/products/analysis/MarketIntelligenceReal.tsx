'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart,
  Megaphone,
  Users,
  MessageSquare,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react'

interface MarketIntelligenceRealProps {
  data: {
    hasData: boolean
    customerPersonas: any[]
    voiceOfCustomer: any
    emotionalTriggers: any[]
    rawReviews: any[]
    totalReviewsAnalyzed: number
    analysisDate: string
    updatedAt: string
  }
}

export default function MarketIntelligenceReal({ data }: MarketIntelligenceRealProps) {
  const [activeTab, setActiveTab] = useState('personas')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'personas', label: 'Customer Personas', icon: Users },
          { id: 'voice', label: 'Voice of Customer', icon: Megaphone },
          { id: 'emotions', label: 'Emotional Triggers', icon: Heart },
          { id: 'reviews', label: 'Raw Reviews', icon: MessageSquare }
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

      {/* Customer Personas Tab */}
      {activeTab === 'personas' && (
        <div className="space-y-6">
          {data.customerPersonas && data.customerPersonas.length > 0 ? (
            data.customerPersonas.map((persona, index) => {
              // Define colorful backgrounds for each persona
              const backgroundColors = [
                'bg-gradient-to-r from-blue-500 to-purple-600',
                'bg-gradient-to-r from-green-500 to-teal-600', 
                'bg-gradient-to-r from-orange-500 to-red-600',
                'bg-gradient-to-r from-purple-500 to-pink-600',
                'bg-gradient-to-r from-teal-500 to-cyan-600',
                'bg-gradient-to-r from-indigo-500 to-blue-600'
              ]
              const bgColor = backgroundColors[index % backgroundColors.length]
              
              return (
              <Card key={index} className="border border-gray-200 shadow-sm overflow-hidden">
                <div className={`${bgColor} p-6 border-b border-gray-200 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-full flex items-center justify-center">
                        <UserCheck className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{persona.name}</h3>
                        <p className="text-white text-opacity-90">{persona.demographics}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Motivations */}
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Motivations</h4>
                      <ul className="space-y-1">
                        {persona.motivations?.map((motivation: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{motivation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pain Points */}
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Pain Points</h4>
                      <ul className="space-y-1">
                        {persona.painPoints?.map((pain: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Buying Behavior */}
                  {persona.buyingBehavior && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Buying Behavior</h4>
                      <p className="text-sm text-gray-700">{persona.buyingBehavior}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No customer personas available</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Voice of Customer Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-orange-600" />
                <span>Voice of Customer Analysis</span>
              </CardTitle>
              <CardDescription>
                Direct insights from customer feedback and reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.voiceOfCustomer && Object.keys(data.voiceOfCustomer).length > 0 ? (
                <>
                  {/* Key Themes */}
                  {data.voiceOfCustomer.keyThemes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Key Themes</h4>
                      <div className="space-y-3">
                        {data.voiceOfCustomer.keyThemes.map((theme: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg bg-white">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{theme.theme}</h5>
                              <div className="flex items-center space-x-2">
                                <Badge variant={theme.sentiment === 'positive' ? 'default' : 'destructive'} className="text-xs">
                                  {theme.sentiment}
                                </Badge>
                              </div>
                            </div>
                            {theme.examples && (
                              <div className="text-xs text-gray-500 italic">
                                {theme.examples.slice(0, 2).map((example: string, i: number) => (
                                  <div key={i} className="mb-1">&ldquo;{example}&rdquo;</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Language */}
                  {data.voiceOfCustomer.customerLanguage && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Language</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium text-green-600 mb-2">Positive Terms</h5>
                          <div className="flex flex-wrap gap-1">
                            {data.voiceOfCustomer.customerLanguage.positiveTerms?.map((term: string, i: number) => (
                              <Badge key={i} variant="default" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-red-600 mb-2">Negative Terms</h5>
                          <div className="flex flex-wrap gap-1">
                            {data.voiceOfCustomer.customerLanguage.negativeTerms?.map((term: string, i: number) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-600 mb-2">Functional Terms</h5>
                          <div className="flex flex-wrap gap-1">
                            {data.voiceOfCustomer.customerLanguage.functionalTerms?.map((term: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Unmet Needs */}
                  {data.voiceOfCustomer.unmetNeeds && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Unmet Customer Needs</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {data.voiceOfCustomer.unmetNeeds.map((need: string, index: number) => (
                          <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                            <p className="text-sm text-gray-900">{need}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No Voice of Customer data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emotional Triggers Tab */}
      {activeTab === 'emotions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>Emotional Triggers Analysis</span>
              </CardTitle>
              <CardDescription>
                Psychological drivers that influence purchase decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.emotionalTriggers && data.emotionalTriggers.length > 0 ? (
                <div className="space-y-4">
                  {data.emotionalTriggers.map((trigger: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{trigger.trigger}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {trigger.intensity} intensity
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{trigger.description}</p>
                      
                      {trigger.examples && (
                        <div className="mb-3">
                          <h6 className="text-xs font-medium text-gray-700 mb-1">Examples:</h6>
                          <div className="text-xs text-gray-500 italic space-y-1">
                            {trigger.examples.slice(0, 2).map((example: string, i: number) => (
                              <div key={i}>&ldquo;{example}&rdquo;</div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {trigger.marketingOpportunity && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h6 className="text-xs font-medium text-blue-900 mb-1">Marketing Opportunity:</h6>
                          <p className="text-xs text-blue-800">{trigger.marketingOpportunity}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No emotional triggers data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Raw Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Raw Review Data</span>
              </CardTitle>
              <CardDescription>
                Customer reviews from Amazon {data.rawReviews && data.rawReviews.length > 0 ? `(${data.rawReviews.length} reviews)` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.rawReviews && data.rawReviews.length > 0 ? (
                <div className="space-y-4">
                  {data.rawReviews.map((review: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                          {review.verified_purchase && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(review.review_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {review.helpful_votes} of {review.total_votes} helpful
                          </div>
                        </div>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      )}

                      {/* Review Content */}
                      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {review.content}
                      </p>

                      {/* Review Metadata */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          {review.variant && (
                            <span className="text-xs text-gray-500">
                              Variant: <span className="font-medium">{review.variant}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex space-x-2">
                            {review.images.map((image: string, i: number) => (
                              <img
                                key={i}
                                src={image}
                                alt={`Review image ${i + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(image)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Enlarged review image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
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