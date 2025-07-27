import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Create the niches_demand_analysis table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create niches_demand_analysis table for comprehensive demand analysis data
        CREATE TABLE IF NOT EXISTS public.niches_demand_analysis (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            niche_id TEXT NOT NULL REFERENCES public.niches(id) ON DELETE CASCADE,
            
            -- Market insights
            market_insights JSONB DEFAULT '{}',
            
            -- Pricing trends
            pricing_trends JSONB DEFAULT '{}',
            
            -- Seasonality insights
            seasonality_insights JSONB DEFAULT '{}',
            
            -- Social signals
            social_signals JSONB DEFAULT '{}',
            
            -- Demand velocity metrics
            demand_velocity JSONB DEFAULT '{}',
            
            -- Market size estimates
            market_size_estimate JSONB DEFAULT '{}',
            
            -- Customer segments
            customer_segments JSONB DEFAULT '{}',
            
            -- Demand drivers
            demand_drivers JSONB DEFAULT '[]',
            
            -- Analysis metadata
            analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            -- Ensure only one analysis per niche
            CONSTRAINT unique_niche_demand_analysis UNIQUE (niche_id)
        );

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_niches_demand_analysis_niche_id ON public.niches_demand_analysis(niche_id);
      `
    })
    
    if (error) {
      console.error('Error creating table:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Verify table was created
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'niches_demand_analysis')
    
    return NextResponse.json({
      success: true,
      tableCreated: tables && tables.length > 0,
      message: 'Demand analysis table creation attempted'
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}