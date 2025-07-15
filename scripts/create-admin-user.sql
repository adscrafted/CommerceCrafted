-- Script to create admin user in Supabase
-- Run this in the Supabase SQL editor

-- First, create the auth user (if not exists)
-- Note: This requires using Supabase Dashboard or Auth API to create the user
-- as direct INSERT into auth.users is restricted

-- After creating the auth user via Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Invite User"
-- 3. Use email: anthony@adscrafted.com
-- 4. Set password: admin123

-- Then run this to ensure the user has admin role:
DO $$
BEGIN
    -- Wait for the trigger to create the user in public.users
    -- If it doesn't exist, create it manually
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'anthony@adscrafted.com') THEN
        INSERT INTO public.users (
            id,
            email,
            name,
            role,
            subscription_tier,
            email_verified,
            is_active,
            created_at,
            updated_at
        )
        SELECT 
            id,
            'anthony@adscrafted.com',
            'Anthony (Admin)',
            'ADMIN',
            'enterprise',
            true,
            true,
            NOW(),
            NOW()
        FROM auth.users
        WHERE email = 'anthony@adscrafted.com'
        LIMIT 1;
    ELSE
        -- Update existing user to ensure admin role
        UPDATE public.users 
        SET 
            role = 'ADMIN',
            subscription_tier = 'enterprise',
            name = COALESCE(name, 'Anthony (Admin)'),
            is_active = true,
            email_verified = true,
            updated_at = NOW()
        WHERE email = 'anthony@adscrafted.com';
    END IF;
END $$;

-- Verify the user was created/updated
SELECT id, email, name, role, subscription_tier, is_active 
FROM public.users 
WHERE email = 'anthony@adscrafted.com';

-- Grant admin permissions (if you have custom RLS policies)
-- This ensures the admin can access all data