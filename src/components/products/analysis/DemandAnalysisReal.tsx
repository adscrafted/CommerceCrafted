'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Calendar, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'

interface DemandAnalysisRealProps {
  products: any[]
}

export default function DemandAnalysisReal({ products }: DemandAnalysisRealProps) {
  // Get product age from dedicated columns
  const getProductAge = (product: any) => {
    if (product.product_age_months !== null && product.product_age_category) {
      return {
        months: product.product_age_months,
        category: product.product_age_category,
        years: parseFloat((product.product_age_months / 12).toFixed(1))
      }
    }
    return null
  }
  
  // Calculate real product age distribution from actual product data
  const calculateAgeDistribution = () => {
    const distribution = {
      '0-6 months': 0,
      '6-12 months': 0,
      '1-2 years': 0,
      '2-3 years': 0,
      '3+ years': 0
    }
    
    products.forEach(product => {
      const productAge = getProductAge(product)
      const category = productAge?.category || '3+ years'
      if (distribution.hasOwnProperty(category)) {
        distribution[category]++
      }
    })
    
    // Convert to chart data format
    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / products.length) * 100)
    }))
  }
  
  // Calculate real metrics
  const calculateMetrics = () => {
    const productsWithAge = products.map(p => ({
      ...p,
      productAge: getProductAge(p)
    })).filter(p => p.productAge !== null)
    
    if (productsWithAge.length === 0) {
      return {
        avgYears: 0,
        launchedLastYear: 0,
        successRate: 0
      }
    }
    
    // Average years in market
    const totalMonths = productsWithAge.reduce((sum, p) => sum + (p.productAge?.months || 0), 0)
    const avgMonths = totalMonths / productsWithAge.length
    const avgYears = (avgMonths / 12).toFixed(1)
    
    // Products launched in last year
    const lastYearCount = productsWithAge.filter(p => p.productAge.months <= 12).length
    const launchedLastYear = Math.round((lastYearCount / productsWithAge.length) * 100)
    
    // Success rate (products > 1 year with reviews > 50)
    const establishedProducts = productsWithAge.filter(p => p.productAge.months > 12)
    const successfulProducts = establishedProducts.filter(p => p.review_count > 50)
    const successRate = establishedProducts.length > 0 
      ? Math.round((successfulProducts.length / establishedProducts.length) * 100)
      : 0
    
    return { avgYears, launchedLastYear, successRate }
  }
  
  // Determine market lifecycle stage based on real data
  const getMarketStage = (metrics: any, distribution: any[]) => {
    const newProducts = distribution[0].percentage + distribution[1].percentage // 0-12 months
    const establishedProducts = distribution[3].percentage + distribution[4].percentage // 2+ years
    
    if (newProducts > 50) {
      return {
        stage: 'Emerging Market',
        badge: 'Early Stage',
        color: 'bg-blue-600',
        description: 'High influx of new entrants indicates an emerging market with significant opportunity.'
      }
    } else if (newProducts > 30 && establishedProducts < 40) {
      return {
        stage: 'Growth Phase',
        badge: 'Active Growth',
        color: 'bg-green-600',
        description: 'Healthy mix of new and established products shows a growing market with room for innovation.'
      }
    } else if (establishedProducts > 60) {
      return {
        stage: 'Mature Market',
        badge: 'Established',
        color: 'bg-orange-600',
        description: 'Dominated by established players. Success requires strong differentiation or niche targeting.'
      }
    } else {
      return {
        stage: 'Stable Market',
        badge: 'Balanced',
        color: 'bg-purple-600',
        description: 'Balanced market with consistent demand. Focus on quality and customer satisfaction.'
      }
    }
  }
  
  const ageDistribution = calculateAgeDistribution()
  const metrics = calculateMetrics()
  const marketStage = getMarketStage(metrics, ageDistribution)
  
  // Generate insights based on real data
  const getEntryTimingInsights = () => {
    const insights = []
    
    // Check new product success
    const newProductsWithReviews = products.filter(p => {
      const productAge = getProductAge(p)
      return productAge && productAge.months <= 6 && p.review_count > 20
    })
    if (newProductsWithReviews.length > 0) {
      insights.push({
        icon: CheckCircle,
        text: `New products gaining traction - ${newProductsWithReviews.length} products < 6 months have 20+ reviews`,
        positive: true
      })
    }
    
    // Check market saturation
    const avgReviewCount = products.reduce((sum, p) => sum + p.review_count, 0) / products.length
    if (avgReviewCount < 500) {
      insights.push({
        icon: CheckCircle,
        text: 'Market not oversaturated - average review count indicates opportunity',
        positive: true
      })
    } else {
      insights.push({
        icon: AlertCircle,
        text: 'Competitive market - high average reviews require strong differentiation',
        positive: false
      })
    }
    
    // Check for innovation opportunities
    const oldProductsLowRating = products.filter(p => {
      const productAge = getProductAge(p)
      return productAge && productAge.months > 24 && p.rating < 4.0
    })
    if (oldProductsLowRating.length > 0) {
      insights.push({
        icon: CheckCircle,
        text: `${oldProductsLowRating.length} established products have <4.0 ratings - innovation opportunity`,
        positive: true
      })
    }
    
    return insights
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <span>Competitor Market Age Analysis</span>
        </CardTitle>
        <CardDescription>
          Real product launch timeline and market maturity analysis from Keepa data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Age Distribution Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Product Age Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="range" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'count') return [`${value} products`, 'Count']
                      return [value, name]
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]}>
                    {/* Could add percentage labels on bars if needed */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Based on {products.length} products with available launch data
            </div>
          </div>

          {/* Key Metrics - Real Data */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">{metrics.avgYears}</div>
              <div className="text-sm text-gray-600">Avg. Years in Market</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.launchedLastYear}%</div>
              <div className="text-sm text-gray-600">Launched Last Year</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate (1yr+)</div>
            </div>
          </div>

          {/* Market Lifecycle Insights - Based on Real Data */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Market Lifecycle Stage</h4>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-700">{marketStage.stage}</div>
              <Badge variant="default" className={marketStage.color}>
                {marketStage.badge}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">
              {marketStage.description}
            </p>
          </div>

          {/* Entry Timing - Real Insights */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Entry Timing Analysis</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {getEntryTimingInsights().map((insight, index) => (
                <li key={index} className="flex items-start">
                  <insight.icon className={`h-4 w-4 mr-2 mt-0.5 ${
                    insight.positive ? 'text-green-600' : 'text-orange-600'
                  }`} />
                  <span>{insight.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}