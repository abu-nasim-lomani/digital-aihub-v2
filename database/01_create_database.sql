-- =====================================================
-- UNDP Digital & AI Hub - PostgreSQL Database Setup
-- Enterprise-Grade Database Creation Script
-- =====================================================
-- Author: Database Migration Team
-- Date: 2026-01-20
-- Version: 1.0
-- =====================================================

-- Step 1: Create Database (Run this in pgAdmin Query Tool connected to 'postgres' database)
-- =====================================================

-- Drop database if exists (CAUTION: This will delete all data!)
-- Uncomment the line below only if you want to start fresh
-- DROP DATABASE IF EXISTS digital_ai_hub;

-- Create the database
CREATE DATABASE digital_ai_hub
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    TEMPLATE = template0;

COMMENT ON DATABASE digital_ai_hub IS 'UNDP Digital & AI Hub - Production Database';

-- =====================================================
-- Step 2: Create Application User (Run in 'postgres' database)
-- =====================================================

-- Drop user if exists
DROP USER IF EXISTS hub_admin;

-- Create application user with secure password
CREATE USER hub_admin WITH
    LOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOINHERIT
    NOREPLICATION
    CONNECTION LIMIT -1
    PASSWORD 'Hub@2026!Secure';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE digital_ai_hub TO hub_admin;

-- =====================================================
-- Step 3: Connect to digital_ai_hub database
-- =====================================================
-- After running above scripts, disconnect from 'postgres' 
-- and connect to 'digital_ai_hub' database in pgAdmin
-- Then run the remaining scripts

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO hub_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hub_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hub_admin;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hub_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hub_admin;

-- =====================================================
-- Step 4: Enable Required Extensions
-- =====================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search (for future use)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Additional useful extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For password hashing

COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for full-text search';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify database creation
SELECT datname, encoding, datcollate, datctype 
FROM pg_database 
WHERE datname = 'digital_ai_hub';

-- Verify user creation
SELECT usename, usecreatedb, usesuper 
FROM pg_user 
WHERE usename = 'hub_admin';

-- Verify extensions
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'pgcrypto');

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. Save the password 'Hub@2026!Secure' securely
-- 2. Change the password in production environment
-- 3. After running this script, run '02_enhanced_schema.sql'
-- 4. All subsequent scripts should be run as 'hub_admin' user
-- =====================================================
