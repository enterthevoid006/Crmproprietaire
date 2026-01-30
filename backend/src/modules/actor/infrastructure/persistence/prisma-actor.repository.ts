import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { ActorRepositoryPort } from '../../domain/ports/actor.repository.port';
import { Actor } from '../../domain/entities/actor.entity';
import { TenantContext } from '../../../../shared/infrastructure/context/tenant-context';
import { ActorMapper } from './actor.mapper';

@Injectable()
export class PrismaActorRepository implements ActorRepositoryPort {
    constructor(private prisma: PrismaService) { }

    async save(actor: Actor): Promise<void> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        // Security check
        if (actor.tenantId !== tenantId) {
            throw new Error('Security Violation: Attempting to save actor for different tenant');
        }

        const data = ActorMapper.toPersistence(actor);

        await this.prisma.actor.upsert({
            where: { id: actor.id },
            update: { ...data } as any,
            create: { ...data } as any,
        });
    }

    async findById(id: string): Promise<Actor | null> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const raw = await this.prisma.actor.findFirst({
            where: {
                id,
                tenantId // AUTO-FILTER
            },
        });

        if (!raw) return null;

        return ActorMapper.toDomain(raw);
    }

    async findAll(limit?: number, offset?: number): Promise<Actor[]> {
        const tenantId = TenantContext.getTenantIdOrThrow();

        const rawActors = await this.prisma.actor.findMany({
            where: { tenantId }, // AUTO-FILTER
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });

        return rawActors.map(ActorMapper.toDomain);
    }
}
