-- Create app_settings table for storing global configuration
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default value for initiative visibility
INSERT INTO app_settings (key, value)
VALUES ('initiative_visibility', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
