'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Filter,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Mock Trend Data (matching the IdeaBrowser style)
interface TrendItem {
  id: string
  name: string
  volume: string
  growth: string
  category: string
  description: string
  chartData: number[]
  searchVolume: number
  growthPercentage: number
  isRising: boolean
}

const mockTrends: TrendItem[] = [
  {
    id: 'yard-drainage-1',
    name: 'Yard Drainage Solutions',
    volume: '2.6K',
    growth: '+50%',
    category: 'Home & Garden',
    description: 'Yard drainage solutions refer to various methods and systems designed to manage and redirect excess water from yards and properties.',
    chartData: [20, 18, 22, 35, 40, 38, 45, 52, 48, 55, 60, 58],
    searchVolume: 2600,
    growthPercentage: 50,
    isRising: true
  },
  {
    id: 'workers-compensation-2', 
    name: 'Workers Compensation Claim',
    volume: '6.6K',
    growth: '+129%',
    category: 'Legal',
    description: 'A workers\' compensation claim refers to a formal request by an employee for benefits due to a work-related injury or illness.',
    chartData: [15, 16, 14, 18, 25, 35, 42, 38, 45, 52, 48, 55],
    searchVolume: 6600,
    growthPercentage: 129,
    isRising: true
  },
  {
    id: 'weight-training-seniors-3',
    name: 'Weight Training For Seniors',
    volume: '3.6K',
    growth: '+175%',
    category: 'Health & Fitness',
    description: 'Weight training for seniors refers to a structured regimen of resistance exercises aimed at enhancing strength and physical function.',
    chartData: [12, 14, 16, 18, 25, 32, 38, 42, 45, 50, 55, 58],
    searchVolume: 3600,
    growthPercentage: 175,
    isRising: true
  },
  {
    id: 'ux-design-services-4',
    name: 'Ux Design Services',
    volume: '5.6K',
    growth: '+175%',
    category: 'Design',
    description: 'UX design services refer to professional offerings focused on enhancing the overall experience users have with digital products.',
    chartData: [10, 12, 15, 18, 22, 28, 35, 32, 38, 45, 50, 48],
    searchVolume: 5600,
    growthPercentage: 175,
    isRising: true
  },
  {
    id: 'ux-audit-5',
    name: 'Ux Audit',
    volume: '3.9K',
    growth: '+50%',
    category: 'Design',
    description: 'A UX audit refers to a systematic evaluation of a digital product\'s user experience to identify usability issues and optimization opportunities.',
    chartData: [22, 20, 25, 28, 32, 35, 38, 42, 40, 45, 48, 50],
    searchVolume: 3900,
    growthPercentage: 50,
    isRising: true
  },
  {
    id: 'insurance-fraud-6',
    name: 'Insurance Fraud',
    volume: '27.1K',
    growth: '+50%',
    category: 'Legal',
    description: 'Insurance fraud refers to the deliberate act of deceiving an insurance company to obtain benefits or financial gain through false claims.',
    chartData: [35, 32, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68],
    searchVolume: 27100,
    growthPercentage: 50,
    isRising: true
  },
  {
    id: 'phishing-scam-prevention-7',
    name: 'Phishing Scam Prevention',
    volume: '2.4K',
    growth: '+50%',
    category: 'Cybersecurity',
    description: 'Phishing scam prevention refers to the strategies and practices aimed at protecting individuals and organizations from fraudulent attempts.',
    chartData: [8, 10, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42],
    searchVolume: 2400,
    growthPercentage: 50,
    isRising: true
  },
  {
    id: 'apps-budgeting-8',
    name: 'Apps For Budgeting',
    volume: '90.5K',
    growth: '+107%',
    category: 'Finance',
    description: 'Apps for budgeting refer to digital tools designed to assist individuals in managing their personal finances and tracking expenses.',
    chartData: [45, 42, 48, 52, 55, 58, 62, 68, 72, 75, 78, 82],
    searchVolume: 90500,
    growthPercentage: 107,
    isRising: true
  },
  {
    id: 'traditional-ira-9',
    name: 'Traditional Ira',
    volume: '33.1K',
    growth: '+32%',
    category: 'Finance',
    description: 'Traditional IRA refers to an Individual Retirement Account that allows individuals to make tax-deductible contributions.',
    chartData: [55, 52, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88],
    searchVolume: 33100,
    growthPercentage: 32,
    isRising: true
  },
  {
    id: 'legal-separation-mediation-10',
    name: 'Legal Separation Mediation',
    volume: '1.3K',
    growth: '+173%',
    category: 'Legal',
    description: 'Legal separation mediation refers to a voluntary, confidential process where a neutral third party helps couples resolve disputes.',
    chartData: [3, 5, 8, 12, 15, 18, 22, 28, 32, 35, 38, 42],
    searchVolume: 1300,
    growthPercentage: 173,
    isRising: true
  },
  {
    id: 'seo-strategy-ecommerce-11',
    name: 'Seo Strategy For Ecommerce Website',
    volume: '1.0K',
    growth: '+484%',
    category: 'Marketing',
    description: 'SEO strategy for an ecommerce website refers to the systematic approach of optimizing an online store to improve search engine rankings.',
    chartData: [2, 3, 5, 8, 12, 18, 25, 32, 38, 45, 52, 58],
    searchVolume: 1000,
    growthPercentage: 484,
    isRising: true
  },
  {
    id: 'resell-products-12',
    name: 'Resell Products',
    volume: '2.5K',
    growth: '+177%',
    category: 'E-commerce',
    description: 'Resell products refers to the practice of purchasing goods or services with the intent to sell them to end consumers for profit.',
    chartData: [5, 7, 10, 15, 20, 25, 32, 38, 42, 48, 52, 55],
    searchVolume: 2500,
    growthPercentage: 177,
    isRising: true
  }
]

