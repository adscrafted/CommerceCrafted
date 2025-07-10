'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Link from 'next/link'


export default function NextProductPage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Calculate time until midnight
    const calculateTimeUntilMidnight = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      
      const diff = midnight.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      return { hours, minutes, seconds }
    }
    
    // Set initial time
    setTimeLeft(calculateTimeUntilMidnight())
    
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeUntilMidnight())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (time: number) => time.toString().padStart(2, '0')

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-600 mb-8">Next Product</h1>
          
          {/* Navigation */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <Link href="/product-of-the-day" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Product</span>
            </Link>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>July 11, 2025</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 cursor-not-allowed">
              <span>Next product</span>
              <ChevronRight className="h-4 w-4" />
            </div>
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
          
        </div>
      </div>
    </div>
  )
}