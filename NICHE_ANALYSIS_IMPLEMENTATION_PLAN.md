# Niche Analysis Implementation Plan

## Overview
This plan outlines the complete implementation for creating real-time product analysis pages when a niche is created in the admin area. The system will integrate multiple APIs to generate comprehensive market intelligence for Amazon products.

## Current State Analysis

### ✅ What We Can Reuse
1. **DeepResearchService** (`/src/lib/deep-research-service.ts`) - Complete analysis logic for all 7 sections
2. **AIService** (`/src/lib/ai-service.ts`) - OpenAI/Claude integration ready
3. **AmazonAPIService** (`/src/lib/amazon-api-service.ts`) - Product data fetching
4. **NicheAnalysisForm** (`/src/components/admin/NicheAnalysisForm.tsx`) - Complete admin UI
5. **Analysis Components** - All 7 analysis section components exist in `/src/components/products/analysis/`
6. **Database Models** - Product, ProductAnalysis, and all deep analysis tables exist

### ❌ What's Missing
1. **Niche Model** - Need to add to Prisma schema
2. **Niche API Routes** - No `/api/niches/` endpoints
3. **External API Integrations** - Keepa, Apify, Google Trends not implemented
4. **Batch Processing** - No system for analyzing multiple ASINs
5. **Background Jobs** - No queue system for long-running analyses

## Architecture Overview

### Data Flow
1. **Admin Creates Niche** → Uses existing `/admin/niche/new/page.tsx`
2. **System Triggers Analysis Pipeline** → New orchestrator service needed
3. **AI Processes & Analyzes Data** → Uses existing AIService + DeepResearchService
4. **Creates Unique Product Pages** → Leverage existing `/products/[slug]/` structure
5. **Stores in Database** → Extend existing Prisma schema

### API Integrations
- **Amazon SP-API & Ads API**: Partial implementation exists in `amazon-api-service.ts`
- **Keepa API**: NEW - Pricing history, review data, sales rank
- **Apify**: NEW - Social media mentions, Amazon review details
- **OpenAI**: EXISTS - Already integrated in `ai-service.ts`
- **Google Trends API**: NEW - Market trend analysis
- **Vision AI**: Partial - AI service can handle image analysis

## Phase 1: Database & Infrastructure Setup (Week 1)

### 1.1 Enhance Database Schema
**File: `/prisma/schema.prisma`**

Add these models to the existing schema:

```prisma
model Niche {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  category          String
  subcategory       String?
  description       String?
  status            NicheStatus @default(PENDING)
  
  // Scores and metrics (matching NicheAnalysisForm fields)
  opportunityScore  Int
  competitionLevel  String
  demandLevel       String
  marketSize        Float
  totalMonthlyRevenue Float
  avgPrice          Float
  
  // AI Analysis (JSON fields matching form structure)
  aiAnalysis        Json      // { whyThisProduct, keyHighlights, challenges, quickWins }
  demandAnalysis    Json      // { searchVolume, trend, seasonality, customerSegments }
  competitionAnalysis Json    // { totalCompetitors, topCompetitors, avgRating, priceRange }
  listingOptimization Json    // { titleSuggestions, bulletPoints, keywords, images }
  
  // Metadata
  createdBy         String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  products          NicheProduct[]
  analysisRuns      AnalysisRun[]
  user              User      @relation(fields: [createdBy], references: [id])
  
  @@map("niches")
}

model NicheProduct {
  id                String    @id @default(cuid())
  nicheId           String
  productId         String    
  asin              String    // Denormalized for quick access
  isPrimary         Boolean   @default(false)
  addedAt           DateTime  @default(now())
  
  // Relations
  niche             Niche     @relation(fields: [nicheId], references: [id], onDelete: Cascade)
  product           Product   @relation(fields: [productId], references: [id])
  
  @@unique([nicheId, productId])
  @@index([asin])
  @@map("niche_products")
}

model AnalysisRun {
  id                String    @id @default(cuid())
  nicheId           String
  status            AnalysisStatus @default(PENDING)
  type              AnalysisType  @default(FULL)
  startedAt         DateTime  @default(now())
  completedAt       DateTime?
  error             String?
  metadata          Json?     // Store run configuration
  
  // API Call Tracking
  apiCalls          ApiCallLog[]
  
  // Relations
  niche             Niche     @relation(fields: [nicheId], references: [id], onDelete: Cascade)
  
  @@index([nicheId, status])
  @@map("analysis_runs")
}

model ApiCallLog {
  id                String    @id @default(cuid())
  runId             String
  apiName           String    // keepa, apify, amazon, openai, google_trends
  endpoint          String
  method            String    @default("GET")
  status            Int       // HTTP status code
  responseTime      Int       // in milliseconds
  error             String?
  cost              Float?    // API call cost if applicable
  timestamp         DateTime  @default(now())
  
  analysisRun       AnalysisRun @relation(fields: [runId], references: [id], onDelete: Cascade)
  
  @@index([runId, apiName])
  @@map("api_call_logs")
}

enum NicheStatus {
  PENDING
  ANALYZING
  COMPLETED
  FAILED
  ARCHIVED
}

enum AnalysisStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}

enum AnalysisType {
  FULL
  KEYWORDS_ONLY
  COMPETITION_ONLY
  DEMAND_ONLY
  REFRESH
}
```

