-- Insert 2 New Projects for Digital AI Hub
-- Run this in Supabase SQL Editor

INSERT INTO projects (
    id, 
    title, 
    description, 
    support_type, 
    duration, 
    impact, 
    status, 
    image_url,
    created_at, 
    updated_at
) VALUES 
(
    uuid_generate_v4(), 
    'Smart Agriculture Initiative', 
    'Implementing IoT-based soil monitoring and automated irrigation systems for rural farmers to increase crop yield and reduce water wastage.', 
    'Technical & Financial', 
    '18 Months', 
    'Expected to increase crop yield by 25% for 5,000 farmers', 
    'approved', 
    'https://images.unsplash.com/photo-1625246333195-551e51245128?w=800&auto=format&fit=crop',
    NOW(), 
    NOW()
),
(
    uuid_generate_v4(), 
    'Digital Health Access', 
    'Developing a telemedicine platform to connect remote villages with specialized doctors in urban centers, ensuring healthcare for all.', 
    'Technical Support', 
    '24 Months', 
    'Providing healthcare access to 50+ remote villages', 
    'approved', 
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop',
    NOW(), 
    NOW()
);
