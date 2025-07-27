import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Create the market_intelligence table
    const { error: createError } = await supabase.rpc('exec_sql', {
      query: `
        -- Create market_intelligence table if it doesn't exist
        CREATE TABLE IF NOT EXISTS market_intelligence (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id VARCHAR(20) REFERENCES product(asin),
          niche_id VARCHAR(255) REFERENCES niches(id),
          customer_personas JSONB DEFAULT '[]'::jsonb,
          voice_of_customer JSONB DEFAULT '{}'::jsonb,
          voice_of_customer_enhanced JSONB,
          emotional_triggers JSONB DEFAULT '[]'::jsonb,
          competitor_analysis JSONB DEFAULT '{}'::jsonb,
          raw_reviews JSONB DEFAULT '[]'::jsonb,
          total_reviews_analyzed INTEGER DEFAULT 0,
          analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_market_intelligence_product_id ON market_intelligence(product_id);
        CREATE INDEX IF NOT EXISTS idx_market_intelligence_niche_id ON market_intelligence(niche_id);
      `
    })
    
    if (createError) {
      console.error('Error creating table:', createError)
      
      // Try a simpler approach - just create the table without RLS
      const { data, error } = await supabase
        .from('market_intelligence')
        .select('count')
        .limit(1)
      
      if (error && error.code === '42P01') {
        // Table doesn't exist, provide instructions
        return NextResponse.json({ 
          error: 'Table does not exist',
          message: 'Please run the SQL migration in the Supabase dashboard',
          sql: `
-- Create market_intelligence table
CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id VARCHAR(20) REFERENCES product(asin),
  niche_id VARCHAR(255) REFERENCES niches(id),
  customer_personas JSONB DEFAULT '[]'::jsonb,
  voice_of_customer JSONB DEFAULT '{}'::jsonb,
  voice_of_customer_enhanced JSONB,
  emotional_triggers JSONB DEFAULT '[]'::jsonb,
  competitor_analysis JSONB DEFAULT '{}'::jsonb,
  raw_reviews JSONB DEFAULT '[]'::jsonb,
  total_reviews_analyzed INTEGER DEFAULT 0,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_intelligence_product_id ON market_intelligence(product_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_niche_id ON market_intelligence(niche_id);
          `
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Market intelligence table created successfully'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}