### 1.2 API Configuration Service
**File: `/src/lib/api-config.ts`** (NEW)

Extend the existing environment configuration:

```typescript
// src/lib/api-config.ts
export const apiConfig = {
  // EXISTING - Already in use
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4-turbo-preview'
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },
  
  // NEW - Need to add these integrations
  amazonSP: {
    endpoint: process.env.AMAZON_SP_API_ENDPOINT!,
    credentials: {
      clientId: process.env.AMAZON_SP_CLIENT_ID!,
      clientSecret: process.env.AMAZON_SP_CLIENT_SECRET!,
      refreshToken: process.env.AMAZON_SP_REFRESH_TOKEN!,
      marketplace: process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER' // US marketplace
    }
  },
  keepa: {
    apiKey: process.env.KEEPA_API_KEY!,
    endpoint: 'https://api.keepa.com/v1',
    domain: 1 // US Amazon
  },
  apify: {
    apiKey: process.env.APIFY_API_KEY!,
    actors: {
      amazonReviews: process.env.APIFY_AMAZON_REVIEWS_ACTOR || 'junglee/amazon-reviews-scraper',
      socialMedia: process.env.APIFY_SOCIAL_MEDIA_ACTOR || 'apify/social-media-scraper'
    }
  },
  googleTrends: {
    apiKey: process.env.GOOGLE_TRENDS_API_KEY!,
    endpoint: 'https://trends.google.com/trends/api'
  }
}

// Add to .env.example
/*
# External API Keys (NEW)
AMAZON_SP_API_ENDPOINT=https://sellingpartnerapi-na.amazon.com
AMAZON_SP_CLIENT_ID=
AMAZON_SP_CLIENT_SECRET=
AMAZON_SP_REFRESH_TOKEN=
AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER

KEEPA_API_KEY=
APIFY_API_KEY=
APIFY_AMAZON_REVIEWS_ACTOR=junglee/amazon-reviews-scraper
APIFY_SOCIAL_MEDIA_ACTOR=apify/social-media-scraper
GOOGLE_TRENDS_API_KEY=
*/
```

## Phase 2: API Integration Services (Week 2-3)

### 2.1 Extend Amazon SP-API Service
**File: `/src/lib/amazon-api-service.ts`** (EXISTS - needs extension)

Currently has basic product search. Add these methods:

