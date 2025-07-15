import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get admin user to bypass RLS
    const { data: { user } } = await supabase.auth.getUser()
    
    // Use service role client to create tables
    const serviceSupabase = await createServerSupabaseClient(true) // service role
    
    // Create the product_queue_projects table
    const { error: createProjectsError } = await serviceSupabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS product_queue_projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'active',
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_pqp_user_id ON product_queue_projects(user_id);
        CREATE INDEX IF NOT EXISTS idx_pqp_status ON product_queue_projects(status);
      `
    })
    
    if (createProjectsError) {
      console.log('Projects table might already exist or RPC not available')
    }
    
    // Create the product_keywords table
    const { error: createKeywordsError } = await serviceSupabase.rpc('query', {
      query: `
        CREATE TABLE IF NOT EXISTS product_keywords (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID REFERENCES product_queue_projects(id) ON DELETE CASCADE,
          asin VARCHAR(20) NOT NULL,
          keyword VARCHAR(500) NOT NULL,
          estimated_clicks INTEGER DEFAULT 0,
          estimated_orders INTEGER DEFAULT 0,
          bid DECIMAL(10, 2),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          
          UNIQUE(project_id, asin, keyword)
        );
        
        CREATE INDEX IF NOT EXISTS idx_product_keywords_project_id ON product_keywords(project_id);
        CREATE INDEX IF NOT EXISTS idx_product_keywords_asin ON product_keywords(asin);
      `
    })
    
    if (createKeywordsError) {
      console.log('Keywords table might already exist or RPC not available')
    }
    
    // Try creating a test project directly
    const { data: adminUser } = await serviceSupabase
      .from('users')
      .select('id')
      .eq('role', 'ADMIN')
      .limit(1)
      .single()
    
    if (adminUser) {
      const { data: project, error: projectError } = await serviceSupabase
        .from('product_queue_projects')
        .insert({
          name: 'Test Keyword Project',
          user_id: adminUser.id,
          status: 'active'
        })
        .select()
        .single()
      
      if (!projectError && project) {
        return NextResponse.json({ 
          success: true, 
          message: 'Tables setup complete',
          projectId: project.id,
          projectName: project.name
        })
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tables setup attempted'
    })
    
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Failed to setup tables',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}