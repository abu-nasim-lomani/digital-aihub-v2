
import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: "postgresql://hub_admin:Hub@2026!Secure@localhost:5432/digital_ai_hub?schema=public",
});

async function listTables() {
    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("Tables in public schema:");
        res.rows.forEach(row => console.log(row.table_name));
    } catch (err) {
        console.error("Error executing query", err.stack);
    } finally {
        await client.end();
    }
}

listTables();
