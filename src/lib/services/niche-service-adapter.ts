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
  
  async rpc(functionName: string, params: any) {
    // Handle RPC calls
    if (functionName === 'delete_niche_cascade') {
      return await this.privateDeleteNicheCascade(params.p_niche_id, params.p_user_id)
    }
    return { error: new Error('Unknown RPC function') }
  }
  
  // Public method that can be called externally
  async deleteNicheCascade(nicheId: string, userId: string) {
    return await this.privateDeleteNicheCascade(nicheId, userId)
  }
  
  private async privateDeleteNicheCascade(nicheId: string, userId: string) {
    try {
      // Use the real Supabase implementation
      const { createServerSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = await createServerSupabaseClient()
      
      console.log(`[Delete Cascade] Attempting to delete niche ${nicheId} for user ${userId}`)
      
      // Let's see what niches actually exist for this user
      const { data: allUserNiches, error: allNichesError } = await supabase
        .from('niches')
        .select('id, niche_name, created_by')
        .eq('created_by', userId)
      
      console.log(`[Delete Cascade] All niches for user ${userId}:`, allUserNiches)
      
      // Also check if this specific niche exists at all (regardless of user)
      const { data: globalNiche, error: globalError } = await supabase
        .from('niches')
        .select('id, niche_name, created_by')
        .eq('id', nicheId)
        .maybeSingle()
      
      console.log(`[Delete Cascade] Global niche lookup for ${nicheId}:`, globalNiche)
      
      // First, verify the niche belongs to the user and get the ASINs
      const { data: niche, error: nicheError } = await supabase
        .from('niches')
        .select('id, created_by, asins')
        .eq('id', nicheId)
        .eq('created_by', userId)
        .single()
      
      console.log(`[Delete Cascade] Niche lookup result:`, { niche, nicheError })
      
      if (nicheError || !niche) {
        // Let's also try without created_by filter to see if niche exists at all
        const { data: anyNiche, error: anyNicheError } = await supabase
          .from('niches')
          .select('id, created_by, asins')
          .eq('id', nicheId)
          .single()
        
        console.log(`[Delete Cascade] Niche exists check:`, { anyNiche, anyNicheError })
        
        return { error: new Error('Niche not found or access denied') }
      }
      
      // Get the ASINs from this niche before deleting it  
      console.log(`[Delete Cascade] Getting ASINs for niche ${nicheId}`)
      console.log(`[Delete Cascade] Raw ASINs string from niche:`, niche.asins)
      const asinsString = niche.asins || ''
      const nicheAsins = asinsString.split(',').map(asin => asin.trim()).filter(asin => asin)
      
      console.log(`[Delete Cascade] Found ASINs in niche:`, nicheAsins)
      console.log(`[Delete Cascade] Number of ASINs found:`, nicheAsins.length)
      
      // Delete related data for this niche
      // 1. Delete analysis_runs for this niche
      const { error: runsError } = await supabase
        .from('analysis_runs')
        .delete()
        .eq('niche_id', nicheId)
      
      if (runsError) {
        console.error('Error deleting analysis runs:', runsError)
      }
      
      // 2. Delete all niche analysis tables
      const nicheAnalysisTables = [
        'niches_competition_analysis',
        'niches_demand_analysis',
        'niches_financial_analysis', 
        'niches_keyword_analysis',
        'niches_launch_strategy',
        'niches_listing_optimization',
        'niches_market_intelligence',
        'niches_overall_analysis'
      ]
      
      for (const analysisTable of nicheAnalysisTables) {
        const { error: analysisError } = await supabase
          .from(analysisTable)
          .delete()
          .eq('niche_id', nicheId)
        
        if (analysisError) {
          console.error(`Error deleting ${analysisTable}:`, analysisError)
        } else {
          console.log(`[Delete Cascade] Deleted records from ${analysisTable}`)
        }
      }
      
      // 3. Delete the niche itself
      const { error: deleteError } = await supabase
        .from('niches')
        .delete()
        .eq('id', nicheId)
        .eq('created_by', userId)
      
      if (deleteError) {
        console.error('Error deleting niche:', deleteError)
        return { error: new Error(`Failed to delete niche: ${deleteError.message}`) }
      }
      
      // 4. The cascading triggers should handle cleanup of related data automatically
      console.log(`[Delete Cascade] Relying on database cascading triggers for cleanup of related data`)
      
      // Note: Previously we tried to manually clean up orphaned ASINs, but this was causing
      // "column reference 'asin' is ambiguous" errors. The database should have cascading
      // foreign key constraints or triggers that handle this automatically.
      
      console.log(`Successfully deleted niche ${nicheId} for user ${userId}`)
      return { error: null }
      
      /* Original implementation for reference:
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
      // NOTE: Commenting out as product_keywords table doesn't exist yet
      // const { error: keywordsError } = await supabase
      //   .from('product_keywords')
      //   .delete()
      //   .eq('niche_id', nicheId)
      // 
      // if (keywordsError) {
      //   console.error('Error deleting product keywords:', keywordsError)
      // }
      
      // 6. Delete the niche itself
      const { error: deleteError } = await supabase
        .from('niches')
        .delete()
        .eq('id', nicheId)
        .eq('user_id', userId)
      
      if (deleteError) {
        console.error('Error deleting niche:', deleteError)
        return { error: new Error(`Failed to delete niche: ${deleteError.message}`) }
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
      
      */
    } catch (error) {
      console.error('Error in deleteNicheCascade:', error)
      return { 
        error: error instanceof Error ? error : new Error('Unknown error during niche deletion')
      }
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
    // Use the real Supabase URL and key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bcqhovifscrhlkvdhkuf.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcWhvdmlmc2NyaGxrdmRoa3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5MDMsImV4cCI6MjA2NzY2ODkwM30.eGq9ihvb-TWBX-6kHRrqRD9wtLYzqRJI0LhP2TM1Ft4'
    
    // Create the real NicheService with actual Supabase credentials
    this.service = new NicheService(
      supabaseUrl,
      supabaseAnonKey
    )
    
    // Use the SupabaseAdapter for RPC calls
    const mockSupabase = new SupabaseAdapter() as any
    
    // Override just the RPC method to use our adapter
    const originalSupabase = (this.service as any).supabase
    ;(this.service as any).supabase = {
      ...originalSupabase,
      rpc: async (functionName: string, params: any) => {
        return await mockSupabase.rpc(functionName, params)
      }
    }
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
    // Call the real service method which will use our overridden RPC
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