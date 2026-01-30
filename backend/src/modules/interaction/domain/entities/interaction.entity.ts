import { Entity } from '../../../core/domain/entity';

export enum InteractionType {
    EMAIL = 'EMAIL',
    CALL = 'CALL',
    MEETING = 'MEETING',
    NOTE = 'NOTE',
    OTHER = 'OTHER',
}

export interface InteractionProps {
    tenantId: string;
    actorId?: string | null;
    opportunityId?: string | null;
    type: InteractionType;
    summary: string;
    details?: string | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Interaction extends Entity<InteractionProps> {
    private constructor(props: InteractionProps, id?: string) {
        super(props, id);
    }

    static create(props: InteractionProps, id?: string): Interaction {
        if (!props.summary) throw new Error('Summary is required');

        return new Interaction({
            ...props,
            date: props.date || new Date(),
        }, id);
    }
}
