'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  Edit3,
  Eye,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  DollarSign,
  CheckCircle,
  AlertCircle,
  CalendarCheck
} from 'lucide-react'

interface DealProduct {
  id: string
  asin: string
  title: string
  category: string
  brand: string
  price: number
  rating: number
  reviewCount: number
  imageUrl: string
  opportunityScore: number
  estimatedRevenue: number
  competitionLevel: string
  demandTrend: string
  status: 'active' | 'scheduled' | 'draft' | 'archived'
  featuredDate?: Date
  headline?: string
  summary?: string
}

interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  campaignType: string
  featuredProductId?: string
  scheduledDate: Date
  sentDate?: Date
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  recipientCount: number
  openRate?: number
  clickRate?: number
}

interface DealManagementProps {
  className?: string
  userRole?: 'admin' | 'analyst' | 'user'
}

export default function DealManagement({ className, userRole = 'admin' }: DealManagementProps) {
  const [activeTab, setActiveTab] = useState('deals')
  const [deals, setDeals] = useState<DealProduct[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [selectedDeal, setSelectedDeal] = useState<DealProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - in production, fetch from API
  useEffect(() => {
    setTimeout(() => {
      const mockDeals: DealProduct[] = [
        {
          id: 'deal-001',
          asin: 'B08N5WRWNW',
          title: 'Wireless Noise Cancelling Bluetooth Headphones',
          category: 'Electronics',
          brand: 'TechSound Pro',
          price: 79.99,
          rating: 4.3,
          reviewCount: 2847,
          imageUrl: '/api/placeholder/100/100',
          opportunityScore: 8.5,
          estimatedRevenue: 24500,
          competitionLevel: 'medium',
          demandTrend: 'rising',
          status: 'active',
          featuredDate: new Date(),
          headline: 'Premium Audio Market Gap',
          summary: 'Strong growth potential with clear differentiation opportunities'
        },
        {
          id: 'deal-002',
          asin: 'B07X8K9PQR',
          title: 'Smart Home Security Camera System',
          category: 'Electronics',
          brand: 'SecureVision',
          price: 149.99,
          rating: 4.1,
          reviewCount: 1523,
          imageUrl: '/api/placeholder/100/100',
          opportunityScore: 7.8,
          estimatedRevenue: 32000,
          competitionLevel: 'high',
          demandTrend: 'stable',
          status: 'scheduled',
          featuredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          headline: 'Home Security Boom',
          summary: 'Growing market with premium positioning opportunities'
        },
        {
          id: 'deal-003',
          asin: 'B09M8N7K6L',
          title: 'Ergonomic Office Chair with Lumbar Support',
          category: 'Home & Office',
          brand: 'ComfortDesk',
          price: 199.99,
          rating: 4.5,
          reviewCount: 3421,
          imageUrl: '/api/placeholder/100/100',
          opportunityScore: 9.2,
          estimatedRevenue: 45000,
          competitionLevel: 'low',
          demandTrend: 'rising',
          status: 'draft',
          headline: 'WFH Furniture Surge',
          summary: 'Remote work driving massive demand growth'
        }
      ]

      const mockCampaigns: NewsletterCampaign[] = [
        {
          id: 'camp-001',
          name: 'Daily Deal - Wireless Headphones',
          subject: '🔥 Today\'s Opportunity: Premium Audio Market Gap',
          campaignType: 'daily_deal',
          featuredProductId: 'deal-001',
          scheduledDate: new Date(),
          sentDate: new Date(),
          status: 'sent',
          recipientCount: 15420,
          openRate: 34.2,
          clickRate: 8.7
        },
        {
          id: 'camp-002',
          name: 'Daily Deal - Security Camera',
          subject: '🎯 Tomorrow\'s Pick: Home Security Boom',
          campaignType: 'daily_deal',
          featuredProductId: 'deal-002',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'scheduled',
          recipientCount: 15420
        }
      ]

      setDeals(mockDeals)
      setCampaigns(mockCampaigns)
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.asin.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateDeal = () => {
    // Navigate to deal creation form
    console.log('Creating new deal...')
  }

  const handleEditDeal = (dealId: string) => {
    console.log('Editing deal:', dealId)
  }

  const handleScheduleDeal = (dealId: string, date: Date) => {
    console.log('Scheduling deal:', dealId, 'for', date)
  }

  const handleSendCampaign = (campaignId: string) => {
    console.log('Sending campaign:', campaignId)
  }

  if (userRole !== 'admin' && userRole !== 'analyst') {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Access denied. Admin or Analyst role required.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
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
                <Settings className="h-6 w-6 mr-2 text-blue-600" />
                Deal Management
              </CardTitle>
              <CardDescription>
                Manage daily deals, newsletter campaigns, and product scheduling
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateDeal}>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deals">Deal Products</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
          <TabsTrigger value="schedule">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Deal Products Tab */}
        <TabsContent value="deals" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deals by title, brand, or ASIN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Filter by Date
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Deals List */}
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={deal.imageUrl} 
                      alt={deal.title}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{deal.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{deal.brand}</Badge>
                            <Badge variant="secondary">{deal.category}</Badge>
                            <Badge className={getStatusColor(deal.status)}>
                              {deal.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDeal(deal.id)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <Target className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                          <div className={`font-bold ${getScoreColor(deal.opportunityScore)}`}>
                            {deal.opportunityScore}/10
                          </div>
                          <div className="text-xs text-gray-600">Score</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                          <div className="font-bold text-green-600">
                            {formatCurrency(deal.estimatedRevenue)}
                          </div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <Users className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                          <Badge className={`text-xs ${getCompetitionColor(deal.competitionLevel)}`}>
                            {deal.competitionLevel}
                          </Badge>
                          <div className="text-xs text-gray-600">Competition</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <TrendingUp className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                          <div className="font-bold text-purple-600 capitalize">
                            {deal.demandTrend}
                          </div>
                          <div className="text-xs text-gray-600">Trend</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <Star className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                          <div className="font-bold text-gray-900">
                            {deal.rating}
                          </div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>

                      {deal.headline && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">{deal.headline}</h4>
                          <p className="text-sm text-blue-700">{deal.summary}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {deal.featuredDate && (
                            <span>Featured: {deal.featuredDate.toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {deal.status === 'draft' && (
                            <Button size="sm" onClick={() => handleScheduleDeal(deal.id, new Date())}>
                              <CalendarCheck className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-1" />
                            Create Campaign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{campaign.name}</h3>
                      <p className="text-gray-600 mt-1">{campaign.subject}</p>
                      
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Recipients: {campaign.recipientCount.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          Scheduled: {campaign.scheduledDate.toLocaleDateString()}
                        </span>
                      </div>

                      {campaign.status === 'sent' && campaign.openRate && (
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{campaign.openRate}%</div>
                            <div className="text-xs text-gray-600">Open Rate</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{campaign.clickRate}%</div>
                            <div className="text-xs text-gray-600">Click Rate</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-bold text-purple-600">
                              {Math.floor((campaign.openRate / 100) * campaign.recipientCount)}
                            </div>
                            <div className="text-xs text-gray-600">Opens</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {campaign.status === 'scheduled' && (
                        <Button size="sm" onClick={() => handleSendCampaign(campaign.id)}>
                          <Send className="h-4 w-4 mr-1" />
                          Send Now
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Deal Calendar</h3>
                <p className="text-gray-600">Calendar view for scheduling deals and campaigns</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">15,420</div>
                <div className="text-sm text-gray-600">Total Subscribers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">34.2%</div>
                <div className="text-sm text-gray-600">Avg Open Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">8.7%</div>
                <div className="text-sm text-gray-600">Avg Click Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">28</div>
                <div className="text-sm text-gray-600">Campaigns Sent</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}