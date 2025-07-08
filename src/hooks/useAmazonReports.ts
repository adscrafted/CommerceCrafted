import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'

export type ReportType = 'SEARCH_TERMS' | 'MARKET_BASKET' | 'REPEAT_PURCHASE' | 'ITEM_COMPARISON'
export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'

interface Report {
  id: string
  type: ReportType
  status: ReportStatus
  startDate: string
  endDate: string
  marketplaceId: string
  createdAt: string
  completedAt?: string
  error?: string
  recordCount?: number
}

interface ReportData {
  data: any[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseAmazonReportsReturn {
  // State
  reports: Report[]
  loading: boolean
  error: Error | null
  selectedReport: Report | null
  reportData: ReportData | null
  
  // Actions
  requestReport: (type: ReportType, startDate: Date, endDate: Date, marketplaceId?: string) => Promise<string>
  fetchReports: (type?: ReportType, status?: ReportStatus) => Promise<void>
  fetchReportStatus: (reportId: string) => Promise<Report>
  fetchReportData: (reportId: string, page?: number, limit?: number, search?: string) => Promise<void>
  selectReport: (report: Report | null) => void
  startPolling: (reportId: string, interval?: number) => void
  stopPolling: () => void
}

export function useAmazonReports(): UseAmazonReportsReturn {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Request a new report
  const requestReport = useCallback(async (
    type: ReportType,
    startDate: Date,
    endDate: Date,
    marketplaceId?: string
  ): Promise<string> => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.post('/api/reports/request', {
        type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        marketplaceId
      })

      if (response.data.success) {
        // Refresh reports list
        await fetchReports()
        return response.data.reportId
      } else {
        throw new Error(response.data.error || 'Failed to request report')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch list of reports
  const fetchReports = useCallback(async (type?: ReportType, status?: ReportStatus) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (type) params.append('type', type)
      if (status) params.append('status', status)

      const response = await axios.get(`/api/reports/list?${params}`)
      
      if (response.data.success) {
        setReports(response.data.reports)
      } else {
        throw new Error(response.data.error || 'Failed to fetch reports')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch single report status
  const fetchReportStatus = useCallback(async (reportId: string): Promise<Report> => {
    const response = await axios.get(`/api/reports/${reportId}`)
    
    if (!response.data || response.data.error) {
      throw new Error(response.data?.error || 'Failed to fetch report status')
    }

    return response.data
  }, [])

  // Fetch report data
  const fetchReportData = useCallback(async (
    reportId: string,
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response = await axios.get(`/api/reports/${reportId}/data?${params}`)
      
      if (response.data.success) {
        setReportData(response.data)
      } else {
        throw new Error(response.data.error || 'Failed to fetch report data')
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Select a report
  const selectReport = useCallback((report: Report | null) => {
    setSelectedReport(report)
    setReportData(null)
    
    if (report && report.status === 'COMPLETED') {
      fetchReportData(report.id)
    }
  }, [fetchReportData])

  // Start polling for report status
  const startPolling = useCallback((reportId: string, interval: number = 10000) => {
    stopPolling() // Clear any existing interval

    const poll = async () => {
      try {
        const report = await fetchReportStatus(reportId)
        
        // Update the report in the list
        setReports(prev => prev.map(r => r.id === reportId ? report : r))
        
        // If selected, update it
        if (selectedReport?.id === reportId) {
          setSelectedReport(report)
        }

        // Stop polling if completed or failed
        if (report.status === 'COMPLETED' || report.status === 'FAILED' || report.status === 'EXPIRED') {
          stopPolling()
          
          // Auto-fetch data if completed
          if (report.status === 'COMPLETED' && selectedReport?.id === reportId) {
            fetchReportData(reportId)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Start polling
    poll() // Initial poll
    const intervalId = setInterval(poll, interval)
    setPollingInterval(intervalId)
  }, [fetchReportStatus, fetchReportData, selectedReport])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }, [pollingInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    reports,
    loading,
    error,
    selectedReport,
    reportData,
    requestReport,
    fetchReports,
    fetchReportStatus,
    fetchReportData,
    selectReport,
    startPolling,
    stopPolling
  }
}