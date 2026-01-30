import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    const tenantEmail = 'admin@agence.com';
    const tenantSlug = 'agence-demo';

    // 1. Check if tenant exists
    let tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
    });

    if (!tenant) {
        console.log('Creating Tenant...');
        tenant = await prisma.tenant.create({
            data: {
                name: 'Agence Demo',
                slug: tenantSlug,
            },
        });
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email: tenantEmail },
    });

    if (!existingUser) {
        console.log('Creating Admin User...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: {
                email: tenantEmail,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                tenantId: tenant.id,
            },
        });
        console.log(`User created: ${tenantEmail} / password123`);
    } else {
        console.log('User already exists.');
    }

    // 3. Setup Basic Data (Actor)
    let client = await prisma.actor.findFirst({
        where: { tenantId: tenant.id },
    });

    if (!client) {
        console.log('Creating Client Actor...');
        client = await prisma.actor.create({
            data: {
                tenantId: tenant.id,
                firstName: 'Jean',
                lastName: 'Dupont',
                email: 'jean.dupont@example.com',
                phone: '0612345678',
                type: 'INDIVIDUAL',
                companyName: 'Dupont SARL',
            },
        });
    }

    // 4. Setup Basic Data (Opportunity)
    const opportunity = await prisma.opportunity.findFirst({
        where: { tenantId: tenant.id },
    });

    if (!opportunity) {
        console.log('Creating Opportunity...');
        await prisma.opportunity.create({
            data: {
                tenantId: tenant.id,
                name: 'Contrat Maintenance Annuel',
                amount: 12000,
                stage: 'NEGOTIATION',
                actorId: client.id,
                closeDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            },
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
