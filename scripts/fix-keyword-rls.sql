-- Fix RLS policies for product_keywords table
-- Allow service role to bypass RLS

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own project keywords" ON product_keywords;
DROP POLICY IF EXISTS "Users can manage own project keywords" ON product_keywords;

-- Create new policies that allow both authenticated users and service role
CREATE POLICY "Users can view keywords" ON product_keywords
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT user_id FROM product_queue_projects WHERE id = project_id
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can insert keywords" ON product_keywords
  FOR INSERT WITH CHECK (
    auth.uid()::text IN (
      SELECT user_id FROM product_queue_projects WHERE id = project_id
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can update keywords" ON product_keywords
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT user_id FROM product_queue_projects WHERE id = project_id
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete keywords" ON product_keywords
  FOR DELETE USING (
    auth.uid()::text IN (
      SELECT user_id FROM product_queue_projects WHERE id = project_id
    )
    OR auth.role() = 'service_role'
  );