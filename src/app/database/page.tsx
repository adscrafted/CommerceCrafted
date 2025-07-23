'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
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
  BarChart3,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Niche {
  id: string
  slug: string
  title: string
  mainImage: string
  productCount: number
  opportunityScore: number
  scores: {
    demand: number
    competition: number
    keywords: number
    listing: number
    intelligence: number
    launch: number
    financial: number
  }
  category: string
  avgPrice: string
  totalReviews: number
  monthlyRevenue: number
  competitionLevel: string
}

export default function NicheDatabasePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isGridView, setIsGridView] = useState(true) // Default to grid view
  const [currentPage, setCurrentPage] = useState(1)
  const [niches, setNiches] = useState<Niche[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const nichesPerPage = 12
  const filterRef = useRef<HTMLDivElement>(null)

  // Get unique categories from niches
  const categories = Array.from(new Set(niches.map(n => n.category))).sort()

  // Click outside handler for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])

  // Fetch niches from database
  useEffect(() => {
    const fetchNiches = async () => {
      setIsLoading(true)
      
      try {
        const params = new URLSearchParams({
          search: searchQuery,
          page: currentPage.toString(),
          limit: nichesPerPage.toString()
        })
        
        const response = await fetch(`/api/niches/public?${params}`)
        
        if (!response.ok) {
          // Handle any non-ok response gracefully
          console.log('Niches API returned:', response.status)
          setNiches([])
          setTotalPages(0)
          setTotalCount(0)
          return
        }
        
        const data = await response.json()
        setNiches(data.niches || [])
        setTotalPages(data.totalPages || 0)
        setTotalCount(data.totalCount || 0)
      } catch (err) {
        // Log error but don't throw - just show empty state
        console.log('Error fetching niches, showing empty state')
        setNiches([])
        setTotalPages(0)
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNiches()
  }, [searchQuery, currentPage])

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Filter niches by category
  const filteredNiches = selectedCategory 
    ? niches.filter(n => n.category === selectedCategory)
    : niches

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
          <h1 className="text-5xl font-bold text-blue-600 mb-4">The Product Database</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore curated Amazon product niches with comprehensive market analysis
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search niches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative" ref={filterRef}>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All Filters
                  {selectedCategory && (
                    <Badge className="ml-2 bg-blue-100 text-blue-700">1</Badge>
                  )}
                </Button>
                
                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border p-4 z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Filters</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2">Category</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {categories.map(category => (
                            <label key={category} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name="category"
                                checked={selectedCategory === category}
                                onChange={() => setSelectedCategory(category)}
                                className="text-blue-600"
                              />
                              <span className="text-sm">{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {selectedCategory && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedCategory(null)
                            setCurrentPage(1)
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
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
        </div>


        {/* Products List */}
        {isLoading ? (
          /* Loading State */
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden bg-white border-2">
                <div className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-full mb-1" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                    <Skeleton className="h-12 w-12" />
                  </div>
                  <div className="pt-6 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(6)].map((_, j) => (
                        <div key={j} className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNiches.length > 0 ? (
          <>
            <div className={isGridView ? "grid md:grid-cols-2 gap-6" : "space-y-4"}>
              {filteredNiches.map((niche) => (
                <Link key={niche.id} href={`/products/${niche.slug}?nicheId=${niche.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-2 h-full">
                    <div className={isGridView ? "p-8" : "p-6"}>
                      {isGridView ? (
                        <>
                          {/* Grid View Layout */}
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-start space-x-4">
                              <img
                                src={niche.mainImage}
                                alt={niche.title}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {niche.category}
                                  </Badge>
                                  <span className="text-sm text-gray-500">{niche.productCount} products</span>
                                  <span className="text-sm text-gray-500">• Avg: {niche.avgPrice}</span>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{niche.title}</h2>
                              </div>
                              <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600">
                                  {niche.opportunityScore}
                                </div>
                                <div className="text-xs text-gray-600">Opportunity</div>
                              </div>
                            </div>
                          </div>

                          {/* Analysis Progress Bars for Grid View */}
                          <div className="mt-6 pt-6 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs font-medium text-gray-700">Market Intelligence</span>
                            </div>
                            <Progress value={niche.scores.intelligence} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-gray-700">Demand Analysis</span>
                            </div>
                            <Progress value={niche.scores.demand} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Target className="h-3 w-3 text-red-600" />
                              <span className="text-xs font-medium text-gray-700">Competition</span>
                            </div>
                            <Progress value={niche.scores.competition} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Search className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-gray-700">Keywords</span>
                            </div>
                            <Progress value={niche.scores.keywords} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-3 w-3 text-emerald-600" />
                              <span className="text-xs font-medium text-gray-700">Financial</span>
                            </div>
                            <Progress value={niche.scores.financial} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3 text-purple-600" />
                              <span className="text-xs font-medium text-gray-700">Listing</span>
                            </div>
                            <Progress value={niche.scores.listing} className="h-2 [&>div]:bg-purple-600" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Rocket className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-medium text-gray-700">Launch Strategy</span>
                            </div>
                            <Progress value={niche.scores.launch} className="h-2 [&>div]:bg-purple-600" />
                          </div>
                        </div>
                      </div>
                        </>
                      ) : (
                        <>
                          {/* List View Layout */}
                          <div className="flex items-center space-x-4">
                            <img
                              src={niche.mainImage}
                              alt={niche.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h2 className="text-lg font-semibold text-gray-900">{niche.title}</h2>
                                <Badge variant="secondary" className="text-xs">
                                  {niche.category}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{niche.productCount} products</span>
                                <span>• Avg: {niche.avgPrice}</span>
                                <span>• {niche.totalReviews.toLocaleString()} total reviews</span>
                              </div>
                            </div>
                            
                            {/* Scores in List View */}
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">Demand</div>
                                <div className={`font-semibold ${getScoreColor(niche.scores.demand)}`}>
                                  {niche.scores.demand}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">Competition</div>
                                <div className={`font-semibold ${getScoreColor(niche.scores.competition)}`}>
                                  {niche.scores.competition}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">Keywords</div>
                                <div className={`font-semibold ${getScoreColor(niche.scores.keywords)}`}>
                                  {niche.scores.keywords}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-gray-600 mb-1">Financial</div>
                                <div className={`font-semibold ${getScoreColor(niche.scores.financial)}`}>
                                  {niche.scores.financial}%
                                </div>
                              </div>
                              <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  {niche.opportunityScore}
                                </div>
                                <div className="text-xs text-gray-600">Opportunity</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                {filteredNiches.length} results
                {selectedCategory && (
                  <span className="ml-2">
                    (filtered by: <span className="font-medium">{selectedCategory}</span>)
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 mr-4">
                  Rows per page: {nichesPerPage}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No niches found</h3>
            <p className="text-gray-600 text-center max-w-md">
              No niches match your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}