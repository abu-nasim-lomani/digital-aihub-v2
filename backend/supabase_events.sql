-- Insert Polished Sample Events
-- Run this in Supabase SQL Editor

INSERT INTO events (
    id,
    title,
    description,
    outcome,
    date,
    type,
    location,
    status,
    created_at,
    updated_at
) VALUES 
(
    uuid_generate_v4(),
    'National Digital Transformation Summit 2026',
    'A flagship conference bringing together policymakers, industry leaders, and tech innovators to discuss the roadmap for a smart nation.',
    'Policy framework consensus and 5 MoU signings.',
    '2026-03-15',
    'Conference',
    'Bangabandhu International Conference Center',
    'upcoming',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'AI for Good Hackathon 3.0',
    '48-hour coding marathon focused on solving local challenges using Artificial Intelligence and Machine Learning.',
    '15 viable prototypes developed for agricultural automation.',
    '2026-02-10',
    'Hackathon',
    'Sheikh Russel Digital Lab, Dhaka',
    'upcoming',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Cyber Security Awareness Workshop',
    'Training session for government officials on identifying phishing attacks and securing sensitive data infrastructure.',
    'Trained 500+ officials on basic security hygiene.',
    '2026-01-20',
    'Workshop',
    'BCC Auditorium',
    'completed',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Smart City Pilot Launch',
    'Official inauguration of the IoT-based traffic management system in the Gulshan-Banani model zone.',
    'Deployed 50 smart sensors and integrated control room.',
    '2025-12-05',
    'Ceremony',
    'Gulshan-2 Circle',
    'completed',
    NOW(),
    NOW()
);
