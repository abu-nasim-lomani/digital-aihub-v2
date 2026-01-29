-- Insert 3 More Polished Projects (Including ABCD Project)
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
    'ABCD Project', 
    'Accelerating Business Connectivity & Digitization (ABCD). A pilot program designed to integrate blockchain technology into local supply chains, ensuring transparency and reducing operational costs for small businesses.', 
    'Technical & Strategic', 
    '12 Months', 
    'Streamlining logistics for 200+ SMEs with 100% data transparency', 
    'approved', 
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop',
    NOW(), 
    NOW()
),
(
    uuid_generate_v4(), 
    'EcoTech Urban Solutions', 
    'Deploying smart waste management sensors and data analytics platforms in 5 metropolitan areas to optimize collection routes and reduce carbon footprint.', 
    'Technical Support', 
    '36 Months', 
    'Reducing municipal waste management costs by 30% and carbon emissions by 15%', 
    'approved', 
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
    NOW(), 
    NOW()
),
(
    uuid_generate_v4(), 
    'Future Ready Youth Coding', 
    'A nationwide bootcamp series focused on equipping high school graduates with Python, React, and AI fundamentals to prepare them for the gig economy.', 
    'Financial Grant', 
    '12 Months', 
    'Upskilling 10,000 students with a 65% job placement target', 
    'approved', 
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop',
    NOW(), 
    NOW()
);
