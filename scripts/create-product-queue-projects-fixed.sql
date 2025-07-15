-- Fixed SQL for product_queue_projects table
-- This version handles the text-based user ID

CREATE TABLE IF NOT EXISTS product_queue_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,  -- Changed from UUID to TEXT
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

-- Create RLS policies
CREATE POLICY "Users can view own projects" ON product_queue_projects
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create own projects" ON product_queue_projects
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own projects" ON product_queue_projects
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own projects" ON product_queue_projects
  FOR DELETE USING (user_id = auth.uid()::text);

-- Insert a test project for the admin user
INSERT INTO product_queue_projects (name, user_id, status)
SELECT 'Test Keyword Project', id, 'active'
FROM users
WHERE email = 'admin@commercecrafted.com'
LIMIT 1;

-- Also update the product_keywords table to match
DROP TABLE IF EXISTS product_keywords CASCADE;

CREATE TABLE product_keywords (
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
CREATE INDEX idx_product_keywords_project_id ON product_keywords(project_id);
CREATE INDEX idx_product_keywords_asin ON product_keywords(asin);
CREATE INDEX idx_product_keywords_created_at ON product_keywords(created_at DESC);

-- Enable RLS for product_keywords
ALTER TABLE product_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for product_keywords
CREATE POLICY "Users can view own project keywords" ON product_keywords
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM product_queue_projects 
      WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage own project keywords" ON product_keywords
  FOR ALL USING (
    project_id IN (
      SELECT id FROM product_queue_projects 
      WHERE user_id = auth.uid()::text
    )
  );