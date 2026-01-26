-- =====================================================
-- UNDP Digital & AI Hub - Database Triggers
-- Automatic Updates and Audit Logging
-- =====================================================

-- =====================================================
-- TRIGGER FUNCTION 1: Update timestamp automatically
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically update updated_at timestamp on row update';

-- =====================================================
-- Apply update_updated_at trigger to all tables
-- =====================================================

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_timestamp
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_requests_timestamp
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_initiatives_timestamp
    BEFORE UPDATE ON initiatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_modules_timestamp
    BEFORE UPDATE ON learning_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_timestamp
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standards_timestamp
    BEFORE UPDATE ON standards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_timestamp
    BEFORE UPDATE ON team
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FUNCTION 2: Audit logging
-- =====================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, record_id, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_trigger_function IS 'Log all INSERT, UPDATE, DELETE operations to audit_log';

-- =====================================================
-- Apply audit triggers to critical tables
-- =====================================================

CREATE TRIGGER audit_projects
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_support_requests
    AFTER INSERT OR UPDATE OR DELETE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_initiatives
    AFTER INSERT OR UPDATE OR DELETE ON initiatives
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- TRIGGER FUNCTION 3: Set approved_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set approved_at when status changes to 'approved'
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        NEW.approved_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Clear approved_at if status changes from 'approved'
    IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        NEW.approved_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_support_request_approved_at
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_approved_at();

COMMENT ON FUNCTION set_approved_at IS 'Automatically set approved_at timestamp when support request is approved';

-- =====================================================
-- TRIGGER FUNCTION 4: Validate work updates
-- =====================================================

CREATE OR REPLACE FUNCTION validate_work_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure work_updates is a valid JSONB array
    IF NEW.work_updates IS NOT NULL AND jsonb_typeof(NEW.work_updates) != 'array' THEN
        RAISE EXCEPTION 'work_updates must be a JSONB array';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_support_request_work_updates
    BEFORE INSERT OR UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION validate_work_updates();

COMMENT ON FUNCTION validate_work_updates IS 'Validate work_updates JSONB structure';

-- =====================================================
-- TRIGGER FUNCTION 5: Update last_login_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_login_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be called from backend when user logs in
-- Not automatically triggered by database

COMMENT ON FUNCTION update_last_login IS 'Update last_login_at timestamp (called from backend)';

-- =====================================================
-- Verification
-- =====================================================

-- List all triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Count triggers per table
SELECT 
    event_object_table as table_name,
    COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY event_object_table
ORDER BY table_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database triggers created successfully!';
    RAISE NOTICE '⚡ Automatic timestamp updates enabled';
    RAISE NOTICE '📝 Audit logging enabled for critical tables';
    RAISE NOTICE '✔️ Next step: Run 05_create_views.sql';
END $$;
