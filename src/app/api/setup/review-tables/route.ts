import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Create product_customer_reviews table
    const { error: reviewsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_customer_reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          asin VARCHAR(20) NOT NULL,
          review_id VARCHAR(50) NOT NULL,
          title TEXT,
          text TEXT,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          verified_purchase BOOLEAN DEFAULT false,
          helpful_votes INTEGER DEFAULT 0,
          total_votes INTEGER DEFAULT 0,
          reviewer_name VARCHAR(255),
          reviewer_profile_url TEXT,
          review_date TIMESTAMP,
          variant_data JSONB,
          images TEXT[],
          created_at TIMESTAMP DEFAULT NOW(),
          
          UNIQUE(asin, review_id)
        );
      `
    }).catch(() => null)

    // Create social_insights table
    const { error: socialTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS social_insights (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          asin VARCHAR(20),
          platform VARCHAR(50) NOT NULL,
          search_queries TEXT[],
          total_posts INTEGER DEFAULT 0,
          total_comments INTEGER DEFAULT 0,
          engagement_score NUMERIC(10, 2),
          sentiment_distribution JSONB,
          top_subreddits JSONB[],
          temporal_trends JSONB[],
          top_mentions JSONB[],
          competitor_mentions JSONB,
          raw_sample JSONB,
          updated_at TIMESTAMP DEFAULT NOW(),
          
          UNIQUE(asin, platform)
        );
      `
    }).catch(() => null)

    // Create indexes
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_asin ON product_customer_reviews(asin);
        CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_rating ON product_customer_reviews(rating);
        CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_date ON product_customer_reviews(review_date DESC);
        CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_verified ON product_customer_reviews(verified_purchase);
        
        CREATE INDEX IF NOT EXISTS idx_social_insights_asin ON social_insights(asin);
        CREATE INDEX IF NOT EXISTS idx_social_insights_platform ON social_insights(platform);
        CREATE INDEX IF NOT EXISTS idx_social_insights_updated ON social_insights(updated_at DESC);
      `
    }).catch(() => null)

    // Alternative approach - direct SQL execution
    const { error: createError } = await supabase.from('product_customer_reviews').select('id').limit(1)
    
    if (createError && createError.code === '42P01') {
      // Table doesn't exist, let's return instructions
      return NextResponse.json({
        success: false,
        message: 'Tables need to be created manually in Supabase',
        instructions: 'Please run the SQL from scripts/create-review-tables.sql in your Supabase SQL editor'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Review tables setup completed',
      tables: ['product_customer_reviews', 'social_insights']
    })

  } catch (error) {
    console.error('Error setting up review tables:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup review tables',
        details: error instanceof Error ? error.message : 'Unknown error',
        instructions: 'Please run the SQL from scripts/create-review-tables.sql in your Supabase SQL editor'
      },
      { status: 500 }
    )
  }
}