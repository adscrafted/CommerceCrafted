/**
 * Niche Service
 * Comprehensive service for managing product niches using Supabase
 * 
 * @module niche-service
 * @description Handles CRUD operations, niche-product associations, and subscription management
 */

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Types and Interfaces
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
  
  // Metadata
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
}

export interface NicheAnalysisResult {
  niche_id: string
  analysis_date: Date
  metrics: {
    total_reviews: number
    market_growth_rate: number
    competitive_index: number
  }
  ai_insights?: {
    summary: string
    opportunities: string[]
    risks: string[]
    recommendations: string[]
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface SubscriptionLimits {
  free: { niches: 1; products_per_niche: 10 }
  pro: { niches: 10; products_per_niche: 50 }
  enterprise: { niches: -1; products_per_niche: -1 } // -1 means unlimited
}

// Validation schemas
const createNicheSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'archived', 'draft']).default('draft'),
})

const updateNicheSchema = createNicheSchema.partial()

const addProductSchema = z.object({
  asin: z.string().regex(/^B[0-9A-Z]{9}$/, 'Invalid ASIN format'),
  notes: z.string().optional(),
  position: z.number().int().positive().optional(),
})

// Error classes
export class NicheServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'NicheServiceError'
  }
}

export class SubscriptionLimitError extends NicheServiceError {
  constructor(
    public limit: number,
    public current: number,
    public resource: 'niches' | 'products'
  ) {
    super(
      `Subscription limit reached: ${current}/${limit} ${resource}`,
      'SUBSCRIPTION_LIMIT_EXCEEDED',
      403
    )
  }
}

export class ValidationError extends NicheServiceError {
  constructor(message: string, public errors: any) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

/**
 * Niche Service Class
 * Manages all niche-related operations with Supabase
 */
export class NicheService {
  private supabase: ReturnType<typeof createClient>
  private subscriptionLimits: SubscriptionLimits = {
    free: { niches: 1, products_per_niche: 10 },
    pro: { niches: 10, products_per_niche: 50 },
    enterprise: { niches: -1, products_per_niche: -1 },
  }

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Create a new niche
   */
  async createNiche(
    userId: string,
    data: z.infer<typeof createNicheSchema>
  ): Promise<Niche> {
    try {
      // Validate input
      const validatedData = createNicheSchema.parse(data)
      
      // Check subscription limits
      await this.checkNicheLimits(userId)
      
      // Generate slug from name
      const slug = this.generateSlug(validatedData.name)
      
      // Create niche
      const { data: niche, error } = await this.supabase
        .from('niches')
        .insert({
          ...validatedData,
          slug,
          user_id: userId,
          product_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        throw new NicheServiceError(
          `Failed to create niche: ${error.message}`,
          'CREATE_FAILED'
        )
      }
      
      // Trigger initial analysis
      await this.triggerAnalysis(niche.id, userId)
      
      return niche
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid niche data', error.errors)
      }
      throw error
    }
  }

  /**
   * Get a single niche by ID
   */
  async getNiche(nicheId: string, userId: string): Promise<Niche | null> {
    const { data, error } = await this.supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new NicheServiceError(
        `Failed to fetch niche: ${error.message}`,
        'FETCH_FAILED'
      )
    }
    
    return data
  }

  /**
   * Update a niche
   */
  async updateNiche(
    nicheId: string,
    userId: string,
    data: z.infer<typeof updateNicheSchema>
  ): Promise<Niche> {
    try {
      // Validate input
      const validatedData = updateNicheSchema.parse(data)
      
      // Update slug if name changed
      if (validatedData.name) {
        validatedData.slug = this.generateSlug(validatedData.name)
      }
      
      // Update niche
      const { data: niche, error } = await this.supabase
        .from('niches')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nicheId)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) {
        throw new NicheServiceError(
          `Failed to update niche: ${error.message}`,
          'UPDATE_FAILED'
        )
      }
      
