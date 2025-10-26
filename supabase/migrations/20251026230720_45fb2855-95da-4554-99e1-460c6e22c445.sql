-- Fix PUBLIC_DATA_EXPOSURE: Remove public access to allowed_emails table
-- This prevents attackers from enumerating whitelisted email addresses
-- The Auth.tsx checkEmailAllowed() function will still work because it runs
-- after OAuth authentication completes, so users have valid session tokens

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can check if email is allowed" ON public.allowed_emails;

-- Create a restricted policy that only allows authenticated users to check emails
-- This maintains functionality while preventing public enumeration
CREATE POLICY "Authenticated users can check emails"
  ON public.allowed_emails
  FOR SELECT
  TO authenticated
  USING (true);