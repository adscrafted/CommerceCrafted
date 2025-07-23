export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      accounts: {
        Row: Account
        Insert: AccountInsert
        Update: AccountUpdate
      }
      sessions: {
        Row: Session
        Insert: SessionInsert
        Update: SessionUpdate
      }
      verification_tokens: {
        Row: VerificationToken
        Insert: VerificationTokenInsert
        Update: VerificationTokenUpdate
      }
      password_reset_tokens: {
        Row: PasswordResetToken
        Insert: PasswordResetTokenInsert
        Update: PasswordResetTokenUpdate
      }
      email_verification_tokens: {
        Row: EmailVerificationToken
        Insert: EmailVerificationTokenInsert
        Update: EmailVerificationTokenUpdate
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
      }
      product_analyses: {
        Row: ProductAnalysis
        Insert: ProductAnalysisInsert
        Update: ProductAnalysisUpdate
      }product_daily_features: {
        Row: DailyFeature
        Insert: DailyFeatureInsert
        Update: DailyFeatureUpdate
      }keyword_analyses: {
        Row: KeywordAnalysis
        Insert: KeywordAnalysisInsert
        Update: KeywordAnalysisUpdate
      }
      ppc_strategies: {
        Row: PPCStrategy
        Insert: PPCStrategyInsert
        Update: PPCStrategyUpdate
      }
      inventory_analyses: {
        Row: InventoryAnalysis
        Insert: InventoryAnalysisInsert
        Update: InventoryAnalysisUpdate
      }
      demand_analyses: {
        Row: DemandAnalysis
        Insert: DemandAnalysisInsert
        Update: DemandAnalysisUpdate
      }
      competitor_analyses: {
        Row: CompetitorAnalysis
        Insert: CompetitorAnalysisInsert
        Update: CompetitorAnalysisUpdate
      }
      financial_models: {
        Row: FinancialModel
        Insert: FinancialModelInsert
        Update: FinancialModelUpdate
      }
      ai_research_sessions: {
        Row: AIResearchSession
        Insert: AIResearchSessionInsert
        Update: AIResearchSessionUpdate
      }
      trend_analyses: {
        Row: TrendAnalysis
        Insert: TrendAnalysisInsert
        Update: TrendAnalysisUpdate
      }
      newsletter_subscriptions: {
        Row: NewsletterSubscription
        Insert: NewsletterSubscriptionInsert
        Update: NewsletterSubscriptionUpdate
      }
      newsletter_campaigns: {
        Row: NewsletterCampaign
        Insert: NewsletterCampaignInsert
        Update: NewsletterCampaignUpdate
      }
      analytics_events: {
        Row: AnalyticsEvent
        Insert: AnalyticsEventInsert
        Update: AnalyticsEventUpdate
      }
      subscription_usage: {
        Row: SubscriptionUsage
        Insert: SubscriptionUsageInsert
        Update: SubscriptionUsageUpdate
      }
      invoices: {
        Row: Invoice
        Insert: InvoiceInsert
        Update: InvoiceUpdate
      }
      amazon_reports: {
        Row: AmazonReport
        Insert: AmazonReportInsert
        Update: AmazonReportUpdate
      }
      amazon_report_data: {
        Row: AmazonReportData
        Insert: AmazonReportDataInsert
        Update: AmazonReportDataUpdate
      }
      search_terms: {
        Row: SearchTerm
        Insert: SearchTermInsert
        Update: SearchTermUpdate
      }
      niches: {
        Row: Niche
        Insert: NicheInsert
        Update: NicheUpdate
      }
      customer_reviews: {
        Row: CustomerReview
        Insert: CustomerReviewInsert
        Update: CustomerReviewUpdate
      }
      market_intelligence: {
        Row: MarketIntelligence
        Insert: MarketIntelligenceInsert
        Update: MarketIntelligenceUpdate
      }
      keepa_review_history: {
        Row: KeepaReviewHistory
        Insert: KeepaReviewHistoryInsert
        Update: KeepaReviewHistoryUpdate
      }
      keepa_sales_rank_history: {
        Row: KeepaSalesRankHistory
        Insert: KeepaSalesRankHistoryInsert
        Update: KeepaSalesRankHistoryUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'USER' | 'ADMIN' | 'ANALYST'
      subscription_tier: 'free' | 'pro' | 'enterprise'
      product_status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
      session_status: 'active' | 'completed' | 'expired'
      report_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
      niche_status: 'pending' | 'analyzing' | 'completed' | 'scheduled'
      competition_level: 'LOW' | 'MEDIUM' | 'HIGH'
      threat_level: 'LOW' | 'MEDIUM' | 'HIGH'
      volume_level: 'LOW' | 'MEDIUM' | 'HIGH'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// User types
export interface User {
  id: string
  email: string
  password_hash: string | null
  name: string | null
  role: Database['public']['Enums']['user_role']
  subscription_tier: Database['public']['Enums']['subscription_tier']
  subscription_expires_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  email_subscribed: boolean
  email_verified: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id?: string
  email: string
  password_hash?: string | null
  name?: string | null
  role?: Database['public']['Enums']['user_role']
  subscription_tier?: Database['public']['Enums']['subscription_tier']
  subscription_expires_at?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  email_subscribed?: boolean
  email_verified?: string | null
  is_active?: boolean
  last_login_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  email?: string
  password_hash?: string | null
  name?: string | null
  role?: Database['public']['Enums']['user_role']
  subscription_tier?: Database['public']['Enums']['subscription_tier']
  subscription_expires_at?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  email_subscribed?: boolean
  email_verified?: string | null
  is_active?: boolean
  last_login_at?: string | null
  updated_at?: string
}

// Account types
export interface Account {
  id: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

export interface AccountInsert {
  id?: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
}

export interface AccountUpdate {
  user_id?: string
  type?: string
  provider?: string
  provider_account_id?: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
}

// Session types
export interface Session {
  id: string
  session_token: string
  user_id: string
  expires: string
}

export interface SessionInsert {
  id?: string
  session_token: string
  user_id: string
  expires: string
}

export interface SessionUpdate {
  session_token?: string
  user_id?: string
  expires?: string
}

// Verification Token types
export interface VerificationToken {
  identifier: string
  token: string
  expires: string
}

export interface VerificationTokenInsert {
  identifier: string
  token: string
  expires: string
}

export interface VerificationTokenUpdate {
  identifier?: string
  token?: string
  expires?: string
}

// Password Reset Token types
export interface PasswordResetToken {
  id: string
  email: string
  token: string
  expires: string
  used: boolean
  created_at: string
}

export interface PasswordResetTokenInsert {
  id?: string
  email: string
  token: string
  expires: string
  used?: boolean
  created_at?: string
}

export interface PasswordResetTokenUpdate {
  email?: string
  token?: string
  expires?: string
  used?: boolean
}

// Email Verification Token types
export interface EmailVerificationToken {
  id: string
  email: string
  token: string
  expires: string
  used: boolean
  created_at: string
}

export interface EmailVerificationTokenInsert {
  id?: string
  email: string
  token: string
  expires: string
  used?: boolean
  created_at?: string
}

export interface EmailVerificationTokenUpdate {
  email?: string
  token?: string
  expires?: string
  used?: boolean
}

// Product types
export interface Product {
  id: string
  asin: string
  title: string
  category: string | null
  subcategory: string | null
  brand: string | null
  price: number | null
  bsr: number | null
  rating: number | null
  review_count: number | null
  image_urls: string | null
  // Enhanced Keepa fields
  length: number | null
  width: number | null
  height: number | null
  weight: number | null
  frequently_purchased_asins: string | null
  variation_family: string | null
  parent_asin: string | null
  monthly_orders: number | null
  video_urls: string | null
  a_plus_content: string | null
  fba_fees: string | null
  referral_fee: number | null
  bullet_points: string | null
  // Niche-specific product support
  niche_id: string | null
  status: Database['public']['Enums']['product_status']
  created_at: string
  updated_at: string
}

export interface ProductInsert {
  id?: string
  asin: string
  title: string
  category?: string | null
  subcategory?: string | null
  brand?: string | null
  price?: number | null
  bsr?: number | null
  rating?: number | null
  review_count?: number | null
  image_urls?: string | null
  // Enhanced Keepa fields
  length?: number | null
  width?: number | null
  height?: number | null
  weight?: number | null
  frequently_purchased_asins?: string | null
  variation_family?: string | null
  parent_asin?: string | null
  monthly_orders?: number | null
  video_urls?: string | null
  a_plus_content?: string | null
  fba_fees?: string | null
  referral_fee?: number | null
  bullet_points?: string | null
  // Niche-specific product support
  niche_id?: string | null
  status?: Database['public']['Enums']['product_status']
  created_at?: string
  updated_at?: string
}

export interface ProductUpdate {
  asin?: string
  title?: string
  category?: string | null
  subcategory?: string | null
  brand?: string | null
  price?: number | null
  bsr?: number | null
  rating?: number | null
  review_count?: number | null
  image_urls?: string | null
  // Enhanced Keepa fields
  length?: number | null
  width?: number | null
  height?: number | null
  weight?: number | null
  frequently_purchased_asins?: string | null
  variation_family?: string | null
  parent_asin?: string | null
  monthly_orders?: number | null
  video_urls?: string | null
  a_plus_content?: string | null
  fba_fees?: string | null
  referral_fee?: number | null
  bullet_points?: string | null
  status?: Database['public']['Enums']['product_status']
  updated_at?: string
}

// Product Analysis types
export interface ProductAnalysis {
  id: string
  product_id: string
  opportunity_score: number
  competition_score: number
  demand_score: number
  feasibility_score: number
  timing_score: number
  financial_analysis: Json
  market_analysis: Json
  competition_analysis: Json
  keyword_analysis: Json
  review_analysis: Json
  supply_chain_analysis: Json
  ai_generated_content: string | null
  human_edited_content: string | null
  focus_graph_data: Json | null
  analyst_id: string | null
  created_at: string
  updated_at: string
}

export interface ProductAnalysisInsert {
  id?: string
  product_id: string
  opportunity_score: number
  competition_score: number
  demand_score: number
  feasibility_score: number
  timing_score: number
  financial_analysis: Json
  market_analysis: Json
  competition_analysis: Json
  keyword_analysis: Json
  review_analysis: Json
  supply_chain_analysis: Json
  ai_generated_content?: string | null
  human_edited_content?: string | null
  focus_graph_data?: Json | null
  analyst_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProductAnalysisUpdate {
  opportunity_score?: number
  competition_score?: number
  demand_score?: number
  feasibility_score?: number
  timing_score?: number
  financial_analysis?: Json
  market_analysis?: Json
  competition_analysis?: Json
  keyword_analysis?: Json
  review_analysis?: Json
  supply_chain_analysis?: Json
  ai_generated_content?: string | null
  human_edited_content?: string | null
  focus_graph_data?: Json | null
  analyst_id?: string | null
  updated_at?: string
}

// Keyword types
export interface Keyword {
  id: string
  keyword: string
  search_volume: number | null
  competition_score: number | null
  cpc: number | null
  trend_data: Json | null
  created_at: string
}

export interface KeywordInsert {
  id?: string
  keyword: string
  search_volume?: number | null
  competition_score?: number | null
  cpc?: number | null
  trend_data?: Json | null
  created_at?: string
}

export interface KeywordUpdate {
  keyword?: string
  search_volume?: number | null
  competition_score?: number | null
  cpc?: number | null
  trend_data?: Json | null
}

// Product Keyword types
export interface ProductKeyword {
  product_id: string
  keyword: string
  match_type: string
  suggested_bid: number
  estimated_clicks: number
  estimated_orders: number
  created_at: string
}

export interface ProductKeywordInsert {
  product_id: string
  keyword: string
  match_type?: string
  suggested_bid?: number
  estimated_clicks?: number
  estimated_orders?: number
  created_at?: string
}

export interface ProductKeywordUpdate {
  match_type?: string
  suggested_bid?: number
  estimated_clicks?: number
  estimated_orders?: number
}

// Daily Feature types
export interface DailyFeature {
  id: string
  product_id: string
  featured_date: string
  headline: string | null
  summary: string | null
  created_by: string
  created_at: string
}

export interface DailyFeatureInsert {
  id?: string
  product_id: string
  featured_date: string
  headline?: string | null
  summary?: string | null
  created_by: string
  created_at?: string
}

export interface DailyFeatureUpdate {
  product_id?: string
  featured_date?: string
  headline?: string | null
  summary?: string | null
  created_by?: string
}

// Saved Product types
export interface SavedProduct {
  user_id: string
  product_id: string
  saved_at: string
}

export interface SavedProductInsert {
  user_id: string
  product_id: string
  saved_at?: string
}

export interface SavedProductUpdate {
  saved_at?: string
}

// Keyword Analysis types
export interface KeywordAnalysis {
  id: string
  product_id: string
  primary_keywords: Json
  long_tail_keywords: Json
  keyword_difficulty: Json
  seasonal_trends: Json
  ppc_metrics: Json
  search_intent: Json
  competitor_keywords: Json
  created_at: string
  updated_at: string
}

export interface KeywordAnalysisInsert {
  id?: string
  product_id: string
  primary_keywords: Json
  long_tail_keywords: Json
  keyword_difficulty: Json
  seasonal_trends: Json
  ppc_metrics: Json
  search_intent: Json
  competitor_keywords: Json
  created_at?: string
  updated_at?: string
}

export interface KeywordAnalysisUpdate {
  primary_keywords?: Json
  long_tail_keywords?: Json
  keyword_difficulty?: Json
  seasonal_trends?: Json
  ppc_metrics?: Json
  search_intent?: Json
  competitor_keywords?: Json
  updated_at?: string
}

// PPC Strategy types
export interface PPCStrategy {
  id: string
  product_id: string
  estimated_launch_cost: number
  suggested_bid_ranges: Json
  competitor_ad_analysis: Json
  campaign_structure: Json
  expected_acos: number
  break_even_acos: number
  launch_phases: Json
  budget_allocation: Json
  targeting_strategy: Json
  created_at: string
  updated_at: string
}

export interface PPCStrategyInsert {
  id?: string
  product_id: string
  estimated_launch_cost: number
  suggested_bid_ranges: Json
  competitor_ad_analysis: Json
  campaign_structure: Json
  expected_acos: number
  break_even_acos: number
  launch_phases: Json
  budget_allocation: Json
  targeting_strategy: Json
  created_at?: string
  updated_at?: string
}

export interface PPCStrategyUpdate {
  estimated_launch_cost?: number
  suggested_bid_ranges?: Json
  competitor_ad_analysis?: Json
  campaign_structure?: Json
  expected_acos?: number
  break_even_acos?: number
  launch_phases?: Json
  budget_allocation?: Json
  targeting_strategy?: Json
  updated_at?: string
}

// Inventory Analysis types
export interface InventoryAnalysis {
  id: string
  product_id: string
  optimal_order_quantity: number
  seasonal_demand: Json
  supplier_analysis: Json
  cash_flow_projections: Json
  risk_assessment: Json
  lead_times: Json
  quality_requirements: Json
  cost_breakdown: Json
  moq_analysis: Json
  created_at: string
  updated_at: string
}

export interface InventoryAnalysisInsert {
  id?: string
  product_id: string
  optimal_order_quantity: number
  seasonal_demand: Json
  supplier_analysis: Json
  cash_flow_projections: Json
  risk_assessment: Json
  lead_times: Json
  quality_requirements: Json
  cost_breakdown: Json
  moq_analysis: Json
  created_at?: string
  updated_at?: string
}

export interface InventoryAnalysisUpdate {
  optimal_order_quantity?: number
  seasonal_demand?: Json
  supplier_analysis?: Json
  cash_flow_projections?: Json
  risk_assessment?: Json
  lead_times?: Json
  quality_requirements?: Json
  cost_breakdown?: Json
  moq_analysis?: Json
  updated_at?: string
}

// Demand Analysis types
export interface DemandAnalysis {
  id: string
  product_id: string
  market_size: Json
  growth_trends: Json
  geographic_demand: Json
  customer_behavior: Json
  seasonal_patterns: Json
  demand_drivers: Json
  market_segmentation: Json
  price_elasticity: Json
  forecasting: Json
  created_at: string
  updated_at: string
}

export interface DemandAnalysisInsert {
  id?: string
  product_id: string
  market_size: Json
  growth_trends: Json
  geographic_demand: Json
  customer_behavior: Json
  seasonal_patterns: Json
  demand_drivers: Json
  market_segmentation: Json
  price_elasticity: Json
  forecasting: Json
  created_at?: string
  updated_at?: string
}

export interface DemandAnalysisUpdate {
  market_size?: Json
  growth_trends?: Json
  geographic_demand?: Json
  customer_behavior?: Json
  seasonal_patterns?: Json
  demand_drivers?: Json
  market_segmentation?: Json
  price_elasticity?: Json
  forecasting?: Json
  updated_at?: string
}

// Competitor Analysis types
export interface CompetitorAnalysis {
  id: string
  product_id: string
  top_competitors: Json
  price_analysis: Json
  market_share_data: Json
  competitive_advantages: Json
  threat_level: Database['public']['Enums']['threat_level']
  entry_barriers: Json
  competitor_strategies: Json
  swot_analysis: Json
  benchmarking: Json
  created_at: string
  updated_at: string
}

export interface CompetitorAnalysisInsert {
  id?: string
  product_id: string
  top_competitors: Json
  price_analysis: Json
  market_share_data: Json
  competitive_advantages: Json
  threat_level: Database['public']['Enums']['threat_level']
  entry_barriers: Json
  competitor_strategies: Json
  swot_analysis: Json
  benchmarking: Json
  created_at?: string
  updated_at?: string
}

export interface CompetitorAnalysisUpdate {
  top_competitors?: Json
  price_analysis?: Json
  market_share_data?: Json
  competitive_advantages?: Json
  threat_level?: Database['public']['Enums']['threat_level']
  entry_barriers?: Json
  competitor_strategies?: Json
  swot_analysis?: Json
  benchmarking?: Json
  updated_at?: string
}

// Financial Model types
export interface FinancialModel {
  id: string
  product_id: string
  roi_calculations: Json
  break_even_analysis: Json
  cash_flow_projections: Json
  risk_metrics: Json
  scenario_analysis: Json
  profitability_model: Json
  investment_requirements: Json
  fba_fee_analysis: Json
  tax_implications: Json
  created_at: string
  updated_at: string
}

export interface FinancialModelInsert {
  id?: string
  product_id: string
  roi_calculations: Json
  break_even_analysis: Json
  cash_flow_projections: Json
  risk_metrics: Json
  scenario_analysis: Json
  profitability_model: Json
  investment_requirements: Json
  fba_fee_analysis: Json
  tax_implications: Json
  created_at?: string
  updated_at?: string
}

export interface FinancialModelUpdate {
  roi_calculations?: Json
  break_even_analysis?: Json
  cash_flow_projections?: Json
  risk_metrics?: Json
  scenario_analysis?: Json
  profitability_model?: Json
  investment_requirements?: Json
  fba_fee_analysis?: Json
  tax_implications?: Json
  updated_at?: string
}

// AI Research Session types
export interface AIResearchSession {
  id: string
  user_id: string
  product_id: string | null
  session_type: string
  conversation: Json
  insights: Json
  recommendations: Json
  follow_up_actions: Json
  session_status: Database['public']['Enums']['session_status']
  tokens_used: number
  created_at: string
  updated_at: string
}

export interface AIResearchSessionInsert {
  id?: string
  user_id: string
  product_id?: string | null
  session_type: string
  conversation: Json
  insights: Json
  recommendations: Json
  follow_up_actions: Json
  session_status?: Database['public']['Enums']['session_status']
  tokens_used?: number
  created_at?: string
  updated_at?: string
}

export interface AIResearchSessionUpdate {
  product_id?: string | null
  session_type?: string
  conversation?: Json
  insights?: Json
  recommendations?: Json
  follow_up_actions?: Json
  session_status?: Database['public']['Enums']['session_status']
  tokens_used?: number
  updated_at?: string
}

// Trend Analysis types
export interface TrendAnalysis {
  id: string
  trend_name: string
  category: string
  volume: Database['public']['Enums']['volume_level']
  growth_rate: number
  description: string
  opportunities: Json
  related_products: Json
  market_data: Json
  risk_factors: Json
  timeframe: string
  confidence: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrendAnalysisInsert {
  id?: string
  trend_name: string
  category: string
  volume: Database['public']['Enums']['volume_level']
  growth_rate: number
  description: string
  opportunities: Json
  related_products: Json
  market_data: Json
  risk_factors: Json
  timeframe: string
  confidence: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface TrendAnalysisUpdate {
  trend_name?: string
  category?: string
  volume?: Database['public']['Enums']['volume_level']
  growth_rate?: number
  description?: string
  opportunities?: Json
  related_products?: Json
  market_data?: Json
  risk_factors?: Json
  timeframe?: string
  confidence?: number
  is_active?: boolean
  updated_at?: string
}

// Newsletter Subscription types
export interface NewsletterSubscription {
  id: string
  email: string
  user_id: string | null
  subscription_type: string
  is_active: boolean
  preferences: Json | null
  subscribe_source: string | null
  unsubscribe_token: string
  subscribe_date: string
  last_email_sent: string | null
  emails_sent: number
  clicks_count: number
  opens_count: number
}

export interface NewsletterSubscriptionInsert {
  id?: string
  email: string
  user_id?: string | null
  subscription_type?: string
  is_active?: boolean
  preferences?: Json | null
  subscribe_source?: string | null
  unsubscribe_token: string
  subscribe_date?: string
  last_email_sent?: string | null
  emails_sent?: number
  clicks_count?: number
  opens_count?: number
}

export interface NewsletterSubscriptionUpdate {
  email?: string
  user_id?: string | null
  subscription_type?: string
  is_active?: boolean
  preferences?: Json | null
  subscribe_source?: string | null
  unsubscribe_token?: string
  last_email_sent?: string | null
  emails_sent?: number
  clicks_count?: number
  opens_count?: number
}

// Newsletter Campaign types
export interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  content: string
  html_content: string | null
  campaign_type: string
  featured_product_id: string | null
  scheduled_date: string
  sent_date: string | null
  status: string
  recipient_count: number
  sent_count: number
  open_rate: number | null
  click_rate: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface NewsletterCampaignInsert {
  id?: string
  name: string
  subject: string
  content: string
  html_content?: string | null
  campaign_type: string
  featured_product_id?: string | null
  scheduled_date: string
  sent_date?: string | null
  status?: string
  recipient_count?: number
  sent_count?: number
  open_rate?: number | null
  click_rate?: number | null
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface NewsletterCampaignUpdate {
  name?: string
  subject?: string
  content?: string
  html_content?: string | null
  campaign_type?: string
  featured_product_id?: string | null
  scheduled_date?: string
  sent_date?: string | null
  status?: string
  recipient_count?: number
  sent_count?: number
  open_rate?: number | null
  click_rate?: number | null
  updated_at?: string
}

// Analytics Event types
export interface AnalyticsEvent {
  id: string
  event: string
  properties: string | null
  user_id: string | null
  timestamp: string
  user_agent: string | null
  url: string | null
  referrer: string | null
  ip_address: string | null
  created_at: string
}

export interface AnalyticsEventInsert {
  id?: string
  event: string
  properties?: string | null
  user_id?: string | null
  timestamp: string
  user_agent?: string | null
  url?: string | null
  referrer?: string | null
  ip_address?: string | null
  created_at?: string
}

export interface AnalyticsEventUpdate {
  event?: string
  properties?: string | null
  user_id?: string | null
  timestamp?: string
  user_agent?: string | null
  url?: string | null
  referrer?: string | null
  ip_address?: string | null
}

// Subscription Usage types
export interface SubscriptionUsage {
  id: string
  user_id: string
  usage_type: string
  usage_count: number
  usage_limit: number | null
  period_start: string
  period_end: string
  reset_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionUsageInsert {
  id?: string
  user_id: string
  usage_type: string
  usage_count?: number
  usage_limit?: number | null
  period_start: string
  period_end: string
  reset_date: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface SubscriptionUsageUpdate {
  usage_type?: string
  usage_count?: number
  usage_limit?: number | null
  period_start?: string
  period_end?: string
  reset_date?: string
  is_active?: boolean
  updated_at?: string
}

// Invoice types
export interface Invoice {
  id: string
  user_id: string
  stripe_invoice_id: string
  stripe_subscription_id: string | null
  amount: number
  currency: string
  status: string
  description: string | null
  invoice_url: string | null
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  period_start: string
  period_end: string
  due_date: string
  paid_at: string | null
  attempt_count: number
  next_payment_attempt: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceInsert {
  id?: string
  user_id: string
  stripe_invoice_id: string
  stripe_subscription_id?: string | null
  amount: number
  currency?: string
  status: string
  description?: string | null
  invoice_url?: string | null
  hosted_invoice_url?: string | null
  invoice_pdf?: string | null
  period_start: string
  period_end: string
  due_date: string
  paid_at?: string | null
  attempt_count?: number
  next_payment_attempt?: string | null
  created_at?: string
  updated_at?: string
}

export interface InvoiceUpdate {
  stripe_invoice_id?: string
  stripe_subscription_id?: string | null
  amount?: number
  currency?: string
  status?: string
  description?: string | null
  invoice_url?: string | null
  hosted_invoice_url?: string | null
  invoice_pdf?: string | null
  period_start?: string
  period_end?: string
  due_date?: string
  paid_at?: string | null
  attempt_count?: number
  next_payment_attempt?: string | null
  updated_at?: string
}

// Amazon Report types
export interface AmazonReport {
  id: string
  type: string
  amazon_report_id: string
  status: Database['public']['Enums']['report_status']
  start_date: string
  end_date: string
  marketplace_id: string
  user_id: string
  report_document_id: string | null
  error: string | null
  retry_count: number
  last_polled_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface AmazonReportInsert {
  id?: string
  type: string
  amazon_report_id: string
  status?: Database['public']['Enums']['report_status']
  start_date: string
  end_date: string
  marketplace_id: string
  user_id: string
  report_document_id?: string | null
  error?: string | null
  retry_count?: number
  last_polled_at?: string | null
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface AmazonReportUpdate {
  type?: string
  amazon_report_id?: string
  status?: Database['public']['Enums']['report_status']
  start_date?: string
  end_date?: string
  marketplace_id?: string
  user_id?: string
  report_document_id?: string | null
  error?: string | null
  retry_count?: number
  last_polled_at?: string | null
  completed_at?: string | null
  updated_at?: string
}

// Amazon Report Data types
export interface AmazonReportData {
  id: string
  report_id: string
  data: Json
  record_count: number
  created_at: string
}

export interface AmazonReportDataInsert {
  id?: string
  report_id: string
  data: Json
  record_count: number
  created_at?: string
}

export interface AmazonReportDataUpdate {
  data?: Json
  record_count?: number
}

// Search Term types
export interface SearchTerm {
  id: string
  report_id: string
  term: string
  search_volume: number
  click_share: number
  conversion_share: number
  relevance_score: number
  clicked_asin: string | null
  clicked_product_title: string | null
  week_start_date: string
  week_end_date: string
  marketplace_id: string
  created_at: string
}

export interface SearchTermInsert {
  id?: string
  report_id: string
  term: string
  search_volume: number
  click_share: number
  conversion_share: number
  relevance_score: number
  clicked_asin?: string | null
  clicked_product_title?: string | null
  week_start_date: string
  week_end_date: string
  marketplace_id: string
  created_at?: string
}

export interface SearchTermUpdate {
  term?: string
  search_volume?: number
  click_share?: number
  conversion_share?: number
  relevance_score?: number
  clicked_asin?: string | null
  clicked_product_title?: string | null
  week_start_date?: string
  week_end_date?: string
  marketplace_id?: string
}

// Niche types
export interface Niche {
  id: string
  niche_name: string
  asins: string
  status: Database['public']['Enums']['niche_status']
  added_date: string
  scheduled_date: string
  category: string | null
  total_products: number
  avg_bsr: number | null
  avg_price: number | null
  avg_rating: number | null
  total_reviews: number | null
  total_monthly_revenue: number | null
  opportunity_score: number | null
  competition_level: Database['public']['Enums']['competition_level'] | null
  process_time: string | null
  analyst_assigned: string | null
  niche_keywords: string | null
  market_size: number | null
  ai_analysis: Json | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface NicheInsert {
  id?: string
  niche_name: string
  asins: string
  status?: Database['public']['Enums']['niche_status']
  added_date?: string
  scheduled_date: string
  category?: string | null
  total_products: number
  avg_bsr?: number | null
  avg_price?: number | null
  avg_rating?: number | null
  total_reviews?: number | null
  total_monthly_revenue?: number | null
  opportunity_score?: number | null
  competition_level?: Database['public']['Enums']['competition_level'] | null
  process_time?: string | null
  analyst_assigned?: string | null
  niche_keywords?: string | null
  market_size?: number | null
  ai_analysis?: Json | null
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface NicheUpdate {
  niche_name?: string
  asins?: string
  status?: Database['public']['Enums']['niche_status']
  scheduled_date?: string
  category?: string | null
  total_products?: number
  avg_bsr?: number | null
  avg_price?: number | null
  avg_rating?: number | null
  total_reviews?: number | null
  total_monthly_revenue?: number | null
  opportunity_score?: number | null
  competition_level?: Database['public']['Enums']['competition_level'] | null
  process_time?: string | null
  analyst_assigned?: string | null
  niche_keywords?: string | null
  market_size?: number | null
  ai_analysis?: Json | null
  updated_at?: string
}

// Extended types for API responses
export interface UserWithRelations extends User {
  accounts?: Account[]
  sessions?: Session[]
  saved_products?: SavedProduct[]
  ai_research_sessions?: AIResearchSession[]
  subscription_usage?: SubscriptionUsage[]
  invoices?: Invoice[]
  amazon_reports?: AmazonReport[]
  analytics_events?: AnalyticsEvent[]
  newsletter_subscriptions?: NewsletterSubscription[]
  newsletter_campaigns?: NewsletterCampaign[]
  daily_features?: DailyFeature[]
  product_analyses?: ProductAnalysis[]
  niches?: Niche[]
}

export interface ProductWithRelations extends Product {
  analysis?: ProductAnalysis
  keywords?: ProductKeyword[]
  saved_by_users?: SavedProduct[]
  daily_features?: DailyFeature[]
  ai_research_sessions?: AIResearchSession[]
  keyword_analysis?: KeywordAnalysis[]
  ppc_strategy?: PPCStrategy
  inventory_analysis?: InventoryAnalysis
  demand_analysis?: DemandAnalysis
  competitor_analysis?: CompetitorAnalysis
  financial_model?: FinancialModel
}

export interface NicheWithRelations extends Niche {
  creator?: User
  products?: Product[]
}

export interface AIResearchSessionWithRelations extends AIResearchSession {
  user?: User
  product?: Product
}

export interface AmazonReportWithRelations extends AmazonReport {
  user?: User
  report_data?: AmazonReportData
  search_terms?: SearchTerm[]
}

// Customer Reviews
export interface CustomerReview {
  id: string
  product_id: string
  reviewer_id: string
  reviewer_name: string
  reviewer_url?: string
  rating: number
  title?: string
  content: string
  review_date: string
  verified_purchase: boolean
  helpful_votes: number
  total_votes: number
  images?: string[]
  variant?: string
  created_at: string
  updated_at: string
}

export interface CustomerReviewInsert {
  product_id: string
  reviewer_id: string
  reviewer_name: string
  reviewer_url?: string
  rating: number
  title?: string
  content: string
  review_date: string
  verified_purchase?: boolean
  helpful_votes?: number
  total_votes?: number
  images?: string[]
  variant?: string
}

export interface CustomerReviewUpdate {
  reviewer_name?: string
  reviewer_url?: string
  rating?: number
  title?: string
  content?: string
  review_date?: string
  verified_purchase?: boolean
  helpful_votes?: number
  total_votes?: number
  images?: string[]
  variant?: string
}

// Market Intelligence
export interface MarketIntelligence {
  id: string
  product_id: string
  niche_id?: string
  customer_personas?: Json
  voice_of_customer?: Json
  emotional_triggers?: Json
  raw_reviews?: Json
  total_reviews_analyzed: number
  analysis_date: string
  created_at: string
  updated_at: string
}

export interface MarketIntelligenceInsert {
  product_id: string
  niche_id?: string
  customer_personas?: Json
  voice_of_customer?: Json
  emotional_triggers?: Json
  raw_reviews?: Json
  total_reviews_analyzed?: number
  analysis_date: string
}

export interface MarketIntelligenceUpdate {
  niche_id?: string
  customer_personas?: Json
  voice_of_customer?: Json
  emotional_triggers?: Json
  raw_reviews?: Json
  total_reviews_analyzed?: number
  analysis_date?: string
}

// Keepa Review History
export interface KeepaReviewHistory {
  id: string
  asin: string
  date_timestamp: number
  review_count: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface KeepaReviewHistoryInsert {
  asin: string
  date_timestamp: number
  review_count: number
  average_rating: number
}

export interface KeepaReviewHistoryUpdate {
  review_count?: number
  average_rating?: number
}

// Keepa Sales Rank History
export interface KeepaSalesRankHistory {
  id: string
  asin: string
  date_timestamp: number
  sales_rank: number
  category_rank: number
  category: string | null
  subcategory: string | null
  created_at: string
  updated_at: string
}

export interface KeepaSalesRankHistoryInsert {
  asin: string
  date_timestamp: number
  sales_rank: number
  category_rank: number
  category?: string | null
  subcategory?: string | null
}

export interface KeepaSalesRankHistoryUpdate {
  sales_rank?: number
  category_rank?: number
  category?: string | null
  subcategory?: string | null
}

// Utility types
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']
export type Functions = Database['public']['Functions']