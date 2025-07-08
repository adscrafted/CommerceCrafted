import { useState, useCallback } from 'react'
import axios from 'axios'
import { SearchTermData } from '@/lib/amazon-search-terms-service'

interface UseSearchTermsReportOptions {
  useCache?: boolean
  onSuccess?: (data: SearchTermData[]) => void
  onError?: (error: Error) => void
}

interface UseSearchTermsReportReturn {
  searchTerms: SearchTermData[]
  loading: boolean
  error: Error | null
  fetchSearchTerms: (startDate: Date, endDate: Date, marketplaceId?: string) => Promise<void>
  reportId: string | null
  reportStatus: string | null
  checkReportStatus: (reportId: string) => Promise<void>
}

export function useSearchTermsReport(options: UseSearchTermsReportOptions = {}): UseSearchTermsReportReturn {
  const [searchTerms, setSearchTerms] = useState<SearchTermData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [reportStatus, setReportStatus] = useState<string | null>(null)

  const fetchSearchTerms = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    marketplaceId?: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/amazon/search-terms', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        marketplaceId,
        useCache: options.useCache
      })

      if (response.data.success) {
        setSearchTerms(response.data.data)
        options.onSuccess?.(response.data.data)
      } else {
        throw new Error(response.data.error || 'Failed to fetch search terms')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [options])

  const checkReportStatus = useCallback(async (reportId: string) => {
    try {
      const response = await axios.get(`/api/amazon/search-terms?reportId=${reportId}`)
      
      if (response.data.success) {
        setReportId(reportId)
        setReportStatus(response.data.status.processingStatus)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check report status')
      setError(error)
      options.onError?.(error)
    }
  }, [options])

  return {
    searchTerms,
    loading,
    error,
    fetchSearchTerms,
    reportId,
    reportStatus,
    checkReportStatus
  }
}