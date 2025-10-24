-- Fix security warning: set search_path for is_email_allowed function
CREATE OR REPLACE FUNCTION public.is_email_allowed(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_emails
    WHERE email = check_email
  );
$$;