```typescript
// Extend existing AmazonAPIService class
class AmazonAPIService {
  // EXISTING methods
  async searchProducts(query: string) { ... }
  async getProductDetails(asin: string) { ... }
  
  // NEW methods to add
  async getKeywordSuggestions(asin: string) {
    // Use SP-API Catalog Items API
    const response = await this.spApi.callAPI({
      operation: 'searchCatalogItems',
      query: { keywords: asin, includedData: ['keywords'] }
    });
    return response;
  }
  
  async getSearchTermReport(asin: string) {
    // Use Advertising API for search term performance
    const response = await this.adsApi.getSearchTermReport({
      asin,
      dateRange: 'LAST_30_DAYS'
    });
    return response;
  }
  
  async getBulkProductData(asins: string[]) {
    // Batch API call for multiple ASINs
    const response = await this.spApi.callAPI({
      operation: 'getCatalogItems',
      asinList: asins
    });
    return response;
  }
}
```

### 2.2 Create Keepa API Service
**File: `/src/lib/keepa-service.ts`** (NEW)

```typescript
import { apiConfig } from './api-config';

export class KeepaService {
  private apiKey = apiConfig.keepa.apiKey;
  private endpoint = apiConfig.keepa.endpoint;
  
  async getProductData(asin: string) {
    const params = {
      key: this.apiKey,
      domain: 1, // US
      asin,
      stats: 90, // 90 days of data
      history: 1,
      offers: 20
    };
    
    const response = await fetch(
      `${this.endpoint}/product?${new URLSearchParams(params)}`
    );
    return response.json();
  }
  
  async getBulkProductData(asins: string[]) {
    // Keepa allows up to 100 ASINs per request
    const chunks = this.chunkArray(asins, 100);
    const results = await Promise.all(
      chunks.map(chunk => this.getProductData(chunk.join(',')))
    );
    return results.flat();
  }
  
  async getPriceHistory(asin: string, days = 90) {
    const data = await this.getProductData(asin);
    return {
      amazonPrice: data.csv[0], // Amazon price history
      newPrice: data.csv[1],    // New offer prices
      usedPrice: data.csv[2],   // Used prices
      salesRank: data.csv[3]    // Sales rank history
    };
  }
  
  async getReviewAnalysis(asin: string) {
    const data = await this.getProductData(asin);
    return {
      rating: data.csv[16],     // Rating history
      reviewCount: data.csv[17], // Review count history
      answeredQuestions: data.csv[18]
    };
  }
}
```

### 2.3 Create Apify Service
**File: `/src/lib/apify-service.ts`** (NEW)

```typescript
import { ApifyClient } from 'apify-client';
import { apiConfig } from './api-config';

export class ApifyService {
  private client: ApifyClient;
  
  constructor() {
    this.client = new ApifyClient({
      token: apiConfig.apify.apiKey
    });
  }
  
  async scrapeAmazonReviews(asin: string, maxReviews = 100) {
    const run = await this.client.actor(
      apiConfig.apify.actors.amazonReviews
    ).call({
      productUrls: [`https://www.amazon.com/dp/${asin}`],
      maxReviews,
      filterByRating: null, // Get all ratings
      scrapeVariantReviews: true
    });
    
    return run.items;
  }
  
  async analyzeSocialMediaMentions(productName: string, brand?: string) {
    const searchQuery = brand ? `${brand} ${productName}` : productName;
    
    const run = await this.client.actor(
      apiConfig.apify.actors.socialMedia
    ).call({
      queries: [searchQuery],
      platforms: ['twitter', 'instagram', 'tiktok', 'youtube'],
      maxItems: 50,
      timeRange: 'LAST_30_DAYS'
    });
    
    return run.items;
  }
  
  async getCompetitorData(keywords: string[], maxProducts = 20) {
    // Use Amazon search scraper to find competitors
    const run = await this.client.actor(
      'junglee/amazon-product-search-scraper'
    ).call({
      searchTerms: keywords,
      maxProducts,
      scrapeProductDetails: true
    });
    
    return run.items;
  }
}
```

### 2.4 Extend AI Analysis Service
**File: `/src/lib/ai-service.ts`** (EXISTS - needs extension)

The existing AIService already has OpenAI/Claude integration. Add niche-specific analysis methods:

```typescript
// Extend existing AIService class
export class AIService {
  // EXISTING methods remain unchanged
  
