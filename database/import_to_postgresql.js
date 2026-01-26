// =====================================================
// PostgreSQL Data Import Script
// Imports JSON data exported from Supabase
// =====================================================

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'digital_ai_hub',
    user: 'hub_admin',
    password: 'Hub@2026!Secure'
});

// Exports directory
const exportsDir = path.join(__dirname, 'exports');

// Import order (respects foreign key constraints)
const importOrder = [
    'projects',           // No dependencies
    'support_requests',   // Depends on projects
    'initiatives',        // No dependencies
    'learning_modules',   // No dependencies
    'events',            // No dependencies
    'standards',         // No dependencies
    'team'               // No dependencies
];

// Field mapping (Supabase to PostgreSQL)
const fieldMappings = {
    projects: {
        created_by: (value) => value || null // Handle email to UUID later
    },
    support_requests: {
        created_by: (value) => value || null,
        work_updates: (value) => value ? JSON.stringify(value) : '[]'
    },
    initiatives: {
        created_by: (value) => value || null
    },
    events: {
        created_by: (value) => value || null,
        video_urls: (value) => value ? `{${value.join(',')}}` : null,
        gallery_images: (value) => value ? `{${value.join(',')}}` : null,
        documents: (value) => value ? JSON.stringify(value) : '[]'
    },
    learning_modules: {
        resources: (value) => value ? `{${value.join(',')}}` : null
    }
};

// Import table
async function importTable(tableName) {
    const filename = path.join(exportsDir, `${tableName}.json`);

    if (!fs.existsSync(filename)) {
        console.log(`⚠️  No export file found for ${tableName}`);
        return 0;
    }

    try {
        console.log(`📥 Importing ${tableName}...`);

        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

        if (!data || data.length === 0) {
            console.log(`⚠️  No data to import for ${tableName}`);
            return 0;
        }

        // Clear existing data (optional - comment out to keep seed data)
        await pool.query(`TRUNCATE TABLE ${tableName} CASCADE`);

        let imported = 0;

        for (const record of data) {
            try {
                // Apply field mappings
                const mappings = fieldMappings[tableName] || {};
                const processedRecord = { ...record };

                for (const [field, transformer] of Object.entries(mappings)) {
                    if (processedRecord[field] !== undefined) {
                        processedRecord[field] = transformer(processedRecord[field]);
                    }
                }

                // Build INSERT query
                const columns = Object.keys(processedRecord);
                const values = Object.values(processedRecord);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

                const query = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT (id) DO NOTHING
        `;

                await pool.query(query, values);
                imported++;

            } catch (error) {
                console.error(`❌ Error importing record in ${tableName}:`, error.message);
                console.error('Record:', record);
            }
        }

        console.log(`✅ Imported ${imported}/${data.length} records into ${tableName}`);
        return imported;

    } catch (error) {
        console.error(`❌ Error importing ${tableName}:`, error.message);
        return 0;
    }
}

// Fix user references
async function fixUserReferences() {
    console.log('\n🔧 Fixing user references...');

    try {
        // Create admin user if not exists
        await pool.query(`
      INSERT INTO users (email, password_hash, full_name, is_admin, is_active)
      VALUES (
        'admin@undp.org',
        crypt('Admin@2026', gen_salt('bf', 10)),
        'System Administrator',
        TRUE,
        TRUE
      )
      ON CONFLICT (email) DO NOTHING
    `);

        // Get admin user ID
        const { rows } = await pool.query(`
      SELECT id FROM users WHERE email = 'admin@undp.org'
    `);

        if (rows.length === 0) {
            console.log('⚠️  Admin user not found, skipping reference fix');
            return;
        }

        const adminId = rows[0].id;

        // Update created_by fields
        const tables = ['projects', 'initiatives', 'events'];

        for (const table of tables) {
            await pool.query(`
        UPDATE ${table}
        SET created_by = $1
        WHERE created_by IS NULL OR created_by = 'admin' OR created_by = 'admin@undp.org'
      `, [adminId]);
        }

        console.log('✅ User references fixed');

    } catch (error) {
        console.error('❌ Error fixing user references:', error.message);
    }
}

// Refresh materialized views
async function refreshViews() {
    console.log('\n🔄 Refreshing materialized views...');

    try {
        await pool.query('SELECT refresh_all_materialized_views()');
        console.log('✅ Materialized views refreshed');
    } catch (error) {
        console.error('❌ Error refreshing views:', error.message);
    }
}

// Main import function
async function importAllData() {
    console.log('🚀 Starting PostgreSQL data import...\n');

    try {
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('✅ Connected to PostgreSQL\n');

        let totalImported = 0;

        // Import tables in order
        for (const table of importOrder) {
            const count = await importTable(table);
            totalImported += count;
        }

        // Fix user references
        await fixUserReferences();

        // Refresh views
        await refreshViews();

        // Summary
        console.log('\n📊 Import Summary:');
        console.log('==================');
        console.log(`Total Records Imported: ${totalImported}`);

        // Verify counts
        console.log('\n📈 Table Counts:');
        const { rows } = await pool.query(`
      SELECT 'projects' as table_name, COUNT(*) as count FROM projects
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
      ORDER BY table_name
    `);

        rows.forEach(row => {
            console.log(`  ${row.table_name}: ${row.count}`);
        });

        console.log('\n✅ Import completed successfully!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await pool.end();
    }
}

// Run import
importAllData();
