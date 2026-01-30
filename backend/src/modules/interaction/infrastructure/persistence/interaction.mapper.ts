import { Interaction, InteractionProps, InteractionType } from '../../domain/entities/interaction.entity';
import { Interaction as PrismaInteraction } from '@prisma/client';

export class InteractionMapper {
    static toDomain(raw: PrismaInteraction): Interaction {
        const props: InteractionProps = {
            tenantId: raw.tenantId,
            actorId: raw.actorId,
            opportunityId: raw.opportunityId,
            type: raw.type as InteractionType,
            summary: raw.summary,
            details: raw.details,
            date: raw.date,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
        return (Interaction as any).create(props, raw.id);
    }

    static toPersistence(entity: Interaction): PrismaInteraction {
        const props = entity.getProps();
        return {
            id: entity.id,
            tenantId: props.tenantId,
            actorId: props.actorId || null,
            opportunityId: props.opportunityId || null,
            type: props.type,
            summary: props.summary,
            details: props.details || null,
            date: props.date,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}
