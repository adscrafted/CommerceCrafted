-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policies that allow admins to see all users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        auth.uid()::text = id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (
        auth.uid()::text = id AND
        NOT EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Grant admin access to view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );