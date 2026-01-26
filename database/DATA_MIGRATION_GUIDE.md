# Supabase to PostgreSQL Data Migration Guide

> **Complete Data Export and Import Process**

## 🎯 Overview

আপনার Supabase এর সব data local PostgreSQL এ নিয়ে আসার 3টি method আছে:

1. **Method 1**: Supabase Dashboard থেকে SQL dump (সবচেয়ে সহজ) ✅
2. **Method 2**: JavaScript script দিয়ে data export (flexible)
3. **Method 3**: Direct PostgreSQL connection (advanced)

---

## 📋 Method 1: Supabase Dashboard SQL Dump (Recommended)

### Step 1: Supabase Dashboard এ যান

1. [https://app.supabase.com](https://app.supabase.com) এ login করুন
2. আপনার project select করুন
3. Left sidebar থেকে **Database** click করুন

### Step 2: SQL Editor Open করুন

1. **SQL Editor** tab এ click করুন
2. New query create করুন

### Step 3: Data Export Query Run করুন

নিচের queries একটা একটা করে run করুন এবং results save করুন:

#### Export Projects
```sql
SELECT * FROM projects ORDER BY created_at;
```
- Results এ right-click → **Download as CSV**
- Save as: `projects_export.csv`

#### Export Support Requests
```sql
SELECT * FROM support_requests ORDER BY created_at;
```
- Save as: `support_requests_export.csv`

#### Export Initiatives
```sql
SELECT * FROM initiatives ORDER BY created_at;
```
- Save as: `initiatives_export.csv`

#### Export Learning Modules
```sql
SELECT * FROM learning_modules ORDER BY created_at;
```
- Save as: `learning_modules_export.csv`

#### Export Events
```sql
SELECT * FROM events ORDER BY created_at;
```
- Save as: `events_export.csv`

#### Export Standards
```sql
SELECT * FROM standards ORDER BY created_at;
```
- Save as: `standards_export.csv`

#### Export Team
```sql
SELECT * FROM team ORDER BY created_at;
```
- Save as: `team_export.csv`

### Step 4: Import to PostgreSQL

pgAdmin Query Tool এ এই script run করুন:

```sql
-- Import করার আগে existing seed data clear করুন (optional)
TRUNCATE TABLE support_requests, projects, initiatives, learning_modules, events, standards, team CASCADE;

-- CSV import করার জন্য pgAdmin এর Import/Export tool use করুন
-- অথবা COPY command use করুন (নিচে দেখুন)
```

**pgAdmin GUI দিয়ে Import:**

1. Left sidebar এ table এ right-click করুন (e.g., `projects`)
2. **Import/Export Data** select করুন
3. **Import** tab select করুন
4. **Filename** browse করে CSV file select করুন
5. **Format**: CSV
6. **Header**: Yes (if CSV has headers)
7. **OK** click করুন

---

## 📋 Method 2: JavaScript Export Script (Automated)

আমি একটা script তৈরি করেছি যা automatically সব data export করবে।

### Step 1: Export Script Run করুন

আপনার project folder এ এই command run করুন:

```bash
node database/export_supabase_data.js
```

এটা `database/exports/` folder এ সব data JSON format এ save করবে।

### Step 2: Import Script Run করুন

```bash
node database/import_to_postgresql.js
```

এটা automatically সব data PostgreSQL এ import করবে।

---

## 📋 Method 3: Direct PostgreSQL Dump (Advanced)

### Step 1: Supabase Connection String পান

1. Supabase Dashboard → **Settings** → **Database**
2. **Connection String** copy করুন (URI format)
3. Password reveal করুন এবং note করুন

### Step 2: pg_dump দিয়ে Export করুন

Windows Command Prompt এ:

```bash
# Set Supabase password
set PGPASSWORD=your_supabase_password

# Export data only (no schema)
pg_dump -h db.your-project.supabase.co -U postgres -d postgres --data-only --table=projects --table=support_requests --table=initiatives --table=learning_modules --table=events --table=standards --table=team > supabase_data.sql
```

### Step 3: Import to Local PostgreSQL

pgAdmin Query Tool এ:

```sql
-- supabase_data.sql file এর content paste করুন
-- অথবা psql command use করুন
```

Command Prompt এ:

```bash
set PGPASSWORD=Hub@2026!Secure
psql -U hub_admin -d digital_ai_hub -f supabase_data.sql
```

---

## 🔧 Data Transformation Required

Supabase থেকে আসা data তে কিছু changes করতে হবে:

### 1. User IDs (created_by field)

Supabase এ `created_by` field email হিসেবে আছে, কিন্তু local PostgreSQL এ UUID হিসেবে থাকবে।

**Fix Script:**

```sql
-- Temporary: created_by কে email হিসেবে রাখুন
-- Backend API তে পরে এটা handle করবেন

-- অথবা এখনই fix করুন:
UPDATE projects 
SET created_by = (SELECT id FROM users WHERE email = 'admin@undp.org')
WHERE created_by IS NULL OR created_by = 'admin';

UPDATE initiatives 
SET created_by = (SELECT id FROM users WHERE email = 'admin@undp.org')
WHERE created_by IS NULL OR created_by = 'admin';

-- Same for other tables
```

### 2. File URLs

Supabase Storage URLs থাকবে, সেগুলো এখনও work করবে। পরে local storage এ migrate করবেন।

### 3. Timestamps

Supabase timestamps automatically convert হবে।

---

## 📊 Verification After Import

Import করার পর এই queries run করে verify করুন:

```sql
-- Count all records
SELECT 
    'projects' as table_name, COUNT(*) as count FROM projects
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

-- Check sample data
SELECT id, title, status, created_at FROM projects LIMIT 5;
SELECT id, title, status, created_at FROM initiatives LIMIT 5;

-- Refresh materialized views
SELECT refresh_all_materialized_views();

-- Check dashboard stats
SELECT * FROM mv_dashboard_stats;
```

---

## 🎯 Recommended Approach

**আমার suggestion:**

1. ✅ **First**: Local PostgreSQL setup করুন (আগের steps)
2. ✅ **Then**: Method 2 (JavaScript script) use করুন - সবচেয়ে reliable
3. ✅ **Verify**: Data properly imported হয়েছে কিনা check করুন
4. ✅ **Backup**: Supabase project delete করবেন না, backup হিসেবে রাখুন

---

## 🚨 Important Notes

> [!WARNING]
> **User Passwords**
> - Supabase এর password hashes export করা যায় না (security)
> - সব users কে password reset করতে হবে
> - অথবা নতুন করে signup করতে হবে

> [!IMPORTANT]
> **File Storage**
> - Supabase Storage এর files আলাদাভাবে download করতে হবে
> - Files local `backend/uploads/` folder এ move করতে হবে
> - Database এ শুধু URLs আছে, actual files নেই

> [!CAUTION]
> **Backup First**
> - Data export করার আগে Supabase project backup নিন
> - Local PostgreSQL এও regular backup setup করুন

---

## 📝 Next Steps

1. Choose your preferred method (Method 2 recommended)
2. Export data from Supabase
3. Import to local PostgreSQL
4. Verify data integrity
5. Update file storage (if needed)
6. Test application with local database

---

**আমি কি Method 2 এর JavaScript scripts তৈরি করে দিব?** 

এটা সবচেয়ে automated এবং error-free হবে। আপনি শুধু একটা command run করবেন, বাকি সব automatic হবে! 🚀
