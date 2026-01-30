import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const count = await prisma.opportunity.count();
        console.log(`Total Opportunities: ${count}`);

        const opps = await prisma.opportunity.findMany({
            include: { actor: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log('Recent Opportunities:');
        console.log(JSON.stringify(opps, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
