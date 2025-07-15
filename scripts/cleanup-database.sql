-- Database Cleanup Script for CommerceCrafted
-- This script removes unused tables and cleans up the database structure

-- 1. Drop unused core tables
DROP TABLE IF EXISTS saved_products CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;  -- Replaced by product_keywords
DROP TABLE IF EXISTS api_call_logs CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;  -- Replaced by subscription_usage

-- 2. Drop the entire keyword_groups feature (replaced by product_keywords)
DROP TABLE IF EXISTS keyword_group_progress CASCADE;
DROP TABLE IF EXISTS keyword_group_keywords CASCADE;
DROP TABLE IF EXISTS keyword_group_asin_metadata CASCADE;
DROP TABLE IF EXISTS keyword_groups CASCADE;

-- 3. Drop any other tables that might exist from old migrations but aren't used
DROP TABLE IF EXISTS niche_analyses CASCADE;
DROP TABLE IF EXISTS analysis_queue CASCADE;
DROP TABLE IF EXISTS analysis_events CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS report_data CASCADE;
DROP TABLE IF EXISTS search_terms CASCADE;
DROP TABLE IF EXISTS amazon_report_data CASCADE;
DROP TABLE IF EXISTS product_time_series CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS keyword_analyses CASCADE;

-- 4. Clean up any orphaned sequences
DROP SEQUENCE IF EXISTS saved_products_id_seq CASCADE;
DROP SEQUENCE IF EXISTS keywords_id_seq CASCADE;
DROP SEQUENCE IF EXISTS api_call_logs_id_seq CASCADE;
DROP SEQUENCE IF EXISTS api_usage_id_seq CASCADE;

-- Show remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Summary of what will remain:
-- Core Tables:
-- - users (authentication and profiles)
-- - products (Amazon product catalog)
-- - niches (user-created collections)
-- - niche_products (products in niches)
-- - analysis_runs (analysis job tracking)
-- - product_analyses (product scores)
-- - daily_features (product of the day)
--
-- Authentication:
-- - email_verification_tokens
-- - password_reset_tokens
--
-- External APIs:
-- - amazon_api_cache (API response caching)
-- - amazon_reports (SP-API reports)
-- - keepa_price_history (Keepa price data)
-- - keepa_sales_rank_history (Keepa rank data)
-- - keepa_review_history (Keepa review count and rating history)
--
-- Features:
-- - subscription_usage (API usage limits)
-- - customer_reviews (product reviews)
-- - social_insights (Reddit data)
-- - product_queue_projects (queue management)
-- - product_keywords (keyword data)