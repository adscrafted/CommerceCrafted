/**
 * Analysis Orchestrator Service
 * Coordinates the entire niche analysis pipeline with multiple data sources
 * 
 * @module analysis-orchestrator
 * @description Orchestrates Keepa, Apify, AI services, and manages analysis runs with queue processing
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import pLimit from 'p-limit';

// Service imports
import { keepaService, KeepaProduct, KeepaError } from './keepa-service';
import { apifyService, AmazonReview, CompetitorData, ApifyError } from './apify-service';
import { createNicheService, Niche, NicheAnalysisResult } from './niche-service';
import { AIService } from '../ai-service';
import { apiConfig } from '../api-config';
// TODO: Convert to Supabase - import { supabase } from '@/lib/supabase';

// Types and Interfaces
export interface AnalysisRunConfig {
  nicheId: string;
  userId: string;
  includeReviews?: boolean;
  includeCompetitors?: boolean;
  includeSocialMedia?: boolean;
  maxProductsToAnalyze?: number;
  priority?: 'low' | 'normal' | 'high';
  webhookUrl?: string;
}

export interface AnalysisRunStatus {
  runId: string;
  nicheId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partially_completed';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  steps: AnalysisStep[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  results?: AnalysisResults;
  costs: {
    keepa: number;
    apify: number;
    ai: number;
    total: number;
  };
}

export interface AnalysisStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  data?: any;
}

export interface AnalysisResults {
  niche: {
    id: string;
    name: string;
  };
  products: AnalyzedProduct[];
  marketInsights: MarketInsights;
  aiRecommendations: AIRecommendations;
  competitorAnalysis?: CompetitorInsights;
  reviewAnalysis?: ReviewInsights;
}

export interface AnalyzedProduct {
  asin: string;
  title: string;
  keepaData: Partial<KeepaProduct>;
  apifyData?: Partial<CompetitorData>;
  reviews?: AmazonReview[];
  analysis: {
    opportunityScore: number;
    demandScore: number;
    competitionScore: number;
    profitability: number;
    trends: {
      priceDirection: 'up' | 'down' | 'stable';
      demandDirection: 'up' | 'down' | 'stable';
      seasonality: 'high' | 'medium' | 'low';
    };
  };
}

export interface MarketInsights {
  growthRate: number;
  topBrands: Array<{ name: string; marketShare: number }>;
  seasonalityIndex: number;
  entryDifficulty: 'easy' | 'medium' | 'hard';
}

export interface AIRecommendations {
  summary: string;
  opportunities: string[];
  risks: string[];
  actionItems: string[];
  suggestedStrategies: string[];
  confidenceScore: number;
}

export interface CompetitorInsights {
  topCompetitors: Array<{
    asin: string;
    brand: string;
    strengths: string[];
    weaknesses: string[];
    marketShare: number;
  }>;
  competitiveAdvantages: string[];
  pricingStrategy: string;
  differentiationOpportunities: string[];
}

export interface ReviewInsights {
  commonComplaints: Array<{ issue: string; frequency: number }>;
  desiredFeatures: Array<{ feature: string; mentions: number }>;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  averageRating: number;
  verifiedPurchaseRate: number;
}

// Validation schemas
const analysisRunConfigSchema = z.object({
  nicheId: z.string().uuid(),
  userId: z.string().uuid(),
  includeReviews: z.boolean().optional().default(true),
  includeCompetitors: z.boolean().optional().default(true),
  includeSocialMedia: z.boolean().optional().default(false),
  maxProductsToAnalyze: z.number().int().positive().max(100).optional().default(20),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  webhookUrl: z.string().url().optional(),
});

// Error classes
export class AnalysisOrchestratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public runId?: string,
    public step?: string
  ) {
    super(message);
    this.name = 'AnalysisOrchestratorError';
  }
}

export class AnalysisQuotaExceededError extends AnalysisOrchestratorError {
  constructor(public limit: number, public used: number) {
    super(
      `Analysis quota exceeded: ${used}/${limit}`,
      'QUOTA_EXCEEDED'
    );
  }
}

/**
 * Analysis Orchestrator Service Class
 * Manages the entire analysis pipeline with queue processing and error recovery
 */
export class AnalysisOrchestrator {
  private queue: Queue;
  private worker: Worker | null = null;
  private queueEvents: QueueEvents;
  private redis: Redis;
  private supabase: ReturnType<typeof createClient>;
  private nicheService: ReturnType<typeof createNicheService>;
  private concurrencyLimit: pLimit.Limit;
  
  // Queue configuration
  private readonly queueName = 'niche-analysis';
  private readonly maxConcurrency = 3;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds
  
