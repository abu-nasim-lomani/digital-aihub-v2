-- =====================================================
-- UNDP Digital & AI Hub - Enhanced Database Schema
-- Enterprise-Grade Table Definitions with Optimizations
-- =====================================================
-- Run this script after connecting to 'digital_ai_hub' database
-- =====================================================

-- Set timezone
SET timezone = 'Asia/Dhaka';

-- =====================================================
-- TABLE 1: users (Authentication & Authorization)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

COMMENT ON TABLE users IS 'User accounts with authentication and authorization';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (never store plain text)';
COMMENT ON COLUMN users.is_admin IS 'Admin role flag for CMS access';

-- =====================================================
-- TABLE 2: projects
-- =====================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    support_type VARCHAR(100),
    document_url TEXT,
    duration VARCHAR(100),
    impact TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    image_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT projects_status_check CHECK (status IN ('pending', 'published', 'completed', 'archived'))
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status_created_at ON projects(status, created_at DESC);

COMMENT ON TABLE projects IS 'Digital transformation projects';
COMMENT ON COLUMN projects.status IS 'Workflow status: pending, published, completed, archived';

-- =====================================================
-- TABLE 3: support_requests
-- =====================================================

CREATE TABLE IF NOT EXISTS support_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    support_type VARCHAR(100),
    document_url TEXT,
    duration VARCHAR(100),
    impact TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' NOT NULL,
    progress INTEGER DEFAULT 0 NOT NULL,
    work_updates JSONB DEFAULT '[]'::jsonb,
    approved_at TIMESTAMPTZ,
    estimated_completion_date DATE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT support_requests_status_check CHECK (status IN ('pending', 'approved', 'declined', 'resolved')),
    CONSTRAINT support_requests_priority_check CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT support_requests_progress_check CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_support_requests_project_id ON support_requests(project_id);
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_support_requests_created_by ON support_requests(created_by);
CREATE INDEX idx_support_requests_priority ON support_requests(priority);
CREATE INDEX idx_support_requests_status_project ON support_requests(status, project_id);
CREATE INDEX idx_support_requests_work_updates ON support_requests USING GIN(work_updates);

COMMENT ON TABLE support_requests IS 'User support requests linked to projects';
COMMENT ON COLUMN support_requests.work_updates IS 'JSONB array of work logs: [{date, message, percentage}]';
COMMENT ON COLUMN support_requests.progress IS 'Completion percentage (0-100)';

-- =====================================================
-- TABLE 4: initiatives
-- =====================================================

CREATE TABLE IF NOT EXISTS initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    document_url TEXT,
    document_name VARCHAR(255),
    type VARCHAR(100),
    result TEXT,
    impact TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT initiatives_status_check CHECK (status IN ('pending', 'published', 'archived'))
);

CREATE INDEX idx_initiatives_status ON initiatives(status);
CREATE INDEX idx_initiatives_type ON initiatives(type);
CREATE INDEX idx_initiatives_created_at ON initiatives(created_at DESC);
CREATE INDEX idx_initiatives_status_created_at ON initiatives(status, created_at DESC);

COMMENT ON TABLE initiatives IS 'Strategic initiatives and programs';
COMMENT ON COLUMN initiatives.type IS 'Initiative category (AI, Governance, Tech, etc.)';

-- =====================================================
-- TABLE 5: learning_modules
-- =====================================================

CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_title VARCHAR(500) NOT NULL,
    content TEXT,
    video_url TEXT,
    resources TEXT[],
    curriculum TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT learning_modules_status_check CHECK (status IN ('pending', 'published', 'archived'))
);

CREATE INDEX idx_learning_modules_status ON learning_modules(status);
CREATE INDEX idx_learning_modules_created_at ON learning_modules(created_at DESC);

COMMENT ON TABLE learning_modules IS 'Learning and capacity building modules';
COMMENT ON COLUMN learning_modules.resources IS 'Array of resource URLs';

-- =====================================================
-- TABLE 6: events
-- =====================================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    outcome TEXT NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    video_urls TEXT[],
    gallery_images TEXT[],
    documents JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT events_type_check CHECK (type IN ('upcoming', 'archive')),
    CONSTRAINT events_status_check CHECK (status IN ('pending', 'published', 'archived'))
);

CREATE INDEX idx_events_date ON events(date DESC);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type_date ON events(type, date DESC);
CREATE INDEX idx_events_documents ON events USING GIN(documents);

COMMENT ON TABLE events IS 'Events (upcoming and archived)';
COMMENT ON COLUMN events.documents IS 'JSONB array of document objects: [{name, url}]';

-- =====================================================
-- TABLE 7: standards
-- =====================================================

CREATE TABLE IF NOT EXISTS standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(10) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT standards_category_check CHECK (category IN ('DPI', 'LGI')),
    CONSTRAINT standards_status_check CHECK (status IN ('pending', 'published', 'archived'))
);

CREATE INDEX idx_standards_category ON standards(category);
CREATE INDEX idx_standards_status ON standards(status);
CREATE INDEX idx_standards_category_status ON standards(category, status);

COMMENT ON TABLE standards IS 'Standards and best practices documents';
COMMENT ON COLUMN standards.category IS 'DPI: Digital Public Infrastructure, LGI: Local Government Infrastructure';

-- =====================================================
-- TABLE 8: team
-- =====================================================

CREATE TABLE IF NOT EXISTS team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    photo_url TEXT,
    email VARCHAR(255),
    linkedin TEXT,
    section VARCHAR(20) NOT NULL,
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT team_section_check CHECK (section IN ('advisory', 'team')),
    CONSTRAINT team_status_check CHECK (status IN ('pending', 'published', 'archived'))
);

CREATE INDEX idx_team_section ON team(section);
CREATE INDEX idx_team_status ON team(status);
CREATE INDEX idx_team_display_order ON team(display_order);
CREATE INDEX idx_team_section_order ON team(section, display_order);

COMMENT ON TABLE team IS 'Team members and advisory board';
COMMENT ON COLUMN team.section IS 'advisory: Advisory Board, team: Core Team';
COMMENT ON COLUMN team.display_order IS 'Order for display (lower numbers first)';

-- =====================================================
-- TABLE 9: audit_log (Enterprise Feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id UUID,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT audit_log_operation_check CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);

COMMENT ON TABLE audit_log IS 'Audit trail for all database operations';
COMMENT ON COLUMN audit_log.old_data IS 'Record state before change (UPDATE/DELETE)';
COMMENT ON COLUMN audit_log.new_data IS 'Record state after change (INSERT/UPDATE)';

-- =====================================================
-- Verification Queries
-- =====================================================

-- List all tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count indexes
SELECT schemaname, tablename, COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verify constraints
SELECT conname, contype, conrelid::regclass as table_name
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Enhanced schema created successfully!';
    RAISE NOTICE '📊 Total tables: 9';
    RAISE NOTICE '🔍 Total indexes: 40+';
    RAISE NOTICE '✔️ Next step: Run 03_create_functions.sql';
END $$;
