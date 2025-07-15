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
        Row: {
          id: string
          email: string
          name: string | null
          role: 'USER' | 'ADMIN'
          subscription_tier: 'free' | 'pro' | 'enterprise'
          subscription_expires_at: string | null
          email_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
          email_subscribed: boolean
          stripe_customer_id: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: 'USER' | 'ADMIN' | 'ANALYST'
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_expires_at?: string | null
          email_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          email_subscribed?: boolean
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'USER' | 'ADMIN' | 'ANALYST'
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_expires_at?: string | null
          email_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          email_subscribed?: boolean
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          company: string | null
          phone: string | null
          timezone: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          phone?: string | null
          timezone?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          phone?: string | null
          timezone?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      keyword_groups: {
        Row: {
          id: string
          name: string
          asin: string
          user_id: string
          created_at: string
          updated_at: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
        }
        Insert: {
          id?: string
          name: string
          asin: string
          user_id: string
          created_at?: string
          updated_at?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
        }
        Update: {
          id?: string
          name?: string
          asin?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      keyword_group_asin_metadata: {
        Row: {
          id: string
          keyword_group_id: string
          asin: string
          title: string | null
          brand: string | null
          price: number | null
          rating: number | null
          review_count: number | null
          category: string | null
          subcategory: string | null
          bsr: number | null
          bsr_category: string | null
          image_url: string | null
          parent_asin: string | null
          fetched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          keyword_group_id: string
          asin: string
          title?: string | null
          brand?: string | null
          price?: number | null
          rating?: number | null
          review_count?: number | null
          category?: string | null
          subcategory?: string | null
          bsr?: number | null
          bsr_category?: string | null
          image_url?: string | null
          parent_asin?: string | null
          fetched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          keyword_group_id?: string
          asin?: string
          title?: string | null
          brand?: string | null
          price?: number | null
          rating?: number | null
          review_count?: number | null
          category?: string | null
          subcategory?: string | null
          bsr?: number | null
          bsr_category?: string | null
          image_url?: string | null
          parent_asin?: string | null
          fetched_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_group_asin_metadata_keyword_group_id_fkey"
            columns: ["keyword_group_id"]
            isOneToOne: false
            referencedRelation: "keyword_groups"
            referencedColumns: ["id"]
          }
        ]
      }
      keyword_group_keywords: {
        Row: {
          id: string
          keyword_group_id: string
          keyword: string
          search_volume: number | null
          search_volume_trend: number | null
          opportunity_score: number | null
          cpc_exact: number | null
          cpc_broad: number | null
          cpc_phrase: number | null
          competition_score: number | null
          ranking_difficulty: number | null
          relevance_score: number | null
          search_results_count: number | null
          asin_count: number | null
          top_asins: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          keyword_group_id: string
          keyword: string
          search_volume?: number | null
          search_volume_trend?: number | null
          opportunity_score?: number | null
          cpc_exact?: number | null
          cpc_broad?: number | null
          cpc_phrase?: number | null
          competition_score?: number | null
          ranking_difficulty?: number | null
          relevance_score?: number | null
          search_results_count?: number | null
          asin_count?: number | null
          top_asins?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          keyword_group_id?: string
          keyword?: string
          search_volume?: number | null
          search_volume_trend?: number | null
          opportunity_score?: number | null
          cpc_exact?: number | null
          cpc_broad?: number | null
          cpc_phrase?: number | null
          competition_score?: number | null
          ranking_difficulty?: number | null
          relevance_score?: number | null
          search_results_count?: number | null
          asin_count?: number | null
          top_asins?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_group_keywords_keyword_group_id_fkey"
            columns: ["keyword_group_id"]
            isOneToOne: false
            referencedRelation: "keyword_groups"
            referencedColumns: ["id"]
          }
        ]
      }
      keyword_group_progress: {
        Row: {
          id: string
          keyword_group_id: string
          stage: string
          status: 'pending' | 'in_progress' | 'completed' | 'failed'
          progress: number
          message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          keyword_group_id: string
          stage: string
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          progress?: number
          message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          keyword_group_id?: string
          stage?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          progress?: number
          message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_group_progress_keyword_group_id_fkey"
            columns: ["keyword_group_id"]
            isOneToOne: false
            referencedRelation: "keyword_groups"
            referencedColumns: ["id"]
          }
        ]
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
      keyword_group_status: 'pending' | 'processing' | 'completed' | 'failed'
      progress_status: 'pending' | 'in_progress' | 'completed' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}