  // NEW methods for niche analysis
  async analyzeNicheOpportunity(data: {
    products: Product[],
    keywords: KeywordData[],
    marketData: MarketData
  }) {
    const prompt = `Analyze this Amazon niche opportunity...`;
    return this.generateStructuredResponse(prompt, {
      opportunityScore: 'number 1-100',
      marketGaps: 'array of opportunities',
      risks: 'array of challenges',
      recommendations: 'array of action items'
    });
  }
  
  async generateNicheLaunchStrategy(nicheData: NicheAnalysis) {
    // Uses existing DeepResearchService methods
    const strategy = await this.deepResearch.generateLaunchStrategy(
      nicheData.products,
      nicheData.keywords,
      nicheData.competition
    );
    return strategy;
  }
  
  async analyzeProductImages(imageUrls: string[]) {
    // Use GPT-4 Vision for image analysis
    const analyses = await Promise.all(
      imageUrls.map(url => this.analyzeImage(url))
    );
    return this.aggregateImageInsights(analyses);
  }
}

## Phase 3: Analysis Pipeline & Niche Service (Week 4-5)

### 3.1 Create Niche Service
**File: `/src/lib/niche-service.ts`** (NEW)

Core service for niche management:

```typescript
import { prisma } from '@/lib/prisma';
import { AnalysisOrchestrator } from './analysis-orchestrator';
import { generateSlug } from '@/lib/utils';

export class NicheService {
  private orchestrator: AnalysisOrchestrator;
  
  constructor() {
    this.orchestrator = new AnalysisOrchestrator();
  }
  
  async createNiche(data: CreateNicheInput, userId: string) {
    // 1. Create niche record
    const niche = await prisma.niche.create({
      data: {
        name: data.name,
        slug: generateSlug(data.name),
        category: data.category,
        subcategory: data.subcategory,
        status: 'PENDING',
        opportunityScore: data.opportunityScore || 0,
        competitionLevel: data.competitionLevel || 'UNKNOWN',
        demandLevel: data.demandLevel || 'UNKNOWN',
        marketSize: data.marketSize || 0,
        totalMonthlyRevenue: data.totalMonthlyRevenue || 0,
        avgPrice: data.avgPrice || 0,
        aiAnalysis: data.aiAnalysis || {},
        demandAnalysis: data.demandAnalysis || {},
        competitionAnalysis: data.competitionAnalysis || {},
        listingOptimization: data.listingOptimization || {},
        createdBy: userId
      }
    });
    
    // 2. Associate products (ASINs)
    if (data.asins && data.asins.length > 0) {
      await this.addProductsToNiche(niche.id, data.asins, data.primaryAsin);
    }
    
    // 3. Trigger analysis pipeline
    await this.orchestrator.startAnalysis(niche.id);
    
    return niche;
  }
  
  async addProductsToNiche(nicheId: string, asins: string[], primaryAsin?: string) {
    // First ensure products exist in database
    const products = await this.ensureProductsExist(asins);
    
    // Create associations
    const nicheProducts = products.map(product => ({
      nicheId,
      productId: product.id,
      asin: product.asin,
      isPrimary: product.asin === primaryAsin
    }));
    
    await prisma.nicheProduct.createMany({
      data: nicheProducts
    });
  }
  
  private async ensureProductsExist(asins: string[]) {
    // Check which products already exist
    const existingProducts = await prisma.product.findMany({
      where: { asin: { in: asins } }
    });
    
    const existingAsins = existingProducts.map(p => p.asin);
    const newAsins = asins.filter(asin => !existingAsins.includes(asin));
    
    // Fetch and create missing products
    if (newAsins.length > 0) {
      const amazonService = new AmazonAPIService();
      const newProductData = await amazonService.getBulkProductData(newAsins);
      
      await prisma.product.createMany({
        data: newProductData.map(p => ({
          asin: p.asin,
          title: p.title,
          category: p.category,
          price: p.price,
          currency: 'USD',
          rating: p.rating,
          reviewCount: p.reviewCount,
          imageUrl: p.imageUrl,
          amazonUrl: `https://www.amazon.com/dp/${p.asin}`
        }))
      });
    }
    
    return prisma.product.findMany({
      where: { asin: { in: asins } }
    });
  }
}
```

### 3.2 Create Analysis Orchestrator
**File: `/src/lib/analysis-orchestrator.ts`** (NEW)

Orchestrates the entire analysis pipeline:

```typescript
import { prisma } from '@/lib/prisma';
import { KeepaService } from './keepa-service';
import { ApifyService } from './apify-service';
import { AIService } from './ai-service';
import { DeepResearchService } from './deep-research-service';
import { Queue } from 'bullmq';

