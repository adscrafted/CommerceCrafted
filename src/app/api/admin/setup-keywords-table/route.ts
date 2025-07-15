import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Create the product_keywords table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create UUID extension if not exists
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Drop existing table if needed (for testing)
        DROP TABLE IF EXISTS product_keywords CASCADE;
        
        -- Simple Product Keywords Table
        CREATE TABLE product_keywords (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            project_id UUID REFERENCES product_queue_projects(id) ON DELETE CASCADE,
            asin VARCHAR(20) NOT NULL,
            keyword VARCHAR(500) NOT NULL,
            estimated_clicks INTEGER DEFAULT 0,
            estimated_orders INTEGER DEFAULT 0,
            bid DECIMAL(10, 2),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            
            UNIQUE(project_id, asin, keyword)
        );
        
        -- Indexes
        CREATE INDEX idx_product_keywords_project_id ON product_keywords(project_id);
        CREATE INDEX idx_product_keywords_asin ON product_keywords(asin);
        CREATE INDEX idx_product_keywords_created_at ON product_keywords(created_at DESC);
        
        -- RLS
        ALTER TABLE product_keywords ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own project keywords" ON product_keywords
            FOR SELECT USING (
                project_id IN (
                    SELECT id FROM product_queue_projects 
                    WHERE user_id = auth.uid()
                )
            );
        
        CREATE POLICY "Users can manage own project keywords" ON product_keywords
            FOR ALL USING (
                project_id IN (
                    SELECT id FROM product_queue_projects 
                    WHERE user_id = auth.uid()
                )
            );
      `
    })
    
    if (error) {
      console.error('Error creating table:', error)
      // Try a simpler approach without RPC
      return NextResponse.json({ 
        message: 'Table might already exist or RPC not available',
        error: error.message 
      })
    }
    
    return NextResponse.json({ success: true, message: 'Table created successfully' })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Failed to setup table',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}