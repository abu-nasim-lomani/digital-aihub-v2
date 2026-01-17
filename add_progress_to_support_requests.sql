-- Add progress tracking columns to support_requests
ALTER TABLE public.support_requests 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN IF NOT EXISTS work_updates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;

-- Update RLS policies to allow admins to update these specific columns
-- (Existing policies already allow update for authenticated users/admins, so we rely on those)

-- Comment on columns
COMMENT ON COLUMN public.support_requests.approved_at IS 'Timestamp when the request was approved';
COMMENT ON COLUMN public.support_requests.progress IS 'Percentage completion (0-100)';
COMMENT ON COLUMN public.support_requests.work_updates IS 'JSON array of work logs: [{date, message, percentage}]';
COMMENT ON COLUMN public.support_requests.priority IS 'Priority level of the request';
COMMENT ON COLUMN public.support_requests.estimated_completion_date IS 'Target date for completion';
