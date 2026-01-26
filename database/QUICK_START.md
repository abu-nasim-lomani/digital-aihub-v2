# 🚀 Quick Start - Supabase Data Migration

## Super Simple 3-Step Process

### Step 1: Install Dependencies
```bash
cd database
npm install
```

### Step 2: Export from Supabase
```bash
npm run export
```

এটা করবে:
- ✅ Supabase থেকে সব data download করবে
- ✅ `exports/` folder এ JSON files save করবে
- ✅ Summary report তৈরি করবে

### Step 3: Import to PostgreSQL
```bash
npm run import
```

এটা করবে:
- ✅ JSON files থেকে data read করবে
- ✅ PostgreSQL এ insert করবে
- ✅ User references fix করবে
- ✅ Materialized views refresh করবে

---

## One Command Migration

সব একসাথে করতে চাইলে:

```bash
npm run migrate
```

এটা export এবং import দুটোই করবে!

---

## ✅ Verification

Migration complete হওয়ার পর pgAdmin এ এই query run করুন:

```sql
-- Check counts
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

-- View dashboard stats
SELECT * FROM mv_dashboard_stats;
```

---

## 📁 File Structure

```
database/
├── export_supabase_data.js    # Export script
├── import_to_postgresql.js    # Import script
├── package.json               # Dependencies
├── exports/                   # Exported data (auto-created)
│   ├── projects.json
│   ├── support_requests.json
│   ├── initiatives.json
│   └── _export_summary.json
└── DATA_MIGRATION_GUIDE.md    # Detailed guide
```

---

## 🔧 Configuration

Scripts automatically use:
- **Supabase**: `.env` file এর credentials
- **PostgreSQL**: `localhost:5432/digital_ai_hub` (hub_admin user)

যদি PostgreSQL credentials different হয়, তাহলে `import_to_postgresql.js` file এ edit করুন।

---

## ⚠️ Important Notes

1. **Backup First**: Migration run করার আগে Supabase backup নিন
2. **Test Data**: প্রথমে test database এ try করুন
3. **File Storage**: Supabase Storage এর files আলাদাভাবে download করতে হবে
4. **User Passwords**: সব users কে password reset করতে হবে

---

## 🆘 Troubleshooting

**Error: "Cannot find module"**
```bash
cd database
npm install
```

**Error: "Connection refused"**
- PostgreSQL running আছে কিনা check করুন
- Credentials সঠিক আছে কিনা verify করুন

**Error: "Permission denied"**
```sql
GRANT ALL PRIVILEGES ON DATABASE digital_ai_hub TO hub_admin;
```

---

**That's it!** 🎉 Super simple data migration!
