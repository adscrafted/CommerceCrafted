// Niche Processing Queue System
// Handles background processing of niches with multiple ASINs

import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface NicheProcessingJob {
  nicheId: string
  nicheName: string
  asins: string[]
  marketplace: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: {
    current: number
    total: number
    currentAsin?: string
    completedAsins: string[]
    failedAsins: string[]
  }
  startedAt?: Date
  completedAt?: Date
  error?: string
}

export class NicheProcessor {
  private processingJobs: Map<string, NicheProcessingJob> = new Map()
  
  /**
   * Start processing a niche with multiple ASINs
   */
  async processNiche(nicheId: string, nicheName: string, asins: string[], marketplace: string = 'US') {
    const job: NicheProcessingJob = {
      nicheId,
      nicheName,
      asins,
      marketplace,
      status: 'pending',
      progress: {
        current: 0,
        total: asins.length,
        completedAsins: [],
        failedAsins: []
      }
    }

    this.processingJobs.set(nicheId, job)
    
    // Start processing
    this.executeProcessing(job)
    
    return job
  }

  /**
   * Execute the actual processing
   */
  private async executeProcessing(job: NicheProcessingJob) {
    const supabase = await createServerSupabaseClient()
    
    try {
      job.status = 'processing'
      job.startedAt = new Date()
      
      // Update niche status
      await supabase
        .from('niches')
        .update({ 
          status: 'processing',
          process_started_at: job.startedAt.toISOString()
        })
        .eq('id', job.nicheId)

      // Process each ASIN
      for (const asin of job.asins) {
        try {
          job.progress.currentAsin = asin
          
          // Call comprehensive sync for each ASIN
          const syncResult = await this.syncAsinData(asin)
          
          if (syncResult.success) {
            job.progress.completedAsins.push(asin)
          } else {
            job.progress.failedAsins.push(asin)
          }
          
          job.progress.current++
          
          // Update progress in database
          await this.updateProgress(job)
          
          // Rate limiting - wait between ASINs
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          console.error(`Error processing ASIN ${asin}:`, error)
          job.progress.failedAsins.push(asin)
        }
      }

      // Calculate niche-level analytics
      await this.calculateNicheAnalytics(job.nicheId)
      
      // Mark as completed
      job.status = 'completed'
      job.completedAt = new Date()
      
      await supabase
        .from('niches')
        .update({ 
          status: 'completed',
          process_completed_at: job.completedAt.toISOString(),
          total_products: job.progress.completedAsins.length,
          failed_products: job.progress.failedAsins.length
        })
        .eq('id', job.nicheId)

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      
      await supabase
        .from('niches')
        .update({ 
          status: 'failed',
          error_message: job.error
        })
        .eq('id', job.nicheId)
    }
  }

