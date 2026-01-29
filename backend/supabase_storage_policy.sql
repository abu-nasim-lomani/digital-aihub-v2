-- Fix for "Row-level security policy" error on File Upload
-- Run this in Supabase SQL Editor

-- 1. Create 'uploads' bucket if it doesn't exist (and make it public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remove old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete" ON storage.objects;

-- 3. Enable Public Uploads (Insert)
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');

-- 4. Enable Public Updates
CREATE POLICY "Allow Public Update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'uploads');

-- 5. Enable Public Deletes
CREATE POLICY "Allow Public Delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'uploads');
