-- Insert Sample Team Members
-- Run this in Supabase SQL Editor

INSERT INTO team (
    id,
    name,
    designation,
    section,
    email,
    linkedin,
    photo_url,
    display_order,
    status,
    created_at,
    updated_at
) VALUES 
(
    uuid_generate_v4(),
    'Dr. Sarah Rahman',
    'Chief Executive Officer',
    'Leadership',
    'sarah@digitalaihub.bd',
    'https://linkedin.com/in/example',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop',
    1,
    'published',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'James Chen',
    'Chief Technology Officer',
    'Leadership',
    'james@digitalaihub.bd',
    'https://linkedin.com/in/example',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop',
    2,
    'published',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Ayesha Khan',
    'Lead AI Researcher',
    'Technical',
    'ayesha@digitalaihub.bd',
    'https://linkedin.com/in/example',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop',
    3,
    'published',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Robert Miller',
    'Strategic Advisor',
    'Advisory',
    'robert@advisor.global',
    'https://linkedin.com/in/example',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop',
    4,
    'published',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Michael Ross',
    'Head of Operations',
    'Operations',
    'michael@digitalaihub.bd',
    '',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop',
    5,
    'published',
    NOW(),
    NOW()
);