  /**
   * Sync all data for a single ASIN using Keepa only
   */
  private async syncAsinData(asin: string) {
    try {
      // Fetch data from Keepa
      const keepaResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/keepa/fetch-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin })
      })
      
      if (!keepaResponse.ok) {
        throw new Error(`Keepa fetch failed: ${keepaResponse.statusText}`)
      }
      
      const keepaResult = await keepaResponse.json()
      
      // Try to fetch additional data from other APIs (Ads API, OpenAI analysis)
      // but skip SP-API since we're removing it from the niche workflow
      try {
        // Call Ads API if available
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ads-api/sync/${asin}`, {
          method: 'POST'
        }).catch(error => {
          console.warn('Ads API sync failed for ASIN:', asin, error)
        })
        
        // Call OpenAI analysis if available
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/openai/analyze/${asin}`, {
          method: 'POST'
        }).catch(error => {
          console.warn('OpenAI analysis failed for ASIN:', asin, error)
        })
      } catch (additionalError) {
        // Log but don't fail if additional syncs fail
        console.warn('Additional sync failed for ASIN:', asin, additionalError)
      }
      
      return { 
        success: true, 
        productId: keepaResult.productId,
        source: keepaResult.source 
      }
    } catch (error) {
      console.error('Sync failed for ASIN:', asin, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Update processing progress in database
   */
  private async updateProgress(job: NicheProcessingJob) {
    const supabase = await createServerSupabaseClient()
    
    await supabase
      .from('niches')
      .update({
        processing_progress: {
          current: job.progress.current,
          total: job.progress.total,
          percentage: Math.round((job.progress.current / job.progress.total) * 100),
          currentAsin: job.progress.currentAsin,
          completedAsins: job.progress.completedAsins,
          failedAsins: job.progress.failedAsins
        }
      })
      .eq('id', job.nicheId)
  }

  /**
   * Calculate aggregated analytics for the niche
   */
  private async calculateNicheAnalytics(nicheId: string) {
    const supabase = await createServerSupabaseClient()
    
    // Get all products in the niche
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_analyses (
          opportunity_score,
          competition_score,
          demand_score,
          feasibility_score,
          timing_score,
          financial_analysis
        ),
        keyword_analyses (*)
      `)
      .in('asin', 
        await this.getNicheAsins(nicheId)
      )

    if (error || !products) return

    // Calculate aggregate metrics
    const totalProducts = products.length
    let totalRevenue = 0
    let avgOpportunityScore = 0
    let avgCompetitionScore = 0
    let avgPrice = 0
    let avgBsr = 0
    let totalReviews = 0
    const allKeywords = new Set<string>()

    products.forEach(product => {
      const analysis = product.product_analyses?.[0]
      if (analysis) {
        avgOpportunityScore += analysis.opportunity_score || 0
        avgCompetitionScore += analysis.competition_score || 0
        
        const monthlyRevenue = analysis.financial_analysis?.monthlyProjections?.revenue || 0
        totalRevenue += monthlyRevenue
      }
      
      avgPrice += product.price || 0
      avgBsr += product.bsr || 0
      totalReviews += product.review_count || 0
      
      // Collect keywords
      const keywords = product.keyword_analyses?.[0]
      if (keywords?.primary_keywords) {
        keywords.primary_keywords.forEach((kw: any) => {
          allKeywords.add(kw.keyword)
        })
      }
    })

    // Calculate averages
    avgOpportunityScore = totalProducts > 0 ? avgOpportunityScore / totalProducts : 0
    avgCompetitionScore = totalProducts > 0 ? avgCompetitionScore / totalProducts : 0
    avgPrice = totalProducts > 0 ? avgPrice / totalProducts : 0
    avgBsr = totalProducts > 0 ? avgBsr / totalProducts : 0

    // Update niche with calculated analytics
    await supabase
      .from('niches')
      .update({
        avg_opportunity_score: avgOpportunityScore,
        avg_competition_score: avgCompetitionScore,
        avg_price: avgPrice,
        avg_bsr: avgBsr,
        total_reviews: totalReviews,
        total_monthly_revenue: totalRevenue,
        total_keywords: allKeywords.size,
        niche_keywords: Array.from(allKeywords).slice(0, 50).join(','),
        market_size: totalRevenue * 12, // Annual projection
        competition_level: this.calculateCompetitionLevel(avgCompetitionScore),
        updated_at: new Date().toISOString()
      })
      .eq('id', nicheId)
  }

  /**
   * Get ASINs for a niche
   */
  private async getNicheAsins(nicheId: string): Promise<string[]> {
    const supabase = await createServerSupabaseClient()
    
    const { data: niche } = await supabase
      .from('niches')
      .select('asins')
      .eq('id', nicheId)
      .single()
    
    return niche?.asins?.split(',').map((a: string) => a.trim()) || []
  }

  /**
   * Calculate competition level
   */
  private calculateCompetitionLevel(avgCompetitionScore: number): string {
    if (avgCompetitionScore >= 80) return 'LOW'
    if (avgCompetitionScore >= 60) return 'MEDIUM'
    if (avgCompetitionScore >= 40) return 'HIGH'
    return 'VERY_HIGH'
  }

  /**
   * Get job status
   */
  getJobStatus(nicheId: string): NicheProcessingJob | null {
    return this.processingJobs.get(nicheId) || null
  }
}

// Export singleton instance
export const nicheProcessor = new NicheProcessor()