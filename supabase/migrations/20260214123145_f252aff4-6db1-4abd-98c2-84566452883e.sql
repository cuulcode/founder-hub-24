-- Add sort_order column to companies for drag-drop reordering
ALTER TABLE public.companies ADD COLUMN sort_order integer DEFAULT 0;

-- Set initial sort orders based on created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
  FROM public.companies
)
UPDATE public.companies SET sort_order = numbered.rn
FROM numbered WHERE companies.id = numbered.id;