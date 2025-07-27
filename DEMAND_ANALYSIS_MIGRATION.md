# Demand Analysis Table Migration

## Issue
The demand analysis feature requires columns in the `niches_demand_analysis` table that need to be added.

## Solution
Run the following SQL migration in your Supabase SQL editor:

```sql
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
```

## After Running the Migration

1. Populate sample data by running:
   ```bash
   curl -X POST http://localhost:3000/api/test/populate-demand-analysis
   ```

2. The demand analysis page will now show:
   - **Market Insights**: AI analysis of market trends and opportunities
   - **Pricing Trends**: Optimal pricing strategies and competitor analysis
   - **Seasonality Insights**: Peak seasons and inventory recommendations
   - **Social Signals**: Viral potential and platform-specific insights

## What This Fixes

- Connects the demand analysis page to the `niches_demand_analysis` table
- Shows AI-generated insights for each tab
- Provides comprehensive market analysis data

## Files Updated

1. `/src/app/api/niches/[id]/demand-analysis/route.ts` - New API endpoint
2. `/src/components/products/analysis/DemandAnalysis.tsx` - Updated to fetch and display data
3. `/src/app/api/test/populate-demand-analysis/route.ts` - Sample data population
4. `/supabase/migrations/20250127_add_demand_analysis_columns.sql` - Migration file