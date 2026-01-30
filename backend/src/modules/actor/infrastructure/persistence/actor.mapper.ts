import { Actor as PrismaActor } from '@prisma/client';
import { Actor, ActorType } from '../../domain/entities/actor.entity';

export class ActorMapper {
    static toDomain(raw: PrismaActor): Actor {
        return Actor.create(
            {
                tenantId: raw.tenantId,
                type: raw.type as ActorType,
                firstName: raw.firstName,
                lastName: raw.lastName,
                companyName: raw.companyName,
                email: raw.email,
                phone: raw.phone,
                address: raw.address,
                source: raw.source,
                tags: raw.tags,
                customFields: raw.customFields as Record<string, any>,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
                deletedAt: raw.deletedAt,
            },
            raw.id,
        );
    }

    static toPersistence(actor: Actor): Omit<PrismaActor, 'id' | 'createdAt' | 'updatedAt'> & { id: string } {
        const props = actor.getProps();
        return {
            id: actor.id,
            tenantId: props.tenantId,
            type: props.type,
            firstName: props.firstName ?? null,
            lastName: props.lastName ?? null,
            companyName: props.companyName ?? null,
            email: props.email ?? null,
            phone: props.phone ?? null,
            address: props.address ?? null,
            source: props.source ?? null,
            tags: props.tags ?? [],
            customFields: (props.customFields ?? null) as any,
            deletedAt: props.deletedAt ?? null,
        };
    }
    static toResponse(actor: Actor): any {
        const props = actor.getProps();
        return {
            id: actor.id,
            tenantId: props.tenantId,
            type: props.type,
            firstName: props.firstName,
            lastName: props.lastName,
            companyName: props.companyName,
            email: props.email,
            phone: props.phone,
            address: props.address,
            source: props.source,
            tags: props.tags || [],
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}
