'use client'

import React from 'react'
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
  ShoppingCart
} from 'lucide-react'

interface LaunchStrategyProps {
  data: any
}

export default function LaunchStrategy({ data }: LaunchStrategyProps) {
  const launchData = data.launchStrategyData

  return (
    <div className="space-y-6">
      {/* Amazon Listing Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-orange-600" />
            <span>Simulated Amazon Listing Preview</span>
          </CardTitle>
          <CardDescription>
            How your product will appear on Amazon based on the launch strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-white p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image Side */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <img 
                    src={data.mainImage} 
                    alt={data.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>

              {/* Product Details Side */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {data.title}
                </h2>
                
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(launchData.targetMetrics.targetRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-blue-600">
                    {launchData.targetMetrics.reviewsNeeded} ratings
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${launchData.pricing.launchPrice}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${launchData.pricing.regularPrice}
                    </span>
                    <Badge className="bg-red-500 text-white">
                      {Math.round((1 - launchData.pricing.launchPrice / launchData.pricing.regularPrice) * 100)}% OFF
                    </Badge>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Limited Time Launch Price
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Best Seller Rank:</span> #{launchData.targetMetrics.estimatedBSR} in Health & Personal Care
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Ships from:</span> Amazon
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Sold by:</span> Your Brand
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Key Features:</div>
                  <ul className="space-y-1">
                    <li className="text-sm text-gray-700 flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Ultra-thin Bluetooth 5.0 speakers for side sleepers</span>
                    </li>
                    <li className="text-sm text-gray-700 flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>10-hour battery life with 2-hour quick charge</span>
                    </li>
                    <li className="text-sm text-gray-700 flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>100% blackout with adjustable memory foam padding</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 90-Day Launch Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>90-Day Launch Timeline</span>
          </CardTitle>
          <CardDescription>
            Week-by-week breakdown of launch activities and milestones
          </CardDescription>
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

      {/* Launch Metrics & Targets */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Launch Targets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Daily Sales Velocity</span>
                  <span className="text-lg font-semibold text-gray-900">{launchData.targetMetrics.dailySalesVelocity} units</span>
                </div>
                <div className="text-xs text-gray-500">To reach top 10 in subcategory</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Reviews Needed</span>
                  <span className="text-lg font-semibold text-gray-900">{launchData.targetMetrics.reviewsNeeded}</span>
                </div>
                <div className="text-xs text-gray-500">Within first 90 days</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Target Rating</span>
                  <span className="text-lg font-semibold text-gray-900">{launchData.targetMetrics.targetRating}★</span>
                </div>
                <div className="text-xs text-gray-500">Minimum acceptable rating</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Conversion Rate Goal</span>
                  <span className="text-lg font-semibold text-gray-900">{launchData.targetMetrics.conversionRate}%</span>
                </div>
                <div className="text-xs text-gray-500">From PPC and organic traffic</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Launch Investment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Initial Inventory</span>
                  <span className="text-lg font-semibold text-gray-900">${launchData.investment.initialInventory.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">{launchData.investment.unitsOrdered} units @ ${(launchData.investment.initialInventory / launchData.investment.unitsOrdered).toFixed(2)}/unit</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Marketing Budget</span>
                  <span className="text-lg font-semibold text-gray-900">${launchData.investment.marketingBudget.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">PPC, promotions, influencers</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Launch Cost</span>
                  <span className="text-lg font-semibold text-gray-900">${launchData.investment.totalLaunchCost.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">Including all fees and buffer</div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Break-even Timeline</span>
                  <span className="text-lg font-semibold text-green-600">{launchData.investment.breakEvenDays} days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PPC Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <span>PPC Launch Strategy</span>
          </CardTitle>
          <CardDescription>
            Advertising strategy to achieve launch velocity targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {launchData.ppcStrategy.campaigns.map((campaign: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{campaign.type}</h4>
                  <Badge variant={campaign.priority === 'High' ? 'destructive' : 'secondary'}>
                    {campaign.priority}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Budget:</span>
                    <span className="font-medium">${campaign.dailyBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target ACoS:</span>
                    <span className="font-medium">{campaign.targetAcos}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bid Strategy:</span>
                    <span className="font-medium">{campaign.bidStrategy}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-gray-600">{campaign.keywords} keywords</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">PPC Launch Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Start with exact match keywords for first 2 weeks</li>
                  <li>• Gradually add phrase and broad match as data comes in</li>
                  <li>• Monitor ACoS daily and adjust bids every 48 hours</li>
                  <li>• Use negative keywords from competitor ASINs</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotional Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Promotional Strategy</span>
          </CardTitle>
          <CardDescription>
            Discounts and promotions to drive initial sales velocity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {launchData.promotions.map((promo: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{promo.type}</h4>
                  <Badge className="bg-green-100 text-green-700">
                    {promo.discount}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium">{promo.duration}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Target:</span>
                    <div className="font-medium">{promo.target}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Goal:</span>
                    <div className="font-medium">{promo.goal}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}