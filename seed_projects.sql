-- Insert seed projects
INSERT INTO public.projects (title, support_type, duration, impact, status, created_by)
VALUES 
  ('Logic', 'Software Development', '12 Months', 'Developing core logic systems for enterprise management.', 'published', 'admin'),
  ('ISPAT', 'Infrastructure', '24 Months', 'Modernizing steel production infrastructure with AI monitoring.', 'published', 'admin'),
  ('Legal Aid', 'Consultancy', 'Ongoing', 'Providing digital legal aid services to rural communities.', 'published', 'admin'),
  ('ABCV', 'Research & Development', '18 Months', 'Advanced biometric verification and validation research.', 'published', 'admin');
