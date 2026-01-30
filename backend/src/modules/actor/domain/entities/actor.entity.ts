import { Entity } from '../../../core/domain/entity';

export enum ActorType {
    INDIVIDUAL = 'INDIVIDUAL',
    CORPORATE = 'CORPORATE',
}

export interface ActorProps {
    tenantId: string;
    type: ActorType;
    firstName?: string | null;
    lastName?: string | null;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    source?: string | null;
    tags?: string[] | null;
    customFields?: Record<string, any> | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

export class Actor extends Entity<ActorProps> {
    private constructor(props: ActorProps, id?: string) {
        super(props, id);
    }

    static create(props: ActorProps, id?: string): Actor {
        // Invariants:
        // If INDIVIDUAL -> require lastName (or generic business rule)
        // If CORPORATE -> require companyName
        if (props.type === ActorType.CORPORATE && !props.companyName) {
            throw new Error('Corporate actors require a company name');
        }

        return new Actor(props, id);
    }

    get displayName(): string {
        if (this.props.type === ActorType.CORPORATE) {
            return this.props.companyName || 'Unknown Corp';
        }
        return [this.props.firstName, this.props.lastName].filter(Boolean).join(' ') || 'Unnamed Contact';
    }

    get tenantId(): string {
        return this.props.tenantId;
    }
}
