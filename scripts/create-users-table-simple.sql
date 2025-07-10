-- Step 1: Create the users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'ANALYST')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_subscribed BOOLEAN DEFAULT false,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create index
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Step 3: Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies (with proper casting)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::uuid = id);

-- Step 5: Insert the admin user manually (get the ID from auth.users first)
-- First, run this query to get the admin user's ID:
-- SELECT id FROM auth.users WHERE email = 'admin@commercecrafted.com';

-- Then use that ID in this insert (replace 'YOUR-UUID-HERE' with the actual ID):
-- INSERT INTO public.users (id, email, name, role, subscription_tier, email_verified, is_active)
-- VALUES (
--     'YOUR-UUID-HERE'::uuid,
--     'admin@commercecrafted.com',
--     'Admin User',
--     'ADMIN',
--     'enterprise',
--     true,
--     true
-- ) ON CONFLICT (id) DO UPDATE SET
--     role = 'ADMIN',
--     subscription_tier = 'enterprise';