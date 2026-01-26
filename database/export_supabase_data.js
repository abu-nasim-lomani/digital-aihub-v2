// =====================================================
// Supabase Data Export Script
// Exports all data to JSON files for PostgreSQL import
// =====================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in .env file');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create exports directory
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

// Tables to export
const tables = [
    'projects',
    'support_requests',
    'initiatives',
    'learning_modules',
    'events',
    'standards',
    'team'
];

// Export function
async function exportTable(tableName) {
    try {
        console.log(`📥 Exporting ${tableName}...`);

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error(`❌ Error exporting ${tableName}:`, error.message);
            return null;
        }

        if (!data || data.length === 0) {
            console.log(`⚠️  No data found in ${tableName}`);
            return [];
        }

        // Save to JSON file
        const filename = path.join(exportsDir, `${tableName}.json`);
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));

        console.log(`✅ Exported ${data.length} records from ${tableName}`);
        return data;

    } catch (error) {
        console.error(`❌ Error exporting ${tableName}:`, error.message);
        return null;
    }
}

// Export all tables
async function exportAllData() {
    console.log('🚀 Starting Supabase data export...\n');

    const results = {};
    let totalRecords = 0;

    for (const table of tables) {
        const data = await exportTable(table);
        results[table] = data;
        if (data) {
            totalRecords += data.length;
        }
    }

    // Create summary
    const summary = {
        exportDate: new Date().toISOString(),
        supabaseUrl: supabaseUrl,
        totalTables: tables.length,
        totalRecords: totalRecords,
        tables: Object.keys(results).map(table => ({
            name: table,
            recordCount: results[table]?.length || 0
        }))
    };

    // Save summary
    const summaryFile = path.join(exportsDir, '_export_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('\n📊 Export Summary:');
    console.log('==================');
    console.log(`Total Tables: ${summary.totalTables}`);
    console.log(`Total Records: ${summary.totalRecords}`);
    console.log(`Export Location: ${exportsDir}`);
    console.log('\n✅ Export completed successfully!');
    console.log('\n📝 Next step: Run import_to_postgresql.js to import data');
}

// Run export
exportAllData().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