export default function TrendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSort, setSelectedSort] = useState('Most Recent')
  const [filteredTrends, setFilteredTrends] = useState(mockTrends)

  const trendsPerPage = 9
  const totalPages = Math.ceil(filteredTrends.length / trendsPerPage)
  const startIndex = (currentPage - 1) * trendsPerPage
  const currentTrends = filteredTrends.slice(startIndex, startIndex + trendsPerPage)

  useEffect(() => {
    let filtered = mockTrends

    if (searchQuery) {
      filtered = filtered.filter(trend => 
        trend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trend.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trend.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort based on selected option
    if (selectedSort === 'Most Recent') {
      filtered = filtered.sort((a, b) => b.growthPercentage - a.growthPercentage)
    }

    setFilteredTrends(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedSort])

  const renderChart = (data: number[], index: number) => {
    const max = Math.max(...data)
    const normalizedData = data.map(val => (val / max) * 100)
    
    return (
      <svg className="w-full h-full" viewBox="0 0 300 120">
        <defs>
          <linearGradient id={`trendGradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Create path for the line and fill */}
        <path
          d={`M ${normalizedData.map((val, i) => 
            `${(i / (normalizedData.length - 1)) * 280 + 10},${110 - (val * 0.8)}`
          ).join(' L ')} L 290,110 L 10,110 Z`}
          fill={`url(#trendGradient-${index})`}
        />
        <path
          d={`M ${normalizedData.map((val, i) => 
            `${(i / (normalizedData.length - 1)) * 280 + 10},${110 - (val * 0.8)}`
          ).join(' L ')}`}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <div className="bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Trends</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover emerging trends and opportunities
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search trends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Most Recent</span>
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              All Filters
            </Button>
          </div>
        </div>

        {/* Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentTrends.map((trend, index) => (
            <Card key={trend.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {trend.name}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          {trend.category}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          Volume: {trend.volume}
                        </div>
                        <div className="text-sm text-gray-600">
                          Growth: {trend.growth}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-24 w-full bg-blue-50 rounded-lg p-2">
                    {renderChart(trend.chartData, index)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {trend.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {trend.volume}
                      </div>
                      <div className="text-xs text-blue-700">Volume</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {trend.growth}
                      </div>
                      <div className="text-xs text-green-700">Growth</div>
                    </div>
                  </div>

                  {/* View Button */}
                  <Link href={`/trends/${trend.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                      <Activity className="h-4 w-4 mr-2" />
                      View Trend Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-600">
          Page 1 of 15
        </div>
      </div>
    </div>
  )
}