export class AnalysisOrchestrator {
  private keepa: KeepaService;
  private apify: ApifyService;
  private ai: AIService;
  private deepResearch: DeepResearchService;
  private analysisQueue: Queue;
  
  constructor() {
    this.keepa = new KeepaService();
    this.apify = new ApifyService();
    this.ai = new AIService();
    this.deepResearch = new DeepResearchService();
    
    // Initialize queue for background processing
    this.analysisQueue = new Queue('niche-analysis', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });
  }
  
  async startAnalysis(nicheId: string) {
    // Create analysis run record
    const run = await prisma.analysisRun.create({
      data: {
        nicheId,
        status: 'PENDING',
        type: 'FULL'
      }
    });
    
    // Queue the analysis job
    await this.analysisQueue.add('analyze-niche', {
      nicheId,
      runId: run.id
    });
    
    return run;
  }
  
  async executeAnalysis(nicheId: string, runId: string) {
    try {
      // Update status
      await prisma.analysisRun.update({
        where: { id: runId },
        data: { status: 'IN_PROGRESS' }
      });
      
      // 1. Fetch niche and products
      const niche = await prisma.niche.findUnique({
        where: { id: nicheId },
        include: {
          products: {
            include: { product: true }
          }
        }
      });
      
      if (!niche) throw new Error('Niche not found');
      
      const asins = niche.products.map(np => np.asin);
      const products = niche.products.map(np => np.product);
      
      // 2. Parallel data fetching
      const [keepaData, reviewData, socialData] = await Promise.all([
        this.fetchKeepaData(asins, runId),
        this.fetchReviewData(asins, runId),
        this.fetchSocialData(products, runId)
      ]);
      
      // 3. Run deep analysis using existing service
      const analysis = await this.runDeepAnalysis(
        products,
        keepaData,
        reviewData,
        socialData,
        runId
      );
      
      // 4. Update niche with results
      await this.updateNicheWithAnalysis(nicheId, analysis);
      
      // 5. Complete the run
      await prisma.analysisRun.update({
        where: { id: runId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
      
    } catch (error) {
      await prisma.analysisRun.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        }
      });
      throw error;
    }
  }
  
  private async fetchKeepaData(asins: string[], runId: string) {
    const startTime = Date.now();
    try {
      const data = await this.keepa.getBulkProductData(asins);
      await this.logApiCall(runId, 'keepa', 'getBulkProductData', 200, Date.now() - startTime);
      return data;
    } catch (error) {
      await this.logApiCall(runId, 'keepa', 'getBulkProductData', 500, Date.now() - startTime, error.message);
      throw error;
    }
  }
  
  // Similar methods for other API calls...
  
  private async logApiCall(
    runId: string,
    apiName: string,
    endpoint: string,
    status: number,
    responseTime: number,
    error?: string
  ) {
    await prisma.apiCallLog.create({
      data: {
        runId,
        apiName,
        endpoint,
        status,
        responseTime,
        error
      }
    });
  }
}
```

### 3.3 API Endpoints for Niches
**File: `/src/app/api/niches/route.ts`** (NEW)

```typescript
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NicheService } from '@/lib/niche-service';
import { nicheSchema } from '@/lib/validations/niche';

