import { ActorType } from '../../domain/entities/actor.entity';

export class ActorResponseDto {
    id: string;
    tenantId: string;
    type: ActorType;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    source?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;

    constructor(partial: Partial<ActorResponseDto>) {
        Object.assign(this, partial);
    }
}
