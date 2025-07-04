'use client'

import React, { useState } from 'react'
import DealOfTheDay from '@/components/DealOfTheDay'
import DealManagement from '@/components/DealManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  Users,
  TrendingUp,
  Zap,
  Star,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings
} from 'lucide-react'

export default function DealsPage() {
  const [userRole, setUserRole] = useState<'admin' | 'analyst' | 'user'>('user')
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([])
  const [savedProducts, setSavedProducts] = useState<string[]>([])

  const handleNewsletterSignup = (email: string) => {
    setSubscribedEmails(prev => [...prev, email])
    console.log('Newsletter signup:', email)
    // In production, this would call the newsletter service
  }

  const handleProductSave = (productId: string) => {
    setSavedProducts(prev => [...prev, productId])
    console.log('Product saved:', productId)
  }

  const handleAnalysisRequest = (productId: string) => {
    console.log('Analysis requested for product:', productId)
    // In production, this would navigate to the analysis page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Deal of the Day System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive newsletter and daily deal management for Amazon product research
          </p>
          
          {/* Role Switcher for Demo */}
          <div className="flex justify-center space-x-2">
            <Button 
              variant={userRole === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('user')}
            >
              User View
            </Button>
            <Button 
              variant={userRole === 'analyst' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('analyst')}
            >
              Analyst View
            </Button>
            <Button 
              variant={userRole === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserRole('admin')}
            >
              Admin View
            </Button>
          </div>
        </div>

        <Tabs defaultValue="daily-deal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily-deal">Daily Deal</TabsTrigger>
            <TabsTrigger value="management">Deal Management</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter Stats</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Daily Deal Tab */}
          <TabsContent value="daily-deal" className="space-y-6">
            <DealOfTheDay
              onNewsletterSignup={handleNewsletterSignup}
              onProductSave={handleProductSave}
              onAnalysisRequest={handleAnalysisRequest}
            />

            {/* Demo Status */}
            {(subscribedEmails.length > 0 || savedProducts.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Demo Actions Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {subscribedEmails.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Newsletter subscriptions: {subscribedEmails.length}</span>
                      <Badge variant="secondary">{subscribedEmails[subscribedEmails.length - 1]}</Badge>
                    </div>
                  )}
                  {savedProducts.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Products saved: {savedProducts.length}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deal Management Tab */}
          <TabsContent value="management">
            <DealManagement userRole={userRole} />
          </TabsContent>

          {/* Newsletter Stats Tab */}
          <TabsContent value="newsletter" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">15,420</div>
                  <div className="text-sm text-gray-600">Total Subscribers</div>
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800">+12.5% this month</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">34.2%</div>
                  <div className="text-sm text-gray-600">Average Open Rate</div>
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800">Industry: 21.5%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">8.7%</div>
                  <div className="text-sm text-gray-600">Average Click Rate</div>
                  <div className="mt-2">
                    <Badge className="bg-purple-100 text-purple-800">Industry: 2.3%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900">1.2%</div>
                  <div className="text-sm text-gray-600">Unsubscribe Rate</div>
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800">Very Low</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns (Last 30 Days)</CardTitle>
                <CardDescription>Campaigns ranked by open rate and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      subject: '🎮 Gaming Chair Opportunity - 450% ROI Potential',
                      openRate: 42.1,
                      clickRate: 12.3,
                      date: '2024-01-15',
                      revenue: '$89K'
                    },
                    {
                      subject: '🍳 Kitchen Gadget Analysis - Untapped $2.5M Market',
                      openRate: 38.9,
                      clickRate: 10.8,
                      date: '2024-01-10',
                      revenue: '$67K'
                    },
                    {
                      subject: '📱 Tech Accessories Deal - Premium Positioning Gap',
                      openRate: 36.4,
                      clickRate: 9.2,
                      date: '2024-01-08',
                      revenue: '$54K'
                    }
                  ].map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{campaign.subject}</h4>
                        <p className="text-sm text-gray-600">{campaign.date}</p>
                      </div>
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <div className="text-sm font-medium text-blue-600">{campaign.openRate}%</div>
                          <div className="text-xs text-gray-500">Opens</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-600">{campaign.clickRate}%</div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-purple-600">{campaign.revenue}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                    Daily Deal Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Hand-picked opportunities by research team</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Comprehensive market analysis and scoring</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time countdown timer for urgency</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Key insights and profit potential metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Direct integration with full analysis tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-500 mr-2" />
                    Newsletter System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Automated daily deal emails at 6 AM EST</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Beautiful HTML email templates</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Advanced open/click tracking and analytics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Easy one-click unsubscribe system</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Subscriber preference management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 text-purple-500 mr-2" />
                    Admin Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Deal creation and scheduling interface</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Campaign management and automation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Real-time campaign performance tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Subscriber analytics and segmentation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Calendar view for deal scheduling</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
                    Analytics & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Detailed email performance metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Subscriber growth and retention tracking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Revenue attribution from newsletter</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">A/B testing for subject lines and content</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Industry benchmark comparisons</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Implementation Status */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>Current status of Deal of the Day system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: 'Database Schema (Newsletter & Campaigns)', status: 'completed', description: 'Prisma models for subscriptions and campaigns' },
                    { feature: 'Deal of the Day Component', status: 'completed', description: 'Interactive daily deal display with countdown' },
                    { feature: 'Newsletter Service', status: 'completed', description: 'Subscription management and email generation' },
                    { feature: 'Deal Management Interface', status: 'completed', description: 'Admin interface for managing deals and campaigns' },
                    { feature: 'Email Templates', status: 'completed', description: 'HTML and text email templates' },
                    { feature: 'Analytics Dashboard', status: 'completed', description: 'Performance tracking and reporting' },
                    { feature: 'Email Service Integration', status: 'pending', description: 'SendGrid/AWS SES integration for production' },
                    { feature: 'Automated Scheduling', status: 'pending', description: 'Cron jobs for automated email sending' }
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