const nicheService = new NicheService();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const niches = await prisma.niche.findMany({
    where: {
      createdBy: session.user.id
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      products: {
        include: { product: true }
      }
    }
  });
  
  return Response.json(niches);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const body = await request.json();
  const validatedData = nicheSchema.parse(body);
  
  const niche = await nicheService.createNiche(
    validatedData,
    session.user.id
  );
  
  return Response.json(niche, { status: 201 });
}
```

### 3.4 Update Admin Save Action
**File: `/src/app/admin/niche/new/actions.ts`** (NEW)

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { NicheService } from '@/lib/niche-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function createNiche(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  
  const nicheService = new NicheService();
  
  // Parse form data
  const data = {
    name: formData.get('nicheName') as string,
    category: formData.get('category') as string,
    subcategory: formData.get('subcategory') as string,
    asins: JSON.parse(formData.get('products') as string || '[]'),
    primaryAsin: formData.get('primaryAsin') as string,
    opportunityScore: parseInt(formData.get('opportunityScore') as string),
    competitionLevel: formData.get('competitionLevel') as string,
    demandLevel: formData.get('demandLevel') as string,
    marketSize: parseFloat(formData.get('marketSize') as string),
    totalMonthlyRevenue: parseFloat(formData.get('totalMonthlyRevenue') as string),
    avgPrice: parseFloat(formData.get('avgPrice') as string),
    aiAnalysis: JSON.parse(formData.get('aiAnalysis') as string || '{}'),
    demandAnalysis: JSON.parse(formData.get('demandAnalysis') as string || '{}'),
    competitionAnalysis: JSON.parse(formData.get('competitionAnalysis') as string || '{}'),
    listingOptimization: JSON.parse(formData.get('listingOptimization') as string || '{}')
  };
  
  const niche = await nicheService.createNiche(data, session.user.id);
  
  revalidatePath('/admin/niches');
  redirect(`/niches/${niche.slug}`);
}
```

## Phase 4: Section-Specific Implementation (Week 6-8)

All analysis components already exist! We just need to connect them with real data:

### 4.1 Market Intelligence Section
**Existing Component**: `/src/components/products/analysis/MarketIntelligence.tsx`
**Existing Route**: `/src/app/products/[slug]/intelligence/page.tsx`
**Data Integration**:
```typescript
// Modify existing page to use real data
async function getIntelligenceData(nicheId: string) {
  const niche = await prisma.niche.findUnique({
    where: { id: nicheId },
    include: {
      products: { include: { product: true } }
    }
  });
  
  // Use Apify service for review data
  const reviewData = await apifyService.scrapeAmazonReviews(
    niche.products[0].asin
  );
  
  // Process with existing DeepResearchService
  const intelligence = await deepResearchService.analyzeMarketIntelligence({
    reviews: reviewData,
    socialMentions: await apifyService.analyzeSocialMediaMentions(...)
  });
  
  return intelligence;
}
```

### 4.2 Demand Analysis Section
**Existing Component**: `/src/components/products/analysis/DemandAnalysis.tsx`
**Existing Route**: `/src/app/products/[slug]/demand/page.tsx`
**Already Includes**: Search volume chart, trend analysis, customer segments
**Integration**: Connect to Google Trends API and Amazon search data

### 4.3 Competition Analysis Section
**Existing Component**: `/src/components/products/analysis/CompetitionAnalysis.tsx`
**Existing Route**: `/src/app/products/[slug]/competition/page.tsx`
**Already Includes**: Competitor grid, pricing analysis, market positioning
**Integration**: Use Keepa API for competitor data

### 4.4 Keywords Analysis Section
**Existing Component**: `/src/components/products/analysis/KeywordsAnalysis.tsx`
**Existing Route**: `/src/app/products/[slug]/keywords/page.tsx`
**Already Includes**: Keyword opportunities, search volume, PPC estimates
**Integration**: Connect to Amazon Ads API

### 4.5 Financial Analysis Section
**Existing Component**: `/src/components/products/analysis/FinancialAnalysis.tsx`
**Existing Route**: `/src/app/products/[slug]/financial/page.tsx`
**Already Includes**: ROI calculator, cash flow projections, scenario modeling
**Integration**: Use real FBA fees and Keepa pricing data

### 4.6 Listing Optimization Section
**Existing Component**: `/src/components/products/analysis/ListingOptimization.tsx`
**Existing Route**: `/src/app/products/[slug]/listing/page.tsx`
**Already Includes**: Title optimizer, bullet points, image analysis
**Integration**: AI vision analysis for competitor images

