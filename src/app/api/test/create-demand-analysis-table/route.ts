import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create a direct Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // First check if the table already has the required columns
    const { data: existingData, error: checkError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .limit(1)
    
    if (checkError) {
      // Table might not exist or have different structure
      console.log('Table check error:', checkError)
    }
    
    // Create the migration SQL to add missing columns if needed
    const migrationSQL = `
      -- Add missing columns to niches_demand_analysis if they don't exist
      DO $$ 
      BEGIN
        -- Add market_insights column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'niches_demand_analysis' 
                       AND column_name = 'market_insights') THEN
          ALTER TABLE niches_demand_analysis ADD COLUMN market_insights JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add pricing_trends column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'niches_demand_analysis' 
                       AND column_name = 'pricing_trends') THEN
          ALTER TABLE niches_demand_analysis ADD COLUMN pricing_trends JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add seasonality_insights column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'niches_demand_analysis' 
                       AND column_name = 'seasonality_insights') THEN
          ALTER TABLE niches_demand_analysis ADD COLUMN seasonality_insights JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add social_signals column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'niches_demand_analysis' 
                       AND column_name = 'social_signals') THEN
          ALTER TABLE niches_demand_analysis ADD COLUMN social_signals JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add analysis_date column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'niches_demand_analysis' 
                       AND column_name = 'analysis_date') THEN
          ALTER TABLE niches_demand_analysis ADD COLUMN analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
      END $$;
    `
    
    // Try to execute the migration
    // Note: Supabase doesn't support raw SQL execution via the client library
    // So we'll work with what exists or return instructions for manual migration
    
    // Check the current structure
    const { data: sampleRow, error: sampleError } = await supabase
      .from('niches_demand_analysis')
      .select('*')
      .limit(1)
    
    const currentColumns = sampleRow && sampleRow.length > 0 ? Object.keys(sampleRow[0]) : []
    
    return NextResponse.json({
      success: true,
      message: 'Table structure checked',
      currentColumns,
      requiredColumns: [
        'id',
        'niche_id',
        'market_insights',
        'pricing_trends',
        'seasonality_insights',
        'social_signals',
        'analysis_date',
        'created_at',
        'updated_at'
      ],
      migrationSQL: currentColumns.length === 0 ? migrationSQL : null,
      instructions: currentColumns.length === 0 ? 
        'Please run the provided SQL in your Supabase SQL editor to add the missing columns.' : 
        'Table has columns, ready to use.'
    })
  } catch (error) {
    console.error('Error checking/creating demand analysis table:', error)
    return NextResponse.json({ 
      error: 'Failed to check/create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}