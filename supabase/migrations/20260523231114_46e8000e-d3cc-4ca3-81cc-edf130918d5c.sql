CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Remove any prior versions of this job to keep things idempotent
DO $$
BEGIN
  PERFORM cron.unschedule('keepalive');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('heartbeat');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Schedule a tiny harmless daily SELECT at 03:17 UTC
SELECT cron.schedule(
  'keepalive',
  '17 3 * * *',
  $$ SELECT 1; $$
);