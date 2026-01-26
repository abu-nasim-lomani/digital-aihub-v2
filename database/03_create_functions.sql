-- =====================================================
-- UNDP Digital & AI Hub - Database Functions
-- Helper Functions for Business Logic
-- =====================================================

-- =====================================================
-- FUNCTION 1: Check if user is admin
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_id AND is_admin = TRUE AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin IS 'Check if a user has admin privileges';

-- =====================================================
-- FUNCTION 2: Get project statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS TABLE (
    total_requests BIGINT,
    pending_requests BIGINT,
    approved_requests BIGINT,
    resolved_requests BIGINT,
    avg_progress NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_requests,
        COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_requests,
        COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_requests,
        ROUND(AVG(progress), 2) as avg_progress
    FROM support_requests
    WHERE project_id = project_uuid;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_project_stats IS 'Get aggregated statistics for a project';

-- =====================================================
-- FUNCTION 3: Get dashboard statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_projects BIGINT,
    published_projects BIGINT,
    completed_projects BIGINT,
    total_initiatives BIGINT,
    total_events BIGINT,
    upcoming_events BIGINT,
    total_support_requests BIGINT,
    pending_support_requests BIGINT,
    resolved_support_requests BIGINT,
    total_users BIGINT,
    admin_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM projects)::BIGINT,
        (SELECT COUNT(*) FROM projects WHERE status = 'published')::BIGINT,
        (SELECT COUNT(*) FROM projects WHERE status = 'completed')::BIGINT,
        (SELECT COUNT(*) FROM initiatives WHERE status = 'published')::BIGINT,
        (SELECT COUNT(*) FROM events WHERE status = 'published')::BIGINT,
        (SELECT COUNT(*) FROM events WHERE type = 'upcoming' AND status = 'published')::BIGINT,
        (SELECT COUNT(*) FROM support_requests)::BIGINT,
        (SELECT COUNT(*) FROM support_requests WHERE status = 'pending')::BIGINT,
        (SELECT COUNT(*) FROM support_requests WHERE status = 'resolved')::BIGINT,
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE)::BIGINT,
        (SELECT COUNT(*) FROM users WHERE is_admin = TRUE AND is_active = TRUE)::BIGINT;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_dashboard_stats IS 'Get all dashboard statistics in one query';

-- =====================================================
-- FUNCTION 4: Add work update to support request
-- =====================================================

CREATE OR REPLACE FUNCTION add_work_update(
    request_id UUID,
    update_message TEXT,
    progress_percentage INTEGER
)
RETURNS VOID AS $$
DECLARE
    new_update JSONB;
BEGIN
    -- Create new update object
    new_update := jsonb_build_object(
        'date', CURRENT_DATE,
        'message', update_message,
        'percentage', progress_percentage,
        'timestamp', CURRENT_TIMESTAMP
    );
    
    -- Append to work_updates array
    UPDATE support_requests
    SET 
        work_updates = work_updates || new_update,
        progress = progress_percentage,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = request_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_work_update IS 'Add a work update to support request and update progress';

-- =====================================================
-- FUNCTION 5: Get year-based content counts
-- =====================================================

CREATE OR REPLACE FUNCTION get_year_counts(table_name TEXT)
RETURNS TABLE (
    year INTEGER,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT 
            EXTRACT(YEAR FROM created_at)::INTEGER as year,
            COUNT(*)::BIGINT as count
        FROM %I
        WHERE status = ''published''
        GROUP BY EXTRACT(YEAR FROM created_at)
        ORDER BY year DESC',
        table_name
    );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_year_counts IS 'Get content counts grouped by year for any table';

-- =====================================================
-- FUNCTION 6: Search across all content
-- =====================================================

CREATE OR REPLACE FUNCTION search_content(search_term TEXT)
RETURNS TABLE (
    content_type TEXT,
    id UUID,
    title TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'project'::TEXT, p.id, p.title, 
           similarity(p.title, search_term) as relevance
    FROM projects p
    WHERE p.status = 'published' 
      AND p.title ILIKE '%' || search_term || '%'
    
    UNION ALL
    
    SELECT 'initiative'::TEXT, i.id, i.title,
           similarity(i.title, search_term) as relevance
    FROM initiatives i
    WHERE i.status = 'published'
      AND (i.title ILIKE '%' || search_term || '%' 
           OR i.description ILIKE '%' || search_term || '%')
    
    UNION ALL
    
    SELECT 'event'::TEXT, e.id, e.title,
           similarity(e.title, search_term) as relevance
    FROM events e
    WHERE e.status = 'published'
      AND (e.title ILIKE '%' || search_term || '%'
           OR e.description ILIKE '%' || search_term || '%')
    
    ORDER BY relevance DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_content IS 'Full-text search across projects, initiatives, and events';

-- =====================================================
-- FUNCTION 7: Hash password (for backend use)
-- =====================================================

CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hash_password IS 'Hash password using bcrypt (use in backend, not directly)';

-- =====================================================
-- FUNCTION 8: Verify password
-- =====================================================

CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN password_hash = crypt(plain_password, password_hash);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION verify_password IS 'Verify password against hash';

-- =====================================================
-- Verification
-- =====================================================

-- List all custom functions
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Test dashboard stats function
SELECT * FROM get_dashboard_stats();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database functions created successfully!';
    RAISE NOTICE '📊 Total functions: 8';
    RAISE NOTICE '✔️ Next step: Run 04_create_triggers.sql';
END $$;
