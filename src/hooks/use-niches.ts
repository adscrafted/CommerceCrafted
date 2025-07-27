/**
 * React hooks for niche API operations
 */

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// Types
export interface Niche {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  subcategory?: string
  tags: string[]
  status: 'active' | 'archived' | 'draft'
  user_id: string
  product_count: number
  last_analyzed_at?: Date
  created_at: Date
  updated_at: Date
}

export interface NicheProduct {
  niche_id: string
  product_id: string
  asin: string
  added_at: Date
  position?: number
  notes?: string
  product?: any
}

interface UseNichesOptions {
  onError?: (error: any) => void
  onSuccess?: (data: any) => void
}

// API client
class NicheAPI {
  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }
    
    return response.json()
  }
  
  async listNiches(params?: Record<string, any>) {
    const queryString = new URLSearchParams(params).toString()
    return this.fetch<{ data: Niche[], pagination: any }>(`/api/niches?${queryString}`)
  }
  
  async createNiche(data: Partial<Niche>) {
    return this.fetch<{ data: Niche }>('/api/niches', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  
  async getNiche(id: string) {
    return this.fetch<{ data: Niche }>(`/api/niches/${id}`)
  }
  
  async updateNiche(id: string, data: Partial<Niche>) {
    return this.fetch<{ data: Niche }>(`/api/niches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
  
  async deleteNiche(id: string) {
    return this.fetch<{ message: string }>(`/api/niches/${id}`, {
      method: 'DELETE',
    })
  }
  
  async getNicheProducts(id: string) {
    return this.fetch<{ data: NicheProduct[] }>(`/api/niches/${id}/products`)
  }
  
  async addProductToNiche(nicheId: string, data: { asin: string, notes?: string, position?: number }) {
    return this.fetch<{ data: NicheProduct }>(`/api/niches/${nicheId}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  
  async removeProductFromNiche(nicheId: string, asin: string) {
    return this.fetch<{ message: string }>(`/api/niches/${nicheId}/products?asin=${asin}`, {
      method: 'DELETE',
    })
  }
  
  async triggerAnalysis(nicheId: string, type: string = 'full', force: boolean = false) {
    return this.fetch<{ data: any }>(`/api/niches/${nicheId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ type, force }),
    })
  }
  
  async getAnalysisStatus(nicheId: string) {
    return this.fetch<{ data: any }>(`/api/niches/${nicheId}/status`)
  }
  
  async exportNiche(nicheId: string, format: 'json' | 'csv' = 'json') {
    const response = await fetch(`/api/niches/${nicheId}/export?format=${format}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Export failed')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'niche-export'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
  
  async searchNiches(query: string, params?: Record<string, any>) {
    const allParams = { q: query, ...params }
    const queryString = new URLSearchParams(allParams).toString()
    return this.fetch<{ data: Niche[] }>(`/api/niches/search?${queryString}`)
  }
}

const api = new NicheAPI()

// Hook for listing niches
export function useNiches(options?: UseNichesOptions) {
  const [niches, setNiches] = useState<Niche[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<any>(null)
  
  const fetchNiches = useCallback(async (params?: Record<string, any>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.listNiches(params)
      setNiches(response.data)
      setPagination(response.pagination)
      options?.onSuccess?.(response.data)
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  }, [options])
  
  return {
    niches,
    loading,
    error,
    pagination,
    fetchNiches,
    refetch: fetchNiches,
  }
}

// Hook for single niche operations
export function useNiche(nicheId?: string, options?: UseNichesOptions) {
  const [niche, setNiche] = useState<Niche | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchNiche = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.getNiche(id)
      setNiche(response.data)
      options?.onSuccess?.(response.data)
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  }, [options])
  
  const createNiche = useCallback(async (data: Partial<Niche>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.createNiche(data)
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [options])
  
  const updateNiche = useCallback(async (id: string, data: Partial<Niche>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.updateNiche(id, data)
      setNiche(response.data)
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [options])
  
  const deleteNiche = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await api.deleteNiche(id)
      setNiche(null)
      options?.onSuccess?.(null)
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [options])
  
  return {
    niche,
    loading,
    error,
    fetchNiche,
    createNiche,
    updateNiche,
    deleteNiche,
  }
}

// Hook for niche products
export function useNicheProducts(nicheId: string, options?: UseNichesOptions) {
  const [products, setProducts] = useState<NicheProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.getNicheProducts(nicheId)
      setProducts(response.data)
      options?.onSuccess?.(response.data)
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
    } finally {
      setLoading(false)
    }
  }, [nicheId, options])
  
  const addProduct = useCallback(async (data: { asin: string, notes?: string, position?: number }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.addProductToNiche(nicheId, data)
      await fetchProducts() // Refresh the list
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [nicheId, fetchProducts, options])
  
  const removeProduct = useCallback(async (asin: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await api.removeProductFromNiche(nicheId, asin)
      await fetchProducts() // Refresh the list
      options?.onSuccess?.(null)
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [nicheId, fetchProducts, options])
  
  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    removeProduct,
  }
}

// Hook for niche analysis
export function useNicheAnalysis(nicheId: string, options?: UseNichesOptions) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const triggerAnalysis = useCallback(async (type: string = 'full', force: boolean = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.triggerAnalysis(nicheId, type, force)
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [nicheId, options])
  
  const checkStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.getAnalysisStatus(nicheId)
      setStatus(response.data)
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [nicheId, options])
  
  const exportData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    setLoading(true)
    setError(null)
    
    try {
      await api.exportNiche(nicheId, format)
      options?.onSuccess?.(null)
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [nicheId, options])
  
  return {
    status,
    loading,
    error,
    triggerAnalysis,
    checkStatus,
    exportData,
  }
}

// Hook for searching niches
export function useNicheSearch(options?: UseNichesOptions) {
  const [results, setResults] = useState<Niche[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const search = useCallback(async (query: string, params?: Record<string, any>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.searchNiches(query, params)
      setResults(response.data)
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      setError(err as Error)
      options?.onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [options])
  
  return {
    results,
    loading,
    error,
    search,
  }
}