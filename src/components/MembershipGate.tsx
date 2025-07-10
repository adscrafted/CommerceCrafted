'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Lock, 
  ChevronRight, 
  Sparkles, 
  CheckCircle,
  TrendingUp,
  Target,
  DollarSign,
  Search,
  FileText,
  Rocket,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ScoreCardData {
  title: string
  score: number
  icon: any
  description: string
  gradient: string
}

interface MembershipGateProps {
  productTitle: string
  productImage?: string
  scoreCards?: ScoreCardData[]
}

export function MembershipGate({ productTitle, productImage, scoreCards }: MembershipGateProps) {
  // Default score cards if none provided
  const defaultScoreCards: ScoreCardData[] = [
    {
      title: 'Opportunity Score',
      score: 87,
      icon: BarChart3,
      description: 'Overall product opportunity',
      gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100'
    },
    {
      title: 'Market Intelligence',
      score: 88,
      icon: MessageSquare,
      description: 'Reviews & customer insights',
      gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100'
    },
    {
      title: 'Demand Analysis',
      score: 85,
      icon: TrendingUp,
      description: 'Market size & growth',
      gradient: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      title: 'Competition',
      score: 72,
      icon: Target,
      description: 'Competitor landscape',
      gradient: 'bg-gradient-to-br from-red-50 to-red-100'
    },
    {
      title: 'Keywords',
      score: 85,
      icon: Search,
      description: 'SEO opportunities',
      gradient: 'bg-gradient-to-br from-green-50 to-green-100'
    },
    {
      title: 'Financial',
      score: 88,
      icon: DollarSign,
      description: 'Profitability & ROI',
      gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100'
    },
    {
      title: 'Listing',
      score: 82,
      icon: FileText,
      description: 'Optimization potential',
      gradient: 'bg-gradient-to-br from-purple-50 to-purple-100'
    },
    {
      title: 'Launch',
      score: 90,
      icon: Rocket,
      description: 'Go-to-market strategy',
      gradient: 'bg-gradient-to-br from-orange-50 to-orange-100'
    }
  ]

  const cards = scoreCards || defaultScoreCards

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 text-lg px-4 py-1">
            Members Only
          </Badge>
          <h1 className="text-5xl font-bold text-blue-600 mb-6">
            Unlock the Full Product Report
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Save hours of research with the action-ready report including market validation, 
            competitor analysis, financial projections, launch strategies, and more.
          </p>
        </div>

        {/* Product Preview */}
        {productImage && (
          <div className="mb-12 text-center">
            <div className="relative inline-block">
              <div className="w-64 h-64 relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={productImage}
                  alt={productTitle}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Lock className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <Link href="/pricing">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
              Explore Plans
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Score Cards Preview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            What You're Missing: Complete Analysis Scores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, index) => {
              const Icon = card.icon
              const isOpportunityScore = index === 0 // First card is Opportunity Score
              
              return (
                <Card 
                  key={index} 
                  className={`${card.gradient} border-2 hover:shadow-lg transition-all ${
                    isOpportunityScore ? 'lg:col-span-2' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <CardTitle className="text-base">{card.title}</CardTitle>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(card.score)}`}>
                        {card.score}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Progress value={card.score} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">{card.description}</p>
                    {isOpportunityScore && (
                      <div className="mt-3 text-sm text-gray-700">
                        This comprehensive score combines all analysis dimensions to give you an overall product opportunity rating.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link href="/product-of-the-day">
            <Button variant="outline" size="lg">
              See Today's Free Product Analysis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}