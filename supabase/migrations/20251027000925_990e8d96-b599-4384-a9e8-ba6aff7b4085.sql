-- Fix allowed_emails RLS policy to allow unauthenticated users to check during signup
-- Drop any existing policies first

DROP POLICY IF EXISTS "Authenticated users can check emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Anyone can check if email is allowed" ON public.allowed_emails;

-- Create policy that allows both anonymous and authenticated users to check emails
-- This is necessary for signup flow where users need to check whitelist before authentication
CREATE POLICY "Email whitelist is publicly readable"
  ON public.allowed_emails
  FOR SELECT
  TO anon, authenticated
  USING (true);