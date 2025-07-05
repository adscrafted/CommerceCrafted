'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  Calendar,
  Star,
  Heart,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
  Archive,
  Clock,
  Target,
  DollarSign,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface PreviousIdea {
  id: string
  title: string
  category: string
  description: string
  opportunityScore: number
  status: 'saved' | 'researched' | 'launched' | 'archived'
  dateGenerated: string
  demandLevel: 'Low' | 'Medium' | 'High'
  competitionLevel: 'Low' | 'Medium' | 'High'
  profitPotential: string
  estimatedRevenue: string
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
  tags: string[]
  isFavorite: boolean
  notes?: string
  imageUrl: string
}

const mockPreviousIdeas: PreviousIdea[] = [
  {
    id: 'idea-001',
    title: 'Smart Plant Care Monitor with AI Growth Optimization',
    category: 'Home & Garden',
    description: 'An IoT device that monitors soil moisture, light levels, and temperature while providing AI-powered recommendations for optimal plant growth.',
    opportunityScore: 89,
    status: 'researched',
    dateGenerated: '2024-07-03',
    demandLevel: 'High',
    competitionLevel: 'Medium',
    profitPotential: 'High',
    estimatedRevenue: '$2.3M - $4.7M',
    trend: 'up',
    trendPercentage: 34.2,
    tags: ['IoT', 'AI Technology', 'Subscription Model'],
    isFavorite: true,
    notes: 'Great potential for recurring revenue through app subscriptions',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },
  {
    id: 'idea-002',
    title: 'Eco-Friendly Phone Case with Built-in Solar Charger',
    category: 'Electronics',
    description: 'Biodegradable phone cases made from sustainable materials with integrated solar panels for emergency charging.',
    opportunityScore: 76,
    status: 'saved',
    dateGenerated: '2024-07-02',
    demandLevel: 'Medium',
    competitionLevel: 'High',
    profitPotential: 'Medium',
    estimatedRevenue: '$800K - $1.5M',
    trend: 'stable',
    trendPercentage: 5.1,
    tags: ['Eco-Friendly', 'Solar Tech', 'Mobile Accessories'],
    isFavorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'
  },
  {
    id: 'idea-003',
    title: 'Personalized Pet Nutrition Subscription Box',
    category: 'Pet Supplies',
    description: 'Custom pet food and treats based on breed, age, health conditions, and dietary preferences with vet consultation.',
    opportunityScore: 84,
    status: 'launched',
    dateGenerated: '2024-06-28',
    demandLevel: 'High',
    competitionLevel: 'Medium',
    profitPotential: 'High',
    estimatedRevenue: '$1.8M - $3.2M',
    trend: 'up',
    trendPercentage: 22.8,
    tags: ['Subscription Box', 'Pet Health', 'Personalization'],
    isFavorite: true,
    notes: 'Currently in development phase with local vet partnerships',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=300&fit=crop'
  },
  {
    id: 'idea-004',
    title: 'Smart Sleep Mask with Brain Wave Monitoring',
    category: 'Health & Wellness',
    description: 'Advanced sleep mask that tracks brain waves, optimizes light exposure, and provides personalized sleep improvement recommendations.',
    opportunityScore: 71,
    status: 'archived',
    dateGenerated: '2024-06-25',
    demandLevel: 'Medium',
    competitionLevel: 'High',
    profitPotential: 'Medium',
    estimatedRevenue: '$600K - $1.2M',
    trend: 'down',
    trendPercentage: -8.3,
    tags: ['Sleep Tech', 'Health Monitoring', 'Wearables'],
    isFavorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop'
  },
  {
    id: 'idea-005',
    title: 'Modular Kitchen Organization System',
    category: 'Home & Kitchen',
    description: 'Customizable storage solutions with magnetic attachments and smart inventory tracking for pantry management.',
    opportunityScore: 78,
    status: 'saved',
    dateGenerated: '2024-06-20',
    demandLevel: 'Medium',
    competitionLevel: 'Low',
    profitPotential: 'High',
    estimatedRevenue: '$1.2M - $2.1M',
    trend: 'up',
    trendPercentage: 18.5,
    tags: ['Home Organization', 'Modular Design', 'Smart Home'],
    isFavorite: false,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
  },
  {
    id: 'idea-006',
    title: 'AR-Enhanced Workout Mirror',
    category: 'Fitness',
    description: 'Interactive mirror with augmented reality personal trainer that corrects form and provides real-time feedback.',
    opportunityScore: 82,
    status: 'researched',
    dateGenerated: '2024-06-18',
    demandLevel: 'High',
    competitionLevel: 'High',
    profitPotential: 'High',
    estimatedRevenue: '$2.5M - $5.0M',
    trend: 'up',
    trendPercentage: 41.7,
    tags: ['AR Technology', 'Fitness', 'Home Gym'],
    isFavorite: true,
    notes: 'High competition but strong differentiation potential',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
  }
]

export default function PreviousIdeasPage() {
  const [ideas, setIdeas] = useState(mockPreviousIdeas)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'saved', label: 'Saved' },
    { value: 'researched', label: 'Researched' },
    { value: 'launched', label: 'Launched' },
    { value: 'archived', label: 'Archived' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Home & Garden', label: 'Home & Garden' },
    { value: 'Pet Supplies', label: 'Pet Supplies' },
    { value: 'Health & Wellness', label: 'Health & Wellness' },
    { value: 'Home & Kitchen', label: 'Home & Kitchen' },
    { value: 'Fitness', label: 'Fitness' }
  ]

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || idea.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.dateGenerated).getTime() - new Date(a.dateGenerated).getTime()
      case 'score':
        return b.opportunityScore - a.opportunityScore
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const handleToggleFavorite = (ideaId: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === ideaId ? { ...idea, isFavorite: !idea.isFavorite } : idea
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-blue-100 text-blue-800'
      case 'researched': return 'bg-yellow-100 text-yellow-800'
      case 'launched': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Previous Product Ideas</h1>
          <p className="text-gray-600">Review and manage your saved product ideas and research</p>
        </div>


        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search ideas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="title">Sort by Title</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedIdeas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Image Header */}
                <div className="relative">
                  <img
                    src={idea.imageUrl}
                    alt={idea.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <div className="bg-white rounded-full p-1">
                      {getTrendIcon(idea.trend)}
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(idea.id)}
                      className="bg-white rounded-full p-1 hover:bg-gray-50"
                    >
                      <Heart className={`h-4 w-4 ${idea.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-white px-2 py-1 rounded text-sm font-semibold">
                      {idea.opportunityScore}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {idea.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {idea.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">Revenue Est.</div>
                      <div className="text-sm font-medium">{idea.estimatedRevenue.split(' - ')[0]}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-xs text-gray-600">Trend</div>
                      <div className="text-sm font-medium">
                        {idea.trend === 'up' ? '+' : idea.trend === 'down' ? '' : '±'}{idea.trendPercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {idea.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {idea.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{idea.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Notes */}
                  {idea.notes && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">{idea.notes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(idea.dateGenerated)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {sortedIdeas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start generating product ideas to see them here'
                }
              </p>
              <div className="space-x-3">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setCategoryFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
                <Link href="/next-idea">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Generate New Idea
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination would go here in a real app */}
      </div>
    </div>
  )
}