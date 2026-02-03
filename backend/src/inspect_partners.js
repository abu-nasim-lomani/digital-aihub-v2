
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const partners = await prisma.partner.findMany();
        console.log('Total partners:', partners.length);
        console.log(JSON.stringify(partners, null, 2));
    } catch (error) {
        console.error('Error fetching partners:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
