-- Part 1: Update Schema (Run this first)
-- Rename old columns if they exist
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'learning_modules' AND column_name = 'module_title') THEN
        ALTER TABLE learning_modules RENAME COLUMN module_title TO title;
    END IF;
    
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'learning_modules' AND column_name = 'content') THEN
        ALTER TABLE learning_modules RENAME COLUMN content TO description;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'learning_modules' AND column_name = 'video_url') THEN
        ALTER TABLE learning_modules RENAME COLUMN video_url TO file_url;
    END IF;
END $$;

-- Add new columns if they don't exist
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'pdf';
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS file_size TEXT;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS pages INTEGER;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;
ALTER TABLE learning_modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Part 2: Insert Data
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
