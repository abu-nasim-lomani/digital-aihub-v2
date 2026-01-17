-- Add project_id column to support_requests table
ALTER TABLE public.support_requests 
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id);

-- Optional: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_requests_project_id ON public.support_requests(project_id);
