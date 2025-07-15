-- Corrected SQL for product_queue_projects table
-- This version uses UUID for user_id to match users.id

CREATE TABLE IF NOT EXISTS product_queue_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- Changed to UUID to match users.id
  status VARCHAR(50) DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pqp_user_id ON product_queue_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_pqp_status ON product_queue_projects(status);

-- Enable RLS
ALTER TABLE product_queue_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (using UUID comparison)
CREATE POLICY "Users can view own projects" ON product_queue_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects" ON product_queue_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON product_queue_projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON product_queue_projects
  FOR DELETE USING (user_id = auth.uid());

-- Insert a test project for the admin user
INSERT INTO product_queue_projects (name, user_id, status)
SELECT 'Test Keyword Project', id, 'active'
FROM users
WHERE email = 'admin@commercecrafted.com'
LIMIT 1;

-- Create the product_keywords table (with proper UUID references)
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

-- Create indexes for product_keywords
CREATE INDEX IF NOT EXISTS idx_product_keywords_project_id ON product_keywords(project_id);
CREATE INDEX IF NOT EXISTS idx_product_keywords_asin ON product_keywords(asin);
CREATE INDEX IF NOT EXISTS idx_product_keywords_keyword ON product_keywords(keyword);

-- Enable RLS for product_keywords
ALTER TABLE product_keywords ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_keywords (access through project ownership)
CREATE POLICY "Users can view keywords in own projects" ON product_keywords
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM product_queue_projects 
      WHERE product_queue_projects.id = product_keywords.project_id 
      AND product_queue_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create keywords in own projects" ON product_keywords
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_queue_projects 
      WHERE product_queue_projects.id = product_keywords.project_id 
      AND product_queue_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update keywords in own projects" ON product_keywords
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM product_queue_projects 
      WHERE product_queue_projects.id = product_keywords.project_id 
      AND product_queue_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete keywords in own projects" ON product_keywords
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM product_queue_projects 
      WHERE product_queue_projects.id = product_keywords.project_id 
      AND product_queue_projects.user_id = auth.uid()
    )
  );