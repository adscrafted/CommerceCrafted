'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Play,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Search,
  BarChart3,
  TrendingUp,
  Target,
  Package,
  Lightbulb,
  Users,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface TourStep {
  id: number
  title: string
  description: string
  videoUrl?: string
  imageUrl: string
  duration: string
  completed: boolean
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Welcome to CommerceCrafted",
    description: "Your comprehensive Amazon product research platform. Learn how to find profitable opportunities, analyze competition, and make data-driven decisions.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    duration: "2 min",
    completed: false
  },
  {
    id: 2,
    title: "Product Database Overview",
    description: "Explore thousands of pre-analyzed Amazon products with detailed opportunity scores, market analysis, and profit projections.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    duration: "3 min",
    completed: false
  },
  {
    id: 3,
    title: "Understanding Opportunity Scores",
    description: "Learn how our 5-factor analysis system evaluates products based on opportunity, competition, demand, feasibility, and timing.",
    imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop",
    duration: "4 min",
    completed: false
  },
  {
    id: 4,
    title: "Market Trends & Analysis",
    description: "Discover trending categories, seasonal opportunities, and emerging markets with real-time data and AI-powered insights.",
    imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=450&fit=crop",
    duration: "3 min",
    completed: false
  },
  {
    id: 5,
    title: "AI Research Agent",
    description: "Get personalized product recommendations and deep market analysis through our intelligent research assistant.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop",
    duration: "5 min",
    completed: false
  },
  {
    id: 6,
    title: "Financial Modeling & Projections",
    description: "Calculate profit margins, FBA fees, inventory requirements, and ROI projections for any Amazon product.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop",
    duration: "4 min",
    completed: false
  },
  {
    id: 7,
    title: "Your Account & Tracking",
    description: "Set up your personal account to track products, monitor performance, and manage your research portfolio.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    duration: "3 min",
    completed: false
  }
]

export default function WelcomeTourPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const currentTourStep = tourSteps.find(step => step.id === currentStep)
  const totalSteps = tourSteps.length
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep])
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepSelect = (stepId: number) => {
    setCurrentStep(stepId)
  }

  const markAsCompleted = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
  }

  const isLastStep = currentStep === totalSteps

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <div className="text-blue-600 text-2xl font-bold">CommerceCrafted</div>
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/products" className="text-gray-600 hover:text-blue-600">Product Database</Link>
                <Link href="/trends" className="text-gray-600 hover:text-blue-600">Trends</Link>
                <div className="relative">
                  <Link href="/research" className="text-gray-600 hover:text-blue-600 flex items-center">
                    AI Research Agent
                    <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">BETA</Badge>
                  </Link>
                </div>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">Skip Tour</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Tour</h1>
              <p className="text-gray-600">Learn how to maximize your Amazon product research</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</div>
              <div className="text-lg font-semibold text-gray-900">{Math.round(progressPercentage)}% Complete</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Tour Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Tour Steps</h3>
              <div className="space-y-3">
                {tourSteps.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => handleStepSelect(step.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentStep === step.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        completedSteps.includes(step.id)
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {completedSteps.includes(step.id) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className="text-xs font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          currentStep === step.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.duration}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentTourStep && (
              <Card>
                <CardContent className="p-0">
                  {/* Video/Image Section */}
                  <div className="relative">
                    <img
                      src={currentTourStep.imageUrl}
                      alt={currentTourStep.title}
                      className="w-full h-80 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-t-lg">
                      <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                        <Play className="h-5 w-5 mr-2" />
                        Watch Tutorial
                      </Button>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-gray-900">{currentTourStep.duration}</Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {currentTourStep.title}
                      </h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {currentTourStep.description}
                      </p>
                    </div>

                    {/* Step-specific content */}
                    {currentStep === 1 && (
                      <div className="bg-blue-50 p-6 rounded-lg mb-6">
                        <h3 className="font-semibold text-blue-900 mb-3">What you'll learn:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <Search className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-blue-800">Product Research Methods</span>
                          </div>
                          <div className="flex items-center">
                            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-blue-800">Market Analysis Tools</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-blue-800">Trend Identification</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-blue-800">Opportunity Scoring</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="bg-green-50 p-6 rounded-lg mb-6">
                        <h3 className="font-semibold text-green-900 mb-3">Our 5-Factor Analysis:</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-green-800">Opportunity Potential</span>
                            <div className="flex">
                              {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-800">Competition Level</span>
                            <div className="flex">
                              {[1,2,3].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                              {[4,5].map(i => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-800">Market Demand</span>
                            <div className="flex">
                              {[1,2,3,4].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
                              {[5].map(i => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="bg-purple-50 p-6 rounded-lg mb-6">
                        <h3 className="font-semibold text-purple-900 mb-3">AI Agent Capabilities:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start">
                            <Lightbulb className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                            <div>
                              <div className="font-medium text-purple-800">Smart Recommendations</div>
                              <div className="text-sm text-purple-600">Personalized product suggestions</div>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <BarChart3 className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                            <div>
                              <div className="font-medium text-purple-800">Deep Analysis</div>
                              <div className="text-sm text-purple-600">Comprehensive market research</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={handlePrevStep}
                        disabled={currentStep === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          onClick={markAsCompleted}
                          disabled={completedSteps.includes(currentStep)}
                        >
                          {completedSteps.includes(currentStep) ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            'Mark as Complete'
                          )}
                        </Button>

                        {isLastStep ? (
                          <Link href="/">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Award className="h-4 w-4 mr-2" />
                              Finish Tour
                            </Button>
                          </Link>
                        ) : (
                          <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700">
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Knowledge Base</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive guides and tutorials for all features
                </p>
                <Button variant="outline" size="sm">
                  Browse Articles
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with other Amazon sellers and researchers
                </p>
                <Button variant="outline" size="sm">
                  Join Community
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Live Support</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get help from our expert support team
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}