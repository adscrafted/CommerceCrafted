-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create simple, non-recursive policies
-- Allow users to read their own profile
CREATE POLICY "Enable read access for users" ON public.users
    FOR SELECT USING (auth.uid()::text = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users" ON public.users
    FOR UPDATE USING (auth.uid()::text = id);

-- Create a separate admin policy using a function to prevent recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Direct check without recursion
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies using the function
CREATE POLICY "Admins can read all" ON public.users
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all" ON public.users
    FOR UPDATE USING (is_admin());