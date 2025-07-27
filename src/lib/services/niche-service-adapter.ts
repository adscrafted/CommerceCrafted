/**
 * Niche Service Adapter
 * Adapts the Supabase-based niche service to work with the current NextAuth/Supabase setup
 * TODO: Remove this adapter once fully migrated to Supabase
 */

import { supabase } from '@/lib/supabase'
import { 
  NicheService, 
  Niche, 
  NicheProduct, 
  NicheAnalysisResult,
  NicheServiceError,
  SubscriptionLimitError,
  ValidationError
} from './niche-service'

// Mock Supabase client that uses Supabase instead of Prisma
class SupabaseAdapter {
  from(table: string) {
    return new SupabaseQueryBuilder(table)
  }
  
  rpc(functionName: string, params: any) {
    // Handle RPC calls
    if (functionName === 'delete_niche_cascade') {
      return this.deleteNicheCascade(params.p_niche_id, params.p_user_id)
    }
    return { error: new Error('Unknown RPC function') }
  }
  
  private async deleteNicheCascade(nicheId: string, userId: string) {
    try {
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = await createServerSupabaseClient()
      
      // First, verify the niche belongs to the user
      const { data: niche, error: nicheError } = await supabase
        .from('niches')
        .select('id, user_id')
        .eq('id', nicheId)
        .eq('user_id', userId)
        .single()
      
      if (nicheError || !niche) {
        return { error: new Error('Niche not found or access denied') }
      }
      
      // Delete related data in the correct order to avoid foreign key constraints
      
      // 1. First get all product IDs in this niche
      const { data: nicheProducts, error: fetchError } = await supabase
        .from('niche_products')
        .select('product_id')
        .eq('niche_id', nicheId)
      
      if (fetchError) {
        console.error('Error fetching niche products:', fetchError)
      }
      
      // 2. Delete product analyses for products in this niche
      if (nicheProducts && nicheProducts.length > 0) {
        const productIds = nicheProducts.map(np => np.product_id)
        const { error: analysesError } = await supabase
          .from('niches_overall_analysis')
          .delete()
          .in('product_id', productIds)
        
        if (analysesError) {
          console.error('Error deleting product analyses:', analysesError)
        }
      }
      
      // 3. Delete niche_products (junction table)
      const { error: nicheProductsError } = await supabase
        .from('niche_products')
        .delete()
        .eq('niche_id', nicheId)
      
      if (nicheProductsError) {
        console.error('Error deleting niche products:', nicheProductsError)
      }
      
      // 4. Delete analysis_runs for this niche
      const { error: runsError } = await supabase
        .from('analysis_runs')
        .delete()
        .eq('niche_id', nicheId)
      
      if (runsError) {
        console.error('Error deleting analysis runs:', runsError)
      }
      
      // 5. Delete product_keywords for products in this niche
      const { error: keywordsError } = await supabase
        .from('product_keywords')
        .delete()
        .eq('niche_id', nicheId)
      
      if (keywordsError) {
        console.error('Error deleting product keywords:', keywordsError)
      }
      
      // 6. Delete the niche itself
      const { error: deleteError } = await supabase
        .from('niches')
        .delete()
        .eq('id', nicheId)
        .eq('user_id', userId)
      
      if (deleteError) {
        return { error: deleteError }
      }
      
      // 7. Clean up orphaned products (products that don't belong to any niche)
      if (nicheProducts && nicheProducts.length > 0) {
        const productIds = nicheProducts.map(np => np.product_id)
        
        // For each product that was in this niche, check if it belongs to any other niche
        for (const productId of productIds) {
          const { data: otherNiches, error: checkError } = await supabase
            .from('niche_products')
            .select('niche_id')
            .eq('product_id', productId)
            .limit(1)
          
          if (checkError) {
            console.error(`Error checking for other niches for product ${productId}:`, checkError)
            continue
          }
          
          // If this product doesn't belong to any other niche, it's orphaned
          if (!otherNiches || otherNiches.length === 0) {
            console.log(`Deleting orphaned product ${productId}`)
            
            // Delete the orphaned product
            const { error: productDeleteError } = await supabase
              .from('product')
              .delete()
              .eq('id', productId)
            
            if (productDeleteError) {
              console.error(`Error deleting orphaned product ${productId}:`, productDeleteError)
            }
          }
        }
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error in deleteNicheCascade:', error)
      return { error }
    }
  }
}

class SupabaseQueryBuilder {
  private table: string
  private selectFields: string = '*'
  private whereConditions: any[] = []
  private orderByField?: string
  private orderDirection: 'asc' | 'desc' = 'asc'
  private limitValue?: number
  private offsetValue?: number
  private countType?: 'exact'
  
  constructor(table: string) {
    this.table = table
  }
  
  select(fields: string = '*', options?: { count?: 'exact' }) {
    this.selectFields = fields
    if (options?.count) {
      this.countType = options.count
    }
    return this
  }
  
  insert(data: any) {
    // Mock insert - would map to Supabase insert
    return {
      select: () => ({
        single: async () => ({ data: { ...data, id: Math.random().toString(36) }, error: null })
      })
    }
  }
  
  update(data: any) {
    // Mock update - would map to Supabase update
    return this
  }
  
  delete() {
    // Mock delete - would map to Supabase delete
    return this
  }
  
  eq(field: string, value: any) {
    this.whereConditions.push({ [field]: value })
    return this
  }
  
  or(condition: string) {
    // Parse OR conditions
    return this
  }
  
  gte(field: string, value: any) {
    this.whereConditions.push({ [field]: { gte: value } })
    return this
  }
  
  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = field
    this.orderDirection = options?.ascending === false ? 'desc' : 'asc'
    return this
  }
  
  range(from: number, to: number) {
    this.offsetValue = from
    this.limitValue = to - from + 1
    return this
  }
  
  limit(value: number) {
    this.limitValue = value
    return this
  }
  
  single() {
    return this.execute(true)
  }
  
  async execute(single = false) {
    // This would map to actual Supabase queries
    // For now, return mock data
    if (single) {
      return { data: null, error: null }
    }
    return { data: [], error: null, count: 0 }
  }
}

// Create an adapter instance that uses the current auth system
export class NicheServiceAdapter {
  private service: NicheService
  
  constructor() {
    // Create a mock Supabase client that adapts to actual Supabase
    const mockSupabase = new SupabaseAdapter() as any
    
    // Use mock URLs/keys since we're not actually using Supabase yet
    this.service = new NicheService(
      'https://mock-url.supabase.co',
      'mock-key'
    )
    
    // Replace the Supabase client with our adapter
    ;(this.service as any).supabase = mockSupabase
  }
  
  // Proxy all methods to the underlying service
  async createNiche(userId: string, data: any) {
    return this.service.createNiche(userId, data)
  }
  
  async getNiche(nicheId: string, userId: string) {
    return this.service.getNiche(nicheId, userId)
  }
  
  async updateNiche(nicheId: string, userId: string, data: any) {
    return this.service.updateNiche(nicheId, userId, data)
  }
  
  async deleteNiche(nicheId: string, userId: string) {
    return this.service.deleteNiche(nicheId, userId)
  }
  
  async listNiches(userId: string, options?: any) {
    return this.service.listNiches(userId, options)
  }
  
  async addProductToNiche(nicheId: string, userId: string, productData: any) {
    return this.service.addProductToNiche(nicheId, userId, productData)
  }
  
  async removeProductFromNiche(nicheId: string, asin: string, userId: string) {
    return this.service.removeProductFromNiche(nicheId, asin, userId)
  }
  
  async getNicheProducts(nicheId: string, userId: string) {
    return this.service.getNicheProducts(nicheId, userId)
  }
  
  async searchPublicNiches(query: string, options?: any) {
    return this.service.searchPublicNiches(query, options)
  }
  
  async getNicheAnalysis(nicheId: string, userId: string) {
    return this.service.getNicheAnalysis(nicheId, userId)
  }
  
  // Additional method to trigger analysis
  async triggerAnalysis(nicheId: string, userId: string) {
    // This would queue an analysis job
    // For now, just return success
    return { success: true, jobId: Math.random().toString(36) }
  }
  
  // Get analysis status
  async getAnalysisStatus(nicheId: string, userId: string) {
    // Check if niche belongs to user
    const niche = await this.getNiche(nicheId, userId)
    if (!niche) {
      throw new NicheServiceError('Niche not found', 'NOT_FOUND', 404)
    }
    
    // Return mock status for now
    return {
      nicheId,
      status: 'completed' as const,
      progress: 100,
      lastAnalyzedAt: new Date(),
      nextAnalysisAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  }
  
  // Export niche data
  async exportNicheData(nicheId: string, userId: string, format: 'json' | 'csv' = 'json') {
    const niche = await this.getNiche(nicheId, userId)
    if (!niche) {
      throw new NicheServiceError('Niche not found', 'NOT_FOUND', 404)
    }
    
    const products = await this.getNicheProducts(nicheId, userId)
    const analysis = await this.getNicheAnalysis(nicheId, userId)
    
    const data = {
      niche,
      products,
      analysis,
      exportedAt: new Date()
    }
    
    if (format === 'json') {
      return {
        data: JSON.stringify(data, null, 2),
        contentType: 'application/json',
        filename: `niche-${niche.slug}-export.json`
      }
    } else {
      // Convert to CSV format
      const csv = this.convertToCSV(data)
      return {
        data: csv,
        contentType: 'text/csv',
        filename: `niche-${niche.slug}-export.csv`
      }
    }
  }
  
  private convertToCSV(data: any): string {
    // Simple CSV conversion - in production use a proper CSV library
    const headers = ['Field', 'Value']
    const rows = [
      ['Niche Name', data.niche.name],
      ['Category', data.niche.category],
      ['Product Count', data.products.length],
      ['Last Analyzed', data.analysis?.analysis_date || 'Never'],
    ]
    
    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
  }
}

// Export singleton instance
export const nicheService = new NicheServiceAdapter()

// Re-export types
export type { Niche, NicheProduct, NicheAnalysisResult }
export { NicheServiceError, SubscriptionLimitError, ValidationError }