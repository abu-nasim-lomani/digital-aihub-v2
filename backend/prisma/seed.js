import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminEmail = 'admin@digitalaihub.com';
    const adminPassword = 'admin123'; // Change this in production!

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists');
    } else {
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                fullName: 'System Administrator',
                isAdmin: true,
                isActive: true,
                emailVerified: true
            }
        });

        console.log('✅ Admin user created:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
    }

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        // eslint-disable-next-line no-undef
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
