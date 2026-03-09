import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { InteractionRepositoryPort } from '../../domain/ports/interaction.repository.port';
import { Interaction } from '../../domain/entities/interaction.entity';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { InteractionMapper } from './interaction.mapper';

@Injectable()
export class PrismaInteractionRepository implements InteractionRepositoryPort {
    constructor(private prisma: PrismaService) { }

    async save(interaction: Interaction): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        if (interaction.getProps().tenantId !== tenantId) {
            throw new Error('Security Violation: Attempting to save interaction for different tenant');
        }

        const data = InteractionMapper.toPersistence(interaction);

        await this.prisma.interaction.upsert({
            where: { id: interaction.id },
            update: { ...data } as any,
            create: { ...data } as any,
        });
    }

    async findByActorId(actorId: string): Promise<Interaction[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.interaction.findMany({
            where: { actorId, tenantId },
            orderBy: { date: 'desc' },
        });

        return raw.map(i => InteractionMapper.toDomain(i as any));
    }

    async findByOpportunityId(opportunityId: string): Promise<Interaction[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.interaction.findMany({
            where: { opportunityId, tenantId },
            orderBy: { date: 'desc' },
        });

        return raw.map(i => InteractionMapper.toDomain(i as any));
    }

    async findAll(limit?: number, offset?: number): Promise<Interaction[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.interaction.findMany({
            where: { tenantId },
            take: limit,
            skip: offset,
            orderBy: { date: 'desc' },
            include: {
                actor: true, // Useful to see who we talked to
                opportunity: true
            }
        });

        return raw.map(i => InteractionMapper.toDomain(i as any));
    }

    async delete(id: string): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();
        await this.prisma.interaction.deleteMany({
            where: {
                id,
                tenantId
            }
        });
    }
}
