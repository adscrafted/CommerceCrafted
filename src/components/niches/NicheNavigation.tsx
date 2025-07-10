'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  TrendingUp,
  Target,
  Search,
  DollarSign,
  FileText,
  Rocket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface NicheNavigationProps {
  nicheSlug: string
  nicheName: string
}

export function NicheNavigation({ nicheSlug, nicheName }: NicheNavigationProps) {
  const pathname = usePathname()
  
  const navigationItems = [
    {
      title: 'Overview',
      href: `/niches/${nicheSlug}`,
      icon: ChevronLeft,
      description: 'Back to niche overview'
    },
    {
      title: 'Intelligence',
      href: `/niches/${nicheSlug}/intelligence`,
      icon: MessageSquare,
      description: 'Customer insights & sentiment'
    },
    {
      title: 'Demand',
      href: `/niches/${nicheSlug}/demand`,
      icon: TrendingUp,
      description: 'Market size & trends'
    },
    {
      title: 'Competition',
      href: `/niches/${nicheSlug}/competition`,
      icon: Target,
      description: 'Competitor analysis'
    },
    {
      title: 'Keywords',
      href: `/niches/${nicheSlug}/keywords`,
      icon: Search,
      description: 'Search terms & PPC'
    },
    {
      title: 'Financial',
      href: `/niches/${nicheSlug}/financial`,
      icon: DollarSign,
      description: 'Profit & ROI analysis'
    },
    {
      title: 'Listing',
      href: `/niches/${nicheSlug}/listing`,
      icon: FileText,
      description: 'Optimization strategy'
    },
    {
      title: 'Launch',
      href: `/niches/${nicheSlug}/launch`,
      icon: Rocket,
      description: '90-day roadmap'
    }
  ]

  const currentIndex = navigationItems.findIndex(item => item.href === pathname)
  const prevItem = currentIndex > 0 ? navigationItems[currentIndex - 1] : null
  const nextItem = currentIndex < navigationItems.length - 1 ? navigationItems[currentIndex + 1] : null

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Navigation */}
        <div className="md:hidden py-3">
          <div className="flex items-center justify-between mb-3">
            {prevItem && (
              <Link 
                href={prevItem.href}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {prevItem.title}
              </Link>
            )}
            {nextItem && (
              <Link 
                href={nextItem.href}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 ml-auto"
              >
                {nextItem.title}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={pathname}
            onChange={(e) => window.location.href = e.target.value}
          >
            {navigationItems.map((item) => (
              <option key={item.href} value={item.href}>
                {item.title} - {item.description}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 py-2 overflow-x-auto">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isOverview = index === 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  isOverview && "border-r mr-2"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.title}
              </Link>
            )
          })}
        </div>

        {/* Navigation hint for desktop */}
        <div className="hidden md:flex items-center justify-between pb-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {prevItem && (
              <Link 
                href={prevItem.href}
                className="flex items-center hover:text-gray-700"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Previous: {prevItem.title}
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {nextItem && (
              <Link 
                href={nextItem.href}
                className="flex items-center hover:text-gray-700"
              >
                Next: {nextItem.title}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}