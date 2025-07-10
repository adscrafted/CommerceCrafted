'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, Package, ArrowRight } from 'lucide-react'

// Mock data for demonstration
const mockNiches = [
  {
    slug: 'smart-sleep-accessories',
    name: 'Smart Sleep Accessories',
    category: 'Health & Personal Care',
    opportunityScore: 89,
    marketSize: '$180M',
    growth: '+28%',
    totalProducts: 1247,
    description: 'Bluetooth sleep masks, white noise machines, and smart sleep tracking devices'
  },
  {
    slug: 'eco-kitchen-gadgets',
    name: 'Eco Kitchen Gadgets',
    category: 'Home & Kitchen',
    opportunityScore: 85,
    marketSize: '$245M',
    growth: '+35%',
    totalProducts: 892,
    description: 'Sustainable kitchen tools, reusable food storage, and eco-friendly appliances'
  },
  {
    slug: 'pet-tech-accessories',
    name: 'Pet Tech Accessories',
    category: 'Pet Supplies',
    opportunityScore: 92,
    marketSize: '$420M',
    growth: '+42%',
    totalProducts: 1534,
    description: 'Smart pet feeders, GPS trackers, interactive toys, and health monitors'
  }
]

export default function NichesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Niche Analysis Reports</h1>
          <p className="text-gray-600">
            Explore comprehensive market analysis for profitable Amazon niches
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNiches.map((niche) => (
            <Link key={niche.slug} href={`/niches/${niche.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{niche.category}</Badge>
                    <div className="text-2xl font-bold text-purple-600">
                      {niche.opportunityScore}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{niche.name}</CardTitle>
                  <CardDescription>{niche.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-semibold">{niche.marketSize}</div>
                      <div className="text-xs text-gray-500">Market Size</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-semibold text-green-600">{niche.growth}</div>
                      <div className="text-xs text-gray-500">Growth</div>
                    </div>
                    <div className="text-center">
                      <Package className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <div className="text-sm font-semibold">{niche.totalProducts}</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-purple-600 font-medium">
                    View Full Analysis
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}