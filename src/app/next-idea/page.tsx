'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'


export default function NextIdeaPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 50,
    seconds: 46
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        }
        
        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (time: number) => time.toString().padStart(2, '0')

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-600 mb-8">Next Idea</h1>
          
          {/* Navigation */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <Link href="/previous-ideas" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Link>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Jul 4, 2025</span>
            </div>
            
            <Link href="/products" className="flex items-center space-x-2 text-gray-400 cursor-not-allowed">
              <span>Next idea</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Countdown Timer */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 text-6xl font-bold text-gray-900">
              <div className="text-center">
                <div>{formatTime(timeLeft.hours)}</div>
                <div className="text-xs font-normal text-gray-500 mt-2">HOURS</div>
              </div>
              <div className="text-gray-400">:</div>
              <div className="text-center">
                <div>{formatTime(timeLeft.minutes)}</div>
                <div className="text-xs font-normal text-gray-500 mt-2">MINUTES</div>
              </div>
              <div className="text-gray-400">:</div>
              <div className="text-center">
                <div>{formatTime(timeLeft.seconds)}</div>
                <div className="text-xs font-normal text-gray-500 mt-2">SECONDS</div>
              </div>
            </div>
          </div>
          
          {/* Hint */}
          <div className="max-w-md mx-auto">
            <div className="text-lg font-semibold text-gray-900 mb-2">Here's a hint:</div>
            <p className="text-gray-600 leading-relaxed">
              The missing link between coding tutorials and<br />
              real developer confidence...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}