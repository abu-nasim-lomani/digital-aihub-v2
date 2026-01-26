-- =====================================================
-- UNDP Digital & AI Hub - Seed Data
-- Initial Data Population for Development and Testing
-- =====================================================

-- =====================================================
-- SEED 1: Create Admin User
-- =====================================================

-- Insert admin user (password: Admin@2026)
INSERT INTO users (email, password_hash, full_name, is_admin, is_active, email_verified)
VALUES (
    'admin@undp.org',
    crypt('Admin@2026', gen_salt('bf', 10)),
    'System Administrator',
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert regular test user (password: User@2026)
INSERT INTO users (email, password_hash, full_name, is_admin, is_active, email_verified)
VALUES (
    'user@example.com',
    crypt('User@2026', gen_salt('bf', 10)),
    'Test User',
    FALSE,
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SEED 2: Projects
-- =====================================================

INSERT INTO projects (id, title, description, support_type, duration, impact, status, created_by)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Logic - Enterprise Management System',
    'Comprehensive enterprise resource planning system for government agencies. Includes modules for HR, Finance, Procurement, and Asset Management.',
    'Software Development',
    '12 Months',
    'Streamlined operations for 15+ government departments, reducing processing time by 60% and improving transparency.',
    'published',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
),
(
    '22222222-2222-2222-2222-222222222222',
    'ISPAT - Steel Production AI Monitoring',
    'AI-powered monitoring and predictive maintenance system for steel manufacturing plants.',
    'Infrastructure',
    '24 Months',
    'Reduced downtime by 35%, improved quality control to 99.2%, enabled predictive maintenance saving $5M annually.',
    'published',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
),
(
    '33333333-3333-3333-3333-333333333333',
    'Legal Aid - Digital Access Platform',
    'Digital platform providing legal aid services to rural communities with multi-language support.',
    'Consultancy',
    'Ongoing',
    'Enabled 200,000+ rural citizens to access legal services, reduced case filing time from weeks to hours.',
    'published',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
),
(
    '44444444-4444-4444-4444-444444444444',
    'ABCV - Biometric Verification Research',
    'Advanced biometric verification and validation research for national security applications.',
    'Research & Development',
    '18 Months',
    'Developed next-gen facial recognition with 99.8% accuracy, processing 1M+ verifications daily.',
    'completed',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED 3: Support Requests
-- =====================================================

INSERT INTO support_requests (
    project_id, title, support_type, duration, impact, status, priority, progress, created_by
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Backend API Performance Optimization',
    'Technical Support',
    '3 Months',
    'Reduce API response time from 2s to 500ms, improving user experience for 5000+ daily users.',
    'approved',
    'High',
    65,
    (SELECT id FROM users WHERE email = 'user@example.com')
),
(
    '22222222-2222-2222-2222-222222222222',
    'AI Model Training Infrastructure Setup',
    'Infrastructure',
    '6 Months',
    'Setup GPU cluster for AI model training, enabling real-time anomaly detection in production line.',
    'approved',
    'Critical',
    40,
    (SELECT id FROM users WHERE email = 'user@example.com')
),
(
    '33333333-3333-3333-3333-333333333333',
    'Multi-language Voice Interface Development',
    'Software Development',
    '8 Months',
    'Add Bengali, Hindi, and 5 regional languages with voice-based interface for rural users.',
    'pending',
    'Medium',
    0,
    (SELECT id FROM users WHERE email = 'user@example.com')
),
(
    '44444444-4444-4444-4444-444444444444',
    'Research Paper Publication Support',
    'Research & Development',
    '4 Months',
    'Publish research findings in top-tier journals, establishing thought leadership.',
    'resolved',
    'Medium',
    100,
    (SELECT id FROM users WHERE email = 'user@example.com')
)
ON CONFLICT DO NOTHING;

-- Add work updates to approved requests
UPDATE support_requests
SET work_updates = '[
    {"date": "2026-01-10", "message": "Initial assessment completed", "percentage": 25, "timestamp": "2026-01-10T10:00:00Z"},
    {"date": "2026-01-15", "message": "Database optimization in progress", "percentage": 65, "timestamp": "2026-01-15T14:30:00Z"}
]'::jsonb
WHERE title = 'Backend API Performance Optimization';

-- =====================================================
-- SEED 4: Initiatives
-- =====================================================

INSERT INTO initiatives (id, title, description, type, impact, status, image_url, created_by)
VALUES
(
    '817bcd52-08b4-412c-aa23-fbca20b388f2',
    'National AI Strategy Roadmap 2030',
    'A comprehensive strategic framework to position the nation as a global AI leader. Includes talent development, infrastructure modernization, and ethics governance.',
    'AI',
    'Strategic alignment of 20+ government agencies, 100,000 engineers trained, 3 Tier-4 data centers established.',
    'published',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
),
(
    uuid_generate_v4(),
    'Smart City Governance Platform',
    'Integrated digital platform for real-time urban management with IoT sensors, traffic optimization, and citizen grievance redressal.',
    'Governance',
    'Reduced civic issue response time by 40%, serving 5M+ citizens annually.',
    'published',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
),
(
    uuid_generate_v4(),
    'Rural Tech-Connectivity Drive',
    'Deploying high-speed broadband to 500+ remote villages, enabling telemedicine and e-learning for underserved communities.',
    'Tech',
    'Connected 50,000+ rural households, laid 2,000km of fiber optic cable.',
    'published',
    'https://images.unsplash.com/photo-1534274983118-2174d613cf20?auto=format&fit=crop&w=800&q=80',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED 5: Learning Modules
-- =====================================================

INSERT INTO learning_modules (module_title, content, video_url, resources, status)
VALUES
(
    'Introduction to Digital Transformation',
    'Comprehensive guide to digital transformation strategies for government agencies.',
    'https://www.youtube.com/embed/example1',
    ARRAY['https://example.com/guide.pdf', 'https://example.com/checklist.pdf'],
    'published'
),
(
    'AI Ethics and Governance',
    'Understanding ethical considerations and governance frameworks for AI deployment.',
    'https://www.youtube.com/embed/example2',
    ARRAY['https://example.com/ethics-guide.pdf'],
    'published'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED 6: Events
-- =====================================================

INSERT INTO events (title, description, outcome, date, type, location, status, created_by)
VALUES
(
    'Digital Bangladesh Summit 2026',
    'Annual summit bringing together government leaders, tech innovators, and international experts.',
    'Policy recommendations adopted, 50+ partnerships formed, $100M investment pledged.',
    '2026-03-15',
    'upcoming',
    'Dhaka, Bangladesh',
    'published',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
),
(
    'AI for Development Workshop 2025',
    'Hands-on workshop on AI applications for sustainable development goals.',
    '200+ participants trained, 15 pilot projects initiated across 8 districts.',
    '2025-11-20',
    'archive',
    'Chittagong, Bangladesh',
    'published',
    (SELECT id FROM users WHERE email = 'admin@undp.org')
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED 7: Standards
-- =====================================================

INSERT INTO standards (title, category, description, file_url, status)
VALUES
(
    'Digital Public Infrastructure Standards v2.0',
    'DPI',
    'Comprehensive standards for building scalable, secure, and interoperable digital public infrastructure.',
    'https://example.com/dpi-standards-v2.pdf',
    'published'
),
(
    'Local Government Integration Guidelines',
    'LGI',
    'Best practices for integrating digital services at local government level.',
    'https://example.com/lgi-guidelines.pdf',
    'published'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED 8: Team Members
-- =====================================================

INSERT INTO team (name, designation, email, linkedin, section, display_order, status)
VALUES
(
    'Dr. Ashraf Hossain',
    'Chief Digital Officer',
    'ashraf.hossain@undp.org',
    'https://linkedin.com/in/ashraf-hossain',
    'team',
    1,
    'published'
),
(
    'Fatima Rahman',
    'Head of AI Innovation',
    'fatima.rahman@undp.org',
    'https://linkedin.com/in/fatima-rahman',
    'team',
    2,
    'published'
),
(
    'Prof. Dr. Kamal Ahmed',
    'Senior Advisor - Technology Policy',
    'kamal.ahmed@advisor.undp.org',
    'https://linkedin.com/in/kamal-ahmed',
    'advisory',
    1,
    'published'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Refresh Materialized Views
-- =====================================================

SELECT refresh_all_materialized_views();

-- =====================================================
-- Verification Queries
-- =====================================================

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'support_requests', COUNT(*) FROM support_requests
UNION ALL
SELECT 'initiatives', COUNT(*) FROM initiatives
UNION ALL
SELECT 'learning_modules', COUNT(*) FROM learning_modules
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'standards', COUNT(*) FROM standards
UNION ALL
SELECT 'team', COUNT(*) FROM team
ORDER BY table_name;

-- View dashboard stats
SELECT * FROM mv_dashboard_stats;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '👤 Admin user: admin@undp.org (password: Admin@2026)';
    RAISE NOTICE '👤 Test user: user@example.com (password: User@2026)';
    RAISE NOTICE '📊 Sample data ready for testing';
    RAISE NOTICE '✔️ Database setup complete!';
END $$;
