-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create projects table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  support_type text,
  document_url text,
  duration text,
  impact text,
  status text default 'pending', -- 'draft', 'pending', 'published'
  created_by text
);

-- Create support_requests table
create table if not exists public.support_requests (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  support_type text,
  document_url text,
  duration text,
  impact text,
  status text default 'pending', -- 'pending', 'approved', 'declined'
  created_by text,
  project_id uuid REFERENCES public.projects(id)
);

-- Enable RLS (Row Level Security)
alter table public.projects enable row level security;
alter table public.support_requests enable row level security;

-- Policies for projects
-- Public can view published projects
create policy "Public projects are viewable by everyone"
  on public.projects for select
  using ( status = 'published' );

-- Admins can do everything (This is a simplified policy, in real app check for admin role)
-- For now, allowing authenticated users to insert (for demo purposes if needed, otherwise restrict)
create policy "Authenticated users can insert projects"
  on public.projects for insert
  to authenticated
  with check ( true );

-- Admin full access (You might need to adjust this based on your Auth setup)
-- assuming you handle admin checks in app, but for DB security:
create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using ( true ); 

create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using ( true );

-- Policies for support_requests
-- Users can insert their own requests
create policy "Users can create support requests"
  on public.support_requests for insert
  to authenticated
  with check ( true );

-- Users can view their own requests (optional)
create policy "Users can view own support requests"
  on public.support_requests for select
  to authenticated
  using ( auth.email() = created_by );

-- Admins can view all (Simplified for now - open to auth users)
create policy "Admins can view all support requests"
  on public.support_requests for select
  to authenticated
  using ( true );

create policy "Admins can update support requests"
  on public.support_requests for update
  to authenticated
  using ( true );

create policy "Admins can delete support requests"
  on public.support_requests for delete
  to authenticated
  using ( true );

-- Storage Bucket Setup (Bucket name: 'files')
-- Note: You have to create the bucket 'files' manually in Supabase Storage dashboard if it doesn't exist.
-- Policy to allow public to view files
-- Policy to allow authenticated users to upload files
