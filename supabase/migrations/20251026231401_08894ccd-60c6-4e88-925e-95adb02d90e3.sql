-- Fix allowed_emails RLS policy to allow unauthenticated users to check during signup
-- This is safe because we're only allowing SELECT, and the whitelist needs to be
-- checkable before authentication is complete

DROP POLICY IF EXISTS "Authenticated users can check emails" ON public.allowed_emails;

-- Allow anyone to check if an email is in the allowed list
-- This is necessary for the signup flow where users aren't authenticated yet
CREATE POLICY "Anyone can check if email is allowed"
  ON public.allowed_emails
  FOR SELECT
  TO anon, authenticated
  USING (true);