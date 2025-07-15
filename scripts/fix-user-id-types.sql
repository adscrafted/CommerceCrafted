-- Fix user_id type inconsistencies across all tables
-- This script ensures all user_id columns are UUID type to match users.id
-- 
-- Database structure:
-- auth.users(id) UUID <- Supabase auth table
-- users(id) UUID <- Our app table (references auth.users)
-- All other tables should reference users(id), not auth.users(id)

-- First, let's check the current users table structure
-- The users table should have: id UUID PRIMARY KEY REFERENCES auth.users(id)

-- Fix product_queue_projects table
-- Drop existing foreign key constraint if it exists
ALTER TABLE product_queue_projects DROP CONSTRAINT IF EXISTS product_queue_projects_user_id_fkey;

-- Convert user_id from TEXT to UUID
ALTER TABLE product_queue_projects 
ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- Re-add the foreign key constraint
ALTER TABLE product_queue_projects 
ADD CONSTRAINT product_queue_projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix RLS policies for product_queue_projects
DROP POLICY IF EXISTS "Users can view own projects" ON product_queue_projects;
DROP POLICY IF EXISTS "Users can create own projects" ON product_queue_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON product_queue_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON product_queue_projects;

-- Create corrected RLS policies (using UUID comparison)
CREATE POLICY "Users can view own projects" ON product_queue_projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects" ON product_queue_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON product_queue_projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON product_queue_projects
  FOR DELETE USING (user_id = auth.uid());

-- Fix niche tables to reference users(id) instead of auth.users(id)
-- This ensures proper referential integrity through our app's users table

-- Fix niches table foreign key
ALTER TABLE niches DROP CONSTRAINT IF EXISTS niches_user_id_fkey;
ALTER TABLE niches 
ADD CONSTRAINT niches_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Fix api_call_logs table foreign key
ALTER TABLE api_call_logs DROP CONSTRAINT IF EXISTS api_call_logs_user_id_fkey;
ALTER TABLE api_call_logs 
ADD CONSTRAINT api_call_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Fix any other tables that might have TEXT user_id
-- (This is a safety check - most tables should already be correct)

-- Update keepa_review_history RLS policies if they exist
DROP POLICY IF EXISTS "Admins can manage review history" ON keepa_review_history;
CREATE POLICY "Admins can manage review history" ON keepa_review_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth.uid() = id 
            AND role = 'ADMIN'
        )
    );

-- Verify all tables now use UUID for user_id
-- This query will show any remaining type mismatches
SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE c.column_name = 'user_id' 
  AND t.table_schema = 'public'
ORDER BY t.table_name;

-- Also check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id'
  AND tc.table_schema = 'public';