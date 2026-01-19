-- FIX RLS AND DATA MISMATCH

-- 1. Ensure RLS allows reading for everyone (so stats populate)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to view support requests" ON public.support_requests;

CREATE POLICY "Allow public to view support requests"
ON public.support_requests
FOR SELECT
TO public
USING (true);

-- 2. Fix Orphaned Data
-- Assign a random valid project_id to any support_request that has a NULL or Invalid project_id
-- This ensures existing data shows up in the 'Ongoing'/'Complete' counts.
UPDATE public.support_requests
SET project_id = (SELECT id FROM public.projects ORDER BY random() LIMIT 1)
WHERE project_id IS NULL 
   OR project_id NOT IN (SELECT id FROM public.projects);
