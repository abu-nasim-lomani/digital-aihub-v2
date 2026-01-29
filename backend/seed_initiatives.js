import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const initiatives = [
    {
        title: "Smart Citizen Services",
        description: "Leveraging AI to automate and streamline public service delivery, reducing wait times and improving accessibility for all citizens. This initiative focuses on chatbot integration and predictive resource allocation.",
        type: "Infrastructure",
        impact: "Efficiency improvement by 40%",
        result: "Ongoing pilot in 3 districts",
        status: "approved",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Unified Data Exchange",
        description: "Creating a secure and interoperable framework for data sharing across government agencies. This National Data Stack will enable seamless information flow while ensuring privacy and security compliance.",
        type: "Policy & Standards",
        impact: "Data silos reduction",
        result: "Framework drafted",
        status: "approved",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Future Ready Youth",
        description: "A nationwide program to equip 1 million youth with AI and coding skills, preparing them for the 4th Industrial Revolution. Includes partnerships with top universities and tech giants.",
        type: "Education",
        impact: "1M+ Youth Trained",
        result: "Phase 1 Completed",
        status: "approved",
        imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b955?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Sustainable Tech Standards",
        description: "Developing guidelines for energy-efficient AI models and promoting the use of technology for environmental sustainability. Promoting Green AI practices in the industry.",
        type: "Research",
        impact: "Carbon footprint reduction",
        result: "Research published",
        status: "pending",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-35a909159b69?q=80&w=2070&auto=format&fit=crop"
    }
];

async function seed() {
    console.log('🌱 Seeding Initiatives...');

    for (const initiative of initiatives) {
        // Check if exists
        const exists = await prisma.initiative.findFirst({
            where: { title: initiative.title }
        });

        if (!exists) {
            await prisma.initiative.create({
                data: initiative
            });
            console.log(`✅ Created: ${initiative.title}`);
        } else {
            console.log(`⚠️ Skipped (Exists): ${initiative.title}`);
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
