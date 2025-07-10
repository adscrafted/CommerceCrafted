-- Add admin policy for niches table
-- This allows admins to see all niches

-- First, create the is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies for niches table
CREATE POLICY "Admins can view all niches" ON niches
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create any niches" ON niches
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update any niches" ON niches
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete any niches" ON niches
  FOR DELETE
  USING (is_admin());