-- Insert 3 New Learning Modules for Digital AI Hub
-- Run this in Supabase SQL Editor

INSERT INTO learning_modules (
    id, 
    title, 
    description, 
    type, 
    category, 
    file_url, 
    file_size, 
    pages, 
    downloads, 
    status, 
    created_at, 
    updated_at
) VALUES 
(
    uuid_generate_v4(), 
    'Python: Basic to Advanced', 
    'Complete roadmap and guide for mastering Python programming from scratch to advanced concepts.', 
    'pdf', 
    'Training Decks', 
    'https://example.com/files/python-guide.pdf', 
    '18.5 MB', 
    350, 
    2400, 
    'published', 
    NOW(), 
    NOW()
),
(
    uuid_generate_v4(), 
    'AI in Industry 4.0', 
    'Case studies and implementation strategies for Artificial Intelligence in manufacturing and services.', 
    'ppt', 
    'Training Decks', 
    'https://example.com/files/ai-industry.ppt', 
    '45 MB', 
    60, 
    1800, 
    'published', 
    NOW(), 
    NOW()
),
(
    uuid_generate_v4(), 
    'Cyber Security Essentials', 
    'Critical security protocols, threat detection, and safe practices for digital infrastructure.', 
    'pdf', 
    'Guidelines', 
    'https://example.com/files/cyber-security.pdf', 
    '5.2 MB', 
    120, 
    3100, 
    'published', 
    NOW(), 
    NOW()
);