      return niche
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid niche data', error.errors)
      }
      throw error
    }
  }

  /**
   * Delete a niche and all associated data
   */
  async deleteNiche(nicheId: string, userId: string): Promise<void> {
    // Start a transaction
    const { error } = await this.supabase.rpc('delete_niche_cascade', {
      p_niche_id: nicheId,
      p_user_id: userId,
    })
    
    if (error) {
      throw new NicheServiceError(
        `Failed to delete niche: ${error.message}`,
        'DELETE_FAILED'
      )
    }
  }

  /**
   * List niches for a user with filtering and pagination
   */
  async listNiches(
    userId: string,
    options?: {
      status?: 'active' | 'archived' | 'draft'
      category?: string
      search?: string
      page?: number
      pageSize?: number
      sortBy?: 'name' | 'created_at' | 'updated_at' | 'product_count'
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<{
    niches: Niche[]
    total: number
    page: number
    pageSize: number
  }> {
    const page = options?.page || 1
    const pageSize = options?.pageSize || 20
    const offset = (page - 1) * pageSize
    
    let query = this.supabase
      .from('niches')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
    
    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.category) {
      query = query.eq('category', options.category)
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }
    
    // Apply sorting
    const sortBy = options?.sortBy || 'created_at'
    const sortOrder = options?.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      throw new NicheServiceError(
        `Failed to list niches: ${error.message}`,
        'LIST_FAILED'
      )
    }
    
    return {
      niches: data || [],
      total: count || 0,
      page,
      pageSize,
    }
  }

  /**
   * Add a product to a niche
   */
  async addProductToNiche(
    nicheId: string,
    userId: string,
    productData: z.infer<typeof addProductSchema>
  ): Promise<NicheProduct> {
    try {
      // Validate input
      const validatedData = addProductSchema.parse(productData)
      
      // Verify niche ownership
      const niche = await this.getNiche(nicheId, userId)
      if (!niche) {
        throw new NicheServiceError('Niche not found', 'NOT_FOUND', 404)
      }
      
      // Check subscription limits
      await this.checkProductLimits(userId, nicheId)
      
      // Validate ASIN exists (would call external service)
      await this.validateASIN(validatedData.asin)
      
      // Add product to niche
      const { data: nicheProduct, error } = await this.supabase
        .from('niche_products')
        .insert({
          niche_id: nicheId,
          asin: validatedData.asin,
          product_id: validatedData.asin, // In real app, would lookup actual product ID
          notes: validatedData.notes,
          position: validatedData.position,
          added_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') {
          throw new NicheServiceError(
            'Product already exists in this niche',
            'DUPLICATE_PRODUCT',
            409
          )
        }
        throw new NicheServiceError(
          `Failed to add product: ${error.message}`,
          'ADD_PRODUCT_FAILED'
        )
      }
      
      // Update product count
      await this.updateProductCount(nicheId)
      
      // Trigger re-analysis
      await this.triggerAnalysis(nicheId, userId)
      
      return nicheProduct
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid product data', error.errors)
      }
      throw error
    }
  }

  /**
   * Remove a product from a niche
   */
  async removeProductFromNiche(
    nicheId: string,
    asin: string,
    userId: string
  ): Promise<void> {
    // Verify niche ownership
    const niche = await this.getNiche(nicheId, userId)
    if (!niche) {
      throw new NicheServiceError('Niche not found', 'NOT_FOUND', 404)
    }
    
    const { error } = await this.supabase
      .from('niche_products')
      .delete()
      .eq('niche_id', nicheId)
      .eq('asin', asin)
    
    if (error) {
      throw new NicheServiceError(
        `Failed to remove product: ${error.message}`,
        'REMOVE_PRODUCT_FAILED'
      )
    }
    
    // Update product count
    await this.updateProductCount(nicheId)
  }

  /**
   * Get products in a niche
   */
  async getNicheProducts(
    nicheId: string,
    userId: string
  ): Promise<Array<NicheProduct & { product?: any }>> {
    // Verify niche ownership
    const niche = await this.getNiche(nicheId, userId)
    if (!niche) {
      throw new NicheServiceError('Niche not found', 'NOT_FOUND', 404)
    }
    
    const { data, error } = await this.supabase
      .from('niche_products')
      .select(`
        *,
        products (
          id,
          asin,
          title,
          price,
          bsr,
          rating,
          review_count,
          image_urls
        )
      `)
      .eq('niche_id', nicheId)
      .order('position', { ascending: true })
    
    if (error) {
      throw new NicheServiceError(
        `Failed to fetch niche products: ${error.message}`,
        'FETCH_PRODUCTS_FAILED'
      )
    }
    
    return data || []
  }

  /**
   * Search niches across all users (for discovery)
   */
  async searchPublicNiches(
    query: string,
    options?: {
      category?: string
      minOpportunityScore?: number
      page?: number
      pageSize?: number
    }
  ): Promise<{
    niches: Niche[]
    total: number
  }> {
    const page = options?.page || 1
    const pageSize = options?.pageSize || 20
    const offset = (page - 1) * pageSize
    
    let dbQuery = this.supabase
      .from('niches')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    
    if (options?.category) {
      dbQuery = dbQuery.eq('category', options.category)
    }
    
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)
    
    const { data, error, count } = await dbQuery
    
    if (error) {
      throw new NicheServiceError(
        `Failed to search niches: ${error.message}`,
        'SEARCH_FAILED'
      )
    }
    
    return {
      niches: data || [],
      total: count || 0,
    }
  }

  /**
   * Get analysis results for a niche
   */
  async getNicheAnalysis(
    nicheId: string,
    userId: string
  ): Promise<NicheAnalysisResult | null> {
    // Verify niche ownership
    const niche = await this.getNiche(nicheId, userId)
    if (!niche) {
      throw new NicheServiceError('Niche not found', 'NOT_FOUND', 404)
    }
    
    const { data, error } = await this.supabase
      .from('niche_analyses')
      .select('*')
      .eq('niche_id', nicheId)
      .order('analysis_date', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      throw new NicheServiceError(
        `Failed to fetch analysis: ${error.message}`,
        'FETCH_ANALYSIS_FAILED'
      )
    }
    
    return data
  }

  /**
   * Trigger analysis pipeline for a niche
   */
  private async triggerAnalysis(nicheId: string, userId: string): Promise<void> {
    // In production, this would trigger an async job/queue
    const { error } = await this.supabase
      .from('analysis_queue')
      .insert({
        niche_id: nicheId,
        user_id: userId,
        type: 'niche_analysis',
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    
    if (error) {
      console.error('Failed to queue analysis:', error)
      // Don't throw - analysis is not critical for CRUD operations
    }
  }

  /**
   * Check niche limits based on subscription tier
   */
  private async checkNicheLimits(userId: string): Promise<void> {
    // Get user's subscription tier
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()
    
    if (userError) {
      throw new NicheServiceError(
        'Failed to fetch user data',
        'USER_FETCH_FAILED'
      )
    }
    
    const tier = (user.subscription_tier || 'free') as keyof SubscriptionLimits
    const limits = this.subscriptionLimits[tier]
    
    if (limits.niches === -1) return // Unlimited
    
    // Count existing niches
    const { count, error: countError } = await this.supabase
      .from('niches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (countError) {
      throw new NicheServiceError(
        'Failed to count niches',
        'COUNT_FAILED'
      )
    }
    
    if (count >= limits.niches) {
      throw new SubscriptionLimitError(limits.niches, count, 'niches')
    }
  }

  /**
   * Check product limits for a niche
   */
  private async checkProductLimits(userId: string, nicheId: string): Promise<void> {
    // Get user's subscription tier
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()
    
    if (userError) {
      throw new NicheServiceError(
        'Failed to fetch user data',
        'USER_FETCH_FAILED'
      )
    }
    
    const tier = (user.subscription_tier || 'free') as keyof SubscriptionLimits
    const limits = this.subscriptionLimits[tier]
    
    if (limits.products_per_niche === -1) return // Unlimited
    
    // Count existing products in niche
    const { count, error: countError } = await this.supabase
      .from('niche_products')
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId)
    
    if (countError) {
      throw new NicheServiceError(
        'Failed to count products',
        'COUNT_FAILED'
      )
    }
    
    if (count >= limits.products_per_niche) {
      throw new SubscriptionLimitError(
        limits.products_per_niche,
        count,
        'product'
      )
    }
  }

  /**
   * Validate ASIN format and existence
   */
  private async validateASIN(asin: string): Promise<void> {
    // Basic format validation
    if (!/^B[0-9A-Z]{9}$/.test(asin)) {
      throw new ValidationError('Invalid ASIN format', {
        asin: 'ASIN must start with B followed by 9 alphanumeric characters',
      })
    }
    
    // In production, would check if product exists in database or external API
    // For now, just return success
    return
  }

  /**
   * Update product count for a niche
   */
  private async updateProductCount(nicheId: string): Promise<void> {
    const { count, error: countError } = await this.supabase
      .from('niche_products')
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId)
    
    if (countError) {
      console.error('Failed to count products:', countError)
      return
    }
    
    const { error: updateError } = await this.supabase
      .from('niches')
      .update({
        product_count: count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nicheId)
    
    if (updateError) {
      console.error('Failed to update product count:', updateError)
    }
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Setup Row Level Security policies (to be run once during setup)
   */
  async setupRLS(): Promise<void> {
    // This would be run as database migrations
    const policies = [
      // Niches table
      `CREATE POLICY "Users can view their own niches" ON niches FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can create their own niches" ON niches FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update their own niches" ON niches FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can delete their own niches" ON niches FOR DELETE USING (auth.uid() = user_id)`,
      
      // Niche products table
      `CREATE POLICY "Users can view products in their niches" ON niche_products FOR SELECT USING (EXISTS (SELECT 1 FROM niches WHERE niches.id = niche_products.niche_id AND niches.user_id = auth.uid()))`,
      `CREATE POLICY "Users can add products to their niches" ON niche_products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM niches WHERE niches.id = niche_products.niche_id AND niches.user_id = auth.uid()))`,
      `CREATE POLICY "Users can remove products from their niches" ON niche_products FOR DELETE USING (EXISTS (SELECT 1 FROM niches WHERE niches.id = niche_products.niche_id AND niches.user_id = auth.uid()))`,
    ]
    
    // Note: These would be executed via Supabase migrations, not at runtime
    console.log('RLS policies to be applied:', policies)
  }
}

// Export singleton instance
export const createNicheService = (supabaseUrl: string, supabaseKey: string) => {
  return new NicheService(supabaseUrl, supabaseKey)
}

// Helper functions for common operations
export const nicheService = {
  /**
   * Create a niche service instance with environment variables
   */
  getInstance: () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }
    
    return createNicheService(supabaseUrl, supabaseKey)
  },
  
  /**
   * Format niche for display
   */
  formatNiche: (niche: Niche) => ({
    ...niche,
    displayName: niche.name,
    url: `/niches/${niche.slug}`,
    isActive: niche.status === 'active',
    hasAnalysis: !!niche.last_analyzed_at,
  }),
  
  /**
   * Calculate niche health score
   */
  calculateHealthScore: (niche: Niche): number => {
    const factors = [
      Math.min(niche.product_count / 10, 1),
      niche.last_analyzed_at ? 1 : 0,
    ]
    
    return Math.round(factors.reduce((a, b) => a + b, 0) / factors.length * 100)
  },
}

// Export types
export type { Niche, NicheProduct, NicheAnalysisResult, SubscriptionLimits }