-- SQL for Supabase (Run in SQL Editor)

INSERT INTO public.initiatives (title, description, impact, type, status, image_url, result, created_at, updated_at)
VALUES
-- 1. Policy
(
    'National AI Ethics Guidelines',
    'Comprehensive framework ensuring responsible AI deployment across government and private sectors. Focuses on fairness, transparency, accountability, and privacy protection in algorithmic decision-making systems.',
    'Standardized ethical compliance across 50+ agencies',
    'Policy',
    'approved',
    'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2076&auto=format&fit=crop',
    'Draft gazetted',
    NOW(),
    NOW()
),

-- 2. Technology
(
    'GovCloud 2.0 Infrastructure',
    'Upgrading the national e-governance cloud with edge computing capabilities and zero-trust cybersecurity architecture. Designed to support real-time high-volume citizen service transactions.',
    '99.9% Service Uptime & Enhanced Security',
    'Technology',
    'approved',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    'Migration 60% complete',
    NOW(),
    NOW()
),

-- 3. Capacity Building
(
    'Civil Service Digital Academy',
    'A specialized training ecosystem for 50,000 civil servants to master data analytics, process automation, and design thinking. Includes LMS and hands-on workshops.',
    '50,000 Officials Upskilled by 2026',
    'Capacity Building',
    'approved',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b955?q=80&w=2070&auto=format&fit=crop',
    'First cohort graduated',
    NOW(),
    NOW()
),

-- 4. Innovation
(
    'Smart City Sandbox',
    'A regulatory sandbox and funding window for startups to pilot IoT and AI solutions for urban challenges (traffic, waste, energy). successful pilots will be scaled via public procurement.',
    '20+ Startups Piloting Solutions',
    'Innovation',
    'pending',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop',
    'Applications open',
    NOW(),
    NOW()
);
