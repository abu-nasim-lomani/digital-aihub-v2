-- Insert Sample Standards & Policies (Reduced to 3)
-- Run this in Supabase SQL Editor

INSERT INTO standards (
    id,
    title,
    category,
    description,
    file_url,
    status,
    created_at,
    updated_at
) VALUES 
(
    uuid_generate_v4(),
    'National AI Strategy 2025',
    'Policy',
    'Comprehensive strategic roadmap for Artificial Intelligence implementation across public and private sectors in Bangladesh.',
    'https://example.com/files/national-ai-strategy.pdf',
    'published',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'DPI Interoperability Framework',
    'DPI',
    'Technical standards and API specifications for ensuring seamless data exchange between digital public infrastructure components.',
    'https://example.com/files/dpi-framework.pdf',
    'published',
    NOW(),
    NOW()
),
(
    uuid_generate_v4(),
    'Smart City Implementation Guide',
    'LGI',
    'Guidelines for Local Government Institutions (LGIs) to deploy smart city solutions, covering IoT, governance, and citizen services.',
    'https://example.com/files/smart-city-guide.pdf',
    'published',
    NOW(),
    NOW()
);