### 4.7 Launch Strategy Section
**Existing Component**: `/src/components/products/analysis/LaunchStrategy.tsx`
**Existing Route**: `/src/app/products/[slug]/launch/page.tsx`
**Already Includes**: 90-day roadmap, PPC campaigns, inventory planning
**Integration**: Aggregate all previous analyses

### 4.8 Create Niche Display Pages
**New Routes Needed**:
```typescript
// /src/app/niches/[slug]/page.tsx
export default async function NichePage({ params }) {
  const niche = await getNicheBySlug(params.slug);
  
  return (
    <div>
      {/* Overview with all products */}
      <NicheOverview niche={niche} />
      
      {/* Navigation to each analysis section */}
      <NicheAnalysisNav nicheSlug={niche.slug} />
      
      {/* Summary cards for each section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MarketIntelligenceCard data={niche.marketIntelligence} />
        <DemandAnalysisCard data={niche.demandAnalysis} />
        <CompetitionAnalysisCard data={niche.competitionAnalysis} />
        {/* ... other cards */}
      </div>
    </div>
  );
}

// /src/app/niches/[slug]/intelligence/page.tsx
// Similar structure to product pages but for entire niche
```

## Phase 5: Implementation Summary & Quick Start

### What's Already Built (Can Use Immediately)
1. **Complete UI Components** - All 7 analysis sections with charts and visualizations
2. **DeepResearchService** - Full analysis logic for all sections
3. **AIService** - OpenAI/Claude integration ready
4. **Admin Form** - NicheAnalysisForm component ready to use
5. **Database Models** - Product, ProductAnalysis, and all deep analysis tables

### What Needs to be Built (Priority Order)

#### Week 1: Database & Core Services
1. Add Niche models to Prisma schema
2. Create `/src/lib/niche-service.ts`
3. Create `/src/lib/analysis-orchestrator.ts`
4. Set up environment variables for APIs

#### Week 2: API Integrations
1. Create `/src/lib/keepa-service.ts`
2. Create `/src/lib/apify-service.ts`
3. Extend `amazon-api-service.ts` with new methods
4. Create `/src/lib/api-config.ts`

#### Week 3: Connect Admin Interface
1. Create `/src/app/admin/niche/new/actions.ts`
2. Create `/src/app/api/niches/route.ts`
3. Update admin form to call server action
4. Test niche creation flow

#### Week 4: Create Niche Pages
1. Create `/src/app/niches/[slug]/page.tsx`
2. Create sub-routes for each analysis section
3. Modify existing analysis components to accept niche data
4. Add navigation between sections

### Quick Implementation Checklist

```bash
# 1. Update database
npx prisma migrate dev --name add-niche-models

# 2. Install new dependencies
npm install bullmq apify-client @google/generative-ai

# 3. Add environment variables
# Copy from plan to .env.local

# 4. Create services (in order)
# - api-config.ts
# - keepa-service.ts
# - apify-service.ts
# - niche-service.ts
# - analysis-orchestrator.ts

# 5. Create API routes
# - /api/niches/route.ts
# - /api/niches/[id]/route.ts
# - /api/niches/[id]/analyze/route.ts

# 6. Update admin interface
# - Connect form to server action
# - Add progress monitoring

# 7. Create public pages
# - /niches/[slug] structure
```

### Testing Flow
1. Create a niche with 2-3 ASINs in admin
2. Monitor analysis progress in logs
3. View completed niche at `/niches/[slug]`
4. Navigate through all 7 analysis sections

### Cost Considerations
- **Keepa API**: $0.01 per product query
- **Apify**: ~$0.10 per 100 reviews scraped
- **OpenAI**: ~$0.02 per analysis
- **Estimated cost per niche**: $0.50 - $2.00

### Performance Tips
1. Start with mock data for API development
2. Implement caching early (Redis recommended)
3. Use queue system for production (BullMQ)
4. Batch API calls when possible
5. Set reasonable rate limits

