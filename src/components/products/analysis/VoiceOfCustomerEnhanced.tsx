"use client"

import React from 'react'
import { Star, Users, TrendingUp, AlertCircle, MessageSquare, HelpCircle, CheckCircle, XCircle } from 'lucide-react'
import { ScoreCard } from '@/components/ui/score-card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface VoiceOfCustomerData {
  topPositives: Array<{
    theme: string
    mentions: number
    examples: string[]
  }>
  topIssues: Array<{
    issue: string
    mentions: number
    examples: string[]
  }>
  usageInsights: Array<{
    insight: string
    frequency: string
    examples: string[]
  }>
  buyingReasons: Array<{
    reason: string
    percentage: number
    examples: string[]
  }>
  metrics: {
    totalReviews: number
    averageRating: number
    verifiedPurchases: number
  }
  ratingDistribution: Array<{
    rating: number
    count: number
    percentage: number
  }>
  keyPatterns: Array<{
    pattern: string
    frequency: 'Very High' | 'High' | 'Medium' | 'Low'
    impact: 'Critical' | 'High' | 'Medium' | 'Low'
    description: string
  }>
  purchaseBarriers: Array<{
    barrier: string
    severity: 'High' | 'Medium' | 'Low'
    frequency: number
    solution: string
  }>
  customerQuestions: Array<{
    question: string
    frequency: number
    category: string
    suggestedAnswer: string
  }>
}

interface VoiceOfCustomerEnhancedProps {
  data: VoiceOfCustomerData
}

export default function VoiceOfCustomerEnhanced({ data }: VoiceOfCustomerEnhancedProps) {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
  
  const formatRating = (rating: number) => {
    return rating.toFixed(1)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'text-red-600 bg-red-50'
      case 'High': return 'text-orange-600 bg-orange-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <ScoreCard
          value={data.metrics.totalReviews.toLocaleString()}
          label="Total Reviews"
          icon={MessageSquare}
          color="blue"
          variant="bordered"
        />
        
        <ScoreCard
          value={formatRating(data.metrics.averageRating)}
          label="Average Rating"
          icon={Star}
          color="orange"
          variant="bordered"
        />
        
        <ScoreCard
          value={data.metrics.verifiedPurchases.toLocaleString()}
          label="Verified Purchases"
          icon={CheckCircle}
          color="green"
          variant="bordered"
        />
      </div>

      {/* Rating Distribution */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Rating Distribution</h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" label={{ value: 'Rating', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Number of Reviews', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6">
                {data.ratingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rating >= 4 ? '#10b981' : entry.rating === 3 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Positives */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          Top Positives
        </h3>
        <div className="space-y-4">
          {data.topPositives.map((positive, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{positive.theme}</h4>
                <span className="text-sm text-gray-600">{positive.mentions} mentions</span>
              </div>
              <div className="space-y-2">
                {positive.examples.map((example, i) => (
                  <p key={i} className="text-sm text-gray-600 italic">"{example}"</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Issues */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          Top Issues
        </h3>
        <div className="space-y-4">
          {data.topIssues.map((issue, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{issue.issue}</h4>
                <span className="text-sm text-gray-600">{issue.mentions} mentions</span>
              </div>
              <div className="space-y-2">
                {issue.examples.map((example, i) => (
                  <p key={i} className="text-sm text-gray-600 italic">"{example}"</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Insights */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          Usage Insights
        </h3>
        <div className="space-y-4">
          {data.usageInsights.map((insight, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{insight.insight}</h4>
                <span className="text-sm text-gray-600">{insight.frequency}</span>
              </div>
              <div className="space-y-2">
                {insight.examples.map((example, i) => (
                  <p key={i} className="text-sm text-gray-600 italic">"{example}"</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Buying Reasons */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Top Buying Reasons</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.buyingReasons}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={entry => `${entry.reason} (${entry.percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {data.buyingReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {data.buyingReasons.map((reason, index) => (
              <div key={index} className="border-l-4 pl-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{reason.reason}</h4>
                  <span className="text-sm text-gray-600">{reason.percentage}%</span>
                </div>
                <div className="space-y-1">
                  {reason.examples.slice(0, 2).map((example, i) => (
                    <p key={i} className="text-sm text-gray-600 italic">"{example}"</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Patterns */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Key Patterns</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Pattern</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Frequency</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Impact</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm hidden sm:table-cell">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.keyPatterns.map((pattern, index) => (
                <tr key={index} className="border-b">
                  <td className="px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm">{pattern.pattern}</td>
                  <td className="px-2 sm:px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pattern.frequency === 'Very High' ? 'bg-red-100 text-red-700' :
                      pattern.frequency === 'High' ? 'bg-orange-100 text-orange-700' :
                      pattern.frequency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {pattern.frequency}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    <span className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${getImpactColor(pattern.impact)}`}>
                      {pattern.impact}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{pattern.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Barriers */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          Purchase Barriers
        </h3>
        <div className="space-y-4">
          {data.purchaseBarriers.map((barrier, index) => (
            <div key={index} className="border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm sm:text-base">{barrier.barrier}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-medium ${getSeverityColor(barrier.severity)}`}>
                    {barrier.severity} Severity
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">({barrier.frequency} mentions)</span>
                </div>
              </div>
              <div className="mt-2 p-3 bg-green-50 rounded">
                <p className="text-sm text-green-800">
                  <strong>Solution:</strong> {barrier.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Questions & FAQs */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
          Customer Questions & FAQs
        </h3>
        <div className="space-y-4">
          {data.customerQuestions.map((faq, index) => (
            <div key={index} className="border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-medium text-sm sm:text-base">{faq.question}</h4>
                  <span className="text-xs text-gray-500">{faq.category}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{faq.frequency} asked</span>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">{faq.suggestedAnswer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}