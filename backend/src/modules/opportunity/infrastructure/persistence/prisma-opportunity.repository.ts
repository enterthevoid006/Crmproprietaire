import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { OpportunityRepositoryPort } from '../../domain/ports/opportunity.repository.port';
import { Opportunity } from '../../domain/entities/opportunity.entity';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { OpportunityMapper } from './opportunity.mapper';

@Injectable()
export class PrismaOpportunityRepository implements OpportunityRepositoryPort {
    constructor(private prisma: PrismaService) { }

    async save(opportunity: Opportunity): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        if (opportunity.getProps().tenantId !== tenantId) {
            throw new Error('Security Violation: Attempting to save opportunity for different tenant');
        }

        const data = OpportunityMapper.toPersistence(opportunity);

        await this.prisma.opportunity.upsert({
            where: { id: opportunity.id },
            update: { ...data } as any,
            create: { ...data } as any,
        });
    }

    async findById(id: string): Promise<Opportunity | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.opportunity.findFirst({
            where: {
                id,
                tenantId
            },
        });

        if (!raw) return null;
        return OpportunityMapper.toDomain(raw);
    }

    async findAll(limit?: number, offset?: number): Promise<Opportunity[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const rawOpportunities = await this.prisma.opportunity.findMany({
            where: { tenantId },
            include: { actor: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });

        console.log(`[DEBUG] Repo.findAll found ${rawOpportunities.length} raw items for tenant ${tenantId}`);
        rawOpportunities.forEach(op => console.log(`[DEBUG] Item ${op.id} Stage: ${op.stage}, Actor: ${op.actor?.id}`));

        return rawOpportunities.map(p => OpportunityMapper.toDomain(p as any));
    }
}
