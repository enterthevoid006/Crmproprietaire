import { Entity } from '../../../core/domain/entity';

export enum OpportunityStage {
    NEW = 'NEW',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL = 'PROPOSAL',
    NEGOTIATION = 'NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
}

export interface OpportunityProps {
    tenantId: string;
    actorId: string;
    name: string;
    amount: number;
    stage: OpportunityStage;
    probability: number;
    expectedCloseDate?: Date | null;
    closeDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    actor?: {
        firstName?: string | null;
        lastName?: string | null;
        companyName?: string | null;
    };
}

export class Opportunity extends Entity<OpportunityProps> {
    private constructor(props: OpportunityProps, id?: string) {
        super(props, id);
    }

    static create(props: OpportunityProps, id?: string): Opportunity {
        if (!props.name) throw new Error('Opportunity name is required');

        return new Opportunity({
            ...props,
            amount: props.amount || 0,
            stage: props.stage || OpportunityStage.NEW,
            probability: props.probability || 0,
            expectedCloseDate: props.expectedCloseDate || null,
        }, id);
    }
}
