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
          role: 'USER' | 'ADMIN' | 'ANALYST'
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}