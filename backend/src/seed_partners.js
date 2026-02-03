
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Check if any partners exist
        // Check if any partners exist
        // const count = await prisma.partner.count();
        // if (count > 0) {
        //     console.log('Partners already exist. Skipping seed.');
        //     return;
        // }

        console.log('Seeding partners...');

        await prisma.partner.create({
            data: {
                name: 'Digital India Foundation',
                logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png',
                category: 'Government',
                description: 'Leading the digital revolution in governance and public services.',
                website: 'https://digitalindia.gov.in',
                email: 'contact@digitalindia.gov.in',
                partnershipType: 'MoU',
                isFeatured: true,
                status: 'published',
                focusAreas: ['E-Governance', 'Digital Literacy']
            }
        });

        await prisma.partner.create({
            data: {
                name: 'TechGiant Solutions',
                category: 'Private Sector',
                description: 'Global leader in AI and cloud computing solutions.',
                website: 'https://example.com',
                partnershipType: 'Joint Project',
                isFeatured: true,
                status: 'published',
                focusAreas: ['Cloud Infrastructure', 'AI Research']
            }
        });

        await prisma.partner.create({
            data: {
                name: 'Open Knowledge NGO',
                category: 'NGO',
                description: 'Promoting open data and digital rights for all.',
                partnershipType: 'Knowledge Exchange',
                isFeatured: false,
                status: 'published',
                focusAreas: ['Open Data', 'Digital Rights']
            }
        });

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding partners:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
