-- Database Schema Validation Script
-- This script checks for consistency across all tables

-- 1. Check all user_id column types
SELECT 
    'user_id column types' as check_name,
    t.table_name,
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.data_type = 'uuid' THEN '✓ Correct'
        WHEN c.data_type = 'text' THEN '✗ Should be UUID'
        ELSE '? Unknown type'
    END as status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE c.column_name = 'user_id' 
  AND t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 2. Check all foreign key constraints for user_id
SELECT 
    'user_id foreign keys' as check_name,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN ccu.table_name = 'users' AND ccu.column_name = 'id' THEN '✓ Correct (users.id)'
        WHEN ccu.table_name = 'users' AND ccu.column_name = 'id' THEN '✓ Correct (auth.users.id)'
        ELSE '? Check reference'
    END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 3. Check primary key types for main tables
SELECT 
    'primary key types' as check_name,
    t.table_name,
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.data_type = 'uuid' THEN '✓ Correct'
        ELSE '? Check type'
    END as status
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE c.column_name = 'id' 
  AND t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN ('users', 'niches', 'niche_products', 'product_queue_projects', 'product_keywords')
ORDER BY t.table_name;

-- 4. Check if users table exists and has correct structure
SELECT 
    'users table structure' as check_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check RLS policies for consistency
SELECT 
    'RLS policies' as check_name,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'niches', 'niche_products', 'product_queue_projects', 'product_keywords')
ORDER BY tablename, policyname;

-- 6. Check for any remaining type mismatches
SELECT 
    'potential type mismatches' as check_name,
    t1.table_name as table1,
    t1.column_name as column1,
    t1.data_type as type1,
    t2.table_name as table2,
    t2.column_name as column2,
    t2.data_type as type2
FROM information_schema.columns t1
JOIN information_schema.columns t2 ON t1.column_name = t2.column_name
WHERE t1.table_schema = 'public' 
  AND t2.table_schema = 'public'
  AND t1.table_name != t2.table_name
  AND t1.data_type != t2.data_type
  AND t1.column_name IN ('user_id', 'id')
ORDER BY t1.column_name, t1.table_name;

-- 7. Summary report
SELECT 
    'summary' as check_name,
    'Database schema validation complete' as message,
    'Check results above for any issues marked with ✗ or ?' as action_required;