  constructor() {
    // Initialize Redis connection
    this.redis = new Redis({
      host: apiConfig.redis.host,
      port: apiConfig.redis.port,
      password: apiConfig.redis.password,
      db: apiConfig.redis.db,
      tls: apiConfig.redis.tls ? {} : undefined,
      maxRetriesPerRequest: 3,
    });

    // Initialize BullMQ queue
    this.queue = new Queue(this.queueName, {
      connection: this.redis,
      defaultJobOptions: {
        attempts: this.maxRetries,
        backoff: {
          type: 'exponential',
          delay: this.retryDelay,
        },
        removeOnComplete: {
          age: 86400, // Keep completed jobs for 24 hours
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          age: 604800, // Keep failed jobs for 7 days
        },
      },
    });

    // Initialize queue events for monitoring
    this.queueEvents = new QueueEvents(this.queueName, {
      connection: this.redis,
    });

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.nicheService = createNicheService(supabaseUrl, supabaseKey);

    // Initialize concurrency limiter for parallel operations
    this.concurrencyLimit = pLimit(5); // Max 5 parallel API calls
  }

  /**
   * Start the analysis for a niche
   */
  async startAnalysis(config: AnalysisRunConfig): Promise<string> {
    try {
      // Validate configuration
      const validatedConfig = analysisRunConfigSchema.parse(config);
      
      // Check user quota
      await this.checkUserQuota(validatedConfig.userId);
      
      // Verify niche exists and user has access
      const niche = await this.nicheService.getNiche(
        validatedConfig.nicheId,
        validatedConfig.userId
      );
      
      if (!niche) {
        throw new AnalysisOrchestratorError(
          'Niche not found or access denied',
          'NICHE_NOT_FOUND'
        );
      }
      
      // Create analysis run record
      const runId = await this.createAnalysisRun(validatedConfig);
      
      // Add job to queue
      const job = await this.queue.add(
        'analyze-niche',
        {
          runId,
          config: validatedConfig,
          niche,
        },
        {
          priority: this.getPriorityValue(validatedConfig.priority),
          jobId: runId,
        }
      );
      
      // Log the queued job
      await this.logAnalysisEvent(runId, 'analysis_queued', {
        jobId: job.id,
        priority: validatedConfig.priority,
      });
      
      return runId;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AnalysisOrchestratorError(
          'Invalid analysis configuration',
          'INVALID_CONFIG'
        );
      }
      throw error;
    }
  }

  /**
   * Start the worker to process analysis jobs
   */
  async startWorker(): Promise<void> {
    if (this.worker) {
      console.warn('Worker already started');
      return;
    }

    this.worker = new Worker(
      this.queueName,
      async (job: Job) => {
        await this.processAnalysisJob(job);
      },
      {
        connection: this.redis,
        concurrency: this.maxConcurrency,
        autorun: true,
      }
    );

    // Set up event handlers
    this.worker.on('completed', async (job) => {
      console.log(`Analysis completed: ${job.id}`);
      await this.handleJobCompletion(job);
    });

    this.worker.on('failed', async (job, err) => {
      console.error(`Analysis failed: ${job?.id}`, err);
      if (job) {
        await this.handleJobFailure(job, err);
      }
    });

    this.worker.on('progress', async (job, progress) => {
      console.log(`Analysis progress: ${job.id} - ${progress}%`);
    });

    console.log('Analysis worker started');
  }

  /**
   * Stop the worker
   */
  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
      console.log('Analysis worker stopped');
    }
  }

  /**
   * Get the status of an analysis run
   */
  async getAnalysisStatus(runId: string): Promise<AnalysisRunStatus | null> {
    const { data: run, error } = await this.supabase
      .from('analysis_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (error || !run) {
      return null;
    }

    // Get job from queue if still processing
    const job = await this.queue.getJob(runId);
    
    let progress = run.progress || { current: 0, total: 0, percentage: 0 };
    if (job) {
      const jobProgress = job.progress;
      if (typeof jobProgress === 'number') {
        progress.percentage = jobProgress;
      } else if (typeof jobProgress === 'object' && jobProgress !== null) {
        progress = jobProgress as typeof progress;
      }
    }

    return {
      runId: run.id,
      nicheId: run.niche_id,
      status: run.status,
      progress,
      steps: run.steps || [],
      startedAt: run.started_at ? new Date(run.started_at) : undefined,
      completedAt: run.completed_at ? new Date(run.completed_at) : undefined,
      error: run.error,
      results: run.results,
      costs: run.costs || { keepa: 0, apify: 0, ai: 0, total: 0 },
    };
  }

  /**
   * Resume a failed analysis run
   */
  async resumeAnalysis(runId: string): Promise<void> {
    const status = await this.getAnalysisStatus(runId);
    
    if (!status) {
      throw new AnalysisOrchestratorError(
        'Analysis run not found',
        'RUN_NOT_FOUND',
        runId
      );
    }

    if (status.status !== 'failed' && status.status !== 'partially_completed') {
      throw new AnalysisOrchestratorError(
        'Analysis cannot be resumed in current state',
        'INVALID_STATE',
        runId
      );
    }

    // Get the original configuration
    const { data: run } = await this.supabase
      .from('analysis_runs')
      .select('config')
      .eq('id', runId)
      .single();

    if (!run?.config) {
      throw new AnalysisOrchestratorError(
        'Analysis configuration not found',
        'CONFIG_NOT_FOUND',
        runId
      );
    }

    // Update status to queued
    await this.updateAnalysisStatus(runId, 'queued');

    // Re-queue the job with resume flag
    await this.queue.add(
      'analyze-niche',
      {
        runId,
        config: run.config,
        resume: true,
        lastCompletedStep: this.getLastCompletedStep(status.steps),
      },
      {
        priority: this.getPriorityValue(run.config.priority || 'normal'),
        jobId: runId,
      }
    );

    await this.logAnalysisEvent(runId, 'analysis_resumed');
  }

  /**
   * Cancel an analysis run
   */
  async cancelAnalysis(runId: string): Promise<void> {
    // Remove job from queue if exists
    const job = await this.queue.getJob(runId);
    if (job) {
      await job.remove();
    }

    // Update status
    await this.updateAnalysisStatus(runId, 'failed', 'Analysis cancelled by user');
    
    await this.logAnalysisEvent(runId, 'analysis_cancelled');
  }

  /**
   * Process an analysis job
   */
  private async processAnalysisJob(job: Job): Promise<void> {
    const { runId, config, niche, resume, lastCompletedStep } = job.data;
    
    try {
      // Update status to processing
      await this.updateAnalysisStatus(runId, 'processing');
      await job.updateProgress(0);

      // Initialize steps
      const steps: AnalysisStep[] = this.initializeAnalysisSteps(config);
      
      // Resume from last completed step if needed
      let startIndex = 0;
      if (resume && lastCompletedStep) {
        startIndex = steps.findIndex(s => s.name === lastCompletedStep) + 1;
        // Mark previous steps as completed
        for (let i = 0; i < startIndex; i++) {
          steps[i].status = 'completed';
        }
      }

      // Execute analysis steps
      let results: Partial<AnalysisResults> = {};
      const costs = { keepa: 0, apify: 0, ai: 0, total: 0 };

      for (let i = startIndex; i < steps.length; i++) {
        const step = steps[i];
        
        try {
          await this.updateAnalysisStep(runId, step.name, 'running');
          step.status = 'running';
          step.startedAt = new Date();

          // Execute step
          const stepResult = await this.executeAnalysisStep(
            step.name,
            runId,
            config,
            niche,
            results
          );

          // Update results and costs
          results = { ...results, ...stepResult.data };
          costs.keepa += stepResult.costs?.keepa || 0;
          costs.apify += stepResult.costs?.apify || 0;
          costs.ai += stepResult.costs?.ai || 0;

          step.status = 'completed';
          step.completedAt = new Date();
          step.data = stepResult.data;

          await this.updateAnalysisStep(runId, step.name, 'completed', step.data);
          
          // Update progress
          const progress = Math.round(((i + 1) / steps.length) * 100);
          await job.updateProgress(progress);
          
        } catch (error) {
          step.status = 'failed';
          step.error = error instanceof Error ? error.message : 'Unknown error';
          step.retryCount++;

          await this.updateAnalysisStep(runId, step.name, 'failed', null, step.error);

          // Decide whether to continue or fail the entire job
          if (this.isStepCritical(step.name)) {
            throw new AnalysisOrchestratorError(
              `Critical step failed: ${step.name}`,
              'CRITICAL_STEP_FAILED',
              runId,
              step.name
            );
          }
          
          // Log non-critical failure and continue
          console.warn(`Non-critical step failed: ${step.name}`, error);
        }
      }

      // Calculate total costs
      costs.total = costs.keepa + costs.apify + costs.ai;

      // Finalize analysis
      const finalResults = await this.finalizeAnalysis(
        runId,
        config,
        niche,
        results as AnalysisResults,
        costs
      );

      // Update niche with analysis results
      await this.updateNicheWithResults(config.nicheId, config.userId, finalResults);

      // Mark as completed
      await this.updateAnalysisStatus(runId, 'completed', null, finalResults, costs);
      
      // Send webhook if configured
      if (config.webhookUrl) {
        await this.sendWebhook(config.webhookUrl, {
          runId,
          status: 'completed',
          results: finalResults,
          costs,
        });
      }

    } catch (error) {
      console.error(`Analysis job failed: ${runId}`, error);
      
      // Check if partially completed
      const completedSteps = steps.filter(s => s.status === 'completed').length;
      const status = completedSteps > 0 ? 'partially_completed' : 'failed';
      
      await this.updateAnalysisStatus(
        runId,
        status,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      throw error;
    }
  }

  /**
   * Execute a specific analysis step
   */
  private async executeAnalysisStep(
    stepName: string,
    runId: string,
    config: AnalysisRunConfig,
    niche: Niche,
    currentResults: Partial<AnalysisResults>
  ): Promise<{ data: any; costs?: { keepa?: number; apify?: number; ai?: number } }> {
    switch (stepName) {
      case 'fetch_niche_products':
        return await this.fetchNicheProducts(niche.id, config.userId);
        
      case 'fetch_keepa_data':
        return await this.fetchKeepaData(
          currentResults.products?.map(p => p.asin) || [],
          config.maxProductsToAnalyze
        );
        
      case 'fetch_competitor_data':
        if (!config.includeCompetitors) {
          return { data: {} };
        }
        return await this.fetchCompetitorData(
          currentResults.products?.map(p => p.asin) || []
        );
        
      case 'fetch_review_data':
        if (!config.includeReviews) {
          return { data: {} };
        }
        return await this.fetchReviewData(
          currentResults.products?.map(p => p.asin) || []
        );
        
      case 'analyze_market':
        return await this.analyzeMarket(currentResults.products || []);
        
      case 'generate_ai_insights':
        return await this.generateAIInsights(
          niche,
          currentResults.products || [],
          currentResults.marketInsights
        );
        
      case 'calculate_scores':
        return await this.calculateScores(
          currentResults.products || [],
          currentResults.marketInsights
        );
        
      default:
        throw new AnalysisOrchestratorError(
          `Unknown analysis step: ${stepName}`,
          'UNKNOWN_STEP',
          runId,
          stepName
        );
    }
  }

  /**
   * Fetch products in the niche
   */
  private async fetchNicheProducts(
    nicheId: string,
    userId: string
  ): Promise<{ data: { products: AnalyzedProduct[] } }> {
    const nicheProducts = await this.nicheService.getNicheProducts(nicheId, userId);
    
    const products: AnalyzedProduct[] = nicheProducts.map(np => ({
      asin: np.asin,
      title: np.product?.title || '',
      keepaData: {},
      analysis: {
        opportunityScore: 0,
        demandScore: 0,
        competitionScore: 0,
        profitability: 0,
        trends: {
          priceDirection: 'stable',
          demandDirection: 'stable',
          seasonality: 'low',
        },
      },
    }));

    return { data: { products } };
  }

  /**
   * Fetch Keepa data for products
   */
  private async fetchKeepaData(
    asins: string[],
    limit?: number
  ): Promise<{ data: any; costs: { keepa: number } }> {
    const limitedAsins = limit ? asins.slice(0, limit) : asins;
    const batchSize = 100; // Keepa allows up to 100 ASINs per request
    const batches = [];
    
    for (let i = 0; i < limitedAsins.length; i += batchSize) {
      batches.push(limitedAsins.slice(i, i + batchSize));
    }

    const results = await Promise.all(
      batches.map(batch =>
        this.concurrencyLimit(() => keepaService.getProducts(batch))
      )
    );

    const allProducts = results.flat();
    const keepaProductMap = new Map(
      allProducts.map(p => [p.asin, p])
    );

    // Calculate costs (simplified - in production, get from actual API response)
    const costs = {
      keepa: allProducts.length * apiConfig.costs.keepa.perProduct,
    };

    return {
      data: { keepaProductMap },
      costs,
    };
  }

  /**
   * Fetch competitor data using Apify
   */
  private async fetchCompetitorData(
    asins: string[]
  ): Promise<{ data: any; costs: { apify: number } }> {
    try {
      const competitorData = await apifyService.scrapeCompetitorData(asins, {
        includeVariations: true,
        includeSellerInfo: true,
        includePromotions: true,
      });

      const competitorMap = new Map(
        competitorData.map(c => [c.asin, c])
      );

      // Calculate costs (simplified)
      const costs = {
        apify: apiConfig.costs.apify.perRun,
      };

      return {
        data: { competitorMap },
        costs,
      };
    } catch (error) {
      if (error instanceof ApifyError) {
        console.error('Apify error:', error);
        return { data: { competitorMap: new Map() }, costs: { apify: 0 } };
      }
      throw error;
    }
  }

  /**
   * Fetch review data using Apify
   */
  private async fetchReviewData(
    asins: string[]
  ): Promise<{ data: any; costs: { apify: number } }> {
    const reviewPromises = asins.map(asin =>
      this.concurrencyLimit(async () => {
        try {
          const reviews = await apifyService.scrapeAmazonReviews(asin, {
            maxReviews: 50,
            sortBy: 'helpful',
          });
          const analysis = await apifyService.analyzeReviews(asin, reviews);
          return { asin, reviews, analysis };
        } catch (error) {
          console.error(`Failed to fetch reviews for ${asin}:`, error);
          return { asin, reviews: [], analysis: null };
        }
      })
    );

    const reviewResults = await Promise.all(reviewPromises);
    const reviewMap = new Map(
      reviewResults.map(r => [r.asin, r])
    );

    // Calculate costs
    const costs = {
      apify: reviewResults.length * apiConfig.costs.apify.perRun * 0.5, // Reviews are cheaper
    };

    return {
      data: { reviewMap },
      costs,
    };
  }

  /**
   * Analyze market data
   */
  private async analyzeMarket(
    products: AnalyzedProduct[]
  ): Promise<{ data: { marketInsights: MarketInsights } }> {
    // Calculate market insights from product data
    const prices = products
      .map(p => p.keepaData?.currentPrice)
      .filter(p => p !== undefined && p !== null) as number[];
    
    const bsrs = products
      .map(p => p.keepaData?.salesRank)
      .filter(r => r !== undefined && r !== null) as number[];

    const marketInsights: MarketInsights = {
      totalMarketSize: this.estimateMarketSize(products),
      growthRate: this.calculateGrowthRate(products),
      avgSellingPrice: prices.length > 0 
        ? prices.reduce((a, b) => a + b, 0) / prices.length / 100 
        : 0,
      avgBSR: bsrs.length > 0 
        ? Math.round(bsrs.reduce((a, b) => a + b, 0) / bsrs.length)
        : 0,
      topBrands: this.identifyTopBrands(products),
      seasonalityIndex: this.calculateSeasonality(products),
      entryDifficulty: this.assessEntryDifficulty(products),
    };

    return { data: { marketInsights } };
  }

  /**
   * Generate AI insights
   */
  private async generateAIInsights(
    niche: Niche,
    products: AnalyzedProduct[],
    marketInsights?: MarketInsights
  ): Promise<{ data: { aiRecommendations: AIRecommendations }; costs: { ai: number } }> {
    try {
      const response = await AIService.generateNicheAnalysis({
        niche,
        products: products.slice(0, 10), // Limit to top 10 for AI analysis
        marketInsights,
      });

      const aiRecommendations: AIRecommendations = {
        summary: response.summary,
        opportunities: response.opportunities || [],
        risks: response.risks || [],
        actionItems: response.actionItems || [],
        suggestedStrategies: response.strategies || [],
        confidenceScore: response.confidence || 0.8,
      };

      // Estimate AI costs (based on token usage)
      const estimatedTokens = JSON.stringify(response).length / 4; // Rough estimate
      const costs = {
        ai: (estimatedTokens / 1000) * apiConfig.costs.openai.gpt4.output,
      };

      return { data: { aiRecommendations }, costs };
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Return default insights on failure
      return {
        data: {
          aiRecommendations: {
            summary: 'AI analysis unavailable',
            opportunities: [],
            risks: [],
            actionItems: [],
            suggestedStrategies: [],
            confidenceScore: 0,
          },
        },
        costs: { ai: 0 },
      };
    }
  }

  /**
   * Calculate final scores for products
   */
  private async calculateScores(
    products: AnalyzedProduct[],
    marketInsights?: MarketInsights
  ): Promise<{ data: { products: AnalyzedProduct[] } }> {
    const scoredProducts = products.map(product => {
      const keepa = product.keepaData;
      const competitor = product.apifyData;
      const reviews = product.reviews;

      // Calculate individual scores
      const demandScore = this.calculateDemandScore(keepa, marketInsights);
      const competitionScore = this.calculateCompetitionScore(keepa, competitor, marketInsights);
      const profitability = this.calculateProfitability(keepa, competitor);
      const opportunityScore = this.calculateOpportunityScore(
        demandScore,
        competitionScore,
        profitability
      );

      // Determine trends
      const trends = {
        priceDirection: this.analyzePriceTrend(keepa?.priceHistory),
        demandDirection: this.analyzeDemandTrend(keepa?.salesRankHistory),
        seasonality: this.analyzeSeasonality(keepa?.salesRankHistory),
      };

      return {
        ...product,
        analysis: {
          opportunityScore,
          demandScore,
          competitionScore,
          profitability,
          trends,
        },
      };
    });

    return { data: { products: scoredProducts } };
  }

  /**
   * Initialize analysis steps
   */
  private initializeAnalysisSteps(config: AnalysisRunConfig): AnalysisStep[] {
    const steps: AnalysisStep[] = [
      { name: 'fetch_niche_products', status: 'pending', retryCount: 0 },
      { name: 'fetch_keepa_data', status: 'pending', retryCount: 0 },
      { name: 'analyze_market', status: 'pending', retryCount: 0 },
      { name: 'calculate_scores', status: 'pending', retryCount: 0 },
      { name: 'generate_ai_insights', status: 'pending', retryCount: 0 },
    ];

    if (config.includeCompetitors) {
      steps.splice(2, 0, { name: 'fetch_competitor_data', status: 'pending', retryCount: 0 });
    }

    if (config.includeReviews) {
      steps.splice(3, 0, { name: 'fetch_review_data', status: 'pending', retryCount: 0 });
    }

    return steps;
  }

  /**
   * Check if a step is critical (failure should stop the analysis)
   */
  private isStepCritical(stepName: string): boolean {
    const criticalSteps = ['fetch_niche_products', 'fetch_keepa_data', 'calculate_scores'];
    return criticalSteps.includes(stepName);
  }

  /**
   * Get the last completed step from the steps array
   */
  private getLastCompletedStep(steps: AnalysisStep[]): string | null {
    const completedSteps = steps.filter(s => s.status === 'completed');
    return completedSteps.length > 0 
      ? completedSteps[completedSteps.length - 1].name 
      : null;
  }

  /**
   * Finalize analysis and prepare results
   */
  private async finalizeAnalysis(
    runId: string,
    config: AnalysisRunConfig,
    niche: Niche,
    results: AnalysisResults,
    costs: { keepa: number; apify: number; ai: number; total: number }
  ): Promise<AnalysisResults> {
    // Calculate niche-level metrics
    const products = results.products || [];
    const avgOpportunityScore = products.length > 0
      ? products.reduce((sum, p) => sum + p.analysis.opportunityScore, 0) / products.length
      : 0;

    const competitionLevel = this.determineCompetitionLevel(products);
    const marketSize = results.marketInsights?.totalMarketSize || 0;
    const avgPrice = results.marketInsights?.avgSellingPrice || 0;
    const totalMonthlyRevenue = this.estimateMonthlyRevenue(products);

    const finalResults: AnalysisResults = {
      niche: {
        id: niche.id,
        name: niche.name,
        opportunityScore: Math.round(avgOpportunityScore),
        competitionLevel,
        marketSize,
        avgPrice,
        totalMonthlyRevenue,
      },
      products: products.sort((a, b) => 
        b.analysis.opportunityScore - a.analysis.opportunityScore
      ),
      marketInsights: results.marketInsights || this.getDefaultMarketInsights(),
      aiRecommendations: results.aiRecommendations || this.getDefaultAIRecommendations(),
      competitorAnalysis: results.competitorAnalysis,
      reviewAnalysis: results.reviewAnalysis,
    };

    // Log final results
    await this.logAnalysisEvent(runId, 'analysis_finalized', {
      productCount: products.length,
      avgOpportunityScore,
      costs,
    });

    return finalResults;
  }

  /**
   * Update niche with analysis results
   */
  private async updateNicheWithResults(
    nicheId: string,
    userId: string,
    results: AnalysisResults
  ): Promise<void> {
    await this.nicheService.updateNiche(nicheId, userId, {
      opportunity_score: results.niche.opportunityScore,
      competition_level: results.niche.competitionLevel,
      market_size: results.niche.marketSize,
      avg_price: results.niche.avgPrice,
      total_monthly_revenue: results.niche.totalMonthlyRevenue,
      last_analyzed_at: new Date(),
    });
  }

  // Helper methods for calculations
  private estimateMarketSize(products: AnalyzedProduct[]): number {
    // Simplified market size estimation based on BSR
    const avgBSR = products.reduce((sum, p) => 
      sum + (p.keepaData?.salesRank || 0), 0
    ) / products.length;
    
    // Rough estimate: lower BSR = larger market
    if (avgBSR < 1000) return 10000000; // $10M+
    if (avgBSR < 5000) return 5000000; // $5M
    if (avgBSR < 10000) return 2000000; // $2M
    if (avgBSR < 50000) return 1000000; // $1M
    return 500000; // $500K
  }

  private calculateGrowthRate(products: AnalyzedProduct[]): number {
    // Simplified growth rate calculation
    // In production, would analyze historical data trends
    return Math.random() * 20 - 5; // -5% to +15% growth
  }

  private identifyTopBrands(products: AnalyzedProduct[]): Array<{ name: string; marketShare: number }> {
    const brandCounts = new Map<string, number>();
    
    products.forEach(p => {
      const brand = p.keepaData?.brand || 'Unknown';
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    });

    const totalProducts = products.length;
    const topBrands = Array.from(brandCounts.entries())
      .map(([name, count]) => ({
        name,
        marketShare: (count / totalProducts) * 100,
      }))
      .sort((a, b) => b.marketShare - a.marketShare)
      .slice(0, 5);

    return topBrands;
  }

  private calculateSeasonality(products: AnalyzedProduct[]): number {
    // Simplified seasonality calculation
    // In production, would analyze sales rank history patterns
    return Math.random() * 100; // 0-100 seasonality index
  }

  private assessEntryDifficulty(products: AnalyzedProduct[]): 'easy' | 'medium' | 'hard' {
    const avgReviews = products.reduce((sum, p) => 
      sum + (p.keepaData?.reviewCount || 0), 0
    ) / products.length;
    
    if (avgReviews < 100) return 'easy';
    if (avgReviews < 500) return 'medium';
    return 'hard';
  }

  private calculateDemandScore(
    keepa?: Partial<KeepaProduct>,
    market?: MarketInsights
  ): number {
    if (!keepa) return 0;
    
    let score = 50; // Base score
    
    // Better BSR = higher demand
    if (keepa.salesRank) {
      if (keepa.salesRank < 1000) score += 30;
      else if (keepa.salesRank < 5000) score += 20;
      else if (keepa.salesRank < 10000) score += 10;
    }
    
    // More reviews = proven demand
    if (keepa.reviewCount) {
      if (keepa.reviewCount > 1000) score += 20;
      else if (keepa.reviewCount > 500) score += 15;
      else if (keepa.reviewCount > 100) score += 10;
    }
    
    return Math.min(100, score);
  }

  private calculateCompetitionScore(
    keepa?: Partial<KeepaProduct>,
    competitor?: Partial<CompetitorData>,
    market?: MarketInsights
  ): number {
    let score = 100; // Start with low competition
    
    // More reviews = more competition
    if (keepa?.reviewCount) {
      if (keepa.reviewCount > 5000) score -= 40;
      else if (keepa.reviewCount > 1000) score -= 30;
      else if (keepa.reviewCount > 500) score -= 20;
      else if (keepa.reviewCount > 100) score -= 10;
    }
    
    // High rating with many reviews = strong competition
    if (keepa?.reviewRating && keepa.reviewRating >= 4.5 && (keepa.reviewCount || 0) > 100) {
      score -= 10;
    }
    
    // FBA status increases competition
    if (competitor?.fbaStatus) {
      score -= 5;
    }
    
    return Math.max(0, score);
  }

  private calculateProfitability(
    keepa?: Partial<KeepaProduct>,
    competitor?: Partial<CompetitorData>
  ): number {
    if (!keepa?.currentPrice) return 0;
    
    const price = keepa.currentPrice / 100;
    let profitability = 50; // Base score
    
    // Higher price = potentially higher margins
    if (price > 50) profitability += 20;
    else if (price > 30) profitability += 15;
    else if (price > 20) profitability += 10;
    else if (price < 10) profitability -= 20;
    
    // FBA fees consideration
    if (keepa.fbaFees?.totalFee) {
      const feePercentage = (keepa.fbaFees.totalFee / price) * 100;
      if (feePercentage > 50) profitability -= 20;
      else if (feePercentage > 35) profitability -= 10;
    }
    
    return Math.min(100, Math.max(0, profitability));
  }

  private calculateOpportunityScore(
    demandScore: number,
    competitionScore: number,
    profitability: number
  ): number {
    // Weighted average: demand (40%), competition (40%), profitability (20%)
    return Math.round(
      demandScore * 0.4 + 
      competitionScore * 0.4 + 
      profitability * 0.2
    );
  }

  private analyzePriceTrend(
    priceHistory?: Array<{ timestamp: number; price: number }>
  ): 'up' | 'down' | 'stable' {
    if (!priceHistory || priceHistory.length < 2) return 'stable';
    
    // Compare recent average to older average
    const midPoint = Math.floor(priceHistory.length / 2);
    const recentAvg = priceHistory.slice(midPoint).reduce((sum, p) => sum + p.price, 0) / (priceHistory.length - midPoint);
    const olderAvg = priceHistory.slice(0, midPoint).reduce((sum, p) => sum + p.price, 0) / midPoint;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private analyzeDemandTrend(
    rankHistory?: Array<{ timestamp: number; rank: number }>
  ): 'up' | 'down' | 'stable' {
    if (!rankHistory || rankHistory.length < 2) return 'stable';
    
    // Lower rank = higher demand, so invert the logic
    const midPoint = Math.floor(rankHistory.length / 2);
    const recentAvg = rankHistory.slice(midPoint).reduce((sum, r) => sum + r.rank, 0) / (rankHistory.length - midPoint);
    const olderAvg = rankHistory.slice(0, midPoint).reduce((sum, r) => sum + r.rank, 0) / midPoint;
    
    const change = ((olderAvg - recentAvg) / olderAvg) * 100; // Inverted
    
    if (change > 10) return 'up';
    if (change < -10) return 'down';
    return 'stable';
  }

  private analyzeSeasonality(
    rankHistory?: Array<{ timestamp: number; rank: number }>
  ): 'high' | 'medium' | 'low' {
    if (!rankHistory || rankHistory.length < 90) return 'low'; // Need 3 months of data
    
    // Calculate standard deviation of ranks
    const ranks = rankHistory.map(r => r.rank);
    const avg = ranks.reduce((sum, r) => sum + r, 0) / ranks.length;
    const variance = ranks.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ranks.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / avg) * 100;
    
    if (coefficientOfVariation > 50) return 'high';
    if (coefficientOfVariation > 25) return 'medium';
    return 'low';
  }

  private determineCompetitionLevel(products: AnalyzedProduct[]): string {
    const avgCompetitionScore = products.reduce((sum, p) => 
      sum + p.analysis.competitionScore, 0
    ) / products.length;
    
    if (avgCompetitionScore >= 80) return 'Low';
    if (avgCompetitionScore >= 60) return 'Medium';
    if (avgCompetitionScore >= 40) return 'High';
    return 'Very High';
  }

  private estimateMonthlyRevenue(products: AnalyzedProduct[]): number {
    // Simplified revenue estimation based on BSR and price
    return products.reduce((total, product) => {
      const bsr = product.keepaData?.salesRank || 100000;
      const price = (product.keepaData?.currentPrice || 0) / 100;
      
      // Rough sales estimation based on BSR (very simplified)
      let monthlySales = 0;
      if (bsr < 1000) monthlySales = 1000;
      else if (bsr < 5000) monthlySales = 500;
      else if (bsr < 10000) monthlySales = 200;
      else if (bsr < 50000) monthlySales = 50;
      else monthlySales = 10;
      
      return total + (monthlySales * price);
    }, 0);
  }

  private getDefaultMarketInsights(): MarketInsights {
    return {
      totalMarketSize: 0,
      growthRate: 0,
      avgSellingPrice: 0,
      avgBSR: 0,
      topBrands: [],
      seasonalityIndex: 0,
      entryDifficulty: 'medium',
    };
  }

  private getDefaultAIRecommendations(): AIRecommendations {
    return {
      summary: 'Analysis incomplete',
      opportunities: [],
      risks: [],
      actionItems: [],
      suggestedStrategies: [],
      confidenceScore: 0,
    };
  }

  // Database operations
  private async createAnalysisRun(config: AnalysisRunConfig): Promise<string> {
    const { data, error } = await this.supabase
      .from('analysis_runs')
      .insert({
        niche_id: config.nicheId,
        user_id: config.userId,
        config,
        status: 'queued',
        steps: this.initializeAnalysisSteps(config),
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      throw new AnalysisOrchestratorError(
        'Failed to create analysis run',
        'CREATE_RUN_FAILED'
      );
    }

    return data.id;
  }

  private async updateAnalysisStatus(
    runId: string,
    status: AnalysisRunStatus['status'],
    error?: string | null,
    results?: AnalysisResults,
    costs?: { keepa: number; apify: number; ai: number; total: number }
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'processing' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    if (status === 'completed' || status === 'failed' || status === 'partially_completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (error !== undefined) {
      updateData.error = error;
    }

    if (results) {
      updateData.results = results;
    }

    if (costs) {
      updateData.costs = costs;
    }

    const { error: updateError } = await this.supabase
      .from('analysis_runs')
      .update(updateData)
      .eq('id', runId);

    if (updateError) {
      console.error('Failed to update analysis status:', updateError);
    }
  }

  private async updateAnalysisStep(
    runId: string,
    stepName: string,
    status: AnalysisStep['status'],
    data?: any,
    error?: string
  ): Promise<void> {
    // Get current steps
    const { data: run } = await this.supabase
      .from('analysis_runs')
      .select('steps')
      .eq('id', runId)
      .single();

    if (!run) return;

    const steps = run.steps || [];
    const stepIndex = steps.findIndex((s: AnalysisStep) => s.name === stepName);
    
    if (stepIndex >= 0) {
      steps[stepIndex] = {
        ...steps[stepIndex],
        status,
        data,
        error,
        ...(status === 'running' && { startedAt: new Date() }),
        ...(status === 'completed' && { completedAt: new Date() }),
      };

      await this.supabase
        .from('analysis_runs')
        .update({ steps })
        .eq('id', runId);
    }
  }

  private async checkUserQuota(userId: string): Promise<void> {
    // Check user's subscription and usage limits
    const { data: user } = await this.supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new AnalysisOrchestratorError(
        'User not found',
        'USER_NOT_FOUND'
      );
    }

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await this.supabase
      .from('analysis_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    // Define limits by tier
    const limits = {
      free: 5,
      pro: 50,
      enterprise: -1, // Unlimited
    };

    const userTier = user.subscription_tier || 'free';
    const limit = limits[userTier as keyof typeof limits] || limits.free;

    if (limit !== -1 && (count || 0) >= limit) {
      throw new AnalysisQuotaExceededError(limit, count || 0);
    }
  }

  private async logAnalysisEvent(
    runId: string,
    event: string,
    data?: any
  ): Promise<void> {
    await this.supabase
      .from('analysis_events')
      .insert({
        run_id: runId,
        event,
        data,
        created_at: new Date().toISOString(),
      });
  }

  private async sendWebhook(url: string, data: any): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }

  private getPriorityValue(priority?: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 1;
      case 'normal': return 5;
      case 'low': return 10;
      default: return 5;
    }
  }

  private async handleJobCompletion(job: Job): Promise<void> {
    const { runId } = job.data;
    await this.logAnalysisEvent(runId, 'job_completed', {
      duration: job.finishedOn ? job.finishedOn - job.timestamp : 0,
    });
  }

  private async handleJobFailure(job: Job, error: Error): Promise<void> {
    const { runId } = job.data;
    await this.logAnalysisEvent(runId, 'job_failed', {
      error: error.message,
      attemptsMade: job.attemptsMade,
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Clean up old analysis runs
   */
  async cleanupOldRuns(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await this.supabase
      .from('analysis_runs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .in('status', ['completed', 'failed'])
      .select('id');

    if (error) {
      console.error('Failed to cleanup old runs:', error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.stopWorker();
    await this.queue.close();
    await this.queueEvents.close();
    await this.redis.quit();
  }
}

// Export singleton instance
export const analysisOrchestrator = new AnalysisOrchestrator();

// Export helper functions
export async function startNicheAnalysis(
  nicheId: string,
  userId: string,
  options?: Partial<AnalysisRunConfig>
): Promise<string> {
  return analysisOrchestrator.startAnalysis({
    nicheId,
    userId,
    ...options,
  });
}

export async function getAnalysisProgress(runId: string): Promise<AnalysisRunStatus | null> {
  return analysisOrchestrator.getAnalysisStatus(runId);
}

export async function resumeFailedAnalysis(runId: string): Promise<void> {
  return analysisOrchestrator.resumeAnalysis(runId);
}

export async function cancelRunningAnalysis(runId: string): Promise<void> {
  return analysisOrchestrator.cancelAnalysis(runId);
}