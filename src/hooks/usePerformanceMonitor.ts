import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  apiCallTime: number
}

export function usePerformanceMonitor(pageName: string) {
  const startTimeRef = useRef<number>(Date.now())
  const apiStartTimeRef = useRef<number | null>(null)
  
  useEffect(() => {
    // Track page load time
    const loadTime = Date.now() - startTimeRef.current
    console.log(`[Performance] ${pageName} - Initial load: ${loadTime}ms`)
    
    // Performance observer for tracking render times
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            console.log(`[Performance] ${pageName} - ${entry.name}: ${entry.duration.toFixed(2)}ms`)
          }
        })
      })
      
      observer.observe({ entryTypes: ['measure'] })
      
      return () => observer.disconnect()
    }
  }, [pageName])
  
  const markApiStart = () => {
    apiStartTimeRef.current = Date.now()
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${pageName}-api-start`)
    }
  }
  
  const markApiEnd = () => {
    if (apiStartTimeRef.current) {
      const apiTime = Date.now() - apiStartTimeRef.current
      console.log(`[Performance] ${pageName} - API call: ${apiTime}ms`)
      
      if (typeof window !== 'undefined' && window.performance) {
        window.performance.mark(`${pageName}-api-end`)
        window.performance.measure(
          `${pageName}-api-duration`,
          `${pageName}-api-start`,
          `${pageName}-api-end`
        )
      }
    }
  }
  
  const markRender = (operation: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${pageName}-${operation}`)
    }
  }
  
  return {
    markApiStart,
    markApiEnd,
    markRender
  }
}