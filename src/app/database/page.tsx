'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  DollarSign,
  FileText,
  MessageSquare,
  Rocket,
  Calculator,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Mock products data with all scores
const mockProducts = [
  {
    id: 1,
    slug: 'smart-bluetooth-sleep-mask-with-built-in-speakers',
    title: 'Smart Bluetooth Sleep Mask with Built-in Speakers',
    mainImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
    opportunityScore: 87,
    scores: {
      demand: 92,
      competition: 78,
      keywords: 85,
      listing: 82,
      intelligence: 88,
      launch: 90,
      financial: 88
    },
    category: 'Health & Personal Care',
    price: '$29.99',
    reviews: '36.6K'
  },
  {
    id: 2,
    slug: 'portable-car-jump-starter',
    title: 'Portable Car Jump Starter with Air Compressor',
    mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    opportunityScore: 82,
    scores: {
      demand: 88,
      competition: 72,
      keywords: 80,
      listing: 78,
      intelligence: 85,
      launch: 82,
      financial: 84
    },
    category: 'Automotive',
    price: '$89.99',
    reviews: '12.3K'
  },
  {
    id: 3,
    slug: 'adjustable-laptop-stand',
    title: 'Adjustable Laptop Stand for Desk',
    mainImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop',
    opportunityScore: 79,
    scores: {
      demand: 85,
      competition: 68,
      keywords: 82,
      listing: 75,
      intelligence: 80,
      launch: 78,
      financial: 81
    },
    category: 'Office Products',
    price: '$34.99',
    reviews: '8.7K'
  },
  {
    id: 4,
    slug: 'bamboo-cutting-board-set',
    title: 'Bamboo Cutting Board Set with Compartments',
    mainImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&h=100&fit=crop',
    opportunityScore: 75,
    scores: {
      demand: 78,
      competition: 82,
      keywords: 76,
      listing: 72,
      intelligence: 74,
      launch: 70,
      financial: 77
    },
    category: 'Home & Kitchen',
    price: '$42.99',
    reviews: '5.2K'
  },
  {
    id: 5,
    slug: 'pet-grooming-gloves',
    title: 'Pet Grooming Gloves with Enhanced Five Finger Design',
    mainImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop',
    opportunityScore: 73,
    scores: {
      demand: 80,
      competition: 65,
      keywords: 74,
      listing: 70,
      intelligence: 76,
      launch: 72,
      financial: 75
    },
    category: 'Pet Supplies',
    price: '$15.99',
    reviews: '22.1K'
  }
]

export default function ProductDatabasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isGridView, setIsGridView] = useState(false) // Default to list view
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // Filter products based on search
  const filteredProducts = mockProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white min-h-screen">
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

        {/* Products List */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {displayedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 h-full">
                    <div className="p-8">
                      {/* Header with product info */}
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={product.mainImage}
                            alt={product.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                              <span className="text-sm text-gray-500">{product.price}</span>
                              <span className="text-sm text-gray-500">• {product.reviews} reviews</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h2>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">
                              {product.opportunityScore}
                            </div>
                            <div className="text-xs text-gray-600">Opportunity</div>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Progress Bars */}
                      <div className="mt-6 pt-6 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs font-medium text-gray-700">Market Intelligence</span>
                            </div>
                            <Progress value={product.scores.intelligence} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-gray-700">Demand Analysis</span>
                            </div>
                            <Progress value={product.scores.demand} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Target className="h-3 w-3 text-red-600" />
                              <span className="text-xs font-medium text-gray-700">Competition</span>
                            </div>
                            <Progress value={product.scores.competition} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Search className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-gray-700">Keywords</span>
                            </div>
                            <Progress value={product.scores.keywords} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-3 w-3 text-emerald-600" />
                              <span className="text-xs font-medium text-gray-700">Financial</span>
                            </div>
                            <Progress value={product.scores.financial} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3 text-purple-600" />
                              <span className="text-xs font-medium text-gray-700">Listing</span>
                            </div>
                            <Progress value={product.scores.listing} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Rocket className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-medium text-gray-700">Launch Strategy</span>
                            </div>
                            <Progress value={product.scores.launch} className="h-2 [&>div]:bg-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} results
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 mr-4">
                  Rows per page: {productsPerPage}
                </div>
                <div className="text-sm text-gray-600 mr-4">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              No products match your search criteria. Try adjusting your filters or search terms.
            </p>
            <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  )
}