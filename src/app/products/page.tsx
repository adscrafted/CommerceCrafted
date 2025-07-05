'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Mock Product Data (matching the IdeaBrowser style)
interface ProductOpportunity {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  category: string
  opportunityScore: number
  trendData: {
    name: string
    growth: string
    volume: string
    isRising: boolean
  }
  tags: string[]
}

const mockProducts: ProductOpportunity[] = [
  {
    id: 'smart-yoga-mat-1',
    title: 'Smart Yoga Mat with Posture Tracking & App Integration',
    subtitle: 'Premium fitness equipment opportunity',
    description: 'Growing demand for home fitness tech with 45% YoY growth. Low competition in smart yoga mat segment.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    category: 'Sports & Outdoors',
    opportunityScore: 85,
    trendData: {
      name: 'Smart yoga mats',
      growth: '+234%',
      volume: '45K',
      isRising: true
    },
    tags: ['Fitness', 'Smart Home', 'Wellness']
  },
  {
    id: 'organic-sleep-supplements-2',
    title: 'Organic Sleep Support Gummies with Melatonin & L-Theanine',
    subtitle: 'Natural health supplement opportunity',
    description: 'Massive demand in sleep aid market. Premium organic positioning available with 40% profit margins.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
    category: 'Health & Household',
    opportunityScore: 92,
    trendData: {
      name: 'Sleep gummies',
      growth: '+189%',
      volume: '89K',
      isRising: true
    },
    tags: ['Supplements', 'Organic', 'Sleep']
  },
  {
    id: 'pet-camera-treat-3',
    title: 'WiFi Pet Camera with Treat Dispenser & Two-Way Audio',
    subtitle: 'Smart pet care device',
    description: 'Pet tech market exploding. Gap in mid-premium segment ($60-80) with strong review potential.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    category: 'Pet Supplies',
    opportunityScore: 88,
    trendData: {
      name: 'Pet cameras',
      growth: '+156%',
      volume: '123K',
      isRising: true
    },
    tags: ['Pet Tech', 'Smart Home', 'Security']
  },
  {
    id: 'bamboo-kitchen-set-4',
    title: 'Bamboo Kitchen Utensil Set with Holder (12-Piece)',
    subtitle: 'Eco-friendly kitchen essentials',
    description: 'Sustainable kitchen products trending. Low competition for complete sets under $40.',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    category: 'Home & Kitchen',
    opportunityScore: 79,
    trendData: {
      name: 'Bamboo utensils',
      growth: '+98%',
      volume: '67K',
      isRising: true
    },
    tags: ['Eco-Friendly', 'Kitchen', 'Sustainable']
  },
  {
    id: 'wireless-charger-station-5',
    title: '3-in-1 Wireless Charging Station for Apple Devices',
    subtitle: 'Multi-device charging solution',
    description: 'High demand for all-in-one charging solutions. Gap in $30-50 price range with fast charging capabilities.',
    imageUrl: 'https://images.unsplash.com/photo-1609207825181-52d3214556dd?w=400&h=300&fit=crop',
    category: 'Electronics',
    opportunityScore: 83,
    trendData: {
      name: 'Wireless chargers',
      growth: '+167%',
      volume: '54K',
      isRising: true
    },
    tags: ['Tech Accessories', 'Apple', 'Charging']
  },
  {
    id: 'baby-milestone-cards-6',
    title: 'Baby Milestone Cards Set with Wooden Stand (48 Cards)',
    subtitle: 'Baby photography props',
    description: 'Growing trend in baby milestone photography. Premium sets under-served in $25-35 range.',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop',
    category: 'Baby Products',
    opportunityScore: 91,
    trendData: {
      name: 'Milestone cards',
      growth: '+245%',
      volume: '178K',
      isRising: true
    },
    tags: ['Baby Gifts', 'Photography', 'Keepsakes']
  },
  {
    id: 'led-desk-organizer-7',
    title: 'LED Desk Organizer with Wireless Charging Pad',
    subtitle: 'Smart office accessory',
    description: 'Remote work driving demand for premium desk accessories. Opportunity in multi-functional organizers.',
    imageUrl: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=400&h=300&fit=crop',
    category: 'Office Products',
    opportunityScore: 76,
    trendData: {
      name: 'Desk organizers',
      growth: '+134%',
      volume: '92K',
      isRising: true
    },
    tags: ['Office', 'Organization', 'Tech']
  },
  {
    id: 'collagen-face-mask-8',
    title: 'Gold Collagen Face Mask Set with Hyaluronic Acid (24 Pack)',
    subtitle: 'Premium skincare masks',
    description: 'K-beauty trend driving mask demand. Premium positioning available in multi-pack offerings.',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=300&fit=crop',
    category: 'Beauty & Personal Care',
    opportunityScore: 82,
    trendData: {
      name: 'Face masks',
      growth: '+198%',
      volume: '34K',
      isRising: true
    },
    tags: ['Skincare', 'K-Beauty', 'Anti-Aging']
  },
  {
    id: 'magnetic-tool-holder-9',
    title: 'Heavy Duty Magnetic Tool Holder Bar (18 inch)',
    subtitle: 'Workshop organization',
    description: 'DIY market growth creating demand for quality tool organization. Gap in heavy-duty options.',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop',
    category: 'Tools & Home Improvement',
    opportunityScore: 87,
    trendData: {
      name: 'Tool storage',
      growth: '+156%',
      volume: '78K',
      isRising: true
    },
    tags: ['Tools', 'Garage', 'Organization']
  }
]

export default function ProductDatabasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isGridView, setIsGridView] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)

  const productsPerPage = 12
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  const categories = ['All', 'Health & Household', 'Sports & Outdoors', 'Beauty & Personal Care', 'Home & Kitchen', 'Electronics', 'Toys & Games', 'Pet Supplies', 'Tools & Home Improvement', 'Office Products', 'Baby Products']

  useEffect(() => {
    let filtered = mockProducts

    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  return (
    <div className="bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">The Product Database</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover profitable Amazon product opportunities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              All Filters
            </Button>
            <div className="flex border rounded-lg">
              <Button
                variant={isGridView ? "default" : "outline"}
                size="sm"
                onClick={() => setIsGridView(true)}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={!isGridView ? "default" : "outline"}
                size="sm"
                onClick={() => setIsGridView(false)}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 mb-8 ${
          isGridView 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {currentProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                {/* Product Image with Trend Chart Overlay */}
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  {/* Trend Chart Overlay */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      <div className="text-xs text-gray-600">VIEW</div>
                    </div>
                    {/* Mini trend chart */}
                    <div className="w-24 h-12 mb-2">
                      <svg className="w-full h-full" viewBox="0 0 100 50">
                        <path
                          d="M5,40 Q25,30 45,25 T85,15"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          className="drop-shadow-sm"
                        />
                        <path
                          d="M5,40 Q25,30 45,25 T85,15 L85,45 L5,45 Z"
                          fill="url(#gradient)"
                          opacity="0.3"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="text-xs text-gray-600 flex justify-between">
                      <span>{product.trendData.volume}</span>
                      <span className="text-green-600 font-medium">{product.trendData.growth}</span>
                    </div>
                  </div>
                </div>

                {/* Product Content */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Opportunity Score */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Opportunity Score</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {product.opportunityScore}/100
                    </div>
                  </div>

                  {/* View Button */}
                  <Link href={`/products/${product.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            1-12 of 344 results
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 mr-4">
              Rows per page: 12
            </div>
            <div className="text-sm text-gray-600 mr-4">
              Page 1 of 29
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}