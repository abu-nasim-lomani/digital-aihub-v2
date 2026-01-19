-- Forcefully fix RLS by dropping potential conflicting policies first

-- 1. Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid "policy already exists" errors
DROP POLICY IF EXISTS "Allow authenticated users to insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow public to view support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Public can insert support requests" ON public.support_requests; -- Just in case

-- 3. Re-create Policy for INSERT (Authenticated users)
CREATE POLICY "Allow authenticated users to insert support requests"
ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Re-create Policy for SELECT (Public - allows viewing anything for now)
CREATE POLICY "Allow public to view support requests"
ON public.support_requests
FOR SELECT
TO public
USING (true);

-- 5. Re-create Policy for UPDATE (Authenticated)
CREATE POLICY "Allow authenticated users to update support requests"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (true);

-- 6. Re-create Policy for DELETE (Authenticated)
CREATE POLICY "Allow authenticated users to delete support requests"
ON public.support_requests
FOR DELETE
TO authenticated
USING (true);
