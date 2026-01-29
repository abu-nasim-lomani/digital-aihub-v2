import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const modules = [
    {
        title: 'National AI Strategy Draft v2.0',
        type: 'pdf',
        category: 'Policy Papers',
        fileSize: '2.4 MB',
        downloads: 1240,
        pages: 45,
        description: 'Comprehensive framework ensuring responsible AI deployment across government sectors.',
        status: 'published'
    },
    {
        title: 'Deep Learning Fundamentals Deck',
        type: 'ppt',
        category: 'Training Decks',
        fileSize: '15 MB',
        downloads: 850,
        pages: 20,
        description: 'Slide deck for the intro workshop covering Neural Networks and Backpropagation.',
        status: 'published'
    },
    {
        title: 'Smart City Implementation Guidelines',
        type: 'pdf',
        category: 'Guidelines',
        fileSize: '5.1 MB',
        downloads: 2100,
        pages: 80,
        description: 'Technical standards for IoT implementations in municipal areas.',
        status: 'published'
    },
    {
        title: 'GovCloud Security Protocols',
        type: 'pdf',
        category: 'Policy Papers',
        fileSize: '1.2 MB',
        downloads: 156,
        pages: 12,
        description: 'Security best practices for hosting citizen data on the national cloud.',
        status: 'published'
    },
    {
        title: 'Q1 2026 Impact Report',
        type: 'pdf',
        category: 'Reports',
        fileSize: '8.5 MB',
        downloads: 320,
        pages: 35,
        description: 'Quarterly analysis of digital transformation KPIs and milestone achievements.',
        status: 'published'
    },
    {
        title: 'Workshop: Data Analytics for Admins',
        type: 'ppt',
        category: 'Training Decks',
        fileSize: '12 MB',
        downloads: 540,
        pages: 25,
        description: 'Presentation slides from the capacity building session held last week.',
        status: 'published'
    },
    // New User Requests
    {
        title: 'Python: Basic to Advanced',
        type: 'pdf',
        category: 'Training Decks', // or similar
        fileSize: '18.5 MB',
        downloads: 2400,
        pages: 350,
        description: 'Complete roadmap and guide for mastering Python programming from scratch to advanced concepts.',
        status: 'published'
    },
    {
        title: 'AI in Industry 4.0',
        type: 'ppt',
        category: 'Training Decks',
        fileSize: '45 MB',
        downloads: 1800,
        pages: 60,
        description: 'Case studies and implementation strategies for Artificial Intelligence in manufacturing and services.',
        status: 'published'
    },
    {
        title: 'Cyber Security Essentials',
        type: 'pdf',
        category: 'Guidelines',
        fileSize: '5.2 MB',
        downloads: 3100,
        pages: 120,
        description: 'Critical security protocols, threat detection, and safe practices for digital infrastructure.',
        status: 'published'
    }
];

async function seed() {
    console.log('🌱 Seeding Learning Modules...');

    for (const mod of modules) {
        // Check if exists
        const exists = await prisma.learningModule.findFirst({
            where: { title: mod.title }
        });

        if (!exists) {
            await prisma.learningModule.create({
                data: mod
            });
            console.log(`✅ Created: ${mod.title}`);
        } else {
            console.log(`⚠️ Skipped (Exists): ${mod.title}`);
        }
    }

    console.log('✨ Seeding Completed.');
}

seed()
    .catch((e) => {
        console.error(e);
        // eslint-disable-next-line no-undef
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
