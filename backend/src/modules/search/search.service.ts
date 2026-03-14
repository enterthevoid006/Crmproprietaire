import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service';
import { TenantContext } from '../../shared/infrastructure/context/tenant-context';

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) {}

    async search(q: string) {
        const tenantId = TenantContext.getTenantIdOrThrow();
        const term = q.trim();

        const [actors, opportunities, invoices, quotes] = await Promise.all([
            this.prisma.actor.findMany({
                where: {
                    tenantId,
                    OR: [
                        { firstName: { contains: term, mode: 'insensitive' } },
                        { lastName:  { contains: term, mode: 'insensitive' } },
                        { email:     { contains: term, mode: 'insensitive' } },
                        { phone:     { contains: term, mode: 'insensitive' } },
                        { companyName: { contains: term, mode: 'insensitive' } },
                    ],
                },
                select: { id: true, firstName: true, lastName: true, email: true, companyName: true },
                take: 5,
            }),

            this.prisma.opportunity.findMany({
                where: {
                    tenantId,
                    name: { contains: term, mode: 'insensitive' },
                },
                select: { id: true, name: true, stage: true, amount: true },
                take: 5,
            }),

            this.prisma.invoice.findMany({
                where: {
                    tenantId,
                    number: { contains: term, mode: 'insensitive' },
                },
                select: { id: true, number: true, status: true, total: true },
                take: 5,
            }),

            this.prisma.quote.findMany({
                where: {
                    tenantId,
                    number: { contains: term, mode: 'insensitive' },
                },
                select: { id: true, number: true, status: true, total: true },
                take: 5,
            }),
        ]);

        return { actors, opportunities, invoices, quotes };
    }
}
