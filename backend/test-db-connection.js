
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    const url = process.env.DATABASE_URL || '';
    console.log("Connecting to:", url.replace(/:[^:]*@/, ':****@'));

    try {
        console.log("Attempting connection...");
        await client.connect();
        console.log("✅ Connection Successful!");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("❌ Connection Failed:");
        console.error(err);
        if (err.code) console.error("Code:", err.code);
    }
}

test();
