# PostgreSQL Database Setup Guide

> **Complete Step-by-Step Instructions for Database Migration**

## 📋 Prerequisites

- ✅ pgAdmin 4 installed
- ✅ PostgreSQL 15+ installed
- ✅ Windows OS

---

## 🚀 Step-by-Step Setup

### Step 1: Open pgAdmin

1. Launch **pgAdmin 4** from Start Menu
2. Enter your master password if prompted
3. Expand **Servers** → **PostgreSQL 15** (or your version)

---

### Step 2: Create Database

1. **Right-click** on **Databases** → Select **Create** → **Database**
2. Fill in the details:
   - **Database**: `digital_ai_hub`
   - **Owner**: `postgres`
   - **Encoding**: `UTF8`
   - **Template**: `template0`
3. Click **Save**

**OR** use SQL:

1. Right-click **PostgreSQL 15** → **Query Tool**
2. Copy and paste from `database/01_create_database.sql`
3. Click **Execute** (F5)

---

### Step 3: Create Application User

In the same Query Tool (connected to `postgres` database):

```sql
DROP USER IF EXISTS hub_admin;

CREATE USER hub_admin WITH
    LOGIN
    PASSWORD 'Hub@2026!Secure';

GRANT ALL PRIVILEGES ON DATABASE digital_ai_hub TO hub_admin;
```

Click **Execute** (F5)

---

### Step 4: Connect to New Database

1. **Right-click** on `digital_ai_hub` database
2. Select **Query Tool**
3. You should now see `digital_ai_hub` in the title bar

---

### Step 5: Run Migration Scripts (IN ORDER!)

**IMPORTANT**: Run these scripts one by one in the exact order:

#### 5.1 Enable Extensions
```sql
-- Run in digital_ai_hub Query Tool
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges
GRANT ALL ON SCHEMA public TO hub_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hub_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hub_admin;
```

#### 5.2 Create Schema
1. Open `database/02_enhanced_schema.sql`
2. Copy entire content
3. Paste in Query Tool
4. Click **Execute** (F5)
5. Wait for "Enhanced schema created successfully!" message

#### 5.3 Create Functions
1. Open `database/03_create_functions.sql`
2. Copy entire content
3. Paste in Query Tool
4. Click **Execute** (F5)
5. Wait for "Database functions created successfully!" message

#### 5.4 Create Triggers
1. Open `database/04_create_triggers.sql`
2. Copy entire content
3. Paste in Query Tool
4. Click **Execute** (F5)
5. Wait for "Database triggers created successfully!" message

#### 5.5 Create Views
1. Open `database/05_create_views.sql`
2. Copy entire content
3. Paste in Query Tool
4. Click **Execute** (F5)
5. Wait for "Materialized views created successfully!" message

#### 5.6 Seed Data
1. Open `database/06_seed_data.sql`
2. Copy entire content
3. Paste in Query Tool
4. Click **Execute** (F5)
5. Wait for "Seed data inserted successfully!" message

---

### Step 6: Verify Database Setup

Run this verification query:

```sql
-- Count all tables
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- View dashboard stats
SELECT * FROM mv_dashboard_stats;

-- Test admin login credentials
SELECT email, is_admin, is_active 
FROM users 
WHERE email = 'admin@undp.org';
```

**Expected Results**:
- 9 tables created
- Dashboard stats showing counts
- Admin user exists

---

## 🔐 Default Credentials

### Admin User
- **Email**: `admin@undp.org`
- **Password**: `Admin@2026`

### Test User
- **Email**: `user@example.com`
- **Password**: `User@2026`

### Database User
- **Username**: `hub_admin`
- **Password**: `Hub@2026!Secure`

> ⚠️ **IMPORTANT**: Change these passwords in production!

---

## 📊 Database Structure Overview

### Tables Created (9 Total)

| Table | Purpose | Row Count |
|-------|---------|-----------|
| `users` | Authentication & authorization | 2 |
| `projects` | Project management | 4 |
| `support_requests` | Support tracking | 4 |
| `initiatives` | Strategic programs | 3 |
| `learning_modules` | Training content | 2 |
| `events` | Event management | 2 |
| `standards` | Best practices | 2 |
| `team` | Team profiles | 3 |
| `audit_log` | Audit trail | 0 |

### Indexes Created: 40+
### Functions Created: 8
### Triggers Created: 12
### Materialized Views: 3

---

## 🔍 Useful pgAdmin Features

### View Table Data
1. Expand `digital_ai_hub` → `Schemas` → `public` → `Tables`
2. Right-click on any table (e.g., `projects`)
3. Select **View/Edit Data** → **All Rows**

### View Table Structure
1. Right-click on table
2. Select **Properties**
3. Navigate through tabs: Columns, Constraints, Indexes

### Export Data
1. Right-click on table
2. Select **Import/Export**
3. Choose format (CSV, JSON, etc.)

### Backup Database
1. Right-click on `digital_ai_hub`
2. Select **Backup**
3. Choose location and format
4. Click **Backup**

---

## 🛠️ Troubleshooting

### Issue: "Extension does not exist"
**Solution**: Run as superuser (postgres)
```sql
-- Connect as postgres user
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: "Permission denied"
**Solution**: Grant privileges
```sql
GRANT ALL PRIVILEGES ON DATABASE digital_ai_hub TO hub_admin;
GRANT ALL ON SCHEMA public TO hub_admin;
```

### Issue: "Function already exists"
**Solution**: Drop and recreate
```sql
DROP FUNCTION IF EXISTS function_name CASCADE;
-- Then run the CREATE FUNCTION again
```

### Issue: "Materialized view refresh failed"
**Solution**: Manually refresh
```sql
REFRESH MATERIALIZED VIEW mv_dashboard_stats;
```

---

## 📈 Performance Optimization

### Refresh Materialized Views Regularly

```sql
-- Refresh all views
SELECT refresh_all_materialized_views();

-- Or refresh individually
REFRESH MATERIALIZED VIEW mv_dashboard_stats;
REFRESH MATERIALIZED VIEW mv_project_stats;
REFRESH MATERIALIZED VIEW mv_year_distribution;
```

**Recommended**: Refresh every hour or after bulk data changes

### Analyze Tables for Query Optimization

```sql
-- Analyze all tables
ANALYZE;

-- Or specific table
ANALYZE projects;
```

### Vacuum Database Regularly

```sql
-- Vacuum all tables
VACUUM ANALYZE;
```

---

## 🔄 Next Steps

After database setup is complete:

1. ✅ Database created and configured
2. ⏳ **Next**: Setup Backend API (Node.js + Express)
3. ⏳ **Then**: Migrate Frontend to use API
4. ⏳ **Finally**: Test and deploy

---

## 📞 Support

If you encounter any issues:

1. Check pgAdmin **Messages** tab for error details
2. Review PostgreSQL logs in pgAdmin
3. Verify all scripts ran successfully
4. Check table counts match expected values

---

**Setup Complete!** 🎉

Your PostgreSQL database is now ready for the backend API integration.
