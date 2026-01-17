-- Drop previous policy if exists to avoid conflicts
drop policy if exists "Admins can delete support requests" on public.support_requests;

-- Create policy to allow both authenticated AND anonymous users (local admin) to delete
create policy "Admins can delete support requests"
  on public.support_requests for delete
  to anon, authenticated
  using ( true );
