import { useState, useCallback } from 'react'
import { UsageType } from '@/lib/usage'

interface UseUsageOptions {
  onLimitExceeded?: () => void
  onError?: (error: string) => void
}

export function useUsage(options: UseUsageOptions = {}) {
  const [checking, setChecking] = useState(false)
  const [incrementing, setIncrementing] = useState(false)

  const checkUsage = useCallback(async (usageType: UsageType): Promise<boolean> => {
    setChecking(true)
    try {
      const response = await fetch('/api/usage/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usageType })
      })

      if (!response.ok) {
        throw new Error('Failed to check usage')
      }

      const data = await response.json()
      return data.canUse
    } catch (error) {
      console.error('Error checking usage:', error)
      options.onError?.(error instanceof Error ? error.message : 'Unknown error')
      return false
    } finally {
      setChecking(false)
    }
  }, [options])

  const incrementUsage = useCallback(async (usageType: UsageType, count = 1): Promise<boolean> => {
    setIncrementing(true)
    try {
      const response = await fetch('/api/usage/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usageType, count })
      })

      if (response.status === 429) {
        // Usage limit exceeded
        options.onLimitExceeded?.()
        return false
      }

      if (!response.ok) {
        throw new Error('Failed to increment usage')
      }

      return true
    } catch (error) {
      console.error('Error incrementing usage:', error)
      options.onError?.(error instanceof Error ? error.message : 'Unknown error')
      return false
    } finally {
      setIncrementing(false)
    }
  }, [options])

  const checkAndIncrement = useCallback(async (usageType: UsageType, count = 1): Promise<boolean> => {
    const canUse = await checkUsage(usageType)
    if (!canUse) {
      options.onLimitExceeded?.()
      return false
    }

    return await incrementUsage(usageType, count)
  }, [checkUsage, incrementUsage, options])

  return {
    checkUsage,
    incrementUsage,
    checkAndIncrement,
    checking,
    incrementing,
    loading: checking || incrementing
  }
}

// Helper hook for common usage patterns
export function useAnalysisUsage() {
  return useUsage({
    onLimitExceeded: () => {
      // Could show a modal or redirect to pricing
      window.location.href = '/pricing'
    }
  })
}

export function useAIQueryUsage() {
  return useUsage({
    onLimitExceeded: () => {
      alert('AI query limit reached. Please upgrade to continue.')
    }
  })
}

export function useExportUsage() {
  return useUsage({
    onLimitExceeded: () => {
      alert('Export limit reached. Please upgrade to continue.')
    }
  })
}