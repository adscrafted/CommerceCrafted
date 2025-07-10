'use client'

import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Search, 
  DollarSign, 
  FileText, 
  Rocket, 
  MessageSquare,
  Database,
  Calendar,
  Brain,
  Shield,
  Zap,
  Users,
  Globe,
  Package,
  ChartBar,
  Calculator,
  Lightbulb,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Feature {
  title: string
  description: string
  icon: any
  badge?: string
  highlights?: string[]
  gradient?: string
}

const analysisFeatures: Feature[] = [
  {
    title: 'Opportunity Scoring',
    description: 'Our proprietary algorithm evaluates products across 8 key dimensions to identify the best opportunities.',
    icon: BarChart3,
    gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    highlights: [
      'Composite score combining all 8 analysis dimensions',
      'Risk-adjusted opportunity rating',
      'Market timing and entry barrier assessment',
      'Success probability based on historical data'
    ]
  },
  {
    title: 'Market Intelligence',
    description: 'Deep dive into customer reviews, sentiment analysis, and unmet needs to find product improvement ideas.',
    icon: MessageSquare,
    gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    highlights: [
      'Analysis of 1000+ customer reviews',
      'Pain point and opportunity identification',
      'Customer avatar development',
      'Product differentiation insights'
    ]
  },
  {
    title: 'Demand Analysis',
    description: 'Understand market size, growth trends, and customer segments with precision data.',
    icon: ChartBar,
    gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    highlights: [
      'Total addressable market (TAM) calculation',
      'Search volume and seasonal trends',
      'Market growth rate analysis',
      'Customer segment breakdown'
    ]
  },
  {
    title: 'Competition Analysis',
    description: 'Evaluate competitor landscapes, pricing strategies, and market positioning opportunities.',
    icon: Target,
    gradient: 'bg-gradient-to-br from-red-50 to-red-100',
    highlights: [
      'Top 10 competitor deep-dive',
      'Price positioning analysis',
      'Market share estimates',
      'Differentiation opportunities'
    ]
  },
  {
    title: 'Keyword Research',
    description: 'Discover high-value keywords, PPC opportunities, and organic ranking potential.',
    icon: Search,
    gradient: 'bg-gradient-to-br from-green-50 to-green-100',
    highlights: [
      'Primary and long-tail keywords',
      'PPC cost and budget analysis',
      'Organic ranking difficulty',
      'Competitor keyword gaps'
    ]
  },
  {
    title: 'Financial Projections',
    description: 'Get detailed ROI calculations, profit margins, and cash flow projections for each product.',
    icon: Calculator,
    gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    highlights: [
      'Unit economics breakdown',
      'Break-even analysis',
      'Cash flow projections',
      'ROI scenarios and benchmarks'
    ]
  },
  {
    title: 'Listing Optimization',
    description: 'Receive AI-powered recommendations for titles, bullets, images, and A+ content.',
    icon: FileText,
    gradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
    highlights: [
      'Optimized title formulas',
      'Bullet point templates',
      'Image strategy guide',
      'A+ Content recommendations'
    ]
  },
  {
    title: 'Launch Strategy',
    description: 'Get a complete 90-day launch roadmap with PPC campaigns, pricing, and promotion strategies.',
    icon: Rocket,
    gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
    highlights: [
      'Week-by-week launch calendar',
      'PPC campaign structure',
      'Pricing and promotion strategy',
      'Inventory planning guidelines'
    ]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge className="mb-4">Daily Amazon Product Analysis</Badge>
            <h1 className="text-5xl font-bold text-blue-600 mb-4">
              Deep Product Research
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every day at midnight, we release one thoroughly analyzed Amazon product opportunity. 
              Each analysis represents 40+ hours of research condensed into actionable insights you can use immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 8-Dimensional Analysis */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">8-Dimensional Product Analysis</h2>
            <p className="text-lg text-gray-600">Deep insights across every critical success factor</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 ${feature.gradient || ''}`}
              >
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <feature.icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights?.map((highlight, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
            
            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="p-4 bg-white/20 rounded-full inline-block mx-auto mb-4">
                  <Lightbulb className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">See It In Action</CardTitle>
                <CardDescription className="text-white/90 text-base">
                  Experience our comprehensive analysis with today's featured product
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-white/80">
                  Get a complete product analysis absolutely free. No credit card required.
                </p>
                <Link href="/product-of-the-day">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                    View Today's Product
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="pt-2">
                  <Link href="/pricing" className="text-white/80 hover:text-white underline text-sm">
                    Or explore pricing plans →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Speed Features */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-12 text-white mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <Zap className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Lightning Fast Research</h2>
            <p className="text-xl mb-8 text-blue-100">
              What used to take weeks now takes minutes. Our platform is built for speed without sacrificing accuracy.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">40+ hrs</div>
                <div className="text-blue-200">Saved per product research</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">&lt; 30s</div>
                <div className="text-blue-200">To analyze any product</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1000+</div>
                <div className="text-blue-200">Pre-analyzed products</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}