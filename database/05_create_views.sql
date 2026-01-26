-- =====================================================
-- UNDP Digital & AI Hub - Materialized Views
-- Performance Optimization for Dashboard and Statistics
-- =====================================================

-- =====================================================
-- VIEW 1: Dashboard Statistics (Materialized)
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT 
    -- Projects
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'published') as published_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_projects,
    COUNT(DISTINCT p.id) as total_projects,
    
    -- Support Requests
    COUNT(DISTINCT sr.id) as total_support_requests,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.status = 'pending') as pending_support_requests,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.status = 'approved') as approved_support_requests,
    COUNT(DISTINCT sr.id) FILTER (WHERE sr.status = 'resolved') as resolved_support_requests,
    ROUND(AVG(sr.progress) FILTER (WHERE sr.status IN ('approved', 'resolved')), 2) as avg_support_progress,
    
    -- Initiatives
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'published') as published_initiatives,
    
    -- Events
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'published' AND e.type = 'upcoming') as upcoming_events,
    COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'published' AND e.type = 'archive') as archived_events,
    
    -- Learning
    COUNT(DISTINCT lm.id) FILTER (WHERE lm.status = 'published') as published_learning_modules,
    
    -- Standards
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'published' AND s.category = 'DPI') as dpi_standards,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'published' AND s.category = 'LGI') as lgi_standards,
    
    -- Team
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'published' AND t.section = 'team') as team_members,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'published' AND t.section = 'advisory') as advisory_members,
    
    -- Users
    COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = TRUE) as active_users,
    COUNT(DISTINCT u.id) FILTER (WHERE u.is_admin = TRUE AND u.is_active = TRUE) as admin_users,
    
    -- Timestamp
    CURRENT_TIMESTAMP as last_refreshed

FROM projects p
FULL OUTER JOIN support_requests sr ON TRUE
FULL OUTER JOIN initiatives i ON TRUE
FULL OUTER JOIN events e ON TRUE
FULL OUTER JOIN learning_modules lm ON TRUE
FULL OUTER JOIN standards s ON TRUE
FULL OUTER JOIN team t ON TRUE
FULL OUTER JOIN users u ON TRUE;

CREATE UNIQUE INDEX idx_mv_dashboard_stats ON mv_dashboard_stats (last_refreshed);

COMMENT ON MATERIALIZED VIEW mv_dashboard_stats IS 'Cached dashboard statistics for fast loading';

-- =====================================================
-- VIEW 2: Project Statistics with Support Requests
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_stats AS
SELECT 
    p.id as project_id,
    p.title as project_title,
    p.status as project_status,
    p.created_at as project_created_at,
    
    COUNT(sr.id) as total_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'pending') as pending_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'approved') as approved_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'declined') as declined_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'resolved') as resolved_requests,
    
    ROUND(AVG(sr.progress), 2) as avg_progress,
    MAX(sr.created_at) as last_request_date,
    
    CURRENT_TIMESTAMP as last_refreshed

FROM projects p
LEFT JOIN support_requests sr ON p.id = sr.project_id
GROUP BY p.id, p.title, p.status, p.created_at;

CREATE UNIQUE INDEX idx_mv_project_stats_id ON mv_project_stats (project_id);
CREATE INDEX idx_mv_project_stats_status ON mv_project_stats (project_status);

COMMENT ON MATERIALIZED VIEW mv_project_stats IS 'Project statistics with aggregated support request data';

-- =====================================================
-- VIEW 3: Year-based Content Distribution
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_year_distribution AS
SELECT 
    EXTRACT(YEAR FROM created_at)::INTEGER as year,
    'projects' as content_type,
    COUNT(*) FILTER (WHERE status = 'published') as count
FROM projects
GROUP BY EXTRACT(YEAR FROM created_at)

UNION ALL

SELECT 
    EXTRACT(YEAR FROM created_at)::INTEGER as year,
    'initiatives' as content_type,
    COUNT(*) FILTER (WHERE status = 'published') as count
FROM initiatives
GROUP BY EXTRACT(YEAR FROM created_at)

UNION ALL

SELECT 
    EXTRACT(YEAR FROM date)::INTEGER as year,
    'events' as content_type,
    COUNT(*) FILTER (WHERE status = 'published') as count
FROM events
GROUP BY EXTRACT(YEAR FROM date)

ORDER BY year DESC, content_type;

CREATE INDEX idx_mv_year_distribution ON mv_year_distribution (year, content_type);

COMMENT ON MATERIALIZED VIEW mv_year_distribution IS 'Content distribution by year for filtering';

-- =====================================================
-- VIEW 4: Recent Activity (Regular View - Not Materialized)
-- =====================================================

CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    'project' as activity_type,
    p.id,
    p.title,
    p.created_at,
    u.full_name as created_by_name
FROM projects p
LEFT JOIN users u ON p.created_by = u.id
WHERE p.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'

UNION ALL

SELECT 
    'initiative' as activity_type,
    i.id,
    i.title,
    i.created_at,
    u.full_name as created_by_name
FROM initiatives i
LEFT JOIN users u ON i.created_by = u.id
WHERE i.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'

UNION ALL

SELECT 
    'support_request' as activity_type,
    sr.id,
    sr.title,
    sr.created_at,
    u.full_name as created_by_name
FROM support_requests sr
LEFT JOIN users u ON sr.created_by = u.id
WHERE sr.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'

ORDER BY created_at DESC
LIMIT 50;

COMMENT ON VIEW v_recent_activity IS 'Recent activity across all content types (last 30 days)';

-- =====================================================
-- Refresh Functions for Materialized Views
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_dashboard_stats;
    REFRESH MATERIALIZED VIEW mv_project_stats;
    REFRESH MATERIALIZED VIEW mv_year_distribution;
    
    RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views IS 'Refresh all materialized views at once';

-- =====================================================
-- Schedule automatic refresh (requires pg_cron extension)
-- =====================================================

-- Uncomment if pg_cron is installed:
-- SELECT cron.schedule('refresh-materialized-views', '0 * * * *', 'SELECT refresh_all_materialized_views()');

-- =====================================================
-- Initial Refresh
-- =====================================================

SELECT refresh_all_materialized_views();

-- =====================================================
-- Verification
-- =====================================================

-- List all views
SELECT 
    schemaname,
    matviewname as view_name,
    'materialized' as view_type
FROM pg_matviews
WHERE schemaname = 'public'

UNION ALL

SELECT 
    schemaname,
    viewname as view_name,
    'regular' as view_type
FROM pg_views
WHERE schemaname = 'public'
ORDER BY view_name;

-- Check materialized view data
SELECT * FROM mv_dashboard_stats;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Materialized views created successfully!';
    RAISE NOTICE '📊 Dashboard stats view ready';
    RAISE NOTICE '🔄 Auto-refresh function created';
    RAISE NOTICE '✔️ Next step: Run 06_seed_data.sql';
END $$;
