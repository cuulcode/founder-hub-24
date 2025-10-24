-- Create allowed emails table
CREATE TABLE public.allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Only allow reading the allowed emails (no one can modify via API)
CREATE POLICY "Anyone can check if email is allowed"
ON public.allowed_emails
FOR SELECT
USING (true);

-- Insert the whitelisted emails
INSERT INTO public.allowed_emails (email) VALUES
  ('cuulcode@gmail.com'),
  ('sigudlalungelo@gmail.com'),
  ('lungelosigudla@gmail.com'),
  ('polygonbatteries@gmail.com'),
  ('powerbatterysolutions@gmail.com'),
  ('donclerence@gmail.com'),
  ('choosecans@gmail.com'),
  ('polygonenergy@gmail.com');

-- Create function to check if email is allowed
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

-- Update profiles RLS to allow all whitelisted users to see all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Whitelisted users can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_email_allowed(auth.jwt()->>'email')
);

-- Update profiles RLS for updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Whitelisted users can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  public.is_email_allowed(auth.jwt()->>'email')
);

-- Update profiles RLS for inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Whitelisted users can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (
  public.is_email_allowed(auth.jwt()->>'email')
);