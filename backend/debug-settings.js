import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing access to AppSettings table...');

    try {
        const key = 'test_key';
        const value = true;

        // Try upsert
        console.log(`Upserting key: ${key}, value: ${value}`);
        const result = await prisma.appSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        console.log('Upsert successful:', result);

        // Try get
        console.log('Fetching key:', key);
        const fetched = await prisma.appSettings.findUnique({
            where: { key }
        });
        console.log('Fetch successful:', fetched);

        // Try getting the actual initiative_visibility key
        const realKey = 'initiative_visibility';
        const realSetting = await prisma.appSettings.findUnique({
            where: { key: realKey }
        });
        console.log(`Current setting for ${realKey}:`, realSetting);

    } catch (error) {
        console.error('ERROR accessing AppSettings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