### Common Issues & Solutions
1. **ASIN not found**: Validate ASINs before creating niche
2. **API rate limits**: Implement exponential backoff
3. **Long analysis times**: Show progress indicators
4. **Failed analyses**: Allow re-run from last successful step

### Next Steps After Basic Implementation
1. Add webhook notifications for analysis completion
2. Implement export functionality (PDF/CSV)
3. Add scheduling for periodic updates
4. Create comparison views between niches
5. Add team collaboration features

## Detailed Implementation Order

### Step 1: Database Setup (Day 1)
```bash
# Add Niche models to prisma/schema.prisma
# Run migration
npx prisma migrate dev --name add-niche-models
npx prisma generate
```

### Step 2: Core Services (Day 2-3)
1. `/src/lib/api-config.ts` - API configuration
2. `/src/lib/niche-service.ts` - Niche management
3. `/src/lib/analysis-orchestrator.ts` - Pipeline orchestration

### Step 3: API Services (Day 4-6)
1. `/src/lib/keepa-service.ts` - Keepa integration
2. `/src/lib/apify-service.ts` - Apify integration
3. Extend `/src/lib/amazon-api-service.ts`
4. Extend `/src/lib/ai-service.ts`

### Step 4: API Routes (Day 7)
1. `/src/app/api/niches/route.ts` - List/Create
2. `/src/app/api/niches/[id]/route.ts` - Get/Update/Delete
3. `/src/app/api/niches/[id]/analyze/route.ts` - Trigger analysis

### Step 5: Admin Integration (Day 8)
1. `/src/app/admin/niche/new/actions.ts` - Server action
2. Update NicheAnalysisForm to use server action
3. Add loading states and error handling

### Step 6: Public Pages (Day 9-10)
1. `/src/app/niches/page.tsx` - Browse all niches
2. `/src/app/niches/[slug]/page.tsx` - Niche overview
3. `/src/app/niches/[slug]/[section]/page.tsx` - Analysis sections

### Step 7: Testing & Polish (Day 11-12)
1. Create test niches with real ASINs
2. Verify all API integrations
3. Test analysis pipeline end-to-end
4. Add error handling and retries

## File Structure After Implementation

```
src/
├── app/
│   ├── admin/
│   │   └── niche/
│   │       ├── new/
│   │       │   ├── page.tsx (exists)
│   │       │   └── actions.ts (new)
│   │       └── [id]/
│   │           └── page.tsx (exists)
│   ├── api/
│   │   └── niches/
│   │       ├── route.ts (new)
│   │       └── [id]/
│   │           ├── route.ts (new)
│   │           └── analyze/
│   │               └── route.ts (new)
│   └── niches/
│       ├── page.tsx (new)
│       └── [slug]/
│           ├── page.tsx (new)
│           ├── intelligence/page.tsx (new)
│           ├── demand/page.tsx (new)
│           ├── competition/page.tsx (new)
│           ├── keywords/page.tsx (new)
│           ├── financial/page.tsx (new)
│           ├── listing/page.tsx (new)
│           └── launch/page.tsx (new)
├── components/
│   ├── admin/
│   │   └── NicheAnalysisForm.tsx (exists)
│   └── niches/ (new)
│       ├── NicheCard.tsx
│       ├── NicheOverview.tsx
│       └── NicheAnalysisNav.tsx
└── lib/
    ├── ai-service.ts (exists - extend)
    ├── amazon-api-service.ts (exists - extend)
    ├── analysis-orchestrator.ts (new)
    ├── api-config.ts (new)
    ├── apify-service.ts (new)
    ├── deep-research-service.ts (exists)
    ├── keepa-service.ts (new)
    └── niche-service.ts (new)
```

## Success Metrics
- Analysis completion time < 5 minutes per niche
- API success rate > 95%
- Cost per niche analysis < $2.00
- Zero data loss during processing
- Page load time < 2 seconds

## Next Steps
1. Review plan and approve approach
2. Set up API credentials in .env.local
3. Start with Step 1: Database Setup
4. Follow implementation order sequentially