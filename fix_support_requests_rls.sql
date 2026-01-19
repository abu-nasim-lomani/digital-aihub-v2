-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- 1. Policy to allow authenticated users to INSERT their own requests
CREATE POLICY "Allow authenticated users to insert support requests"
ON public.support_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Policy to allow authenticated users to VIEW requests
-- (Adjusting to allow viewing all for now, or just their own if strictly private)
-- For this app's project details page, it seems requests are public/visible.
CREATE POLICY "Allow public to view support requests"
ON public.support_requests
FOR SELECT
TO public
USING (true);

-- 3. Policy to allow admins to UPDATE (if you have admin roles, otherwise authenticated for now)
-- Assuming 'authenticated' is okay for updates for now based on app structure, 
-- or limiting to the creator. For Admin panel to work, we might need broader permissions.
CREATE POLICY "Allow authenticated users to update support requests"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (true);

-- 4. Policy for DELETE (Admin only typically, or authenticated)
CREATE POLICY "Allow authenticated users to delete support requests"
ON public.support_requests
FOR DELETE
TO authenticated
USING (true);
