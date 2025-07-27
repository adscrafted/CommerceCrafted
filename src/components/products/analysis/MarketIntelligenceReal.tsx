'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Heart,
  Megaphone,
  Users,
  MessageSquare,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import VoiceOfCustomerEnhanced from './VoiceOfCustomerEnhanced'

interface MarketIntelligenceRealProps {
  data: {
    hasData: boolean
    customerPersonas: any[]
    voiceOfCustomer: any
    voiceOfCustomerEnhanced?: any
    emotionalTriggers: any[]
    rawReviews: any[]
    totalReviewsAnalyzed: number
    analysisDate: string
    updatedAt: string
  }
}

export default function MarketIntelligenceReal({ data }: MarketIntelligenceRealProps) {
  // If we only have raw reviews, default to the reviews tab
  const defaultTab = (!data.hasData && data.rawReviews && data.rawReviews.length > 0) ? 'reviews' : 'personas'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 10

  return (
    <div className="space-y-6">
      {/* Alert when no AI analysis is available */}
      {!data.hasData && data.rawReviews && data.rawReviews.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                AI Analysis Not Yet Available
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                We have collected {data.totalReviewsAnalyzed || data.rawReviews.length} customer reviews for this product. 
                AI-powered insights including customer personas, emotional triggers, and voice of customer analysis 
                will be generated soon. For now, you can browse the raw review data below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation - Responsive */}
      <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'personas', label: 'Customer Personas', icon: Users, shortLabel: 'Personas' },
          { id: 'voice', label: 'Voice of Customer', icon: Megaphone, shortLabel: 'Voice' },
          { id: 'emotions', label: 'Emotional Triggers', icon: Heart, shortLabel: 'Emotions' },
          { id: 'reviews', label: 'Raw Reviews', icon: MessageSquare, shortLabel: 'Reviews' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setCurrentPage(1) // Reset pagination when switching tabs
            }}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-initial ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
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
                <div className={`${bgColor} p-4 sm:p-6 border-b border-gray-200 text-white`}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{persona.name}</h3>
                      <p className="text-white text-opacity-90 text-sm sm:text-base">{persona.demographics}</p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

                  {/* Representative Reviews */}
                  {persona.reviewExamples && persona.reviewExamples.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                        Representative Reviews from This Persona
                      </h4>
                      <div className="space-y-3">
                        {persona.reviewExamples.map((review: any, reviewIndex: number) => (
                          <div key={reviewIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              {review.date && (
                                <span className="text-xs text-gray-500">{review.date}</span>
                              )}
                            </div>
                            <blockquote className="text-sm text-gray-700 italic leading-relaxed">
                              &ldquo;{review.text}&rdquo;
                            </blockquote>
                            {review.helpfulVotes && review.helpfulVotes > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                {review.helpfulVotes} people found this helpful
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-gray-500 italic">
                        These reviews were identified as representative of this customer persona based on language patterns, 
                        concerns expressed, and purchase motivations mentioned.
                      </div>
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
          {data.voiceOfCustomerEnhanced ? (
            <VoiceOfCustomerEnhanced data={data.voiceOfCustomerEnhanced} />
          ) : data.voiceOfCustomer && Object.keys(data.voiceOfCustomer).length > 0 ? (
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No Voice of Customer data available</p>
              </CardContent>
            </Card>
          )}
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
                  {/* Pagination Info */}
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                    <span>
                      Showing {((currentPage - 1) * reviewsPerPage) + 1} to{' '}
                      {Math.min(currentPage * reviewsPerPage, data.rawReviews.length)} of{' '}
                      {data.rawReviews.length} reviews
                    </span>
                  </div>

                  {/* Reviews */}
                  {data.rawReviews
                    .slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage)
                    .map((review: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4 bg-white">
                      {/* Review Header - Responsive */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{review.reviewer_name}</span>
                            {review.verified_purchase && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.review_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {review.helpful_votes} of {review.total_votes} helpful
                          </div>
                        </div>
                      </div>

                      {/* Review Title */}
                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{review.title}</h4>
                      )}

                      {/* Review Content */}
                      <p className="text-gray-700 text-xs sm:text-sm mb-3 leading-relaxed">
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
                          <p className="text-xs text-gray-500 mb-2">Customer images (click to enlarge):</p>
                          <div className="flex flex-wrap gap-2">
                            {review.images.map((image: string, i: number) => (
                              <div 
                                key={i}
                                className="relative group cursor-pointer"
                                onClick={() => setSelectedImage(image)}
                              >
                                <img
                                  src={image}
                                  alt={`Review image ${i + 1}`}
                                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-all"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Pagination Controls */}
                  {data.rawReviews.length > reviewsPerPage && (
                    <div className="flex justify-center items-center space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {/* Page numbers */}
                        {(() => {
                          const totalPages = Math.ceil(data.rawReviews.length / reviewsPerPage)
                          const pages = []
                          
                          // Always show first page
                          pages.push(
                            <Button
                              key={1}
                              variant={currentPage === 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="w-10"
                            >
                              1
                            </Button>
                          )
                          
                          // Show ellipsis if needed
                          if (currentPage > 3) {
                            pages.push(<span key="ellipsis1" className="px-2">...</span>)
                          }
                          
                          // Show pages around current page
                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={currentPage === i ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(i)}
                                className="w-10"
                              >
                                {i}
                              </Button>
                            )
                          }
                          
                          // Show ellipsis if needed
                          if (currentPage < totalPages - 2) {
                            pages.push(<span key="ellipsis2" className="px-2">...</span>)
                          }
                          
                          // Always show last page if there's more than one page
                          if (totalPages > 1) {
                            pages.push(
                              <Button
                                key={totalPages}
                                variant={currentPage === totalPages ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-10"
                              >
                                {totalPages}
                              </Button>
                            )
                          }
                          
                          return pages
                        })()}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(data.rawReviews.length / reviewsPerPage), prev + 1))}
                        disabled={currentPage === Math.ceil(data.rawReviews.length / reviewsPerPage)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
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

      {/* Enhanced Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative flex items-center justify-center w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image */}
            <img
              src={selectedImage}
              alt="Enlarged review image"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all"
              aria-label="Close image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image Info (optional) */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
              Click outside image to close
            </div>
          </div>
        </div>
      )}
    </div>
  )
}