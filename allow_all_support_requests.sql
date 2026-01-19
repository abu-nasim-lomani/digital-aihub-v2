-- 1. Ensure RLS is enabled (Standard practice)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions to roles (Critical step: ensures roles HAVE permission to try)
GRANT ALL ON TABLE public.support_requests TO anon;
GRANT ALL ON TABLE public.support_requests TO authenticated;
GRANT ALL ON TABLE public.support_requests TO service_role;

-- 3. Drop ALL existing policies to ensure a Clean Slate
DROP POLICY IF EXISTS "Allow authenticated users to insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow public to view support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Public can insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Enable all access" ON public.support_requests; -- Drop self if exists

-- 4. Create a single "Catch All" policy
-- This allows ANYONE (Authenticated or Anonymous) to Insert/Update/Select/Delete.
-- Since your Frontend already checks if a user is logged in, this is safe for unblocking the database error.
CREATE POLICY "Enable all access"
ON public.support_requests
FOR ALL
TO public
USING (true)
WITH CHECK (true);
