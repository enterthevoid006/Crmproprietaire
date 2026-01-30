import { Opportunity, OpportunityProps, OpportunityStage } from '../../domain/entities/opportunity.entity';
import { Opportunity as PrismaOpportunity } from '@prisma/client';

export class OpportunityMapper {
    static toDomain(raw: PrismaOpportunity & { actor?: any }): Opportunity {
        const props: OpportunityProps = {
            tenantId: raw.tenantId,
            actorId: raw.actorId,
            name: raw.name,
            amount: raw.amount,
            stage: raw.stage as OpportunityStage,
            probability: raw.probability,
            expectedCloseDate: raw.expectedCloseDate,
            closeDate: raw.closeDate,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            deletedAt: (raw as any).deletedAt,
            actor: raw.actor ? {
                firstName: raw.actor.firstName,
                lastName: raw.actor.lastName,
                companyName: raw.actor.companyName
            } : undefined
        };
        return (Opportunity as any).create(props, raw.id);
    }

    static toPersistence(entity: Opportunity): PrismaOpportunity {
        const props = entity.getProps();
        return {
            id: entity.id,
            tenantId: props.tenantId,
            actorId: props.actorId,
            name: props.name,
            amount: props.amount,
            stage: props.stage,
            probability: props.probability,
            expectedCloseDate: props.expectedCloseDate || null,
            closeDate: props.closeDate || null,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        } as any;
    }
}
