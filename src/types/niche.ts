// Niche Analysis Types
export interface NicheAnalysisData {
  id: string
  nicheName: string
  category: string
  opportunityScore: number
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High'
  marketSize: number
  nicheKeywords: string[]
  asins: string[]
  avgPrice: number
  totalMonthlyRevenue: number
  aiAnalysis: NicheAIAnalysis
}

export interface NicheAIAnalysis {
  whyThisProduct: string
  keyHighlights: string[]
  demandAnalysis: string
  competitionAnalysis: string
  keywordAnalysis: string
  listingOptimization: ListingOptimization
}

export interface ListingOptimization {
  title: string
  bulletPoints: string[]
  description: string
}

// Form data interface that matches what the component expects
export interface NicheAnalysisFormData {
  nicheName: string
  category: string
  opportunityScore: number
  competitionLevel: string
  marketSize: number
  nicheKeywords: string[]
  asins: string[]
  avgPrice: number
  totalMonthlyRevenue: number
  aiAnalysis?: {
    whyThisProduct?: string
    keyHighlights?: string[]
    demandAnalysis?: string
    competitionAnalysis?: string
    keywordAnalysis?: string
    listingOptimization?: {
      title?: string
      bulletPoints?: string[]
      description?: string
    }
  }
}

// Server action types
export interface NicheAnalysisServerActions {
  handleSave: (data: NicheAnalysisFormData) => Promise<void>
  handleReprocess?: () => Promise<void>
}

// Database operations
export interface NicheAnalysisRepository {
  findById: (id: string) => Promise<NicheAnalysisData | null>
  create: (data: Omit<NicheAnalysisData, 'id'>) => Promise<NicheAnalysisData>
  update: (id: string, data: Partial<NicheAnalysisData>) => Promise<NicheAnalysisData>
  delete: (id: string) => Promise<void>
}

// Page params for Next.js
export interface NicheAnalysisPageParams {
  id: string
}

export interface NicheAnalysisPageProps {
  params: Promise<NicheAnalysisPageParams>
}