import { Inject, Injectable } from '@nestjs/common';
import { Interaction } from '../../domain/entities/interaction.entity';
import { INTERACTION_REPOSITORY, type InteractionRepositoryPort } from '../../domain/ports/interaction.repository.port';

export interface GetInteractionsFilter {
    actorId?: string;
    opportunityId?: string;
    limit?: number;
    offset?: number;
}

@Injectable()
export class GetInteractionsUseCase {
    constructor(
        @Inject(INTERACTION_REPOSITORY) private interactionRepo: InteractionRepositoryPort,
    ) { }

    async execute(filter: GetInteractionsFilter): Promise<Interaction[]> {
        if (filter.actorId) {
            return this.interactionRepo.findByActorId(filter.actorId);
        }
        if (filter.opportunityId) {
            return this.interactionRepo.findByOpportunityId(filter.opportunityId);
        }
        return this.interactionRepo.findAll(filter.limit || 50, filter.offset || 0);
    }
}
