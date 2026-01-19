-- Seed Completed Projects
-- Adds 3 completed projects to the 'projects' table
-- Adds related completed support requests to populate stats

INSERT INTO public.projects (id, title, description, status, duration, impact, image_url, created_at, created_by)
VALUES
(
  gen_random_uuid(),
  'Legacy Data Center Migration',
  'Successfully migrated 50TB of on-premise government data to a secure hybrid cloud infrastructure. This 18-month project involved decommissioning 3 outdated data centers, reducing energy consumption by 40% and cutting release cycles from weeks to hours.',
  'completed',
  '18 Months',
  'Saved $2M in annual operational costs',
  'https://images.unsplash.com/photo-1558494949-ef2a278812bc?auto=format&fit=crop&q=80&w=800',
  NOW() - INTERVAL '2 years',
  'admin@undp.org'
),
(
  gen_random_uuid(),
  'E-Gov Portal Phase 1',
  'Launched the initial version of the centralized citizen services portal. This phase focused on digitizing 50 essential services including birth registration, land records, and tax payments. The project established the core microservices architecture that now powers the entire digital government ecosystem.',
  'completed',
  '12 Months',
  'Served 5M+ citizens in the first year',
  'https://images.unsplash.com/photo-1541872703-74c59669c478?auto=format&fit=crop&q=80&w=800',
  NOW() - INTERVAL '3 years',
  'admin@undp.org'
),
(
  gen_random_uuid(),
  'National Broadband Audit',
  'Completed a nationwide comprehensive audit of fiber optic infrastructure. Using GIS mapping and field surveys, the project engaged 200 engineers to identify connectivity gaps. The final report served as the blueprint for the current "Rural Tech-Connectivity Drive".',
  'completed',
  '6 Months',
  'Mapped 45,000km of fiber network',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
  NOW() - INTERVAL '1 year',
  'admin@undp.org'
);

-- Add support requests for these completed projects to popuate 'Total Complete Support Request'
-- We fetch the IDs we just inserted (conceptually, or we can use a DO block, but random assignment works for demo)

INSERT INTO public.support_requests (project_id, title, support_type, status, created_at, created_by, impact)
SELECT 
  id, 
  'Initial Architecture Review', 
  'Consultancy', 
  'resolved', 
  NOW() - INTERVAL '1 year', 
  'consultant@partner.com', 
  'Defined core standards'
FROM public.projects WHERE status = 'completed';

INSERT INTO public.support_requests (project_id, title, support_type, status, created_at, created_by, impact)
SELECT 
  id, 
  'Security Audit Phase 1', 
  'Technical', 
  'resolved', 
  NOW() - INTERVAL '10 months', 
  'security@audit.com', 
  'Patched 50+ vulnerabilities'
FROM public.projects WHERE status = 'completed';
